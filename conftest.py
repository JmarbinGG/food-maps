"""Root pytest configuration: make every test run hermetic.

Runs before any backend module is imported. FOODMAPS_TESTING tells
backend.env_loader not to read .env/.env.local, so tests never see a real
OpenAI key, Twilio credentials, or the developer's local database.
"""
from __future__ import annotations

import os
import tempfile

os.environ["FOODMAPS_TESTING"] = "1"
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("MAPBOX_TOKEN", "")
os.environ.setdefault("TWILIO_ACCOUNT_SID", "")
os.environ.setdefault("TWILIO_AUTH_TOKEN", "")
os.environ.setdefault("AWS_SECRET_NAME", "")
os.environ.setdefault("ALLOW_SQLITE", "true")
# A throwaway file DB (not :memory:) so the shared engine sees one database
# across pooled connections.
os.environ.setdefault(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(tempfile.mkdtemp(prefix="foodmaps-test-"), "test.db").replace("\\", "/"),
)
os.environ.setdefault("PUBLIC_BASE_URL", "http://testserver")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-not-for-production-use")
