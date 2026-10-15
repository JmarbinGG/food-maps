"""Public volunteer signup: validation, storage, and admin email."""
from __future__ import annotations

import json
import os
from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("ALLOW_SQLITE", "1")

from backend.app import app  # noqa: E402
from backend.db import get_db  # noqa: E402
from backend.models import Base, User, UserRole, VolunteerSignup  # noqa: E402


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


def _user(db_session, *, email, role, is_admin=None):
    user = User(
        email=email,
        name=email.split("@")[0],
        password_hash="not-used",
        role=role,
        is_admin=is_admin,
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    return user


def _payload(**overrides):
    body = {
        "full_name": "Ada Lovelace",
        "email": "ada@example.com",
        "phone": "(510) 555-0123",
        "city": "Oakland",
        "languages": "English, Spanish",
        "help": ["verify_listings", "delivery_driver"],
        "availability": ["weekday_mornings", "weekends"],
        "has_car": "Sometimes",
        "notes": "I can help on Saturdays.",
    }
    body.update(overrides)
    return body


class TestVolunteerSignup:
    def test_valid_signup_is_stored_and_emailed_to_admins(self, client, db_session):
        _user(db_session, email="admin@example.com", role=UserRole.ADMIN, is_admin=True)
        _user(db_session, email="legacy@example.com", role=UserRole.ADMIN, is_admin=None)
        _user(db_session, email="neighbor@example.com", role=UserRole.RECIPIENT, is_admin=False)

        with patch("backend.app.send_volunteer_signup_email") as send:
            res = client.post("/api/volunteer-signups", json=_payload())

        assert res.status_code == 200
        assert res.json()["success"] is True
        row = db_session.query(VolunteerSignup).one()
        assert row.full_name == "Ada Lovelace"
        assert row.email == "ada@example.com"
        assert row.city == "Oakland"
        assert row.has_car == "Sometimes"
        assert json.loads(row.help_choices) == ["verify_listings", "delivery_driver"]
        assert json.loads(row.availability) == ["weekday_mornings", "weekends"]

        sent_to = sorted(call.args[0] for call in send.call_args_list)
        assert sent_to == ["admin@example.com", "legacy@example.com"]
        fields = send.call_args_list[0].args[1]
        assert fields["help"] == "Verify food listings, Home delivery driver"
        assert "Saturdays" in fields["notes"]

    def test_missing_help_is_rejected(self, client, db_session):
        _user(db_session, email="admin@example.com", role=UserRole.ADMIN, is_admin=True)
        with patch("backend.app.send_volunteer_signup_email") as send:
            res = client.post("/api/volunteer-signups", json=_payload(help=[]))
        assert res.status_code == 400
        assert db_session.query(VolunteerSignup).count() == 0
        send.assert_not_called()

    def test_email_failure_keeps_the_signup(self, client, db_session):
        _user(db_session, email="admin@example.com", role=UserRole.ADMIN, is_admin=True)
        with patch("backend.app.send_volunteer_signup_email", side_effect=RuntimeError("smtp down")):
            res = client.post("/api/volunteer-signups", json=_payload())
        assert res.status_code == 200
        assert db_session.query(VolunteerSignup).count() == 1
