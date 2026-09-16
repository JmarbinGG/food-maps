"""Regression: Not sure / orientation menus must get Find/Share/Request chips."""

from backend.ai.ai_engine import generate_quick_replies
from backend.ai.chip_turn import classify_share_chip_turn
from backend.agent.suggestion_chips import build_turn_suggestions


def _labels(chips):
    return [
        (c if isinstance(c, str) else (c.get("label") or c.get("message") or ""))
        for c in chips
    ]


NOT_SURE_USER = "I'm not sure what to do — help me"

ORIENTATION_MENU = (
    "No problem! I can help you with a few things on Food Maps:\n"
    "1. Find free food near you\n"
    "2. Share extra food you have\n"
    "3. Request food that is not listed yet\n"
    "Which would you like to try first?"
)

SOUNDS_GOOD_MENU = (
    "I'm here to help. What can you do on Food Maps? Find free food, "
    "share extra food, or request food. Which sounds good?"
)


def test_not_sure_menu_classified_as_menu():
    assert classify_share_chip_turn(
        ORIENTATION_MENU, user_message=NOT_SURE_USER,
    ) == "menu"
    assert classify_share_chip_turn(
        SOUNDS_GOOD_MENU, user_message=NOT_SURE_USER,
    ) == "menu"


def test_not_sure_menu_chips_are_paths_not_fork_or_post():
    for text in (ORIENTATION_MENU, SOUNDS_GOOD_MENU):
        out = generate_quick_replies(text, user_message=NOT_SURE_USER)
        joined = " ".join(out).lower()
        assert "find" in joined
        assert "share" in joined
        assert "request" in joined
        assert "do it for me" not in joined
        assert "guide me" not in joined
        assert "post it" not in joined
        assert "yes, post" not in joined


def test_not_sure_build_turn_suggestions_match():
    chips = build_turn_suggestions(
        ORIENTATION_MENU,
        last_user_message=NOT_SURE_USER,
        min_chips=0,
    )
    labels = " ".join(_labels(chips)).lower()
    assert "find" in labels
    assert "do it for me" not in labels
    assert "yes, post" not in labels


def test_not_sure_chips_role_filtered_recipient():
    out = generate_quick_replies(
        ORIENTATION_MENU,
        user_message=NOT_SURE_USER,
        user_role="recipient",
    )
    joined = " ".join(out).lower()
    assert "find" in joined
    assert "request" in joined
    assert "share" not in joined


def test_not_sure_chips_role_filtered_donor():
    out = generate_quick_replies(
        ORIENTATION_MENU,
        user_message=NOT_SURE_USER,
        user_role="donor",
    )
    joined = " ".join(out).lower()
    assert "share" in joined
    assert "find" not in joined
    assert "request" not in joined


def test_real_request_fork_still_mode_chips():
    text = (
        "Would you like to open the request food form, "
        "or should I handle it for you step by step?"
    )
    turn = classify_share_chip_turn(text, user_message="I need food")
    assert turn in {"request_fork", "fork"}
    out = generate_quick_replies(text, user_message="I need food")
    joined = " ".join(out).lower()
    assert "do it for me" in joined
    assert "guide" in joined
    assert "find free food" not in joined
    assert "yes, post" not in joined
