"""
Create approval_codes table and add users.community_id / users.approval_number.

Also applied automatically on app startup via create_all + _add_missing_model_columns.
Run manually if needed:

  python backend/scripts/migrate_approval_codes.py
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
    dialect = engine.dialect.name

    with engine.begin() as conn:
        if not inspector.has_table("users"):
            print("users table missing — nothing to migrate")
            return

        cols = {c["name"] for c in inspector.get_columns("users")}
        int_type = "INTEGER" if dialect == "sqlite" else "INT"
        str9 = "VARCHAR(9)"

        if "community_id" not in cols:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN community_id {int_type} NULL"))
            print("Added users.community_id")
        else:
            print("users.community_id already exists")

        if "approval_number" not in cols:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN approval_number {str9} NULL"))
            print("Added users.approval_number")
        else:
            print("users.approval_number already exists")

        if not inspector.has_table("approval_codes"):
            if dialect == "sqlite":
                conn.execute(text("""
                    CREATE TABLE approval_codes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        code VARCHAR(9) NOT NULL UNIQUE,
                        school_code VARCHAR(3) NOT NULL,
                        community_id INTEGER NOT NULL,
                        is_claimed BOOLEAN NOT NULL DEFAULT 0,
                        is_revoked BOOLEAN NOT NULL DEFAULT 0,
                        claimed_by INTEGER NULL,
                        claimed_at DATETIME NULL,
                        created_at DATETIME NULL,
                        created_by INTEGER NULL
                    )
                """))
            elif dialect == "postgresql":
                conn.execute(text("""
                    CREATE TABLE approval_codes (
                        id SERIAL PRIMARY KEY,
                        code VARCHAR(9) NOT NULL UNIQUE,
                        school_code VARCHAR(3) NOT NULL,
                        community_id INTEGER NOT NULL,
                        is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
                        is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
                        claimed_by INTEGER NULL REFERENCES users(id),
                        claimed_at TIMESTAMPTZ NULL,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        created_by INTEGER NULL REFERENCES users(id)
                    )
                """))
            else:
                conn.execute(text("""
                    CREATE TABLE approval_codes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        code VARCHAR(9) NOT NULL,
                        school_code VARCHAR(3) NOT NULL,
                        community_id INT NOT NULL,
                        is_claimed TINYINT(1) NOT NULL DEFAULT 0,
                        is_revoked TINYINT(1) NOT NULL DEFAULT 0,
                        claimed_by INT NULL,
                        claimed_at DATETIME NULL,
                        created_at DATETIME NULL,
                        created_by INT NULL,
                        UNIQUE KEY uq_approval_codes_code (code),
                        KEY idx_approval_codes_community (community_id),
                        KEY idx_approval_codes_school (school_code),
                        KEY idx_approval_codes_claimed (is_claimed)
                    )
                """))
            print("Created approval_codes table")
        else:
            print("approval_codes already exists")
            ac_cols = {c["name"] for c in inspector.get_columns("approval_codes")}
            if "is_revoked" not in ac_cols:
                if dialect == "sqlite":
                    conn.execute(text(
                        "ALTER TABLE approval_codes ADD COLUMN is_revoked BOOLEAN NOT NULL DEFAULT 0"
                    ))
                elif dialect == "postgresql":
                    conn.execute(text(
                        "ALTER TABLE approval_codes ADD COLUMN is_revoked BOOLEAN NOT NULL DEFAULT FALSE"
                    ))
                else:
                    conn.execute(text(
                        "ALTER TABLE approval_codes ADD COLUMN is_revoked TINYINT(1) NOT NULL DEFAULT 0"
                    ))
                print("Added approval_codes.is_revoked")


if __name__ == "__main__":
    migrate()
    print("Done.")
