"""Request-size limits for admin page content.

The Impact Story catalog (every city and story) is saved as one JSON string
under the `__impact_catalog` key, so the generic 5,000-char cap on JSON string
values rejected an ordinary save with "JSON field value is too large". These
tests pin the per-path override and keep the generic cap in place everywhere
else.
"""
from __future__ import annotations

import pytest
from fastapi import HTTPException

from backend.app import (
    MAX_API_BODY_BYTES,
    MAX_JSON_STRING_CHARS,
    MAX_PAGE_CONTENT_BYTES,
    _max_json_string_chars_for,
    _sanitize_json_payload,
)

# page_contents.content is a TEXT column.
MYSQL_TEXT_LIMIT = 65_535


def test_page_content_routes_allow_long_strings():
    assert _max_json_string_chars_for("/api/pages/impactStory/content") == 60_000
    assert _max_json_string_chars_for("/API/Pages/landing/content") == 60_000


def test_other_routes_keep_the_generic_cap():
    for path in ("/api/user/login", "/api/ai/chat", "/api/listings", "/api/pagesomething"):
        assert _max_json_string_chars_for(path) == MAX_JSON_STRING_CHARS


def test_generic_cap_still_rejects_a_long_string():
    payload = {"content": {"__impact_catalog": "z" * (MAX_JSON_STRING_CHARS + 1)}}
    with pytest.raises(HTTPException) as excinfo:
        _sanitize_json_payload(payload)
    assert excinfo.value.status_code == 413


def test_page_content_cap_accepts_a_full_catalog_payload():
    # Twelve stories with long-form bodies serialize to ~14KB.
    catalog = "c" * 14_000
    payload = {"content": {"__impact_catalog": catalog}}
    sanitized = _sanitize_json_payload(
        payload, max_string_chars=_max_json_string_chars_for("/api/pages/impactStory/content")
    )
    assert sanitized["content"]["__impact_catalog"] == catalog


def test_page_content_cap_has_an_upper_bound():
    over = {"content": {"__impact_catalog": "z" * 61_000}}
    with pytest.raises(HTTPException) as excinfo:
        _sanitize_json_payload(
            over, max_string_chars=_max_json_string_chars_for("/api/pages/impactStory/content")
        )
    assert excinfo.value.status_code == 413


def test_declared_page_cap_fits_the_column_and_the_body_limit():
    """The handler must not promise more than the column or the body cap allow."""
    assert MAX_PAGE_CONTENT_BYTES <= MYSQL_TEXT_LIMIT
    assert MAX_PAGE_CONTENT_BYTES <= MAX_API_BODY_BYTES
