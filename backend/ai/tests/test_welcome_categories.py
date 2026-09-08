"""Regression tests for Nouri welcome/genesis cards (DoGoods parity)."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
CHAT_I18N = REPO_ROOT / "frontend" / "nouri" / "utils" / "chatI18n.js"

NODE_TEST = r"""
import {
  getWelcomeCategories,
  filterWelcomeCategories,
  normalizeWelcomeRole,
} from './chatI18n.js';

const expectedKeys = ['guide', 'find', 'share', 'request', 'manage'];
const langs = ['en', 'es'];

for (const lang of langs) {
  const cats = getWelcomeCategories(lang);
  const keys = cats.map((c) => c.key);
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    throw new Error(`keys mismatch (${lang}): ${keys.join(',')}`);
  }
  for (const cat of cats) {
    if (!cat.title || !String(cat.title).trim()) {
      throw new Error(`missing title for ${cat.key} (${lang})`);
    }
    if (!cat.blurb || !String(cat.blurb).trim()) {
      throw new Error(`missing blurb for ${cat.key} (${lang})`);
    }
    if (!Array.isArray(cat.prompts) || cat.prompts.length === 0) {
      throw new Error(`missing prompts for ${cat.key} (${lang})`);
    }
  }
}

function keysFor(role, lang = 'en') {
  return filterWelcomeCategories(getWelcomeCategories(lang), role).map((c) => c.key);
}

const donorKeys = keysFor('donor');
for (const bad of ['find', 'request']) {
  if (donorKeys.includes(bad)) throw new Error(`donor should not see ${bad}`);
}
for (const good of ['guide', 'share', 'manage']) {
  if (!donorKeys.includes(good)) throw new Error(`donor should see ${good}`);
}

const recipientKeys = keysFor('recipient');
if (recipientKeys.includes('share')) throw new Error('recipient should not see share');
for (const good of ['guide', 'find', 'request', 'manage']) {
  if (!recipientKeys.includes(good)) throw new Error(`recipient should see ${good}`);
}

const memberKeys = keysFor('member');
if (memberKeys.length !== 5) throw new Error('member should see all five cards');

const adminKeys = keysFor('admin');
if (adminKeys.length !== 5) throw new Error('admin should see all five cards');

if (normalizeWelcomeRole('dispatcher') !== 'organizer') {
  throw new Error('dispatcher should map to organizer');
}

console.log(JSON.stringify({ ok: true, donorKeys, recipientKeys, memberKeys }));
"""


def _run_node_welcome_test() -> dict:
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", NODE_TEST],
        cwd=str(CHAT_I18N.parent),
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    if proc.returncode != 0:
        raise AssertionError(
            f"node welcome test failed (exit {proc.returncode}):\n"
            f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
        )
    line = proc.stdout.strip().splitlines()[-1]
    return json.loads(line)


class TestWelcomeCategoriesSource:
    def test_chat_i18n_exports_filter_helper(self):
        text = CHAT_I18N.read_text(encoding="utf-8")
        assert "export function filterWelcomeCategories" in text
        assert "export function getWelcomeCategories" in text
        assert "title:" in text
        assert "blurb:" in text

    def test_genesis_category_keys_and_branding(self):
        text = CHAT_I18N.read_text(encoding="utf-8")
        for key in ("guide", "find", "share", "request", "manage"):
            assert f"key: '{key}'" in text
        assert "Food Maps" in text
        # Product copy must not mention the reference product name
        assert "How does Food Maps work?" in text
        assert "How does DoGoods work?" not in text


class TestWelcomeCategoriesBehavior:
    def test_node_shape_and_role_filtering(self):
        result = _run_node_welcome_test()
        assert result.get("ok") is True
        assert "share" in result["donorKeys"]
        assert "find" in result["recipientKeys"]
        assert "find" not in result["donorKeys"]
        assert "share" not in result["recipientKeys"]
        assert len(result["memberKeys"]) == 5

    def test_spanish_titles_localized(self):
        text = CHAT_I18N.read_text(encoding="utf-8")
        es_block = text.split("es: [", 1)[1].split("],\n};", 1)[0]
        assert "Buscar comida" in es_block
        assert "Compartir comida" in es_block
        assert "Solicitar comida" in es_block
        assert "Mi actividad" in es_block
