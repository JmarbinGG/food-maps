function Dashboard({ user, onViewChange }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [userListings, setUserListings] = React.useState([]);
  const [userTransactions, setUserTransactions] = React.useState([]);
  const [volunteerTasks, setVolunteerTasks] = React.useState([]);
  const [recommendedListings, setRecommendedListings] = React.useState([]);
  const [loadingRecommended, setLoadingRecommended] = React.useState(false);

  // API base URL
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://api.foodmaps.com';

  // Load recommended listings for recipients
  React.useEffect(() => {
    if (user?.role === 'recipient') {
      loadRecommendedListings();
    }
  }, [user]);

  const loadRecommendedListings = async () => {
    setLoadingRecommended(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/listings/recommended`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedListings(data.slice(0, 5)); // Show top 5
      }
    } catch (error) {
      console.error('Failed to load recommended listings:', error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    // Mock data - in production would fetch from API
    if (user.role === 'donor') {
      setUserListings([
        {
          id: '1',
          title: 'Fresh Vegetables',
          status: 'available',
          created_at: '2025-01-07T10:00:00Z',
          claims: 0
        }
      ]);
    }

    if (user.role === 'recipient') {
      setUserTransactions([
        {
          id: 'txn1',
          listing_title: 'Fresh Bread',
          status: 'claimed',
          created_at: '2025-01-08T17:00:00Z'
        }
      ]);
    }

    if (user.role === 'volunteer') {
      setVolunteerTasks([
        {
          id: 'task1',
          from: '123 Main St',
          to: '456 Oak Ave',
          distance: '1.6 mi',
          status: 'available'
        }
      ]);
    }
  };

  const renderDonorDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-package text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Listings</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{userListings.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-users text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Claims</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-heart text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Meals Shared</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">My Listings</h3>
          <button onClick={() => onViewChange('create')} className="btn-primary text-sm">
            <div className="icon-plus text-lg mr-1"></div>
            Add Listing
          </button>
        </div>

        <div className="space-y-3">
          {userListings.map(listing => (
            <div key={listing.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">{listing.title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Created {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="status-available">{listing.status}</span>
                <button className="text-[var(--primary-color)] text-sm hover:underline">Edit</button>
              </div>
            </div>
          ))}

          {userListings.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-package text-3xl mb-2"></div>
              <p>No listings yet</p>
              <button onClick={() => onViewChange('create')} className="btn-primary mt-2">
                Create First Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecipientDashboard = () => (
    <div className="space-y-6">
      {/* Meal Builder Button */}
      <div className="card p-0 overflow-hidden">
        {window.MealBuilderButton ?
          React.createElement(window.MealBuilderButton, {
            onClick: () => window.location.href = '/meal-builder.html'
          }) :
          <button
            onClick={() => window.location.href = '/meal-builder.html'}
            className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg transition-all flex items-center justify-between"
            type="button"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl"></span>
              <div className="text-left">
                <div className="font-bold text-lg">AI Meal Builder</div>
                <div className="text-sm opacity-90">Turn your food into meals</div>
              </div>
            </div>
            <span className="text-2xl">→</span>
          </button>
        }
      </div>

      {/* AI Assistant — personalized tools for individual users */}
      <div className="card p-0 overflow-hidden border-2 border-purple-200 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">✨</span>
              <div>
                <div className="font-bold text-lg flex items-center gap-2">
                  Your AI Assistant
                  <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Personalized</span>
                </div>
                <div className="text-sm opacity-90">Smart tools tailored to the food you claim</div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <button
            type="button"
            onClick={() => window.openMealSuggestions?.()}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white border border-purple-100 hover:border-purple-400 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl" aria-hidden="true">🍽️</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Meal Suggestions</span>
            <span className="text-[11px] text-[var(--text-secondary)]">Recipes from your claims</span>
          </button>
          <button
            type="button"
            onClick={() => window.openSpoilageAlerts?.()}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white border border-red-100 hover:border-red-400 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl" aria-hidden="true">⚠️</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Spoilage Alerts</span>
            <span className="text-[11px] text-[var(--text-secondary)]">Use, freeze, or toss?</span>
          </button>
          <button
            type="button"
            onClick={() => window.openStorageCoach?.()}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl" aria-hidden="true">🧊</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Storage Coach</span>
            <span className="text-[11px] text-[var(--text-secondary)]">Keep food fresh longer</span>
          </button>
          <button
            type="button"
            onClick={() => window.openSmartNotifications?.()}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white border border-indigo-100 hover:border-indigo-400 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl" aria-hidden="true">🔔</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Smart Alerts</span>
            <span className="text-[11px] text-[var(--text-secondary)]">Learns what you like</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-shopping-bag text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Claims</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{userTransactions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-check-circle text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Completed</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">8</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-utensils text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Meals Received</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Listings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]"> Recommended for You</h3>
          <button
            onClick={() => window.openDietaryPreferences?.()}
            className="text-sm text-[var(--primary-color)] hover:underline"
          >
            Update Preferences
          </button>
        </div>

        {loadingRecommended ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading recommendations...</p>
          </div>
        ) : recommendedListings.length > 0 ? (
          <div className="space-y-3">
            {recommendedListings.map(listing => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:border-[var(--primary-color)] transition-colors cursor-pointer"
                onClick={() => onViewChange?.('map')}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--text-primary)]">{listing.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {listing.qty} {listing.unit} • {listing.category}
                  </p>
                  {listing.match_score && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600"
                          style={{ width: `${listing.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{listing.match_score}% match</span>
                    </div>
                  )}
                </div>
                <span className="status-available ml-3">available</span>
              </div>
            ))}
            <button
              onClick={() => onViewChange?.('map')}
              className="w-full mt-2 px-4 py-2 text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg font-medium hover:bg-[var(--secondary-color)] transition-colors"
            >
              View All Recommendations
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <div className="icon-utensils text-3xl mb-2"></div>
            <p className="mb-2">No recommendations yet</p>
            <button
              onClick={() => window.openDietaryPreferences?.()}
              className="btn-primary"
            >
              Set Dietary Preferences
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">My Claims</h3>

        <div className="space-y-3">
          {userTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">{transaction.listing_title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Claimed {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="status-claimed">{transaction.status}</span>
            </div>
          ))}

          {userTransactions.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-shopping-bag text-3xl mb-2"></div>
              <p>No claims yet</p>
              <div className="flex space-x-2 mt-2">
                <button onClick={() => onViewChange('map')} className="btn-primary">
                  Find Food
                </button>
                <button onClick={() => onViewChange('consumption')} className="btn-secondary">
                  Track Food
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVolunteerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-truck text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Available Tasks</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{volunteerTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-clock text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Hours This Month</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">15</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-route text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Deliveries</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">32</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Available Tasks</h3>

        <div className="space-y-3">
          {volunteerTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Pickup & Delivery</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  From {task.from} to {task.to} • {task.distance}
                </p>
              </div>
              <button className="btn-primary text-sm">Accept Task</button>
            </div>
          ))}

          {volunteerTasks.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-truck text-3xl mb-2"></div>
              <p>No tasks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="icon-lock text-3xl text-[var(--text-secondary)] mb-2"></div>
          <p className="text-[var(--text-secondary)]">Please sign in to view dashboard</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[var(--surface)] p-4" data-name="dashboard" data-file="components/Dashboard.js">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back, {user.name}!
            </h1>
            <p className="text-[var(--text-secondary)] capitalize">{user.role} Dashboard</p>
          </div>

          {user.role === 'donor' && renderDonorDashboard()}
          {user.role === 'recipient' && renderRecipientDashboard()}
          {user.role === 'volunteer' && renderVolunteerDashboard()}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard component error:', error);
    return null;
  }
}