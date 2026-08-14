// React Hook for i18n translations
// Use this in React components to enable translations

function useTranslation() {
  const initial = (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getCurrentLanguage === 'function')
    ? window.i18n.getCurrentLanguage()
    : 'en';
  const [language, setLanguage] = React.useState(initial);

  React.useEffect(() => {
    const handleLanguageChange = (event) => {
      const next = (event && event.detail && event.detail.language) || (window.i18n && window.i18n.getCurrentLanguage()) || 'en';
      setLanguage(next);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Forward the caller's fallback so components like Header can do
  // `t('header.support', 'Support')` and see the English fallback when
  // a key is missing from the dictionary (instead of the raw key).
  const t = React.useCallback((key, fallback) => {
    if (!window.i18n || typeof window.i18n.t !== 'function') {
      return (typeof fallback === 'string' && fallback) || key;
    }
    return window.i18n.t(key, language, fallback);
  }, [language]);

  return { t, language };
}

// HOC to wrap components with translation support
function withTranslation(Component) {
  return function TranslatedComponent(props) {
    const { t, language } = useTranslation();
    return <Component {...props} t={t} language={language} />;
  };
}

// Export for use in components
if (typeof window !== 'undefined') {
  window.useTranslation = useTranslation;
  window.withTranslation = withTranslation;
}
