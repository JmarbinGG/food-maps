"""Unit tests for role_guards fail-closed behavior."""
from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from backend.ai.role_guards import (
    CLAIM_BLOCKED_ROLES,
    POST_BLOCKED_ROLES,
    check_role_allows_tool,
    resolve_user_community_role,
)


@pytest.mark.asyncio
async def test_recipient_blocked_from_posting():
    blocked = await check_role_allows_tool("18", "post_food_listing", role_hint="recipient")
    assert blocked is not None
    assert blocked.get("reason") == "wrong_role"
    assert blocked.get("current_role") == "recipient"


@pytest.mark.asyncio
async def test_donor_blocked_from_claiming():
    blocked = await check_role_allows_tool("18", "claim_listing", role_hint="donor")
    assert blocked is not None
    assert blocked.get("reason") == "wrong_role"


@pytest.mark.asyncio
async def test_donor_allowed_to_post():
    allowed = await check_role_allows_tool("18", "post_food_listing", role_hint="donor")
    assert allowed is None


@pytest.mark.asyncio
async def test_recipient_allowed_to_claim():
    allowed = await check_role_allows_tool("18", "claim_listing", role_hint="recipient")
    assert allowed is None


@pytest.mark.asyncio
async def test_resolve_role_returns_member_on_profile_error():
    with patch("backend.ai.tools._get_user_profile", new_callable=AsyncMock) as mock_prof:
        mock_prof.side_effect = RuntimeError("db down")
        role = await resolve_user_community_role("18")
        assert role == "member"


@pytest.mark.asyncio
async def test_execute_tool_fails_closed_when_guard_raises():
    from backend.ai import tools as tools_mod

    with patch(
        "backend.ai.role_guards.check_role_allows_tool",
        new_callable=AsyncMock,
        side_effect=RuntimeError("boom"),
    ):
        result = await tools_mod.execute_tool(
            "get_user_dashboard",
            {"user_id": "18"},
        )
    # Guard failure must not silently allow restricted tools; for any tool
    # the fail-closed path returns role_guard_unavailable.
    assert result.get("reason") == "role_guard_unavailable"
    assert result.get("ok") is False


def test_role_sets_non_empty():
    assert "recipient" in POST_BLOCKED_ROLES
    assert "donor" in CLAIM_BLOCKED_ROLES
