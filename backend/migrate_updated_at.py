#!/usr/bin/env python3
"""Idempotent migration: add ``updated_at`` column to ``food_resources``.

The ORM model gained ``FoodResource.updated_at`` but existing MySQL
deployments don't have the column, so every INSERT/SELECT against the
table fails with ``Unknown column 'food_resources.updated_at'``.

Safe to re-run; checks information_schema first.
"""

import os
from sqlalchemy import create_engine, text


def migrate() -> None:
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise SystemExit("DATABASE_URL is required")
    engine = create_engine(db_url.strip('"'))
    with engine.begin() as conn:
        existing = conn.execute(
            text("SHOW COLUMNS FROM food_resources LIKE 'updated_at'")
        ).fetchall()
        if existing:
            print("updated_at already present; nothing to do")
            return
        conn.execute(
            text("ALTER TABLE food_resources ADD COLUMN updated_at DATETIME NULL")
        )
        conn.execute(
            text(
                "UPDATE food_resources SET updated_at = created_at "
                "WHERE updated_at IS NULL"
            )
        )
        print("Added food_resources.updated_at and backfilled from created_at")


if __name__ == "__main__":
    migrate()
