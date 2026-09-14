"""Extra approval-code flows: rate limits, signup edges, admin list/export/revoke."""
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
    login_attempts_by_key,
    pwd_context,
    signup_attempts_by_ip,
)
from backend.db import get_db  # noqa: E402
from backend.models import ApprovalCode, Base, User, UserRole  # noqa: E402


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
    login_attempts_by_key.clear()

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
    login_attempts_by_key.clear()


def _make_admin(db_session) -> User:
    user = User(
        email="admin-flow@example.com",
        name="Admin",
        password_hash=pwd_context.hash("AdminPass123!"),
        role=UserRole.ADMIN,
        is_admin=True,
        referral_code="ADMINFLW1",
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _make_member(db_session, email="member-flow@example.com") -> User:
    user = User(
        email=email,
        name="Member",
        password_hash=pwd_context.hash("Password123!"),
        role=UserRole.RECIPIENT,
        referral_code="MEMFLW01",
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _admin_headers(user: User) -> dict:
    now = datetime.utcnow()
    token = jwt.encode(
        {
            "sub": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": "admin",
            "is_admin": True,
            "iat": now,
            "exp": now + timedelta(hours=2),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return {"Authorization": f"Bearer {token}"}


def _seed_code(
    db_session,
    *,
    code="RBE100001",
    community_id=8,
    claimed=False,
    revoked=False,
    claimed_by=None,
):
    row = ApprovalCode(
        code=code,
        school_code=code[:3],
        community_id=community_id,
        is_claimed=claimed,
        is_revoked=revoked,
        claimed_by=claimed_by,
        claimed_at=datetime.utcnow() if claimed else None,
        created_at=datetime.utcnow(),
    )
    db_session.add(row)
    db_session.commit()
    db_session.refresh(row)
    return row


# ---------------------------------------------------------------------------
# Public validate
# ---------------------------------------------------------------------------


class TestValidateEdges:
    def test_unknown_code_is_invalid(self, client):
        res = client.get("/api/approval-codes/validate", params={"code": "XYZ123456"})
        assert res.status_code == 200
        body = res.json()
        assert body["valid"] is False
        assert body["community_id"] is None
        assert body["school_code"] is None

    def test_spaces_and_hyphens_normalize(self, client, db_session):
        _seed_code(db_session, code="RBE111222", community_id=8)
        with patch("backend.app._community_name_for_id", new=AsyncMock(return_value="Ruby Bridges")):
            res = client.get(
                "/api/approval-codes/validate",
                params={"code": " rbe 111 222 "},
            )
        assert res.json()["valid"] is True
        assert res.json()["community_id"] == 8

    def test_rate_limit_returns_429(self, client):
        with patch("backend.app.APPROVAL_VALIDATE_RATE_LIMIT_MAX_ATTEMPTS", 3):
            for _ in range(3):
                assert client.get(
                    "/api/approval-codes/validate",
                    params={"code": "AAA111111"},
                ).status_code == 200
            limited = client.get(
                "/api/approval-codes/validate",
                params={"code": "AAA111111"},
            )
        assert limited.status_code == 429
        assert "approval code" in limited.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Signup claim edges
# ---------------------------------------------------------------------------


class TestSignupEdges:
    def test_invalid_format_rejected(self, client):
        res = client.post(
            "/api/user/create",
            json={
                "name": "Bad Format",
                "email": "badformat@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "RBE12",
            },
        )
        assert res.status_code == 400
        assert "format" in str(res.json().get("detail", "")).lower()

    def test_revoked_code_rejected_without_leaking_status(self, client, db_session):
        _seed_code(db_session, code="RBE333444", revoked=True)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Revoked",
                "email": "revoked@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "RBE333444",
            },
        )
        assert res.status_code == 400
        assert "invalid or already used" in str(res.json().get("detail", "")).lower()
        assert db_session.query(User).filter(User.email == "revoked@example.com").first() is None

    def test_claimed_code_same_message(self, client, db_session):
        _seed_code(db_session, code="RBE555666", claimed=True)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Taken",
                "email": "taken@example.com",
                "password": "Password123!",
                "role": "donor",
                "approval_code": "RBE555666",
            },
        )
        assert res.status_code == 400
        assert "invalid or already used" in str(res.json().get("detail", "")).lower()

    def test_whitespace_code_still_claims(self, client, db_session):
        _seed_code(db_session, code="NEA200333", community_id=3)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Spaced",
                "email": "spaced@example.com",
                "password": "Password123!",
                "role": "donor",
                "approval_code": " nea 200333 ",
            },
        )
        assert res.status_code == 200, res.text
        user = db_session.query(User).filter(User.email == "spaced@example.com").first()
        assert user.community_id == 3
        assert user.approval_number == "NEA200333"
        assert user.role == UserRole.DONOR
        row = db_session.query(ApprovalCode).filter(ApprovalCode.code == "NEA200333").first()
        assert row.is_claimed is True
        assert row.claimed_by == user.id

    def test_duplicate_email_does_not_consume_code(self, client, db_session):
        _seed_code(db_session, code="ENC700001", community_id=5)
        first = client.post(
            "/api/user/create",
            json={
                "name": "One",
                "email": "dup@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "ENC700001",
            },
        )
        assert first.status_code == 200
        leftover = _seed_code(db_session, code="ENC700002", community_id=5)
        second = client.post(
            "/api/user/create",
            json={
                "name": "Two",
                "email": "DUP@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "ENC700002",
            },
        )
        assert second.status_code == 400
        assert "already" in str(second.json().get("detail", "")).lower()
        db_session.refresh(leftover)
        assert leftover.is_claimed is False


# ---------------------------------------------------------------------------
# Admin generate / list / export / revoke / assign
# ---------------------------------------------------------------------------


class TestAdminGenerateValidation:
    def test_school_code_must_be_three_letters(self, client, db_session):
        headers = _admin_headers(_make_admin(db_session))
        res = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 1, "school_code": "AB", "quantity": 1},
        )
        assert res.status_code == 400
        assert "3" in res.json()["detail"]

    def test_school_code_rejects_digits(self, client, db_session):
        headers = _admin_headers(_make_admin(db_session))
        res = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 1, "school_code": "R1E", "quantity": 1},
        )
        assert res.status_code == 400

    def test_quantity_bounds(self, client, db_session):
        headers = _admin_headers(_make_admin(db_session))
        too_low = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 1, "school_code": "RBE", "quantity": 0},
        )
        too_high = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 1, "school_code": "RBE", "quantity": 1001},
        )
        assert too_low.status_code == 400
        assert too_high.status_code == 400

    def test_invalid_community_id(self, client, db_session):
        headers = _admin_headers(_make_admin(db_session))
        res = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 0, "school_code": "RBE", "quantity": 1},
        )
        assert res.status_code == 400


class TestAdminListExportRevoke:
    def test_list_filters_by_status_and_community(self, client, db_session):
        admin = _make_admin(db_session)
        headers = _admin_headers(admin)
        _seed_code(db_session, code="RBE800001", community_id=8)
        _seed_code(db_session, code="RBE800002", community_id=8, claimed=True)
        _seed_code(db_session, code="NEA800003", community_id=3, revoked=True)

        unclaimed = client.get(
            "/api/admin/approval-codes",
            headers=headers,
            params={"status": "unclaimed", "community_id": 8},
        )
        assert unclaimed.status_code == 200
        codes = [c["code"] for c in unclaimed.json()["codes"]]
        assert codes == ["RBE800001"]
        stats = unclaimed.json()["stats"]
        assert stats["total"] == 3
        assert stats["unclaimed"] == 1
        assert stats["claimed"] == 1
        assert stats["revoked"] == 1

        claimed = client.get(
            "/api/admin/approval-codes",
            headers=headers,
            params={"status": "claimed"},
        )
        assert {c["code"] for c in claimed.json()["codes"]} == {"RBE800002"}

        revoked = client.get(
            "/api/admin/approval-codes",
            headers=headers,
            params={"status": "revoked"},
        )
        assert {c["code"] for c in revoked.json()["codes"]} == {"NEA800003"}

    def test_export_skips_claimed_and_revoked(self, client, db_session):
        admin = _make_admin(db_session)
        headers = _admin_headers(admin)
        _seed_code(db_session, code="RBE900001", community_id=8)
        _seed_code(db_session, code="RBE900002", community_id=8, claimed=True)
        _seed_code(db_session, code="RBE900003", community_id=8, revoked=True)
        _seed_code(db_session, code="NEA900004", community_id=3)

        export = client.get(
            "/api/admin/approval-codes/export",
            headers=headers,
            params={"community_id": 8},
        )
        assert export.status_code == 200
        assert "RBE900001" in export.text
        assert "RBE900002" not in export.text
        assert "RBE900003" not in export.text
        assert "NEA900004" not in export.text

    def test_revoke_404_and_claimed_and_idempotent(self, client, db_session):
        admin = _make_admin(db_session)
        headers = _admin_headers(admin)
        missing = client.post("/api/admin/approval-codes/99999/revoke", headers=headers)
        assert missing.status_code == 404

        claimed = _seed_code(db_session, code="RBE910001", claimed=True)
        blocked = client.post(f"/api/admin/approval-codes/{claimed.id}/revoke", headers=headers)
        assert blocked.status_code == 400
        assert "claimed" in blocked.json()["detail"].lower()

        open_row = _seed_code(db_session, code="RBE910002")
        first = client.post(f"/api/admin/approval-codes/{open_row.id}/revoke", headers=headers)
        second = client.post(f"/api/admin/approval-codes/{open_row.id}/revoke", headers=headers)
        assert first.status_code == 200
        assert second.status_code == 200
        assert second.json()["is_revoked"] is True
        db_session.refresh(open_row)
        assert open_row.is_revoked is True

    def test_member_cannot_list_or_revoke(self, client, db_session):
        member = _make_member(db_session)
        now = datetime.utcnow()
        token = jwt.encode(
            {
                "sub": str(member.id),
                "role": "recipient",
                "is_admin": False,
                "iat": now,
                "exp": now + timedelta(hours=2),
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        if isinstance(token, bytes):
            token = token.decode("utf-8")
        headers = {"Authorization": f"Bearer {token}"}
        listed = client.get("/api/admin/approval-codes", headers=headers)
        assert listed.status_code in (401, 403)
        row = _seed_code(db_session, code="RBE920001")
        revoked = client.post(f"/api/admin/approval-codes/{row.id}/revoke", headers=headers)
        assert revoked.status_code in (401, 403)


class TestAdminAssignCommunity:
    def test_clear_community(self, client, db_session):
        admin = _make_admin(db_session)
        user = _make_member(db_session)
        user.community_id = 8
        db_session.commit()
        headers = _admin_headers(admin)
        with patch("backend.app._community_name_for_id", new=AsyncMock(return_value=None)):
            res = client.put(
                f"/api/admin/users/{user.id}/community",
                headers=headers,
                json={"community_id": None},
            )
        assert res.status_code == 200
        assert res.json()["community_id"] is None
        db_session.refresh(user)
        assert user.community_id is None

    def test_invalid_community_and_missing_user(self, client, db_session):
        headers = _admin_headers(_make_admin(db_session))
        bad = client.put(
            "/api/admin/users/1/community",
            headers=headers,
            json={"community_id": 0},
        )
        # user 1 may exist (admin) — still invalid community
        assert bad.status_code == 400
        missing = client.put(
            "/api/admin/users/99999/community",
            headers=headers,
            json={"community_id": 8},
        )
        assert missing.status_code == 404
