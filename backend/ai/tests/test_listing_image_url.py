"""Listing photo URL helper and chat-card payload wiring."""
from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend.ai.response_polish import enrich_tool_action
from backend.ai.tools import (
    _get_my_claims,
    _get_user_listings,
    _listing_image_url,
    _listing_photo_fields,
    _search_food_near_user,
    execute_tool,
)


def test_listing_image_url_from_json_array():
    row = SimpleNamespace(images=json.dumps(["/uploads/ai/bread.webp"]))
    assert _listing_image_url(row) == "/uploads/ai/bread.webp"


def test_listing_image_url_https():
    row = SimpleNamespace(images=["https://cdn.example.com/apples.jpg"])
    assert _listing_image_url(row) == "https://cdn.example.com/apples.jpg"


def test_listing_image_url_raw_uploads_string():
    row = SimpleNamespace(images="/uploads/ai/x.webp")
    assert _listing_image_url(row) == "/uploads/ai/x.webp"


def test_listing_image_url_dict_image_url_fallback():
    assert _listing_image_url({"image_url": "/uploads/ai/z.jpg"}) == "/uploads/ai/z.jpg"


def test_listing_image_url_rejects_junk():
    assert _listing_image_url(SimpleNamespace(images="not a photo")) is None
    assert _listing_image_url(SimpleNamespace(images="")) is None
    assert _listing_image_url(SimpleNamespace(images=None)) is None
    assert _listing_image_url({"image": "data:image/png;base64,xxxx"}) is None
    assert _listing_photo_fields(SimpleNamespace(images=None)) == {"has_photo": False}


def _user(*, user_id=7, community_id=8, is_admin=False, role="recipient"):
    u = MagicMock()
    u.id = user_id
    u.community_id = community_id
    u.is_admin = is_admin
    u.coords_lat = 37.77
    u.coords_lng = -122.42
    u.role = MagicMock(value=role)
    return u


def _listing(*, lid, title, donor_id, community_id=8, images=None, recipient_id=None, status="available"):
    r = MagicMock()
    r.id = lid
    r.title = title
    r.donor_id = donor_id
    r.recipient_id = recipient_id
    r.qty = 2
    r.unit = "bags"
    r.address = "1 Market St"
    r.coords_lat = 37.77
    r.coords_lng = -122.42
    r.expiration_date = None
    r.pickup_window_end = None
    r.claimed_at = None
    r.category = MagicMock(value="produce")
    r.community_id = community_id
    r.urgency_score = 0
    r.created_at = None
    r.status = status
    r.images = images
    return r


def _session(*, user=None, listings=None):
    listings = list(listings or [])
    db = MagicMock()

    def _query(model):
        q = MagicMock()
        name = getattr(model, "__name__", "") or str(model)
        q.filter.return_value = q
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
    return db


@pytest.mark.asyncio
async def test_search_includes_image_url_from_uploads():
    user = _user()
    listing = _listing(
        lid=11,
        title="Apples",
        donor_id=9,
        images=json.dumps(["/uploads/ai/apples.webp"]),
    )
    db = _session(user=user, listings=[listing])
    with patch("backend.app.SessionLocal", return_value=db), patch(
        "backend.app._user_is_admin", return_value=False
    ):
        result = await _search_food_near_user(user_id="7", max_results=10)
    assert result["listings"][0]["image_url"] == "/uploads/ai/apples.webp"
    assert result["listings"][0]["has_photo"] is True


@pytest.mark.asyncio
async def test_get_user_listings_includes_image_url():
    user = _user(role="donor")
    listing = _listing(
        lid=4,
        title="Bread",
        donor_id=7,
        images=["https://cdn.example.com/bread.jpg"],
    )
    db = _session(user=user, listings=[listing])
    with patch("backend.app.SessionLocal", return_value=db):
        result = await _get_user_listings(user_id="7", status="all")
    assert result["success"] is True
    assert result["listings"][0]["image_url"] == "https://cdn.example.com/bread.jpg"
    assert result["listings"][0]["has_photo"] is True


@pytest.mark.asyncio
async def test_get_my_claims_returns_photo_and_claim_fields():
    user = _user()
    listing = _listing(
        lid=22,
        title="Milk",
        donor_id=9,
        recipient_id=7,
        status="pending_confirmation",
        images="/uploads/ai/milk.webp",
    )
    db = _session(user=user, listings=[listing])
    with patch("backend.app.SessionLocal", return_value=db):
        result = await _get_my_claims(user_id="7")
    assert result["success"] is True
    row = result["listings"][0]
    assert row["id"] == 22
    assert row["claim_id"] == 22
    assert row["claim_status"] == "pending_confirmation"
    assert row["image_url"] == "/uploads/ai/milk.webp"


@pytest.mark.asyncio
async def test_execute_tool_dispatches_get_my_claims(monkeypatch):
    monkeypatch.setattr(
        "backend.ai.role_guards.check_role_allows_tool",
        AsyncMock(return_value=None),
    )
    with patch("backend.ai.tools._get_my_claims", new_callable=AsyncMock) as mock_fn:
        mock_fn.return_value = {"success": True, "listings": []}
        result = await execute_tool("get_my_claims", {"user_id": "7"})
    assert result["success"] is True
    mock_fn.assert_awaited_once()


def test_enrich_keeps_image_url_on_search():
    result = {
        "listings": [
            {
                "id": 1,
                "title": "Bread",
                "image_url": "/uploads/ai/bread.webp",
                "has_photo": True,
                "community_id": 8,
            }
        ],
        "total": 1,
        "summary": "Found 1 listing(s).",
    }
    entry = enrich_tool_action(
        "search_food_near_user", result, {"tool": "search_food_near_user", "ok": True}
    )
    assert entry["listings"][0]["image_url"] == "/uploads/ai/bread.webp"


def test_enrich_keeps_image_url_on_my_claims():
    result = {
        "success": True,
        "listings": [
            {
                "id": 9,
                "title": "Rice",
                "claim_id": 9,
                "claim_status": "claimed",
                "image_url": "https://cdn.example.com/rice.jpg",
            }
        ],
        "total": 1,
        "summary": "You have 1 claim(s).",
    }
    entry = enrich_tool_action("get_my_claims", result, {"tool": "get_my_claims", "ok": True})
    assert entry["listings"][0]["image_url"] == "https://cdn.example.com/rice.jpg"
    assert entry["listings"][0]["claim_status"] == "claimed"
    assert entry["listings"][0]["claim_id"] == 9


def test_enrich_claim_success_keeps_image_url():
    result = {
        "success": True,
        "listing_id": 3,
        "title": "Soup",
        "image_url": "/uploads/ai/soup.webp",
        "pickup_location": "1 Market St",
    }
    entry = enrich_tool_action("claim_listing", result, {"tool": "claim_listing", "ok": True})
    assert entry["image_url"] == "/uploads/ai/soup.webp"
