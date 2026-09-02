"""Tests for backend.ai.errors — exception hierarchy + language resolution."""
from __future__ import annotations

import pytest

from backend.ai.errors import (
    AIDatabaseError,
    AIError,
    AIServiceUnavailable,
    AITimeout,
    AIUpstreamError,
    resolve_lang,
)


class FakeRequest:
    """Minimal duck-typed Request replacement for resolve_lang tests."""
    def __init__(self, accept_language: str = ""):
        self.headers = {"accept-language": accept_language}


# ---------------------------------------------------------------------------
# Exception hierarchy
# ---------------------------------------------------------------------------

class TestAIErrorHierarchy:
    def test_base_is_500(self):
        exc = AIError("en")
        assert exc.status_code == 500
        assert isinstance(exc.detail, str) and exc.detail

    def test_timeout_is_504(self):
        exc = AITimeout("en")
        assert exc.status_code == 504
        msg = exc.detail.lower()
        assert "try again" in msg or "longer" in msg or "moment" in msg

    def test_upstream_is_502(self):
        assert AIUpstreamError("en").status_code == 502

    def test_service_unavailable_is_503(self):
        assert AIServiceUnavailable("en").status_code == 503

    def test_db_is_503(self):
        assert AIDatabaseError("en").status_code == 503

    def test_spanish_message(self):
        exc = AITimeout("es")
        msg = exc.detail.lower()
        assert "tardando" in msg or "inténtalo" in msg or "mientras" in msg

    def test_custom_detail_overrides_canned(self):
        exc = AIError("en", detail="custom specific message")
        assert exc.detail == "custom specific message"

    def test_subclass_hierarchy(self):
        from fastapi import HTTPException
        assert issubclass(AITimeout, AIError)
        assert issubclass(AIUpstreamError, AIError)
        assert issubclass(AIServiceUnavailable, AIError)
        assert issubclass(AIDatabaseError, AIError)
        assert issubclass(AIError, HTTPException)


# ---------------------------------------------------------------------------
# resolve_lang
# ---------------------------------------------------------------------------

class TestResolveLang:
    def test_defaults_english(self):
        assert resolve_lang() == "en"
        assert resolve_lang(None, None) == "en"

    def test_body_hint_spanish(self):
        assert resolve_lang(None, "¿Qué comida está disponible?") == "es"

    def test_body_hint_english(self):
        assert resolve_lang(None, "Show me food listings") == "en"

    def test_accept_language_spanish(self):
        assert resolve_lang(FakeRequest("es-MX,es;q=0.9")) == "es"

    def test_accept_language_english(self):
        assert resolve_lang(FakeRequest("en-US,en;q=0.8")) == "en"

    def test_body_hint_trumps_english_header(self):
        assert resolve_lang(FakeRequest("en"), "hola qué tal") == "es"

    def test_english_body_falls_back_to_spanish_header(self):
        assert resolve_lang(FakeRequest("es-MX"), "hello world") == "es"

    def test_no_header_no_body(self):
        assert resolve_lang(FakeRequest("")) == "en"

    @pytest.mark.parametrize("body", ["", None, 0, []])
    def test_non_string_body_ignored(self, body):
        # Should not crash; falls back to header/default
        assert resolve_lang(FakeRequest(""), body) == "en"
