import { resilientFetch } from './aiSelfHealing.js';
import { parseAiErrorResponse } from './aiRequest.js';

async function resilientJson(path, options = {}, fetchOpts = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await resilientFetch(
    path,
    { ...options, headers },
    { timeout: fetchOpts.timeout || 45000, retries: fetchOpts.retries ?? 2, label: fetchOpts.label || path },
  );
  if (!res.ok) {
    const typed = await parseAiErrorResponse(res);
    if (typed) {
      const e = new Error(typed.message);
      e.aiError = typed;
      e.status = typed.status;
      throw e;
    }
    const text = await res.text();
    const err = new Error(text || `${res.status}`);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}

function isUnintelligibleVoiceDetail(text) {
  const t = String(text || '').toLowerCase();
  return (
    t.includes('understand')
    || t.includes('empty audio')
    || t.includes('unsupported audio')
    || t.includes('invalid_input')
    || t.includes("didn't quite catch")
  );
}

const aiChatService = {
  async chat(userId, message, opts = {}) {
    return resilientJson('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message,
        include_audio: opts.includeAudio || false,
        tone: opts.tone,
        accessibility_profile: opts.accessibilityProfile,
        guide_state: opts.guideState,
        lang: opts.lang,
      }),
    }, { timeout: 60000, label: 'ai/chat' });
  },

  async publicChat(message, lang = 'en') {
    return resilientJson('/api/ai/public_chat', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
    }, { timeout: 45000, label: 'ai/public_chat' });
  },

  async confirm(userId, payload = {}) {
    return resilientJson('/api/ai/confirm', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...payload }),
    }, { timeout: 45000, label: 'ai/confirm' });
  },

  async voice(userId, blob, opts = {}) {
    const fd = new FormData();
    const mime = (blob?.type || 'audio/webm').split(';')[0].trim() || 'audio/webm';
    const extByMime = {
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
    const ext = extByMime[mime] || 'webm';
    // TTS for voice replies is handled by NouriGuide (/api/ai/tts) — avoid double OpenAI TTS.
    const includeAudio = opts.includeAudio === true;
    fd.append('audio', blob, `voice.${ext}`);
    fd.append('user_id', userId);
    fd.append('include_audio', includeAudio ? 'true' : 'false');
    if (opts.lang) fd.append('lang', opts.lang);
    if (opts.tone) fd.append('tone', opts.tone);
    if (opts.accessibilityProfile) {
      fd.append('accessibility_profile', JSON.stringify(opts.accessibilityProfile));
    }
    if (opts.guideState) {
      fd.append('guide_state', JSON.stringify(opts.guideState));
    }

    const res = await resilientFetch(
      '/api/ai/voice',
      { method: 'POST', body: fd },
      { timeout: 60000, label: 'ai/voice' },
    );

    if (!res.ok) {
      const typed = await parseAiErrorResponse(res);
      if (typed) {
        const e = new Error(typed.message);
        e.aiError = typed;
        e.requestId = typed.requestId;
        e.status = typed.status;
        throw e;
      }
      const text = await res.text().catch(() => '');
      if (res.status === 400 && isUnintelligibleVoiceDetail(text)) {
        const e = new Error(text || 'Could not understand the audio');
        e.aiError = {
          code: 'invalid_input',
          message: text || 'Could not understand the audio',
          retryable: false,
          status: 400,
        };
        e.status = 400;
        throw e;
      }
      const err = new Error(text || `${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  },

  async uploadImage(file, userId) {
    const fd = new FormData();
    fd.append('image', file);
    if (userId) fd.append('user_id', userId);
    const res = await resilientFetch(
      '/api/ai/upload_image',
      { method: 'POST', body: fd },
      { timeout: 60000, label: 'ai/upload_image' },
    );
    if (!res.ok) {
      const typed = await parseAiErrorResponse(res);
      if (typed) {
        const e = new Error(typed.message);
        e.aiError = typed;
        e.status = typed.status;
        throw e;
      }
      throw new Error(await res.text());
    }
    return res.json();
  },

  async enrichListings(rows, opts = {}) {
    return resilientJson('/api/ai/enrich-listings', {
      method: 'POST',
      body: JSON.stringify({
        user_id: opts.userId,
        rows,
        language: opts.language || 'en',
      }),
    });
  },

  async bulkCreateListings(rows, opts = {}) {
    return resilientJson('/api/ai/bulk-listings', {
      method: 'POST',
      body: JSON.stringify({
        user_id: opts.userId,
        listings: rows,
      }),
    });
  },

  async visionListing(file, opts = {}) {
    const fd = new FormData();
    fd.append('image', file);
    if (opts.userId) fd.append('user_id', opts.userId);
    const res = await resilientFetch(
      '/api/ai/vision-listing',
      { method: 'POST', body: fd },
      { timeout: 60000, label: 'ai/vision-listing' },
    );
    if (!res.ok) {
      const typed = await parseAiErrorResponse(res);
      if (typed) {
        const e = new Error(typed.message);
        e.aiError = typed;
        e.status = typed.status;
        throw e;
      }
      throw new Error(await res.text());
    }
    return res.json();
  },

  async recipes(userId, opts = {}) {
    return resilientJson('/api/ai/recipes', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        ingredients: opts.ingredients,
        use_claimed: opts.useClaimed !== false,
        low_resource: opts.lowResource !== false,
        household_size: opts.householdSize,
        max_recipes: opts.maxRecipes || 3,
      }),
    });
  },

  async askQuery(userId, question) {
    return resilientJson('/api/ai/query', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, question }),
    });
  },

  async voiceSearch(userId, opts = {}) {
    return resilientJson('/api/ai/voice-search', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        transcript: opts.transcript,
        latitude: opts.latitude,
        longitude: opts.longitude,
        maxDistanceKm: opts.maxDistanceKm,
        limit: opts.limit,
      }),
    });
  },

  async getInsights(userId, opts = {}) {
    const qs = opts.roleHint ? `?role_hint=${encodeURIComponent(opts.roleHint)}` : '';
    return resilientJson(`/api/ai/insights/${encodeURIComponent(userId)}${qs}`);
  },

  async getHistory(userId) {
    return resilientJson(`/api/ai/history/${encodeURIComponent(userId)}`, {
      method: 'GET',
    }, { timeout: 30000, label: 'ai/history' });
  },

  async clearHistory(userId) {
    return resilientJson(`/api/ai/history/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }, { timeout: 30000, label: 'ai/clear-history' });
  },

  async setTone(userId, tone) {
    return resilientJson(`/api/ai/tone/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify({ tone }),
    });
  },

  async submitFeedback(payload) {
    return resilientJson('/api/ai/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default aiChatService;
