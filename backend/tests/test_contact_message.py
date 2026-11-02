"""Public contact form: validation, storage, and admin email."""
from __future__ import annotations

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
from backend.models import Base, ContactMessage, User, UserRole  # noqa: E402


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


def _admin(db_session, email="admin@example.com"):
    user = User(
        email=email,
        name=email.split("@")[0],
        password_hash="not-used",
        role=UserRole.ADMIN,
        is_admin=True,
        created_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    return user


def _payload(**overrides):
    body = {
        "full_name": "Grace Hopper",
        "email": "Grace@Example.com",
        "phone": "(510) 555-0199",
        "city": "Oakland",
        "topic": "story",
        "message": "Our block started a fridge at the corner store.",
    }
    body.update(overrides)
    return body


class TestContactMessage:
    def test_valid_message_is_stored_and_emailed_to_admins(self, client, db_session):
        _admin(db_session)
        with patch("backend.app.send_contact_message_email") as send:
            res = client.post("/api/contact-messages", json=_payload())

        assert res.status_code == 200
        assert res.json()["success"] is True
        row = db_session.query(ContactMessage).one()
        assert row.email == "grace@example.com"
        assert row.topic == "story"
        assert row.city == "Oakland"

        send.assert_called_once()
        to_email, fields = send.call_args.args
        assert to_email == "admin@example.com"
        assert fields["topic"] == "Share a local story"
        assert "fridge" in fields["message"]

    @pytest.mark.parametrize("override", [
        {"message": "   "},
        {"topic": "spam"},
        {"email": "not-an-email"},
        {"full_name": ""},
        {"city": "Atlantis"},
    ])
    def test_invalid_message_is_rejected(self, client, db_session, override):
        _admin(db_session)
        with patch("backend.app.send_contact_message_email") as send:
            res = client.post("/api/contact-messages", json=_payload(**override))
        assert res.status_code == 400
        assert db_session.query(ContactMessage).count() == 0
        send.assert_not_called()

    def test_email_failure_keeps_the_message(self, client, db_session):
        _admin(db_session)
        with patch("backend.app.send_contact_message_email", side_effect=RuntimeError("smtp down")):
            res = client.post("/api/contact-messages", json=_payload())
        assert res.status_code == 200
        assert db_session.query(ContactMessage).count() == 1
