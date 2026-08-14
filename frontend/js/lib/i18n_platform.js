// Shared i18n bootstrap for every Food Maps page.
// Include ONCE in <head> on any HTML page:
//   <link rel="stylesheet" href="assets/css/i18n_platform.css?v=20260812c">
//   <script src="js/lib/i18n_platform.js?v=20260812c"></script>
//
// This module:
//   1. Patches DOM for React + Google Translate compatibility
//   2. Restores googtrans cookie + html lang/dir from localStorage (app_lang)
//   3. Loads Google Translate widget (hidden)
//   4. Auto-loads i18n.js + i18n_autotranslate.js + languagePicker.js if absent
//   5. Mounts a floating globe picker when no inline picker exists
//   6. Applies saved language on page load (ES static or Google-translated)

(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__fmI18nPlatformBooted) return;
  window.__fmI18nPlatformBooted = true;

  var VERSION = '20260812d';
  var STORAGE_KEY = 'app_lang';
  var GOOGLE_CODES = {
    en: 'en', es: 'es', ar: 'ar', fa: 'fa',
    zh: 'zh-CN', yue: 'zh-TW', tl: 'tl', vi: 'vi', hi: 'hi', pa: 'pa',
  };
  var STATIC_LANGS = { en: true, es: true };
  var RTL_LANGS = { ar: true, fa: true };
  var STACK = [
    'js/lib/i18n.js',
    'js/lib/i18n_autotranslate.js',
    'js/lib/languagePicker.js',
  ];

  // --- React + Google Translate DOM patch ---
  if (typeof Node !== 'undefined' && Node.prototype && !Node.prototype.__gtPatched__) {
    var origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child && child.parentNode !== this) {
        if (child.parentNode) return child.parentNode.removeChild(child);
        return child;
      }
      return origRemoveChild.call(this, child);
    };
    var origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        return origInsertBefore.call(this, newNode, null);
      }
      return origInsertBefore.call(this, newNode, referenceNode);
    };
    Node.prototype.__gtPatched__ = true;
  }

  function normalizeLang(lang) {
    if (!lang) return 'en';
    var raw = String(lang).toLowerCase();
    if (GOOGLE_CODES[raw]) return raw;
    if (raw === 'zh-cn' || raw === 'zh-hans') return 'zh';
    if (raw === 'zh-tw' || raw === 'zh-hk') return 'yue';
    if (raw === 'fil') return 'tl';
    var short = raw.slice(0, 2);
    return GOOGLE_CODES[short] ? short : 'en';
  }

  function setGoogtransCookie(googleCode) {
    var host = (typeof location !== 'undefined' && location.hostname) || '';
    var value = googleCode && googleCode !== 'en' ? '/en/' + googleCode : '';
    var base = 'path=/;';
    try {
      if (value) {
        document.cookie = 'googtrans=' + value + '; ' + base;
        if (host) {
          document.cookie = 'googtrans=' + value + '; domain=' + host + '; ' + base;
          var parts = host.split('.');
          if (parts.length > 2) {
            document.cookie = 'googtrans=' + value + '; domain=.' + parts.slice(-2).join('.') + '; ' + base;
          }
        }
      } else {
        var expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; ' + base;
        document.cookie = 'googtrans=; ' + expired;
        if (host) document.cookie = 'googtrans=; domain=' + host + '; ' + expired;
      }
    } catch (_) {}
  }

  var savedLang = 'en';
  try { savedLang = normalizeLang(localStorage.getItem(STORAGE_KEY)); } catch (_) {}
  var savedGoogle = GOOGLE_CODES[savedLang] || 'en';

  if (savedGoogle !== 'en') {
    setGoogtransCookie(savedGoogle);
  } else {
    setGoogtransCookie('');
  }
  try {
    document.documentElement.lang = savedLang;
    document.documentElement.dir = RTL_LANGS[savedLang] ? 'rtl' : 'ltr';
  } catch (_) {}

  function ensureGoogleMount() {
    if (document.getElementById('google_translate_element')) return;
    var el = document.createElement('div');
    el.id = 'google_translate_element';
    el.setAttribute('aria-hidden', 'true');
    (document.body || document.documentElement).appendChild(el);
  }

  // Google injects a top banner iframe and pushes body down — strip it.
  function hideGoogleBar() {
    try {
      var selectors = [
        'iframe.goog-te-banner-frame',
        '.goog-te-banner-frame',
        '.goog-te-ftab',
        '.goog-te-gadget',
        '#goog-gt-tt',
      ];
      for (var i = 0; i < selectors.length; i++) {
        var nodes = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          node.style.setProperty('display', 'none', 'important');
          node.style.setProperty('visibility', 'hidden', 'important');
          node.style.setProperty('height', '0', 'important');
          node.style.setProperty('max-height', '0', 'important');
          node.style.setProperty('overflow', 'hidden', 'important');
          node.style.setProperty('pointer-events', 'none', 'important');
        }
      }
      if (document.body) {
        document.body.style.setProperty('top', '0', 'important');
        document.body.style.setProperty('margin-top', '0', 'important');
        document.body.style.setProperty('padding-top', '0', 'important');
        document.body.style.setProperty('position', 'static', 'important');
      }
      if (document.documentElement) {
        document.documentElement.style.setProperty('top', '0', 'important');
        document.documentElement.style.setProperty('margin-top', '0', 'important');
      }
      var wrappers = document.querySelectorAll('body > .skiptranslate');
      for (var w = 0; w < wrappers.length; w++) {
        if (wrappers[w].querySelector('iframe.goog-te-banner-frame, .goog-te-banner-frame')) {
          wrappers[w].style.setProperty('display', 'none', 'important');
          wrappers[w].style.setProperty('height', '0', 'important');
        }
      }
    } catch (_) {}
  }

  var barObserver = null;
  function watchGoogleBar() {
    hideGoogleBar();
    if (barObserver) return;
    if (typeof MutationObserver === 'undefined') return;
    barObserver = new MutationObserver(function () {
      hideGoogleBar();
    });
    var target = document.body || document.documentElement;
    if (target) {
      barObserver.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    }
    // Google sets body.top shortly after translate — sweep a few times.
    var sweeps = 0;
    var sweepTimer = setInterval(function () {
      hideGoogleBar();
      sweeps += 1;
      if (sweeps >= 20) clearInterval(sweepTimer);
    }, 250);
  }

  function driveGoogleCombo(googleCode, tries) {
    tries = tries == null ? 0 : tries;
    if (!googleCode || googleCode === 'en') return;
    var combo = document.querySelector('.goog-te-combo');
    if (combo) {
      try {
        if (combo.value !== googleCode) combo.value = googleCode;
        combo.dispatchEvent(new Event('change'));
        watchGoogleBar();
      } catch (_) {}
      return;
    }
    if (tries < 40) {
      setTimeout(function () { driveGoogleCombo(googleCode, tries + 1); }, 150);
    }
  }

  window.googleTranslateElementInit = function () {
    try {
      ensureGoogleMount();
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,ar,fa,zh-CN,zh-TW,tl,vi,hi,pa',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
      if (savedGoogle !== 'en') {
        driveGoogleCombo(savedGoogle);
      }
      watchGoogleBar();
    } catch (e) {
      if (console && console.warn) console.warn('Google Translate init failed', e);
    }
  };

  function loadGoogleScript() {
    if (document.getElementById('fm-google-translate-script')) return;
    var s = document.createElement('script');
    s.id = 'fm-google-translate-script';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src + '?v=' + VERSION;
    s.onload = function () { cb(null); };
    s.onerror = function () { cb(new Error('failed: ' + src)); };
    (document.body || document.head).appendChild(s);
  }

  function loadStack(index, done) {
    if (index >= STACK.length) {
      done();
      return;
    }
    loadScript(STACK[index], function () {
      loadStack(index + 1, done);
    });
  }

  function injectFloatingPicker() {
    if (document.getElementById('fm-floating-lang-picker')) return;
    if (document.querySelector('[data-language-picker]')) return;
    if (document.querySelector('.fm-lang-picker')) return;

    var wrap = document.createElement('div');
    wrap.id = 'fm-floating-lang-picker';
    wrap.className = 'fm-floating-lang-picker skiptranslate notranslate';
    wrap.setAttribute('translate', 'no');
    wrap.innerHTML = '<div data-language-picker></div>';
    document.body.appendChild(wrap);
  }

  function applySavedLanguage() {
    var lang = savedLang;
    try {
      if (window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
        lang = window.i18n.getCurrentLanguage();
      }
    } catch (_) {}

    injectFloatingPicker();

    if (window.fmLanguagePicker && typeof window.fmLanguagePicker.refresh === 'function') {
      window.fmLanguagePicker.refresh();
    }

    if (STATIC_LANGS[lang]) {
      if (lang === 'es' && window.i18nAuto && typeof window.i18nAuto.translateAll === 'function') {
        try { window.i18nAuto.translateAll(); } catch (_) {}
      }
      return;
    }

    var googleCode = GOOGLE_CODES[lang] || 'en';
    if (googleCode !== 'en') {
      driveGoogleCombo(googleCode);
    }
  }

  function finishPlatformBoot() {
    ensureGoogleMount();
    loadGoogleScript();

    if (window.i18n) {
      applySavedLanguage();
      try {
        window.dispatchEvent(new CustomEvent('i18nStackReady', { detail: { language: savedLang } }));
      } catch (_) {}
      return;
    }

    loadStack(0, function () {
      applySavedLanguage();
      try {
        window.dispatchEvent(new CustomEvent('i18nStackReady', { detail: { language: savedLang } }));
      } catch (_) {}
    });
  }

  function onReady() {
    watchGoogleBar();
    finishPlatformBoot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }

  window.fmI18nPlatform = {
    version: VERSION,
    refresh: applySavedLanguage,
    getSavedLanguage: function () { return savedLang; },
  };
})();
