#!/usr/bin/env python3
"""Verify production .env before starting or after deploy.

Run on EC2:
  cd /home/ec2-user/project && python3 backend/scripts/verify_production_env.py
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dotenv import load_dotenv

load_dotenv(os.path.join(ROOT, ".env"), override=True)

REQUIRED = (
    "DATABASE_URL",
    "JWT_SECRET",
    "PUBLIC_BASE_URL",
    "OPENAI_API_KEY",
)
OPTIONAL = ("AI_CHAT_MODEL", "ADMIN_SECRET", "MAPBOX_TOKEN")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    for key in REQUIRED:
        val = (os.getenv(key) or "").strip()
        if not val:
            errors.append(f"Missing required env: {key}")
        elif key == "JWT_SECRET" and len(val) < 16:
            errors.append("JWT_SECRET must be at least 16 characters")
        elif key == "DATABASE_URL" and val.lower().startswith("sqlite"):
            if os.getenv("ALLOW_SQLITE", "").lower() not in {"1", "true", "yes", "on"}:
                errors.append("DATABASE_URL must be RDS MySQL, not SQLite")
        elif key == "PUBLIC_BASE_URL" and "localhost" in val.lower():
            warnings.append(f"PUBLIC_BASE_URL looks local: {val}")

    for key in OPTIONAL:
        if not (os.getenv(key) or "").strip():
            warnings.append(f"Optional env not set: {key}")

    db_url = (os.getenv("DATABASE_URL") or "").lower()
    if db_url and not db_url.startswith("sqlite"):
        try:
            from backend.db import engine
            from sqlalchemy import text

            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("OK: RDS MySQL connection")
        except Exception as exc:
            errors.append(f"RDS connection failed: {exc}")

    for w in warnings:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERROR: {e}", file=sys.stderr)

    if errors:
        print("\nFix .env on the server, then: sudo systemctl restart foodmaps", file=sys.stderr)
        return 1

    print("OK: production environment verified")
    print(f"  PUBLIC_BASE_URL={os.getenv('PUBLIC_BASE_URL')}")
    print(f"  AI_CHAT_MODEL={os.getenv('AI_CHAT_MODEL', '(default)')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
