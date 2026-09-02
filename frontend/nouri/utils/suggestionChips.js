export function liveAssistantIndex(messages) {
  if (!Array.isArray(messages)) return -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'assistant' && !messages[i]?.fromHistory) return i;
  }
  // After refresh, restore chips on the last assistant turn that saved suggestions.
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m?.role === 'assistant' && Array.isArray(m.suggestions) && m.suggestions.length > 0) {
      return i;
    }
  }
  return -1;
}

export function resolveInputChips(suggestions, language, communityRole, opts = {}) {
  const raw = Array.isArray(suggestions) ? suggestions : [];
  if (raw.length) {
    return raw.slice(0, 6).map((s) => (typeof s === 'string' ? { label: s, message: s } : s));
  }
  if (opts.allowLazy) {
    const es = language === 'es';
    if (communityRole === 'donor') {
      return [{ label: es ? 'Compartir comida' : 'Share food', message: es ? 'Quiero compartir comida' : 'I want to share food' }];
    }
    return [{ label: es ? 'Buscar comida' : 'Find food', message: es ? 'Buscar comida cerca' : 'Find food nearby' }];
  }
  return [];
}
