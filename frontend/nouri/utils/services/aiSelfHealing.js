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

if (typeof window !== 'undefined') {
  aiHealth.start();
}
