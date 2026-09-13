"""Approval codes + community assignment API tests."""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure sqlite is allowed before app/db modules are used in this process.
os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import (  # noqa: E402
    app,
    pwd_context,
    JWT_SECRET,
    JWT_ALGORITHM,
    _normalize_approval_code,
    _approval_code_format_ok,
    _generate_approval_code_suffix,
    signup_attempts_by_ip,
    approval_validate_attempts_by_ip,
    login_attempts_by_key,
)
from backend.db import get_db  # noqa: E402
from backend.models import Base, User, UserRole, ApprovalCode  # noqa: E402
from backend.scripts.migrate_approval_codes import migrate  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
AUTH_MODAL = REPO_ROOT / "frontend" / "js" / "components" / "auth" / "AuthModal.js"
ADMIN_PANEL = REPO_ROOT / "frontend" / "js" / "components" / "admin" / "AdminPanel.js"
USER_PROFILE = REPO_ROOT / "frontend" / "js" / "components" / "profile" / "UserProfile.js"


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
        email="admin@example.com",
        name="Admin",
        password_hash=pwd_context.hash("AdminPass123!"),
        role=UserRole.ADMIN,
        is_admin=True,
        referral_code="ADMINREF1",
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _admin_token(user: User) -> str:
    now = datetime.utcnow()
    token = jwt.encode(
        {
            "sub": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": "admin",
            "is_admin": True,
            "community_id": user.community_id,
            "iat": now,
            "exp": now + timedelta(hours=2),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def _seed_code(db_session, *, code="RBE100001", community_id=8, claimed=False, revoked=False):
    row = ApprovalCode(
        code=code,
        school_code=code[:3],
        community_id=community_id,
        is_claimed=claimed,
        is_revoked=revoked,
        created_at=datetime.utcnow(),
    )
    db_session.add(row)
    db_session.commit()
    db_session.refresh(row)
    return row


class TestApprovalHelpers:
    def test_normalize_strips_and_uppercases(self):
        assert _normalize_approval_code(" rbe 123456 ") == "RBE123456"

    def test_format_ok(self):
        assert _approval_code_format_ok("RBE123456") is True
        assert _approval_code_format_ok("rb123456") is False
        assert _approval_code_format_ok("RBE12345") is False

    def test_suffix_range(self):
        for _ in range(20):
            s = _generate_approval_code_suffix()
            assert len(s) == 6
            assert 100000 <= int(s) <= 999999


class TestValidateEndpoint:
    def test_invalid_format(self, client):
        res = client.get("/api/approval-codes/validate", params={"code": "BAD"})
        assert res.status_code == 200
        assert res.json()["valid"] is False

    def test_unclaimed_valid(self, client, db_session):
        _seed_code(db_session, code="NEA200001", community_id=3)
        with patch("backend.app._community_name_for_id", new=AsyncMock(return_value="NEA/ACLC CC")):
            res = client.get("/api/approval-codes/validate", params={"code": "nea200001"})
        assert res.status_code == 200
        body = res.json()
        assert body["valid"] is True
        assert body["community_id"] == 3
        assert body["school_code"] == "NEA"
        assert body["community_name"] == "NEA/ACLC CC"

    def test_claimed_not_valid(self, client, db_session):
        _seed_code(db_session, code="AOA300001", claimed=True)
        res = client.get("/api/approval-codes/validate", params={"code": "AOA300001"})
        assert res.json()["valid"] is False

    def test_revoked_not_valid(self, client, db_session):
        _seed_code(db_session, code="IHS400001", revoked=True)
        res = client.get("/api/approval-codes/validate", params={"code": "IHS400001"})
        assert res.json()["valid"] is False


class TestSignupClaim:
    def test_signup_requires_approval_code(self, client):
        res = client.post(
            "/api/user/create",
            json={
                "name": "No Code",
                "email": "nocode@example.com",
                "password": "Password123!",
                "role": "recipient",
            },
        )
        assert res.status_code == 400
        assert "approval" in str(res.json().get("detail", "")).lower()

    def test_signup_claims_code_and_sets_community(self, client, db_session):
        _seed_code(db_session, code="RBE555555", community_id=8)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Family User",
                "email": "family@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "RBE555555",
            },
        )
        assert res.status_code == 200, res.text
        body = res.json()
        assert body["success"] is True
        assert body["community_id"] == 8
        assert body["approval_number"] == "RBE555555"

        row = db_session.query(ApprovalCode).filter(ApprovalCode.code == "RBE555555").first()
        assert row.is_claimed is True
        user = db_session.query(User).filter(User.email == "family@example.com").first()
        assert user.community_id == 8
        assert user.approval_number == "RBE555555"

    def test_double_claim_rejected(self, client, db_session):
        _seed_code(db_session, code="ENC666666", community_id=5)
        first = client.post(
            "/api/user/create",
            json={
                "name": "First",
                "email": "first@example.com",
                "password": "Password123!",
                "role": "donor",
                "approval_code": "ENC666666",
            },
        )
        assert first.status_code == 200
        second = client.post(
            "/api/user/create",
            json={
                "name": "Second",
                "email": "second@example.com",
                "password": "Password123!",
                "role": "donor",
                "approval_code": "ENC666666",
            },
        )
        assert second.status_code == 400
        assert db_session.query(User).filter(User.email == "second@example.com").first() is None

    def test_login_jwt_includes_community_id(self, client, db_session):
        _seed_code(db_session, code="MPP777777", community_id=12)
        client.post(
            "/api/user/create",
            json={
                "name": "Jwt User",
                "email": "jwtuser@example.com",
                "password": "Password123!",
                "role": "recipient",
                "approval_code": "MPP777777",
            },
        )
        login = client.post(
            "/api/user/login",
            json={"email": "jwtuser@example.com", "password": "Password123!"},
        )
        assert login.status_code == 200, login.text
        token = login.json()["token"]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        assert payload["community_id"] == 12
        assert payload["approval_number"] == "MPP777777"

    def test_signup_rejects_admin_role(self, client, db_session):
        _seed_code(db_session, code="DGW888888", community_id=1)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Evil Admin",
                "email": "eviladmin@example.com",
                "password": "Password123!",
                "role": "admin",
                "approval_code": "DGW888888",
            },
        )
        assert res.status_code == 400
        assert "donor or recipient" in str(res.json().get("detail", "")).lower()
        assert db_session.query(User).filter(User.email == "eviladmin@example.com").first() is None

    def test_signup_rejects_short_password(self, client, db_session):
        _seed_code(db_session, code="NEA999001", community_id=3)
        res = client.post(
            "/api/user/create",
            json={
                "name": "Short Pw",
                "email": "shortpw@example.com",
                "password": "short",
                "role": "recipient",
                "approval_code": "NEA999001",
            },
        )
        assert res.status_code == 400
        assert "password" in str(res.json().get("detail", "")).lower()


class TestAdminApprovalCodes:
    def test_generate_requires_admin(self, client):
        res = client.post(
            "/api/admin/approval-codes",
            json={"community_id": 1, "school_code": "DGW", "quantity": 2},
        )
        assert res.status_code in (401, 403)

    def test_generate_and_export_and_revoke(self, client, db_session):
        admin = _make_admin(db_session)
        headers = {"Authorization": f"Bearer {_admin_token(admin)}"}

        gen = client.post(
            "/api/admin/approval-codes",
            headers=headers,
            json={"community_id": 1, "school_code": "dgw", "quantity": 3},
        )
        assert gen.status_code == 200, gen.text
        body = gen.json()
        assert body["generated"] == 3
        assert all(c.startswith("DGW") for c in body["codes"])
        assert len(set(body["codes"])) == 3

        listed = client.get("/api/admin/approval-codes", headers=headers)
        assert listed.status_code == 200
        assert listed.json()["stats"]["unclaimed"] >= 3

        export = client.get("/api/admin/approval-codes/export", headers=headers)
        assert export.status_code == 200
        assert "text/csv" in export.headers.get("content-type", "")
        assert "DGW" in export.text

        code_id = listed.json()["codes"][0]["id"]
        revoked = client.post(f"/api/admin/approval-codes/{code_id}/revoke", headers=headers)
        assert revoked.status_code == 200
        row = db_session.query(ApprovalCode).filter(ApprovalCode.id == code_id).first()
        assert row.is_revoked is True

    def test_assign_user_community(self, client, db_session):
        admin = _make_admin(db_session)
        user = User(
            email="member@example.com",
            name="Member",
            password_hash=pwd_context.hash("Password123!"),
            role=UserRole.RECIPIENT,
            referral_code="MEMBER01",
            created_at=datetime.utcnow(),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        headers = {"Authorization": f"Bearer {_admin_token(admin)}"}
        with patch("backend.app._community_name_for_id", new=AsyncMock(return_value="Ruby Bridges")):
            res = client.put(
                f"/api/admin/users/{user.id}/community",
                headers=headers,
                json={"community_id": 8},
            )
        assert res.status_code == 200, res.text
        assert res.json()["community_id"] == 8
        db_session.refresh(user)
        assert user.community_id == 8


class TestFrontendParity:
    def test_auth_modal_requires_approval_code(self):
        text = AUTH_MODAL.read_text(encoding="utf-8")
        assert "approvalCode" in text
        assert "/api/approval-codes/validate" in text
        assert "approval_code" in text

    def test_database_js_sends_approval_code(self):
        text = (REPO_ROOT / "frontend" / "js" / "lib" / "database.js").read_text(encoding="utf-8")
        assert "approval_code: userData.approval_code" in text

    def test_admin_panel_has_approval_tab(self):
        text = ADMIN_PANEL.read_text(encoding="utf-8")
        assert "approval_codes" in text
        assert "/api/admin/approval-codes" in text
        assert "assignUserCommunity" in text

    def test_user_profile_shows_community(self):
        text = USER_PROFILE.read_text(encoding="utf-8")
        assert "communityInfo" in text
        assert "Set by your signup approval code" in text
        assert "data?.token" in text or "data.token" in text


class TestMigrationScript:
    def test_migrate_creates_table_on_sqlite(self, tmp_path):
        db_path = tmp_path / "approval_mig.db"
        url = f"sqlite:///{db_path}"
        engine = create_engine(url)
        with engine.begin() as conn:
            conn.exec_driver_sql(
                "CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255))"
            )
        engine.dispose()
        migrate(database_url=url)
        engine = create_engine(url)
        from sqlalchemy import inspect

        insp = inspect(engine)
        assert insp.has_table("approval_codes")
        cols = {c["name"] for c in insp.get_columns("users")}
        assert "community_id" in cols
        assert "approval_number" in cols
        engine.dispose()
