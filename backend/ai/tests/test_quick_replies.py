"""Tests for quick-reply chip suggestions returned by the AI."""
from backend.ai.ai_engine import generate_quick_replies


def test_no_question_returns_empty():
    assert generate_quick_replies("Posted! Listing #42 is live.") == []
    assert generate_quick_replies("") == []


def test_open_what_food_question_suggests_food_options():
    out = generate_quick_replies("What food would you like to share today?")
    # Should NOT be yes/no/later — that was the old bug.
    assert "Yes" not in out and "No" not in out and "Later" not in out
    assert len(out) >= 2
    # Plausible food chips
    joined = " ".join(out).lower()
    assert any(x in joined for x in ("bread", "fruit", "vegetable", "meal"))


def test_open_wh_question_without_specific_branch_returns_empty():
    # Open question we have no concrete suggestions for — better empty
    # than wrong yes/no chips.
    out = generate_quick_replies("What neighborhood are you in?")
    assert out == []


def test_post_confirm_variants():
    confirm_phrasings = [
        "Quick check — 3 loaves of sourdough, pickup at 1423 Park St. Post it?",
        "Sound good? Should I post it?",
        "Ready to post?",
        "All set — shall I publish it?",
        "Looks good? Confirm and post?",
        "Want me to post the listing?",
    ]
    for q in confirm_phrasings:
        out = generate_quick_replies(q)
        assert out, f"no chips for: {q!r}"
        joined = " ".join(out).lower()
        assert "post" in joined or "edit" in joined or "cancel" in joined, (
            f"wrong chips for {q!r}: {out}"
        )
        # Must NOT fall through to bare yes/no/later
        assert out[:3] != ["Yes", "No", "Later"], f"fell through on: {q!r}"


def test_post_confirm_spanish():
    out = generate_quick_replies("¿Lo publico?", lang="es")
    assert out
    assert any("public" in s.lower() or "publí" in s.lower() for s in out)


def test_handoff_question_gets_handoff_chips():
    out = generate_quick_replies(
        "Will the recipient pick this up from you, or are you willing to drop it off?"
    )
    assert out
    joined = " ".join(out).lower()
    assert "pickup" in joined or "drop" in joined or "either" in joined


def test_address_confirm_gets_address_chips():
    out = generate_quick_replies(
        "Should I use your profile address 1423 Park St for the pickup spot?"
    )
    assert out
    joined = " ".join(out).lower()
    assert "address" in joined or "profile" in joined or "use that" in joined


def test_quantity_question_gets_numbers():
    out = generate_quick_replies("How many loaves?")
    assert out
    assert any(s.isdigit() for s in out)


def test_allergen_question():
    out = generate_quick_replies("Any allergens I should flag?")
    assert out
    joined = " ".join(out).lower()
    assert "allergen" in joined or "gluten" in joined or "dairy" in joined


def test_yes_no_fallback_only_when_truly_yes_no():
    out = generate_quick_replies("Would you like me to remind you tomorrow?")
    # "Would you like" with no open-wh and no specific branch → yes/no/later.
    assert "Yes" in out and "No" in out
