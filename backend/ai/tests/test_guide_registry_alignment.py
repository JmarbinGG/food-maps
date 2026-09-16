"""Registry aliases + GUIDED_UI step-count alignment (DoGoods readiness)."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
REGISTRY = REPO_ROOT / "frontend" / "nouri" / "utils" / "nouriGuide" / "registry.js"
FLOW = REPO_ROOT / "backend" / "ai" / "conversation_flow.py"

NODE_TEST = r"""
import {
  goalKeyFromFormId,
  resolveGoalKey,
  getStepIndexForField,
  NOURI_GOALS,
  FORM_ID_ALIASES,
  canonicalFieldName,
} from './registry.js';

if (goalKeyFromFormId('share-listing') !== 'share-food') throw new Error('share-listing alias');
if (goalKeyFromFormId('request-help') !== 'request-food') throw new Error('request-help alias');
if (goalKeyFromFormId('bulk-share') !== 'bulk-upload') throw new Error('bulk-share alias');
if (resolveGoalKey('share-food') !== 'share-food') throw new Error('canonical resolve');
if (canonicalFieldName('qty') !== 'quantity') throw new Error('qty alias');
if (canonicalFieldName('full_address') !== 'address') throw new Error('full_address alias');

const qtyIdx = getStepIndexForField('share-food', 'qty');
if (qtyIdx < 0) throw new Error('qty should map to share-food quantity step');

if (NOURI_GOALS['request-food'].steps.length !== 6) {
  throw new Error('request-food must have 6 steps');
}
if (NOURI_GOALS['find-food'].steps.length !== 5) {
  throw new Error('find-food must have 5 steps');
}
if (NOURI_GOALS['share-food'].steps.length !== 13) {
  throw new Error('share-food must have 13 steps');
}
if (!FORM_ID_ALIASES['share-listing']) throw new Error('missing FORM_ID_ALIASES');

console.log(JSON.stringify({
  ok: true,
  aliases: FORM_ID_ALIASES,
  counts: {
    share: NOURI_GOALS['share-food'].steps.length,
    request: NOURI_GOALS['request-food'].steps.length,
    find: NOURI_GOALS['find-food'].steps.length,
  },
}));
"""


def _count_guided_ui(name: str) -> int:
    text = FLOW.read_text(encoding="utf-8")
    m = re.search(rf"{name}\s*:", text)
    if not m:
        raise AssertionError(f"{name} not found")
    start = m.start()
    # Stop at the next top-level GUIDED_UI / function after this block.
    nxt = re.search(r"\n(_[A-Z]+_GUIDED_UI|def )\w*", text[m.end():])
    end = m.end() + (nxt.start() if nxt else len(text) - m.end())
    block = text[start:end]
    return len(re.findall(r'"section_en"\s*:', block))


def test_backend_guided_ui_counts():
    assert _count_guided_ui("_SHARE_GUIDED_UI") == 13
    assert _count_guided_ui("_REQUEST_GUIDED_UI") == 6
    assert _count_guided_ui("_FIND_GUIDED_UI") == 5


def test_registry_aliases_and_counts_node():
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", NODE_TEST],
        cwd=str(REGISTRY.parent),
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    assert proc.returncode == 0, f"stdout={proc.stdout}\nstderr={proc.stderr}"
    data = json.loads(proc.stdout.strip().splitlines()[-1])
    assert data["ok"] is True
    assert data["counts"]["share"] == 13
    assert data["counts"]["request"] == 6
    assert data["counts"]["find"] == 5


def test_share_guided_order_matches_create_listing():
    """Open → Title → … → Continue → Finish (Food Maps CreateListing order)."""
    text = FLOW.read_text(encoding="utf-8")
    m = re.search(r"_SHARE_GUIDED_UI\s*:", text)
    assert m
    nxt = re.search(r"\n(_[A-Z]+_GUIDED_UI|def )\w*", text[m.end():])
    end = m.end() + (nxt.start() if nxt else len(text) - m.end())
    block = text[m.start():end]
    sections = re.findall(r'"section_en"\s*:\s*"([^"]+)"', block)
    assert sections == [
        "Open Share Food",
        "Title",
        "Description",
        "Photos",
        "Category",
        "Perishability",
        "Quantity",
        "Unit",
        "Pickup address",
        "Pickup window start",
        "Pickup window end",
        "Continue to Safety Check",
        "Finish & submit",
    ]


def test_find_guided_order_matches_food_maps_map():
    text = FLOW.read_text(encoding="utf-8")
    m = re.search(r"_FIND_GUIDED_UI\s*:", text)
    assert m
    nxt = re.search(r"\n(_[A-Z]+_GUIDED_UI|def )\w*", text[m.end():])
    end = m.end() + (nxt.start() if nxt else len(text) - m.end())
    block = text[m.start():end]
    sections = re.findall(r'"section_en"\s*:\s*"([^"]+)"', block)
    assert sections == [
        "Open the map",
        "Your ZIP area",
        "Browse listings",
        "Claim it",
        "Confirm claim",
    ]
    assert "green Find Food button" in block
    assert "do NOT use the green Find Food" in block.lower() or "Do NOT use the green Find Food" in block


def test_no_dogoods_branding_in_registry():
    text = REGISTRY.read_text(encoding="utf-8")
    assert "DoGoods" not in text
    assert "Food Maps" in text
