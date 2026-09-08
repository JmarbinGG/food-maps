"""Tests for chat profile normalization and role awareness."""
from __future__ import annotations

import pytest

from backend.ai.ai_engine import (
    ConversationEngine,
    _normalize_chat_profile,
    _role_behavior_prompt,
)
from backend.ai.conversation_flow import claiming_tool_block_reason
from backend.tools import _claim_food_listing, _create_food_listing


class TestNormalizeChatProfile:
    def test_mysql_flat_shape_maps_role(self):
        raw = {
            "id": 42,
            "name": "Donor User",
            "email": "donor@example.com",
            "role": "donor",
            "address": "123 Main St",
        }
        profile = _normalize_chat_profile(raw, "42")
        assert profile is not None
        assert profile["community_role"] == "donor"
        assert profile["role"] == "donor"
        assert profile["address"] == "123 Main St"

    def test_supabase_nested_shape(self):
        raw = {
            "user_id": "uuid-123",
            "profile": {
                "name": "Recipient",
                "community_role": "recipient",
                "is_admin": False,
                "address": "456 Oak Ave",
            },
        }
        profile = _normalize_chat_profile(raw, "uuid-123")
        assert profile is not None
        assert profile["community_role"] == "recipient"
        assert profile["address"] == "456 Oak Ave"

    def test_role_hint_when_profile_missing(self):
        profile = _normalize_chat_profile(None, "99", role_hint="donor")
        assert profile is not None
        assert profile["community_role"] == "donor"

    def test_role_hint_fills_missing_community_role(self):
        raw = {
            "user_id": "uuid-456",
            "profile": {"name": "User", "community_role": None},
        }
        profile = _normalize_chat_profile(raw, "uuid-456", role_hint="volunteer")
        assert profile is not None
        assert profile["community_role"] == "volunteer"


class TestRoleBehaviorPrompt:
    def test_organizer_has_behavior(self):
        prompt = _role_behavior_prompt("organizer", lang="en")
        assert prompt is not None
        assert "ORGANIZER" in prompt.upper()

    def test_donor_blocks_claiming(self):
        prompt = _role_behavior_prompt("donor", lang="en")
        assert prompt is not None
        assert "CLAIMING IS NOT ALLOWED" in prompt


@pytest.mark.asyncio
async def test_get_user_profile_delegates_to_tools(monkeypatch):
    engine = ConversationEngine()

    async def fake_get_user_profile(user_id: str):
        return {
            "id": 7,
            "name": "Test Donor",
            "role": "donor",
            "address": "1 Test Lane",
        }

    monkeypatch.setattr(
        "backend.ai.tools._get_user_profile",
        fake_get_user_profile,
    )
    profile = await engine.get_user_profile("7")
    assert profile is not None
    assert profile["community_role"] == "donor"


def test_insights_role_from_nested_profile():
    """Mirror routes.ai_insights role resolution for nested tool profile."""
    profile = {
        "user_id": "uuid-1",
        "profile": {
            "community_role": "donor",
            "is_admin": False,
        },
    }
    p = profile.get("profile") or profile
    raw_role = (p.get("community_role") or p.get("role") or "recipient").lower()
    assert raw_role == "donor"


class TestRoleGuardsSupabasePaths:
    @pytest.mark.asyncio
    async def test_create_food_listing_blocks_recipient(self, monkeypatch):
        async def fake_check(user_id, tool_name, **kwargs):
            return {
                "error": "recipient cannot post",
                "reason": "wrong_role",
                "current_role": "recipient",
                "required_role": "donor",
            }

        monkeypatch.setattr(
            "backend.ai.role_guards.check_role_allows_tool",
            fake_check,
        )
        result = await _create_food_listing(
            user_id="uuid-recipient",
            title="Bread",
            quantity=2,
            unit="loaves",
            category="bakery",
            image_url="https://example.com/b.jpg",
        )
        assert result.get("success") is False
        assert result.get("reason") == "wrong_role"

    @pytest.mark.asyncio
    async def test_claim_food_listing_blocks_donor(self, monkeypatch):
        async def fake_check(user_id, tool_name, **kwargs):
            return {
                "error": "donor cannot claim",
                "reason": "wrong_role",
                "current_role": "donor",
                "required_role": "recipient",
            }

        monkeypatch.setattr(
            "backend.ai.role_guards.check_role_allows_tool",
            fake_check,
        )
        result = await _claim_food_listing(
            user_id="uuid-donor",
            listing_id="listing-1",
            quantity=1,
        )
        assert result.get("success") is False
        assert result.get("reason") == "wrong_role"


class TestClaimingFlowRoleBlock:
    def test_donor_blocked_in_claiming_tool_block_reason(self):
        reason = claiming_tool_block_reason(
            "claim listing 1",
            [],
            {"listing_id": "abc", "_community_role": "donor"},
            "uuid-donor",
        )
        assert reason is not None
        assert "donor" in reason.lower()
        assert "claim_listing" in reason.lower()
