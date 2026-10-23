#!/usr/bin/env bash
# Renew Let's Encrypt certificates and reload nginx so it serves them. Meant
# for cron on a box where TLS terminates on the instance (see RUNBOOK.md):
#
#   0 3 * * 1  /path/to/food-maps/deploy/scripts/renew-certs.sh >> /path/to/cert-renew.log 2>&1
#
# `certbot renew` only contacts Let's Encrypt for certificates within 30 days
# of expiry, so running it weekly is a no-op most weeks. Every run still logs
# one "not yet due" line per certificate, which is how you tell cron fired.
#
# Works unchanged on staging: the staging overlay does not touch the certbot
# or nginx services, and both stacks share the compose project name, so the
# production file alone is enough to reach them. Expect a harmless "orphan
# containers" warning there about mailpit.
#
# Pass extra certbot arguments through, e.g. `renew-certs.sh --dry-run`.

set -euo pipefail

# Resolve deploy/ from this script's own location, so cron can call it by any
# absolute path (or through a symlink) without the repo path being hardcoded.
cd "$(dirname "$(readlink -f "$0")")/.."

COMPOSE=(docker compose -f docker-compose.prod.yml)

echo "=== $(date -Is) starting renewal in $PWD"
status=0
"${COMPOSE[@]}" --profile certbot run --rm -T certbot renew "$@" || status=$?
# Reload even when certbot failed: it exits non-zero if any one certificate
# failed, and the others it did renew still need nginx to pick them up.
"${COMPOSE[@]}" exec -T nginx nginx -s reload
echo "=== $(date -Is) done (certbot exit status $status)"
exit "$status"
