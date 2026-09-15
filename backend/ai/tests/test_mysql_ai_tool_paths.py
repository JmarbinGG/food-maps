"""MySQL-first AI tool paths: search scope, claims, requests, community listings."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from backend.ai.tools import (
    _get_community_listings,
    _get_recent_listings,
    _reject_non_mysql_user,
    _search_food_near_user,
    execute_tool,
)


def _user(*, user_id=7, community_id=8, is_admin=False, role="recipient"):
    u = MagicMock()
    u.id = user_id
    u.community_id = community_id
    u.is_admin = is_admin
    u.coords_lat = 37.77
    u.coords_lng = -122.42
    u.role = MagicMock(value=role)
    return u


def _listing(*, lid, title, donor_id, community_id=8):
    r = MagicMock()
    r.id = lid
    r.title = title
    r.donor_id = donor_id
    r.qty = 2
    r.unit = "bags"
    r.address = "1 Market St"
    r.coords_lat = 37.77
    r.coords_lng = -122.42
    r.expiration_date = None
    r.pickup_window_end = None
    r.category = MagicMock(value="produce")
    r.community_id = community_id
    r.urgency_score = 0
    r.created_at = None
    r.status = "available"
    return r


def _session(*, user=None, listings=None, filters=None):
    listings = list(listings or [])
    filters = filters if filters is not None else []
    db = MagicMock()

    def _query(model):
        q = MagicMock()
        name = getattr(model, "__name__", "") or str(model)

        def _filter(*args, **_kwargs):
            filters.extend(args)
            q.filter.return_value = q
            return q

        q.filter.side_effect = _filter
        q.order_by.return_value = q
        q.limit.return_value = q
        if "User" in name:
            q.first.return_value = user
            return q
        if "FoodResource" in name:
            q.all.return_value = listings
            q.first.return_value = listings[0] if listings else None
            return q
        q.first.return_value = None
        q.all.return_value = []
        return q

    db.query.side_effect = _query
    db.close = MagicMock()
    db.commit = MagicMock()
    db.rollback = MagicMock()
    return db


def test_reject_non_mysql_user_accepts_digits():
    assert _reject_non_mysql_user("42") is None
    assert _reject_non_mysql_user(7) is None


def test_reject_non_mysql_user_rejects_uuid_and_blank():
    uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    err = _reject_non_mysql_user(uuid)
    assert err and err.get("ok") is False
    assert "numeric" in err["error"].lower()
    assert _reject_non_mysql_user("")["ok"] is False
    assert _reject_non_mysql_user(None)["ok"] is False


@pytest.mark.asyncio
async def test_search_empty_community_does_not_use_impossible_id():
    """Users with no school still browse available listings (excluding their own)."""
    user = _user(community_id=None)
    filters = []
    db = _session(user=user, listings=[], filters=filters)
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        result = await _search_food_near_user(user_id="7", max_results=10)
    assert result["listings"] == []
    assert not any("-1" in str(f) for f in filters)


@pytest.mark.asyncio
async def test_search_scoped_user_includes_null_community():
    user = _user(community_id=8)
    filters = []
    db = _session(user=user, listings=[], filters=filters)
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        await _search_food_near_user(user_id="7", max_results=10)

    def _sql(expr) -> str:
        try:
            return str(expr.compile(compile_kwargs={"literal_binds": True}))
        except Exception:
            return str(expr)

    joined = " ".join(_sql(f) for f in filters)
    assert "community_id" in joined
    assert "IS NULL" in joined.upper() or "is_(None)" in joined


@pytest.mark.asyncio
async def test_search_admin_skips_community_scope():
    user = _user(community_id=8, is_admin=True)
    filters = []
    same = _listing(lid=1, title="School apples", donor_id=9, community_id=8)
    other = _listing(lid=2, title="Other bread", donor_id=10, community_id=99)
    db = _session(user=user, listings=[same, other], filters=filters)
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=True
    ):
        result = await _search_food_near_user(user_id="7", max_results=25)
    ids = {row["id"] for row in result["listings"]}
    assert ids == {1, 2}
    assert not any("-1" in str(f) for f in filters)
    assert all("has_photo" in row for row in result["listings"])


@pytest.mark.asyncio
async def test_recent_listings_scopes_to_viewer_community():
    user = _user(community_id=8)
    filters = []
    db = _session(
        user=user,
        listings=[_listing(lid=3, title="Carrots", donor_id=9, community_id=8)],
        filters=filters,
    )
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        result = await _get_recent_listings(user_id="7", hours=72, limit=10)
    assert result["total"] == 1
    assert result["listings"][0]["id"] == 3
    assert any("community_id" in str(f) for f in filters)


@pytest.mark.asyncio
async def test_get_community_listings_rejects_non_integer_id():
    result = await _get_community_listings(
        community_id="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        user_id="7",
    )
    assert result.get("success") is False
    assert result["listings"] == []
    assert "integer" in result["error"].lower()


@pytest.mark.asyncio
async def test_get_community_listings_hides_other_school():
    user = _user(community_id=8)
    db = _session(user=user, listings=[])
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        result = await _get_community_listings(community_id="99", user_id="7")
    assert result.get("success") is True
    assert result["listings"] == []
    assert "own community" in (result.get("summary") or "").lower()


@pytest.mark.asyncio
async def test_execute_tool_claim_rejects_uuid(monkeypatch):
    monkeypatch.setattr(
        "backend.ai.role_guards.check_role_allows_tool",
        AsyncMock(return_value=None),
    )
    result = await execute_tool(
        "claim_listing",
        {
            "user_id": "7",
            "listing_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        },
    )
    assert result.get("success") is not True
    assert "integer" in str(result.get("error", "")).lower()


@pytest.mark.asyncio
async def test_execute_tool_post_food_request_rejects_non_digit(monkeypatch):
    monkeypatch.setattr(
        "backend.ai.role_guards.check_role_allows_tool",
        AsyncMock(return_value=None),
    )
    result = await execute_tool(
        "post_food_request",
        {"user_id": "not-numeric", "title": "Need rice"},
    )
    assert result.get("success") is not True
    assert "numeric" in str(result.get("error", "")).lower()


@pytest.mark.asyncio
async def test_execute_tool_search_invalid_user_returns_empty():
    result = await execute_tool(
        "search_food_near_user",
        {"user_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"},
    )
    assert result.get("listings") == []
    assert result.get("error") == "Invalid user_id"


def test_voice_user_id_requires_digits():
    from backend.ai.routes import _require_voice_user_id

    _require_voice_user_id("42")
    with pytest.raises(HTTPException) as exc:
        _require_voice_user_id("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    assert exc.value.status_code == 400


def test_parse_user_id_rejects_empty():
    from backend.ai.routes import _parse_user_id

    assert _parse_user_id(" 9 ") == "9"
    with pytest.raises(HTTPException) as exc:
        _parse_user_id("")
    assert exc.value.status_code == 400


def test_tool_schemas_do_not_require_supabase_uuid_user():
    """Live tool schemas must not tell the model user_id is a UUID."""
    from backend.ai.tools import TOOL_DEFINITIONS

    uuid_required = []
    for spec in TOOL_DEFINITIONS:
        fn = spec["function"]
        user_id = (fn.get("parameters") or {}).get("properties", {}).get("user_id")
        if not user_id:
            continue
        desc = str(user_id.get("description") or "")
        if "uuid" in desc.lower() and "integer" not in desc.lower() and "numeric" not in desc.lower():
            uuid_required.append(fn["name"])
    # After the MySQL strip these descriptions still say UUID in several
    # places; this test documents the ones that would bias the model.
    # Fail only if a required field description is *only* "User UUID".
    exact = []
    for spec in TOOL_DEFINITIONS:
        fn = spec["function"]
        user_id = (fn.get("parameters") or {}).get("properties", {}).get("user_id")
        if user_id and str(user_id.get("description") or "").strip() == "User UUID":
            exact.append(fn["name"])
    assert exact == [], f"tool schemas still label user_id as UUID-only: {exact}"


@pytest.mark.asyncio
async def test_proactive_skips_non_digit_user():
    from backend.ai.ai_engine import ConversationEngine

    engine = ConversationEngine.__new__(ConversationEngine)
    chips = await engine._check_proactive(
        "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        {"role": "recipient", "lat": 37.77, "lng": -122.42},
        "en",
    )
    assert chips == []
