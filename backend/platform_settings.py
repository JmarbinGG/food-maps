"""Platform-wide key/value settings (listing approval gate, etc.)."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from backend.db import SessionLocal
from backend.models import PlatformSetting

SETTING_REQUIRE_LISTING_APPROVAL = "require_listing_approval"

_TRUE_VALUES = {"1", "true", "yes", "on"}


def _coerce_bool(raw: Optional[str], default: bool = False) -> bool:
    if raw is None:
        return default
    return str(raw).strip().lower() in _TRUE_VALUES


def get_platform_setting(db: Session, key: str, default: Optional[str] = None) -> Optional[str]:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    if not row:
        return default
    return row.value


def get_platform_setting_bool(db: Session, key: str, default: bool = False) -> bool:
    return _coerce_bool(get_platform_setting(db, key, None), default=default)


def set_platform_setting(db: Session, key: str, value) -> PlatformSetting:
    raw = value if isinstance(value, str) else ("true" if value else "false")
    if isinstance(value, bool):
        raw = "true" if value else "false"
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    if row:
        row.value = str(raw)
        row.updated_at = datetime.utcnow()
    else:
        row = PlatformSetting(key=key, value=str(raw))
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


def require_listing_approval(db: Optional[Session] = None) -> bool:
    """Return whether new donor/Nouri listings must wait for admin approval.

    Defaults to True (DoGoods behavior) when the setting row is missing.
    """
    owns = db is None
    session = db or SessionLocal()
    try:
        return get_platform_setting_bool(
            session, SETTING_REQUIRE_LISTING_APPROVAL, default=True
        )
    except Exception:
        return True
    finally:
        if owns:
            try:
                session.close()
            except Exception:
                pass


def ensure_platform_settings_seeded(db: Optional[Session] = None) -> None:
    """Insert default keys if absent (idempotent)."""
    owns = db is None
    session = db or SessionLocal()
    try:
        existing = (
            session.query(PlatformSetting)
            .filter(PlatformSetting.key == SETTING_REQUIRE_LISTING_APPROVAL)
            .first()
        )
        if not existing:
            session.add(
                PlatformSetting(
                    key=SETTING_REQUIRE_LISTING_APPROVAL,
                    value="true",
                )
            )
            session.commit()
    finally:
        if owns:
            try:
                session.close()
            except Exception:
                pass


def resolve_donation_create_status(*, is_admin: bool, db: Optional[Session] = None) -> str:
    """Status for a new donation listing."""
    if is_admin:
        return "available"
    return "pending" if require_listing_approval(db) else "available"
