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

# Check worker processes
WORKERS=$(ps aux | grep "uvicorn app:app" | grep -v grep | wc -l)
echo "⚙️  Worker Processes: $WORKERS"

echo ""

# Test API endpoint
if curl -s -f http://localhost:8000/api/listings/get > /dev/null 2>&1; then
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
