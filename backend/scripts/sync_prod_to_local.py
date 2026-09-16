#!/usr/bin/env python3
"""Copy production data (via HTTPS APIs) into local MySQL.

RDS is not publicly reachable, so this pulls what the live site exposes:
  users, distribution_centers, food_resources (listings), page_contents.

Local passwords cannot be copied from the API. Every synced user gets
LOCAL_DEV_PASSWORD so you can sign in locally.

Usage:
  python backend/scripts/sync_prod_to_local.py
  python backend/scripts/sync_prod_to_local.py --email you@example.com --password secret
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from passlib.context import CryptContext
from sqlalchemy import create_engine, text

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

PROD_DEFAULT = "https://dogoodfoodmaps.com"
LOCAL_DEFAULT = "mysql+pymysql://foodmaps:password@127.0.0.1:3306/food_maps"
LOCAL_DEV_PASSWORD = "password123"

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

ROLE_MAP = {
    "admin": "ADMIN",
    "donor": "DONOR",
    "recipient": "RECIPIENT",
    "volunteer": "VOLUNTEER",
    "driver": "DRIVER",
    "dispatcher": "DISPATCHER",
}


def api_json(base: str, path: str, token: str | None = None, method: str = "GET", body: dict | None = None):
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = Request(base.rstrip("/") + path, data=data, headers=headers, method=method)
    with urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode())


def parse_dt(value: Any):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    s = str(value).replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(s).replace(tzinfo=None)
    except ValueError:
        return None


def json_or_none(value: Any):
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value)
    return value


def upsert(conn, table: str, row: dict, pk: str = "id"):
    cols = list(row.keys())
    placeholders = ", ".join(f":{c}" for c in cols)
    col_list = ", ".join(f"`{c}`" for c in cols)
    updates = ", ".join(f"`{c}`=VALUES(`{c}`)" for c in cols if c != pk)
    sql = (
        f"INSERT INTO `{table}` ({col_list}) VALUES ({placeholders}) "
        f"ON DUPLICATE KEY UPDATE {updates}"
    )
    conn.execute(text(sql), row)


def map_role(role: str | None) -> str:
    if not role:
        return "RECIPIENT"
    return ROLE_MAP.get(str(role).lower(), str(role).upper())


def sync_users(conn, users: list[dict], password_hash: str) -> int:
    n = 0
    for u in users:
        role = map_role(u.get("role"))
        is_admin = 1 if role == "ADMIN" or u.get("is_admin") else 0
        row = {
            "id": int(u["id"]),
            "email": (u.get("email") or "").strip().lower() or None,
            "name": u.get("name"),
            "password_hash": password_hash,
            "role": role,
            "is_admin": is_admin,
            "phone": u.get("phone"),
            "address": u.get("address"),
            "referral_code": u.get("referral_code"),
            "referred_by_code": u.get("referred_by_code"),
            "household_size": u.get("household_size") or 1,
            "trust_score": u.get("trust_score") if u.get("trust_score") is not None else 50,
            "email_verified": 1 if u.get("email_verified") else 0,
            "phone_verified": 1 if u.get("phone_verified") else 0,
            "created_at": parse_dt(u.get("created_at")) or datetime.utcnow(),
        }
        if not row["email"]:
            continue
        upsert(conn, "users", row)
        n += 1
    return n


def sync_centers(conn, centers: list[dict]) -> int:
    n = 0
    for c in centers:
        lat = c.get("coords_lat")
        lng = c.get("coords_lng")
        try:
            lat_f = float(lat) if lat is not None else None
            lng_f = float(lng) if lng is not None else None
        except (TypeError, ValueError):
            lat_f = lng_f = None
        if not lat_f and not lng_f:
            print(f"  skip center (no coords): {c.get('name')}")
            continue
        row = {
            "id": int(c["id"]),
            "owner_id": c.get("owner_id"),
            "name": c.get("name"),
            "description": c.get("description"),
            "address": c.get("address"),
            "coords_lat": lat_f,
            "coords_lng": lng_f,
            "phone": c.get("phone"),
            "hours": c.get("hours"),
            "is_active": 1 if c.get("is_active", True) else 0,
            "eligibility": c.get("eligibility"),
            "languages": c.get("languages"),
            "availability": c.get("availability"),
            "website": c.get("website"),
            "social_media": c.get("social_media"),
            "coverage_areas": c.get("coverage_areas"),
            "provider_types": json_or_none(c.get("provider_types")),
            "logo_url": c.get("logo_url"),
            "created_at": parse_dt(c.get("created_at")) or datetime.utcnow(),
        }
        upsert(conn, "distribution_centers", row)
        n += 1
    return n


def sync_listings(conn, listings: list[dict]) -> int:
    n = 0
    for item in listings:
        cat = (item.get("category") or "PACKAGED")
        if isinstance(cat, str):
            cat = cat.upper()
        perish = (item.get("perishability") or "MEDIUM")
        if isinstance(perish, str):
            perish = perish.upper()
        row = {
            "id": int(item["id"]),
            "donor_id": item.get("donor_id"),
            "recipient_id": item.get("recipient_id"),
            "title": item.get("title"),
            "description": item.get("description"),
            "category": cat,
            "qty": item.get("qty"),
            "unit": item.get("unit"),
            "perishability": perish,
            "expiration_date": parse_dt(item.get("expiration_date")),
            "date_label_type": item.get("date_label_type"),
            "pickup_window_start": parse_dt(item.get("pickup_window_start")),
            "pickup_window_end": parse_dt(item.get("pickup_window_end")),
            "address": item.get("address"),
            "coords_lat": item.get("coords_lat"),
            "coords_lng": item.get("coords_lng"),
            "status": item.get("status") or "available",
            "claimed_at": parse_dt(item.get("claimed_at")),
            "images": json_or_none(item.get("images")),
            "urgency_score": item.get("urgency_score"),
            "created_at": parse_dt(item.get("created_at")) or datetime.utcnow(),
            "updated_at": parse_dt(item.get("updated_at")),
            "verification_status": item.get("verification_status"),
            "is_refrigerated": 1 if item.get("is_refrigerated") else 0,
            "is_frozen": 1 if item.get("is_frozen") else 0,
            "packaging_condition": item.get("packaging_condition"),
            "safety_checklist_passed": 1 if item.get("safety_checklist_passed") else 0,
            "allergens": json_or_none(item.get("allergens")),
            "contamination_warning": item.get("contamination_warning"),
            "dietary_tags": json_or_none(item.get("dietary_tags")),
            "ingredients_list": item.get("ingredients_list"),
        }
        # Drop orphan donor FKs if sync missed a user
        if row["donor_id"] is not None:
            exists = conn.execute(
                text("SELECT 1 FROM users WHERE id = :id"), {"id": row["donor_id"]}
            ).scalar()
            if not exists:
                row["donor_id"] = None
        if row["recipient_id"] is not None:
            exists = conn.execute(
                text("SELECT 1 FROM users WHERE id = :id"), {"id": row["recipient_id"]}
            ).scalar()
            if not exists:
                row["recipient_id"] = None
        upsert(conn, "food_resources", row)
        n += 1
    return n


def sync_pages(conn, pages: list[tuple[str, dict]]) -> int:
    n = 0
    for page_id, payload in pages:
        content = payload.get("content")
        if content is None:
            continue
        row = {
            "page_id": page_id,
            "content": json.dumps(content) if not isinstance(content, str) else content,
            "updated_at": parse_dt(payload.get("updated_at")) or datetime.utcnow(),
        }
        existing = conn.execute(
            text("SELECT id FROM page_contents WHERE page_id = :page_id"),
            {"page_id": page_id},
        ).scalar()
        if existing:
            conn.execute(
                text(
                    "UPDATE page_contents SET content = :content, updated_at = :updated_at "
                    "WHERE page_id = :page_id"
                ),
                row,
            )
        else:
            conn.execute(
                text(
                    "INSERT INTO page_contents (page_id, content, created_at, updated_at) "
                    "VALUES (:page_id, :content, UTC_TIMESTAMP(), :updated_at)"
                ),
                row,
            )
        n += 1
    return n


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync production Food Maps data into local MySQL")
    parser.add_argument("--prod", default=os.getenv("PROD_BASE_URL", PROD_DEFAULT))
    parser.add_argument("--local-db", default=os.getenv("LOCAL_DATABASE_URL", LOCAL_DEFAULT))
    parser.add_argument("--email", default=os.getenv("PROD_SYNC_EMAIL", "aslanabdulkarim84@gmail.com"))
    parser.add_argument("--password", default=os.getenv("PROD_SYNC_PASSWORD", "password123"))
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete local rows whose ids are not in the production snapshot",
    )
    args = parser.parse_args()

    print(f"Logging into {args.prod} as {args.email} ...")
    try:
        auth = api_json(
            args.prod,
            "/api/user/login",
            method="POST",
            body={"email": args.email, "password": args.password},
        )
    except (HTTPError, URLError) as exc:
        print(f"Login failed: {exc}")
        return 1

    token = auth.get("token") or auth.get("access_token")
    if not token:
        print("Login response had no token")
        return 1

    print("Fetching production data ...")
    users_payload = api_json(args.prod, "/api/admin/users", token=token)
    users = users_payload.get("users") or []
    centers = api_json(args.prod, "/api/centers", token=token)
    listings = api_json(args.prod, "/api/listings/get?limit=500", token=token)
    pages: list[tuple[str, dict]] = []
    for page_id in ("landing", "impactStory"):
        try:
            pages.append((page_id, api_json(args.prod, f"/api/pages/{page_id}/content", token=token)))
        except HTTPError as exc:
            print(f"  page {page_id}: skip ({exc.code})")

    print(
        f"Pulled: {len(users)} users, {len(centers)} centers, "
        f"{len(listings)} listings, {len(pages)} pages"
    )

    password_hash = pwd_context.hash(LOCAL_DEV_PASSWORD)
    eng = create_engine(args.local_db)
    with eng.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        u_n = sync_users(conn, users, password_hash)
        c_n = sync_centers(conn, centers)
        l_n = sync_listings(conn, listings)
        p_n = sync_pages(conn, pages)

        if args.replace:
            user_ids = [int(u["id"]) for u in users if u.get("id") is not None]
            center_ids = []
            for c in centers:
                try:
                    if float(c.get("coords_lat") or 0) or float(c.get("coords_lng") or 0):
                        center_ids.append(int(c["id"]))
                except (TypeError, ValueError):
                    pass
            listing_ids = [int(x["id"]) for x in listings if x.get("id") is not None]

            if user_ids:
                conn.execute(
                    text("DELETE FROM users WHERE id NOT IN :ids"),
                    {"ids": tuple(user_ids)},
                )
            if center_ids:
                conn.execute(
                    text("DELETE FROM center_inventory WHERE center_id NOT IN :ids"),
                    {"ids": tuple(center_ids)},
                )
                conn.execute(
                    text("DELETE FROM distribution_centers WHERE id NOT IN :ids"),
                    {"ids": tuple(center_ids)},
                )
            if listing_ids:
                conn.execute(
                    text("DELETE FROM food_resources WHERE id NOT IN :ids"),
                    {"ids": tuple(listing_ids)},
                )
            print("Replaced local extras so counts match production snapshot")

        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

        counts = {
            "users": conn.execute(text("SELECT COUNT(*) FROM users")).scalar(),
            "distribution_centers": conn.execute(text("SELECT COUNT(*) FROM distribution_centers")).scalar(),
            "food_resources": conn.execute(text("SELECT COUNT(*) FROM food_resources")).scalar(),
            "page_contents": conn.execute(text("SELECT COUNT(*) FROM page_contents")).scalar(),
        }

    print(f"Upserted: {u_n} users, {c_n} centers, {l_n} listings, {p_n} pages")
    print("Local counts:", counts)
    print(f"Local login password for all synced users: {LOCAL_DEV_PASSWORD}")
    print("Note: this is an API mirror, not a full mysqldump (passwords/AI tables/etc. differ).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
