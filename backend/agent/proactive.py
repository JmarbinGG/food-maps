"""Proactive suggestions — live path is backend.ai.ai_engine._check_proactive."""

import logging
from typing import List

logger = logging.getLogger(__name__)


async def get_proactive_suggestions(user_id: str, **_kwargs) -> List[str]:
    """Deprecated stub; live engine uses MySQL _check_proactive."""
    logger.debug("agent.proactive no-op for user=%s", user_id)
    return []
