#!/usr/bin/env bash
# Record how the running production host is actually wired, so staging can be
# built to match instead of to a guess.
#
# Read-only: it inspects and prints, and changes nothing. Values that look like
# credentials are masked, but skim the output before pasting it anywhere.
#
#   scp deploy/scripts/discover-prod.sh ec2-user@<prod>:/tmp/
#   ssh ec2-user@<prod> 'sudo bash /tmp/discover-prod.sh' | tee prod-topology.txt

set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/ec2-user/project}"

section() { printf '\n\n===== %s =====\n' "$1"; }
have()    { command -v "$1" >/dev/null 2>&1; }
note()    { printf '  (%s)\n' "$1"; }

section "Host"
date -u +'utc: %Y-%m-%dT%H:%M:%SZ'
uname -srm
[ -r /etc/os-release ] && . /etc/os-release && echo "os: ${PRETTY_NAME:-unknown}"
echo "python: $(python3 -V 2>&1)"
have docker && echo "docker: $(docker --version)" || note "docker not installed"
have nginx  && echo "nginx: $(nginx -v 2>&1)"     || note "nginx binary not on PATH"

section "Service unit as actually installed"
# Not the copy in the repo. These drift, and the installed one is the truth.
if have systemctl; then
    systemctl cat foodmaps 2>&1 || note "no foodmaps unit"
    echo
    systemctl show foodmaps \
        --property=ActiveState,SubState,ExecMainPID,Restart,ExecStart 2>&1
else
    note "systemd not present"
fi

section "Running application processes"
# Confirms the real worker count and, importantly, the module path: `app:app`
# versus `backend.app:app` decides whether the AI claim flow and the HTTP
# claim flow share one pending_confirmations dict or get one each.
ps -eo pid,ppid,etime,rss,args | grep -E '[u]vicorn|[g]unicorn' || note "none found"

section "Listening sockets"
if have ss; then ss -tlnp 2>/dev/null; else netstat -tlnp 2>/dev/null; fi

section "nginx effective configuration"
# -T expands every include, so this is the whole picture in one output. This is
# the artifact worth committing to the repo.
if have nginx; then
    nginx -T 2>&1
else
    note "nginx not installed on this host; TLS likely terminates elsewhere"
fi

section "TLS certificates on disk"
for d in /etc/letsencrypt/live /etc/pki/tls/certs /etc/ssl/certs/foodmaps*; do
    [ -e "$d" ] && ls -la "$d" 2>/dev/null
done
have certbot && certbot certificates 2>&1 || note "certbot not installed"

section "Instance identity and network position"
# IMDSv2. If the token request fails, the metadata endpoint is disabled or the
# hop limit is 1 and this is running inside a container.
TOKEN=$(curl -sS -m 3 -X PUT 'http://169.254.169.254/latest/api/token' \
    -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' 2>/dev/null)
if [ -n "${TOKEN:-}" ]; then
    for f in instance-id instance-type placement/region mac public-ipv4 local-ipv4; do
        printf '%s: %s\n' "$f" \
            "$(curl -sS -m 3 -H "X-aws-ec2-metadata-token: $TOKEN" \
               "http://169.254.169.254/latest/meta-data/$f" 2>/dev/null)"
    done
    MAC=$(curl -sS -m 3 -H "X-aws-ec2-metadata-token: $TOKEN" \
          'http://169.254.169.254/latest/meta-data/mac' 2>/dev/null)
    printf 'security-groups: %s\n' \
        "$(curl -sS -m 3 -H "X-aws-ec2-metadata-token: $TOKEN" \
           "http://169.254.169.254/latest/meta-data/network/interfaces/macs/$MAC/security-group-ids" 2>/dev/null | tr '\n' ' ')"
else
    note "IMDS unreachable"
fi

section "Is a load balancer in front?"
# An instance registered in a target group means TLS almost certainly
# terminates at the ALB and nginx here is plaintext, or absent entirely.
if have aws; then
    aws elbv2 describe-target-groups \
        --query 'TargetGroups[].{name:TargetGroupName,proto:Protocol,port:Port,hc:HealthCheckPath}' \
        --output table 2>&1 | head -40
else
    note "aws cli not installed; check the ALB and CloudFront consoles by hand"
fi

section "Application configuration (keys only, values masked)"
# Never print values: .env and the Secrets Manager payload hold JWT_SECRET,
# DATABASE_URL credentials and API keys.
if [ -r "$PROJECT_DIR/.env" ]; then
    echo "$PROJECT_DIR/.env defines:"
    sed -E 's/=.*/=<redacted>/' "$PROJECT_DIR/.env" | grep -Ev '^\s*(#|$)' | sort
else
    note "no .env at $PROJECT_DIR/.env — config probably comes from Secrets Manager"
fi

section "Database endpoint (host only)"
DB_URL=$(grep -h '^DATABASE_URL=' "$PROJECT_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2-)
if [ -n "${DB_URL:-}" ]; then
    # Strip user:pass@ and print only the driver and host, so this output stays
    # safe to share in a ticket.
    echo "$DB_URL" | sed -E 's#://[^@/]*@#://<credentials>@#'
else
    note "DATABASE_URL not readable here"
fi

section "Health endpoint"
# /health is the real one. /api/health exists only in backend/dev_app.py, so a
# 404 there is expected and not a fault.
for p in /health /api/health; do
    printf '%-14s -> %s\n' "$p" \
        "$(curl -sS -o /dev/null -w '%{http_code}' -m 5 "http://localhost:8000$p" 2>&1)"
done

section "Disk and memory"
df -h / /var 2>/dev/null | sort -u
free -m 2>/dev/null

section "Recent service log"
have journalctl && journalctl -u foodmaps -n 40 --no-pager 2>&1 || note "no journal"

printf '\n\nDone. Review for anything sensitive, then commit the nginx section\nto deploy/nginx/ so the routing layer stops living only on this box.\n'
