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

# Run with uvicorn - will auto-restart on crashes when run via systemd
exec "$UVICORN" app:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --log-level info \
    --access-log \
    --use-colors
