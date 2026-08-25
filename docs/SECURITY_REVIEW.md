# Security Review

**Date:** 2026-08-11
**Reviewed commit:** `6df7612`
**Reviewer:** internal code review (AI-assisted)
**Open critical item:** [S-0](#s-0-live-database-credentials-committed-to-a-public-repository) — `foodapitest` rotated and closed to the public internet as of 2026-08-24; RDS connection-log review and the git-history scrub decision are still open

Companion to [ENGINEERING_ROADMAP.md](./ENGINEERING_ROADMAP.md). Findings and
remediation tasks live here; general process work lives there.

---

## Scope and method

Static review of application code, deployment configuration, and git history.
Specifically covered: authentication and authorization, rate limiting, CORS,
static file serving, file uploads, secrets handling, container and deploy
config, and the git history of tracked files.

**Not covered.** These need someone with console access to verify, and several
are potentially more important than anything found below:

- Live AWS configuration: IAM policies, security groups, RDS public
  accessibility, S3 bucket policies.
- Whether TLS is terminated in front of the API in production, and whether plain
  HTTP is reachable. See [S-1](#s-1-verify-tls-termination-in-production).
- Mapbox account settings, specifically URL restrictions on the public token.
- Who currently holds production server and database credentials.
- Any dependency CVEs. No scanner has ever run against this repo.

---

## What is already solid

Worth stating plainly, because the list below is long and the baseline here is
better than typical for a project this age:

- **`JWT_SECRET` fails closed.** `backend/app.py:126-134` refuses to start
  without a secret of at least 16 characters, rather than falling back to a
  literal. This is the single most commonly botched thing in a FastAPI codebase
  and it is done correctly.
- **File uploads are validated properly.** `backend/ai/routes.py:437-458` sniffs
  magic bytes and rejects any file whose contents do not match its declared
  content type, then stores it under a generated UUID filename. That defeats the
  standard "upload HTML labelled as JPEG" attack.
- **Passwords use argon2** via passlib (`backend/app.py:48`), not a hand-rolled
  hash.
- **Admin role is checked against the database** on every request
  (`verify_admin`, `backend/app.py:554-572`) rather than trusted from the token,
  so revoking admin takes effect immediately.
- **Request input is bounded**: body size caps, query string limits, JSON depth
  and key-count limits, control character rejection.
- **500 responses are sanitized** (`backend/app.py:85-90`) so internal errors do
  not leak to clients.
- **No secret-bearing *files* have been committed.** No `.env`, key, or
  certificate file appears anywhere in history. Credentials were instead
  hardcoded directly into source files, which is
  [S-0](#s-0-live-database-credentials-committed-to-a-public-repository) and is
  the most serious finding in this document.

---

## Findings

Severity reflects likelihood and impact in the current deployment, not
theoretical worst case.

| ID | Finding | Severity |
|---|---|---|
| [S-0](#s-0-live-database-credentials-committed-to-a-public-repository) | Live database credentials committed to a public repository | **Critical** |
| [S-1](#s-1-verify-tls-termination-in-production) | Verify TLS termination in production | **Verify — potentially High** |
| [S-2](#s-2-x-forwarded-for-is-trusted-unconditionally) | `X-Forwarded-For` trusted unconditionally, defeating IP rate limits | High |
| [S-3](#s-3-static-file-blocklist-fails-open-without-git) | Static-file blocklist fails open without `.git` | Medium |
| [S-4](#s-4-rate-limit-state-is-unbounded-and-per-process) | Rate-limit state is unbounded and per-process | Medium |
| [S-5](#s-5-jwt_secret-falls-back-to-a-known-literal-in-two-modules) | `JWT_SECRET` falls back to a known literal in two modules | Medium |
| [S-6](#s-6-no-dependency-or-secret-scanning) | No dependency or secret scanning | Medium |
| [S-7](#s-7-production-database-backup-and-access-are-undocumented) | Production DB backup and access undocumented | Medium |
| [S-8](#s-8-cors-allows-all-origins) | CORS allows all origins | Low–Medium |
| [S-9](#s-9-no-token-revocation-24-hour-tokens-in-localstorage) | No token revocation; 24h tokens in `localStorage` | Low (accepted) |
| [S-10](#s-10-mapbox-token-committed-verify-url-restrictions) | Mapbox token committed; verify URL restrictions | Low — verify |
| [S-11](#s-11-public-repository-and-no-branch-protection) | Public repository and no branch protection | Medium (process) |
| [S-12](#s-12-dockerignore-is-untracked-so-container-builds-can-copy-env) | `.dockerignore` is untracked, so container builds can copy `.env` | High |
| [S-13](#s-13-compiled-bytecode-is-committed-including-for-a-deliberately-excluded-script) | Compiled bytecode committed, including for a deliberately excluded script | Low |

---

### S-0. Live database credentials committed to a public repository

**Severity:** Critical
**Status:** `foodapitest` rotated and no longer publicly reachable (2026-08-24, see
[Resolution](#resolution-2026-08-24) below). `database-1` confirmed gone from
the AWS account entirely. Leaked strings are **still present in git history**
for both.
**Location:** six files, as `os.getenv` fallback defaults

Two sets of AWS RDS credentials were hardcoded as default arguments and
committed to a public repository:

| Credential | Host | First committed | Files |
|---|---|---|---|
| `admin` / `rtp6HQD8emudbf5bdw` | `foodapitest.cj8ia4gu0tvd.us-west-1.rds.amazonaws.com:3306` | 2025-11-18 (`7ed91ec`) | `backend/fix_verification_status.py`, `backend/migrate_allergen_dietary.py`, `backend/migrate_date_label_type.py` |
| `admin` / `foodmaps2024` | `database-1.c9um4qfazhpa.us-east-2.rds.amazonaws.com:3306` | 2025-12-01 (`4e3415c`) | `backend/scripts/add_dogoods_center.py`, `backend/scripts/delete_dogood_market.py`, `backend/scripts/migrate_safety_trust.py` — **instance confirmed gone, see below** |

Both are the `admin` account. Both include the full RDS hostname, so no
discovery work is required. They have been publicly readable for roughly eight
and nine months respectively.

**An earlier draft of this document stated that git history was clean.** That
conclusion came from scanning for secret-bearing *filenames* (`.env`, `*.pem`,
`*.key`) and did not check for credentials embedded in source. The correct
statement is the one above.

Deleting these lines from the working tree does not remove them from history.
Anyone with a clone, and any bot that has scraped the repository since November,
still has them. **The credentials must be treated as compromised and rotated.**
Making the repository private now would not undo this either — see
[S-11](#s-11-public-repository-and-no-branch-protection).

**Actions**
- [x] **Rotate both RDS passwords immediately.** Done for `foodapitest`
      (2026-08-24) by creating a new application user first so the running
      server never lost its connection — see
      [Rotating without an outage](#rotating-s-0-without-breaking-the-rds-connection)
      and [Resolution](#resolution-2026-08-24) below. `database-1` has no
      instance left to rotate; see below.
- [x] Check whether either RDS instance is publicly accessible. `foodapitest`
      was — treated as a live incident and closed same-day. See
      [Resolution](#resolution-2026-08-24).
- [ ] Review RDS logs for connections from unrecognized source addresses over
      the exposure window. **Not done yet** — still need to confirm whether
      `foodapitest` has CloudWatch Logs export enabled for the general/audit
      log before this is even possible to check.
- [x] Confirm whether `foodapitest` and `database-1` still exist. `foodapitest`
      is live and in use. `database-1` does **not** exist anywhere in the AWS
      account (`062315167468`) — checked `us-east-2` plus all 15 other enabled
      regions for both a live instance and a leftover snapshot under that name,
      found neither. Either it was fully deleted (instance and snapshot both
      purged) or it lived in a different AWS account than the one used for this
      remediation; either way the leaked `foodmaps2024` credential has nothing
      left in this account to authenticate against.
- [ ] Decide whether to scrub history. Rotation makes the exposed values
      worthless, which is usually enough; a rewrite invalidates every existing
      clone and is rarely worth it after the fact. **Still undecided.**
- [ ] Add secret scanning with push protection so the next one is caught before
      it lands ([S-6](#s-6-no-dependency-or-secret-scanning)).
- [x] Stop storing `DATABASE_URL` in the server's `.env`. Confirmed already
      true for `foodapitest`'s host before this rotation started — only
      `AWS_SECRET_NAME` and `AWS_REGION` were present, so there was no shadowing
      to fix, just the cutover itself.

### Resolution — 2026-08-24

`foodapitest` was rotated and closed to the public internet. Findings and
actions, in the order they were discovered:

- **The RDS instance was genuinely publicly reachable**, not just flagged as
  such: `aws rds describe-db-instances` showed `PubliclyAccessible: true`, and
  its `default` security group (`sg-02f5f428ac83d5abc`) allowed inbound TCP
  3306 from `0.0.0.0/0`. This was confirmed live — a direct TCP connection to
  the instance succeeded from a machine outside the VPC.
- **The security group that looked correctly scoped was not.** A second SG,
  `rds-ec2-1` (`sg-0bd437ce9a007ecf3`), restricted 3306 to a specific SG,
  `sg-0f6ef4189b5d500dc` — but zero EC2 instances used that SG. The actual app
  host (`i-094f928eb2af130b6`, security group `sg-0a600186699cbb59e` /
  `foodmapgroup`) was only ever reaching the database through the open
  `0.0.0.0/0` rule. Removing that rule without first authorizing the real app
  SG would have taken the app down.
- **Rotation order:** created `'foodmaps'@'%'` on `foodapitest` with grants
  scoped to `SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX` on the
  `foodapitest` schema (the live database name matches the instance
  identifier, not `food_maps` as originally assumed); updated `DATABASE_URL`
  inside the existing `prod/env` Secrets Manager secret to point at the new
  user; restarted the service; confirmed via
  `information_schema.processlist` that live connections switched from
  `admin` to `foodmaps`; confirmed `/health` and a DB-backed endpoint
  (`/api/listings/get`) both worked.
- **Closed the exposure**, in order: authorized TCP 3306 on `rds-ec2-1` from
  `sg-0a600186699cbb59e` (the real app SG), verified the app still worked,
  then revoked the `0.0.0.0/0:3306` rule on the `default` SG, verified again.
- **Rotated `admin`'s password** to an unused, unsaved random value via
  `ALTER USER`, after confirming `'admin'@'%'` was the only variant of that
  account. It was not deleted, in case a future migration needs elevated
  privileges beyond what `foodmaps` was granted — but a fresh password should
  be generated at that time rather than reusing today's throwaway value.
  Confirmed the old leaked password (`rtp6HQD8emudbf5bdw`) no longer
  authenticates.
- **`prod/env` already existed** before this rotation (created 2026-04-25,
  last changed 2026-05-20) with a full set of app secrets, and the EC2
  instance role already had `SecretsManagerReadWrite` attached — so no new
  Secrets Manager secret or IAM policy work was needed, only updating the one
  `DATABASE_URL` key.

Not done as part of this pass: CloudWatch Logs / audit-log review for
historical connections during the exposure window, the git-history scrub
decision, and secret scanning (S-6). All three remain open above.

### Rotating S-0 without breaking the RDS connection

Rotating the master password does **not** detach the RDS instance from AWS.
AWS manages the instance over IAM and the control plane; the leaked string is
only a MySQL login. What *does* break is any client still authenticating as
that user — including this app.

The app does not read SSM Parameter Store. It already reads **AWS Secrets
Manager** (`backend/aws_secrets.py`) when `AWS_SECRET_NAME` is set. SSM is the
wrong store for a database password: it has no rotation integration with RDS.
Secrets Manager does.

`DATABASE_URL` is baked into the SQLAlchemy engine at import time
(`backend/db.py`). Updating a secret or `.env` has no effect until the process
restarts. Current production almost certainly has `DATABASE_URL` in
`/home/ec2-user/project/.env`, which systemd loads via `EnvironmentFile`. That
value **wins** over Secrets Manager. Rotating the secret alone will not change
what the running server uses.

**Do not** `ALTER USER admin` first. That is the outage. Create a new user,
point the app at it, confirm it works, *then* burn the leaked admin password.

1. Confirm which instance the live `DATABASE_URL` actually points at (host
   only — do not paste the password into tickets). The leaked hosts were
   `foodapitest` (us-west-1) and `database-1` (us-east-2); production today
   may be a third instance.
2. Create a Secrets Manager secret, for example `prod/env`, in the same region
   as the instance. Either a dotenv blob with `DATABASE_URL=` and `JWT_SECRET=`
   or the RDS JSON shape (`username`, `password`, `host`, `port`, `dbname`,
   `engine`) both work. The loader turns the JSON shape into `DATABASE_URL`.
3. On that instance, as the current admin, create a **new** application user
   with a new password, and grant it only what the app needs:

   ```sql
   CREATE USER 'foodmaps'@'%' IDENTIFIED BY '<new password>';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX
     ON food_maps.* TO 'foodmaps'@'%';
   FLUSH PRIVILEGES;
   ```

   Do not keep using `admin` as the app login.
4. Put the new user's URL (or JSON fields) in the secret. Give the EC2 instance
   role `secretsmanager:GetSecretValue` on that ARN only.
5. Set `AWS_SECRET_NAME=prod/env` and `AWS_REGION=...` in the systemd unit (or
   in compose). **Remove `DATABASE_URL` from `.env`.** If it stays, the secret
   is ignored and the next rotation will look like it worked while the process
   still has the old password.
6. Restart: `sudo systemctl restart foodmaps` (or `docker compose up -d`).
   `GET /health` should be 200. Logs should show `Loaded AWS secret prod/env`
   and must not warn that `DATABASE_URL` was already set.
7. Only then burn the leaked accounts:

   ```sql
   ALTER USER 'admin'@'%' IDENTIFIED BY '<long random unused password>';
   ```

   Repeat for `'admin'@'localhost'` if it exists. If `foodapitest` or
   `database-1` is retired, delete the instance rather than rotating it.
8. Confirm the app is still healthy after step 7. It should be: it is no longer
   logging in as `admin`.

After this, a later password change is: update the secret, restart. Optional
RDS-managed rotation can write the new password into the same secret; the app
still needs a restart, because the engine is created once at import.

Local development is unchanged: leave `AWS_SECRET_NAME` unset and keep using
`.env`.

---

### S-1. Verify TLS termination in production

**Severity:** Verify — potentially High
**Status:** Unconfirmed, cannot be checked from the repo

There is no nginx, Caddy, or other reverse proxy configuration anywhere in the
repository. `guides/DEPLOYMENT_GUIDE.md` mentions nginx only as a recommended
future step for SSL, and `backend/start_server.sh` runs uvicorn directly on port
8000 with no TLS.

If the API is reachable over plain HTTP in production, then every login
password, every bearer token, and every password reset link crosses the network
in the clear, and all other findings in this document are secondary.

This is almost certainly already handled by an ALB, CloudFront, or an nginx
config that lives on the box rather than in the repo. Confirm it, then write
down where the termination happens.

**Actions**
- [ ] Confirm how TLS is terminated and record it in `docs/ARCHITECTURE.md`.
- [ ] Confirm plain HTTP either redirects to HTTPS or is not reachable.
- [ ] If a proxy config exists only on the server, bring it into the repo or
      into infrastructure-as-code so it is reviewable and reproducible.

---

### S-2. `X-Forwarded-For` is trusted unconditionally

**Severity:** High
**Location:** `backend/app.py:321-328`

```python
def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
```

The leftmost value of `X-Forwarded-For` is fully client-controlled. Any caller
can send a different value on every request and appear as a new IP each time.

Every IP-keyed control is therefore bypassable by an attacker who sets the
header. That includes signup rate limiting (`backend/app.py:364`, keyed on IP
alone), AI endpoint rate limiting (`backend/ai/ai_engine.py:217`), and the
IP half of the login and password-reset keys. Login retains partial protection
because its key also includes the email address, but signup and the AI endpoints
are effectively unlimited — which matters for the AI endpoints in particular,
since each call costs real money in model tokens.

The header should only ever be trusted when a proxy you control has appended it.

**Actions**
- [ ] Determine the actual trusted proxy topology first (depends on S-1).
- [ ] Take the client IP from the rightmost untrusted hop, or run uvicorn with
      `--proxy-headers --forwarded-allow-ips=<proxy IP>` and use
      `request.client.host`.
- [ ] If no proxy exists, ignore the header entirely.
- [ ] Add a regression test asserting that a spoofed `X-Forwarded-For` does not
      reset the signup limit.

---

### S-3. Static-file blocklist fails open without `.git`

**Severity:** Medium
**Location:** `backend/app.py:93-106` and `146-156`

The middleware that blocks serving sensitive files calls out to git:

```python
completed = subprocess.run(
    ["git", "-C", PROJECT_ROOT, "check-ignore", "-q", "--", relative_path], ...
)
return completed.returncode == 0
```

`.dockerignore` excludes `.git`. So in any container deployment there is no git
repository at `/app`, `git check-ignore` exits non-zero for every path, and the
function returns `False` for everything. The control silently disappears.

Dotfiles remain protected by the separate `part.startswith(".")` check on the
same line, so `.env` is still blocked. The exposure is gitignored paths that are
*not* dotfiles — most notably `backend/foodmaps.db` (the SQLite database, if
that backend is in use) and the `dont-publish/` directory, whose name suggests
exactly the kind of content that should never be served.

Production currently runs from a git clone under systemd, so `.git` is present
and the control works there. But it fails silently rather than loudly, it
depends on git being installed at runtime, and it shells out a subprocess per
unique path.

**Actions**
- [ ] Replace the git call with an explicit list of paths that must never be
      served, evaluated in-process.
- [ ] Better: serve static assets from an explicit allow-list of directories
      rather than from the project root, so new sensitive files are not exposed
      by default.
- [ ] Add a test asserting that `backend/foodmaps.db` returns 404.

---

### S-4. Rate-limit state is unbounded and per-process

**Severity:** Medium
**Location:** `backend/app.py:300-318`

```python
login_attempts_by_key: Dict[str, List[datetime]] = {}
```

Two problems.

**Unbounded growth.** Keys are `email:<attacker-supplied>|ip:<attacker-supplied>`.
Entries are pruned only when that exact key is looked up again, so an attacker
who never reuses a key adds an entry per request and nothing ever removes it.
That is a slow memory exhaustion path against a single-process server.

**Per-process and volatile.** The state lives in one process's memory. It resets
on every restart, and `backend/run_forever.py` restarts the process
automatically. It also cannot work with more than one worker, which is part of
why production is pinned to one — see the operability section of the roadmap.

**Actions**
- [ ] Add a periodic sweep for expired entries, or use a bounded LRU. This alone
      removes the memory exhaustion path and is a small change.
- [ ] Longer term, move the state to Redis or the database so it survives
      restarts and permits more than one worker.

---

### S-5. `JWT_SECRET` falls back to a known literal in two modules

**Severity:** Medium
**Location:** `backend/food_api.py:19`, `backend/ai/routes.py:53`

```python
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
```

Anyone reading the public repository can forge tokens for any process that ends
up running with this default.

In practice the main application fails closed first (`backend/app.py:126-134`),
so a running server always has a real secret in the environment before these
modules import. The current risk is low. It is still a live footgun: either
module could be imported by a script or run standalone, and the fallback would
apply with nothing to stop it.

Note also that `backend/food_api.py` defines a router that is never mounted in
`app.py`. It is dead code.

**Actions**
- [ ] Delete `backend/food_api.py` unless it has a purpose that is not visible
      from the code.
- [ ] In `backend/ai/routes.py`, import the validated secret from the main
      config rather than re-reading the environment with a default.
- [ ] Grep for any other `os.getenv` call with a hardcoded credential default.

---

### S-6. No dependency or secret scanning

**Severity:** Medium
**Status:** Nothing configured

No Dependabot, no `pip-audit`, no secret scanner. Dependencies are pinned in
`requirements.txt` and, as far as the repo shows, have never been audited for
known CVEs. Because the repository is public, it is being crawled by automated
scanners continuously — assume anything findable has been found.

**Actions**
- [ ] Enable Dependabot alerts and security updates (free, works on public and
      private repos, takes minutes).
- [ ] Add `pip-audit` to CI once Phase 2 of the roadmap exists.
- [ ] Add `gitleaks` or `trufflehog` as a pre-commit hook and a CI step. History
      is clean today; this keeps it that way.
- [ ] Enable GitHub secret scanning with push protection.

---

### S-7. Production database backup and access are undocumented

**Severity:** Medium

Nothing in the repository describes who holds production database credentials,
whether backups run, or whether a restore has ever been tested. The application
stores real personal data: names, email addresses, phone numbers, pickup
addresses, and SMS consent records.

The consent records deserve specific attention. `guides/SMS_CONSENT.md`
documents a TCPA-adjacent consent flow, and consent records are the evidence
that the flow was followed. Losing them is a compliance problem, not just a data
problem.

**Actions**
- [ ] Confirm automated backups exist, and confirm the retention period.
- [ ] Perform one restore test and record how long it took.
- [ ] Write `docs/DATA_HANDLING.md`: what PII is stored, who can access
      production, how access is granted and revoked, retention policy.
- [ ] Confirm RDS is not publicly accessible and that its security group admits
      only the application host.

---

### S-8. CORS allows all origins

**Severity:** Low–Medium
**Location:** `backend/app.py:76-82`

```python
allow_origins=["*"],
allow_credentials=False,
```

Less severe than it looks. Because `allow_credentials` is `False` and
authentication uses a bearer token from `localStorage` rather than cookies, a
hostile origin cannot read a victim's token or ride their session. The classic
CORS attack does not apply here.

What it does allow is any website making unauthenticated calls to your API from
a visitor's browser — using your backend as free infrastructure, and adding load
and AI token cost you pay for.

**Actions**
- [ ] Restrict `allow_origins` to the known production and development origins.
- [ ] Keep `allow_credentials=False` unless cookie auth is introduced. If it
      ever is, revisit this immediately — `"*"` plus credentials is a genuine
      account-takeover vector.

---

### S-9. No token revocation; 24-hour tokens in `localStorage`

**Severity:** Low, recommend accepting for now
**Location:** `backend/app.py:1876`

Tokens are HS256, valid for 24 hours, stored in `localStorage`, with no
server-side revocation list. Logout is client-side only, so a token that leaks
stays valid for up to a day regardless of what the user does. Because it is in
`localStorage`, any XSS on the site can read it.

This is a normal trade-off at this stage and the fix (refresh tokens plus a
revocation store) is real work. Recommend documenting it as an accepted risk
with an explicit revisit trigger rather than silently carrying it.

**Actions**
- [ ] Record as an accepted risk in `docs/ARCHITECTURE.md`.
- [ ] Revisit when any of these become true: payments ship, admin accounts
      exceed a handful, or a token is known to have leaked.
- [ ] In the meantime, treat XSS as high severity in review, since it is the
      delivery mechanism for this one.

---

### S-10. Mapbox token committed; verify URL restrictions

**Severity:** Low, but verify
**Location:** `utils/mapbox.js:4`, `admin.html:31`

The token is a public `pk.` token. Publishing these in client-side code is
normal and intended — the browser has to have it. It is only safe if URL
restrictions are configured in the Mapbox account, otherwise anyone can lift it
and bill their own map loads to you.

**Actions**
- [ ] Confirm URL restrictions are set on this token in the Mapbox dashboard.
- [ ] Confirm it is a public `pk.` token and not a secret `sk.` token.
- [ ] Set a billing alert on the Mapbox account.
- [ ] It appears in two places with two spellings across the codebase; fold into
      the configuration cleanup in the roadmap.

---

### S-11. Public repository and no branch protection

**Severity:** Medium (process)

The repository is public at `github.com/JmarbinGG/food-maps` with no branch
protection. Anyone with write access can push directly to `main` or force-push
over history.

On going private: history contains live database credentials
([S-0](#s-0-live-database-credentials-committed-to-a-public-repository)), so
going private is **not** sufficient remediation. It does not retroactively
unexpose anything — the credentials have been public for months and must be
rotated regardless of what happens to repository visibility. Rotate first, then
treat the privacy decision as forward-looking hardening.

The real trade-off is the one already identified: Actions minutes stop being
free on a private repo, which is why the ownership transfer to All Good Living
should be settled before CI work starts.

**Actions**
- [ ] Enable branch protection on `main` now, independent of the privacy
      decision. Require a PR, block force-push, block deletion.
- [ ] Decide on the transfer to the All Good Living organization.
- [ ] Audit who currently has write access, and remove anyone who does not need
      it.
- [ ] If the repo goes private, confirm no deploy process depends on
      unauthenticated cloning.

---

### S-12. `.dockerignore` is untracked, so container builds can copy `.env`

**Severity:** High
**Location:** `backend/Dockerfile:8`, `.dockerignore`

`backend/Dockerfile` builds with `COPY . .`, which copies the entire working
tree into the image. A `.dockerignore` exists that excludes `.env`, `.git`,
`.venv`, and `uploads/` — but **it is not tracked by git**:

```
$ git ls-files --error-unmatch .dockerignore
error: pathspec '.dockerignore' did not match any file(s) known to git
```

It exists on one developer's machine and nowhere else. Anyone else who clones
the repository and runs `docker build`, and any CI job that does the same, gets
no exclusions at all. `COPY . .` then copies whatever is in that working
directory, including:

- **`.env`, with real credentials**, if the build runs on a machine that has one
  — which is every developer machine and possibly the deploy host. The secret
  is then baked into an image layer, where it survives even if a later layer
  deletes the file, and it is readable by anyone who can pull the image.
- The full `.git` directory, including complete history.
- `.venv/`, which makes the image enormous.

This is the most likely path by which a real credential leaves the project, and
it is currently one `docker build` on the wrong machine away.

It also interacts with [S-3](#s-3-static-file-blocklist-fails-open-without-git)
in opposite directions: that finding assumes `.git` is *absent* from the image
and therefore the gitignore-based file blocklist fails open. Whether `.git` is
present now depends on which machine ran the build. Neither state is safe, which
is the argument for replacing both mechanisms with something explicit.

**Actions**
- [ ] **Commit `.dockerignore`.** Single highest-value action in this document
      relative to effort.
- [ ] Replace `COPY . .` with explicit `COPY` of the directories the image
      actually needs. An allow-list cannot be defeated by a missing ignore file.
- [ ] Add a comment in `.dockerignore` noting that S-3 depends on knowing
      whether `.git` is present.
- [ ] If any image has already been built and pushed to a registry from a
      machine holding a real `.env`, treat those credentials as exposed and
      rotate them.

---

### S-13. Compiled bytecode is committed, including for a deliberately excluded script

**Severity:** Low
**Location:** `backend/__pycache__/`, `backend/scripts/__pycache__/`

Thirteen `.pyc` files are tracked in git, for both Python 3.11 and 3.14. They
were committed before `__pycache__/` was added to `.gitignore`; ignore rules do
not apply to already-tracked files, so they keep getting committed and show up
as modified whenever anyone runs the app.

The notable one is `backend/scripts/__pycache__/batch_geocode.cpython-39.pyc`.
Its source, `backend/scripts/batch_geocode.py`, is explicitly listed in
`.gitignore` — someone decided that file should not be published. The compiled
bytecode was published anyway, and `.pyc` files are trivially decompiled.

The exclusion mechanism failed. The good news is that in this case nothing
sensitive was behind it: inspecting the bytecode shows the script reads
`MAPBOX_TOKEN` from the environment or `../.env` and calls the Mapbox geocoding
API, with no embedded credential. So the actual exposure is source disclosure of
a utility script, which is minor.

Worth fixing anyway, because the pattern is what matters. Deliberately excluding
a source file while committing its build artifact is the kind of gap that is
harmless right up until it is not.

**Actions**
- [ ] `git rm -r --cached backend/__pycache__ backend/scripts/__pycache__` and
      commit the removal.
- [ ] Confirm `.gitignore` covers `__pycache__/` and `*.pyc` (it does) and that
      nothing is tracked past it afterwards.
- [ ] Decide why `batch_geocode.py` is gitignored. If there is a real reason it
      cannot be public, it belongs somewhere other than an ignore rule in a
      public repository. If there is not, track it normally.
- [ ] Add a CI check rejecting tracked `.pyc` files, so this cannot recur.

---

## Prioritized task list

**Do now** — this one is not a "this week" item:

- [x] **Rotate both exposed RDS passwords** (S-0), and confirm whether either
      instance is publicly reachable. Done 2026-08-24 for `foodapitest`;
      `database-1` no longer exists. See
      [Resolution](#resolution-2026-08-24).

**Do this week** — cheap, and each closes a real gap:

- [ ] **Commit `.dockerignore`** (S-12). One file, prevents baking `.env` into
      an image. Do this before anyone else builds a container.
- [ ] Confirm TLS termination in production (S-1)
- [ ] Enable branch protection on `main` (S-11)
- [ ] Enable Dependabot and GitHub secret scanning with push protection (S-6)
- [ ] Verify Mapbox token URL restrictions and set a billing alert (S-10)
- [x] Confirm RDS is not publicly accessible (S-7). `foodapitest` was;
      closed 2026-08-24 — see [Resolution](#resolution-2026-08-24).
- [ ] Untrack the committed `.pyc` files (S-13)

**Next** — small code changes with clear security value:

- [ ] Fix `X-Forwarded-For` handling (S-2)
- [ ] Restrict CORS to known origins (S-8)
- [ ] Delete `food_api.py`, remove the `JWT_SECRET` fallback in `ai/routes.py` (S-5)
- [ ] Bound the rate-limit dictionaries (S-4)
- [ ] Replace the git-based static file blocklist (S-3)

**Then** — needs design or coordination:

- [ ] Verify and document DB backups; run a restore test (S-7)
- [ ] Write `docs/DATA_HANDLING.md` (S-7)
- [ ] Decide the repository ownership transfer (S-11)
- [ ] Move rate-limit state out of process memory (S-4)
- [ ] Record the token revocation gap as an accepted risk (S-9)

---

## Practices to adopt

Beyond the individual fixes:

- **Never let a control fail silently.** S-3 is the pattern to avoid: a security
  check that returns "allowed" when its dependency is missing. Prefer
  fail-closed, and log when a control cannot evaluate.
- **Do not trust client-supplied headers for security decisions.** S-2 is the
  instance; the rule is general.
- **Re-run this review after major features.** Payments in particular will
  change the risk profile enough to justify a fresh pass.
- **Never use a real credential as a fallback default.** S-0 happened because
  `os.getenv('DATABASE_URL', '<real production URL>')` is a convenient way to
  make a script "just work" locally. Scripts should fail loudly when
  configuration is missing, which is how they now behave.
- **Grep for values, not just filenames.** The first pass of this review missed
  S-0 entirely because it searched for secret-bearing filenames. Automated
  secret scanning (S-6) exists precisely because humans make this mistake.
