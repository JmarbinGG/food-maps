"""Auth privilege and JWT session regression tests."""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import (  # noqa: E402
    app,
    pwd_context,
    JWT_SECRET,
    JWT_ALGORITHM,
    _issue_user_token,
    signup_attempts_by_ip,
    login_attempts_by_key,
)
from backend.db import get_db  # noqa: E402
from backend.models import Base, User, UserRole  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
AUTH_CONTEXT = REPO_ROOT / "frontend" / "nouri" / "utils" / "AuthContext.jsx"
AUTH_MODAL = REPO_ROOT / "frontend" / "js" / "components" / "auth" / "AuthModal.js"
APP_JS = REPO_ROOT / "frontend" / "js" / "app.js"


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
    login_attempts_by_key.clear()


def _make_user(db_session, *, email, role=UserRole.RECIPIENT, is_admin=False, password="Password123!"):
    user = User(
        email=email,
        name="Test User",
        password_hash=pwd_context.hash(password),
        role=role,
        is_admin=is_admin,
        referral_code=email.split("@")[0].upper()[:8],
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestNoJwtIsAdminHeal:
    def test_me_does_not_restore_revoked_admin(self, client, db_session):
        user = _make_user(db_session, email="revoked@example.com", role=UserRole.DONOR, is_admin=False)
        # Craft a JWT that still claims is_admin (stolen/old token after revoke)
        now = datetime.utcnow()
        forged = jwt.encode(
            {
                "sub": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": "donor",
                "is_admin": True,
                "iat": now,
                "exp": now + timedelta(hours=2),
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        if isinstance(forged, bytes):
            forged = forged.decode("utf-8")

        res = client.get("/api/user/me", headers={"Authorization": f"Bearer {forged}"})
        assert res.status_code == 200, res.text
        assert res.json()["is_admin"] is False

        db_session.refresh(user)
        assert user.is_admin is not True

    def test_profile_put_does_not_restore_revoked_admin(self, client, db_session):
        user = _make_user(db_session, email="revoked2@example.com", role=UserRole.DONOR, is_admin=False)
        now = datetime.utcnow()
        forged = jwt.encode(
            {
                "sub": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": "donor",
                "is_admin": True,
                "iat": now,
                "exp": now + timedelta(hours=2),
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        if isinstance(forged, bytes):
            forged = forged.decode("utf-8")

        res = client.put(
            "/api/user/profile",
            headers={"Authorization": f"Bearer {forged}"},
            json={"name": "Still Donor", "role": "admin"},
        )
        assert res.status_code == 200, res.text
        # Cannot escalate to admin via JWT claim alone
        assert res.json()["role"] == "donor"
        assert res.json()["is_admin"] is False
        db_session.refresh(user)
        assert user.is_admin is not True
        assert user.role == UserRole.DONOR


class TestProfileReissuesJwt:
    def test_role_change_returns_fresh_token(self, client, db_session):
        user = _make_user(
            db_session,
            email="switcher@example.com",
            role=UserRole.RECIPIENT,
            is_admin=True,
        )
        # Active role recipient but durable admin
        user.role = UserRole.RECIPIENT
        db_session.commit()
        token = _issue_user_token(user)

        res = client.put(
            "/api/user/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={"role": "donor", "name": user.name, "email": user.email},
        )
        assert res.status_code == 200, res.text
        body = res.json()
        assert body["role"] == "donor"
        assert "token" in body and body["token"]
        new_payload = jwt.decode(body["token"], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        assert new_payload["role"] == "donor"
        assert new_payload["is_admin"] is True

    def test_legacy_admin_none_flag_can_switch_away_and_restore(self, client, db_session):
        """role=admin with is_admin unset must stamp privilege on first switch."""
        from sqlalchemy import text

        user = _make_user(
            db_session,
            email="legacy-admin@example.com",
            role=UserRole.ADMIN,
            is_admin=False,
        )
        # Simulate pre-backfill rows where the column is NULL (not False).
        db_session.execute(
            text("UPDATE users SET is_admin = NULL WHERE id = :id"),
            {"id": user.id},
        )
        db_session.commit()
        db_session.refresh(user)
        assert user.is_admin is None
        token = _issue_user_token(user)
        assert jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])["is_admin"] is True

        away = client.put(
            "/api/user/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={"role": "donor", "name": user.name, "email": user.email},
        )
        assert away.status_code == 200, away.text
        away_body = away.json()
        assert away_body["role"] == "donor"
        assert away_body["is_admin"] is True
        db_session.refresh(user)
        assert user.role == UserRole.DONOR
        assert user.is_admin is True

        donor_token = away_body["token"]
        back = client.put(
            "/api/user/profile",
            headers={"Authorization": f"Bearer {donor_token}"},
            json={"role": "admin", "name": user.name, "email": user.email},
        )
        assert back.status_code == 200, back.text
        back_body = back.json()
        assert back_body["role"] == "admin"
        assert back_body["is_admin"] is True
        db_session.refresh(user)
        assert user.role == UserRole.ADMIN
        assert user.is_admin is True
        restored = jwt.decode(back_body["token"], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        assert restored["role"] == "admin"
        assert restored["is_admin"] is True


class TestFrontendAuthParity:
    def test_auth_context_requires_token(self):
        text = AUTH_CONTEXT.read_text(encoding="utf-8")
        assert "if (!token)" in text
        assert "{ ...stored, ...jwtUser" in text
        assert "clearStoredUser" in text

    def test_auth_modal_no_tokenless_fallback(self):
        text = AUTH_MODAL.read_text(encoding="utf-8")
        assert "sign-in failed" in text.lower() or "Account created, but sign-in failed" in text
        assert "persist local user object (no token)" not in text

    def test_app_js_requires_token_on_hydrate(self):
        text = APP_JS.read_text(encoding="utf-8")
        assert "auth_token" in text
        assert "localStorage.removeItem('current_user')" in text
