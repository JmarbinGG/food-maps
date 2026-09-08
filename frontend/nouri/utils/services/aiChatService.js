function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `${res.status}`);
    err.status = res.status;
    try {
      err.aiError = JSON.parse(text);
    } catch {
      /* ignore */
    }
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}

const aiChatService = {
  async chat(userId, message, opts = {}) {
    return apiFetch('/api/ai/chat', {
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
    });
  },

  async publicChat(message, lang = 'en') {
    return apiFetch('/api/ai/public_chat', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
    });
  },

  async confirm(userId, payload = {}) {
    return apiFetch('/api/ai/confirm', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...payload }),
    });
  },

  async voice(userId, blob, opts = {}) {
    const token = getToken();
    const fd = new FormData();
    fd.append('audio', blob, 'voice.webm');
    fd.append('user_id', userId);
    if (opts.lang) fd.append('lang', opts.lang);
    if (opts.tone) fd.append('tone', opts.tone);
    if (opts.accessibilityProfile) {
      fd.append('accessibility_profile', JSON.stringify(opts.accessibilityProfile));
    }
    if (opts.guideState) {
      fd.append('guide_state', JSON.stringify(opts.guideState));
    }
    const res = await fetch('/api/ai/voice', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async uploadImage(file, userId) {
    const token = getToken();
    const fd = new FormData();
    fd.append('image', file);
    if (userId) fd.append('user_id', userId);
    const res = await fetch('/api/ai/upload_image', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async enrichListings(rows, opts = {}) {
    return apiFetch('/api/ai/enrich-listings', {
      method: 'POST',
      body: JSON.stringify({
        user_id: opts.userId,
        rows,
        language: opts.language || 'en',
      }),
    });
  },

  async bulkCreateListings(rows, opts = {}) {
    return apiFetch('/api/ai/bulk-listings', {
      method: 'POST',
      body: JSON.stringify({
        user_id: opts.userId,
        listings: rows,
      }),
    });
  },

  async visionListing(file, opts = {}) {
    const token = getToken();
    const fd = new FormData();
    fd.append('image', file);
    if (opts.userId) fd.append('user_id', opts.userId);
    const res = await fetch('/api/ai/vision-listing', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async recipes(userId, opts = {}) {
    return apiFetch('/api/ai/recipes', {
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
    return apiFetch('/api/ai/query', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, question }),
    });
  },

  async voiceSearch(userId, opts = {}) {
    return apiFetch('/api/ai/voice-search', {
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
    return apiFetch(`/api/ai/insights/${encodeURIComponent(userId)}${qs}`);
  },

  async getHistory(userId) {
    return apiFetch(`/api/ai/history/${encodeURIComponent(userId)}`);
  },

  async clearHistory(userId) {
    return apiFetch(`/api/ai/history/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  },

  async setTone(userId, tone) {
    return apiFetch(`/api/ai/tone/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify({ tone }),
    });
  },

  async submitFeedback(payload) {
    return apiFetch('/api/ai/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default aiChatService;
