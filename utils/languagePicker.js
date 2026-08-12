// Vanilla language picker for static HTML pages.
// Mounts into elements with [data-language-picker].
// React app uses components/LanguagePicker.js instead.

(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.fmLanguagePicker) return;

  var GLOBE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
  var CHECK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function getLanguages() {
    if (window.i18n && typeof window.i18n.getLanguages === 'function') {
      return window.i18n.getLanguages();
    }
    return [
      { code: 'en', label: 'English', dir: 'ltr' },
      { code: 'es', label: 'Español', dir: 'ltr' },
    ];
  }

  function currentLang() {
    if (window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
      return window.i18n.getCurrentLanguage();
    }
    return 'en';
  }

  function closeAll(except) {
    document.querySelectorAll('.fm-lang-picker.is-open').forEach(function (el) {
      if (except && el === except) return;
      el.classList.remove('is-open');
      var btn = el.querySelector('.fm-lang-picker__btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      var menu = el.querySelector('.fm-lang-picker__menu');
      if (menu) menu.hidden = true;
    });
  }

  function buildPicker(mount, opts) {
    opts = opts || {};
    var mobile = !!opts.mobile;
    var lang = currentLang();
    var languages = getLanguages();
    var active = languages.find(function (l) { return l.code === lang; }) || languages[0];

    mount.innerHTML = '';
    mount.className = 'fm-lang-picker skiptranslate notranslate' + (mobile ? ' fm-lang-picker--block' : '');
    mount.setAttribute('translate', 'no');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fm-lang-picker__btn';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Language');
    btn.innerHTML = GLOBE_SVG + (mobile ? '<span>Language</span>' : '<span class="fm-lang-picker__code">' + (active.code || 'en').toUpperCase() + '</span>');

    var menu = document.createElement('div');
    menu.className = 'fm-lang-picker__menu' + (mobile ? ' fm-lang-picker__menu--mobile' : '');
    menu.setAttribute('role', 'menu');
    menu.hidden = true;

    var heading = document.createElement('div');
    heading.className = 'fm-lang-picker__heading';
    heading.textContent = 'Select language';
    menu.appendChild(heading);

    languages.forEach(function (lng) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'fm-lang-picker__item' + (lng.code === lang ? ' is-active' : '');
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', lng.code === lang ? 'true' : 'false');
      if (lng.dir) item.setAttribute('dir', lng.dir);
      item.innerHTML = '<span>' + (lng.label || lng.nativeName || lng.name || lng.code) + '</span>' +
        (lng.code === lang ? '<span class="fm-lang-picker__check">' + CHECK_SVG + '</span>' : '');
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
          window.i18n.setLanguage(lng.code);
        }
        closeAll();
      });
      menu.appendChild(item);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = mount.classList.contains('is-open');
      closeAll(mount);
      if (!open) {
        mount.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
      } else {
        mount.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });

    mount.appendChild(btn);
    mount.appendChild(menu);
  }

  function mountAll() {
    document.querySelectorAll('[data-language-picker]').forEach(function (el) {
      buildPicker(el, {
        mobile: el.getAttribute('data-language-picker') === 'mobile',
      });
    });
  }

  document.addEventListener('click', function () { closeAll(); });

  window.addEventListener('languageChanged', function () {
    mountAll();
  });

  function init() {
    mountAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.fmLanguagePicker = { refresh: mountAll };
})();
