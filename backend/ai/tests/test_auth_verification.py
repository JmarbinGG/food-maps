"""Regression tests for Bearer-token verification on /api/ai/* routes.

Food Maps AI auth is JWT-only (``JWT_SECRET`` HS256). Supabase JWT /
GoTrue verification paths have been removed.
"""
from __future__ import annotations

import asyncio
import time
from unittest.mock import patch

import jwt
import pytest
from fastapi.security import HTTPAuthorizationCredentials

from backend.ai import routes as ai_routes


def _bearer(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _mint_hs256(secret: str, sub: str, extra: dict | None = None) -> str:
    payload = {"sub": sub, "exp": int(time.time()) + 3600}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, secret, algorithm="HS256")


class TestLocalJwtSecret:
    """Tokens minted with our own JWT_SECRET must verify offline."""

    def test_valid_local_token_returns_sub(self):
        token = _mint_hs256(ai_routes.JWT_SECRET, "user-123")
        result = asyncio.run(ai_routes._auth_user_id_async(_bearer(token)))
        assert result == "user-123"

    def test_expired_local_token_returns_none(self):
        payload = {"sub": "user-123", "exp": int(time.time()) - 60}
        token = jwt.encode(payload, ai_routes.JWT_SECRET, algorithm="HS256")
        result = asyncio.run(ai_routes._auth_user_id_async(_bearer(token)))
        assert result is None

    def test_wrong_signature_returns_none(self):
        token = _mint_hs256("not-our-secret", "user-123")
        result = asyncio.run(ai_routes._auth_user_id_async(_bearer(token)))
        assert result is None

    def test_missing_credentials_returns_none(self):
        result = asyncio.run(ai_routes._auth_user_id_async(None))
        assert result is None

    def test_supabase_style_token_rejected_without_local_secret(self):
        """Tokens signed with a foreign (e.g. former Supabase) secret fail."""
        foreign = "supabase-project-jwt-secret-abcdef123456"
        token = _mint_hs256(
            foreign,
            "56e3c110-8e22-4756-b98e-02d2d5c81a36",
            extra={"aud": "authenticated", "role": "authenticated"},
        )
        result = asyncio.run(ai_routes._auth_user_id_async(_bearer(token)))
        assert result is None


class TestRequireOwnerAsync:
    """`_require_owner` glues the token verification to the requested user_id."""

    def test_matching_local_token_accepted(self):
        token = _mint_hs256(ai_routes.JWT_SECRET, "u-1")
        # AI_REQUIRE_AUTH is "false" in test env, but ownership still checks.
        asyncio.run(ai_routes._require_owner(_bearer(token), "u-1"))

    def test_mismatched_local_token_403(self):
        from fastapi import HTTPException
        token = _mint_hs256(ai_routes.JWT_SECRET, "u-1")
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(ai_routes._require_owner(_bearer(token), "u-2"))
        assert exc_info.value.status_code == 403

    def test_foreign_token_does_not_satisfy_owner(self):
        """A non-local JWT must not authenticate as the requested user."""
        from fastapi import HTTPException
        foreign = "supabase-project-jwt-secret-abcdef123456"
        token = _mint_hs256(foreign, "u-1")
        # With AI_REQUIRE_AUTH=false, no token decode → ownership skipped when
        # auth_uid is None. Force auth-required path for this assertion.
        with patch.object(ai_routes, "AI_REQUIRE_AUTH", True):
            with pytest.raises(HTTPException) as exc_info:
                asyncio.run(ai_routes._require_owner(_bearer(token), "u-1"))
            assert exc_info.value.status_code == 401
