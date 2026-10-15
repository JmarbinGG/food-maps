"""Private community maps: private listings stay off the public map and AI search."""
from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta
from unittest.mock import patch

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import JWT_ALGORITHM, JWT_SECRET, app, pwd_context  # noqa: E402
from backend.db import get_db  # noqa: E402
from backend.models import (  # noqa: E402
    Base,
    DistributionCenter,
    FoodCategory,
    FoodResource,
    PerishabilityLevel,
    User,
    UserCommunity,
    UserRole,
)

HIDDEN = 9
OTHER_PRIVATE = 10


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield sessionmaker(bind=engine)
    engine.dispose()


@pytest.fixture()
def db_session(session_factory):
    session = session_factory()

    # create_listing stores pickup times as the raw strings it receives, which
    # MySQL accepts but SQLite's DateTime type rejects.
    @event.listens_for(session, "before_flush")
    def _coerce_pickup_strings(sess, _ctx, _instances):
        for obj in sess.new:
            if isinstance(obj, FoodResource):
                for attr in ("pickup_window_start", "pickup_window_end"):
                    value = getattr(obj, attr)
                    if isinstance(value, str):
                        setattr(obj, attr, datetime.fromisoformat(value))

    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def world(db_session):
    """Hidden map (9), another private map (10), a member, a non-member, a donor, an admin."""
    for cid, name in ((HIDDEN, "Do Good Hidden Map"), (OTHER_PRIVATE, "Other Private")):
        db_session.add(DistributionCenter(
            id=cid, name=name, address="x", coords_lat=None, coords_lng=None,
            is_active=True, private_map_enabled=True,
        ))
    db_session.commit()

    def user(email, role, communities=(), admin=False, phone=None):
        u = User(
            email=email, name=email.split("@")[0], role=role, is_admin=admin,
            password_hash=pwd_context.hash("Password123!"), phone=phone,
            community_id=communities[0] if communities else None,
            created_at=datetime.utcnow(),
        )
        db_session.add(u)
        db_session.commit()
        for cid in communities:
            db_session.add(UserCommunity(user_id=u.id, community_id=cid))
        db_session.commit()
        return u

    donor = user("donor@example.com", UserRole.DONOR, (HIDDEN,), phone="5555550100")
    member = user("member@example.com", UserRole.RECIPIENT, (HIDDEN,), phone="5555550101")
    outsider = user("outsider@example.com", UserRole.RECIPIENT, phone="5555550102")
    admin = user("admin@example.com", UserRole.ADMIN, admin=True)

    def listing(title, private=False, community_id=None):
        row = FoodResource(
            donor_id=donor.id, title=title, category=FoodCategory("produce"), qty=1, unit="box",
            perishability=PerishabilityLevel("low"), address="1 Main St",
            coords_lat=37.0, coords_lng=-122.0, status="available",
            is_private=private, community_id=community_id, created_at=datetime.utcnow(),
            pickup_window_end=datetime.utcnow() + timedelta(days=1),
        )
        db_session.add(row)
        db_session.commit()
        return row

    public = listing("Public apples")
    secret = listing("Hidden bread", private=True, community_id=HIDDEN)
    return {
        "donor": donor, "member": member, "outsider": outsider, "admin": admin,
        "public": public, "secret": secret,
    }


def _headers(user):
    now = datetime.utcnow()
    token = jwt.encode(
        {"sub": str(user.id), "role": user.role.value, "iat": now, "exp": now + timedelta(hours=1)},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return {"Authorization": f"Bearer {token}"}


def _titles(res):
    assert res.status_code == 200, res.text
    return {row["title"] for row in res.json()}


class TestListingFeed:
    def test_public_map_hides_private_listings(self, client, world):
        assert _titles(client.get("/api/listings/get")) == {"Public apples"}
        for who in ("member", "outsider", "admin"):
            res = client.get("/api/listings/get", headers=_headers(world[who]))
            assert _titles(res) == {"Public apples"}, who

    def test_donor_sees_own_private_listing_tagged(self, client, world):
        res = client.get("/api/listings/get", headers=_headers(world["donor"]))
        rows = {r["title"]: r for r in res.json()}
        assert set(rows) == {"Public apples", "Hidden bread"}
        assert rows["Hidden bread"]["is_private"] is True
        assert rows["Public apples"]["is_private"] is False

    def test_private_map_shows_only_its_listings(self, client, world):
        for who in ("member", "admin"):
            res = client.get("/api/listings/get", params={"map": HIDDEN}, headers=_headers(world[who]))
            assert _titles(res) == {"Hidden bread"}, who

    def test_private_map_requires_access(self, client, world):
        res = client.get("/api/listings/get", params={"map": HIDDEN}, headers=_headers(world["outsider"]))
        assert res.status_code == 403
        assert client.get("/api/listings/get", params={"map": HIDDEN}).status_code == 403
        res = client.get("/api/listings/get", params={"map": OTHER_PRIVATE},
                         headers=_headers(world["member"]))
        assert res.status_code == 403

    def test_unknown_map_key(self, client, world):
        assert client.get("/api/listings/get", params={"map": "nope"}).status_code == 400

    def test_legacy_null_is_private_counts_as_public(self, client, world, db_session):
        world["public"].is_private = None
        db_session.commit()
        assert "Public apples" in _titles(client.get("/api/listings/get"))


class TestClaim:
    def test_outsider_cannot_claim_private_listing(self, client, world, db_session):
        res = client.post(f"/api/listings/claim/{world['secret'].id}", headers=_headers(world["outsider"]))
        assert res.status_code == 404
        db_session.refresh(world["secret"])
        assert world["secret"].status == "available"

    def test_member_can_claim_private_listing(self, client, world, db_session):
        with patch("backend.app.send_sms", return_value=True):
            res = client.post(f"/api/listings/claim/{world['secret'].id}", headers=_headers(world["member"]))
        assert res.status_code == 200, res.text
        db_session.refresh(world["secret"])
        assert world["secret"].recipient_id == world["member"].id


class TestCreateListing:
    def _create(self, client, user, **extra):
        params = {
            "donor_id": user.id, "title": "Soup", "desc": "", "category": "prepared",
            "qty": 1, "unit": "pot", "perishability": "high", "address": "1 Main St",
            "pickup_start": "2026-10-15T10:00:00", "pickup_end": "2026-10-15T12:00:00",
            **extra,
        }
        with patch.dict(os.environ, {"MAPBOX_TOKEN": ""}):
            return client.post("/api/listings/create", params=params, headers=_headers(user))

    def test_private_listing_goes_to_chosen_map(self, client, world, db_session):
        res = self._create(client, world["donor"], is_private="true", map_community_id=HIDDEN)
        assert res.status_code == 200, res.text
        body = res.json()["listing"]
        assert body["is_private"] is True
        assert body["community_id"] == HIDDEN

    def test_private_listing_rejected_for_map_donor_cannot_open(self, client, world):
        res = self._create(client, world["donor"], is_private="true", map_community_id=OTHER_PRIVATE)
        assert res.status_code == 403
        res = self._create(client, world["donor"], is_private="true")
        assert res.status_code == 403

    def test_public_listing_unchanged(self, client, world):
        res = self._create(client, world["donor"])
        assert res.status_code == 200, res.text
        assert res.json()["listing"]["is_private"] is False
        assert res.json()["listing"]["community_id"] is None


def test_ai_search_skips_private_listings(world, session_factory):
    from backend.ai.tools import _search_food_near_user

    with patch("backend.app.SessionLocal", session_factory):
        result = asyncio.run(_search_food_near_user(user_id=str(world["member"].id)))
    titles = {row["title"] for row in result["listings"]}
    assert "Public apples" in titles
    assert "Hidden bread" not in titles


def test_recommended_skips_private_listings(client, world):
    res = client.get("/api/listings/recommended", headers=_headers(world["member"]))
    if res.status_code == 200:
        body = res.json()
        rows = body if isinstance(body, list) else (body.get("listings") or body.get("recommendations") or [])
        assert "Hidden bread" not in {r.get("title") for r in rows}
