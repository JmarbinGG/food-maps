"""Pre-push fixes: MySQL post_food_request, approval status, UUID claim, scoped search."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from backend.models import FoodCategory, UserRole


@pytest.mark.asyncio
async def test_resolve_create_listing_status_available_when_gate_off():
    from backend.tools import _resolve_create_listing_status

    assert await _resolve_create_listing_status("donation") == "available"
    assert await _resolve_create_listing_status("request") == "open"


@pytest.mark.asyncio
async def test_require_approval_helpers_off_for_food_maps():
    from backend.tools import (
        _require_claim_approval,
        _require_listing_approval,
        _require_request_approval,
    )

    assert await _require_listing_approval() is False
    assert await _require_request_approval() is False
    assert await _require_claim_approval() is False


@pytest.mark.asyncio
async def test_post_food_request_rejects_non_digit_user():
    from backend.ai.tools import _post_food_request

    result = await _post_food_request(
        user_id="not-a-uuid-but-not-digit",
        title="Need bread",
        category="bakery",
    )
    assert result.get("success") is not True
    assert "numeric" in str(result.get("error", "")).lower()


@pytest.mark.asyncio
async def test_post_food_request_mysql_insert():
    from backend.ai.tools import _post_food_request
    from backend.models import FoodRequest, User

    user = MagicMock()
    user.id = 42
    user.address = "1 Market St"
    user.coords_lat = 37.77
    user.coords_lng = -122.42
    user.role = UserRole.RECIPIENT

    created = []

    db = MagicMock()

    def _query(model):
        q = MagicMock()
        q.filter.return_value = q
        if model is User or "User" in getattr(model, "__name__", ""):
            q.first.return_value = user
        else:
            q.first.return_value = None
        return q

    def _add(obj):
        created.append(obj)
        obj.id = 501

    db.query.side_effect = _query
    db.add.side_effect = _add
    db.commit = MagicMock()
    db.refresh = MagicMock()
    db.rollback = MagicMock()
    db.close = MagicMock()

    with patch("backend.app.SessionLocal", return_value=db):
        result = await _post_food_request(
            user_id="42",
            title="Need bread",
            category="bakery",
            household_size=3,
            notes="Please",
            special_needs=["halal"],
            dietary_restrictions=["vegetarian"],
            latest_by="2026-09-20",
        )

    assert result.get("success") is True
    assert result.get("request_id") == 501
    assert result.get("status") == "open"
    assert result.get("awaiting_approval") is False
    assert len(created) == 1
    req = created[0]
    assert isinstance(req, FoodRequest)
    assert req.recipient_id == 42
    assert req.household_size == 3
    assert req.status == "open"
    assert req.category == FoodCategory.BAKERY
    assert "Need bread" in (req.notes or "")


@pytest.mark.asyncio
async def test_claim_listing_rejects_uuid():
    from backend.ai.tools import _claim_listing

    result = await _claim_listing(
        user_id="7",
        listing_id="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    )
    assert result.get("success") is not True
    assert "integer" in str(result.get("error", "")).lower()


@pytest.mark.asyncio
async def test_search_food_near_user_scopes_to_community():
    """Non-admin with community_id must only see same-community rows."""
    from backend.ai.tools import _search_food_near_user
    from backend.models import FoodResource, User

    me = MagicMock()
    me.id = 7
    me.coords_lat = 37.77
    me.coords_lng = -122.42
    me.community_id = 8
    me.is_admin = False
    me.role = MagicMock(value="recipient")

    same = MagicMock()
    same.id = 1
    same.title = "Same school apples"
    same.donor_id = 9
    same.qty = 2
    same.unit = "bags"
    same.address = "A"
    same.coords_lat = 37.77
    same.coords_lng = -122.42
    same.expiration_date = None
    same.pickup_window_end = None
    same.category = MagicMock(value="produce")
    same.community_id = 8
    same.urgency_score = 0
    same.created_at = None

    other = MagicMock()
    other.id = 2
    other.title = "Other school bread"
    other.donor_id = 10
    other.qty = 1
    other.unit = "loaf"
    other.address = "B"
    other.coords_lat = 37.78
    other.coords_lng = -122.43
    other.expiration_date = None
    other.pickup_window_end = None
    other.category = MagicMock(value="bakery")
    other.community_id = 99
    other.urgency_score = 0
    other.created_at = None

    # Capture filter kwargs applied to FoodResource query.
    community_filters = []

    db = MagicMock()

    def _query(model):
        q = MagicMock()
        name = getattr(model, "__name__", "") or str(model)

        def _filter(*args, **kwargs):
            for a in args:
                community_filters.append(a)
            q.filter.return_value = q
            return q

        q.filter.side_effect = _filter
        q.order_by.return_value = q
        q.limit.return_value = q

        if model is User or "User" in name:
            q.first.return_value = me
            return q
        if model is FoodResource or "FoodResource" in name:
            # Simulate DB applying community filter: only return same-community.
            q.all.return_value = [same]
            return q
        q.first.return_value = None
        q.all.return_value = []
        return q

    db.query.side_effect = _query
    db.close = MagicMock()

    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        result = await _search_food_near_user(user_id="7", max_results=25)

    ids = {row["id"] for row in result["listings"]}
    assert 1 in ids
    assert 2 not in ids
    # Ensure community_id equality filter was applied at least once.
    assert any("community_id" in str(f) for f in community_filters)
