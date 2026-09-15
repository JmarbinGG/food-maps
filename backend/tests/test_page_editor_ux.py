"""Smoke checks for page editor UX fixes (no browser)."""
from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
EDITOR = REPO / "frontend" / "js" / "lib" / "pageEditor.js"
IMPACT = REPO / "frontend" / "impactStory.html"


def test_ensure_chrome_does_not_always_hide():
    text = EDITOR.read_text(encoding="utf-8")
    assert "Hidden until refreshAdminAccess confirms admin" in text
    assert "void refreshAdminAccess();" in text
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


def test_apply_content_skips_meta_keys():
    text = EDITOR.read_text(encoding="utf-8")
    assert "isMetaContentKey" in text
    assert "if (isMetaContentKey(key)) return;" in text
    assert "META_PANEL_TITLE_KEY = '__panel_title'" in text
    assert "META_LABEL_PREFIX = '__label:'" in text


def test_collect_fields_supports_custom_labels():
    text = EDITOR.read_text(encoding="utf-8")
    assert "data-edit-label" in text
    assert "resolveFieldLabel" in text
    assert "defaultFieldLabel" in text
    assert "savedLabelOverride" in text


def test_save_payload_supports_editor_meta():
    text = EDITOR.read_text(encoding="utf-8")
    assert "data-fm-panel-title" in text
    assert "data-fm-label-key" in text
    assert "changes[META_PANEL_TITLE_KEY]" in text
    assert "changes[metaLabelKey(fieldKey)]" in text
    assert "fm-field-label-input" in text


def test_impact_story_modal_before_init():
    text = IMPACT.read_text(encoding="utf-8")
    assert text.index('id="storiesModal"') < text.index("FoodMapsPageEditor.init")
    assert "pageEditor.js?v=20260916-edit-labels" in text


def test_impact_story_titles_have_edit_labels():
    text = IMPACT.read_text(encoding="utf-8")
    for key, label in (
        ("sarah-title", "Sarah story title"),
        ("michael-title", "Michael story title"),
        ("hero-title", "Page title"),
        ("modal-foodbank-title", "Food bank story title"),
    ):
        assert f'data-editable="{key}" data-edit-label="{label}"' in text
