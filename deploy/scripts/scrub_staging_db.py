#!/usr/bin/env python3
"""Strip personal data from a production snapshot restored into staging.

A restored snapshot carries every real email address, phone number and home
address in the platform. Combined with working SMTP or Twilio credentials,
routine staging testing sends real messages to real people. Run this
immediately after the restore completes and before the staging app is allowed
to point at the database.

What it keeps deliberately: user ids, roles, listing state, timestamps and
foreign keys. Staging is only useful if the shape of the data survives.

Usage:
    export DATABASE_URL='mysql+pymysql://user:pass@staging-db.../food_maps'
    export STAGING_SCRUB_CONFIRM='staging-db.abc123.us-west-1.rds.amazonaws.com'
    python3 deploy/scripts/scrub_staging_db.py

STAGING_SCRUB_CONFIRM must repeat the host from DATABASE_URL. It exists so the
command cannot be pasted at a production shell and run on reflex.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import MetaData, Table, create_engine, func, inspect, select, update
from sqlalchemy.engine import make_url

DEFAULT_STAGING_PASSWORD = "staging-only-not-a-secret"

# Substrings that are never acceptable in a staging hostname. Cheap, but it
# catches the realistic version of this mistake.
FORBIDDEN_HOST_MARKERS = ("prod", "production", "live")


def fail(message: str) -> "None":
    print(f"refusing to run: {message}", file=sys.stderr)
    raise SystemExit(1)


def resolve_engine():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        fail("DATABASE_URL is not set")

    url = make_url(database_url)
    host = (url.host or "").lower()

    if url.get_backend_name() == "sqlite":
        fail("this targets the MySQL/Postgres staging restore, not SQLite")

    for marker in FORBIDDEN_HOST_MARKERS:
        if marker in host:
            fail(f"host {host!r} contains {marker!r}")

    confirm = os.getenv("STAGING_SCRUB_CONFIRM", "").lower()
    if not confirm:
        fail("STAGING_SCRUB_CONFIRM is not set")
    if confirm != host:
        fail(
            f"STAGING_SCRUB_CONFIRM ({confirm!r}) does not match the host in "
            f"DATABASE_URL ({host!r})"
        )

    print(f"target: {url.render_as_string(hide_password=True)}")
    return create_engine(database_url, pool_pre_ping=True)


def staging_password_hash() -> str:
    """One hash reused for every account.

    Per-user hashing would mean an argon2 derivation per row, which is
    deliberately slow and would take hours on a full user table. Every staging
    account sharing one password is the point, not a shortcut.
    """
    from passlib.context import CryptContext

    password = os.getenv("STAGING_PASSWORD", DEFAULT_STAGING_PASSWORD)
    context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
    return context.hash(password)


def scrub_table(conn, meta: MetaData, inspector, table_name: str, columns: dict) -> None:
    """Apply the given column expressions, skipping anything not in this database.

    Column sets drift between environments because app.py patches columns on at
    startup rather than running migrations, so a snapshot can predate a column
    that models.py already declares. Skipping is correct here: a column that
    does not exist holds no personal data.
    """
    if not inspector.has_table(table_name):
        print(f"  {table_name}: absent, skipped")
        return

    table = Table(table_name, meta, autoload_with=conn)
    present = set(table.columns.keys())
    applicable = {name: expr for name, expr in columns.items() if name in present}

    missing = sorted(set(columns) - applicable.keys())
    if not applicable:
        print(f"  {table_name}: no target columns present, skipped")
        return

    values = {name: expr(table) for name, expr in applicable.items()}
    result = conn.execute(update(table).values(**values))

    total = conn.execute(select(func.count()).select_from(table)).scalar_one()
    note = f" (absent: {', '.join(missing)})" if missing else ""
    print(f"  {table_name}: {result.rowcount}/{total} rows scrubbed{note}")


def main() -> int:
    engine = resolve_engine()
    password_hash = staging_password_hash()

    with engine.begin() as conn:
        inspector = inspect(conn)
        meta = MetaData()

        print("\nscrubbing:")

        # Roles are preserved so existing admins stay admins and the role-gated
        # UI stays testable. Referral codes are preserved because they carry a
        # unique constraint and are not personal data.
        scrub_table(conn, meta, inspector, "users", {
            "email": lambda t: func.concat("user", t.c.id, "@staging.example"),
            "name": lambda t: func.concat("Test User ", t.c.id),
            "phone": lambda t: None,
            "address": lambda t: func.concat(t.c.id, " Test Street, Staging"),
            # Deterministic scatter rather than the real home coordinates. Keeps
            # the map populated and reproducible without RAND()/random(), which
            # spell differently on MySQL and Postgres.
            "coords_lat": lambda t: 37.7749 + (t.c.id % 80) * 0.002,
            "coords_lng": lambda t: -122.4194 + (t.c.id % 60) * 0.002,
            "password_hash": lambda t: password_hash,
            "sms_consent_ip": lambda t: None,
            "special_needs": lambda t: None,
            "notification_behavior": lambda t: None,
        })

        # Free-text conversation between real users.
        scrub_table(conn, meta, inspector, "messages", {
            "content": lambda t: "[scrubbed for staging]",
        })

        # Assistant transcripts quote user messages verbatim.
        scrub_table(conn, meta, inspector, "ai_conversations", {
            "message": lambda t: "[scrubbed for staging]",
            "meta": lambda t: None,
        })

        scrub_table(conn, meta, inspector, "ai_feedback", {
            "comment": lambda t: None,
        })

        # Drafted notifications naming real people, some still pending approval.
        scrub_table(conn, meta, inspector, "ai_broadcasts", {
            "message": lambda t: "[scrubbed for staging]",
        })

        scrub_table(conn, meta, inspector, "ai_reminders", {
            "message": lambda t: "[scrubbed for staging]",
        })

        # user_agent, screenshot and error_stack are the sharpest edge here:
        # screenshots are stored inline and routinely capture a logged-in page.
        scrub_table(conn, meta, inspector, "feedback", {
            "email": lambda t: None,
            "message": lambda t: "[scrubbed for staging]",
            "user_agent": lambda t: None,
            "screenshot": lambda t: None,
            "error_stack": lambda t: None,
            "admin_notes": lambda t: None,
        })

        # Reports name the accused and often quote an incident in detail.
        scrub_table(conn, meta, inspector, "safety_reports", {
            "description": lambda t: "[scrubbed for staging]",
            "evidence": lambda t: None,
            "resolution_notes": lambda t: None,
        })

        # Saved places are effectively a movement history per user.
        scrub_table(conn, meta, inspector, "favorite_locations", {
            "address": lambda t: func.concat(t.c.id, " Saved Place, Staging"),
            "notes": lambda t: None,
            "coords_lat": lambda t: 37.7749 + (t.c.id % 80) * 0.002,
            "coords_lng": lambda t: -122.4194 + (t.c.id % 60) * 0.002,
        })

        scrub_table(conn, meta, inspector, "newsletter_subscriptions", {
            "email": lambda t: func.concat("subscriber", t.c.id, "@staging.example"),
        })

        # Organisation contact details rather than personal ones, but staging
        # has no business being able to phone a partner site.
        scrub_table(conn, meta, inspector, "distribution_centers", {
            "phone": lambda t: None,
        })

        # Filtered in Python rather than SQL: role is a SQLEnum, and comparing
        # one against a string differs enough between MySQL and Postgres that
        # it is not worth a dialect branch for a handful of rows.
        users = Table("users", meta, autoload_with=conn)
        admin_rows = []
        if "role" in users.columns:
            for row in conn.execute(select(users.c.email, users.c.role)):
                role = getattr(row.role, "value", row.role)
                if "admin" in str(role).lower():
                    admin_rows.append(row.email)

    password = os.getenv("STAGING_PASSWORD", DEFAULT_STAGING_PASSWORD)
    print(f"\ndone. every account now signs in with: {password}")
    if admin_rows:
        print("admin accounts:")
        for email in admin_rows[:10]:
            print(f"  {email}")
    else:
        print("no admin account detected — create one with backend/make_admin.py")
    print("\nemail domain is .example, an RFC 2606 reserved TLD that has never been")
    print("delegated in the real DNS root, so a misconfigured mail path fails loudly")
    print("instead of reaching a real inbox. (.invalid has the same guarantee but is")
    print("rejected outright by this app's own login validation, so .example is used")
    print("here instead.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
