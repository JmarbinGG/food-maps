"""DoGoods impact_data import (backend/scripts/import_dogoods_impact.py)."""
from __future__ import annotations

import json
import os

import pytest

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.db import SessionLocal, engine  # noqa: E402
from backend.models import Base, DistributionCenter, ImpactEntry  # noqa: E402
from backend.scripts import import_dogoods_impact as importer  # noqa: E402

ROWS = [
    {"id": "a1", "date": "2025-12-31", "organization": "Semifreddi's", "food_saved_from_waste_lb": 100,
     "food_donated": 40, "communities_served": None, "notes": "DATA COLLECTED 1/25 - 12/25",
     "created_at": "2026-01-08T19:23:47.400974+00:00"},
    {"id": "a2", "date": "2026-05-07", "organization": None, "communities_served": "Island HS CC",
     "families_helped": 12, "school_staff_helped": 2, "food_given_lb": 300, "notes": "MAY2026 DISTRIBUTIONS"},
    {"id": "a3", "date": "2026-05-08", "organization": "", "communities_served": "NEA/ACLC CC",
     "families_helped": 5, "food_given_lb": 50},
    {"id": "blank", "date": "2026-01-12", "organization": "", "communities_served": None},
]
CENTERS = [(5, "Island HS CC"), (3, "NEA / ACLC CC"), (9, "Other Pantry")]


def test_plan_maps_both_kinds_and_skips_blank_rows():
    plan = importer.plan_import(ROWS, CENTERS, {})
    assert plan["skipped"] == ["dogoods:blank"]
    assert not plan["unmatched"] and not plan["errors"]
    by_ref = {e["source_ref"]: e for e in plan["entries"]}
    assert by_ref["dogoods:a1"]["organization"] == "Semifreddi's"
    assert by_ref["dogoods:a1"]["food_donated_lb"] == 40
    assert by_ref["dogoods:a1"]["created_at"].isoformat().startswith("2026-01-08T19:23:47")
    # Name matching ignores spacing/punctuation ("NEA/ACLC CC" == "NEA / ACLC CC").
    assert by_ref["dogoods:a3"]["community_id"] == 3
    assert by_ref["dogoods:a2"]["community_name"] == "Island HS CC"


def test_plan_reports_unmatched_and_accepts_alias():
    rows = [{"id": "x", "date": "2026-05-01", "communities_served": "Madison Park Academy", "families_helped": 1}]
    assert importer.plan_import(rows, CENTERS, {})["unmatched"] == {"Madison Park Academy": 1}
    plan = importer.plan_import(rows, CENTERS, {importer._norm("Madison Park Academy"): "Other Pantry"})
    assert plan["entries"][0]["community_id"] == 9


def test_plan_rejects_bad_numbers_and_ambiguous_names():
    bad = [{"id": "n", "date": "2026-05-01", "organization": "X", "food_donated": -3}]
    assert importer.plan_import(bad, CENTERS, {})["errors"]
    dupes = [(1, "Island HS CC"), (2, "Island HS CC")]
    rows = [{"id": "d", "date": "2026-05-01", "communities_served": "Island HS CC"}]
    assert "Island HS CC" in importer.plan_import(rows, dupes, {})["ambiguous"]


@pytest.fixture()
def db_with_centers(tmp_path):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(ImpactEntry).delete()
    db.query(DistributionCenter).delete()
    db.add_all([DistributionCenter(id=cid, name=name, address="x", is_active=True) for cid, name in CENTERS])
    db.commit()
    path = tmp_path / "export.json"
    path.write_text(json.dumps({"rows": ROWS}), encoding="utf-8")
    try:
        yield db, str(path)
    finally:
        db.query(ImpactEntry).delete()
        db.query(DistributionCenter).delete()
        db.commit()
        db.close()


def test_dry_run_writes_nothing_then_apply_is_idempotent(db_with_centers, capsys):
    db, path = db_with_centers
    assert importer.main(["--file", path]) == 0
    assert db.query(ImpactEntry).count() == 0
    assert "Dry run only" in capsys.readouterr().out

    assert importer.main(["--file", path, "--apply"]) == 0
    assert db.query(ImpactEntry).count() == 3
    assert importer.main(["--file", path, "--apply"]) == 0  # re-run
    assert db.query(ImpactEntry).count() == 3
    assert "Already imported (skipped): 3" in capsys.readouterr().out


def test_unmatched_community_stops_before_writing(db_with_centers, tmp_path, capsys):
    db, _ = db_with_centers
    path = tmp_path / "bad.json"
    path.write_text(json.dumps([*ROWS, {"id": "z", "date": "2026-05-01",
                                        "communities_served": "Nowhere School", "families_helped": 1}]))
    assert importer.main(["--file", str(path), "--apply"]) == 2
    assert db.query(ImpactEntry).count() == 0
    assert "Nowhere School" in capsys.readouterr().out


def test_creates_missing_communities_in_the_same_transaction(db_with_centers, tmp_path, capsys):
    db, _ = db_with_centers
    rows = [*ROWS, {"id": "m", "date": "2026-05-01", "communities_served": "Madison Park Academy",
                    "families_helped": 7, "food_given_lb": 70}]
    data = tmp_path / "rows.json"
    data.write_text(json.dumps({"rows": rows}), encoding="utf-8")
    comms = tmp_path / "comms.json"
    comms.write_text(json.dumps({"communities": [{
        "name": "Madison Park Academy", "location": "400 Capistrano Drive, Oakland, CA 94603",
        "latitude": 37.78, "longitude": -122.2, "phone": "510-000-0000", "hours": "Fri 2pm",
    }]}), encoding="utf-8")
    args = ["--file", str(data), "--communities-file", str(comms), "--create-missing-communities"]

    assert importer.main(args) == 0  # dry run passes, nothing written
    assert db.query(DistributionCenter).filter_by(name="Madison Park Academy").count() == 0
    assert "Would create 1 community" in capsys.readouterr().out

    assert importer.main([*args, "--apply"]) == 0
    center = db.query(DistributionCenter).filter_by(name="Madison Park Academy").one()
    assert center.is_active and center.school_partner and center.coords_lat == 37.78
    entry = db.query(ImpactEntry).filter_by(source_ref="dogoods:m").one()
    assert entry.community_id == center.id and entry.families_helped == 7

    assert importer.main([*args, "--apply"]) == 0  # re-run creates nothing new
    assert db.query(DistributionCenter).filter_by(name="Madison Park Academy").count() == 1


def test_missing_community_without_details_still_stops(db_with_centers, tmp_path, capsys):
    db, _ = db_with_centers
    data = tmp_path / "rows.json"
    data.write_text(json.dumps([{"id": "z", "date": "2026-05-01", "communities_served": "Nowhere School"}]))
    comms = tmp_path / "comms.json"
    comms.write_text(json.dumps({"communities": []}))
    assert importer.main(["--file", str(data), "--communities-file", str(comms),
                          "--create-missing-communities", "--apply"]) == 2
    assert db.query(DistributionCenter).filter_by(name="Nowhere School").count() == 0


def test_apply_on_a_server_database_requires_confirmed_host(monkeypatch, capsys):
    class FakeUrl:
        drivername, host = "mysql+pymysql", "foodmaps-staging.abc.us-west-1.rds.amazonaws.com"
    monkeypatch.setattr(importer, "_db_url", lambda: FakeUrl())
    with pytest.raises(SystemExit):
        importer.main(["--apply"])
    assert "--confirm-host" in capsys.readouterr().err
    with pytest.raises(SystemExit):
        importer.main(["--apply", "--confirm-host", "foodapitest.cj8ia4gu0tvd.us-west-1.rds.amazonaws.com"])
    assert "does not match" in capsys.readouterr().err
