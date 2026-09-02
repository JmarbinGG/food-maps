"""MySQL helpers for AI bulk listing routes (Food Maps platform)."""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from typing import Any, Optional


def _is_placeholder_address(addr: str | None) -> bool:
    """True when the model passed a meta phrase instead of a real street address."""
    if not addr:
        return False
    s = str(addr).strip().lower()
    if not s:
        return False
    if s in {"profile address", "user profile address", "[user profile address]"}:
        return True
    if "[" in s and "profile" in s and "address" in s:
        return True
    if "profile address" in s and not any(ch.isdigit() for ch in s):
        return True
    return False


def apply_donor_defaults_to_listing(row: dict[str, Any], donor: dict[str, Any] | None) -> dict[str, Any]:
    """Copy donor profile + coordinates onto a listing row when missing."""
    if _is_placeholder_address(row.get("full_address") or row.get("location")):
        for key in ("location", "full_address", "latitude", "longitude"):
            row.pop(key, None)

    if not donor:
        return row

    if donor.get("community_id") and not row.get("community_id"):
        row["community_id"] = donor["community_id"]

    for src, dest in (
        ("name", "donor_name"),
        ("email", "donor_email"),
        ("phone", "donor_phone"),
        ("organization", "donor_type"),
    ):
        if donor.get(src) and not row.get(dest):
            row[dest] = donor[src]

    lat = donor.get("latitude")
    lng = donor.get("longitude")
    try:
        if lat is not None and lng is not None and row.get("latitude") is None:
            row["latitude"] = float(lat)
            row["longitude"] = float(lng)
    except (TypeError, ValueError):
        pass

    if not row.get("location") and not row.get("full_address"):
        donor_addr = str(donor.get("address") or "").strip()
        if donor_addr:
            row["location"] = donor_addr[:200]
            row["full_address"] = donor_addr[:200]

    return row


def fetch_donor_listing_defaults_mysql(user_id: str | int) -> dict[str, Any]:
    """Load donor profile fields to stamp onto new listing rows."""
    from backend.app import SessionLocal
    from backend.models import User

    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        return {}

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            return {}
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "community_id": None,
            "latitude": user.coords_lat,
            "longitude": user.coords_lng,
        }
    finally:
        db.close()


def insert_bulk_listing_mysql(row: dict[str, Any]) -> dict[str, Any]:
    """Insert one listing row into food_resources; returns {id, status}."""
    from backend.app import SessionLocal
    from backend.models import FoodResource, FoodCategory, PerishabilityLevel

    try:
        donor_id = int(row.get("user_id") or row.get("donor_id"))
    except (TypeError, ValueError):
        raise ValueError("invalid user_id")

    cat_raw = str(row.get("category") or "other").strip().lower()
    try:
        category = FoodCategory(cat_raw)
    except ValueError:
        category = FoodCategory.PACKAGED

    perish_map = {
        "produce": PerishabilityLevel.HIGH,
        "prepared": PerishabilityLevel.HIGH,
        "bakery": PerishabilityLevel.MEDIUM,
        "fruit": PerishabilityLevel.MEDIUM,
        "leftovers": PerishabilityLevel.HIGH,
    }
    perishability = perish_map.get(cat_raw, PerishabilityLevel.MEDIUM)

    expiry = row.get("expiry_date")
    expiration_date = None
    if expiry:
        try:
            if isinstance(expiry, str):
                expiration_date = datetime.fromisoformat(expiry[:10])
            elif isinstance(expiry, date):
                expiration_date = datetime.combine(expiry, datetime.min.time())
        except ValueError:
            expiration_date = None

    address = (
        str(row.get("location") or row.get("full_address") or row.get("address") or "").strip()[:255]
        or None
    )
    lat = row.get("latitude")
    lng = row.get("longitude")
    try:
        coords_lat = float(lat) if lat is not None else None
        coords_lng = float(lng) if lng is not None else None
    except (TypeError, ValueError):
        coords_lat = coords_lng = None

    images_json = None
    image_url = row.get("image_url")
    if image_url and str(image_url).strip():
        images_json = json.dumps([str(image_url).strip()[:1024]])

    dietary_tags = row.get("dietary_tags")
    allergens = row.get("allergens")
    if isinstance(dietary_tags, list):
        dietary_tags = json.dumps(dietary_tags)
    if isinstance(allergens, list):
        allergens = json.dumps(allergens)

    now = datetime.utcnow()
    pickup_end = expiration_date or (now + timedelta(days=3))

    db = SessionLocal()
    try:
        item = FoodResource(
            donor_id=donor_id,
            title=str(row.get("title") or "Food donation")[:255],
            description=(str(row.get("description")).strip()[:2000] if row.get("description") else None),
            category=category,
            qty=float(row.get("quantity") or 1),
            unit=str(row.get("unit") or "items")[:255],
            perishability=perishability,
            expiration_date=expiration_date,
            pickup_window_start=now,
            pickup_window_end=pickup_end,
            address=address,
            coords_lat=coords_lat,
            coords_lng=coords_lng,
            status=str(row.get("status") or "approved"),
            images=images_json,
            dietary_tags=dietary_tags if isinstance(dietary_tags, str) else None,
            allergens=allergens if isinstance(allergens, str) else None,
            created_at=now,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"id": item.id, "status": item.status}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def fetch_active_communities_mysql(
    user_id: str | int | None = None,
    max_results: int = 100,
) -> list[dict[str, Any]]:
    """Return active distribution centers as [{id, name}, ...] for chip picks."""
    from backend.app import SessionLocal
    from backend.models import DistributionCenter, User

    try:
        max_results = max(1, min(int(max_results or 100), 500))
    except (TypeError, ValueError):
        max_results = 100

    user_lat = user_lng = None
    if user_id is not None:
        try:
            uid = int(user_id)
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == uid).first()
                if user and user.coords_lat is not None and user.coords_lng is not None:
                    user_lat = float(user.coords_lat)
                    user_lng = float(user.coords_lng)
            finally:
                db.close()
        except (TypeError, ValueError):
            pass

    db = SessionLocal()
    try:
        centers = (
            db.query(DistributionCenter)
            .filter(DistributionCenter.is_active == True)  # noqa: E712
            .all()
        )
        rows: list[dict[str, Any]] = []
        for c in centers:
            name = str(c.name or "").strip()
            if not name:
                continue
            rows.append({
                "id": c.id,
                "name": name,
                "latitude": c.coords_lat,
                "longitude": c.coords_lng,
                "address": c.address,
            })
        if user_lat is not None and user_lng is not None:
            def _dist(row: dict) -> float:
                lat = row.get("latitude")
                lng = row.get("longitude")
                if lat is None or lng is None:
                    return 1e9
                try:
                    import math
                    d_lat = math.radians(float(lat) - user_lat)
                    d_lon = math.radians(float(lng) - user_lng)
                    a = (
                        math.sin(d_lat / 2) ** 2
                        + math.cos(math.radians(user_lat))
                        * math.cos(math.radians(float(lat)))
                        * math.sin(d_lon / 2) ** 2
                    )
                    return 6371.0 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                except Exception:
                    return 1e9
            rows.sort(key=_dist)
        return rows[:max_results]
    finally:
        db.close()


def insert_listing_from_row(row: dict[str, Any]) -> dict[str, Any]:
    """Shared insert helper for bulk routes and chat post tools."""
    return insert_bulk_listing_mysql(row)


def normalize_and_apply_donor(row: dict, donor: dict | None) -> dict:
    """Apply donor defaults using shared logic."""
    return apply_donor_defaults_to_listing(dict(row), donor)
