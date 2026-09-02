# Food Maps - Production Deployment Guide

## Nouri AI bundle (before every deploy)

The chat FAB and `/api/ai/*` UI are served from static files under `frontend/assets/nouri/`. Rebuild after any change to `frontend/nouri/src/` or `backend/ai/assistant/`:

```bash
# Linux / EC2
./backend/scripts/build_nouri.sh

# Windows
.\backend\scripts\build_nouri.ps1
```

Or manually:

```bash
cd frontend/nouri && npm ci && npm run sync && npm run build
```

Then bump the cache-bust `?v=` tag in `frontend/index.html`, `frontend/landing.html`, and `frontend/voice-search.html` (JS + CSS), commit the built assets, and deploy.

### Deploy checklist (EC2)

```bash
cd /home/ec2-user/project
git pull
cd frontend/nouri && npm ci && npm run sync && npm run build
cd /home/ec2-user/project
python3 backend/scripts/verify_production_env.py
sudo systemctl restart foodmaps
```

### Post-deploy smoke tests

```bash
curl -s https://YOUR_DOMAIN/api/ai/health
curl -s https://YOUR_DOMAIN/api/system/status
curl -I "https://YOUR_DOMAIN/assets/nouri/nouri-ai.js?v=20260902-nouri"
```

In the browser: hard-refresh `/index.html` and `/landing.html` — Nouri FAB visible, chat responds, share/claim flows work.

---

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
- ✅ Auto-restarts on crashes (10 second delay, capped at 5 restarts per minute)
- ✅ Starts automatically on system boot
- ✅ Proper logging to system journal

Deliberately runs a **single** worker, not four. Pending claim codes live in an
in-process dictionary with a `threading.Timer`, so a second worker would hold a
separate copy and break confirmation for any request routed to it. See the
comment above the `exec` line in `backend/start_server.sh` before changing it.

The unit's `After=mysql.service` is vestigial. The database is remote (RDS), so
there is no local MySQL for systemd to wait on and the ordering has no effect.
Startup resilience comes from `pool_pre_ping` in `backend/db.py` plus
`Restart=always`.

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

### Method 4: Docker (preferred for new deployments)

Use the stack in `deploy/`, and see `deploy/RUNBOOK.md` for the full procedure:

```bash
cd /home/ec2-user/project/deploy
cp .env.example .env    # then edit
docker compose -f docker-compose.prod.yml up -d
```

Do **not** deploy the `docker-compose.yml` at the repository root. It is a
local development stack: it bind-mounts source over the image, runs uvicorn
with `--reload`, and starts a throwaway Postgres with a hardcoded password
while production runs MySQL on RDS. It also declares no restart policy, so
nothing comes back after a reboot.

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
curl http://localhost:8000/health
```

The path is `/health`. `/api/health` exists only in `backend/dev_app.py` and
returns 404 against the production app, so do not point an uptime monitor or a
load balancer target group at it.

---

## Troubleshooting

### Server won't start:
1. Check logs: `sudo journalctl -u foodmaps -n 50`
2. Verify config is reachable: either `/home/ec2-user/project/.env` exists, or
   `AWS_SECRET_NAME` and `AWS_REGION` are set and the instance role can read
   the secret. The app refuses to start without `JWT_SECRET` (minimum 16
   characters) and `DATABASE_URL`, and both usually arrive that way.
3. Check the database: the DB is remote, so test the RDS endpoint rather than a
   local server — `mysql -h <rds-endpoint> -u <user> -p`
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
