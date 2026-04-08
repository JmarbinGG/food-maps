function Header({ user, onAuthClick, onLogout, currentView, onViewChange }) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const role = String(user?.role || '').toLowerCase();

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
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src="https://app.trickle.so/storage/public/images/usr_0b8d952560000001/6d7a1e40-1a21-418a-9d29-070bb27350cf.png"
            alt="Food Maps"
            className="w-10 h-10 rounded-lg"
          />
        </a>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => window.openFeedbackModal?.()}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            title="Send Feedback or Report an Issue"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Feedback</span>
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
            {user && role === 'donor' ? '📦 Share Food' : user && role === 'admin' ? '⚙️ Admin Panel' : '🔍 Find Food'}
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
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      window.openMessageSupport?.();
                      setShowDropdown(false);
                    }}
                    data-tutorial="message-support-button"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    💬 Message Support
                  </button>
                  <button
                    onClick={() => {
                      window.openFeedbackModal?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🐛 Report Issue
                  </button>
                  {/* <button
                    onClick={() => {
                      window.openFavoritesPanel?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-yellow-50"
                  >
                    ⭐ My Favorites
                  </button> */}
                  {role === 'donor' && (
                    <button
                      onClick={() => {
                        window.openDonorImpact?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-purple-50"
                    >
                      ✨ My Impact
                    </button>
                  )}
                  {role === 'donor' && (
                    <button
                      onClick={() => {
                        onViewChange?.('create');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Share Food
                    </button>
                  )}
                  {/* taken out for now as it is not clear what it does and not needed currently*/}
                  {/* {role === 'donor' && (
                    <button
                      onClick={() => {
                        window.openDonationScheduler?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      📅 Donation Scheduler
                    </button>
                  )} */}
                  <button
                    onClick={() => {
                      window.openDistributionMap?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🏪 Distribution Centers
                  </button>
                  <button
                    onClick={() => {
                      window.openTutorial?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t border-gray-200"
                  >
                    🎓 How to Use
                  </button>
                  {/*voice search not implemented correctly, hiding it for now*/}
                  {/* <a
                    href="/voice-search.html"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-purple-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    🎤 Voice Search
                  </a> */}
                  <button
                    onClick={() => {
                      window.openSmartNotifications?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-blue-50"
                  >
                    🔔 Smart Notifications
                  </button>
                  <button
                    onClick={() => {
                      window.openStorageCoach?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-purple-50"
                  >
                    🤖 Storage Coach
                  </button>
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openSpoilageAlerts?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-red-50"
                    >
                      ⚠️ Spoilage Alerts
                    </button>
                  )}
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openMealSuggestions?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-gradient-to-r from-green-50 to-blue-50 font-semibold"
                    >
                      👨‍🍳 Meal Suggestions
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.openSafetyCenter?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🛡️ Safety & Trust
                  </button>
                  <button
                    onClick={() => {
                      window.openSMSConsent?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-indigo-50 font-semibold border-t-2 border-indigo-200"
                  >
                    📱 SMS Text Notifications
                  </button>
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openPickupReminders?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-blue-50"
                    >
                      🔔 Pickup Reminders
                    </button>
                  )}
                  {role === 'recipient' && (
                    <button
                      onClick={() => {
                        window.openDietaryPreferences?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-green-50"
                    >
                      🥗 Dietary Preferences
                    </button>
                  )}
                  {role === 'donor' && (
                    <button
                      onClick={() => {
                        window.openStoreOwnerDashboard?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-green-50"
                    >
                      📦 Manage My Store
                    </button>
                  )}
                  {/* commented out admin panel in sidebar as it is in top right corner */}
                  {/* {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        window.openAdminPanel?.();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 bg-blue-50"
                    >
                      ⚙️ Admin Panel
                    </button>
                  )} */}
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}