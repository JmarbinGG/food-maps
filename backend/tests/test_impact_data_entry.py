"""Admin impact data entry (port of DoGoods /admin/impact)."""
from __future__ import annotations

import os
from datetime import datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import JWT_ALGORITHM, JWT_SECRET, app  # noqa: E402
from backend.db import get_db  # noqa: E402
from backend.models import Base, DistributionCenter, ImpactEntry, User, UserRole  # noqa: E402


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        yield TestClient(app, raise_server_exceptions=False)
    finally:
        app.dependency_overrides.pop(get_db, None)


def _user(db, email, role=UserRole.DONOR, is_admin=False):
    user = User(email=email, name=email.split("@")[0], password_hash="x", role=role,
                is_admin=is_admin, created_at=datetime.utcnow())
    db.add(user)
    db.commit()
    return user


def _headers(user):
    now = datetime.utcnow()
    token = jwt.encode(
        {"sub": str(user.id), "role": user.role.value, "iat": now, "exp": now + timedelta(hours=1)},
        JWT_SECRET, algorithm=JWT_ALGORITHM,
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def world(db_session):
    admin = _user(db_session, "admin@example.com", UserRole.ADMIN, is_admin=True)
    donor = _user(db_session, "donor@example.com")
    school = DistributionCenter(name="Island HS CC", address="1 Main St", is_active=True)
    closed = DistributionCenter(name="Old Pantry", address="2 Main St", is_active=False)
    db_session.add_all([school, closed])
    db_session.commit()
    return {"admin": admin, "donor": donor, "school": school, "closed": closed}


def test_non_admins_cannot_read_or_write(client, world):
    donor = _headers(world["donor"])
    assert client.get("/api/admin/impact").status_code in (401, 403)
    assert client.get("/api/admin/impact", headers=donor).status_code == 403
    assert client.post("/api/admin/impact", headers=donor,
                       json={"date": "2026-10-20", "organization": "Food Shift"}).status_code == 403
    assert client.get("/api/admin/impact/summary", headers=donor).status_code == 403


def test_organization_entry_round_trip(client, world, db_session):
    h = _headers(world["admin"])
    res = client.post("/api/admin/impact", headers=h, json={
        "date": "2026-10-20", "organization": "  Food Shift ", "food_saved_from_waste_lb": 120.5,
        "food_donated_lb": 80, "notes": "Weekly pickup",
        # Community metrics on an organization row are dropped, not stored.
        "families_helped": 9,
    })
    assert res.status_code == 200, res.text
    entry = res.json()
    assert entry["kind"] == "organization"
    assert entry["organization"] == "Food Shift"
    assert entry["families_helped"] == 0

    res = client.patch(f"/api/admin/impact/{entry['id']}", headers=h, json={"food_donated_lb": 95})
    assert res.status_code == 200 and res.json()["food_donated_lb"] == 95

    listed = client.get("/api/admin/impact", headers=h).json()
    assert listed["total"] == 1 and listed["entries"][0]["food_donated_lb"] == 95

    assert client.delete(f"/api/admin/impact/{entry['id']}", headers=h).status_code == 200
    assert db_session.query(ImpactEntry).count() == 0


def test_community_entry_stores_center_name(client, world):
    h = _headers(world["admin"])
    res = client.post("/api/admin/impact", headers=h, json={
        "date": "2026-10-20", "community_id": world["school"].id,
        "families_helped": 14, "school_staff_helped": 3, "food_given_lb": 210,
    })
    assert res.status_code == 200, res.text
    assert res.json()["kind"] == "community"
    assert res.json()["community_name"] == "Island HS CC"


@pytest.mark.parametrize("body", [
    {"date": "2026-10-20"},                                              # neither kind
    {"date": "2026-10-20", "organization": "X", "community_id": 1},     # both kinds
    {"date": "2026-10-20", "organization": "X", "food_donated_lb": -5},  # negative
    {"date": "2026-10-20", "organization": "X", "food_donated_lb": 1e9},  # typo-sized
    {"date": "not-a-date", "organization": "X"},
])
def test_invalid_entries_are_rejected(client, world, body):
    res = client.post("/api/admin/impact", headers=_headers(world["admin"]), json=body)
    assert res.status_code == 422


def test_unknown_community_is_rejected(client, world):
    res = client.post("/api/admin/impact", headers=_headers(world["admin"]),
                      json={"date": "2026-10-20", "community_id": 9999, "families_helped": 1})
    assert res.status_code == 400


def test_update_cannot_mix_kinds_or_blank_required_fields(client, world):
    h = _headers(world["admin"])
    org = client.post("/api/admin/impact", headers=h,
                      json={"date": "2026-10-20", "organization": "Food Shift"}).json()
    assert client.patch(f"/api/admin/impact/{org['id']}", headers=h,
                        json={"families_helped": 3}).status_code == 400
    assert client.patch(f"/api/admin/impact/{org['id']}", headers=h,
                        json={"organization": "   "}).status_code == 400
    assert client.patch("/api/admin/impact/999", headers=h, json={"notes": "x"}).status_code == 404


def test_summary_totals_by_community_and_organization_with_date_range(client, world):
    h = _headers(world["admin"])
    school = world["school"].id
    for body in [
        {"date": "2026-10-19", "community_id": school, "families_helped": 10, "food_given_lb": 100},
        {"date": "2026-10-20", "community_id": school, "families_helped": 5, "school_staff_helped": 2, "food_given_lb": 50},
        {"date": "2026-09-01", "community_id": school, "families_helped": 99, "food_given_lb": 999},
        {"date": "2026-10-20", "organization": "Food Shift", "food_saved_from_waste_lb": 40, "food_donated_lb": 30},
        {"date": "2026-10-21", "organization": "Food Shift", "food_saved_from_waste_lb": 10},
    ]:
        assert client.post("/api/admin/impact", headers=h, json=body).status_code == 200

    week = client.get("/api/admin/impact/summary?start=2026-10-18&end=2026-10-24", headers=h).json()
    assert week["communities"] == [{
        "community_id": school, "community_name": "Island HS CC", "food_given_lb": 150.0,
        "families_helped": 15, "school_staff_helped": 2, "entries": 2,
    }]
    assert week["organizations"][0]["food_saved_from_waste_lb"] == 50.0
    assert week["totals"]["families_helped"] == 15

    everything = client.get("/api/admin/impact/summary", headers=h).json()
    assert everything["totals"]["food_given_lb"] == 1149.0

    in_week = client.get("/api/admin/impact?start=2026-10-18&end=2026-10-24", headers=h).json()
    assert len(in_week["entries"]) == 4 and in_week["total"] == 5
    assert client.get("/api/admin/impact?start=10/18/2026", headers=h).status_code == 400


def test_options_list_active_communities_and_known_organizations(client, world):
    h = _headers(world["admin"])
    client.post("/api/admin/impact", headers=h, json={"date": "2026-10-20", "organization": "Rotary Club"})
    opts = client.get("/api/admin/impact/options", headers=h).json()
    assert opts["communities"] == [{"id": world["school"].id, "name": "Island HS CC"}]
    assert "Rotary Club" in opts["organizations"]
    assert "Food Shift" in opts["organizations"]


def test_dogoods_style_link_redirects_into_the_app(client):
    res = client.get("/admin/impact?dateFilter=current-week&view=communities&next=//evil.example",
                     follow_redirects=False)
    assert res.status_code == 302
    assert res.headers["location"] == "/index.html?tab=impact&dateFilter=current-week&view=communities"
    bad = client.get("/admin/impact?dateFilter=<script>", follow_redirects=False)
    assert bad.headers["location"] == "/index.html?tab=impact"
