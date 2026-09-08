"""Ensure ai_training_data.json matches canonical platform rules."""
from __future__ import annotations

import json
from pathlib import Path

TRAINING_PATH = Path(__file__).resolve().parents[1] / "ai_training_data.json"


def _load_training() -> dict:
    with TRAINING_PATH.open(encoding="utf-8") as fh:
        return json.load(fh)


class TestTrainingDataAlignment:
    def test_photo_not_optional_in_share_flow(self):
        data = _load_training()
        processes = " ".join(data.get("processes") or [])
        assert "photo optional" not in processes.lower()
        assert "required" in processes.lower() or "attach a real photo" in processes.lower()

    def test_role_permissions_present(self):
        data = _load_training()
        perms = data.get("role_permissions") or []
        joined = " ".join(perms).lower()
        assert "donor" in joined
        assert "recipient" in joined
        assert "never claim" in joined or "never post" in joined

    def test_donor_cannot_claim_in_roles(self):
        data = _load_training()
        roles = data.get("user_roles") or []
        donor = next((r for r in roles if "donor" in str(r.get("role", "")).lower()), None)
        assert donor is not None
        assert "cannot claim" in donor.get("description", "").lower()

    def test_recipient_cannot_post_in_roles(self):
        data = _load_training()
        roles = data.get("user_roles") or []
        recipient = next(
            (r for r in roles if "recipient" in str(r.get("role", "")).lower()),
            None,
        )
        assert recipient is not None
        assert "cannot post" in recipient.get("description", "").lower()

    def test_find_flow_no_sms_code(self):
        data = _load_training()
        processes = " ".join(data.get("processes") or [])
        assert "no sms code" in processes.lower()
