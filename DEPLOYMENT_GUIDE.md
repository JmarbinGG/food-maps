# Food Maps - Production Deployment Guide

## Running the Server Forever

The application includes multiple methods to ensure the server runs continuously without stopping.

### Method 1: Systemd Service (Recommended for Linux)

This is the most robust method for production deployment.

#### Setup Instructions:

1. **Make the startup script executable:**
```bash
chmod +x /home/ec2-user/project/backend/start_server.sh
```

2. **Copy the service file to systemd:**
```bash
sudo cp /home/ec2-user/project/foodmaps.service /etc/systemd/system/
sudo systemctl daemon-reload
```

3. **Start the service:**
```bash
sudo systemctl start foodmaps
```

4. **Enable auto-start on boot:**
```bash
sudo systemctl enable foodmaps
```

5. **Check status:**
```bash
sudo systemctl status foodmaps
```

6. **View logs:**
```bash
sudo journalctl -u foodmaps -f
```

#### Service Features:
- ✅ Auto-restarts on crashes (5 second delay)
- ✅ Starts automatically on system boot
- ✅ Runs 4 worker processes for better performance
- ✅ Proper logging to system journal
- ✅ Waits for database (MySQL) to be ready

#### Managing the Service:
```bash
# Stop the server
sudo systemctl stop foodmaps

# Restart the server
sudo systemctl restart foodmaps

# Disable auto-start
sudo systemctl disable foodmaps

# Re-enable after code changes
sudo systemctl daemon-reload
sudo systemctl restart foodmaps
```

---

### Method 2: Python Auto-Restart Script

Alternative method using a Python wrapper that monitors and restarts the server.

#### Usage:
```bash
cd /home/ec2-user/project/backend
chmod +x run_forever.py
python3 run_forever.py
```

#### To run in background:
```bash
nohup python3 /home/ec2-user/project/backend/run_forever.py > server.log 2>&1 &
```

#### Features:
- ✅ Auto-restarts on crashes with 5s delay
- ✅ Prevents rapid restart loops (max 5 restarts/minute)
- ✅ Logs to both file and console
- ✅ Graceful shutdown on Ctrl+C

---

### Method 3: Screen/Tmux Session

For development or quick deployment:

#### Using Screen:
```bash
# Start a new screen session
screen -S foodmaps

# Run the server
cd /home/ec2-user/project/backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Detach: Press Ctrl+A then D
# Reattach: screen -r foodmaps
```

#### Using Tmux:
```bash
# Start a new tmux session
tmux new -s foodmaps

# Run the server
cd /home/ec2-user/project/backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Detach: Press Ctrl+B then D
# Reattach: tmux attach -t foodmaps
```

---

### Method 4: Docker (Optional)

If you prefer containerization:

```bash
cd /home/ec2-user/project
docker-compose up -d
```

The docker-compose.yml is already configured with restart policies.

---

## Monitoring & Logs

### Systemd Logs:
```bash
# Real-time logs
sudo journalctl -u foodmaps -f

# Last 100 lines
sudo journalctl -u foodmaps -n 100

# Logs since boot
sudo journalctl -u foodmaps -b
```

### Python Script Logs:
```bash
tail -f /home/ec2-user/project/backend/server.log
```

---

## Health Checks

Test if the server is running:
```bash
curl http://localhost:8000/api/health
```

---

## Troubleshooting

### Server won't start:
1. Check logs: `sudo journalctl -u foodmaps -n 50`
2. Verify .env file exists: `ls -la /home/ec2-user/project/.env`
3. Check database connection: `mysql -u root -p`
4. Verify port 8000 is free: `sudo lsof -i :8000`

### Auto-restart not working:
1. Check service status: `sudo systemctl status foodmaps`
2. Verify restart policy: `systemctl show foodmaps | grep Restart`
3. Check for rapid restart limits in logs

### Permission issues:
```bash
sudo chown -R ec2-user:ec2-user /home/ec2-user/project
chmod +x /home/ec2-user/project/backend/start_server.sh
```

---

## Production Recommendations

1. **Use systemd service** for automatic restart and boot management
2. **Set up monitoring** with tools like Prometheus or CloudWatch
3. **Configure reverse proxy** (nginx) for SSL and load balancing
4. **Enable firewall** and restrict port 8000 to localhost if using nginx
5. **Set up database backups** with automated cron jobs
6. **Monitor disk space** for logs and database growth
7. **Configure log rotation** to prevent disk fill:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/foodmaps
```

Add:
```
/home/ec2-user/project/backend/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## Quick Start (Production)

```bash
# One-command production setup
cd /home/ec2-user/project
chmod +x backend/start_server.sh
sudo cp foodmaps.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable foodmaps
sudo systemctl start foodmaps

# Verify it's running
sudo systemctl status foodmaps
curl http://localhost:8000/api/health
```

Server is now running forever! 🚀
