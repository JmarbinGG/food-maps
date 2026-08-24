#!/bin/bash
# Quick status check for Food Maps server

echo "=== Food Maps Server Status ==="
echo ""

# Check if service is running
if sudo systemctl is-active --quiet foodmaps; then
    echo "✅ Service Status: RUNNING"
    echo "   Uptime: $(sudo systemctl show foodmaps --property=ActiveEnterTimestamp --value | cut -d' ' -f2-)"
else
    echo "❌ Service Status: STOPPED"
fi

echo ""

# Check worker processes. Matches the module path rather than a bare
# "uvicorn", so a stray process started as `app:app` from inside backend/
# shows up as zero here instead of masquerading as a healthy server.
WORKERS=$(pgrep -fc "uvicorn backend.app:app" || echo 0)
echo "⚙️  Worker Processes: $WORKERS"

echo ""

# Test the health endpoint. It is /health — /api/health exists only in
# backend/dev_app.py and returns 404 against the production app.
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API Status: RESPONDING"
else
    echo "⚠️  API Status: NOT RESPONDING"
fi

echo ""

# Show recent logs
echo "📋 Recent Logs (last 5 lines):"
sudo journalctl -u foodmaps -n 5 --no-pager | tail -5

echo ""
echo "Commands:"
echo "  sudo systemctl status foodmaps    - Full status"
echo "  sudo systemctl restart foodmaps   - Restart server"
echo "  sudo journalctl -u foodmaps -f    - Live logs"
