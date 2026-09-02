#!/bin/bash
# Production server startup script with auto-restart

set -e

# Run from the project root, not backend/. uvicorn resolves the module against
# the working directory, and only the root lets `backend.app` import as part of
# the backend package. See the note above the exec line.
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Add user's local bin to PATH
export PATH="/home/ec2-user/.local/bin:$PATH"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
fi

# Set production environment variables
export PYTHONUNBUFFERED=1
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

# Start server with uvicorn and auto-reload on file changes
echo "Starting Food Maps API server..."
echo "Server will auto-restart on crashes and code changes"

# Find uvicorn
UVICORN=$(which uvicorn 2>/dev/null || echo "/home/ec2-user/.local/bin/uvicorn")

# The module path must be `backend.app:app`, not `app:app`. Started from
# inside backend/ as `app:app`, Python loads this file as a top-level module
# named `app` — but backend/ai/tools.py imports `from backend.app import
# pending_confirmations, ...`, which loads the same file a second time under
# the name `backend.app`. The two module objects hold two separate
# pending_confirmations dicts, so a claim opened through the AI assistant
# cannot be confirmed over HTTP and vice versa.
#
# NOTE: we also deliberately stay on a SINGLE worker process. The
# claim-confirmation flow keeps the pending 4-digit codes in that in-process
# dict and uses an in-process Timer to auto-release stale claims. Spawning
# multiple workers would put the dict in process A while the confirm request
# gets routed to process B, breaking the claim flow ~75% of the time.
# FastAPI's async event loop comfortably handles concurrent requests on one
# worker for our current load. If/when we need horizontal scaling, move
# pending claims into the database (FoodResource already tracks status) or
# Redis BEFORE bumping the worker count.
#
# --proxy-headers makes request.client.host reflect X-Forwarded-For from the
# reverse proxy. Set FORWARDED_ALLOW_IPS to the proxy address; uvicorn
# defaults to 127.0.0.1, which is correct for an nginx on this same host.
#
# BIND_HOST stays 0.0.0.0 by default because that is what this box has always
# done, and narrowing it blind would black out the site if the instance is
# addressed directly by a load balancer rather than by a local nginx. Once
# deploy/scripts/discover-prod.sh confirms nginx runs on this host, set
# BIND_HOST=127.0.0.1 in the unit's EnvironmentFile so port 8000 stops being
# reachable from off the box.
exec "$UVICORN" backend.app:app \
    --host "${BIND_HOST:-0.0.0.0}" \
    --port 8000 \
    --workers 1 \
    --proxy-headers \
    --log-level info \
    --access-log \
    --use-colors
