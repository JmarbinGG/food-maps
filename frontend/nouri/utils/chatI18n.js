export const CHAT_UI_LANGUAGES = ['en', 'es'];
export const CHAT_LANGUAGE_LABELS = { en: 'English', es: 'Español' };

const STRINGS = {
  en: {
    welcomeSubtitle:
      'Tap a suggestion below, a card, or type — I’ll ask whether to do it for you or guide you step by step.',
    jumpLatest: 'Jump to latest',
    latest: 'Latest',
    signInForFeatures: 'Sign in for claims, photos, and voice.',
    chatLanguage: 'Chat language',
    conversationTone: 'Tone',
    photoCaptionPlaceholder: 'Add a caption (optional)',
    messagePlaceholder: 'Message Nouri…',
    today: 'Today',
    yesterday: 'Yesterday',
  },
  es: {
    welcomeSubtitle:
      'Elige una sugerencia abajo, una tarjeta, o escribe — te pregunto si lo hago yo o te guío paso a paso.',
    jumpLatest: 'Ir al final',
    latest: 'Reciente',
    signInForFeatures: 'Inicia sesión para reclamar, fotos y voz.',
    chatLanguage: 'Idioma del chat',
    conversationTone: 'Tono',
    photoCaptionPlaceholder: 'Añade un pie de foto (opcional)',
    messagePlaceholder: 'Escribe a Nouri…',
    today: 'Hoy',
    yesterday: 'Ayer',
  },
};

/** Normalize UI community role to a welcome-card role key. */
export function normalizeWelcomeRole(communityRole) {
  const role = String(communityRole || 'member').toLowerCase().trim();
  if (role === 'dispatcher') return 'organizer';
  if (!role) return 'member';
  return role;
}

export function t(lang, key) {
  const l = STRINGS[lang] || STRINGS.en;
  return l[key] || STRINGS.en[key] || key;
}

export function chatLang(lang) {
  return CHAT_UI_LANGUAGES.includes(lang) ? lang : 'en';
}

export function welcomeGreeting(lang, userName) {
  const first = userName ? String(userName).split(' ')[0] : '';
  if (lang === 'es') {
    return first ? `¡Hola, ${first}!` : '¡Hola!';
  }
  return first ? `Hi, ${first}!` : 'Hi there!';
}

// Genesis starter cards (Food Maps branding; same card set as the reference AI UI).
const WELCOME_CATEGORIES = {
  en: [
    {
      key: 'guide',
      icon: 'fa-compass',
      accent: 'emerald',
      title: 'Not sure?',
      blurb: 'I’ll walk you through it',
      prompts: ["I'm not sure what to do — help me", 'How does Food Maps work?'],
    },
    {
      key: 'find',
      icon: 'fa-magnifying-glass-location',
      accent: 'emerald',
      title: 'Find food',
      blurb: 'I’ll ask how you want help',
      prompts: ['I want to find food', 'Find free food near me'],
    },
    {
      key: 'share',
      icon: 'fa-hand-holding-heart',
      accent: 'emerald',
      title: 'Share food',
      blurb: 'I’ll ask how you want help',
      prompts: ['I want to share food', 'Share extra food from my address'],
    },
    {
      key: 'request',
      icon: 'fa-clipboard-list',
      accent: 'emerald',
      title: 'Request food',
      blurb: 'I’ll ask how you want help',
      prompts: ['I want to request food', 'Request food that isn’t listed yet'],
    },
    {
      key: 'manage',
      icon: 'fa-list-check',
      accent: 'emerald',
      title: 'Manage activity',
      blurb: 'Pickups, claims, impact',
      prompts: ['What are my upcoming pickups?', 'Show my impact stats'],
    },
  ],
  es: [
    {
      key: 'guide',
      icon: 'fa-compass',
      accent: 'emerald',
      title: '¿No estás seguro?',
      blurb: 'Te guío paso a paso',
      prompts: ['No sé qué hacer — ayúdame', '¿Cómo funciona Food Maps?'],
    },
    {
      key: 'find',
      icon: 'fa-magnifying-glass-location',
      accent: 'emerald',
      title: 'Buscar comida',
      blurb: 'Te pregunto cómo ayudar',
      prompts: ['Quiero buscar comida', 'Buscar comida gratis cerca'],
    },
    {
      key: 'share',
      icon: 'fa-hand-holding-heart',
      accent: 'emerald',
      title: 'Compartir comida',
      blurb: 'Te pregunto cómo ayudar',
      prompts: ['Quiero compartir comida', 'Compartir comida extra desde mi dirección'],
    },
    {
      key: 'request',
      icon: 'fa-clipboard-list',
      accent: 'emerald',
      title: 'Solicitar comida',
      blurb: 'Te pregunto cómo ayudar',
      prompts: ['Quiero solicitar comida', 'Solicitar comida que aún no está listada'],
    },
    {
      key: 'manage',
      icon: 'fa-list-check',
      accent: 'emerald',
      title: 'Mi actividad',
      blurb: 'Recogidas, reclamos, impacto',
      prompts: ['¿Cuáles son mis próximas recogidas?', 'Muestra mis estadísticas de impacto'],
    },
  ],
};

export function getWelcomeCategories(lang) {
  const key = lang === 'es' ? 'es' : 'en';
  return WELCOME_CATEGORIES[key].map((cat) => ({ ...cat }));
}

/**
 * Role filter for genesis cards:
 * - donor: hide find + request
 * - recipient: hide share
 * - everyone else (member/admin/volunteer/…): show all cards
 */
export function filterWelcomeCategories(categories, communityRole) {
  const role = normalizeWelcomeRole(communityRole);
  const list = Array.isArray(categories) ? categories : [];
  return list.filter((cat) => {
    if (role === 'donor') return cat.key !== 'find' && cat.key !== 'request';
    if (role === 'recipient') return cat.key !== 'share';
    return true;
  });
}

export function getSuggestions(lang) {
  const es = lang === 'es';
  return es
    ? [
        '¿Qué comida hay disponible cerca de mí?',
        '¿Cuáles son mis próximas recogidas?',
        'Muestra mis estadísticas de impacto',
        'Quiero compartir comida',
        '¿Cómo funciona Food Maps?',
      ]
    : [
        'What food is available near me?',
        'What are my upcoming pickups?',
        'Show my impact stats',
        'I want to share some food',
        'How does Food Maps work?',
      ];
}

export function dateLocale(lang) {
  return lang === 'es' ? 'es' : 'en-US';
}

/** Day-separator labels for chat: dateLabel(lang, 'today' | 'yesterday'). */
export function dateLabel(lang, key) {
  return t(lang, key);
}

export function formatChatTime(value) {
  if (value == null || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
