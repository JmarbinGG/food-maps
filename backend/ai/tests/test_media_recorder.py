"""Node-backed regression for Safari-safe MediaRecorder helpers."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
MEDIA_RECORDER = REPO_ROOT / "frontend" / "nouri" / "utils" / "mediaRecorder.js"

NODE_TEST = r"""
import { pickMediaRecorderMimeType, createMediaRecorder } from './mediaRecorder.js';

const original = globalThis.MediaRecorder;

function withMock(Mock, fn) {
  globalThis.MediaRecorder = Mock;
  try { fn(); } finally { globalThis.MediaRecorder = original; }
}

withMock(class {
  static isTypeSupported(type) {
    return type === 'audio/webm;codecs=opus' || type === 'audio/mp4';
  }
}, () => {
  if (pickMediaRecorderMimeType() !== 'audio/webm;codecs=opus') {
    throw new Error('expected webm opus preference');
  }
});

withMock(class {
  static isTypeSupported(type) {
    return type === 'audio/mp4';
  }
}, () => {
  if (pickMediaRecorderMimeType() !== 'audio/mp4') {
    throw new Error('expected mp4 Safari fallback');
  }
});

withMock(class {
  static isTypeSupported() { return false; }
}, () => {
  if (pickMediaRecorderMimeType() !== '') {
    throw new Error('expected empty when unsupported');
  }
});

let constructedWith = null;
withMock(class MockRecorder {
  constructor(stream, opts) {
    constructedWith = opts;
    this.stream = stream;
    this.mimeType = opts?.mimeType || '';
  }
  static isTypeSupported(type) {
    return type === 'audio/mp4';
  }
}, () => {
  createMediaRecorder({});
  if (!constructedWith || constructedWith.mimeType !== 'audio/mp4') {
    throw new Error('createMediaRecorder should pass mimeType');
  }
});

console.log(JSON.stringify({ ok: true }));
"""


def test_media_recorder_safari_mime_helpers():
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", NODE_TEST],
        cwd=str(MEDIA_RECORDER.parent),
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    assert proc.returncode == 0, f"stdout={proc.stdout}\nstderr={proc.stderr}"
    line = proc.stdout.strip().splitlines()[-1]
    assert json.loads(line).get("ok") is True


def test_media_recorder_source_exports():
    text = MEDIA_RECORDER.read_text(encoding="utf-8")
    assert "pickMediaRecorderMimeType" in text
    assert "audio/mp4" in text
