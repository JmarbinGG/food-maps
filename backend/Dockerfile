FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencies first so the layer cache survives application edits.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only what the server actually needs. The build context is the repo
# root, so an unqualified `COPY . .` also pulls in guides/, dev-pages/ and
# whatever untracked files a developer happens to have sitting around.
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# uploads/ is supplied by a volume at runtime, but the directory has to exist
# and be owned by the runtime user: app.py calls os.makedirs on it at import
# time, which fails once the process is no longer root.
RUN useradd --system --create-home --uid 10001 foodmaps \
    && mkdir -p /app/uploads \
    && chown -R foodmaps:foodmaps /app

USER foodmaps

EXPOSE 8000

# /health, not /api/health — the latter only exists in backend/dev_app.py.
# python rather than curl because the slim base image has no curl.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD python3 -c "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"

# Two details here are load-bearing:
#
# `backend.app:app`, never `app:app`. backend/ai/tools.py imports
# `from backend.app import pending_confirmations, ...` at call time. Starting
# uvicorn with `app:app` loads this same file a second time under a different
# module name, giving the AI claim path its own copy of the dict — so a claim
# started in chat cannot be confirmed over HTTP, and vice versa.
#
# `--workers 1`, because pending_confirmations and its threading.Timer live in
# process memory. See the note in backend/start_server.sh before changing it.
CMD ["python3", "-m", "uvicorn", "backend.app:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--proxy-headers", \
     "--log-level", "info"]
