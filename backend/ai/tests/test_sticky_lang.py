"""Tests for sticky language detection."""
from backend.ai.ai_engine import ConversationEngine


def test_sticky_short_si_with_spanish_history():
    eng = ConversationEngine()
    history = [
        {"role": "user", "message": "Hola, quiero compartir comida"},
        {"role": "assistant", "message": "¡Genial! ¿Qué tipo de comida?"},
    ]
    # Bare "sí" is not detectable as Spanish on its own; history must win.
    assert eng._detect_lang_sticky("sí", history=history, profile=None) == "es"


def test_sticky_short_ok_with_profile_es():
    eng = ConversationEngine()
    profile = {"language": "es"}
    assert eng._detect_lang_sticky("ok", history=None, profile=profile) == "es"


def test_sticky_english_message_overrides_when_strong():
    eng = ConversationEngine()
    # Strong English with no Spanish history → English.
    assert eng._detect_lang_sticky("Hello, can you help me find food?") == "en"


def test_sticky_spanish_message_wins_over_english_history():
    eng = ConversationEngine()
    history = [{"role": "user", "message": "Hello there"}]
    assert eng._detect_lang_sticky("¿Qué tienes disponible?", history=history) == "es"


def test_sticky_no_signals_defaults_english():
    eng = ConversationEngine()
    assert eng._detect_lang_sticky("ok", history=None, profile=None) == "en"


def test_sticky_history_dict_with_content_key_also_works():
    eng = ConversationEngine()
    # Some callers pass history items keyed by "content" instead of "message".
    history = [{"role": "assistant", "content": "Por supuesto, déjame buscar."}]
    assert eng._detect_lang_sticky("ok", history=history) == "es"


def test_clear_english_message_beats_spanish_history():
    """Regression: user reported the AI was replying in Spanish even
    when they asked in English. Cause was sticky-language sticking to
    Spanish whenever ANY recent history turn was Spanish. Now a clearly
    English current message (3+ ASCII words, no Spanish chars) wins."""
    eng = ConversationEngine()
    history = [
        {"role": "user", "message": "Hola, ¿qué tienes disponible?"},
        {"role": "assistant", "message": "Tenemos manzanas y pan."},
    ]
    assert eng._detect_lang_sticky(
        "show me directions to listing 5", history=history
    ) == "en"


def test_clear_english_message_beats_spanish_profile():
    """profile.language='es' should not override a clearly English
    current message — the user is writing in English right now."""
    eng = ConversationEngine()
    profile = {"language": "es"}
    assert eng._detect_lang_sticky(
        "can you help me find vegetables nearby", profile=profile
    ) == "en"
