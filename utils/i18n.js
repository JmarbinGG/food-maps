// Lightweight i18n module. Exposes window.i18n.
// - English (en) and Spanish (es) use hand-crafted static dictionaries
//   plus the DOM auto-translator (utils/i18n_autotranslate.js) for
//   snappy in-page toggling.
// - All other supported languages fall back to the Google Website
//   Translator widget (loaded from index.html) driven via a cookie so
//   the full page contents get translated. Core UI phrases (header,
//   AI menu, common actions) still ship with hand-written translations
//   so key nav elements render correctly the moment the page loads.

(function () {
  const STORAGE_KEY = 'app_lang';

  // Language catalog. `google` is the Google Translate language code
  // used when we hand off to the widget. `static` marks languages we
  // ship a complete offline dictionary + auto-translator for.
  const LANGUAGES = {
    en:  { name: 'English',    nativeName: 'English',       dir: 'ltr', google: 'en',    static: true  },
    es:  { name: 'Spanish',    nativeName: 'Español',       dir: 'ltr', google: 'es',    static: true  },
    ar:  { name: 'Arabic',     nativeName: 'العربية',       dir: 'rtl', google: 'ar',    static: false },
    fa:  { name: 'Persian',    nativeName: 'فارسی',         dir: 'rtl', google: 'fa',    static: false },
    zh:  { name: 'Mandarin',   nativeName: '中文 (简体)',    dir: 'ltr', google: 'zh-CN', static: false },
    yue: { name: 'Cantonese',  nativeName: '廣東話 (繁體)',   dir: 'ltr', google: 'zh-TW', static: false },
    tl:  { name: 'Tagalog',    nativeName: 'Tagalog',       dir: 'ltr', google: 'tl',    static: false },
    vi:  { name: 'Vietnamese', nativeName: 'Tiếng Việt',    dir: 'ltr', google: 'vi',    static: false },
    hi:  { name: 'Hindi',      nativeName: 'हिन्दी',         dir: 'ltr', google: 'hi',    static: false },
    pa:  { name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',         dir: 'ltr', google: 'pa',    static: false },
  };

  const SUPPORTED = Object.keys(LANGUAGES);

  // Static translations for core UI keys used by React components.
  // Every language ships translations for these so nav labels render
  // in the chosen language even before the Google widget kicks in.
  const translations = {
    en: {
      'header.support':          'Support',
      'header.feedback':         'Feedback',
      'header.find_food':        'Find Food',
      'header.share_food':       'Share Food',
      'header.admin_panel':      'Admin Panel',
      'header.profile_settings': 'Profile Settings',
      'header.logout':           'Logout',
      'header.login':            'Login',
      'header.sign_up':          'Sign Up',
      'header.language':         'Language',
      'common.loading':          'Loading...',
      'common.save':             'Save',
      'common.cancel':           'Cancel',
      'common.close':            'Close',
      'common.delete':           'Delete',
      'common.edit':             'Edit',
      'common.confirm':          'Confirm',
      'common.yes':              'Yes',
      'common.no':               'No',
      'common.search':           'Search',
      'ai.assistant':            'Your AI Assistant',
      'ai.meal_suggestions':     'AI Meal Suggestions',
      'ai.spoilage_alerts':      'Spoilage Risk Alerts',
      'ai.storage_coach':        'AI Storage Coach',
      'ai.smart_notifications':  'Smart Notifications',
      'ai.chat_placeholder':     'Ask me anything about food...',
      'ai.send':                 'Send',
    },
    es: {
      'header.support':          'Soporte',
      'header.feedback':         'Comentarios',
      'header.find_food':        'Buscar Comida',
      'header.share_food':       'Compartir Comida',
      'header.admin_panel':      'Panel de Administración',
      'header.profile_settings': 'Configuración del Perfil',
      'header.logout':           'Cerrar Sesión',
      'header.login':            'Iniciar Sesión',
      'header.sign_up':          'Registrarse',
      'header.language':         'Idioma',
      'common.loading':          'Cargando...',
      'common.save':             'Guardar',
      'common.cancel':           'Cancelar',
      'common.close':            'Cerrar',
      'common.delete':           'Eliminar',
      'common.edit':             'Editar',
      'common.confirm':          'Confirmar',
      'common.yes':              'Sí',
      'common.no':               'No',
      'common.search':           'Buscar',
      'ai.assistant':            'Tu Asistente de IA',
      'ai.meal_suggestions':     'Sugerencias de Comidas con IA',
      'ai.spoilage_alerts':      'Alertas de Riesgo de Deterioro',
      'ai.storage_coach':        'Asesor de Almacenamiento IA',
      'ai.smart_notifications':  'Notificaciones Inteligentes',
      'ai.chat_placeholder':     'Pregúntame lo que sea sobre comida...',
      'ai.send':                 'Enviar',
    },
    ar: {
      'header.support':          'الدعم',
      'header.feedback':         'التعليقات',
      'header.find_food':        'ابحث عن طعام',
      'header.share_food':       'شارك الطعام',
      'header.admin_panel':      'لوحة الإدارة',
      'header.profile_settings': 'إعدادات الملف الشخصي',
      'header.logout':           'تسجيل الخروج',
      'header.login':            'تسجيل الدخول',
      'header.sign_up':          'إنشاء حساب',
      'header.language':         'اللغة',
      'common.loading':          'جارٍ التحميل...',
      'common.save':             'حفظ',
      'common.cancel':           'إلغاء',
      'common.close':            'إغلاق',
      'common.delete':           'حذف',
      'common.edit':             'تعديل',
      'common.confirm':          'تأكيد',
      'common.yes':              'نعم',
      'common.no':               'لا',
      'common.search':           'بحث',
      'ai.assistant':            'مساعدك الذكي',
      'ai.meal_suggestions':     'اقتراحات وجبات بالذكاء الاصطناعي',
      'ai.spoilage_alerts':      'تنبيهات خطر التلف',
      'ai.storage_coach':        'مدرب التخزين الذكي',
      'ai.smart_notifications':  'إشعارات ذكية',
      'ai.chat_placeholder':     'اسألني أي شيء عن الطعام...',
      'ai.send':                 'إرسال',
    },
    fa: {
      'header.support':          'پشتیبانی',
      'header.feedback':         'بازخورد',
      'header.find_food':        'پیدا کردن غذا',
      'header.share_food':       'اشتراک‌گذاری غذا',
      'header.admin_panel':      'پنل مدیریت',
      'header.profile_settings': 'تنظیمات پروفایل',
      'header.logout':           'خروج',
      'header.login':            'ورود',
      'header.sign_up':          'ثبت‌نام',
      'header.language':         'زبان',
      'common.loading':          'در حال بارگذاری...',
      'common.save':             'ذخیره',
      'common.cancel':           'لغو',
      'common.close':            'بستن',
      'common.delete':           'حذف',
      'common.edit':             'ویرایش',
      'common.confirm':          'تأیید',
      'common.yes':              'بله',
      'common.no':               'خیر',
      'common.search':           'جستجو',
      'ai.assistant':            'دستیار هوشمند شما',
      'ai.meal_suggestions':     'پیشنهاد غذا با هوش مصنوعی',
      'ai.spoilage_alerts':      'هشدارهای خطر فساد',
      'ai.storage_coach':        'مربی نگهداری هوشمند',
      'ai.smart_notifications':  'اعلان‌های هوشمند',
      'ai.chat_placeholder':     'هر چیزی درباره غذا از من بپرسید...',
      'ai.send':                 'ارسال',
    },
    zh: {
      'header.support':          '支持',
      'header.feedback':         '反馈',
      'header.find_food':        '查找食物',
      'header.share_food':       '分享食物',
      'header.admin_panel':      '管理面板',
      'header.profile_settings': '个人资料设置',
      'header.logout':           '退出',
      'header.login':            '登录',
      'header.sign_up':          '注册',
      'header.language':         '语言',
      'common.loading':          '加载中...',
      'common.save':             '保存',
      'common.cancel':           '取消',
      'common.close':            '关闭',
      'common.delete':           '删除',
      'common.edit':             '编辑',
      'common.confirm':          '确认',
      'common.yes':              '是',
      'common.no':               '否',
      'common.search':           '搜索',
      'ai.assistant':            '您的AI助手',
      'ai.meal_suggestions':     'AI膳食建议',
      'ai.spoilage_alerts':      '变质风险警报',
      'ai.storage_coach':        'AI存储教练',
      'ai.smart_notifications':  '智能通知',
      'ai.chat_placeholder':     '问我任何关于食物的问题...',
      'ai.send':                 '发送',
    },
    yue: {
      'header.support':          '支援',
      'header.feedback':         '意見反饋',
      'header.find_food':        '搵食物',
      'header.share_food':       '分享食物',
      'header.admin_panel':      '管理面板',
      'header.profile_settings': '個人資料設定',
      'header.logout':           '登出',
      'header.login':            '登入',
      'header.sign_up':          '註冊',
      'header.language':         '語言',
      'common.loading':          '載入中...',
      'common.save':             '儲存',
      'common.cancel':           '取消',
      'common.close':            '關閉',
      'common.delete':           '刪除',
      'common.edit':             '編輯',
      'common.confirm':          '確認',
      'common.yes':              '係',
      'common.no':               '唔係',
      'common.search':           '搜尋',
      'ai.assistant':            '你嘅AI助手',
      'ai.meal_suggestions':     'AI膳食建議',
      'ai.spoilage_alerts':      '變質風險警報',
      'ai.storage_coach':        'AI儲存教練',
      'ai.smart_notifications':  '智能通知',
      'ai.chat_placeholder':     '問我任何關於食物嘅問題...',
      'ai.send':                 '傳送',
    },
    tl: {
      'header.support':          'Suporte',
      'header.feedback':         'Feedback',
      'header.find_food':        'Maghanap ng Pagkain',
      'header.share_food':       'Magbahagi ng Pagkain',
      'header.admin_panel':      'Admin Panel',
      'header.profile_settings': 'Mga Setting ng Profile',
      'header.logout':           'Mag-logout',
      'header.login':            'Mag-login',
      'header.sign_up':          'Mag-sign up',
      'header.language':         'Wika',
      'common.loading':          'Naglo-load...',
      'common.save':             'I-save',
      'common.cancel':           'Kanselahin',
      'common.close':            'Isara',
      'common.delete':           'Tanggalin',
      'common.edit':             'I-edit',
      'common.confirm':          'Kumpirmahin',
      'common.yes':              'Oo',
      'common.no':               'Hindi',
      'common.search':           'Maghanap',
      'ai.assistant':            'Iyong AI Assistant',
      'ai.meal_suggestions':     'Mga Mungkahi sa Pagkain ng AI',
      'ai.spoilage_alerts':      'Mga Alerto sa Panganib ng Pagkasira',
      'ai.storage_coach':        'AI Storage Coach',
      'ai.smart_notifications':  'Mga Smart na Abiso',
      'ai.chat_placeholder':     'Tanungin mo ako ng kahit ano tungkol sa pagkain...',
      'ai.send':                 'Ipadala',
    },
    vi: {
      'header.support':          'Hỗ trợ',
      'header.feedback':         'Phản hồi',
      'header.find_food':        'Tìm thức ăn',
      'header.share_food':       'Chia sẻ thức ăn',
      'header.admin_panel':      'Bảng quản trị',
      'header.profile_settings': 'Cài đặt hồ sơ',
      'header.logout':           'Đăng xuất',
      'header.login':            'Đăng nhập',
      'header.sign_up':          'Đăng ký',
      'header.language':         'Ngôn ngữ',
      'common.loading':          'Đang tải...',
      'common.save':             'Lưu',
      'common.cancel':           'Hủy',
      'common.close':            'Đóng',
      'common.delete':           'Xóa',
      'common.edit':             'Chỉnh sửa',
      'common.confirm':          'Xác nhận',
      'common.yes':              'Có',
      'common.no':               'Không',
      'common.search':           'Tìm kiếm',
      'ai.assistant':            'Trợ lý AI của bạn',
      'ai.meal_suggestions':     'Gợi ý bữa ăn AI',
      'ai.spoilage_alerts':      'Cảnh báo nguy cơ hư hỏng',
      'ai.storage_coach':        'Huấn luyện viên bảo quản AI',
      'ai.smart_notifications':  'Thông báo thông minh',
      'ai.chat_placeholder':     'Hỏi tôi bất cứ điều gì về thức ăn...',
      'ai.send':                 'Gửi',
    },
    hi: {
      'header.support':          'सहायता',
      'header.feedback':         'प्रतिक्रिया',
      'header.find_food':        'भोजन खोजें',
      'header.share_food':       'भोजन साझा करें',
      'header.admin_panel':      'व्यवस्थापन पैनल',
      'header.profile_settings': 'प्रोफ़ाइल सेटिंग्स',
      'header.logout':           'लॉग आउट',
      'header.login':            'लॉग इन',
      'header.sign_up':          'साइन अप',
      'header.language':         'भाषा',
      'common.loading':          'लोड हो रहा है...',
      'common.save':             'सहेजें',
      'common.cancel':           'रद्द करें',
      'common.close':            'बंद करें',
      'common.delete':           'हटाएं',
      'common.edit':             'संपादित करें',
      'common.confirm':          'पुष्टि करें',
      'common.yes':              'हाँ',
      'common.no':               'नहीं',
      'common.search':           'खोजें',
      'ai.assistant':            'आपका AI सहायक',
      'ai.meal_suggestions':     'AI भोजन सुझाव',
      'ai.spoilage_alerts':      'खराब होने के जोखिम की चेतावनी',
      'ai.storage_coach':        'AI संग्रहण कोच',
      'ai.smart_notifications':  'स्मार्ट सूचनाएं',
      'ai.chat_placeholder':     'भोजन के बारे में मुझसे कुछ भी पूछें...',
      'ai.send':                 'भेजें',
    },
    pa: {
      'header.support':          'ਸਹਾਇਤਾ',
      'header.feedback':         'ਫੀਡਬੈਕ',
      'header.find_food':        'ਭੋਜਨ ਲੱਭੋ',
      'header.share_food':       'ਭੋਜਨ ਸਾਂਝਾ ਕਰੋ',
      'header.admin_panel':      'ਪ੍ਰਬੰਧਕ ਪੈਨਲ',
      'header.profile_settings': 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਜ਼',
      'header.logout':           'ਲਾਗਆਊਟ',
      'header.login':            'ਲਾਗਇਨ',
      'header.sign_up':          'ਸਾਈਨ ਅੱਪ',
      'header.language':         'ਭਾਸ਼ਾ',
      'common.loading':          'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      'common.save':             'ਸੇਵ ਕਰੋ',
      'common.cancel':           'ਰੱਦ ਕਰੋ',
      'common.close':            'ਬੰਦ ਕਰੋ',
      'common.delete':           'ਮਿਟਾਓ',
      'common.edit':             'ਸੰਪਾਦਿਤ ਕਰੋ',
      'common.confirm':          'ਪੁਸ਼ਟੀ ਕਰੋ',
      'common.yes':              'ਹਾਂ',
      'common.no':               'ਨਹੀਂ',
      'common.search':           'ਖੋਜੋ',
      'ai.assistant':            'ਤੁਹਾਡਾ AI ਸਹਾਇਕ',
      'ai.meal_suggestions':     'AI ਭੋਜਨ ਸੁਝਾਅ',
      'ai.spoilage_alerts':      'ਖਰਾਬ ਹੋਣ ਦੇ ਖ਼ਤਰੇ ਦੀ ਚੇਤਾਵਨੀ',
      'ai.storage_coach':        'AI ਸਟੋਰੇਜ ਕੋਚ',
      'ai.smart_notifications':  'ਸਮਾਰਟ ਸੂਚਨਾਵਾਂ',
      'ai.chat_placeholder':     'ਭੋਜਨ ਬਾਰੇ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ...',
      'ai.send':                 'ਭੇਜੋ',
    },
  };

  function normalize(lang) {
    if (!lang) return 'en';
    const raw = String(lang).toLowerCase();
    if (SUPPORTED.includes(raw)) return raw;
    // Map common browser locales / Google codes back to our internal codes.
    if (raw === 'zh-cn' || raw === 'zh-hans' || raw === 'cmn') return 'zh';
    if (raw === 'zh-tw' || raw === 'zh-hk' || raw === 'zh-hant') return 'yue';
    if (raw === 'fil')  return 'tl';
    const short = raw.slice(0, 2);
    return SUPPORTED.includes(short) ? short : 'en';
  }

  function langMeta(lang) {
    return LANGUAGES[normalize(lang)] || LANGUAGES.en;
  }

  let current = normalize(
    (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) ||
      (typeof navigator !== 'undefined' && navigator.language) ||
      'en'
  );

  function applyHtmlLangAndDir(lang) {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        const meta = langMeta(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = meta.dir || 'ltr';
      }
    } catch (_) {}
  }

  applyHtmlLangAndDir(current);

  // ---------------------------------------------------------------
  // Google Translate widget integration
  // ---------------------------------------------------------------
  // The widget is loaded in index.html. We drive it in two ways:
  //   1. Via the `googtrans` cookie (works before the widget is ready
  //      and survives a page reload).
  //   2. Via the hidden .goog-te-combo <select> once the widget has
  //      mounted (avoids a reload for a snappier switch).
  function setGoogleTranslateCookie(googleCode) {
    if (typeof document === 'undefined') return;
    const host = (typeof location !== 'undefined' && location.hostname) || '';
    const value = googleCode && googleCode !== 'en' ? `/en/${googleCode}` : '/en/en';
    const attrs = 'path=/;';
    try {
      document.cookie = `googtrans=${value}; ${attrs}`;
      if (host) {
        document.cookie = `googtrans=${value}; domain=${host}; ${attrs}`;
        // Also set on the eTLD+1 so it survives across subdomains.
        const parts = host.split('.');
        if (parts.length > 2) {
          const parent = '.' + parts.slice(-2).join('.');
          document.cookie = `googtrans=${value}; domain=${parent}; ${attrs}`;
        }
      }
    } catch (_) {}
  }

  function clearGoogleTranslateCookie() {
    if (typeof document === 'undefined') return;
    const host = (typeof location !== 'undefined' && location.hostname) || '';
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    try {
      document.cookie = `googtrans=; ${expired}`;
      if (host) {
        document.cookie = `googtrans=; domain=${host}; ${expired}`;
        const parts = host.split('.');
        if (parts.length > 2) {
          const parent = '.' + parts.slice(-2).join('.');
          document.cookie = `googtrans=; domain=${parent}; ${expired}`;
        }
      }
    } catch (_) {}
  }

  function driveGoogleCombo(googleCode, tries) {
    tries = tries == null ? 0 : tries;
    if (typeof document === 'undefined') return false;
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      try {
        combo.value = googleCode;
        combo.dispatchEvent(new Event('change'));
      } catch (_) {}
      return true;
    }
    if (tries < 20) {
      // Widget still loading; retry briefly.
      setTimeout(function () { driveGoogleCombo(googleCode, tries + 1); }, 150);
    }
    return false;
  }

  const i18n = {
    getCurrentLanguage() {
      return current;
    },
    getSupportedLanguages() {
      return SUPPORTED.slice();
    },
    getLanguages() {
      // Return copy of the full metadata table so the UI can render a picker.
      return SUPPORTED.map(function (code) {
        return Object.assign({ code: code }, LANGUAGES[code]);
      });
    },
    getLanguageMeta(lang) {
      return Object.assign({}, langMeta(lang || current));
    },
    isStatic(lang) {
      return !!langMeta(lang || current).static;
    },
    setLanguage(lang) {
      const next = normalize(lang);
      if (next === current) return current;
      const prev = current;
      const prevMeta = langMeta(prev);
      const nextMeta = langMeta(next);
      current = next;
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
      applyHtmlLangAndDir(next);

      // Determine transition strategy between static (EN/ES) and
      // Google-translated languages. Switches that cross this boundary
      // are cleanest with a reload so we start from a clean English
      // baseline before applying the target translation.
      const crossesStaticBoundary = prevMeta.static !== nextMeta.static;
      const bothStatic = prevMeta.static && nextMeta.static;

      if (nextMeta.static) {
        // Target is EN or ES. Clear any active Google translation.
        clearGoogleTranslateCookie();
        if (!bothStatic) {
          // We were previously Google-translated; reload to drop that state.
          try { location.reload(); return next; } catch (_) {}
        }
        // Static ⇄ static: dispatch the event so the DOM auto-translator
        // swaps EN ⇄ ES in place.
        try {
          window.dispatchEvent(
            new CustomEvent('languageChanged', { detail: { language: next } })
          );
        } catch (_) {}
        return next;
      }

      // Target requires Google Translate.
      setGoogleTranslateCookie(nextMeta.google);
      if (crossesStaticBoundary) {
        // Reload so the page starts in English before Google translates.
        try { location.reload(); return next; } catch (_) {}
      }
      // Google → Google switch: try to drive the combo live; fall back
      // to a reload if the widget hasn't mounted yet.
      if (!driveGoogleCombo(nextMeta.google)) {
        try { location.reload(); return next; } catch (_) {}
      }
      try {
        window.dispatchEvent(
          new CustomEvent('languageChanged', { detail: { language: next } })
        );
      } catch (_) {}
      return next;
    },
    toggle() {
      // Legacy shim: still flips EN ⇄ ES for callers that pre-date the
      // multi-language picker.
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
    addTranslations(lang, entries) {
      const l = normalize(lang);
      translations[l] = Object.assign({}, translations[l] || {}, entries || {});
    },
    // Back-compat shims for legacy static pages (privacy/terms/cookies)
    // that expect a richer API. The DOM auto-translator / Google widget
    // handle actual translation, so these are safe no-ops aside from
    // triggering a re-translation pass.
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
