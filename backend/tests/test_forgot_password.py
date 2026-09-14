"""Forgot / reset password API and frontend contract tests."""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import (  # noqa: E402
    app,
    forgot_password_attempts_by_key,
    generate_reset_code,
    login_attempts_by_key,
    password_reset_codes,
    pwd_context,
    reset_password_attempts_by_key,
    signup_attempts_by_ip,
)
from backend.db import get_db  # noqa: E402
from backend.models import Base, User, UserRole  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
FORGOT_MODAL = REPO_ROOT / "frontend" / "js" / "components" / "auth" / "ForgotPasswordModal.js"


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
    forgot_password_attempts_by_key.clear()
    reset_password_attempts_by_key.clear()
    password_reset_codes.clear()

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
    forgot_password_attempts_by_key.clear()
    reset_password_attempts_by_key.clear()
    password_reset_codes.clear()


def _make_user(db_session, *, email="resetme@example.com", password="OldPass123!"):
    user = User(
        email=email,
        name="Reset User",
        password_hash=pwd_context.hash(password),
        role=UserRole.RECIPIENT,
        referral_code="RESET01",
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class TestResetCodeHelper:
    def test_six_digit_numeric(self):
        code = generate_reset_code(6)
        assert len(code) == 6
        assert code.isdigit()


# ---------------------------------------------------------------------------
# POST /api/user/forgot-password
# ---------------------------------------------------------------------------


class TestForgotPassword:
    def test_unknown_email_still_succeeds(self, client):
        with patch("backend.app.send_reset_email") as send:
            res = client.post(
                "/api/user/forgot-password",
                json={"email": "nobody@example.com"},
            )
        assert res.status_code == 200
        assert res.json()["success"] is True
        send.assert_not_called()
        assert password_reset_codes == {}

    def test_known_email_stores_code_and_sends_mail(self, client, db_session):
        _make_user(db_session, email="ResetMe@example.com")
        with patch("backend.app.generate_reset_code", return_value="654321"), patch(
            "backend.app.send_reset_email"
        ) as send:
            res = client.post(
                "/api/user/forgot-password",
                json={"email": "  RESETME@EXAMPLE.COM "},
            )
        assert res.status_code == 200, res.text
        assert res.json()["success"] is True
        assert "resetme@example.com" in password_reset_codes
        assert password_reset_codes["resetme@example.com"]["code"] == "654321"
        expires = password_reset_codes["resetme@example.com"]["expires_at"]
        assert expires > datetime.utcnow()
        send.assert_called_once()
        assert send.call_args[0][0] == "resetme@example.com"
        assert send.call_args[0][1] == "654321"
        assert send.call_args[0][2] == "Reset User"

    def test_invalid_email_rejected(self, client):
        res = client.post("/api/user/forgot-password", json={"email": "not-an-email"})
        assert res.status_code == 422

    def test_email_failure_is_503_when_not_local(self, client, db_session):
        _make_user(db_session)
        with patch.dict(os.environ, {"PUBLIC_BASE_URL": "https://foodmaps.com"}, clear=False), patch(
            "backend.app.send_reset_email", side_effect=RuntimeError("smtp down")
        ):
            res = client.post(
                "/api/user/forgot-password",
                json={"email": "resetme@example.com"},
            )
        assert res.status_code == 503

    def test_email_failure_is_ok_on_localhost(self, client, db_session):
        _make_user(db_session)
        with patch.dict(os.environ, {"PUBLIC_BASE_URL": "http://localhost:8000"}, clear=False), patch(
            "backend.app.send_reset_email", side_effect=RuntimeError("smtp down")
        ):
            res = client.post(
                "/api/user/forgot-password",
                json={"email": "resetme@example.com"},
            )
        assert res.status_code == 200
        assert res.json()["success"] is True
        assert "resetme@example.com" in password_reset_codes

    def test_rate_limit(self, client):
        with patch("backend.app.FORGOT_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS", 2), patch(
            "backend.app.send_reset_email"
        ):
            assert client.post(
                "/api/user/forgot-password",
                json={"email": "a@example.com"},
            ).status_code == 200
            assert client.post(
                "/api/user/forgot-password",
                json={"email": "a@example.com"},
            ).status_code == 200
            limited = client.post(
                "/api/user/forgot-password",
                json={"email": "a@example.com"},
            )
        assert limited.status_code == 429


# ---------------------------------------------------------------------------
# POST /api/user/reset-password
# ---------------------------------------------------------------------------


class TestResetPassword:
    def _prime(self, email="resetme@example.com", code="123456"):
        password_reset_codes[_normalize := email.lower()] = {
            "code": code,
            "expires_at": datetime.utcnow() + timedelta(minutes=15),
        }

    def test_success_then_login_with_new_password(self, client, db_session):
        _make_user(db_session, password="OldPass123!")
        self._prime()
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "ResetMe@example.com",
                "code": "123456",
                "new_password": "NewPass456!",
            },
        )
        assert res.status_code == 200, res.text
        assert res.json()["success"] is True
        assert "resetme@example.com" not in password_reset_codes

        old = client.post(
            "/api/user/login",
            json={"email": "resetme@example.com", "password": "OldPass123!"},
        )
        assert old.status_code == 401
        new = client.post(
            "/api/user/login",
            json={"email": "resetme@example.com", "password": "NewPass456!"},
        )
        assert new.status_code == 200
        assert new.json().get("token")

    def test_wrong_code_rejected(self, client, db_session):
        _make_user(db_session)
        self._prime()
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "000000",
                "new_password": "NewPass456!",
            },
        )
        assert res.status_code == 400
        assert "invalid" in res.json()["detail"].lower()
        user = db_session.query(User).filter(User.email == "resetme@example.com").first()
        assert pwd_context.verify("OldPass123!", user.password_hash)

    def test_missing_code_store_rejected(self, client, db_session):
        _make_user(db_session)
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "NewPass456!",
            },
        )
        assert res.status_code == 400
        assert "expired" in res.json()["detail"].lower() or "invalid" in res.json()["detail"].lower()

    def test_expired_code_rejected_and_cleared(self, client, db_session):
        _make_user(db_session)
        password_reset_codes["resetme@example.com"] = {
            "code": "123456",
            "expires_at": datetime.utcnow() - timedelta(minutes=1),
        }
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "NewPass456!",
            },
        )
        assert res.status_code == 400
        assert "expired" in res.json()["detail"].lower()
        assert "resetme@example.com" not in password_reset_codes

    def test_weak_password_rejected(self, client, db_session):
        _make_user(db_session)
        self._prime()
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "short",
            },
        )
        assert res.status_code == 400
        assert "password" in res.json()["detail"].lower()
        assert "resetme@example.com" in password_reset_codes

    def test_code_cannot_be_reused(self, client, db_session):
        _make_user(db_session)
        self._prime()
        first = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "NewPass456!",
            },
        )
        assert first.status_code == 200
        second = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "Another789!",
            },
        )
        assert second.status_code == 400

    def test_user_deleted_after_code_issued(self, client, db_session):
        user = _make_user(db_session)
        self._prime()
        db_session.delete(user)
        db_session.commit()
        res = client.post(
            "/api/user/reset-password",
            json={
                "email": "resetme@example.com",
                "code": "123456",
                "new_password": "NewPass456!",
            },
        )
        assert res.status_code == 404

    def test_reset_rate_limit(self, client):
        with patch("backend.app.RESET_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS", 2):
            for _ in range(2):
                assert client.post(
                    "/api/user/reset-password",
                    json={
                        "email": "nobody@example.com",
                        "code": "111111",
                        "new_password": "NewPass456!",
                    },
                ).status_code == 400
            limited = client.post(
                "/api/user/reset-password",
                json={
                    "email": "nobody@example.com",
                    "code": "111111",
                    "new_password": "NewPass456!",
                },
            )
        assert limited.status_code == 429


class TestForgotPasswordFrontend:
    def test_modal_posts_both_endpoints(self):
        text = FORGOT_MODAL.read_text(encoding="utf-8")
        assert "/api/user/forgot-password" in text
        assert "/api/user/reset-password" in text
        assert "new_password" in text
        assert "trim().toLowerCase()" in text
        assert "Password must be at least 8 characters" in text
