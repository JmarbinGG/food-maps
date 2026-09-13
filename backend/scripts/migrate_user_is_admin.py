"""
Add users.is_admin and backfill from role=admin.

Also applied automatically on app startup via _add_missing_model_columns +
_backfill_user_is_admin. Run manually if needed:

  python backend/scripts/migrate_user_is_admin.py
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()


def migrate(database_url: str | None = None) -> None:
    database_url = database_url or os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is required")

    engine = create_engine(database_url)
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        print("users table missing — nothing to migrate")
        return

    cols = {c["name"] for c in inspector.get_columns("users")}
    with engine.begin() as conn:
        if "is_admin" not in cols:
            dialect = engine.dialect.name
            if dialect == "sqlite":
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN"))
            elif dialect == "postgresql":
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN"))
            else:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NULL"))
            print("Added users.is_admin")
        else:
            print("users.is_admin already exists")

        # Backfill: anyone currently (or previously stored as) admin role
        result = conn.execute(text(
            "UPDATE users SET is_admin = 1 "
            "WHERE LOWER(CAST(role AS CHAR)) = 'admin' "
            "AND (is_admin IS NULL OR is_admin = 0)"
        ))
        # SQLite may store enum differently — also try plain comparison
        try:
            conn.execute(text(
                "UPDATE users SET is_admin = 1 WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = 0)"
            ))
        except Exception:
            pass
        print(f"Backfill complete (rowcount={result.rowcount})")


if __name__ == "__main__":
    migrate()
    print("Done.")
