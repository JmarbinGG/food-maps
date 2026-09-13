"""Smoke checks for page editor UX fixes (no browser)."""
from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EDITOR = REPO / "frontend" / "js" / "lib" / "pageEditor.js"
IMPACT = REPO / "frontend" / "impactStory.html"


def test_ensure_chrome_does_not_always_hide():
    text = EDITOR.read_text(encoding="utf-8")
    # Only hide when creating the button, not on every ensureChrome call.
    assert "Hidden until refreshAdminAccess confirms admin" in text
    assert "void refreshAdminAccess();" in text
    # Must not re-assign display none after the create branch unconditionally.
    # Count display='none' assignments on btn — only creation + refreshAdminAccess paths.
    assert "btn.style.display = 'none';" in text
    assert text.count("btn.style.display = 'none';") == 1


def test_is_admin_flag_accepted():
    text = EDITOR.read_text(encoding="utf-8")
    assert "user.is_admin === true" in text


def test_aliases_and_query_selector_all():
    text = EDITOR.read_text(encoding="utf-8")
    assert "TEXT_CONTENT_ALIASES" in text
    assert "'sarah-title': 'modal-sarah-title'" in text
    assert "setEditableHtml" in text
    assert "querySelectorAll(`[data-editable=" in text


def test_impact_story_modal_before_init():
    text = IMPACT.read_text(encoding="utf-8")
    assert text.index('id="storiesModal"') < text.index("FoodMapsPageEditor.init")
    assert "pageEditor.js?v=20260911-editor-fix" in text
