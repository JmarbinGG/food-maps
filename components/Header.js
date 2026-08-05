function Header({ user, onAuthClick, onLogout, currentView, onViewChange, currentZip, onZipClick }) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const role = String(user?.role || '').toLowerCase();
  const { t, language } = (typeof window !== 'undefined' && window.useTranslation)
    ? window.useTranslation()
    : { t: (k, fb) => fb || k, language: 'en' };
  const toggleLanguage = () => {
    if (window.i18n) window.i18n.toggle();
  };
  const zipLabel = currentZip || 'ZIP';

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

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
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('header.language', 'Language')}
            title={t('header.language', 'Language')}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span className={language === 'en' ? 'text-green-700' : 'text-gray-500'}>EN</span>
            <span className="text-gray-300">|</span>
            <span className={language === 'es' ? 'text-green-700' : 'text-gray-500'}>ES</span>
          </button>
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
