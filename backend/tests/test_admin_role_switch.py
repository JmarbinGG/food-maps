"""Tests for profile role-switch authorization (admin restore gated by JWT)."""
from __future__ import annotations

from backend.app import _resolve_profile_role_update


class TestResolveProfileRoleUpdate:
    def test_allows_common_roles(self):
        for role in ("donor", "recipient", "driver", "volunteer"):
            assert _resolve_profile_role_update(role, jwt_is_admin=False) == role

    def test_admin_to_recipient(self):
        assert _resolve_profile_role_update("recipient", jwt_is_admin=True) == "recipient"

    def test_restore_admin_when_jwt_is_admin(self):
        assert _resolve_profile_role_update("admin", jwt_is_admin=True) == "admin"

    def test_rejects_admin_escalation_without_jwt_flag(self):
        assert _resolve_profile_role_update("admin", jwt_is_admin=False) is None

    def test_rejects_dispatcher_and_unknown(self):
        assert _resolve_profile_role_update("dispatcher", jwt_is_admin=True) is None
        assert _resolve_profile_role_update("superuser", jwt_is_admin=True) is None
        assert _resolve_profile_role_update("", jwt_is_admin=True) is None
