/**
 * SMS Consent Manager Component
 * Twilio-compliant SMS opt-in with explicit user consent
 * Allows users to actively choose which text notifications they want
 */

const SMSConsentManager = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [consent, setConsent] = React.useState({
    consent_given: false,
    consent_date: null,
    notification_types: [],
    phone: '',
    phone_verified: false
  });

  const [selectedTypes, setSelectedTypes] = React.useState([]);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Available SMS notification types
  const notificationTypes = [
    {
      id: 'new_listings',
      title: 'New Listings Nearby',
      description: 'Get notified when fresh food is available near you',
      icon: '🆕',
      example: '"Fresh produce just arrived 0.4 miles away - 5 lbs available"'
    },
    {
      id: 'claimed_ready',
      title: 'Pickup Ready',
      description: 'Confirmation when your claimed food is ready for pickup',
      icon: '✅',
      example: '"Your chicken & vegetables are ready at Main Street Market"'
    },
    {
      id: 'expiring_soon',
      title: 'Expiration Reminders',
      description: 'Alerts when your claimed items are expiring soon',
      icon: '⏰',
      example: '"Your milk expires in 2 hours - use it or freeze it now"'
    },
    {
      id: 'spoilage_alerts',
      title: 'Spoilage Warnings',
      description: 'Critical food safety alerts for items that may be unsafe',
      icon: '⚠️',
      example: '"URGENT: Prepared food has been at room temp for 6 hours"'
    },
    {
      id: 'pickup_reminders',
      title: 'Pickup Time Reminders',
      description: 'Reminders 1 hour and 15 minutes before scheduled pickup',
      icon: '🔔',
      example: '"Reminder: Pickup at Joe\'s Deli at 3:00 PM (15 minutes)"'
    },
    {
      id: 'location_restocked',
      title: 'Favorite Location Updates',
      description: 'When your saved locations get new inventory',
      icon: '⭐',
      example: '"Your saved location Community Pantry just restocked produce"'
    },
    {
      id: 'meal_suggestions',
      title: 'Meal Ideas',
      description: 'Quick recipes to use your expiring items (max 1/day)',
      icon: '👨‍🍳',
      example: '"You have chicken + greens expiring - here\'s a 15-min meal"'
    },
    {
      id: 'urgent_only',
      title: 'Urgent Alerts Only',
      description: 'Only critical safety alerts and time-sensitive pickups',
      icon: '🚨',
      example: 'Only food safety warnings and same-day pickup confirmations'
    }
  ];

  // Load consent status
  React.useEffect(() => {
    const loadConsent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${window.API_BASE_URL || ''}/api/sms-consent`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setConsent(data);
          setSelectedTypes(data.notification_types || []);
        }
      } catch (error) {
        console.error('Error loading SMS consent:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsent();
  }, []);

  const handleToggleType = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleSave = async () => {
    // Require phone number
    if (!user.phone) {
      alert('Please add a phone number to your profile before enabling SMS notifications.');
      return;
    }

    // If user selected types, they're opting in
    const isOptingIn = selectedTypes.length > 0;

    if (isOptingIn && !consent.consent_given) {
      // Show confirmation dialog for first-time opt-in
      const confirmMessage = `By clicking OK, you agree to receive text messages from Food Maps at ${user.phone}.\n\n` +
        `Message frequency varies. Message and data rates may apply. Reply STOP to opt out anytime.\n\n` +
        `You've selected ${selectedTypes.length} notification type(s).`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.API_BASE_URL || ''}/api/sms-consent`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consent_given: isOptingIn,
          notification_types: selectedTypes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConsent({
          ...consent,
          consent_given: data.consent_given,
          consent_date: data.consent_date,
          notification_types: data.notification_types
        });

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        if (onUpdate) {
          onUpdate();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to update SMS preferences'}`);
      }
    } catch (error) {
      console.error('Error saving SMS consent:', error);
      alert('Failed to save SMS preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOptOut = async () => {
    const confirmMessage = 'Are you sure you want to stop receiving ALL text messages?\n\n' +
      'You can always opt back in later.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.API_BASE_URL || ''}/api/sms-consent`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consent_given: false,
          notification_types: []
        })
      });

      if (response.ok) {
        setConsent({
          ...consent,
          consent_given: false,
          notification_types: []
        });
        setSelectedTypes([]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error opting out:', error);
      alert('Failed to opt out. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">📱</div>
            <p className="text-gray-600">Loading SMS preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📱 SMS Text Notifications</h2>
              <p className="text-sm opacity-90">
                Choose which text messages you want to receive
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <div className="font-bold text-green-900">Preferences Saved!</div>
                  <div className="text-sm text-green-800">
                    {consent.consent_given
                      ? `You'll receive ${selectedTypes.length} type(s) of text notifications`
                      : 'You will not receive any text messages'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Status */}
          <div className={`mb-6 rounded-lg p-4 border-2 ${user.phone
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-300'
            }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{user.phone ? '✓' : '⚠️'}</span>
              <div className="flex-1">
                <div className="font-semibold mb-1">
                  {user.phone ? 'Phone Number on File' : 'Phone Number Required'}
                </div>
                <div className="text-sm">
                  {user.phone ? (
                    <span>
                      {user.phone}
                      {user.phone_verified && <span className="ml-2 text-green-600 font-semibold">✓ Verified</span>}
                    </span>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-yellow-800">
                        You need to add a phone number before enabling SMS notifications.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          setTimeout(() => window.openUserProfile?.(), 100);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Add Phone Number in Profile →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>          {/* Current Status */}
          <div className={`mb-6 rounded-lg p-4 ${consent.consent_given
            ? 'bg-blue-50 border-2 border-blue-200'
            : 'bg-gray-50 border-2 border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${consent.consent_given
                ? 'bg-green-600 text-white'
                : 'bg-gray-400 text-white'
                }`}>
                {consent.consent_given ? 'SMS Enabled' : 'SMS Disabled'}
              </span>
            </div>
            {consent.consent_date && (
              <div className="text-sm text-gray-600">
                Consented on: {new Date(consent.consent_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Notification Types */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Select Text Notifications to Receive:</h3>
            <div className="space-y-3">
              {notificationTypes.map(type => (
                <div
                  key={type.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedTypes.includes(type.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  onClick={() => user.phone && handleToggleType(type.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => user.phone && handleToggleType(type.id)}
                      disabled={!user.phone}
                      className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-semibold">{type.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {type.description}
                      </div>
                      <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border-l-4 border-blue-300">
                        Example: {type.example}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4 text-sm">
            <div className="font-semibold mb-2">📋 Important Information:</div>
            <ul className="space-y-1 text-gray-700">
              <li>• By enabling SMS, you agree to receive text messages at {user.phone || 'your phone number'}</li>
              <li>• Message frequency varies based on selected notification types</li>
              <li>• Message and data rates may apply</li>
              <li>• You can opt out anytime by replying STOP to any message</li>
              <li>• Reply HELP for assistance</li>
              <li>• Your consent and preferences are recorded for compliance</li>
              <li>• We will never share your phone number with third parties without your explicit consent</li>

            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!user.phone || saving}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${!user.phone
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : saving
                  ? 'bg-blue-400 text-white cursor-wait'
                  : selectedTypes.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
            >
              {saving ? 'Saving...' : selectedTypes.length > 0 ? `Enable ${selectedTypes.length} Notification(s)` : 'Disable All SMS'}
            </button>

            {consent.consent_given && (
              <button
                onClick={handleOptOut}
                disabled={saving}
                className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                Opt Out
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          {/* SMS Count Summary */}
          {selectedTypes.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              You'll receive approximately {
                selectedTypes.includes('urgent_only') ? '1-5' :
                  selectedTypes.includes('new_listings') ? '5-20' : '2-10'
              } text messages per week based on your selections
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Expose component globally
window.SMSConsentManager = SMSConsentManager;
