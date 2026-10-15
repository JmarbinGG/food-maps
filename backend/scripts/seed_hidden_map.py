#!/usr/bin/env python3
"""Seed local data for trying private community maps.

Creates (idempotently):
  - "Do Good Hidden Map": the general hidden map, a map-only community with
    its private map enabled and no public pin.
  - "Local Test School": an ordinary community with a public pin.
  - Approval codes for both (topped up to 5 unclaimed each).
  - Phone numbers on the donor/recipient smoke accounts, which posting and
    claiming require.

Then prints the unclaimed codes. Sign in as a smoke account
(password123) and enter a code under Profile to join a community.

Usage:
  python backend/scripts/seed_hidden_map.py
  python backend/scripts/seed_hidden_map.py --force   # non-local database
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.app import (  # noqa: E402
    SessionLocal,
    _add_missing_model_columns,
    _backfill_user_communities,
    _ensure_local_sqlite_users,
    _generate_approval_code_suffix,
    engine,
)
from backend.models import (  # noqa: E402
    ApprovalCode,
    Base,
    DistributionCenter,
    FoodResource,
    User,
    UserCommunity,
)

CODES_PER_COMMUNITY = 5

COMMUNITIES = [
    {
        "school_code": "HID",
        "name": "Do Good Hidden Map",
        "description": "General hidden map. Listings posted here are only visible to members.",
        "address": "Private map (no public location)",
        "coords_lat": 37.7652,
        "coords_lng": -122.2416,
        "private_map_enabled": True,
        "hide_from_public": True,
    },
    {
        "school_code": "LTS",
        "name": "Local Test School",
        "description": "Ordinary community for local testing.",
        "address": "2200 Central Ave, Alameda, CA 94501",
        "coords_lat": 37.7660,
        "coords_lng": -122.2430,
        "private_map_enabled": False,
        "hide_from_public": False,
    },
]

SMOKE_PHONES = {
    "donor.smoke@example.com": "5105550100",
    "recipient.smoke@example.com": "5105550101",
}


def _is_local(url: str) -> bool:
    url = (url or "").lower()
    # "mysql" is the docker-compose database service.
    return url.startswith("sqlite") or any(h in url for h in ("@127.0.0.1", "@localhost", "@mysql:"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="allow a non-local DATABASE_URL")
    args = parser.parse_args()

    url = str(engine.url)
    if not _is_local(url) and not args.force:
        print(f"Refusing to seed test data into a non-local database ({engine.url.render_as_string(hide_password=True)}).")
        print("Re-run with --force if you really mean it.")
        return 1

    Base.metadata.create_all(bind=engine)
    _add_missing_model_columns(User, FoodResource, DistributionCenter, ApprovalCode, UserCommunity)
    _backfill_user_communities()

    db = SessionLocal()
    try:
        _ensure_local_sqlite_users(db)
        # /api/centers types owner_id as a required int, so every center needs one.
        owner = db.query(User).filter(User.email == "admin.smoke@example.com").first()
        if owner is None:
            owner = db.query(User).filter(User.is_admin == True).first()  # noqa: E712
        if owner is None:
            print("No admin user found to own the seeded communities.")
            return 1

        for spec in COMMUNITIES:
            spec = dict(spec)
            school_code = spec.pop("school_code")
            center = db.query(DistributionCenter).filter(DistributionCenter.name == spec["name"]).first()
            if center is None:
                center = DistributionCenter(
                    owner_id=owner.id, is_active=True, created_at=datetime.utcnow(), **spec
                )
                db.add(center)
                db.flush()
                print(f"[new] community #{center.id} {center.name}")
            else:
                center.private_map_enabled = spec["private_map_enabled"]
                center.hide_from_public = spec["hide_from_public"]
                center.is_active = True
                if center.owner_id is None:
                    center.owner_id = owner.id

            open_codes = (
                db.query(ApprovalCode)
                .filter(
                    ApprovalCode.community_id == center.id,
                    ApprovalCode.is_claimed == False,  # noqa: E712
                    ApprovalCode.is_revoked == False,  # noqa: E712
                )
                .count()
            )
            existing = {code for (code,) in db.query(ApprovalCode.code)}
            while open_codes < CODES_PER_COMMUNITY:
                code = f"{school_code}{_generate_approval_code_suffix()}"
                if code in existing:
                    continue
                existing.add(code)
                db.add(ApprovalCode(
                    code=code, school_code=school_code, community_id=center.id,
                    is_claimed=False, is_revoked=False, created_at=datetime.utcnow(),
                ))
                open_codes += 1

        for email, phone in SMOKE_PHONES.items():
            user = db.query(User).filter(User.email == email).first()
            if user and not (user.phone and len(str(user.phone).strip()) >= 7):
                user.phone = phone

        db.commit()

        print()
        for spec in COMMUNITIES:
            center = db.query(DistributionCenter).filter(DistributionCenter.name == spec["name"]).one()
            codes = [
                code for (code,) in db.query(ApprovalCode.code).filter(
                    ApprovalCode.community_id == center.id,
                    ApprovalCode.is_claimed == False,  # noqa: E712
                    ApprovalCode.is_revoked == False,  # noqa: E712
                ).order_by(ApprovalCode.code)
            ]
            flag = "private map" if center.private_map_enabled else "no private map"
            print(f"#{center.id} {center.name} ({flag}): {', '.join(codes)}")
        print("\nSmoke logins (password123): admin.smoke / donor.smoke / recipient.smoke @example.com")
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
