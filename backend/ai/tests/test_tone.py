"""Tests for conversation tone presets."""
from __future__ import annotations

import pytest

from backend.ai.tone import (
    DEFAULT_TONE,
    VALID_TONES,
    normalize_tone,
    tone_system_prompt,
)


class TestNormalizeTone:
    @pytest.mark.parametrize("raw,expected", [
        ("warm", "warm"),
        ("Professional", "professional"),
        (" CASUAL ", "casual"),
        ("empathetic", "empathetic"),
        (None, DEFAULT_TONE),
        ("", DEFAULT_TONE),
        ("robotic", DEFAULT_TONE),
    ])
    def test_normalize(self, raw, expected):
        assert normalize_tone(raw) == expected

    def test_all_valid_tones_have_prompts(self):
        for t in VALID_TONES:
            assert "TONE" in tone_system_prompt(t, "en").upper()
            assert "TONO" in tone_system_prompt(t, "es").upper()

    def test_no_dogoods_branding_in_tone_prompts(self):
        for t in VALID_TONES:
            for lang in ("en", "es"):
                prompt = tone_system_prompt(t, lang)
                lowered = prompt.lower()
                assert "dogoods connects" not in lowered
                assert "do goods connects" not in lowered
                assert "food maps" in lowered
