function LanguagePicker({ compact = true, className = '' }) {
  const [open, setOpen] = React.useState(false);
  const { t, language } = (typeof window !== 'undefined' && window.useTranslation)
    ? window.useTranslation()
    : { t: (k, fb) => fb || k, language: 'en' };

  const languages = (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getLanguages === 'function')
    ? window.i18n.getLanguages()
    : [
        { code: 'en', label: 'English', dir: 'ltr' },
        { code: 'es', label: 'Español', dir: 'ltr' },
      ];
  const active = languages.find(l => l.code === language) || languages[0];

  React.useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (event) => {
      if (!event.target.closest('.fm-lang-picker')) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const chooseLanguage = (code) => {
    if (window.i18n) window.i18n.setLanguage(code);
    setOpen(false);
  };

  return (
    <div
      className={`fm-lang-picker skiptranslate notranslate ${open ? 'is-open' : ''} ${className}`.trim()}
      translate="no"
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-label={t('header.language', 'Language')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${t('header.language', 'Language')}: ${active?.label || 'English'}`}
        className="fm-lang-picker__btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M2 12h20"></path>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        {compact ? (
          <span className="fm-lang-picker__code">{(active?.code || 'en').toUpperCase()}</span>
        ) : (
          <span>{t('header.language', 'Language')}</span>
        )}
      </button>
      {!open ? null : (
        <div role="menu" className="fm-lang-picker__menu">
          <div className="fm-lang-picker__heading">{t('header.language', 'Language')}</div>
          {languages.map(lng => {
            const isActive = lng.code === language;
            return (
              <button
                key={lng.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                dir={lng.dir || 'ltr'}
                onClick={() => chooseLanguage(lng.code)}
                className={`fm-lang-picker__item${isActive ? ' is-active' : ''}`}
              >
                <span>{lng.label || lng.nativeName || lng.name}</span>
                {isActive && (
                  <span className="fm-lang-picker__check" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.LanguagePicker = LanguagePicker;
