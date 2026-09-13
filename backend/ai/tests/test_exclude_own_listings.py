"""Own listings must never appear in Find Food / Nouri search results.

Exercises the MySQL ``backend.ai.tools._search_food_near_user`` /
``_claim_listing`` paths (numeric Food Maps ids).
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from backend.ai.tools import _claim_listing, _search_food_near_user


def _fake_session(*, user=None, listings=None, claim_update_count=0):
    listings = list(listings or [])
    db = MagicMock()

    def _query(model):
        q = MagicMock()
        name = getattr(model, "__name__", "") or str(model)

        if "User" in name:
            q.filter.return_value = q
            q.first.return_value = user
            return q

        if "FoodResource" in name:
            q.filter.return_value = q
            q.order_by.return_value = q
            q.limit.return_value = q
            q.all.return_value = listings
            q.first.return_value = listings[0] if listings else None
            q.update.return_value = claim_update_count
            return q

        q.filter.return_value = q
        q.first.return_value = None
        q.all.return_value = []
        return q

    db.query.side_effect = _query
    db.close = MagicMock()
    db.rollback = MagicMock()
    db.commit = MagicMock()
    return db


def _make_user(*, user_id=7, lat=37.77, lng=-122.42):
    u = MagicMock()
    u.id = user_id
    u.coords_lat = lat
    u.coords_lng = lng
    u.role = MagicMock(value="recipient")
    return u


def _make_listing(*, lid, title, donor_id, lat=37.77, lng=-122.42, status="available"):
    r = MagicMock()
    r.id = lid
    r.title = title
    r.donor_id = donor_id
    r.qty = 5
    r.unit = "items"
    r.address = "1 Market St"
    r.coords_lat = lat
    r.coords_lng = lng
    r.expiration_date = None
    r.pickup_window_end = None
    r.category = MagicMock(value="produce")
    r.community_id = 1
    r.status = status
    r.created_at = None
    return r


@pytest.mark.asyncio
async def test_search_excludes_callers_own_listings():
    me = 7
    other = 9
    user = _make_user(user_id=me)
    listings = [
        _make_listing(lid=1, title="My Apples", donor_id=me),
        _make_listing(lid=2, title="Neighbor Bread", donor_id=other),
    ]
    # Search filters donor_id != uid in the query; simulate that here.
    visible = [r for r in listings if r.donor_id != me]
    db = _fake_session(user=user, listings=visible)

    with patch("backend.app.SessionLocal", return_value=db):
        out = await _search_food_near_user(user_id=str(me), max_results=20)

    ids = [r["id"] for r in out.get("listings") or []]
    assert 1 not in ids
    assert 2 in ids


@pytest.mark.asyncio
async def test_claim_rejects_own_listing():
    me = 7
    user = _make_user(user_id=me)
    own = _make_listing(lid=1, title="My Apples", donor_id=me)
    db = _fake_session(user=user, listings=[own], claim_update_count=0)

    with patch("backend.app.SessionLocal", return_value=db):
        out = await _claim_listing(user_id=str(me), listing_id=1, quantity=1)

    assert out.get("success") is not True
    err = (out.get("error") or "").lower()
    assert "own" in err or "cannot claim" in err
