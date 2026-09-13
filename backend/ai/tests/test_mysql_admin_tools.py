"""MySQL paths for platform stats, dispatch queue, and community resolve."""
from __future__ import annotations

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from backend.models import UserRole


def _mock_user(*, user_id=1, role=UserRole.DONOR, is_admin=False, community_id=None):
    u = MagicMock()
    u.id = user_id
    u.role = role
    u.is_admin = is_admin
    u.community_id = community_id
    u.created_at = datetime.utcnow()
    u.name = "Test User"
    u.email = "t@example.com"
    u.phone = None
    u.address = "1 Main St"
    u.coords_lat = 37.76
    u.coords_lng = -122.27
    return u


@pytest.mark.asyncio
class TestPlatformStatsMysql:
    async def test_missing_user_is_not_admin_required(self):
        """Empty/missing MySQL user must not look like a privilege failure."""
        from backend.ai.tools import _get_platform_stats

        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            result = await _get_platform_stats("42")

        assert result.get("error") == "User not found"
        assert "Admin role required" not in str(result.get("error"))

    async def test_non_admin_rejected(self):
        from backend.ai.tools import _get_platform_stats

        user = _mock_user(user_id=8, is_admin=False, role=UserRole.DONOR)
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = user
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db), patch(
            "backend.app._user_is_admin", return_value=False
        ):
            result = await _get_platform_stats("8")

        assert result.get("error") == "Admin role required"

    async def test_admin_empty_db_returns_zero_counts(self):
        from backend.ai.tools import _get_platform_stats

        user = _mock_user(user_id=7, is_admin=True, role=UserRole.ADMIN)
        db = MagicMock()

        def _query(model):
            q = MagicMock()
            q.filter.return_value = q
            q.first.return_value = user
            q.count.return_value = 0
            return q

        db.query.side_effect = _query
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db), patch(
            "backend.app._user_is_admin", return_value=True
        ):
            result = await _get_platform_stats("7")

        assert "error" not in result
        assert result["total_users"] == 0
        assert result["active_listings"] == 0
        assert result["open_requests"] == 0
        assert "0 members" in result["summary"]


@pytest.mark.asyncio
class TestDispatchQueueMysql:
    async def test_empty_queue_honest_summary(self):
        from backend.ai.tools import _get_dispatch_queue

        db = MagicMock()
        q = MagicMock()
        q.filter.return_value = q
        q.order_by.return_value = q
        q.limit.return_value = q
        q.all.return_value = []
        db.query.return_value = q
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            result = await _get_dispatch_queue("1")

        assert result["open_requests"] == []
        assert result["unclaimed_listings"] == []
        assert "empty" in result["summary"].lower()


class TestResolveCommunityMysql:
    def test_resolve_by_id(self):
        from backend.ai.bulk_mysql import resolve_community_mysql

        center = MagicMock()
        center.id = 12
        center.name = "Alameda High"
        center.is_active = True

        db = MagicMock()
        db.query.return_value.filter.return_value.filter.return_value.first.return_value = center
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            cid, cname = resolve_community_mysql(community_id="12")

        assert cid == "12"
        assert cname == "Alameda High"

    def test_empty_catalog_returns_none(self):
        from backend.ai.bulk_mysql import resolve_community_mysql

        db = MagicMock()
        db.query.return_value.filter.return_value.filter.return_value.first.return_value = None
        db.query.return_value.filter.return_value.all.return_value = []
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            cid, cname = resolve_community_mysql(community_name="Nowhere School")

        assert cid is None
        assert cname is None


class TestDonorDefaultsMysql:
    def test_includes_community_id(self):
        from backend.ai.bulk_mysql import fetch_donor_listing_defaults_mysql

        user = _mock_user(user_id=3, community_id=99)
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = user
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            defaults = fetch_donor_listing_defaults_mysql(3)

        assert defaults.get("community_id") == 99
        assert defaults.get("latitude") == 37.76


@pytest.mark.asyncio
class TestFallbackCommunityMysql:
    async def test_empty_db_returns_none_none(self):
        from backend.ai.tools import _fallback_community_for_user

        with patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={},
        ), patch(
            "backend.ai.bulk_mysql.resolve_community_mysql",
            return_value=(None, None),
        ), patch(
            "backend.ai.bulk_mysql.fetch_active_communities_mysql",
            return_value=[],
        ):
            cid, cname = await _fallback_community_for_user("5")

        assert cid is None
        assert cname is None
