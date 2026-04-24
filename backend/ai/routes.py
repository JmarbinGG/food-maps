"""
DoGoods AI — FastAPI router (mounted onto the main app).

Endpoints:
  POST /api/ai/chat            - Text conversation
  GET  /api/ai/history/{uid}   - Retrieve conversation history
  DELETE /api/ai/history/{uid} - Clear history
  POST /api/ai/voice           - Whisper transcribe + chat
  POST /api/ai/tts             - Text-to-speech
  POST /api/ai/feedback        - Rate a message
  GET  /api/ai/health          - Health check

Authentication: uses the main app's JWT (Bearer token). If the token's "sub"
matches the request body's user_id, the call is authorised.
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
from datetime import datetime, timezone

from typing import Optional

import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from backend.ai.ai_engine import (
    conversation_engine,
    check_rate_limit,
    close_http_client,
)

logger = logging.getLogger("ai_routes")

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

REMINDER_CHECK_INTERVAL = int(os.getenv("REMINDER_CHECK_INTERVAL", "900"))

router = APIRouter(prefix="/api/ai", tags=["ai"])
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _enforce_rate_limit(request: Request) -> None:
    if not check_rate_limit(_client_ip(request)):
        raise HTTPException(429, "Rate limit exceeded. Try again later.")


def _parse_user_id(raw: str) -> int:
    """Coerce the string user_id into an integer (MySQL PK)."""
    if raw is None:
        raise HTTPException(400, "user_id required")
    try:
        return int(str(raw))
    except (ValueError, TypeError):
        raise HTTPException(400, "user_id must be an integer")


def _auth_user_id(credentials: HTTPAuthorizationCredentials | None) -> int | None:
    """Extract user_id from a JWT Bearer token. Returns None if no/invalid token."""
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (jwt.PyJWTError, ValueError, TypeError):
        return None


def _check_ownership(auth_uid: int | None, requested_uid: int) -> None:
    if auth_uid is not None and auth_uid != requested_uid:
        raise HTTPException(403, "user_id does not match authenticated user")


# ---------------------------------------------------------------------------
# Pydantic request/response schemas
# ---------------------------------------------------------------------------

class AIChatRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    message: str = Field(min_length=1, max_length=5000)
    include_audio: bool = False


class AIChatResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None
    user_id: str
    lang: str = "en"
    conversation_id: Optional[str] = None
    transcript: Optional[str] = None
    timestamp: str


class AIFeedbackRequest(BaseModel):
    conversation_id: str = Field(min_length=1, max_length=32)
    user_id: str = Field(min_length=1, max_length=32)
    rating: str = Field(min_length=1, max_length=20)
    comment: Optional[str] = None


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    lang: str = "en"


class AIPublicChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1500)


class AIPublicChatResponse(BaseModel):
    text: str
    lang: str = "en"
    timestamp: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/health")
async def ai_health() -> dict:
    from backend.ai.ai_engine import OPENAI_API_KEY, CHAT_MODEL, _circuit
    return {
        "status": "ok",
        "openai_configured": bool(OPENAI_API_KEY),
        "chat_model": CHAT_MODEL,
        "circuit_state": _circuit.state.value,
    }


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    body: AIChatRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    _enforce_rate_limit(request)
    uid = _parse_user_id(body.user_id)
    _check_ownership(_auth_user_id(credentials), uid)

    try:
        return await conversation_engine.chat(
            user_id=uid,
            message=body.message,
            include_audio=body.include_audio,
        )
    except RuntimeError as exc:
        logger.error("AI chat RuntimeError: %s", exc)
        raise HTTPException(503, "AI service temporarily unavailable") from exc
    except Exception as exc:
        logger.exception("AI chat error")
        raise HTTPException(500, "Internal AI error") from exc


@router.post("/public_chat", response_model=AIPublicChatResponse)
async def ai_public_chat(
    body: AIPublicChatRequest,
    request: Request,
) -> dict:
    """Anonymous chat for landing page visitors.

    - No authentication required
    - No conversation history stored
    - No tools / user-specific data access
    - IP-based rate limited
    """
    _enforce_rate_limit(request)

    from backend.ai.ai_engine import detect_spanish

    lang = "es" if detect_spanish(body.message) else "en"
    messages = [
        {"role": "system", "content": conversation_engine.system_prompt},
        {
            "role": "system",
            "content": (
                "You are talking to an anonymous visitor on the FoodMaps landing page. "
                "They are not signed in. Do NOT call any tools. Do NOT ask for or reference "
                "their account, pickups, listings, or reminders. Answer general questions about "
                "how FoodMaps works, food sharing, food safety, and community impact. "
                "Keep replies concise (2-4 sentences) and friendly. If they need account-specific "
                "help, politely suggest they sign up or sign in."
            ),
        },
        {"role": "user", "content": body.message},
    ]
    if lang == "es":
        messages.insert(1, {
            "role": "system",
            "content": "The user wrote in Spanish. Respond entirely in Spanish.",
        })

    try:
        text = await conversation_engine.public_chat_reply(messages, lang=lang)
    except Exception as exc:
        logger.exception("Public chat error")
        raise HTTPException(500, "AI service error") from exc

    return {
        "text": text,
        "lang": lang,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/history/{user_id}")
async def ai_history(
    user_id: str,
    request: Request,
    limit: int = 50,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    _enforce_rate_limit(request)
    uid = _parse_user_id(user_id)
    _check_ownership(_auth_user_id(credentials), uid)

    if limit < 1 or limit > 200:
        raise HTTPException(400, "limit must be between 1 and 200")

    try:
        history = await conversation_engine.get_conversation_history(uid, limit=limit)
        return {"user_id": user_id, "messages": history, "count": len(history)}
    except Exception as exc:
        logger.exception("History fetch error")
        raise HTTPException(500, "Failed to retrieve conversation history") from exc


@router.delete("/history/{user_id}")
async def ai_clear_history(
    user_id: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    _enforce_rate_limit(request)
    uid = _parse_user_id(user_id)
    _check_ownership(_auth_user_id(credentials), uid)

    try:
        count = await conversation_engine.clear_history(uid)
        return {"user_id": user_id, "cleared": True, "removed": count}
    except Exception as exc:
        logger.exception("Clear history error")
        raise HTTPException(500, "Failed to clear conversation history") from exc


# ---- Whisper noise filter -------------------------------------------------

_WHISPER_NOISE_PHRASES = {
    "thanks for watching", "thank you for watching", "subscribe",
    "music", "[music]", "[applause]", "gracias por ver",
    "bye", "thank you", "thanks",
}


def _is_whisper_noise(text: str) -> bool:
    if not text:
        return True
    stripped = re.sub(r"[^\w\s]", "", text.strip().lower())
    if len(stripped) < 3:
        return True
    return stripped in _WHISPER_NOISE_PHRASES


@router.post("/voice", response_model=AIChatResponse)
async def ai_voice(
    request: Request,
    audio: UploadFile = File(...),
    user_id: str = Form(..., min_length=1, max_length=32),
    include_audio: bool = Form(default=True),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    _enforce_rate_limit(request)
    uid = _parse_user_id(user_id)
    _check_ownership(_auth_user_id(credentials), uid)

    allowed = {
        "audio/webm", "audio/wav", "audio/mpeg", "audio/mp4",
        "audio/ogg", "audio/x-m4a", "audio/mp3",
    }
    base_type = (audio.content_type or "").split(";")[0].strip().lower()
    if base_type and base_type not in allowed:
        raise HTTPException(400, f"Unsupported audio type: {audio.content_type}")

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(400, "Audio file too large (max 25MB)")
    if len(audio_bytes) == 0:
        raise HTTPException(400, "Empty audio file")

    try:
        transcript = await conversation_engine.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename or "audio.webm",
        )
        if _is_whisper_noise(transcript):
            raise HTTPException(400, "Could not understand the audio. Try again or switch to text.")

        result = await conversation_engine.chat(
            user_id=uid,
            message=transcript,
            include_audio=include_audio,
        )
        result["transcript"] = transcript
        return result
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(504, "Voice processing timed out. Try text input instead.")
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except Exception as exc:
        logger.exception("Voice processing error")
        raise HTTPException(500, "Voice processing failed.") from exc


@router.post("/tts")
async def ai_tts(
    body: TTSRequest,
    request: Request,
) -> dict:
    """Generate TTS audio as a base64 data URL."""
    _enforce_rate_limit(request)
    try:
        import base64
        audio_bytes = await conversation_engine.generate_speech(body.text, lang=body.lang)
        b64 = base64.b64encode(audio_bytes).decode("ascii")
        return {"audio_url": f"data:audio/mpeg;base64,{b64}", "lang": body.lang}
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except Exception as exc:
        logger.exception("TTS error")
        raise HTTPException(500, "TTS failed") from exc


@router.post("/feedback")
async def ai_feedback(
    body: AIFeedbackRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    _enforce_rate_limit(request)
    uid = _parse_user_id(body.user_id)
    _check_ownership(_auth_user_id(credentials), uid)

    try:
        conv_id = int(body.conversation_id)
    except (ValueError, TypeError):
        raise HTTPException(400, "conversation_id must be an integer")

    def _save():
        from backend.app import SessionLocal
        from backend.ai.models import AIFeedback
        db = SessionLocal()
        try:
            row = AIFeedback(
                conversation_id=conv_id,
                user_id=uid,
                rating=body.rating,
                comment=body.comment,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            return row.id
        except Exception as exc:
            db.rollback()
            logger.error("Feedback save failed: %s", exc)
            return None
        finally:
            db.close()

    feedback_id = await asyncio.get_event_loop().run_in_executor(None, _save)
    if feedback_id is None:
        raise HTTPException(500, "Failed to save feedback")
    return {"success": True, "feedback_id": feedback_id}


# ---------------------------------------------------------------------------
# Background reminder job
# ---------------------------------------------------------------------------

async def _send_sms_via_main_app(to_phone: str, message: str) -> bool:
    """Send SMS using the main app's Twilio service (sms_service.py)."""
    try:
        from backend.sms_service import send_sms_real  # type: ignore
    except ImportError:
        logger.warning("sms_service not available — skipping SMS to %s", to_phone)
        return False
    try:
        # run sync function in thread pool
        result = await asyncio.get_event_loop().run_in_executor(
            None, send_sms_real, to_phone, message
        )
        return bool(result)
    except Exception as exc:
        logger.error("SMS send failed: %s", exc)
        return False


async def process_pending_reminders() -> int:
    """Find due AIReminders, look up user phone, send SMS, mark sent."""
    from backend.app import SessionLocal
    from backend.models import User
    from backend.ai.models import AIReminder

    def _fetch_and_mark() -> list[dict]:
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            due = (
                db.query(AIReminder)
                .filter(AIReminder.sent == False)  # noqa: E712
                .filter(AIReminder.trigger_time <= now)
                .order_by(AIReminder.trigger_time.asc())
                .limit(50)
                .all()
            )
            tasks = []
            for r in due:
                user = db.query(User).filter(User.id == r.user_id).first()
                tasks.append({
                    "id": r.id,
                    "user_id": r.user_id,
                    "phone": user.phone if user else None,
                    "sms_consent": user.sms_consent_given if user else False,
                    "message": r.message,
                    "reminder_type": r.reminder_type,
                })
                r.sent = True
                r.sent_at = now
            db.commit()
            return tasks
        except Exception as exc:
            logger.error("Reminder fetch failed: %s", exc)
            db.rollback()
            return []
        finally:
            db.close()

    tasks = await asyncio.get_event_loop().run_in_executor(None, _fetch_and_mark)

    prefix_map = {
        "pickup": "🍎 Pickup Reminder",
        "listing_expiry": "⏰ Listing Expiry",
        "distribution_event": "📍 Event Reminder",
        "general": "📋 Reminder",
    }
    sent = 0
    for t in tasks:
        if t["phone"] and t["sms_consent"]:
            prefix = prefix_map.get(t["reminder_type"], "📋 Reminder")
            body = f"[FoodMaps] {prefix}: {t['message']}"
            if await _send_sms_via_main_app(t["phone"], body):
                sent += 1
        else:
            logger.info("Skipping SMS for reminder %s (no phone or no consent)", t["id"])

    if tasks:
        logger.info("Processed %d reminder(s), sent %d SMS", len(tasks), sent)
    return len(tasks)


async def reminder_loop() -> None:
    """Background loop with exponential backoff on failures."""
    logger.info("AI reminder loop started (interval=%ds)", REMINDER_CHECK_INTERVAL)
    consecutive_failures = 0
    while True:
        try:
            await process_pending_reminders()
            consecutive_failures = 0
        except Exception as exc:
            consecutive_failures += 1
            logger.error("Reminder loop error (#%d): %s", consecutive_failures, exc)

        if consecutive_failures > 0:
            backoff = min(REMINDER_CHECK_INTERVAL * (2 ** consecutive_failures), 3600)
            await asyncio.sleep(backoff)
        else:
            await asyncio.sleep(REMINDER_CHECK_INTERVAL)


# ---------------------------------------------------------------------------
# Startup/shutdown hooks the main app can call
# ---------------------------------------------------------------------------

_background_task: asyncio.Task | None = None
_broadcast_task: asyncio.Task | None = None


async def start_background_jobs() -> None:
    global _background_task, _broadcast_task
    if _background_task is None or _background_task.done():
        _background_task = asyncio.create_task(reminder_loop())
        logger.info("AI reminder loop scheduled")
    if _broadcast_task is None or _broadcast_task.done():
        try:
            from backend.ai.notifications import broadcast_loop
            _broadcast_task = asyncio.create_task(broadcast_loop())
            logger.info("AI broadcast loop scheduled")
        except Exception as exc:
            logger.error("Failed to start broadcast loop: %s", exc)


async def stop_background_jobs() -> None:
    global _background_task, _broadcast_task
    for name, task in (("reminder", _background_task), ("broadcast", _broadcast_task)):
        if task is not None and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            logger.info("AI %s loop stopped", name)
    _background_task = None
    _broadcast_task = None
    await close_http_client()


# ---------------------------------------------------------------------------
# Admin-facing broadcast endpoints
# ---------------------------------------------------------------------------

def _require_admin(credentials: HTTPAuthorizationCredentials | None) -> int:
    """Return the admin user_id or raise 401/403."""
    if credentials is None:
        raise HTTPException(401, "Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(401, "Invalid token") from exc
    sub = payload.get("sub")
    try:
        uid = int(sub)
    except (TypeError, ValueError) as exc:
        raise HTTPException(401, "Invalid token") from exc

    def _check():
        from backend.app import SessionLocal
        from backend.models import User, UserRole
        db = SessionLocal()
        try:
            u = db.query(User).filter(User.id == uid).first()
            return bool(u and u.role == UserRole.ADMIN)
        finally:
            db.close()

    if not _check():
        raise HTTPException(403, "Admin role required")
    return uid


def _broadcast_to_dict(b) -> dict:
    return {
        "id": b.id,
        "food_resource_id": b.food_resource_id,
        "user_id": b.user_id,
        "channel": b.channel,
        "language": b.language,
        "message": b.message,
        "status": b.status,
        "batch_id": b.batch_id,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "approved_by": b.approved_by,
        "approved_at": b.approved_at.isoformat() if b.approved_at else None,
        "sent_at": b.sent_at.isoformat() if b.sent_at else None,
        "error": b.error,
    }


@router.get("/broadcasts")
async def list_broadcasts(
    request: Request,
    status: str = "pending",
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Admin: list broadcasts by status."""
    _enforce_rate_limit(request)
    _require_admin(credentials)
    if limit < 1 or limit > 500:
        raise HTTPException(400, "limit must be 1..500")

    def _fetch():
        from backend.app import SessionLocal
        from backend.ai.models import AIBroadcast
        db = SessionLocal()
        try:
            q = db.query(AIBroadcast)
            if status and status != "all":
                q = q.filter(AIBroadcast.status == status)
            rows = q.order_by(AIBroadcast.created_at.desc()).limit(limit).all()
            return [_broadcast_to_dict(r) for r in rows]
        finally:
            db.close()

    data = await asyncio.get_event_loop().run_in_executor(None, _fetch)
    return {"status": status, "count": len(data), "broadcasts": data}


class BroadcastEditRequest(BaseModel):
    message: Optional[str] = Field(default=None, max_length=1000)
    channel: Optional[str] = None  # 'sms' | 'chat' | 'both'


@router.post("/broadcasts/{broadcast_id}/approve")
async def approve_broadcast(
    broadcast_id: int,
    body: BroadcastEditRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Admin: approve (optionally edit) and send a pending broadcast."""
    _enforce_rate_limit(request)
    admin_uid = _require_admin(credentials)

    def _approve():
        from backend.app import SessionLocal
        from backend.ai.models import AIBroadcast
        db = SessionLocal()
        try:
            b = db.query(AIBroadcast).filter(AIBroadcast.id == broadcast_id).first()
            if not b:
                return "not_found"
            if b.status not in ("pending", "failed"):
                return f"bad_status:{b.status}"
            if body.message:
                b.message = body.message.strip()
            if body.channel in ("sms", "chat", "both"):
                b.channel = body.channel
            b.status = "approved"
            b.approved_by = admin_uid
            b.approved_at = datetime.now(timezone.utc).replace(tzinfo=None)
            db.commit()
            return "ok"
        finally:
            db.close()

    outcome = await asyncio.get_event_loop().run_in_executor(None, _approve)
    if outcome == "not_found":
        raise HTTPException(404, "broadcast not found")
    if outcome.startswith("bad_status"):
        raise HTTPException(409, f"cannot approve: {outcome}")

    # Send now
    from backend.ai.notifications import send_broadcast
    result = await send_broadcast(broadcast_id)
    return {"id": broadcast_id, "approved": True, "delivery": result}


@router.post("/broadcasts/{broadcast_id}/reject")
async def reject_broadcast(
    broadcast_id: int,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Admin: reject a pending broadcast (will not be sent)."""
    _enforce_rate_limit(request)
    admin_uid = _require_admin(credentials)

    def _reject():
        from backend.app import SessionLocal
        from backend.ai.models import AIBroadcast
        db = SessionLocal()
        try:
            b = db.query(AIBroadcast).filter(AIBroadcast.id == broadcast_id).first()
            if not b:
                return "not_found"
            if b.status != "pending":
                return f"bad_status:{b.status}"
            b.status = "rejected"
            b.approved_by = admin_uid
            b.approved_at = datetime.now(timezone.utc).replace(tzinfo=None)
            db.commit()
            return "ok"
        finally:
            db.close()

    outcome = await asyncio.get_event_loop().run_in_executor(None, _reject)
    if outcome == "not_found":
        raise HTTPException(404, "broadcast not found")
    if outcome.startswith("bad_status"):
        raise HTTPException(409, f"cannot reject: {outcome}")
    return {"id": broadcast_id, "rejected": True}


@router.post("/broadcasts/approve_batch")
async def approve_batch(
    request: Request,
    batch_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Admin: approve + send every pending broadcast (optionally by batch)."""
    _enforce_rate_limit(request)
    _require_admin(credentials)
    from backend.ai.notifications import auto_send_pending
    sent = await auto_send_pending(batch_id=batch_id)
    return {"sent": sent, "batch_id": batch_id}


@router.post("/broadcasts/run_now")
async def run_broadcast_job(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Admin: trigger the hourly scan-and-draft job on-demand."""
    _enforce_rate_limit(request)
    _require_admin(credentials)
    from backend.ai.notifications import scan_and_draft_new_listings
    stats = await scan_and_draft_new_listings()
    return {"ok": True, "stats": stats}
