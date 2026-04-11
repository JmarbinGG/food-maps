// SmartNotifications.js - AI-powered smart notifications (not spammy)
// Learns what users actually care about and only notifies for relevant updates

const SmartNotifications = () => {
  const [preferences, setPreferences] = React.useState({
    enabled: false,
    maxDistance: 2, // miles
    categories: [],
    dietaryTags: [],
    favoriteLocations: [],
    quietHours: { start: '22:00', end: '08:00' },
    maxPerDay: 3,
    urgencyOnly: false
  });

  const [notificationHistory, setNotificationHistory] = React.useState([]);
  const [userBehavior, setUserBehavior] = React.useState({
    clickedCategories: {},
    ignoredCategories: {},
    clickedTimes: [],
    preferredDistance: 2,
    responseRate: 0
  });

  const [permissionStatus, setPermissionStatus] = React.useState('default');
  const [todayCount, setTodayCount] = React.useState(0);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    loadPreferences();
    loadBehaviorData();
    checkPermission();

    // Listen for new listings
    if (preferences.enabled) {
      startNotificationListener();
    }
  }, [preferences.enabled]);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/notification-preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadBehaviorData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/notification-behavior', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserBehavior(data);
      }
    } catch (error) {
      console.error('Error loading behavior:', error);
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission === 'granted') {
      setPreferences({ ...preferences, enabled: true });
      savePreferences({ ...preferences, enabled: true });
    }
  };

  const savePreferences = async (prefs) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:8000/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prefs)
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // AI learning algorithm - decides if notification is relevant
  const shouldNotify = (listing) => {
    // Check daily limit
    if (todayCount >= preferences.maxPerDay) return false;

    // Check quiet hours
    if (isQuietHours()) return false;

    // Check distance
    if (listing.distance > preferences.maxDistance) return false;

    // Calculate relevance score based on learned behavior
    let score = 0;

    // Category preference (learned from clicks)
    const categoryClicks = userBehavior.clickedCategories[listing.category] || 0;
    const categoryIgnores = userBehavior.ignoredCategories[listing.category] || 0;

    if (categoryClicks > categoryIgnores * 2) {
      score += 30; // User likes this category
    } else if (categoryIgnores > categoryClicks * 2) {
      score -= 20; // User doesn't like this category
    }

    // Dietary match
    if (preferences.dietaryTags.length > 0) {
      const matches = listing.dietary_tags?.filter(tag =>
        preferences.dietaryTags.includes(tag)
      ).length || 0;
      score += matches * 15;
    }

    // Favorite location
    if (preferences.favoriteLocations.includes(listing.location_id)) {
      score += 40; // High priority for saved locations
    }

    // Distance preference (learned)
    if (listing.distance <= userBehavior.preferredDistance) {
      score += 20;
    }

    // Urgency - expiring soon
    if (listing.hours_until_expiry && listing.hours_until_expiry < 6) {
      score += 25;
    }

    // Freshness - just arrived
    const minutesSincePosted = (Date.now() - new Date(listing.created_at).getTime()) / 60000;
    if (minutesSincePosted < 30) {
      score += 15;
    }

    // High-value items (multiple servings)
    if (listing.servings && listing.servings > 4) {
      score += 10;
    }

    // Urgency-only mode
    if (preferences.urgencyOnly) {
      return score >= 50 && (listing.hours_until_expiry < 6 || minutesSincePosted < 15);
    }

    // Threshold for notification (learned from response rate)
    const threshold = userBehavior.responseRate > 0.5 ? 40 : 60;

    return score >= threshold;
  };

  const isQuietHours = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { start, end } = preferences.quietHours;

    if (start > end) {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    } else {
      // Same day (e.g., 13:00 to 17:00)
      return currentTime >= start && currentTime <= end;
    }
  };

  const sendNotification = (listing) => {
    if (permissionStatus !== 'granted') return;

    const title = getNotificationTitle(listing);
    const body = getNotificationBody(listing);
    const icon = '/logos/food-icon.png';

    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: `listing-${listing.id}`,
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      trackNotificationClick(listing);
      window.location.href = `/?listing=${listing.id}`;
      notification.close();
    };

    setTodayCount(todayCount + 1);

    // Track notification sent
    trackNotificationSent(listing);
  };

  const getNotificationTitle = (listing) => {
    const distance = listing.distance?.toFixed(1) || '?';

    if (preferences.favoriteLocations.includes(listing.location_id)) {
      return ` Your saved location restocked!`;
    }

    const minutesSincePosted = (Date.now() - new Date(listing.created_at).getTime()) / 60000;
    if (minutesSincePosted < 30) {
      return ` Fresh ${listing.category} just arrived ${distance}mi away`;
    }

    if (listing.hours_until_expiry && listing.hours_until_expiry < 6) {
      return ` Urgent: ${listing.category} expiring soon`;
    }

    return ` ${listing.category} available ${distance}mi away`;
  };

  const getNotificationBody = (listing) => {
    let parts = [];

    if (listing.description) {
      parts.push(listing.description.slice(0, 60));
    }

    if (listing.servings) {
      parts.push(`${listing.servings} servings`);
    }

    if (listing.hours_until_expiry && listing.hours_until_expiry < 24) {
      parts.push(`Use within ${listing.hours_until_expiry}h`);
    }

    if (listing.dietary_tags && listing.dietary_tags.length > 0) {
      parts.push(listing.dietary_tags.slice(0, 2).join(', '));
    }

    return parts.join(' • ');
  };

  const trackNotificationSent = async (listing) => {
    const notification = {
      listing_id: listing.id,
      category: listing.category,
      distance: listing.distance,
      sent_at: new Date().toISOString(),
      clicked: false
    };

    setNotificationHistory([notification, ...notificationHistory]);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/notification-sent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Error tracking notification:', error);
    }
  };

  const trackNotificationClick = async (listing) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/notification-clicked', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing_id: listing.id,
          category: listing.category,
          clicked_at: new Date().toISOString()
        })
      });

      // Update local behavior data
      setUserBehavior(prev => ({
        ...prev,
        clickedCategories: {
          ...prev.clickedCategories,
          [listing.category]: (prev.clickedCategories[listing.category] || 0) + 1
        }
      }));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const startNotificationListener = () => {
    // Poll for new listings every 5 minutes
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/listings/recent?minutes=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const listings = await response.json();

          for (const listing of listings) {
            if (shouldNotify(listing)) {
              sendNotification(listing);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new listings:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  };

  const testNotification = () => {
    if (permissionStatus !== 'granted') {
      alert('Please enable notifications first');
      return;
    }

    const testListing = {
      id: 'test',
      category: 'produce',
      description: 'Fresh vegetables and fruits',
      distance: 0.4,
      servings: 6,
      hours_until_expiry: 48,
      dietary_tags: ['vegetarian', 'vegan'],
      created_at: new Date().toISOString(),
      location_id: 'test-location'
    };

    sendNotification(testListing);
  };

  return (
    <div className="smart-notifications-panel">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800"> Smart Notifications</h2>
          <p className="text-sm text-gray-600">AI learns what you care about - no spam</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
           Settings
        </button>
      </div>

      {/* Permission Status */}
      {permissionStatus === 'default' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Enable Smart Notifications</h3>
          <p className="text-sm text-blue-800 mb-3">
            Get notified about fresh food near you, saved location restocks, and urgent items - only when it matters.
          </p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-red-900 mb-2">Notifications Blocked</h3>
          <p className="text-sm text-red-800">
            Please enable notifications in your browser settings to receive smart alerts.
          </p>
        </div>
      )}

      {permissionStatus === 'granted' && (
        <>
          {/* Status Banner */}
          <div className={`border rounded-lg p-4 mb-4 ${preferences.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  {preferences.enabled ? ' Smart Notifications Active' : '⏸ Notifications Paused'}
                </div>
                <div className="text-sm text-gray-600">
                  {preferences.enabled
                    ? `${todayCount}/${preferences.maxPerDay} sent today`
                    : 'No notifications will be sent'
                  }
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(e) => {
                    const newPrefs = { ...preferences, enabled: e.target.checked };
                    setPreferences(newPrefs);
                    savePreferences(newPrefs);
                  }}
                  className="mr-2 w-5 h-5"
                />
                <span className="text-sm font-medium">Enabled</span>
              </label>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Max Distance</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={preferences.maxDistance}
                  onChange={(e) => {
                    const newPrefs = { ...preferences, maxDistance: parseFloat(e.target.value) };
                    setPreferences(newPrefs);
                    savePreferences(newPrefs);
                  }}
                  className="flex-1"
                />
                <span className="font-semibold w-16">{preferences.maxDistance} mi</span>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Daily Limit</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preferences.maxPerDay}
                  onChange={(e) => {
                    const newPrefs = { ...preferences, maxPerDay: parseInt(e.target.value) };
                    setPreferences(newPrefs);
                    savePreferences(newPrefs);
                  }}
                  className="flex-1"
                />
                <span className="font-semibold w-16">{preferences.maxPerDay}/day</span>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mode</div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.urgencyOnly}
                  onChange={(e) => {
                    const newPrefs = { ...preferences, urgencyOnly: e.target.checked };
                    setPreferences(newPrefs);
                    savePreferences(newPrefs);
                  }}
                  className="mr-2"
                />
                <span className="text-sm"> Urgent Only</span>
              </label>
            </div>
          </div>

          {/* AI Learning Insights */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-purple-900 mb-3"> AI Learning Your Preferences</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-purple-800 mb-2">Categories You Like:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userBehavior.clickedCategories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <span key={category} className="px-3 py-1 bg-purple-100 rounded-full text-sm">
                        {category} ({count})
                      </span>
                    ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-800 mb-2">Response Rate:</div>
                <div className="text-2xl font-bold text-purple-900">
                  {(userBehavior.responseRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-purple-700">
                  You click {(userBehavior.responseRate * 100).toFixed(0)}% of notifications
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showSettings && (
            <div className="bg-white border rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">Advanced Settings</h3>

              {/* Quiet Hours */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiet Hours (No Notifications)
                </label>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Start</label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => {
                        const newPrefs = {
                          ...preferences,
                          quietHours: { ...preferences.quietHours, start: e.target.value }
                        };
                        setPreferences(newPrefs);
                        savePreferences(newPrefs);
                      }}
                      className="block w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">End</label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => {
                        const newPrefs = {
                          ...preferences,
                          quietHours: { ...preferences.quietHours, end: e.target.value }
                        };
                        setPreferences(newPrefs);
                        savePreferences(newPrefs);
                      }}
                      className="block w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Test Notification */}
              <button
                onClick={testNotification}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                 Send Test Notification
              </button>
            </div>
          )}

          {/* Recent Notifications */}
          {notificationHistory.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Notifications</h3>
              <div className="space-y-2">
                {notificationHistory.slice(0, 5).map((notif, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{notif.category}</span>
                      <span className="text-gray-600 ml-2">{notif.distance?.toFixed(1)}mi</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(notif.sent_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .smart-notifications-panel {
          max-width: 800px;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #8b5cf6;
          cursor: pointer;
          border-radius: 50%;
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #8b5cf6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

// Compact notification toggle for header/settings
const NotificationToggle = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [permission, setPermission] = React.useState('default');

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    const stored = localStorage.getItem('notifications_enabled');
    setEnabled(stored === 'true');
  }, []);

  const toggle = async () => {
    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        return;
      }
    }

    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('notifications_enabled', newValue.toString());
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${enabled
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      title={enabled ? 'Notifications enabled' : 'Notifications disabled'}
    >
      {enabled ? '' : ''} Notifications
    </button>
  );
};

window.SmartNotifications = SmartNotifications;
window.NotificationToggle = NotificationToggle;
