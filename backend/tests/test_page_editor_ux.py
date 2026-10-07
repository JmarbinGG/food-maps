"""Smoke checks for page editor UX fixes (no browser)."""
from __future__ import annotations

import re
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


def test_impact_story_loads_the_page_editor():
    text = IMPACT.read_text(encoding="utf-8")
    assert "pageEditor.js?v=20260916-edit-labels" in text
    assert "FoodMapsPageEditor.init" in text


def test_impact_story_has_no_hidden_legacy_sections():
    """The city tabs are the page. The old hero/featured/stories/news/gallery
    sections and the stories modal were display:none here, so every field they
    contributed to the admin panel edited content no visitor could see."""
    text = IMPACT.read_text(encoding="utf-8")
    for gone in ('id="storiesModal"', 'id="featured"', 'id="stories"', 'id="news"',
                 "Our Impact Story", "openStoriesModal", "animateCounter",
                 "body > section.bg-green-600"):
        assert gone not in text, gone


def test_every_impact_story_editable_field_is_named():
    """Without data-edit-label the editor falls back to a DOM path, so the
    panel shows rows like "Main0 Section0 Div0 Span0"."""
    text = IMPACT.read_text(encoding="utf-8")
    unnamed = [
        tag for tag in re.findall(r"<[^>]*\sdata-editable(?:-img|-bg)?=\"[^\"]*\"[^>]*>", text)
        if "data-edit-label=" not in tag
    ]
    assert not unnamed, f"editable fields with no label: {unnamed}"


def test_impact_story_catalog_is_repeatable():
    html = IMPACT.read_text(encoding="utf-8")
    script = (REPO / "frontend" / "js" / "lib" / "impactCityCatalog.js").read_text(encoding="utf-8")
    assert "impactCityCatalog.js?v=20261007-city-stories" in html
    assert "FoodMapsImpactCatalog.init" in html
    assert "data-no-edit" in html
    assert "__impact_catalog" in script
    assert "function addCity" in script
    assert "function addStory" in script
    assert "function removeCity" in script
    assert "function removeStory" in script
    assert "cities:" in script


def test_impact_story_stacks_stories_with_expanders():
    html = IMPACT.read_text(encoding="utf-8")
    script = (REPO / "frontend" / "js" / "lib" / "impactCityCatalog.js").read_text(encoding="utf-8")
    assert "city-story-row" in script
    assert "city-story-more" in script
    assert "VISIBLE_STORY_LIMIT" in script
    assert "city-stories-more" in script
    assert ".city-story-row" in html
    assert ".city-stories-more" in html


def test_impact_story_newsletter_is_full_width():
    html = IMPACT.read_text(encoding="utf-8")
    assert '<section class="newsletter-band">' in html
    assert ".newsletter-band {" in html
    # newsletterSignup.js keys off these
    for hook in ('data-newsletter-form', 'data-newsletter-success', 'data-newsletter-error',
                 'name="firstName"', 'name="email"', 'name="consent"'):
        assert hook in html


def test_impact_story_leads_with_city_tabs():
    html = IMPACT.read_text(encoding="utf-8")
    assert "city-intro" not in html
    assert 'id="city-explorer-title"' in html
    # the explorer heading is the page's h1, and the tabs are its first content
    assert html.index('id="city-explorer-title"') < html.index('id="city-tabs"')
    assert html.index("<h1") == html.index('<h1 id="city-explorer-title"')


def test_support_donation_page_embeds_donorbox():
    page = (REPO / "frontend" / "donate.html").read_text(encoding="utf-8")
    app = (REPO / "backend" / "app.py").read_text(encoding="utf-8")
    assert 'src="https://donorbox.org/widgets.js"' in page
    assert 'campaign="support-do-good-food-maps"' in page
    assert 'type="donation_form"' in page
    assert 'enable-auto-scroll="true"' in page
    assert "pageId: 'donate'" in page
    assert '"donate"' in app


def test_impact_story_titles_have_edit_labels():
    text = IMPACT.read_text(encoding="utf-8")
    for key, label in (
        ("explorer-title", "Page title"),
        ("explorer-kicker", "Explorer kicker"),
        ("mockup-note", "Mockup disclaimer"),
        ("newsletter-title", "Newsletter title"),
        ("footer-copyright", "Footer copyright"),
    ):
        assert f'data-editable="{key}"' in text
        assert f'data-edit-label="{label}"' in text


def test_impact_story_footer_links_are_not_text_editable():
    """Each footer <li> wraps an <a> plus an icon <div>; editing one as text
    would replace that markup with a plain string."""
    text = IMPACT.read_text(encoding="utf-8")
    assert text.count('<ul class="space-y-3" data-no-edit="true">') == 2
