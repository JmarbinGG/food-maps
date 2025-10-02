function Header({ user, onAuthClick, onLogout, currentView, onViewChange }) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showFoodSearch, setShowFoodSearch] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Enhanced mobile menu handling
  const toggleMobileMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Toggle mobile menu clicked');
    setMobileMenuOpen(prev => {
      console.log('Mobile menu state changing from', prev, 'to', !prev);
      return !prev;
    });
    setShowUserMenu(false);
  };

  const handleMobileMenuClick = (action) => {
    console.log('Mobile menu item clicked');
    if (action) action();
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  // Close mobile menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        console.log('Closing mobile menu due to outside click');
        setMobileMenuOpen(false);
      }
    };

    // Setup global store portal callback
    window.openStorePortal = () => {
      if (window.setShowStorePortal) {
        window.setShowStorePortal(true);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      delete window.openStorePortal;
    };
  }, [mobileMenuOpen]);

  // Debug mobile menu state
  React.useEffect(() => {
    console.log('Mobile menu open state:', mobileMenuOpen);
  }, [mobileMenuOpen]);

  const navigationItems = [
    ...(user && user.role === 'donor' ? [
      { key: 'create', label: 'Share Food', icon: 'plus-circle' },
      { key: 'bulk-create', label: 'Bulk Upload', icon: 'upload' },
      { key: 'food-rescue', label: 'Food Rescue', icon: 'recycle' }
    ] : []),
    ...(user && user.role === 'recipient' ? [
      { key: 'meal-planning', label: 'Meal Planning', icon: 'calendar' },
      { key: 'nutrition', label: 'Nutrition', icon: 'heart' }
    ] : []),
    ...(user && user.role === 'volunteer' ? [
      { key: 'routes', label: 'My Routes', icon: 'truck' },
      { key: 'food-rescue', label: 'Food Rescue', icon: 'recycle' }
    ] : []),
    ...(user && ['dispatcher', 'admin'].includes(user.role) ? [
      { key: 'ai-matching', label: 'AI Matching', icon: 'brain' },
      { key: 'dispatch', label: 'Dispatch', icon: 'command' },
      { key: 'emergency', label: 'Emergency', icon: 'alert-triangle' },
      { key: 'partners', label: 'Partners', icon: 'users' }
    ] : []),
    ...(user && user.role === 'admin' ? [
      { key: 'admin', label: 'Admin Panel', icon: 'settings' }
    ] : []),
    ...(user ? [
      { key: 'dashboard', label: 'My Dashboard', icon: 'user' },
      { key: 'consumption', label: 'Food Tracker', icon: 'bar-chart-2' }
    ] : [])
  ];

  try {
    return (
      <header className="bg-white border-b border-[var(--border-color)] h-16 flex items-center px-4" data-name="header" data-file="components/Header.js">
        <div className="flex items-center justify-between w-full max-w-full">
          <div className="flex items-center space-x-6">
            <button onClick={() => window.location.href = 'landing.html'} className="flex items-center hover:scale-105 transition-transform">
              <img 
                src="https://app.trickle.so/storage/public/images/usr_0b8d952560000001/6d7a1e40-1a21-418a-9d29-070bb27350cf.png" 
                alt="Food Maps" 
                className="w-14 h-14 rounded-xl object-cover shadow-lg"
              />
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === 'dispatch') {
                      window.location.href = 'dispatch.html';
                    } else {
                      onViewChange(item.key);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.key
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className={`icon-${item.icon} text-lg`}></div>
                  <span>{item.label}</span>
                </button>
              ))}
              
              <button
                onClick={() => {
                  setShowFoodSearch(true);
                  // Scroll to top to show the map
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--accent-color)]"
              >
                <div className="icon-search text-lg"></div>
                <span>Find Food</span>
              </button>
              
              <button
                onClick={() => {
                  if (window.showAISearch) window.showAISearch();
                  // Scroll to top to show the map
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <div className="icon-brain text-lg"></div>
                <span>AI Agent</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden lg:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-[var(--secondary-color)] px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                      <div className="icon-user text-sm text-white"></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{user.name}</span>
                    <span className="text-xs px-2 py-1 bg-[var(--primary-color)] text-white rounded-full">
                      {user.role}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--border-color)] py-1 z-50">
                  <button
                    onClick={() => onViewChange('driver')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <div className="icon-truck mr-2"></div>
                      Driver Dashboard
                    </div>
                  </button>
                  <button
                    onClick={() => onViewChange('admin')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <div className="icon-settings mr-2"></div>
                      Admin Panel
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      // Trigger logout and close the menu
                      try { onLogout(); } catch (e) { console.error('Logout handler error', e); }
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[var(--danger-color)] hover:bg-red-50 rounded-lg"
                  >
                    <div className="icon-log-out mr-2"></div>
                    <span>Logout</span>
                  </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    onAuthClick();
                    // Scroll to top to show the map
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>
            
            {/* Mobile User Info and Menu Button */}
            <div className="lg:hidden flex items-center space-x-3 mobile-menu-container">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                    <div className="icon-user text-sm text-white"></div>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] max-w-20 truncate">{user.name}</span>
                </div>
              )}
              <button
                onClick={toggleMobileMenu}
                className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] p-3 rounded-lg hover:bg-[var(--surface)] transition-colors mobile-menu-button focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-opacity-50"
                aria-label="Toggle mobile menu"
                type="button"
              >
                <div className={`text-2xl ${mobileMenuOpen ? 'icon-x' : 'icon-menu'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu-container lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          {/* Mobile Menu Overlay */}
          <div 
            className="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              console.log('Overlay clicked, closing menu');
              setMobileMenuOpen(false);
            }}
          ></div>
          
          {/* Mobile Menu Content */}
          <div className="mobile-menu-content absolute top-full left-0 right-0 z-50 bg-white border-t border-[var(--border-color)] shadow-xl">
            <div className="px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleMobileMenuClick(() => {
                    setShowFoodSearch(true);
                    // Scroll to top to show the map
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  })}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium mobile-nav-item min-h-[48px]"
                >
                  <div className="icon-search text-lg"></div>
                  <span>Find Food</span>
                </button>
                <button
                  onClick={() => handleMobileMenuClick(() => {
                    if (window.showAISearch) window.showAISearch();
                    // Scroll to top to show the map
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  })}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium mobile-nav-item min-h-[48px]"
                >
                  <div className="icon-brain text-lg"></div>
                  <span>AI Agent</span>
                </button>
              </div>
              
              {/* Navigation Items */}
              {navigationItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleMobileMenuClick(() => {
                    if (item.key === 'dispatch') {
                      window.location.href = 'dispatch.html';
                    } else {
                      onViewChange(item.key);
                    }
                  })}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mobile-nav-item ${
                    currentView === item.key
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className={`icon-${item.icon} text-lg`}></div>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Auth Actions */}
              <div className="border-t border-[var(--border-color)] pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        onViewChange('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[var(--surface)] rounded-lg"
                    >
                      <div className="icon-user text-lg text-[var(--text-secondary)]"></div>
                      <span>My Dashboard</span>
                    </button>
                    {user.role === 'store_owner' && (
                      <button 
                        onClick={() => {
                          if (window.openStorePortal) window.openStorePortal();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[var(--surface)] rounded-lg"
                      >
                        <div className="icon-store text-lg text-[var(--text-secondary)]"></div>
                        <span>Store Portal</span>
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[var(--danger-color)] hover:bg-red-50 rounded-lg"
                    >
                      <div className="icon-log-out text-lg"></div>
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onAuthClick();
                      setMobileMenuOpen(false);
                      // Scroll to top to show the map
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full btn-primary"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Food Search Modal */}
        {showFoodSearch && (
          <FoodSearch
            user={user}
            onClose={() => setShowFoodSearch(false)}
            onSelectFood={(food) => {
              console.log('Selected food:', food);
              // You can add additional logic here for handling selected food
              alert(`Selected: ${food.title} - ${food.qty} ${food.unit}`);
            }}
          />
        )}
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
