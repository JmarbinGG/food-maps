/**
 * Voice services — Whisper STT + OpenAI TTS via FastAPI backend.
 */
import { resilientFetch } from './services/aiSelfHealing.js';
import { throwAiHttpError } from './services/aiRequest.js';

const EXT_BY_MIME = {
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
};

/** Pick a Whisper-friendly filename from a Blob/File mime type. */
export function audioFilenameForBlob(audioBlob, fallbackBase = 'audio') {
  const mime = (audioBlob?.type || 'audio/webm').split(';')[0].trim() || 'audio/webm';
  const ext = EXT_BY_MIME[mime] || 'webm';
  return `${fallbackBase}.${ext}`;
}

/**
 * Transcribe audio using backend Whisper endpoint.
 * @param {Blob} audioBlob
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, audioFilenameForBlob(audioBlob));

  const response = await resilientFetch(
    '/api/ai/transcribe',
    { method: 'POST', body: formData },
    { timeout: 45000, label: 'ai/transcribe' },
  );

  if (!response.ok) {
    await throwAiHttpError(response, 'Whisper transcription failed');
  }

  const data = await response.json();
  if (data.filtered) return '';
  return data.transcript || '';
}

/**
 * Generate speech audio from text using backend TTS endpoint.
 * @param {string} text
 * @param {{ lang?: string }} [options]
 * @returns {Promise<Blob>}
 */
export async function textToSpeech(text, options = {}) {
  const response = await resilientFetch(
    '/api/ai/tts',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: String(text || '').slice(0, 4096),
        lang: options.lang || 'en',
      }),
    },
    { timeout: 30000, label: 'ai/tts' },
  );

  if (!response.ok) {
    await throwAiHttpError(response, 'Text-to-speech failed');
  }

  return response.blob();
}

const AUTOPLAY_REPLAY_TTL_MS = 30_000;

/**
 * Play an audio blob. Returns stop handle + play promise.
 * onBlocked(replay) is called when the browser blocks autoplay (e.g. iOS).
 */
export function playAudioBlob(audioBlob, onStart, onEnd, onBlocked) {
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  audio.playsInline = true;

  let revoked = false;
  const revoke = () => {
    if (revoked) return;
    revoked = true;
    try { URL.revokeObjectURL(url); } catch { /* noop */ }
  };

  let resolvePlay;
  const play = new Promise((resolve) => { resolvePlay = resolve; });
  const settle = () => {
    if (resolvePlay) {
      const r = resolvePlay;
      resolvePlay = null;
      r();
    }
  };

  let autoplayTtlTimer = null;
  const clearAutoplayTtl = () => {
    if (autoplayTtlTimer) {
      clearTimeout(autoplayTtlTimer);
      autoplayTtlTimer = null;
    }
  };

  const stop = () => {
    clearAutoplayTtl();
    try { audio.pause(); } catch { /* noop */ }
    try { audio.currentTime = 0; } catch { /* noop */ }
    audio.onplay = audio.onended = audio.onerror = null;
    revoke();
    onEnd?.();
    settle();
  };

  audio.onplay = () => { clearAutoplayTtl(); onStart?.(); };
  audio.onended = () => { revoke(); onEnd?.(); settle(); };
  audio.onerror = () => { revoke(); onEnd?.(); settle(); };
  audio.play().catch((err) => {
    const isAutoplayBlock = err && (err.name === 'NotAllowedError' || err.name === 'AbortError');
    if (isAutoplayBlock && typeof onBlocked === 'function' && !revoked) {
      const replay = () => {
        if (revoked) return Promise.resolve();
        clearAutoplayTtl();
        return audio.play().catch(() => { revoke(); onEnd?.(); settle(); });
      };
      onBlocked(replay);
      autoplayTtlTimer = setTimeout(() => {
        autoplayTtlTimer = null;
        if (!revoked) { revoke(); onEnd?.(); settle(); }
      }, AUTOPLAY_REPLAY_TTL_MS);
      settle();
      return;
    }
    revoke();
    onEnd?.();
    settle();
  });

  return { play, stop, audio };
}
