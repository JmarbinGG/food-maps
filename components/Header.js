function Header({ user, onAuthClick, onLogout, currentView, onViewChange, currentZip, onZipClick }) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const role = String(user?.role || '').toLowerCase();
  const { t, language } = (typeof window !== 'undefined' && window.useTranslation)
    ? window.useTranslation()
    : { t: (k, fb) => fb || k, language: 'en' };
  const languages = (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getLanguages === 'function')
    ? window.i18n.getLanguages()
    : [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
      ];
  const activeLangMeta = languages.find(l => l.code === language) || languages[0];
  const chooseLanguage = (code) => {
    if (window.i18n) window.i18n.setLanguage(code);
    setShowLangMenu(false);
  };
  const zipLabel = currentZip || 'ZIP';

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
      if (showLangMenu && !event.target.closest('.language-menu-container')) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown, showLangMenu]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <img
              src="/logos/foodmaps-logo.png"
              alt="Food Maps"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
            />
          </a>
          <button
            type="button"
            onClick={onZipClick}
            title="Update search area"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 border border-green-600 text-green-800 rounded-md text-sm transition-colors shrink-0"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700">ZIP</span>
            <span className="font-semibold tabular-nums">{zipLabel}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {user && (
            <button
              onClick={() => window.openMessageSupport?.()}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              title="Message Support"
            >
              <span>💬</span>
              <span className="hidden sm:inline">{t('header.support', 'Support')}</span>
            </button>
          )}
          <button
            onClick={() => window.openFeedbackModal?.()}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            title="Send Feedback or Report an Issue"
          >
            <span className="hidden sm:inline">{t('header.feedback', 'Feedback')}</span>
          </button>
          <div className="relative language-menu-container">
            <button
              type="button"
              onClick={() => setShowLangMenu(v => !v)}
              aria-label={t('header.language', 'Language')}
              aria-haspopup="menu"
              aria-expanded={showLangMenu}
              title={`${t('header.language', 'Language')}: ${activeLangMeta?.nativeName || 'English'}`}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1.5 notranslate"
            >
              {/* Globe icon (inline SVG so we don't depend on the Lucide font being loaded yet) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M2 12h20"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span className="hidden sm:inline uppercase text-xs font-semibold tracking-wide">
                {(activeLangMeta && activeLangMeta.code) ? activeLangMeta.code.toUpperCase() : 'EN'}
              </span>
            </button>
            {showLangMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-[70vh] overflow-y-auto notranslate"
              >
                <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  {t('header.language', 'Language')}
                </div>
                {languages.map(lng => {
                  const isActive = lng.code === language;
                  return (
                    <button
                      key={lng.code}
                      role="menuitemradio"
                      aria-checked={isActive}
                      onClick={() => chooseLanguage(lng.code)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 hover:bg-gray-100 ${isActive ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-700'}`}
                      dir={lng.dir || 'ltr'}
                    >
                      <span className="flex flex-col leading-tight">
                        <span>{lng.nativeName}</span>
                        {lng.nativeName !== lng.name && (
                          <span className="text-[11px] text-gray-400">{lng.name}</span>
                        )}
                      </span>
                      {isActive && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => {
                if(user){
                  if(role === 'donor'){
                    onViewChange?.('create');
                    setShowDropdown(false);
                  }else if(role === 'admin'){
                    window.openAdminPanel?.();
                    setShowDropdown(false);
                  }else{
                    window.showFoodSearch?.();
                  }
                }else{
                  onAuthClick();
                }
              }
            }
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {user && role === 'donor'
              ? t('header.share_food', 'Share Food')
              : user && role === 'admin'
              ? t('header.admin_panel', 'Admin Panel')
              : t('header.find_food', 'Find Food')}
          </button>
          {user ? (
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                data-tutorial="profile-menu-toggle"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
              >
                {user.name}
                <span className="text-xs">{showDropdown ? '▲' : '▼'}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      window.openUserProfile?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {t('header.profile_settings', 'Profile Settings')}
                  </button>
                  {role === 'donor' && (
                    <button
                      onClick={() => {
                        window.openDonorImpact?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-purple-50"
                    >
                       My Impact
                    </button>
                  )}
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openDistributionMap?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Distribution Centers
                  </button>)}
                  <button
                    onClick={() => {
                      window.openTutorial?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t border-gray-200"
                  >
                    How It Works
                  </button>
                  {role === 'recipient' && (
                    <div className="border-t-2 border-purple-200 mt-1">
                      <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 flex items-center gap-2">
                        <span aria-hidden="true">✨</span>
                        <span>{t('ai.assistant', 'Your AI Assistant')}</span>
                      </div>
                      <button
                        onClick={() => {
                          window.openMealSuggestions?.();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-gradient-to-r from-green-50 to-blue-50 font-semibold"
                      >
                        🍽️ {t('ai.meal_suggestions', 'AI Meal Suggestions')}
                      </button>
                      <button
                        onClick={() => {
                          window.openSpoilageAlerts?.();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-red-50"
                      >
                        ⚠️ {t('ai.spoilage_alerts', 'Spoilage Risk Alerts')}
                      </button>
                      <button
                        onClick={() => {
                          window.openStorageCoach?.();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-purple-50"
                      >
                        🧊 {t('ai.storage_coach', 'AI Storage Coach')}
                      </button>
                      <button
                        onClick={() => {
                          window.openSmartNotifications?.();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-blue-50"
                      >
                        🔔 {t('ai.smart_notifications', 'Smart Notifications')}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      window.openSMSConsent?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-indigo-50 font-semibold border-t-2 border-indigo-200"
                  >
                    SMS Text Notifications
                  </button>
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openPickupReminders?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-blue-50"
                    >
                      Pickup Reminders
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t('header.logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              {t('header.login', 'Sign in')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

window.Header = Header;
