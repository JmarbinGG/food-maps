"""
Centralised error types for the DoGoods AI router.

Provides a small hierarchy of :class:`AIError` HTTP exceptions with
language-aware user-facing messages (sourced from
:func:`backend.ai.ai_engine.get_canned_response`) plus a ``resolve_lang``
helper so each handler can pick the right language for its canned response.

Handlers raise ``AITimeout`` / ``AIUpstreamError`` / ``AIServiceUnavailable``
/ ``AIDatabaseError`` / ``AIError`` directly; because all of these are
``HTTPException`` subclasses, the main app's ``secure_http_exception_handler``
serialises them without leaking internal detail.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import HTTPException, Request

from backend.ai.ai_engine import detect_spanish, get_canned_response

logger = logging.getLogger("ai_errors")


# ---------------------------------------------------------------------------
# Exception hierarchy
# ---------------------------------------------------------------------------

class AIError(HTTPException):
    """Base class for AI-layer HTTP errors with a language-aware message."""

    status_code: int = 500
    canned_key: str = "general_error"

    def __init__(self, lang: str = "en", detail: Optional[str] = None):
        super().__init__(
            status_code=self.status_code,
            detail=detail or get_canned_response(self.canned_key, lang),
        )


class AITimeout(AIError):
    """Upstream (OpenAI / Mapbox / Twilio) timed out."""
    status_code = 504
    canned_key = "timeout"


class AIUpstreamError(AIError):
    """Upstream returned an HTTP error or the connection failed."""
    status_code = 502
    canned_key = "api_down"


class AIServiceUnavailable(AIError):
    """Service is temporarily unable to serve this request (circuit open)."""
    status_code = 503
    canned_key = "api_down"


class AIDatabaseError(AIError):
    """Database failed (connection, integrity, deadlock, etc.)."""
    status_code = 503
    canned_key = "general_error"


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

def resolve_lang(request: Optional[Request] = None,
                 body_hint: Optional[str] = None) -> str:
    """Best-effort language pick: body text > Accept-Language > 'en'."""
    if body_hint and isinstance(body_hint, str) and detect_spanish(body_hint):
        return "es"
    if request is not None:
        header = (request.headers.get("accept-language") or "").lower()
        if header.startswith("es"):
            return "es"
    return "en"


__all__ = [
    "AIError",
    "AITimeout",
    "AIUpstreamError",
    "AIServiceUnavailable",
    "AIDatabaseError",
    "resolve_lang",
]
