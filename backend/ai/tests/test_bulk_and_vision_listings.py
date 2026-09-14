"""Bulk CSV/photo confirm and /api/ai/vision-listing draft extraction."""
from __future__ import annotations

import io
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.ai.bulk_mysql import apply_donor_defaults_to_listing, insert_bulk_listing_mysql
from backend.ai.routes import (
    BulkListingItem,
    _address_worth_geocoding,
    _normalize_listing_row,
    _row_for_enrich_prompt,
)
from backend.app import app
from backend.models import FoodCategory, FoodResource, PerishabilityLevel


TEST_USER_ID = "18"


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def owner():
    with patch("backend.ai.routes._auth_user_id", return_value=TEST_USER_ID), patch(
        "backend.ai.routes.check_rate_limit", return_value=True
    ):
        yield


def _item(**kwargs) -> BulkListingItem:
    defaults = dict(
        title="Apples",
        quantity=3,
        unit="bags",
        category="produce",
        expiry_date="2099-01-01",
    )
    defaults.update(kwargs)
    return BulkListingItem(**defaults)


# ---------------------------------------------------------------------------
# Normalize / geocode helpers (image + CSV rows)
# ---------------------------------------------------------------------------


class TestNormalizeImageAndCsvRows:
    def test_image_url_survives_normalize(self):
        item = _item(image_url="https://foodmaps.test/uploads/apples.jpg")
        row = _normalize_listing_row(item, TEST_USER_ID, donor={}, status="available")
        assert row["image_url"] == "https://foodmaps.test/uploads/apples.jpg"
        assert row["status"] == "available"
        assert row["user_id"] == TEST_USER_ID

    def test_past_expiry_is_replaced_with_future_default(self):
        item = _item(expiry_date="2020-01-01", category="bakery")
        row = _normalize_listing_row(item, TEST_USER_ID, donor={})
        parsed = date.fromisoformat(row["expiry_date"])
        assert parsed >= date.today()
        assert parsed == date.today() + timedelta(days=3)

    def test_unknown_category_falls_back_to_other(self):
        item = _item(category="not-a-real-category")
        row = _normalize_listing_row(item, TEST_USER_ID, donor={})
        assert row["category"] == "other"

    def test_dietary_and_allergen_lists_are_trimmed(self):
        item = _item(
            dietary_tags=[" Vegetarian ", "", "vegan"],
            allergens=["nuts", "  "],
        )
        row = _normalize_listing_row(item, TEST_USER_ID, donor={})
        assert row["dietary_tags"] == ["Vegetarian", "vegan"]
        assert row["allergens"] == ["nuts"]

    def test_enrich_prompt_drops_empty_optional_fields(self):
        compact = _row_for_enrich_prompt(_item())
        assert "description" not in compact
        assert "location" not in compact
        assert compact["title"] == "Apples"


class TestAddressWorthGeocoding:
    def test_rejects_short_or_numberless_stubs(self):
        assert _address_worth_geocoding("123 Main") is False
        assert _address_worth_geocoding("Alameda High School") is False
        assert _address_worth_geocoding("") is False

    def test_accepts_street_plus_city(self):
        assert _address_worth_geocoding("1423 Park St, Alameda, CA") is True
        assert _address_worth_geocoding("100 Webster Street Oakland") is True


class TestDonorDefaults:
    def test_placeholder_address_is_cleared_then_filled_from_profile(self):
        row = apply_donor_defaults_to_listing(
            {
                "location": "profile address",
                "title": "Bread",
            },
            {
                "address": "1423 Park St, Alameda, CA",
                "latitude": 37.76,
                "longitude": -122.24,
                "community_id": 8,
            },
        )
        assert row["location"] == "1423 Park St, Alameda, CA"
        assert row["latitude"] == 37.76
        assert row["community_id"] == 8

    def test_existing_community_is_not_overwritten(self):
        row = apply_donor_defaults_to_listing(
            {"community_id": 12, "title": "Rice"},
            {"community_id": 1},
        )
        assert row["community_id"] == 12


# ---------------------------------------------------------------------------
# MySQL insert for photo/CSV rows
# ---------------------------------------------------------------------------


class TestInsertBulkListingMysql:
    def test_persists_image_json_and_available_status(self):
        created = []
        db = MagicMock()
        db.add.side_effect = lambda obj: created.append(obj) or setattr(obj, "id", 44)
        db.commit = MagicMock()
        db.refresh = MagicMock()
        db.rollback = MagicMock()
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            result = insert_bulk_listing_mysql({
                "user_id": 18,
                "title": "Photo apples",
                "quantity": 4,
                "unit": "bags",
                "category": "produce",
                "community_id": 8,
                "status": "available",
                "image_url": "https://foodmaps.test/uploads/apples.jpg",
                "location": "1423 Park St, Alameda, CA",
                "latitude": 37.76,
                "longitude": -122.24,
            })

        assert result == {"id": 44, "status": "available"}
        item = created[0]
        assert isinstance(item, FoodResource)
        assert item.community_id == 8
        assert item.status == "available"
        assert item.category == FoodCategory.PRODUCE
        assert item.perishability == PerishabilityLevel.HIGH
        assert "apples.jpg" in (item.images or "")

    def test_unknown_mysql_category_becomes_packaged(self):
        created = []
        db = MagicMock()
        db.add.side_effect = lambda obj: created.append(obj) or setattr(obj, "id", 1)
        db.commit = MagicMock()
        db.refresh = MagicMock()
        db.close = MagicMock()

        with patch("backend.app.SessionLocal", return_value=db):
            insert_bulk_listing_mysql({
                "user_id": 18,
                "title": "Yogurt",
                "category": "dairy",
                "status": "available",
            })
        assert created[0].category == FoodCategory.PACKAGED

    def test_rejects_non_numeric_user(self):
        with pytest.raises(ValueError, match="invalid user_id"):
            insert_bulk_listing_mysql({"user_id": "not-a-user", "title": "X"})


# ---------------------------------------------------------------------------
# HTTP: bulk confirm + vision draft
# ---------------------------------------------------------------------------


class TestBulkListingsRoute:
    def test_creates_available_rows_with_community_and_photo(self, client, owner):
        inserts = []

        def _insert(row):
            inserts.append(row)
            return {"id": 100 + len(inserts), "status": row.get("status")}

        with patch(
            "backend.ai.role_guards.check_role_allows_tool",
            new=AsyncMock(return_value=None),
        ), patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={"community_id": 1, "address": "1 Main St"},
        ), patch(
            "backend.ai.bulk_mysql.insert_bulk_listing_mysql",
            side_effect=_insert,
        ), patch(
            "backend.tools._forward_geocode",
            new=AsyncMock(return_value=(37.76, -122.24)),
        ), patch(
            "backend.tools._resolve_create_listing_status",
            new=AsyncMock(return_value="available"),
        ):
            resp = client.post(
                "/api/ai/bulk-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "listings": [
                        {
                            "title": "Photo apples",
                            "quantity": 2,
                            "unit": "bags",
                            "category": "produce",
                            "community_id": 8,
                            "image_url": "https://foodmaps.test/uploads/a.jpg",
                            "location": "1423 Park St, Alameda, CA",
                            "expiry_date": "2099-06-01",
                        }
                    ],
                },
            )

        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["created"] == 1
        assert body["failed"] == 0
        assert body["ids"] == ["101"]
        assert body["statuses"] == ["available"]
        assert body["awaiting_approval"] is False
        assert inserts[0]["community_id"] == 8
        assert inserts[0]["status"] == "available"
        assert inserts[0]["image_url"] == "https://foodmaps.test/uploads/a.jpg"
        assert inserts[0]["latitude"] == 37.76

    def test_resolves_community_name_then_inserts(self, client, owner):
        inserts = []

        def _insert(row):
            inserts.append(dict(row))
            return {"id": 5, "status": "available"}

        with patch(
            "backend.ai.role_guards.check_role_allows_tool",
            new=AsyncMock(return_value=None),
        ), patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={"community_id": 1},
        ), patch(
            "backend.ai.bulk_mysql.insert_bulk_listing_mysql",
            side_effect=_insert,
        ), patch(
            "backend.tools._resolve_community",
            new=AsyncMock(return_value=("12", "Alameda High")),
        ), patch(
            "backend.tools._resolve_create_listing_status",
            new=AsyncMock(return_value="available"),
        ):
            resp = client.post(
                "/api/ai/bulk-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "listings": [
                        {
                            "title": "Oranges",
                            "quantity": 1,
                            "unit": "bag",
                            "category": "produce",
                            "community_name": "Alameda High",
                            "expiry_date": "2099-01-01",
                        }
                    ],
                },
            )

        assert resp.status_code == 200
        assert resp.json()["created"] == 1
        assert inserts[0]["community_id"] == 12

    def test_recipient_role_is_forbidden(self, client, owner):
        with patch(
            "backend.ai.role_guards.check_role_allows_tool",
            new=AsyncMock(return_value={"error": "recipient cannot post"}),
        ):
            resp = client.post(
                "/api/ai/bulk-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "listings": [
                        {
                            "title": "Apples",
                            "quantity": 1,
                            "unit": "bag",
                            "category": "produce",
                        }
                    ],
                },
            )
        assert resp.status_code == 403

    def test_partial_failure_is_reported(self, client, owner):
        def _insert(row):
            if row["title"] == "Bad":
                raise RuntimeError("db down")
            return {"id": 9, "status": "available"}

        with patch(
            "backend.ai.role_guards.check_role_allows_tool",
            new=AsyncMock(return_value=None),
        ), patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={},
        ), patch(
            "backend.ai.bulk_mysql.insert_bulk_listing_mysql",
            side_effect=_insert,
        ), patch(
            "backend.tools._resolve_create_listing_status",
            new=AsyncMock(return_value="available"),
        ):
            resp = client.post(
                "/api/ai/bulk-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "listings": [
                        {
                            "title": "Good",
                            "quantity": 1,
                            "unit": "bag",
                            "category": "produce",
                            "expiry_date": "2099-01-01",
                        },
                        {
                            "title": "Bad",
                            "quantity": 1,
                            "unit": "bag",
                            "category": "produce",
                            "expiry_date": "2099-01-01",
                        },
                    ],
                },
            )
        body = resp.json()
        assert body["created"] == 1
        assert body["failed"] == 1
        assert body["errors"][0]["index"] == 1


class TestVisionListingRoute:
    def test_empty_image_is_400(self, client, owner):
        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("empty.jpg", io.BytesIO(b""), "image/jpeg")},
            )
        assert resp.status_code == 400
        assert "Empty" in resp.json()["detail"]

    def test_non_image_is_400(self, client, owner):
        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("notes.txt", io.BytesIO(b"hello"), "text/plain")},
            )
        assert resp.status_code == 400
        assert "not an image" in resp.json()["detail"]

    def test_missing_openai_key_is_503(self, client, owner):
        with patch("backend.ai.ai_engine.OPENAI_API_KEY", ""):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("food.jpg", io.BytesIO(b"fakepng"), "image/jpeg")},
            )
        assert resp.status_code == 503

    def test_vision_json_becomes_draft_with_donor_defaults(self, client, owner):
        vision_json = (
            '{"title":"Sourdough loaves","description":"Fresh bakery bread",'
            '"category":"bakery","quantity":4,"unit":"loaves",'
            '"dietary_tags":["vegetarian"],"allergens":["gluten"],'
            '"confidence":0.91}'
        )

        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": vision_json}}],
        }
        mock_client = MagicMock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"), patch(
            "backend.ai.ai_engine._get_http_client", return_value=mock_client
        ), patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={"address": "1423 Park St, Alameda, CA", "community_id": 8},
        ):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("bread.jpg", io.BytesIO(b"\x89PNG"), "image/jpeg")},
            )

        assert resp.status_code == 200, resp.text
        body = resp.json()
        draft = body["draft"]
        assert draft["title"] == "Sourdough loaves"
        assert draft["category"] == "bakery"
        assert draft["quantity"] == 4
        assert draft["unit"] == "loaves"
        assert draft["dietary_tags"] == ["vegetarian"]
        assert draft["allergens"] == ["gluten"]
        assert draft["location"] == "1423 Park St, Alameda, CA"
        assert draft["community_id"] == "8"
        assert body["confidence"] == pytest.approx(0.91)

    def test_unknown_vision_category_and_bad_qty_are_sanitized(self, client, owner):
        vision_json = (
            '{"title":"Mystery","category":"snacks","quantity":-2,'
            '"unit":"","confidence":"nope"}'
        )
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": vision_json}}],
        }
        mock_client = MagicMock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"), patch(
            "backend.ai.ai_engine._get_http_client", return_value=mock_client
        ), patch(
            "backend.ai.bulk_mysql.fetch_donor_listing_defaults_mysql",
            return_value={},
        ):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("x.jpg", io.BytesIO(b"xx"), "image/jpeg")},
            )

        draft = resp.json()["draft"]
        assert draft["category"] == "other"
        assert draft["quantity"] == 1.0
        assert draft["unit"] == "items"
        assert resp.json()["confidence"] == 0.0

    def test_openai_failure_is_502(self, client, owner):
        mock_client = MagicMock()
        mock_client.post = AsyncMock(side_effect=RuntimeError("timeout"))

        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"), patch(
            "backend.ai.ai_engine._get_http_client", return_value=mock_client
        ):
            resp = client.post(
                "/api/ai/vision-listing",
                data={"user_id": TEST_USER_ID},
                files={"image": ("x.jpg", io.BytesIO(b"xx"), "image/jpeg")},
            )
        assert resp.status_code == 502


class TestEnrichListingsRoute:
    def test_returns_originals_when_openai_missing(self, client, owner):
        with patch("backend.ai.ai_engine.OPENAI_API_KEY", ""):
            resp = client.post(
                "/api/ai/enrich-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "rows": [
                        {
                            "title": "Apples",
                            "quantity": 2,
                            "unit": "bags",
                            "category": "produce",
                        }
                    ],
                },
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["rows"][0]["title"] == "Apples"
        assert body["filled"] == []
        assert "unavailable" in body["summary"].lower()

    def test_fills_only_empty_optional_fields(self, client, owner):
        ai_payload = {
            "rows": [
                {
                    "title": "SHOULD NOT WIN",
                    "description": "Crisp gala apples",
                    "category": "produce",
                    "quantity": 99,
                    "expiry_date": "2099-12-01",
                }
            ],
            "summary": "Filled description.",
        }
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": __import__("json").dumps(ai_payload)}}],
        }
        mock_client = MagicMock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        with patch("backend.ai.ai_engine.OPENAI_API_KEY", "sk-test"), patch(
            "backend.ai.ai_engine._get_http_client", return_value=mock_client
        ):
            resp = client.post(
                "/api/ai/enrich-listings",
                json={
                    "user_id": TEST_USER_ID,
                    "rows": [
                        {
                            "title": "Apples",
                            "quantity": 2,
                            "unit": "bags",
                            "category": "produce",
                        }
                    ],
                },
            )

        body = resp.json()
        row = body["rows"][0]
        assert row["title"] == "Apples"
        assert row["quantity"] == 2
        assert row["description"] == "Crisp gala apples"
        assert row["expiry_date"] == "2099-12-01"
        assert body["filled"][0]["fields"] == ["description", "expiry_date"]
