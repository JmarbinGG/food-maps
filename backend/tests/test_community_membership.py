"""Multi-community membership: signup row, joining more communities, /api/maps."""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import (  # noqa: E402
    JWT_ALGORITHM,
    JWT_SECRET,
    app,
    approval_validate_attempts_by_ip,
    pwd_context,
    signup_attempts_by_ip,
)
from backend.db import get_db  # noqa: E402
from backend.models import (  # noqa: E402
    ApprovalCode,
    Base,
    DistributionCenter,
    User,
    UserCommunity,
    UserRole,
)


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    signup_attempts_by_ip.clear()
    approval_validate_attempts_by_ip.clear()

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()
    signup_attempts_by_ip.clear()
    approval_validate_attempts_by_ip.clear()


def _center(db_session, cid, name, private=False):
    row = DistributionCenter(
        id=cid, name=name, address="1 Main St", coords_lat=37.0, coords_lng=-122.0,
        is_active=True, private_map_enabled=private,
    )
    db_session.add(row)
    db_session.commit()
    return row


def _code(db_session, code, community_id):
    row = ApprovalCode(
        code=code, school_code=code[:3], community_id=community_id,
        is_claimed=False, is_revoked=False, created_at=datetime.utcnow(),
    )
    db_session.add(row)
    db_session.commit()
    return row


def _user(db_session, email="member@example.com", community_id=None, admin=False):
    user = User(
        email=email,
        name="Member",
        password_hash=pwd_context.hash("Password123!"),
        role=UserRole.ADMIN if admin else UserRole.RECIPIENT,
        is_admin=admin,
        community_id=community_id,
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    if community_id is not None:
        db_session.add(UserCommunity(user_id=user.id, community_id=community_id))
        db_session.commit()
    return user


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


class TestSignupMembership:
    def test_signup_creates_membership_row(self, client, db_session):
        _center(db_session, 8, "Ruby Bridges")
        _code(db_session, "RBE100001", 8)
        with patch("backend.app._community_name_for_id", new=AsyncMock(return_value="Ruby Bridges")):
            res = client.post("/api/user/create", json={
                "name": "New", "email": "new@example.com", "password": "Password123!",
                "role": "recipient", "approval_code": "RBE100001",
            })
        assert res.status_code == 200, res.text
        user = db_session.query(User).filter(User.email == "new@example.com").one()
        rows = db_session.query(UserCommunity).filter(UserCommunity.user_id == user.id).all()
        assert [(r.community_id, r.approval_code) for r in rows] == [(8, "RBE100001")]


class TestJoinCommunity:
    def test_join_second_community(self, client, db_session):
        _center(db_session, 8, "Ruby Bridges")
        _center(db_session, 9, "Hidden Map", private=True)
        _code(db_session, "HID100001", 9)
        user = _user(db_session, community_id=8)

        res = client.post("/api/user/communities/join", json={"approval_code": "hid 100 001"},
                          headers=_headers(user))
        assert res.status_code == 200, res.text
        body = res.json()
        assert body["community"]["community_id"] == 9
        assert body["community"]["private_map_enabled"] is True
        assert {c["community_id"] for c in body["communities"]} == {8, 9}

        db_session.refresh(user)
        assert user.community_id == 8  # home community unchanged
        code = db_session.query(ApprovalCode).filter(ApprovalCode.code == "HID100001").one()
        assert code.is_claimed is True and code.claimed_by == user.id

    def test_first_join_sets_home_community(self, client, db_session):
        _center(db_session, 9, "Hidden Map", private=True)
        _code(db_session, "HID100002", 9)
        user = _user(db_session)
        res = client.post("/api/user/communities/join", json={"approval_code": "HID100002"},
                          headers=_headers(user))
        assert res.status_code == 200, res.text
        db_session.refresh(user)
        assert user.community_id == 9
        assert user.approval_number == "HID100002"

    def test_claimed_code_rejected(self, client, db_session):
        _center(db_session, 9, "Hidden Map", private=True)
        code = _code(db_session, "HID100003", 9)
        code.is_claimed = True
        db_session.commit()
        user = _user(db_session)
        res = client.post("/api/user/communities/join", json={"approval_code": "HID100003"},
                          headers=_headers(user))
        assert res.status_code == 400
        assert db_session.query(UserCommunity).count() == 0

    def test_duplicate_community_does_not_burn_code(self, client, db_session):
        _center(db_session, 8, "Ruby Bridges")
        _code(db_session, "RBE100004", 8)
        user = _user(db_session, community_id=8)
        res = client.post("/api/user/communities/join", json={"approval_code": "RBE100004"},
                          headers=_headers(user))
        assert res.status_code == 400
        assert "already a member" in res.json()["detail"]
        code = db_session.query(ApprovalCode).filter(ApprovalCode.code == "RBE100004").one()
        assert code.is_claimed is False

    def test_bad_format_and_auth(self, client, db_session):
        user = _user(db_session)
        assert client.post("/api/user/communities/join", json={"approval_code": "XY1"},
                           headers=_headers(user)).status_code == 400
        assert client.post("/api/user/communities/join",
                           json={"approval_code": "HID100001"}).status_code in (401, 403)

    def test_list_communities(self, client, db_session):
        _center(db_session, 8, "Ruby Bridges")
        user = _user(db_session, community_id=8)
        res = client.get("/api/user/communities", headers=_headers(user))
        assert res.status_code == 200
        assert res.json()["communities"][0]["is_home"] is True


class TestAvailableMaps:
    def test_anonymous_sees_public_only(self, client, db_session):
        _center(db_session, 9, "Hidden Map", private=True)
        res = client.get("/api/maps")
        assert [m["key"] for m in res.json()["maps"]] == ["public"]

    def test_member_sees_private_maps_they_belong_to(self, client, db_session):
        _center(db_session, 8, "Ruby Bridges")              # member, not private
        _center(db_session, 9, "Hidden Map", private=True)  # member, private
        _center(db_session, 10, "Other Private", private=True)  # not a member
        user = _user(db_session, community_id=8)
        db_session.add(UserCommunity(user_id=user.id, community_id=9))
        db_session.commit()
        res = client.get("/api/maps", headers=_headers(user))
        assert [m["key"] for m in res.json()["maps"]] == ["public", "9"]

    def test_admin_sees_every_private_map(self, client, db_session):
        _center(db_session, 9, "Hidden Map", private=True)
        _center(db_session, 10, "Other Private", private=True)
        admin = _user(db_session, email="admin@example.com", admin=True)
        res = client.get("/api/maps", headers=_headers(admin))
        assert [m["key"] for m in res.json()["maps"]] == ["public", "9", "10"]


def test_backfill_is_idempotent(db_session):
    from backend import app as app_module

    engine = db_session.get_bind()
    _user(db_session, email="legacy@example.com")
    legacy = db_session.query(User).filter(User.email == "legacy@example.com").one()
    legacy.community_id = 8
    db_session.commit()

    with patch.object(app_module, "engine", engine):
        app_module._backfill_user_communities()
        app_module._backfill_user_communities()
    rows = db_session.query(UserCommunity).filter(UserCommunity.user_id == legacy.id).all()
    assert [r.community_id for r in rows] == [8]
