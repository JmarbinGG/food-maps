#!/usr/bin/env python3
"""Copy DoGoods impact entries (dogoods.store /admin/impact) into impact_data.

Run on a host that can reach the database (same env as the app). Try it on
staging first:

  cd /home/ec2-user/project
  python3 backend/scripts/import_dogoods_impact.py --create-missing-communities     # dry run
  python3 backend/scripts/import_dogoods_impact.py --create-missing-communities \\
      --apply --confirm-host <database host printed by the dry run>                # write

--apply on MySQL refuses to run unless --confirm-host repeats the database
host, so a shell pointed at the wrong database can't be written to.

Safe to re-run: every imported row stores source_ref="dogoods:<uuid>", and
rows already present are skipped. Community rows are matched to
distribution_centers by name. --create-missing-communities adds DoGoods
communities that have no matching center (address, hours and contact from
the DoGoods export) in the same transaction as the entries. Without it, or
for a community the export doesn't describe, the run stops before writing
anything (map a name with --alias "DoGoods name=Center name").
A few DoGoods names already exist on this map under a different spelling;
those are mapped in DEFAULT_COMMUNITY_ALIASES so a re-import attaches the
rows to the existing center instead of creating a second one.
Rows with neither an organization nor a community are skipped, as the
DoGoods page hides them too.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter
from datetime import date, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DEFAULT_FILE = os.path.join(DATA_DIR, "dogoods_impact_data_2026-10-21.json")
DEFAULT_COMMUNITIES_FILE = os.path.join(DATA_DIR, "dogoods_communities_2026-10-22.json")
# Same place, different spelling. The destination is the distribution center
# already on the map. Youth Spirit Art Works (633 Hegenberger, Oakland) is a
# different site from Youth Spirit Artworks (1740 Alcatraz, Berkeley).
DEFAULT_COMMUNITY_ALIASES = {
    "Island HS CC": "Island High School",
    "Lodestar Charter School": "Lodestar A Light House Community Public School",
    "Markham Elementary": "Markham Elementary School",
    "Garfield Elementary": "Garfield Elementary School",
    "NEA/ACLC CC": "Nea / ACLC Schools",
}
MAX_POUNDS = 10_000_000
MAX_PEOPLE = 1_000_000


def _norm(name: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (name or "").lower()).strip()


def _text(value) -> str:
    return (value or "").strip() if isinstance(value, str) else ""


def _num(value, cast, limit, field, ref):
    try:
        number = cast(value or 0)
    except (TypeError, ValueError):
        raise ValueError(f"{ref}: {field} is not a number ({value!r})")
    if number < 0 or number > limit:
        raise ValueError(f"{ref}: {field} out of range ({number})")
    return number


def _timestamp(value):
    if not value:
        return None
    try:
        # Stored naive UTC like the rest of the app.
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


def plan_import(source_rows: list[dict], centers: list[tuple[int, str]], aliases: dict[str, str]) -> dict:
    """Pure mapping step: DoGoods rows -> impact_data values, plus problems."""
    by_name: dict[str, list[tuple[int, str]]] = {}
    for cid, name in centers:
        by_name.setdefault(_norm(name), []).append((cid, name))

    entries, skipped, unmatched, ambiguous, errors = [], [], Counter(), {}, []
    for raw in source_rows:
        ref = f"dogoods:{raw.get('id')}"
        org = _text(raw.get("organization"))
        community = _text(raw.get("communities_served"))
        if not org and not community:
            skipped.append(ref)
            continue
        try:
            row_date = date.fromisoformat(str(raw.get("date"))[:10])
        except ValueError:
            errors.append(f"{ref}: bad date {raw.get('date')!r}")
            continue
        values = {
            "source_ref": ref,
            "date": row_date,
            "notes": _text(raw.get("notes")) or None,
            "created_at": _timestamp(raw.get("created_at")),
            "updated_at": _timestamp(raw.get("updated_at")) or _timestamp(raw.get("created_at")),
        }
        try:
            if org:
                values.update(
                    organization=org[:255],
                    food_saved_from_waste_lb=_num(raw.get("food_saved_from_waste_lb"), float, MAX_POUNDS, "food_saved_from_waste_lb", ref),
                    food_donated_lb=_num(raw.get("food_donated"), float, MAX_POUNDS, "food_donated", ref),
                )
            else:
                # Prefer the alias only when that center exists. A database that
                # already uses the DoGoods spelling keeps matching on the name.
                aliased = aliases.get(_norm(community))
                matches = by_name.get(_norm(aliased), []) if aliased else []
                if not matches:
                    matches = by_name.get(_norm(community), [])
                if not matches:
                    unmatched[community] += 1
                    continue
                if len(matches) > 1:
                    ambiguous[community] = matches
                    continue
                cid, cname = matches[0]
                values.update(
                    community_id=cid,
                    community_name=cname,
                    families_helped=_num(raw.get("families_helped"), int, MAX_PEOPLE, "families_helped", ref),
                    school_staff_helped=_num(raw.get("school_staff_helped"), int, MAX_PEOPLE, "school_staff_helped", ref),
                    food_given_lb=_num(raw.get("food_given_lb"), float, MAX_POUNDS, "food_given_lb", ref),
                )
        except ValueError as exc:
            errors.append(str(exc))
            continue
        entries.append(values)
    return {"entries": entries, "skipped": skipped, "unmatched": unmatched, "ambiguous": ambiguous, "errors": errors}


def _totals(entries: list[dict]) -> dict:
    keys = ("food_saved_from_waste_lb", "food_donated_lb", "food_given_lb", "families_helped", "school_staff_helped")
    return {k: round(sum(e.get(k) or 0 for e in entries), 1) for k in keys}


def _db_url():
    from backend.db import engine
    return engine.url


def _require_confirmed_host(parser, url, confirm_host: str | None) -> None:
    """--apply on a server database needs its host repeated, so a shell that
    is unexpectedly pointed at production can't be written to."""
    if url.drivername.startswith("sqlite"):
        return
    if not confirm_host:
        parser.error(f"--apply on {url.host} needs --confirm-host {url.host}")
    if confirm_host.strip().lower() != (url.host or "").lower():
        parser.error(f"--confirm-host {confirm_host!r} does not match the database host {url.host!r}")


def _looks_like_school(name: str) -> bool:
    return bool(re.search(r"\b(school|elementary|academy|high|middle|cc|charter)\b", name, re.I))


def _coord(value):
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    return value or None  # DoGoods stores 0 for "unknown"


def center_from_dogoods(community: dict, owner_id) -> dict:
    """distribution_centers values for a DoGoods community."""
    name = _text(community.get("name"))
    school = _looks_like_school(name)
    return {
        "name": name,
        "address": _text(community.get("location")) or None,
        "coords_lat": _coord(community.get("latitude")),
        "coords_lng": _coord(community.get("longitude")),
        "phone": _text(community.get("phone")) or None,
        "hours": _text(community.get("hours")) or None,
        "description": _text(community.get("description")) or None,
        "logo_url": _text(community.get("image")) or None,
        "is_active": True,
        "owner_id": owner_id,
        "school_partner": school,
        "partner_badge": "school" if school else "community",
        "provider_types": json.dumps(["School food distribution"] if school else ["Food pantry"]),
    }


def _load_rows(path: str, key: str) -> list[dict]:
    with open(path, encoding="utf-8") as fh:
        payload = json.load(fh)
    return payload[key] if isinstance(payload, dict) else payload


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--file", default=DEFAULT_FILE, help="DoGoods impact_data export (JSON)")
    parser.add_argument("--apply", action="store_true", help="write to the database (default: dry run)")
    parser.add_argument("--confirm-host", help="required with --apply on MySQL: repeat the database host")
    parser.add_argument("--alias", action="append", default=[], metavar="'DoGoods name=Center name'",
                        help="map a DoGoods community name to a distribution center name")
    parser.add_argument("--create-missing-communities", action="store_true",
                        help="add unmatched communities as distribution centers, from --communities-file")
    parser.add_argument("--communities-file", default=DEFAULT_COMMUNITIES_FILE,
                        help="DoGoods communities export (JSON) for --create-missing-communities")
    args = parser.parse_args(argv)

    if args.apply:
        _require_confirmed_host(parser, _db_url(), args.confirm_host)

    aliases = {_norm(src): dst for src, dst in DEFAULT_COMMUNITY_ALIASES.items()}
    for item in args.alias:
        if "=" not in item:
            parser.error(f"--alias needs 'DoGoods name=Center name', got {item!r}")
        src, dst = item.split("=", 1)
        aliases[_norm(src)] = dst.strip()

    source_rows = _load_rows(args.file, "rows")
    community_details = {}
    if args.create_missing_communities:
        community_details = {_norm(c["name"]): c for c in _load_rows(args.communities_file, "communities")
                             if _text(c.get("name"))}

    from sqlalchemy import inspect

    from backend.db import SessionLocal, engine
    from backend.models import DistributionCenter, ImpactEntry, User

    table_exists = inspect(engine).has_table(ImpactEntry.__tablename__)
    if args.apply and not table_exists:
        # Normally created by the app at startup; this covers running the
        # import before the first restart on the new code.
        ImpactEntry.__table__.create(bind=engine, checkfirst=True)
        table_exists = True

    def load_centers():
        return [(c.id, c.name) for c in db.query(DistributionCenter.id, DistributionCenter.name).all() if c.name]

    db = SessionLocal()
    try:
        centers = load_centers()
        existing_center_count = len(centers)
        plan = plan_import(source_rows, centers, aliases)

        # Communities to add: unmatched names the DoGoods export describes.
        to_create = [community_details[_norm(n)] for n in plan["unmatched"] if _norm(n) in community_details]
        if to_create:
            admin = db.query(User.id).filter(User.is_admin == True).order_by(User.id).first()  # noqa: E712
            new_centers = [center_from_dogoods(c, admin[0] if admin else None) for c in to_create]
            if args.apply:
                db.add_all(DistributionCenter(**values) for values in new_centers)
                db.flush()  # assigns ids; committed together with the entries below
                centers = load_centers()
            else:
                # Dry run: stand-in ids so the rest of the plan is still checked.
                centers = centers + [(-(i + 1), v["name"]) for i, v in enumerate(new_centers)]
            plan = plan_import(source_rows, centers, aliases)

        print(f"Source: {args.file} ({len(source_rows)} rows)")
        print(f"Database: {engine.url.render_as_string(hide_password=True)}")
        print(f"Distribution centers already in the database: {existing_center_count}")
        if to_create:
            verb = "Creating" if args.apply else "Would create"
            print(f"\n{verb} {len(to_create)} communit{'y' if len(to_create) == 1 else 'ies'} from DoGoods:")
            for c in to_create:
                print(f"  {c['name']}  ({_text(c.get('location'))})")
        print(f"\nSkipped (no organization or community, hidden on DoGoods too): {len(plan['skipped'])}")
        mapped = Counter((e.get("community_name") or e.get("organization"),
                          "community" if e.get("community_id") else "organization") for e in plan["entries"])
        print(f"\nMapped {len(plan['entries'])} rows:")
        for (name, kind), n in sorted(mapped.items(), key=lambda kv: (kv[0][1], kv[0][0].lower())):
            print(f"  {kind:12} {n:4}  {name}")

        problems = False
        if plan["unmatched"]:
            problems = True
            hint = "" if args.create_missing_communities else ", or use --create-missing-communities"
            print(f"\nNO MATCHING DISTRIBUTION CENTER (add the center or map it with --alias{hint}):")
            for name, n in plan["unmatched"].most_common():
                print(f"  {n:4}  {name}")
        if plan["ambiguous"]:
            problems = True
            print("\nMORE THAN ONE CENTER WITH THIS NAME (rename one, or map with --alias):")
            for name, matches in plan["ambiguous"].items():
                print(f"  {name}: {matches}")
        if plan["errors"]:
            problems = True
            print("\nINVALID ROWS:")
            for err in plan["errors"]:
                print(f"  {err}")

        refs = [e["source_ref"] for e in plan["entries"]]
        existing = set()
        if table_exists and refs:
            existing = {r for (r,) in db.query(ImpactEntry.source_ref).filter(ImpactEntry.source_ref.in_(refs)).all()}
        elif not table_exists:
            print("\nimpact_data table does not exist yet (created on --apply or at app startup).")
        new = [e for e in plan["entries"] if e["source_ref"] not in existing]
        print(f"\nAlready imported (skipped): {len(existing)}   New: {len(new)}")
        print(f"Totals being added: {_totals(new)}")

        if problems:
            db.rollback()  # also drops any communities created above
            print("\nStopped: fix the problems above; nothing was written.")
            return 2
        if not args.apply:
            print("\nDry run only. Re-run with --apply to write these rows.")
            return 0
        db.add_all(ImpactEntry(**values) for values in new)
        db.commit()
        created = f" and created {len(to_create)} communities" if to_create else ""
        print(f"\nImported {len(new)} rows{created}.")
        return 0
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
