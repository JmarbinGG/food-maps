# Deployment runbook

Standing up a staging environment, verifying a release against it, and then
updating production.

Read "What the application actually does" first. Several steps below exist
because of specific constraints in the code, and skipping them produces
failures that look unrelated to their cause.

---

## What the application actually does

**FastAPI serves the frontend itself.** `backend/app.py` ends with a
`StaticFiles` mount at `/`, placed after every route so API paths match first.
There is no document root for a proxy to serve — nginx forwards everything,
including HTML, CSS and JavaScript.

**The health endpoint is `/health`.** `/api/health` exists only in
`backend/dev_app.py` and returns 404 in production. Pointing a load balancer
target group or an uptime monitor at it fails every check.

**One worker, always.** Claim confirmation codes live in
`pending_confirmations`, a plain dict in process memory, with a
`threading.Timer` for auto-release. A second worker or a second replica gets
its own copy, and any confirmation routed to the wrong one fails with "No
pending confirmation for this listing".

**Start it as `backend.app:app`, never `app:app`.** `backend/ai/tools.py`
imports `from backend.app import pending_confirmations`. Starting uvicorn from
inside `backend/` as `app:app` loads the file a second time under a different
module name, so the assistant and the HTTP API each get their own dict.
Verified directly in the container image:

```
started as backend.app  ->  pending_confirmations shared: True   modules: ['backend.app']
started as app          ->  pending_confirmations shared: False  modules: ['app', 'backend.app']
```

**Schema changes happen at startup.** `startup_event()` runs
`Base.metadata.create_all()` and then patches missing columns onto existing
tables. The app performs DDL against whatever `DATABASE_URL` points at, which
is why staging must never be aimed at the production database.

**Secrets load from AWS Secrets Manager at import time.**
`backend/aws_secrets.py` copies the secret into the environment with
`os.environ.setdefault`, so any variable already set in the environment takes
precedence over the secret. That is how the staging overrides work.

---

## Phase 0 — Record what production is

Do this before changing anything. The reverse proxy configuration currently
exists only on the production instance and is not in version control, so it
cannot be reproduced from this repository.

```bash
scp deploy/scripts/discover-prod.sh ec2-user@<prod-host>:/tmp/
ssh ec2-user@<prod-host> 'sudo bash /tmp/discover-prod.sh' | tee prod-topology.txt
```

The script is read-only and masks credentials. From its output, settle:

1. **Where TLS terminates.** If `nginx -T` shows `listen 443 ssl` with
   certificate paths, it terminates on the box. If nginx is absent or listens
   only on 80, look for an ALB or CloudFront.
2. **Which nginx config to adopt.** Reconcile the captured `nginx -T` output
   with `deploy/nginx/`, then commit the result so this stops being tribal
   knowledge.
3. **How uvicorn is started.** If the process list shows `uvicorn app:app`,
   the duplicate-module bug described above is live in production today.
4. **Which auth plugin the database user uses.** See the note under Phase 2.

---

## Phase 1 — Provision the staging instance

Match the production instance type and place it in the same VPC. Give it its
own security group: 80 and 443 as needed, 22 from your address, and **never**
8000 from anywhere but the proxy.

```bash
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user   # log out and back in
```

If the containers must read the instance role, raise the IMDS hop limit.
Container traffic to the metadata endpoint takes one extra network hop, and
the default limit of 1 silently drops it, which surfaces as an empty secret
and a startup failure on missing `JWT_SECRET`:

```bash
aws ec2 modify-instance-metadata-options \
  --instance-id <staging-instance-id> \
  --http-endpoint enabled \
  --http-put-response-hop-limit 2
```

---

## Phase 2 — Database

Restore an RDS snapshot of production into a **separate instance**. Never point
staging at the production database: the startup DDL described above would
migrate production the first time staging boots.

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier foodmaps-staging \
  --db-snapshot-identifier <snapshot-id> \
  --db-instance-class db.t3.micro \
  --no-publicly-accessible
```

**Check the auth plugin.** `requirements.txt` now pins `cryptography`, which
PyMySQL needs for MySQL 8's default `caching_sha2_password`. Without it the app
fails to connect with `'cryptography' package is required for sha256_password
or caching_sha2_password auth methods`. Production has been working because its
user predates that default; a newly created user will not.

```sql
SELECT user, host, plugin FROM mysql.user;
```

**Scrub personal data immediately after the restore, before the app points at
it.** The snapshot contains every real email address, phone number and home
address on the platform.

```bash
export DATABASE_URL='mysql+pymysql://user:pass@foodmaps-staging.<...>.rds.amazonaws.com/food_maps'
export STAGING_SCRUB_CONFIRM='foodmaps-staging.<...>.rds.amazonaws.com'
python3 deploy/scripts/scrub_staging_db.py
```

It refuses to run unless `STAGING_SCRUB_CONFIRM` repeats the host from
`DATABASE_URL`, and refuses outright on a host containing `prod`. Roles, ids
and foreign keys survive; emails become `user<id>@staging.invalid`, and every
account gets one shared password printed at the end.

---

## Phase 3 — Secrets

Create a `staging/env` secret holding the same keys as production but with
staging values, and attach an instance role scoped to that ARN only. A staging
box that can read `prod/env` is not a staging box.

At minimum: `DATABASE_URL` (the staging instance), `JWT_SECRET` (a *different*
secret, so production tokens are not valid on staging), `MAPBOX_TOKEN`, and an
`OPENAI_API_KEY` with its own spend limit.

Leave the Twilio and email keys out. `deploy/docker-compose.staging.yml`
already blanks the Twilio variables and redirects SMTP to a mailpit container,
because a restored snapshot plus working credentials means staging messages
reach real people.

---

## Phase 4 — Deploy

```bash
cd deploy
cp .env.example .env
$EDITOR .env          # domain, image tag, secret name, PUBLIC_BASE_URL
htpasswd -Bc nginx/htpasswd staging
```

Build and tag by commit so a rollback is a tag change rather than a rebuild:

```bash
docker compose -f docker-compose.prod.yml build
docker tag foodmaps-api:local foodmaps-api:$(git rev-parse --short HEAD)
```

If TLS terminates on this box, the first start has a chicken-and-egg problem:
nginx will not start without the certificate files, and certbot cannot answer
the challenge until nginx is serving. Break it with a placeholder:

```bash
DOMAIN=$(grep FOODMAPS_DOMAIN .env | cut -d= -f2)
docker volume create foodmaps_letsencrypt
docker run --rm -v foodmaps_letsencrypt:/etc/letsencrypt alpine sh -c \
  "mkdir -p /etc/letsencrypt/live/$DOMAIN && apk add --no-cache openssl >/dev/null && \
   openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
     -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
     -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj '/CN=$DOMAIN'"
```

Then start, issue the real certificate, and reload:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.staging.yml up -d
docker compose -f docker-compose.prod.yml --profile certbot run --rm certbot
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Behind a load balancer, skip all of that and set
`NGINX_CONF=./nginx/foodmaps-behind-lb.conf.template`.

---

## Phase 5 — Verify

Everything below has a specific failure it is looking for. A green `/health` on
its own proves very little.

- [ ] **Schema matches production.** Drift here invalidates every other result.

      ```bash
      python -m backend.scripts.check_schema --url "$STAGING_URL" --against "$PROD_URL"
      ```

- [ ] **Claim, then confirm from the other surface.** Start a claim in the web
      UI and confirm it through the AI assistant, then do the reverse. This is
      the duplicate-module bug, and it is the single most important check.
      With SMS disabled the confirmation code comes back in the API response.
- [ ] **Photos survive a redeploy.** Upload one, run
      `docker compose -f docker-compose.prod.yml up -d --force-recreate api`,
      and load it again. A failure means the `uploads` volume is not mounted
      and every user photo is one deploy away from deletion.
- [ ] **Password reset links point at staging.** Trigger a reset, open mailpit
      through an SSH tunnel (`ssh -L 8025:localhost:8025 <staging-host>`), and
      read the link. If it names the production host, `PUBLIC_BASE_URL` is
      wrong and production users would receive staging codes.
- [ ] **No mail escaped.** Confirm mailpit captured it and no SMTP connection
      was attempted to Gmail.
- [ ] **Repository internals are unreachable.** `/.env` and `/backend/app.py`
      must both return 404.
- [ ] **The frontend loads and the map renders**, which exercises
      `MAPBOX_TOKEN` reaching the container.
- [ ] **Log in as a scrubbed account** using the password the scrub printed.
- [ ] **Restart cleanly.** `docker compose restart` and confirm the stack
      returns healthy without manual help.

---

## Phase 6 — Production cutover

Take both backups first. They are the rollback.

```bash
aws rds create-db-snapshot --db-instance-identifier <prod-db> \
  --db-snapshot-identifier prod-precutover-$(date +%Y%m%d)
aws ec2 create-image --instance-id <prod-instance> \
  --name "foodmaps-precutover-$(date +%Y%m%d)" --no-reboot
```

Then, on production:

```bash
sudo systemctl stop foodmaps
sudo systemctl disable foodmaps     # leave installed for rollback
cd /home/ec2-user/project && git pull
cd deploy && cp .env.example .env && $EDITOR .env   # NGINX_CONF, prod/env, real domain
docker compose -f docker-compose.prod.yml up -d
curl -sS localhost/health
```

Watch for a few minutes, specifically for `pool_pre_ping` reconnect churn and
AI background loop errors:

```bash
docker compose -f docker-compose.prod.yml logs -f api
```

### Rollback

```bash
cd /home/ec2-user/project/deploy
docker compose -f docker-compose.prod.yml down
sudo systemctl enable --now foodmaps
```

The old service is untouched by any of this, so rollback does not depend on
the containers being in a good state. Note that `backend/start_server.sh` now
starts `backend.app:app`, so a rollback also keeps the module fix.

---

## Known issues to resolve after the migration

**`X-Forwarded-For` is trusted unconditionally.** `_client_ip()` in
`backend/app.py` reads the header directly, so any caller can present a new
value per request and bypass every IP-keyed rate limit, including signup and
the AI endpoints that cost money per call. This was deliberately left
unchanged: with no proxy the header must be ignored, and behind one the client
is the rightmost untrusted hop. Both need the topology from Phase 0, and
switching to `request.client.host` blind would make every user share the
proxy's address and collectively exhaust the signup limit. Fix once, with the
answer in hand, and add a regression test.

**Scaling beyond one replica needs code changes first.** In-process
`pending_confirmations` and its `threading.Timer` have to move to the database
or Redis. The AI reminder and broadcast loops in `backend/ai/routes.py` start
per process and would duplicate notifications. `uploads/` is a local volume and
needs S3 or EFS before it can be shared. Until all three are addressed, the
container stack is a reproducibility and rollback improvement, not a scaling
one.

**Startup DDL is not a migration system.** `alembic` is already a dependency
but unused. `create_all()` plus column patching cannot express a rename, a type
change or a backfill, and it races if two containers start at once.

---

## Operations reference

```bash
# Status and logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f nginx

# Deploy a new build
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Reload nginx after a config edit
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Renew certificates (cron this monthly when TLS terminates here)
docker compose -f docker-compose.prod.yml --profile certbot run --rm certbot renew
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Inspect the uploads volume
docker run --rm -v foodmaps_uploads:/u alpine ls -la /u
```

Container logs rotate through the `json-file` driver at 10 MB by 5 files, set
per service. The `logrotate` configuration in `guides/DEPLOYMENT_GUIDE.md`
applies only to the systemd path and has no effect on containers.
