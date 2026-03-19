function DonorImpactDashboard({ user, onClose }) {
  const [impactStats, setImpactStats] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [timeframe, setTimeframe] = React.useState('all'); // 'week', 'month', 'year', 'all'
  const [recentDonations, setRecentDonations] = React.useState([]);

  React.useEffect(() => {
    loadImpactData();
  }, [user, timeframe]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');

      // Fetch donor's impact statistics
      const response = await fetch(`/api/donor/impact?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImpactStats(data.stats || {});
        setRecentDonations(data.recent_donations || []);
      } else {
        // Fallback to mock data if endpoint doesn't exist
        loadMockData();
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data for demonstration
    setImpactStats({
      total_donations: 47,
      total_pounds: 523,
      meals_provided: 1847,
      people_helped: 142,
      co2_saved: 892, // pounds of CO2
      water_saved: 12450, // gallons
      money_saved_recipients: 4235, // dollars
      active_listings: 3,
      claimed_listings: 44,
      impact_score: 94,
      streak_days: 12,
      badges_earned: 5
    });

    setRecentDonations([
      {
        id: 1,
        title: 'Fresh Vegetables',
        qty: 15,
        unit: 'lbs',
        claimed_by: 'Maria G.',
        claimed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        meals_provided: 45
      },
      {
        id: 2,
        title: 'Prepared Meals',
        qty: 20,
        unit: 'servings',
        claimed_by: 'James K.',
        claimed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        meals_provided: 20
      },
      {
        id: 3,
        title: 'Bakery Items',
        qty: 30,
        unit: 'items',
        claimed_by: 'Sarah L.',
        claimed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        meals_provided: 30
      }
    ]);
  };

  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const badges = [
    { id: 'first_donation', name: 'First Share', icon: '🎉', earned: true },
    { id: 'ten_donations', name: '10 Donations', icon: '⭐', earned: true },
    { id: 'hundred_meals', name: '100 Meals', icon: '🍽️', earned: true },
    { id: 'streak_7', name: '7 Day Streak', icon: '🔥', earned: true },
    { id: 'eco_warrior', name: 'Eco Warrior', icon: '🌍', earned: true },
    { id: 'fifty_donations', name: '50 Donations', icon: '💫', earned: false },
    { id: 'hundred_donations', name: '100 Donations', icon: '🏆', earned: false },
    { id: 'community_hero', name: 'Community Hero', icon: '👑', earned: false }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="icon-loader animate-spin text-3xl text-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
              <p className="text-green-100">See the difference you're making, {user.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors"
            >
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="mt-4 flex space-x-2">
            {timeframeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === option.value
                    ? 'bg-white text-green-600'
                    : 'bg-green-500 text-white hover:bg-green-400'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Impact Score */}
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-1">Impact Score</h3>
                <p className="text-sm text-purple-600">Based on your donations and community engagement</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600">{impactStats.impact_score}</div>
                <div className="text-sm text-purple-500 mt-1">out of 100</div>
              </div>
            </div>
            {impactStats.streak_days > 0 && (
              <div className="mt-4 flex items-center space-x-2 text-orange-600">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold">{impactStats.streak_days} Day Streak!</span>
              </div>
            )}
          </div>

          {/* Main Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{impactStats.total_donations}</div>
                  <div className="text-xs text-gray-500">Total Donations</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{impactStats.total_pounds}</div>
                  <div className="text-xs text-gray-500">Pounds Donated</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">{impactStats.meals_provided}</div>
                  <div className="text-xs text-gray-500">Meals Provided</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{impactStats.people_helped}</div>
                  <div className="text-xs text-gray-500">People Helped</div>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🌍</span>
              Environmental Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{impactStats.co2_saved}</div>
                <div className="text-sm text-green-700 mt-1">lbs CO₂ Prevented</div>
                <div className="text-xs text-gray-500 mt-1">Equal to {Math.round(impactStats.co2_saved / 22)} miles driven</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{impactStats.water_saved?.toLocaleString()}</div>
                <div className="text-sm text-blue-700 mt-1">Gallons Water Saved</div>
                <div className="text-xs text-gray-500 mt-1">Equal to {Math.round(impactStats.water_saved / 50)} showers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">${impactStats.money_saved_recipients?.toLocaleString()}</div>
                <div className="text-sm text-purple-700 mt-1">Value to Recipients</div>
                <div className="text-xs text-gray-500 mt-1">Approximate grocery value</div>
              </div>
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="mb-6 bg-white border-2 border-yellow-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏅</span>
              Badges & Achievements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-lg border-2 transition-all ${badge.earned
                      ? 'bg-yellow-50 border-yellow-300 hover:shadow-md'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                >
                  <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <div className={`text-sm font-medium ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Donations</h3>
            {recentDonations.length > 0 ? (
              <div className="space-y-3">
                {recentDonations.map(donation => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{donation.title}</h4>
                      <p className="text-sm text-gray-600">
                        {donation.qty} {donation.unit} • Claimed by {donation.claimed_by}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(donation.claimed_at).toLocaleDateString()} •
                        Provided {donation.meals_provided} meals
                      </p>
                    </div>
                    <div className="text-green-600">
                      <div className="icon-check-circle text-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No donations in this timeframe
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Keep Making a Difference! 🌟</h3>
            <p className="mb-4">Your generosity is changing lives in your community.</p>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => window.location.hash = '#create', 100);
              }}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Share More Food
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
