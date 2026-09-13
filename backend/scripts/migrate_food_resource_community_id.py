"""
Add food_resources.community_id (nullable, indexed).

Also applied automatically on app startup via _add_missing_model_columns.
Run manually if needed:

  python backend/scripts/migrate_food_resource_community_id.py
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
    if not inspector.has_table("food_resources"):
        print("food_resources table missing — nothing to migrate")
        return

    cols = {c["name"] for c in inspector.get_columns("food_resources")}
    with engine.begin() as conn:
        if "community_id" not in cols:
            dialect = engine.dialect.name
            if dialect == "sqlite":
                conn.execute(text(
                    "ALTER TABLE food_resources ADD COLUMN community_id INTEGER"
                ))
            elif dialect == "postgresql":
                conn.execute(text(
                    "ALTER TABLE food_resources ADD COLUMN community_id INTEGER"
                ))
            else:
                conn.execute(text(
                    "ALTER TABLE food_resources ADD COLUMN community_id INT NULL"
                ))
            print("Added food_resources.community_id")
        else:
            print("food_resources.community_id already exists")

        # Best-effort index (ignore if dialect/table already has it)
        try:
            conn.execute(text(
                "CREATE INDEX ix_food_resources_community_id "
                "ON food_resources (community_id)"
            ))
            print("Ensured index ix_food_resources_community_id")
        except Exception as exc:
            print(f"Index create skipped/already present: {exc}")


if __name__ == "__main__":
    migrate()
    print("Done.")
