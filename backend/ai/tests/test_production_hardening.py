"""Regression tests for the Nouri production-readiness fixes.

Covers: structured AI errors surviving the 5xx redaction handler, request
size limits for AI routes, CORS origins, the local seed-account guard, SMS
broadcast/reminder failure handling, feedback ownership, clear_history with
feedback rows, the fail-closed role guard, and the OpenAI retry helper.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import app as app_module
from backend.ai import ai_engine
from backend.ai.errors import AITimeout
from backend.ai.models import AIConversation, AIFeedback, AIReminder
from backend.models import Base, User, UserRole


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    with patch.object(app_module, "SessionLocal", factory):
        yield factory
    engine.dispose()


# ---------------------------------------------------------------------------
# app.py: error handler, size limits, CORS, seed guard
# ---------------------------------------------------------------------------

def test_ai_error_body_survives_5xx_redaction():
    resp = app_module._http_exception_response(AITimeout("en"))
    assert resp.status_code == 504
    assert b'"error_code":"timeout"' in resp.body
    assert b'"retryable":true' in resp.body


def test_generic_5xx_is_still_redacted():
    resp = app_module._http_exception_response(HTTPException(500, "secret stack detail"))
    assert b"secret" not in resp.body
    assert b"Internal server error" in resp.body


@pytest.mark.parametrize("path,minimum", [
    ("/api/ai/vision-listing", 8 * 1024 * 1024),
    ("/api/ai/transcribe", 25 * 1024 * 1024),
    ("/api/ai/chat", 200_000),
    ("/api/ai/bulk-listings", 256 * 1024),
])
def test_ai_routes_accept_their_real_payload_sizes(path, minimum):
    assert app_module._max_body_bytes_for(path) > minimum


def test_other_api_routes_keep_the_small_body_cap():
    assert app_module._max_body_bytes_for("/api/user/login") == app_module.MAX_API_BODY_BYTES


def test_cors_defaults_to_site_and_public_base_url(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://staging.example.org/")
    origins = app_module._cors_origins()
    assert "https://dogoodfoodmaps.com" in origins
    assert "https://staging.example.org" in origins
    assert "*" not in origins


def test_cors_env_override(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://a.example, https://b.example/")
    assert app_module._cors_origins() == ["https://a.example", "https://b.example"]


@pytest.mark.parametrize("db_url,allow,secret", [
    ("mysql+pymysql://u:p@h/db", "true", ""),     # real DB, stray flag
    ("sqlite:///x.db", "", ""),                   # sqlite but flag off
    ("sqlite:///x.db", "true", "prod/env"),       # AWS-managed host
])
def test_seed_accounts_never_created_outside_local_sqlite(monkeypatch, db_url, allow, secret):
    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("ALLOW_SQLITE", allow)
    monkeypatch.setenv("AWS_SECRET_NAME", secret)
    db = MagicMock()
    with patch.object(app_module, "_find_user_by_email") as find:
        app_module._ensure_local_sqlite_users(db)
    find.assert_not_called()
    db.add.assert_not_called()


# ---------------------------------------------------------------------------
# Broadcast SMS text and reminders
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_broadcast_never_uses_canned_error_text():
    from backend.ai import notifications

    canned = ai_engine.get_canned_response("api_down", "en")
    with patch.object(ai_engine, "OPENAI_API_KEY", "sk-test"), patch.object(
        ai_engine.conversation_engine, "public_chat_reply", new=AsyncMock(return_value=canned)
    ):
        text = await notifications._ai_personalize(
            "Base template text. Reply STOP to opt out.", MagicMock(), MagicMock(title="Apples"), "en"
        )
    assert text == "Base template text. Reply STOP to opt out."


def _add_user(db, phone="+15105550100"):
    user = User(
        email="r@example.com", name="R", password_hash="x", role=UserRole.RECIPIENT,
        phone=phone, sms_consent_given=True, created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    return user


@pytest.mark.asyncio
async def test_failed_reminder_sms_is_requeued(session_factory):
    from backend.ai import routes

    db = session_factory()
    user = _add_user(db)
    db.add(AIReminder(user_id=str(user.id), message="Pick up apples",
                      trigger_time=datetime.utcnow() - timedelta(minutes=1)))
    db.commit()

    with patch.object(routes, "_send_sms_via_main_app", new=AsyncMock(return_value=False)):
        await routes.process_pending_reminders()

    db.expire_all()
    r = db.query(AIReminder).one()
    assert r.sent is False
    assert r.sent_at is not None  # marks the first failed attempt
    assert r.trigger_time > datetime.utcnow()
    db.close()


@pytest.mark.asyncio
async def test_reminder_retries_stop_after_window(session_factory):
    from backend.ai import routes

    db = session_factory()
    user = _add_user(db)
    db.add(AIReminder(
        user_id=str(user.id), message="Pick up apples", sent=False,
        sent_at=datetime.utcnow() - routes.REMINDER_RETRY_WINDOW - timedelta(minutes=1),
        trigger_time=datetime.utcnow() - timedelta(minutes=1),
    ))
    db.commit()

    with patch.object(routes, "_send_sms_via_main_app", new=AsyncMock(return_value=False)):
        await routes.process_pending_reminders()

    db.expire_all()
    assert db.query(AIReminder).one().sent is True
    db.close()


@pytest.mark.asyncio
async def test_successful_reminder_is_marked_sent(session_factory):
    from backend.ai import routes

    db = session_factory()
    user = _add_user(db)
    db.add(AIReminder(user_id=str(user.id), message="Pick up apples",
                      trigger_time=datetime.utcnow() - timedelta(minutes=1)))
    db.commit()

    with patch.object(routes, "_send_sms_via_main_app", new=AsyncMock(return_value=True)):
        await routes.process_pending_reminders()

    db.expire_all()
    assert db.query(AIReminder).one().sent is True
    db.close()


# ---------------------------------------------------------------------------
# Feedback ownership and clear_history
# ---------------------------------------------------------------------------

@pytest.fixture()
def owner_18():
    with patch("backend.ai.routes._auth_user_id", return_value="18"), patch(
        "backend.ai.routes.check_rate_limit", return_value=True
    ):
        yield


def _add_conversation(db, user_id):
    row = AIConversation(user_id=user_id, role="assistant", message="hi")
    db.add(row)
    db.commit()
    return row.id


def test_feedback_on_own_conversation_is_saved(session_factory, owner_18):
    db = session_factory()
    conv_id = _add_conversation(db, "18")
    client = TestClient(app_module.app, raise_server_exceptions=False)
    resp = client.post("/api/ai/feedback", json={
        "conversation_id": str(conv_id), "user_id": "18", "rating": "up",
    })
    assert resp.status_code == 200, resp.text
    assert db.query(AIFeedback).count() == 1
    db.close()


def test_feedback_on_someone_elses_conversation_is_404(session_factory, owner_18):
    db = session_factory()
    conv_id = _add_conversation(db, "99")
    client = TestClient(app_module.app, raise_server_exceptions=False)
    resp = client.post("/api/ai/feedback", json={
        "conversation_id": str(conv_id), "user_id": "18", "rating": "up",
    })
    assert resp.status_code == 404
    assert db.query(AIFeedback).count() == 0
    db.close()


@pytest.mark.asyncio
async def test_clear_history_removes_feedback_rows_too(session_factory):
    db = session_factory()
    conv_id = _add_conversation(db, "18")
    db.add(AIFeedback(conversation_id=conv_id, user_id="18", rating="up"))
    db.commit()

    removed = await ai_engine.conversation_engine.clear_history("18")

    assert removed == 1
    assert db.query(AIFeedback).count() == 0
    assert db.query(AIConversation).count() == 0
    db.close()


# ---------------------------------------------------------------------------
# Role guard
# ---------------------------------------------------------------------------

@pytest.mark.strict_role_lookup
@pytest.mark.asyncio
async def test_post_is_blocked_when_role_cannot_be_determined():
    from backend.ai import role_guards

    with patch("backend.ai.tools._get_user_profile", new=AsyncMock(side_effect=RuntimeError("db down"))):
        with pytest.raises(role_guards.RoleLookupError):
            await role_guards.check_role_allows_tool("18", "post_food_listing")


@pytest.mark.strict_role_lookup
@pytest.mark.asyncio
async def test_read_tools_skip_the_role_lookup():
    from backend.ai import role_guards

    with patch("backend.ai.tools._get_user_profile", new=AsyncMock(side_effect=RuntimeError("db down"))):
        assert await role_guards.check_role_allows_tool("18", "get_user_dashboard") is None


# ---------------------------------------------------------------------------
# OpenAI retry helper
# ---------------------------------------------------------------------------

def _response(status, json_body=None, headers=None):
    return httpx.Response(
        status, json=json_body or {}, headers=headers or {},
        request=httpx.Request("POST", "https://api.openai.com/v1/chat/completions"),
    )


@pytest.fixture()
def fresh_circuit():
    with patch.object(ai_engine, "_circuit", ai_engine.CircuitBreaker()):
        yield ai_engine._circuit


@pytest.mark.asyncio
async def test_model_not_found_falls_back_to_next_model(fresh_circuit):
    seen_models = []

    async def fake_request(method, url, **kwargs):
        seen_models.append(kwargs["json"]["model"])
        if kwargs["json"]["model"] == ai_engine.CHAT_MODEL:
            return _response(404, {"error": {"code": "model_not_found", "message": "no such model"}})
        return _response(200, {"choices": [{"message": {"content": "ok"}}]})

    client = MagicMock(request=AsyncMock(side_effect=fake_request))
    with patch.object(ai_engine, "_get_http_client", return_value=client):
        resp = await ai_engine._openai_with_retry(
            "POST", "https://api.openai.com/v1/chat/completions",
            headers={}, json_payload={"model": ai_engine.CHAT_MODEL, "messages": []},
        )
    assert resp.status_code == 200
    assert seen_models[0] == ai_engine.CHAT_MODEL
    assert seen_models[1] == ai_engine._MODEL_FALLBACKS[ai_engine.CHAT_MODEL][0]


@pytest.mark.asyncio
async def test_per_request_timeout_is_passed_and_no_sleep_after_last_attempt(fresh_circuit):
    client = MagicMock(request=AsyncMock(return_value=_response(503)))
    sleep = AsyncMock()
    with patch.object(ai_engine, "_get_http_client", return_value=client), patch.object(
        ai_engine.asyncio, "sleep", sleep
    ):
        with pytest.raises(RuntimeError, match="HTTP 503"):
            await ai_engine._openai_with_retry(
                "POST", "https://x", headers={}, json_payload={"model": "m"}, timeout=60, retries=2,
            )
    assert client.request.await_count == 2
    assert all(c.kwargs["timeout"] == 60 for c in client.request.await_args_list)
    assert sleep.await_count == 1


@pytest.mark.asyncio
async def test_open_circuit_short_circuits(fresh_circuit):
    for _ in range(fresh_circuit.failure_threshold):
        fresh_circuit.record_failure()
    client = MagicMock(request=AsyncMock())
    with patch.object(ai_engine, "_get_http_client", return_value=client):
        with pytest.raises(RuntimeError, match="circuit"):
            await ai_engine._openai_with_retry("POST", "https://x", headers={})
    client.request.assert_not_awaited()


def test_retry_after_header_is_honored_and_capped():
    assert ai_engine._retry_after_seconds(_response(429, headers={"retry-after": "3"}), 1) == 3
    assert ai_engine._retry_after_seconds(_response(429, headers={"retry-after": "999"}), 1) == 20
    assert ai_engine._retry_after_seconds(_response(429), 2) == 2
