#!/usr/bin/env python3
"""
Promote a user to admin by email (sets role=ADMIN and is_admin=True).

Use this to repair accounts that switched away from admin before durable
privilege was stamped (role=donor/recipient with is_admin unset/false).
After running, the user must re-login (or refresh profile) so the JWT updates.

Usage (from repo root, with DATABASE_URL set):
  python backend/scripts/make_user_admin.py someone@example.com

Against production RDS from this machine (skip .env.local SQLite):
  $env:USE_RDS=\"1\"; python backend/scripts/make_user_admin.py someone@example.com
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, UserRole
from dotenv import load_dotenv

# Prefer project-root .env; .env.local only when not targeting RDS.
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
load_dotenv(os.path.join(_ROOT, '.env'))
_want_rds = os.getenv('USE_RDS', '').lower() in ('1', 'true', 'yes')
if not _want_rds:
    load_dotenv(os.path.join(_ROOT, '.env.local'), override=True)
load_dotenv()


def make_admin(email):
    """Update user role to admin and stamp durable is_admin privilege."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("[error] DATABASE_URL not found in environment")
        return False

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"[error] User with email '{email}' not found")
            return False

        print(f"Found user: {user.name} ({user.email})")
        print(f"Current role: {user.role}, is_admin: {user.is_admin}")

        # Must be the enum member, not the raw string 'admin'. SQLAlchemy's
        # Enum(UserRole) column doesn't validate on write, so a bare string
        # commits silently but isn't among the enum's names (DONOR, ADMIN,
        # ...) — the next read of this row then raises LookupError, which
        # surfaces as a generic 500 on login and on every admin-gated route.
        user.role = UserRole.ADMIN
        user.is_admin = True
        db.commit()

        print(f"[ok] Updated {user.name} to admin role (is_admin=True). Re-login to refresh JWT.")
        return True

    except Exception as e:
        print(f"[error] {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "aslanabdulkarim84@gmail.com"
    make_admin(email)
