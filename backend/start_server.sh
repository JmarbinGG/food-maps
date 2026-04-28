#!/bin/bash
# Production server startup script with auto-restart

set -e

# Navigate to backend directory
cd "$(dirname "$0")"

# Add user's local bin to PATH
export PATH="/home/ec2-user/.local/bin:$PATH"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Set production environment variables
export PYTHONUNBUFFERED=1
export PYTHONPATH="/home/ec2-user/project:$PYTHONPATH"

# Start server with uvicorn and auto-reload on file changes
echo "Starting Food Maps API server..."
echo "Server will auto-restart on crashes and code changes"

# Find uvicorn
UVICORN=$(which uvicorn 2>/dev/null || echo "/home/ec2-user/.local/bin/uvicorn")

# Run with uvicorn. NOTE: we deliberately stay on a SINGLE worker process.
# The claim-confirmation flow keeps the pending 4-digit codes in an
# in-process dict (`pending_confirmations` in backend/app.py) and uses an
# in-process Timer to auto-release stale claims. Spawning multiple workers
# would put the dict in process A while the confirm request gets routed to
# process B, breaking the claim flow ~75% of the time. FastAPI's async
# event loop comfortably handles concurrent requests on one worker for our
# current load. If/when we need horizontal scaling, move pending claims
# into the database (FoodResource already tracks status) or Redis BEFORE
# bumping the worker count.
exec "$UVICORN" app:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level info \
    --access-log \
    --use-colors
