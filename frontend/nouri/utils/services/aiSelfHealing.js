/**
 * AI fetch helper — auth headers, timeout, and transient retries.
 */
import { withAiAuth, parseAiErrorResponse } from './aiRequest.js';

const AI_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  DOWN: 'down',
};

class AiHealthMonitor {
  constructor() {
    this.status = { status: AI_STATUS.HEALTHY, lastCheck: null };
    this.listeners = new Set();
    this._timer = null;
  }

  getStatus() {
    return this.status;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    for (const fn of this.listeners) {
      try { fn(this.status); } catch (_) { /* ignore */ }
    }
  }

  recordSuccess() {
    if (this.status.status !== AI_STATUS.HEALTHY) {
      this.status = { status: AI_STATUS.HEALTHY, lastCheck: Date.now() };
      this._notify();
    }
  }

  recordFailure() {
    this.status = { status: AI_STATUS.DEGRADED, lastCheck: Date.now() };
    this._notify();
  }

  async check() {
    try {
      const res = await fetch('/api/ai/health', { method: 'GET' });
      if (!res.ok) throw new Error(`health ${res.status}`);
      const data = await res.json();
      const openaiOk = data.openai_configured !== false && data.status === 'ok';
      const circuit = String(data.circuit_state || 'closed').toLowerCase();
      let status = AI_STATUS.HEALTHY;
      if (!openaiOk) status = AI_STATUS.DOWN;
      else if (circuit === 'open') status = AI_STATUS.DEGRADED;
      this.status = { status, lastCheck: Date.now(), detail: data };
    } catch (_) {
      this.status = { status: AI_STATUS.DEGRADED, lastCheck: Date.now() };
    }
    this._notify();
  }

  start(intervalMs = 60000) {
    this.check();
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this.check(), intervalMs);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }
}

export const aiHealth = new AiHealthMonitor();
export { AI_STATUS };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Fetch with Food Maps auth headers, AbortController timeout, and retries.
 * @param {string} url
 * @param {RequestInit} init
 * @param {{ timeout?: number, signal?: AbortSignal, label?: string, retries?: number, backoff?: number[] }} [opts]
 */
export async function resilientFetch(url, init = {}, opts = {}) {
  const {
    signal: callerSignal = null,
    timeout = 30000,
    retries = 2,
    backoff = [400, 1200],
  } = opts;

  let lastError = null;
  const attempts = Math.max(1, retries + 1);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    if (callerSignal) {
      if (callerSignal.aborted) {
        clearTimeout(timer);
        throw new DOMException('Aborted', 'AbortError');
      }
      callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      const authedInit = await withAiAuth({ ...init, signal: controller.signal });
      const response = await fetch(url, authedInit);
      clearTimeout(timer);

      if (!response.ok && isRetryableStatus(response.status) && attempt < attempts - 1) {
        aiHealth.recordFailure();
        await sleep(backoff[Math.min(attempt, backoff.length - 1)] || 800);
        continue;
      }

      if (response.ok) aiHealth.recordSuccess();
      else aiHealth.recordFailure();
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const aborted = err?.name === 'AbortError';
      if (aborted && callerSignal?.aborted) throw err;
      aiHealth.recordFailure();
      if (attempt < attempts - 1) {
        await sleep(backoff[Math.min(attempt, backoff.length - 1)] || 800);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error(`${opts.label || url} failed`);
}

/**
 * Convenience: POST JSON and return parsed response JSON.
 */
export async function resilientPostJson(url, body, opts = {}) {
  const response = await resilientFetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    opts,
  );
  if (!response.ok) {
    const typed = await parseAiErrorResponse(response);
    if (typed) {
      const e = new Error(typed.message);
      e.aiError = typed;
      e.status = typed.status;
      throw e;
    }
    const text = await response.text().catch(() => '');
    const err = new Error(`${opts.label || url} failed: HTTP ${response.status} ${text}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

if (typeof window !== 'undefined') {
  aiHealth.start();
}
