"""
Report differences between a database schema and the SQLAlchemy models, or
between two databases.

Run:
  python -m backend.scripts.check_schema
  python -m backend.scripts.check_schema --url mysql+pymysql://user:pass@host:3306/dbname
  python -m backend.scripts.check_schema --url "$DEV_URL" --against "$PROD_URL"

With no --against, the database is compared to backend/models.py. Tables that
no model declares (the ai_* tables, for instance) are ignored in that mode.

Column types are bucketed into families before comparison so that the same
model column does not look like drift across engines: MySQL stores a Boolean
as TINYINT(1) and a DateTime as DATETIME, where Postgres uses BOOLEAN and
TIMESTAMP. Pass --strict-types to compare the engine's raw type names instead.

Exits non-zero when drift is found, so it can gate a deploy.
"""

import argparse
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy import types as sqltypes

from backend.models import Base

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")


def normalize_type(type_obj):
    """Bucket an engine-specific column type into a cross-engine family."""
    # Enums and booleans are checked by class first: an enum renders as its
    # own type name on Postgres, as ENUM(...) on MySQL, and as VARCHAR(n)
    # when stringified generically, so its text form is not comparable.
    if isinstance(type_obj, sqltypes.Enum):
        return "ENUM"
    if isinstance(type_obj, sqltypes.Boolean):
        return "BOOLEAN"

    text = str(type_obj).upper()
    length = re.search(r"\((\d+)", text)
    size = length.group(1) if length else None

    # MySQL has no boolean type; SQLAlchemy stores one as TINYINT(1).
    if text.startswith("BOOL") or getattr(type_obj, "display_width", None) == 1:
        return "BOOLEAN"
    if any(text.startswith(p) for p in ("TEXT", "LONGTEXT", "MEDIUMTEXT", "CLOB")):
        return "TEXT"
    if any(text.startswith(p) for p in ("VARCHAR", "CHAR", "STRING")):
        return f"STRING({size})" if size else "STRING"
    if any(text.startswith(p) for p in ("DATETIME", "TIMESTAMP")):
        return "DATETIME"
    if text.startswith("DATE"):
        return "DATE"
    if any(text.startswith(p) for p in ("INT", "BIGINT", "SMALLINT", "TINYINT", "MEDIUMINT")):
        return "INTEGER"
    if any(text.startswith(p) for p in ("FLOAT", "DOUBLE", "REAL", "NUMERIC", "DECIMAL")):
        return "FLOAT"
    if text.startswith("ENUM"):
        return "ENUM"
    if text.startswith("JSON"):
        return "JSON"
    return text


def read_schema(engine):
    inspector = inspect(engine)
    return {
        table: {col["name"]: col for col in inspector.get_columns(table)}
        for table in inspector.get_table_names()
    }


def compare_to_models(engine, strict_types):
    """Report what the models declare but the database does not have."""
    actual = read_schema(engine)
    drift = []
    for table in Base.metadata.sorted_tables:
        columns = actual.get(table.name)
        if columns is None:
            drift.append(f"missing table   {table.name}")
            continue
        for column in table.columns:
            found = columns.get(column.name)
            label = f"{table.name}.{column.name}"
            if found is None:
                try:
                    declared = column.type.compile(dialect=engine.dialect)
                except Exception:
                    declared = str(column.type)
                drift.append(f"missing column  {label}  (model declares {declared})")
                continue
            if strict_types:
                want, have = str(column.type), str(found["type"])
            else:
                want, have = normalize_type(column.type), normalize_type(found["type"])
            if want != have:
                drift.append(f"type differs    {label}  model={want} db={have}")
    return drift


def compare_databases(left_engine, right_engine, strict_types):
    """Report where two live databases disagree, in both directions."""
    left, right = read_schema(left_engine), read_schema(right_engine)
    drift = []

    for table in sorted(set(left) - set(right)):
        drift.append(f"table only in left   {table}")
    for table in sorted(set(right) - set(left)):
        drift.append(f"table only in right  {table}")

    for table in sorted(set(left) & set(right)):
        left_cols, right_cols = left[table], right[table]
        for name in sorted(set(left_cols) - set(right_cols)):
            drift.append(f"column only in left   {table}.{name}")
        for name in sorted(set(right_cols) - set(left_cols)):
            drift.append(f"column only in right  {table}.{name}")
        for name in sorted(set(left_cols) & set(right_cols)):
            left_type, right_type = left_cols[name]["type"], right_cols[name]["type"]
            if strict_types:
                want, have = str(left_type), str(right_type)
            else:
                want, have = normalize_type(left_type), normalize_type(right_type)
            if want != have:
                drift.append(f"type differs   {table}.{name}  left={want} right={have}")
    return drift


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", help="database to check (defaults to $DATABASE_URL)")
    parser.add_argument("--against", help="compare --url to this database instead of to the models")
    parser.add_argument("--strict-types", action="store_true", help="compare raw engine type names")
    args = parser.parse_args()

    url = (args.url or os.getenv("DATABASE_URL") or "").strip().strip('"')
    if not url:
        parser.error("no database given: pass --url or set DATABASE_URL")

    engine = create_engine(url)
    if args.against:
        other = create_engine(args.against.strip().strip('"'))
        print(f"Comparing {engine.url.render_as_string()} (left)")
        print(f"     with {other.url.render_as_string()} (right)\n")
        drift = compare_databases(engine, other, args.strict_types)
    else:
        print(f"Comparing {engine.url.render_as_string()} against backend/models.py\n")
        drift = compare_to_models(engine, args.strict_types)

    if not drift:
        print("No drift found.")
        return 0
    for line in drift:
        print(f"  {line}")
    print(f"\n{len(drift)} difference(s) found.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
