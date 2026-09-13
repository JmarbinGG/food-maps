"""User preference learning (Food Maps MySQL — Supabase I/O removed)."""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


async def update_user_preferences(
    user_id: str,
    intent: str,
    entities: Dict[str, Any],
    tool_results: List[Dict[str, Any]],
) -> None:
    """No-op: digit-id prefs use AIUserPreference via accessibility_profile."""
    if not user_id:
        return
    logger.debug(
        "update_user_preferences skipped user=%s intent=%s", user_id, intent
    )


async def get_user_preferences(user_id: str) -> Dict[str, Any]:
    """Return empty prefs; digit ids should use AIUserPreference loaders."""
    return {}
