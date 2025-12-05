// React Hook for i18n translations
// Use this in React components to enable translations

function useTranslation() {
  const [language, setLanguage] = React.useState(window.i18n.getCurrentLanguage());

  React.useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = React.useCallback((key) => {
    return window.i18n.t(key, language);
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
