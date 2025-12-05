// Language Switcher Component
function LanguageSwitcher() {
  // Safety check for window.i18n
  if (!window.i18n) {
    console.error('Translation system not available');
    return null;
  }

  const [currentLang, setCurrentLang] = React.useState(window.i18n.getCurrentLanguage());
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = (lang) => {
    window.i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    window.i18n.translatePage();

    // Trigger custom event for other components to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const flagEmojis = {
    en: '🇺🇸',
    es: '🇪🇸',
    zh: '🇨🇳',
    tl: '🇵🇭',
    vi: '🇻🇳',
    ar: '🇸🇦',
    fr: '🇫🇷',
    ko: '🇰🇷'
  };

  return (
    <div className="language-switcher relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{flagEmojis[currentLang]}</span>
        <span className="hidden md:inline text-sm font-medium">
          {window.i18n.languageNames[currentLang]}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {Object.keys(window.i18n.languageNames).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${currentLang === lang ? 'bg-green-50 text-green-700' : 'text-gray-700'
                }`}
            >
              <span className="text-xl">{flagEmojis[lang]}</span>
              <span className="font-medium">{window.i18n.languageNames[lang]}</span>
              {currentLang === lang && (
                <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
function LanguageSwitcherCompact() {
  // Safety check for window.i18n
  if (!window.i18n) {
    console.error('Translation system not available');
    return null;
  }

  const [currentLang, setCurrentLang] = React.useState(window.i18n.getCurrentLanguage());
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = (lang) => {
    window.i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    window.i18n.translatePage();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  const flagEmojis = {
    en: '🇺🇸',
    es: '🇪🇸',
    zh: '🇨🇳',
    tl: '🇵🇭',
    vi: '🇻🇳',
    ar: '🇸🇦',
    fr: '🇫🇷',
    ko: '🇰🇷'
  };

  return (
    <div className="language-switcher-compact relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <span className="text-2xl">{flagEmojis[currentLang]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {Object.keys(window.i18n.languageNames).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${currentLang === lang ? 'bg-green-50' : ''
                }`}
            >
              <span className="text-xl">{flagEmojis[lang]}</span>
              <span className="text-sm">{window.i18n.languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
