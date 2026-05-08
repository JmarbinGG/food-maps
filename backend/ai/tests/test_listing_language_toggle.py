"""Tests for the listing language toggle on post_food_listing."""
from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from backend.ai.tools import execute_tool


def _fake_donor_session():
    """Return a SessionLocal stand-in seeded with a DONOR user.

    Captures the FoodResource added via db.add so tests can inspect
    the values that would have been persisted.
    """
    from backend.models import UserRole

    user = MagicMock()
    user.id = 1
    user.role = UserRole.DONOR
    user.coords_lat = 37.0
    user.coords_lng = -122.0
    user.address = "1 Test St"
    user.phone = "+15550000000"

    db = MagicMock()
    user_query = MagicMock()
    user_query.filter.return_value.first.return_value = user

    # FoodResource queries: dedup chain (.filter()*N.order_by().first())
    # AND verification (.filter().first(), .filter().count()) must
    # return falsy values, not auto-MagicMocks. Build a query proxy
    # whose chained .filter() always returns itself, so .first()/.count()
    # always hit our explicit return values.
    listing_query = MagicMock()
    listing_query.filter.return_value = listing_query
    listing_query.order_by.return_value = listing_query
    listing_query.first.return_value = None
    listing_query.count.return_value = 0

    def _query(model):
        # Differentiate by model class name; first User query returns user,
        # subsequent queries (FoodResource verification) return listing.
        name = getattr(model, "__name__", "")
        if name == "User":
            return user_query
        return listing_query

    db.query.side_effect = _query

    captured = {}

    def _add(obj):
        captured["item"] = obj

    db.add.side_effect = _add
    db.commit = MagicMock()
    db.refresh = MagicMock(side_effect=lambda x: setattr(x, "id", 99))
    db.close = MagicMock()
    return db, captured


@pytest.mark.asyncio
async def test_language_default_translates_to_english():
    db, captured = _fake_donor_session()
    future = (datetime.utcnow() + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%S")

    with patch("backend.app.SessionLocal", return_value=db):
        result = await execute_tool(
            "post_food_listing",
            {
                "user_id": "1",
                "title": "pan",
                "description": "Recogida solamente",
                "qty": 3,
                "unit": "barras",
                "pickup_window_end": future,
            },
        )

    item = captured.get("item")
    assert item is not None, f"expected db.add() to be called; result={result!r}"
    assert item.title.lower().startswith("bread")
    assert "Pickup only" in (item.description or "")


@pytest.mark.asyncio
async def test_language_es_keeps_spanish():
    db, captured = _fake_donor_session()
    future = (datetime.utcnow() + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%S")

    with patch("backend.app.SessionLocal", return_value=db):
        await execute_tool(
            "post_food_listing",
            {
                "user_id": "1",
                "title": "pan",
                "description": "Recogida solamente",
                "qty": 3,
                "unit": "barras",
                "pickup_window_end": future,
                "language": "es",
            },
        )

    item = captured.get("item")
    assert item is not None
    # Spanish opt-in: text must NOT have been translated.
    assert item.title == "pan"
    assert "Recogida solamente" in (item.description or "")
    assert "Pickup only" not in (item.description or "")


@pytest.mark.asyncio
async def test_language_invalid_falls_back_to_english():
    db, captured = _fake_donor_session()
    future = (datetime.utcnow() + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%S")

    with patch("backend.app.SessionLocal", return_value=db):
        await execute_tool(
            "post_food_listing",
            {
                "user_id": "1",
                "title": "manzanas",
                "qty": 5,
                "pickup_window_end": future,
                "language": "fr",
            },
        )

    item = captured.get("item")
    assert item is not None
    assert item.title.lower().startswith("apple")
