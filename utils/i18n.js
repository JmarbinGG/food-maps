// Lightweight i18n module for English / Spanish toggle.
// Exposes window.i18n. Components should re-render via the
// useTranslation hook (utils/useTranslation.js) which listens
// to the `languageChanged` event dispatched here.

(function () {
  const STORAGE_KEY = 'app_lang';
  const SUPPORTED = ['en', 'es'];

  const translations = {
    en: {
      // Header
      'header.support': 'Support',
      'header.feedback': 'Feedback',
      'header.find_food': 'Find Food',
      'header.share_food': 'Share Food',
      'header.admin_panel': 'Admin Panel',
      'header.profile_settings': 'Profile Settings',
      'header.logout': 'Logout',
      'header.login': 'Login',
      'header.sign_up': 'Sign Up',
      'header.language': 'Language',

      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.close': 'Close',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.confirm': 'Confirm',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.search': 'Search',

      // Dashboard / AI
      'ai.assistant': 'Your AI Assistant',
      'ai.meal_suggestions': 'AI Meal Suggestions',
      'ai.spoilage_alerts': 'Spoilage Risk Alerts',
      'ai.storage_coach': 'AI Storage Coach',
      'ai.smart_notifications': 'Smart Notifications',
      'ai.chat_placeholder': 'Ask me anything about food...',
      'ai.send': 'Send',
    },
    es: {
      // Header
      'header.support': 'Soporte',
      'header.feedback': 'Comentarios',
      'header.find_food': 'Buscar Comida',
      'header.share_food': 'Compartir Comida',
      'header.admin_panel': 'Panel de Administración',
      'header.profile_settings': 'Configuración del Perfil',
      'header.logout': 'Cerrar Sesión',
      'header.login': 'Iniciar Sesión',
      'header.sign_up': 'Registrarse',
      'header.language': 'Idioma',

      // Common
      'common.loading': 'Cargando...',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.close': 'Cerrar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.confirm': 'Confirmar',
      'common.yes': 'Sí',
      'common.no': 'No',
      'common.search': 'Buscar',

      // Dashboard / AI
      'ai.assistant': 'Tu Asistente de IA',
      'ai.meal_suggestions': 'Sugerencias de Comidas con IA',
      'ai.spoilage_alerts': 'Alertas de Riesgo de Deterioro',
      'ai.storage_coach': 'Asesor de Almacenamiento IA',
      'ai.smart_notifications': 'Notificaciones Inteligentes',
      'ai.chat_placeholder': 'Pregúntame lo que sea sobre comida...',
      'ai.send': 'Enviar',
    },
  };

  function normalize(lang) {
    if (!lang) return 'en';
    const short = String(lang).toLowerCase().slice(0, 2);
    return SUPPORTED.includes(short) ? short : 'en';
  }

  let current = normalize(
    (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) ||
      (typeof navigator !== 'undefined' && navigator.language) ||
      'en'
  );

  function applyHtmlLang(lang) {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = lang;
      }
    } catch (_) {}
  }

  applyHtmlLang(current);

  const i18n = {
    getCurrentLanguage() {
      return current;
    },
    getSupportedLanguages() {
      return SUPPORTED.slice();
    },
    setLanguage(lang) {
      const next = normalize(lang);
      if (next === current) return current;
      current = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {}
      applyHtmlLang(next);
      try {
        window.dispatchEvent(
          new CustomEvent('languageChanged', { detail: { language: next } })
        );
      } catch (_) {}
      return next;
    },
    toggle() {
      return this.setLanguage(current === 'en' ? 'es' : 'en');
    },
    t(key, langOrFallback, fallback) {
      // Supported call shapes:
      //   t('key')
      //   t('key', 'en')              — explicit language
      //   t('key', 'fallback text')   — fallback when key missing
      //   t('key', 'en', 'fallback')
      let lang = current;
      let fb = key;
      if (typeof langOrFallback === 'string') {
        if (SUPPORTED.includes(langOrFallback)) {
          lang = langOrFallback;
          if (typeof fallback === 'string') fb = fallback;
        } else {
          fb = langOrFallback;
        }
      }
      const dict = translations[lang] || translations.en;
      if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
      if (Object.prototype.hasOwnProperty.call(translations.en, key)) {
        return translations.en[key];
      }
      return fb;
    },
    // Allow other modules to extend the dictionary at runtime.
    addTranslations(lang, entries) {
      const l = normalize(lang);
      translations[l] = Object.assign({}, translations[l] || {}, entries || {});
    },
    // Back-compat shims for legacy static pages (privacy/terms/cookies)
    // that expect a richer API. The runtime DOM auto-translator handles
    // actual translation, so these are safe no-ops aside from triggering
    // a re-translation pass.
    initLanguageSystem() {
      if (typeof window !== 'undefined' && window.i18nAuto && window.i18nAuto.translateAll) {
        try { window.i18nAuto.translateAll(); } catch (e) {}
      }
    },
    translatePage() {
      if (typeof window !== 'undefined' && window.i18nAuto && window.i18nAuto.translateAll) {
        try { window.i18nAuto.translateAll(); } catch (e) {}
      }
    },
  };

  if (typeof window !== 'undefined') {
    window.i18n = i18n;
  }
})();
