"""FoodResource.community_id is stamped on MySQL post_food_listing."""
from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from backend.models import UserRole


def _donor_user(*, user_id=1, community_id=None):
    u = MagicMock()
    u.id = user_id
    u.role = UserRole.DONOR
    u.is_admin = False
    u.community_id = community_id
    u.address = "1423 Park St, Alameda, CA"
    u.coords_lat = 37.765
    u.coords_lng = -122.242
    u.phone = "+15551234567"
    return u


def _center(*, center_id=8, name="Alameda High"):
    c = MagicMock()
    c.id = center_id
    c.name = name
    c.is_active = True
    return c


@pytest.mark.asyncio
async def test_post_listing_stamps_food_resource_community_id():
    """Resolved community_id must land on FoodResource, not only User."""
    from backend.ai.tools import _post_food_listing_legacy_sqlalchemy

    user = _donor_user(user_id=3, community_id=None)
    center = _center(center_id=12, name="Alameda High")
    created = []

    db = MagicMock()

    def _query(model):
        q = MagicMock()
        q.filter.return_value = q
        q.order_by.return_value = q
        q.first.return_value = None
        q.count.return_value = 1
        # User lookup
        from backend.models import User, FoodResource, DistributionCenter
        name = getattr(model, "__name__", "") or str(model)
        if model is User or "User" in name:
            q.first.return_value = user
        elif model is DistributionCenter or "DistributionCenter" in name:
            q.first.return_value = center
        elif model is FoodResource or "FoodResource" in name:
            # dedup miss + verify re-query
            if created:
                item = created[0]
                q.first.return_value = item
            else:
                q.first.return_value = None
        return q

    db.query.side_effect = _query

    def _add(obj):
        created.append(obj)
        obj.id = 99
        # Simulate ORM assigning community_id from constructor kwargs
        if not hasattr(obj, "community_id"):
            obj.community_id = None

    db.add.side_effect = _add
    db.commit = MagicMock()
    db.refresh = MagicMock()
    db.expire_all = MagicMock()
    db.rollback = MagicMock()
    db.close = MagicMock()

    future = (datetime.utcnow() + timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%S")
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.ai.bulk_mysql.resolve_community_mysql",
        return_value=("12", "Alameda High"),
    ), patch(
        "backend.ai.tools._geocode_address",
        return_value=(37.765, -122.242),
    ):
        result = await _post_food_listing_legacy_sqlalchemy(
            user_id="3",
            title="Fresh bread loaves",
            category="bakery",
            qty=4,
            images=["https://example.com/bread.jpg"],
            pickup_window_end=future,
            community_id="12",
            community_name="Alameda High",
            community_confirmed=True,
        )

    assert result.get("success") is True, result
    assert result.get("community_id") in (12, "12")
    assert created, "expected FoodResource to be added"
    item = created[0]
    assert getattr(item, "community_id", None) == 12
    # User stamp when previously unset + confirmed
    assert user.community_id == 12


@pytest.mark.asyncio
async def test_post_listing_rejects_non_digit_user_id():
    """MySQL-only post path requires a numeric Food Maps user id."""
    from backend.ai.tools import _post_food_listing_legacy_sqlalchemy

    result = await _post_food_listing_legacy_sqlalchemy(
        user_id="not-a-numeric-id",
        title="Should not post",
        images=["https://example.com/x.jpg"],
        community_confirmed=True,
        community_name="Anywhere",
    )
    assert "error" in result
    assert "user_id" in result["error"].lower()


def test_food_resource_model_has_nullable_community_id():
    from backend.models import FoodResource

    col = FoodResource.__table__.columns["community_id"]
    assert col.nullable is True
