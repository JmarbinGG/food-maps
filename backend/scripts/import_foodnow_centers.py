#!/usr/bin/env python3
"""Import active FoodNow pantry and meal sites into distribution_centers.

Source: https://www.foodnow.net/find-a-food-pantry/
Hours come from the English listing. Sites that FoodNow only describes in
Spanish or Chinese get a short English translation. Re-running updates hours
on centers already stored and does not insert a second row.
"""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.db import SessionLocal
from backend.models import DistributionCenter, User, UserRole

ENDPOINT = "https://accfbfnfaust.wpengine.com/index.php?graphql"
WEBSITE = "https://www.foodnow.net/find-a-food-pantry/"
AGENCY_MARK = "FoodNow agency:"

PANTRY_CODES = {"PANTRY", "RDO-PAN", "JIT PANTRY", "FRP X-PAN", "FIXED PA"}
SCHOOL_CODES = {"SCHOOL PA", "COLLEGE PA"}
MEAL_CODES = {"SOUP KITCH", "RDO-MEAL", "FRP X-MEAL"}

QUERY = """
query getLocations($lang: LanguageCodeFilterEnum, $first: Int, $after: String) {
  locations(where: {language: $lang}, first: $first, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      locationFields {
        agencyIdentifier
        displayName
        addressLine1
        addressLine2
        city
        zipCode
        latitude
        longitude
        archive
        fbcAgencyCategoryCode
        additionalDetails
      }
    }
  }
}
"""

# English hours for sites FoodNow publishes only in Spanish or Chinese.
HOURS_EN = {
    "A1139": "Walk-up distribution. No appointment needed.",
    "A1157": "Thursday 10:00 a.m. to 12:00 p.m. Bring your own bag or cart.",
    "A1161": "Third Tuesday of the month.",
    "A1161-1": "Hot meals are also served on the third Tuesday from 11:00 a.m. to 12:30 p.m.",
    "A1226": "Monday, Wednesday, and Friday from 9:00 a.m. to 1:00 p.m.",
    "A1502": "Please bring your own bag.",
    "A1507": "Drive-through food pickup. Enter from 29th Street.",
    "A1513": "Tuesday from 11:00 a.m. to 1:00 p.m.",
    "A1515": "Proof of address required. Thursdays are only for families with minor children. Saturdays are EBT only.",
    "A1520": "Thursday from 10:30 a.m. to 12:00 p.m.",
    "A1523": "Street parking only. Visit once a week. Bring your own bags.",
    "A1526": "Second and fourth Thursday from 2:00 p.m. to 4:00 p.m. Saturday from 10:00 a.m. to 12:00 p.m. First and third Sunday from 12:30 p.m. to 1:30 p.m.",
    "A1535": "Please bring your own bag if you can.",
    "A1541": "The pantry is open only once a month. Bring your own bags.",
    "A1542": "Third Tuesday from 1:00 p.m. to 4:00 p.m.",
    "A1542-1": "Fourth Tuesday from 1:00 p.m. to 4:00 p.m.",
    "A1558": "Client's choice. Bring your own bag.",
    "A1560": "The distribution site is at the corner of Central and Delmar. Drive up the driveway.",
    "A1567": "Saturday from 10:30 a.m. to 12:00 p.m.",
    "A1571": "Participants may line up 2 hours before distribution. Bring your own bags or carts.",
    "A1573": "Walk-up food distribution in the St. Michael school courtyard. Enter through the 4th Street gate.",
    "A1579": "Drive-up service. Please bring a bag or box.",
    "A1594-1": "Distribution in the church parking lot.",
    "A1595": "Last Thursday of the month, from 11:00 a.m. to 2:00 p.m.",
    "A1600": "To schedule an appointment, email MAS@oaklandtrybe.org or call 510-467-0298.",
    "A1601": "Wednesday and Friday from 9:00 a.m. to 12:00 p.m.",
    "A1609": "Bring your own bags or cart.",
    "A1617": "Second and fourth Thursday from 2:00 p.m. to 4:30 p.m.",
    "A1619": "Tuesday and Thursday from 10:00 a.m. to 12:00 p.m.",
    "A1620": "Wednesday from 4:00 p.m. to 6:00 p.m. Second Friday from 10:00 a.m. to 1:00 p.m. Third Saturday from 12:00 p.m. to 2:00 p.m.",
    "A1622": "First and third Wednesday starting January 2025, from 1:00 p.m. to 2:30 p.m.",
    "A1624": "Wednesday from 8:00 a.m. to 11:00 a.m.",
    "A1624-1": "Friday from 10:00 a.m. to 12:00 p.m.",
    "A9415": "Distribution from 10:00 a.m. to 12:00 p.m. Bring your own bags or carts. Bilingual English/Spanish.",
    "A9425": "Every fourth Monday, except May and December, when it is the third Monday. Bring your own bags.",
    "A9706": "Holiday distributions on 11/20/25 and 12/18/25. No distributions on the second and fourth Thursday of November and December.",
    "A9710": "Two lines: one for school families and one for community members.",
}


def graphql(variables: dict) -> dict:
    payload = json.dumps({"query": QUERY, "variables": variables}).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "DoGoodFoodMaps/1.0 (food resource import)",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode("utf-8"))
    if body.get("errors"):
        raise RuntimeError(json.dumps(body["errors"]))
    return body["data"]


def fetch_language(lang: str) -> dict[str, dict]:
    sites = {}
    after = None
    while True:
        data = graphql({"lang": lang, "first": 100, "after": after})
        connection = data["locations"]
        for node in connection["nodes"]:
            fields = node.get("locationFields") or {}
            if fields.get("archive"):
                continue
            marker = agency_id(fields)
            if marker:
                sites[marker] = fields
        page = connection["pageInfo"]
        if not page["hasNextPage"]:
            break
        after = page["endCursor"]
    return sites


def hours_for(marker: str, english: dict, spanish: dict, chinese: dict) -> str | None:
    text = str((english.get(marker) or {}).get("additionalDetails") or "").strip()
    if text:
        return text
    if str((spanish.get(marker) or {}).get("additionalDetails") or "").strip() or str((chinese.get(marker) or {}).get("additionalDetails") or "").strip():
        return HOURS_EN.get(marker) or None
    return None


def provider_type(category: str) -> tuple[str, bool]:
    code = (category or "").strip().upper()
    if code in SCHOOL_CODES:
        return "School food distribution", True
    if code in MEAL_CODES:
        return "Community meal / hot meals", False
    return "Food pantry", False


def format_address(fields: dict) -> str:
    street = ", ".join(
        part.strip()
        for part in (fields.get("addressLine1"), fields.get("addressLine2"))
        if part and str(part).strip()
    )
    city = (fields.get("city") or "").strip()
    zip_code = (fields.get("zipCode") or "").strip()
    locality = " ".join(part for part in ("CA", zip_code) if part).strip()
    return ", ".join(part for part in (street, city, locality) if part)


def agency_id(fields: dict) -> str:
    return str(fields.get("agencyIdentifier") or "").strip()


def centers_by_agency(db) -> dict[str, DistributionCenter]:
    found = {}
    rows = db.query(DistributionCenter).all()
    for center in rows:
        text = center.description or ""
        start = text.find(AGENCY_MARK)
        if start < 0:
            continue
        token = text[start + len(AGENCY_MARK):].split()[0].strip(" .")
        if token:
            found[token] = center
    return found


def owner_id(db) -> int:
    admin = db.query(User).filter(User.is_admin.is_(True)).order_by(User.id).first()
    if admin is None:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).order_by(User.id).first()
    if admin is None:
        admin = db.query(User).filter(User.email.ilike("%admin%")).order_by(User.id).first()
    if admin is None:
        admin = db.query(User).order_by(User.id).first()
    if admin is None:
        raise SystemExit("No users in the database. Start the app once so an owner exists.")
    return admin.id


def usable_coords(fields: dict) -> tuple[float, float] | None:
    try:
        lat = float(fields.get("latitude"))
        lng = float(fields.get("longitude"))
    except (TypeError, ValueError):
        return None
    if abs(lat) < 0.01 and abs(lng) < 0.01:
        return None
    return lat, lng


def main() -> None:
    english = fetch_language("EN")
    spanish = fetch_language("ES")
    chinese = fetch_language("ZH")
    agency_ids = set(english) | set(spanish) | set(chinese)
    db = SessionLocal()
    try:
        owner = owner_id(db)
        stored = centers_by_agency(db)
        inserted = 0
        updated = 0
        skipped_incomplete = 0

        for marker in sorted(agency_ids):
            fields = english.get(marker) or spanish.get(marker) or chinese.get(marker) or {}
            hours = hours_for(marker, english, spanish, chinese)
            existing = stored.get(marker)
            if existing is not None:
                existing.hours = hours
                updated += 1
                continue

            coords = usable_coords(fields)
            name = str(fields.get("displayName") or "").strip()
            address = format_address(fields)
            if not name or not address or coords is None:
                skipped_incomplete += 1
                continue

            category = str(fields.get("fbcAgencyCategoryCode") or "").strip()
            kind, is_school = provider_type(category)
            label = category or "unspecified"
            db.add(DistributionCenter(
                owner_id=owner,
                name=name[:255],
                description=f"Listed on FoodNow ({label}). {AGENCY_MARK}{marker}",
                address=address[:255],
                coords_lat=coords[0],
                coords_lng=coords[1],
                hours=hours,
                is_active=True,
                website=WEBSITE,
                coverage_areas=(fields.get("city") or "").strip() or None,
                provider_types=json.dumps([kind]),
                school_partner=is_school,
                partner_badge="school" if is_school else None,
            ))
            inserted += 1

        db.commit()
        print(
            f"agencies={len(agency_ids)} inserted={inserted} "
            f"updated={updated} incomplete={skipped_incomplete}"
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
