"""Listing approval gate + create status resolution."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_resolve_create_listing_status_available_when_gate_off():
    from backend.tools import _resolve_create_listing_status

    async def _off():
        return False

    with patch("backend.tools._require_listing_approval", _off):
        assert await _resolve_create_listing_status("donation") == "available"
        assert await _resolve_create_listing_status("request") == "open"


@pytest.mark.asyncio
async def test_resolve_create_listing_status_pending_when_gate_on():
    from backend.tools import _resolve_create_listing_status

    async def _on():
        return True

    with patch("backend.tools._require_listing_approval", _on):
        assert await _resolve_create_listing_status("donation") == "pending"


@pytest.mark.asyncio
async def test_require_request_and_claim_still_off():
    from backend.tools import _require_claim_approval, _require_request_approval

    assert await _require_request_approval() is False
    assert await _require_claim_approval() is False


def test_resolve_donation_create_status_admin_skips_gate():
    from backend.platform_settings import resolve_donation_create_status

    with patch("backend.platform_settings.require_listing_approval", return_value=True):
        assert resolve_donation_create_status(is_admin=True) == "available"
        assert resolve_donation_create_status(is_admin=False) == "pending"


def test_resolve_donation_create_status_gate_off():
    from backend.platform_settings import resolve_donation_create_status

    with patch("backend.platform_settings.require_listing_approval", return_value=False):
        assert resolve_donation_create_status(is_admin=False) == "available"
