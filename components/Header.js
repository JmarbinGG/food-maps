function Header({ user, onAuthClick, onLogout, currentView, onViewChange }) {
  const [showDropdown, setShowDropdown] = React.useState(false);

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
        <div className="flex items-center gap-2">
          <img
            src="https://app.trickle.so/storage/public/images/usr_0b8d952560000001/6d7a1e40-1a21-418a-9d29-070bb27350cf.png"
            alt="Food Maps"
            className="w-10 h-10 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => user ? window.showFoodSearch?.() : onAuthClick()}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            🔍 Find Food
          </button>
          <button
            onClick={() => user ? window.showAISearch?.() : onAuthClick()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            🤖 AI Agent
          </button>
          {user ? (
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
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
                      onViewChange?.('create');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Share Food
                  </button>
                  <button
                    onClick={() => {
                      onViewChange?.('map');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Find Food
                  </button>
                  <button
                    onClick={() => {
                      window.showAISearch?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    AI Food Search
                  </button>
                  <button
                    onClick={() => {
                      window.openDistributionMap?.();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    🏪 Distribution Centers
                  </button>
                  {user.role === 'donor' && (
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