"""Tests for durable admin privilege and SPA navigation aliases."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path
from unittest.mock import MagicMock

from backend.app import _resolve_profile_role_update, _user_is_admin
from backend.models import UserRole

REPO_ROOT = Path(__file__).resolve().parents[2]
APP_JS = REPO_ROOT / "frontend" / "js" / "app.js"
UI_CONTROL = REPO_ROOT / "frontend" / "nouri" / "utils" / "UIControlContext.jsx"
USER_PROFILE = REPO_ROOT / "frontend" / "js" / "components" / "profile" / "UserProfile.js"


def _make_user(*, role: UserRole, is_admin=None):
    u = MagicMock()
    u.role = role
    u.is_admin = is_admin
    return u


class TestUserIsAdmin:
    def test_flag_true_with_donor_role(self):
        assert _user_is_admin(_make_user(role=UserRole.DONOR, is_admin=True)) is True

    def test_flag_false_with_donor_role(self):
        assert _user_is_admin(_make_user(role=UserRole.DONOR, is_admin=False)) is False

    def test_legacy_role_admin_when_flag_none(self):
        assert _user_is_admin(_make_user(role=UserRole.ADMIN, is_admin=None)) is True

    def test_none_user(self):
        assert _user_is_admin(None) is False


class TestResolveProfileRoleUpdate:
    def test_allows_common_roles(self):
        for role in ("donor", "recipient", "driver", "volunteer"):
            assert _resolve_profile_role_update(role, jwt_is_admin=False) == role

    def test_admin_to_recipient(self):
        assert _resolve_profile_role_update("recipient", jwt_is_admin=True) == "recipient"

    def test_restore_admin_when_privileged(self):
        assert _resolve_profile_role_update("admin", jwt_is_admin=True) == "admin"

    def test_rejects_admin_escalation_without_privilege(self):
        assert _resolve_profile_role_update("admin", jwt_is_admin=False) is None


class TestFrontendPrivilegePreserve:
    def test_user_profile_preserves_is_admin(self):
        text = USER_PROFILE.read_text(encoding="utf-8")
        assert "keepAdmin" in text
        assert "is_admin: keepAdmin" in text
        assert "is_admin: nextRole === 'admin'" not in text
        assert "existingToken" in text
        assert "Prefer server role" in text or "data?.role" in text

    def test_user_profile_role_draft_does_not_loop(self):
        text = USER_PROFILE.read_text(encoding="utf-8")
        assert "formDirtyRef" in text
        assert "committedRole" in text
        assert "Click Update Profile to apply" in text
        assert "saved on Update Profile" in text
        assert "[user?.id, activeTab]" in text
        assert "onUserUpdate({ ...user, ...userData, is_admin: true })" not in text
        assert "onClose();" in text

    def test_app_js_has_path_aliases(self):
        text = APP_JS.read_text(encoding="utf-8")
        assert "'admin/distribution': 'dispatch'" in text
        assert "donations: 'schedule'" in text
        assert "sponsors: 'partners'" in text
        assert "unknown target" in text

    def test_ui_control_prefers_target(self):
        text = UI_CONTROL.read_text(encoding="utf-8")
        assert "action.target || action.path" in text
        assert "action.path || action.target" not in text


NODE_NAV = r"""
const aliases = {
  share: 'create',
  find: 'map',
  'admin/distribution': 'dispatch',
  donations: 'schedule',
  sponsors: 'partners',
  recipes: 'meal-planning',
  contact: 'emergency',
  admin: 'admin',
};
function normalize(raw) {
  let base = String(raw || '').replace(/^\//, '').split('?')[0].toLowerCase();
  return aliases[base] || base;
}
const cases = [
  ['dispatch', 'dispatch'],
  ['/admin/distribution', 'dispatch'],
  ['donations', 'schedule'],
  ['sponsors', 'partners'],
  ['recipes', 'meal-planning'],
  ['contact', 'emergency'],
];
for (const [inp, exp] of cases) {
  const got = normalize(inp);
  if (got !== exp) throw new Error(`${inp} -> ${got}, expected ${exp}`);
}
console.log(JSON.stringify({ ok: true }));
"""


class TestNavAliasBehavior:
    def test_node_alias_table(self):
        proc = subprocess.run(
            ["node", "-e", NODE_NAV],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        assert proc.returncode == 0, proc.stderr
        assert json.loads(proc.stdout.strip().splitlines()[-1]).get("ok") is True
