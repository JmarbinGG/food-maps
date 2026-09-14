"""Photo/CSV bulk listings must persist the preview community picker."""
from __future__ import annotations

from backend.ai.routes import BulkListingItem, _normalize_listing_row


class TestBulkListingCommunityPersistence:
    def test_model_accepts_community_id(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            community_id="8",
        )
        assert item.community_id == "8"

    def test_normalize_keeps_picker_community_over_donor_default(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            community_id=8,
            expiry_date="2099-01-01",
        )
        donor = {"community_id": 1, "address": "1423 Park St, Alameda, CA"}
        row = _normalize_listing_row(item, "user-1", donor=donor)
        assert row.get("community_id") == 8

    def test_normalize_falls_back_to_donor_community_when_picker_empty(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            expiry_date="2099-01-01",
        )
        donor = {"community_id": 1}
        row = _normalize_listing_row(item, "user-1", donor=donor)
        assert row.get("community_id") == 1

    def test_normalize_pending_name_does_not_inherit_donor_warehouse(self):
        item = BulkListingItem(
            title="Oranges",
            quantity=3,
            unit="bags",
            category="produce",
            community_name="Some School",
            expiry_date="2099-01-01",
        )
        donor = {"community_id": 1, "address": "1 Main St"}
        row = _normalize_listing_row(item, "user-1", donor=donor)
        assert row.get("community_id") is None
        assert row.get("_community_name_pending") == "Some School"

    def test_normalize_accepts_string_community_id(self):
        item = BulkListingItem(
            title="Carrots",
            quantity=1,
            unit="basket",
            category="produce",
            community_id="12",
            expiry_date="2099-01-01",
        )
        row = _normalize_listing_row(item, "user-1", donor={"community_id": 1})
        assert row.get("community_id") == 12

    def test_normalize_accepts_pending_status(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            expiry_date="2099-01-01",
        )
        row = _normalize_listing_row(item, "user-1", donor={}, status="pending")
        assert row["status"] == "pending"

    def test_normalize_keeps_available_status(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            expiry_date="2099-01-01",
        )
        row = _normalize_listing_row(item, "user-1", donor={}, status="available")
        assert row["status"] == "available"

    def test_normalize_maps_legacy_approved_to_available(self):
        item = BulkListingItem(
            title="Mangoes",
            quantity=1,
            unit="basket",
            category="produce",
            expiry_date="2099-01-01",
        )
        row = _normalize_listing_row(item, "user-1", donor={}, status="approved")
        assert row["status"] == "available"


def test_insert_bulk_listing_mysql_keeps_community_and_available_status():
    from unittest.mock import MagicMock, patch

    from backend.ai.bulk_mysql import insert_bulk_listing_mysql
    from backend.models import FoodResource

    created = []
    db = MagicMock()

    def _add(obj):
        created.append(obj)
        obj.id = 77

    db.add.side_effect = _add
    db.commit = MagicMock()
    db.refresh = MagicMock()
    db.rollback = MagicMock()
    db.close = MagicMock()

    with patch("backend.app.SessionLocal", return_value=db):
        result = insert_bulk_listing_mysql({
            "user_id": 3,
            "title": "Apples",
            "quantity": 2,
            "unit": "bags",
            "category": "produce",
            "community_id": 8,
            "status": "available",
            "location": "1 Market St",
        })

    assert result["id"] == 77
    assert result["status"] == "available"
    assert len(created) == 1
    assert isinstance(created[0], FoodResource)
    assert created[0].community_id == 8
    assert created[0].status == "available"
