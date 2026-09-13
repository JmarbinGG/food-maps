"""AI broadcast admin gate must honor durable is_admin privilege."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from backend.ai import routes as ai_routes
from backend.ai.routes import JWT_ALGORITHM, _require_admin
from backend.models import UserRole

_TEST_JWT_SECRET = "test-ai-broadcast-admin-secret"


def _creds(user_id: int) -> HTTPAuthorizationCredentials:
    token = jwt.encode(
        {"sub": str(user_id)},
        _TEST_JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _mock_db_user(*, role: UserRole, is_admin=None, user_id: int = 42):
    u = MagicMock()
    u.id = user_id
    u.role = role
    u.is_admin = is_admin
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = u
    db.close = MagicMock()
    return db, u


@pytest.fixture(autouse=True)
def _jwt_secret():
    with patch.object(ai_routes, "JWT_SECRET", _TEST_JWT_SECRET):
        yield


class TestRequireAdminBroadcast:
    def test_donor_with_is_admin_true_allowed(self):
        db, _ = _mock_db_user(role=UserRole.DONOR, is_admin=True, user_id=7)
        with patch("backend.app.SessionLocal", return_value=db):
            assert _require_admin(_creds(7)) == 7

    def test_donor_without_is_admin_forbidden(self):
        db, _ = _mock_db_user(role=UserRole.DONOR, is_admin=False, user_id=8)
        with patch("backend.app.SessionLocal", return_value=db):
            with pytest.raises(HTTPException) as exc:
                _require_admin(_creds(8))
            assert exc.value.status_code == 403

    def test_legacy_role_admin_allowed(self):
        db, _ = _mock_db_user(role=UserRole.ADMIN, is_admin=None, user_id=9)
        with patch("backend.app.SessionLocal", return_value=db):
            assert _require_admin(_creds(9)) == 9

    def test_missing_credentials_unauthorized(self):
        with pytest.raises(HTTPException) as exc:
            _require_admin(None)
        assert exc.value.status_code == 401
