"""Load/save accessibility profile in user_preferences.preferences JSONB."""
from __future__ import annotations

import logging
from typing import Any, Optional

logger = logging.getLogger("ai_accessibility")

ACCESSIBILITY_PREF_KEY = "accessibility"


def merge_accessibility_profiles(
    stored: Optional[dict],
    incoming: Optional[dict],
) -> Optional[dict]:
    """Merge stored + incoming accessibility settings (incoming wins)."""
    if not stored and not incoming:
        return None
    merged: dict[str, Any] = {}
    if isinstance(stored, dict):
        merged.update(stored)
    if isinstance(incoming, dict):
        merged.update(incoming)
    return merged or None


async def load_accessibility_profile(user_id: str) -> Optional[dict]:
    if not user_id:
        return None
    uid = str(user_id).strip()
    if uid.isdigit():
        try:
            import json
            from backend.app import SessionLocal
            from backend.ai.models import AIUserPreference

            def _sync() -> Optional[dict]:
                db = SessionLocal()
                try:
                    row = (
                        db.query(AIUserPreference)
                        .filter(AIUserPreference.user_id == uid)
                        .filter(AIUserPreference.key == ACCESSIBILITY_PREF_KEY)
                        .first()
                    )
                    if not row or not row.value:
                        return None
                    parsed = json.loads(row.value)
                    return parsed if isinstance(parsed, dict) else None
                finally:
                    db.close()

            import asyncio
            return await asyncio.to_thread(_sync)
        except Exception as exc:
            logger.debug("load_accessibility_profile MySQL failed (non-fatal): %s", exc)
            return None

    try:
        from backend.agent.learning import get_user_preferences

        prefs = await get_user_preferences(user_id)
        block = prefs.get(ACCESSIBILITY_PREF_KEY)
        return block if isinstance(block, dict) else None
    except Exception as exc:
        logger.debug("load_accessibility_profile failed (non-fatal): %s", exc)
        return None


async def save_accessibility_profile(user_id: str, profile: dict) -> None:
    if not user_id or not isinstance(profile, dict) or not profile:
        return
    uid = str(user_id).strip()
    # Food Maps integer ids: persist via AIUserPreference, not Supabase.
    if uid.isdigit():
        try:
            import json
            from backend.app import SessionLocal
            from backend.ai.models import AIUserPreference

            def _sync() -> None:
                db = SessionLocal()
                try:
                    row = (
                        db.query(AIUserPreference)
                        .filter(AIUserPreference.user_id == uid)
                        .filter(AIUserPreference.key == ACCESSIBILITY_PREF_KEY)
                        .first()
                    )
                    payload = json.dumps(profile)
                    if row:
                        row.value = payload
                    else:
                        db.add(AIUserPreference(
                            user_id=uid,
                            key=ACCESSIBILITY_PREF_KEY,
                            value=payload,
                        ))
                    db.commit()
                finally:
                    db.close()

            import asyncio
            await asyncio.to_thread(_sync)
        except Exception as exc:
            logger.debug("save_accessibility_profile MySQL failed (non-fatal): %s", exc)
        return



def preferred_language_from_profile(profile: Optional[dict]) -> Optional[str]:
    if not profile or not isinstance(profile, dict):
        return None
    lang = profile.get("preferredLanguage") or profile.get("language")
    if isinstance(lang, str) and lang.strip():
        return lang.strip().lower()
    return None
