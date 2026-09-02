export const CHAT_UI_LANGUAGES = ['en', 'es'];
export const CHAT_LANGUAGE_LABELS = { en: 'English', es: 'Español' };

const STRINGS = {
  en: {
    welcomeSubtitle: 'Share food, find meals nearby, or ask me anything.',
    jumpLatest: 'Jump to latest',
    latest: 'Latest',
    signInForFeatures: 'Sign in for claims, photos, and voice.',
    chatLanguage: 'Chat language',
    conversationTone: 'Tone',
    photoCaptionPlaceholder: 'Add a caption (optional)',
    messagePlaceholder: 'Message Nouri…',
  },
  es: {
    welcomeSubtitle: 'Comparte comida, encuentra comida cerca o pregúntame lo que quieras.',
    jumpLatest: 'Ir al final',
    latest: 'Reciente',
    signInForFeatures: 'Inicia sesión para reclamar, fotos y voz.',
    chatLanguage: 'Idioma del chat',
    conversationTone: 'Tono',
    photoCaptionPlaceholder: 'Añade un pie de foto (opcional)',
    messagePlaceholder: 'Escribe a Nouri…',
  },
};

export function t(lang, key) {
  const l = STRINGS[lang] || STRINGS.en;
  return l[key] || STRINGS.en[key] || key;
}

export function chatLang(lang) {
  return CHAT_UI_LANGUAGES.includes(lang) ? lang : 'en';
}

export function welcomeGreeting(lang, userName) {
  const name = userName ? `, ${userName.split(' ')[0]}` : '';
  return lang === 'es' ? `Hola${name}` : `Hi${name}`;
}

export function getWelcomeCategories(lang) {
  const es = lang === 'es';
  return [
    { key: 'find', icon: 'fa-search', accent: 'emerald', prompts: es ? ['Buscar comida cerca'] : ['Find food nearby'] },
    { key: 'share', icon: 'fa-hand-holding-heart', accent: 'fuchsia', prompts: es ? ['Compartir comida'] : ['Share food'] },
    { key: 'claim', icon: 'fa-shopping-basket', accent: 'cyan', prompts: es ? ['Reclamar comida'] : ['Claim food'] },
    { key: 'help', icon: 'fa-circle-question', accent: 'amber', prompts: es ? ['¿Cómo funciona?'] : ['How does this work?'] },
  ];
}

export function getSuggestions() {
  return [];
}

export function dateLocale(lang) {
  return lang === 'es' ? 'es' : 'en-US';
}

export function dateLabel(date, lang) {
  try {
    return new Date(date).toLocaleString(dateLocale(lang));
  } catch {
    return '';
  }
}

export function languageSwitchPrompt(lang) {
  return lang === 'es' ? '¿Prefieres español o inglés?' : 'Prefer English or Spanish?';
}

export function getToneLabels(lang) {
  return lang === 'es'
    ? { warm: 'Cálido', professional: 'Profesional', casual: 'Casual', empathetic: 'Empático' }
    : { warm: 'Warm', professional: 'Professional', casual: 'Casual', empathetic: 'Empathetic' };
}

export function onlineToneLabel(tone, lang) {
  return getToneLabels(lang)[tone] || tone;
}
