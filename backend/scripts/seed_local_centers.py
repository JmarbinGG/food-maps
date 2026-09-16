"""Seed sample distribution centers into local SQLite (backend/food_maps_local.db)."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "food_maps_local.db"

SAMPLES = [
    {
        "name": "Alameda Community Food Hub",
        "description": (
            "Neighborhood pantry and school partner site. "
            "Sample center for testing social icons on map pins."
        ),
        "address": "2200 Central Ave, Alameda, CA 94501",
        "coords_lat": 37.7652,
        "coords_lng": -122.2416,
        "phone": "(510) 555-0101",
        "hours": "Mon–Fri 10am–4pm",
        "is_active": 1,
        "eligibility": "Open to Alameda residents",
        "languages": "English, Spanish",
        "availability": "open",
        "website": "https://example.com/alameda-food-hub",
        "social_media": json.dumps({
            "facebook": "https://facebook.com/foodmaps",
            "instagram": "https://instagram.com/foodmaps",
            "twitter": "https://x.com/foodmaps",
        }),
        "coverage_areas": "Alameda, Bay Farm",
        "provider_types": json.dumps(["Food pantry", "School food distribution"]),
        "logo_url": None,
        "school_partner": 1,
        "partner_badge": "school",
    },
    {
        "name": "Oakland Pantry Network",
        "description": (
            "Volunteer-run pantry serving East Oakland. "
            "Tap the social icons on the map pin details."
        ),
        "address": "1500 Fruitvale Ave, Oakland, CA 94601",
        "coords_lat": 37.7756,
        "coords_lng": -122.2250,
        "phone": "(510) 555-0202",
        "hours": "Tue/Thu 1pm–6pm",
        "is_active": 1,
        "eligibility": "Anyone in need",
        "languages": "English, Spanish, Chinese",
        "availability": "limited",
        "website": "https://example.com/oakland-pantry",
        "social_media": json.dumps({
            "instagram": "https://instagram.com/oaklandpantry",
            "youtube": "https://youtube.com/@foodmaps",
            "tiktok": "https://tiktok.com/@foodmaps",
        }),
        "coverage_areas": "Fruitvale, San Antonio",
        "provider_types": json.dumps(["Food pantry", "Produce distribution"]),
        "logo_url": None,
        "school_partner": 0,
        "partner_badge": "community",
    },
    {
        "name": "Berkeley School Meal Site",
        "description": "School partner distribution for students and families only.",
        "address": "1980 Allston Way, Berkeley, CA 94704",
        "coords_lat": 37.8697,
        "coords_lng": -122.2708,
        "phone": "(510) 555-0303",
        "hours": "Wed 3pm–6pm",
        "is_active": 1,
        "eligibility": "Students and families of partner schools",
        "languages": "English",
        "availability": "appointment",
        "website": "https://example.com/berkeley-meals",
        "social_media": json.dumps({
            "facebook": "https://facebook.com/berkeleymeals",
            "linkedin": "https://linkedin.com/company/foodmaps",
        }),
        "coverage_areas": "Berkeley",
        "provider_types": json.dumps(["School meal program", "Food box distribution"]),
        "logo_url": None,
        "school_partner": 1,
        "partner_badge": "school",
    },
]


def main() -> None:
    if not DB.exists():
        raise SystemExit(f"DB not found: {DB}")

    con = sqlite3.connect(str(DB))
    con.row_factory = sqlite3.Row
    cols = {r[1] for r in con.execute("pragma table_info(distribution_centers)")}
    users = list(con.execute("select id, email from users"))
    if not users:
        raise SystemExit("No users in local DB — start the app once to seed smoke users.")
    owner = next((u["id"] for u in users if "admin" in (u["email"] or "")), users[0]["id"])

    names = [s["name"] for s in SAMPLES]
    con.execute(
        f"DELETE FROM distribution_centers WHERE name IN ({','.join('?' for _ in names)})",
        names,
    )

    insert_cols = [
        "owner_id", "name", "description", "address", "coords_lat", "coords_lng",
        "phone", "hours", "is_active", "eligibility", "languages", "availability",
        "website", "social_media", "coverage_areas", "provider_types", "logo_url",
        "school_partner", "partner_badge", "created_at", "last_updated",
    ]
    insert_cols = [c for c in insert_cols if c in cols]
    now = datetime.now(timezone.utc).replace(tzinfo=None).isoformat(sep=" ")

    for sample in SAMPLES:
        row = {"owner_id": owner, "created_at": now, "last_updated": now, **sample}
        vals = [row.get(c) for c in insert_cols]
        placeholders = ",".join("?" for _ in insert_cols)
        con.execute(
            f"INSERT INTO distribution_centers ({','.join(insert_cols)}) VALUES ({placeholders})",
            vals,
        )

    con.commit()
    print(f"Seeded into {DB}")
    for r in con.execute("select id, name, social_media from distribution_centers order by id"):
        print(f"  #{r['id']} {r['name']} | {r['social_media']}")
    con.close()


if __name__ == "__main__":
    main()
