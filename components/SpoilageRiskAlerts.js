/**
 * Spoilage Risk Alerts Component
 * AI-powered system that monitors claimed food and alerts users about spoilage risk
 * Factors: Time since pickup, food type, storage methods
 * Provides actionable nudges: "Use tonight", "Freeze now", "May no longer be safe"
 */

const SpoilageRiskAlerts = ({ user, claimedListings, onClose }) => {
  const [alerts, setAlerts] = React.useState([]);
  const [storageData, setStorageData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [dismissedAlerts, setDismissedAlerts] = React.useState([]);

  // Spoilage risk calculation engine
  const calculateSpoilageRisk = React.useCallback((listing) => {
    const now = new Date();

    // Get claimed date (when user picked it up)
    const claimedDate = listing.claimed_at ? new Date(listing.claimed_at) :
      listing.updated_at ? new Date(listing.updated_at) :
        new Date();

    const hoursSincePickup = (now - claimedDate) / (1000 * 60 * 60);
    const daysSincePickup = hoursSincePickup / 24;

    // Get storage method from localStorage or assume refrigerator
    const storageKey = `storage_method_${listing.id}`;
    const storageMethod = localStorage.getItem(storageKey) || 'refrigerator';
    const storageSince = localStorage.getItem(`${storageKey}_since`) || claimedDate.toISOString();
    const hoursSinceStorage = (now - new Date(storageSince)) / (1000 * 60 * 60);

    // Food-specific spoilage timelines
    const spoilageProfiles = {
      // High perishability - short shelf life
      produce: {
        refrigerator: { safe: 48, warning: 72, danger: 120 }, // 2-5 days
        counter: { safe: 12, warning: 24, danger: 48 },
        freezer: { safe: 2160, warning: 4320, danger: 8640 } // 3-12 months
      },
      prepared: {
        refrigerator: { safe: 48, warning: 72, danger: 96 }, // 2-4 days
        counter: { safe: 2, warning: 4, danger: 8 }, // Never leave out!
        freezer: { safe: 1440, warning: 2160, danger: 4320 } // 2-6 months
      },
      fruit: {
        refrigerator: { safe: 72, warning: 120, danger: 168 }, // 3-7 days
        counter: { safe: 48, warning: 96, danger: 144 }, // 2-6 days
        freezer: { safe: 2160, warning: 4320, danger: 8640 }
      },
      leftovers: {
        refrigerator: { safe: 72, warning: 96, danger: 120 }, // 3-5 days
        counter: { safe: 2, warning: 4, danger: 6 },
        freezer: { safe: 720, warning: 1440, danger: 2160 } // 1-3 months
      },
      bakery: {
        refrigerator: { safe: 168, warning: 240, danger: 336 }, // Don't refrigerate!
        counter: { safe: 48, warning: 72, danger: 96 }, // 2-4 days
        freezer: { safe: 2160, warning: 4320, danger: 6480 } // 3-9 months
      },
      packaged: {
        refrigerator: { safe: 240, warning: 480, danger: 720 }, // Varies widely
        counter: { safe: 168, warning: 336, danger: 720 },
        freezer: { safe: 4320, warning: 8640, danger: 17280 }
      },
      water: {
        refrigerator: { safe: 720, warning: 1440, danger: 2160 }, // Very stable
        counter: { safe: 720, warning: 1440, danger: 2160 },
        freezer: { safe: 8640, warning: 17280, danger: 26280 }
      }
    };

    const category = listing.category || 'packaged';
    const profile = spoilageProfiles[category]?.[storageMethod] || spoilageProfiles.packaged.refrigerator;

    // Calculate risk level based on time and storage
    let riskLevel = 'safe';
    let riskScore = 0; // 0-100

    if (hoursSinceStorage >= profile.danger) {
      riskLevel = 'danger';
      riskScore = 100;
    } else if (hoursSinceStorage >= profile.warning) {
      riskLevel = 'warning';
      riskScore = 60 + ((hoursSinceStorage - profile.warning) / (profile.danger - profile.warning)) * 40;
    } else if (hoursSinceStorage >= profile.safe) {
      riskLevel = 'caution';
      riskScore = 30 + ((hoursSinceStorage - profile.safe) / (profile.warning - profile.safe)) * 30;
    } else {
      riskLevel = 'safe';
      riskScore = (hoursSinceStorage / profile.safe) * 30;
    }

    // Additional risk factors

    // 1. Perishability modifier
    if (listing.perishability === 'high') {
      riskScore *= 1.3;
    } else if (listing.perishability === 'low') {
      riskScore *= 0.7;
    }

    // 2. Storage method appropriateness
    if (category === 'bakery' && storageMethod === 'refrigerator') {
      riskScore *= 1.2; // Bread goes stale in fridge
    }
    if (category === 'prepared' && storageMethod === 'counter' && hoursSinceStorage > 2) {
      riskScore = 100; // Danger zone!
    }

    // 3. Expiration date consideration
    if (listing.expiration_date) {
      const expiryDate = new Date(listing.expiration_date);
      const hoursUntilExpiry = (expiryDate - now) / (1000 * 60 * 60);

      if (hoursUntilExpiry <= 0) {
        riskScore = 100; // Expired
      } else if (hoursUntilExpiry < 24) {
        riskScore = Math.max(riskScore, 70);
      } else if (hoursUntilExpiry < 48) {
        riskScore = Math.max(riskScore, 50);
      }
    }

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    // Re-evaluate risk level based on final score
    if (riskScore >= 80) {
      riskLevel = 'danger';
    } else if (riskScore >= 50) {
      riskLevel = 'warning';
    } else if (riskScore >= 30) {
      riskLevel = 'caution';
    } else {
      riskLevel = 'safe';
    }

    return {
      riskLevel,
      riskScore: Math.round(riskScore),
      hoursSincePickup: Math.round(hoursSincePickup * 10) / 10,
      daysSincePickup: Math.round(daysSincePickup * 10) / 10,
      hoursSinceStorage: Math.round(hoursSinceStorage * 10) / 10,
      storageMethod,
      storageSince: new Date(storageSince),
      claimedDate,
      profile
    };
  }, []);

  // Generate actionable nudge based on risk
  const generateNudge = (listing, risk) => {
    const { riskLevel, riskScore, hoursSinceStorage, daysSincePickup, storageMethod } = risk;

    const category = listing.category || 'packaged';
    const title = listing.title;

    // Danger zone - immediate action required
    if (riskLevel === 'danger') {
      if (storageMethod === 'counter' && category === 'prepared') {
        return {
          icon: '🚨',
          title: 'UNSAFE TO EAT',
          message: `${title} has been at room temperature too long`,
          action: 'Discard immediately',
          actionType: 'discard',
          urgency: 'critical',
          color: 'red'
        };
      }

      if (listing.expiration_date && new Date(listing.expiration_date) < new Date()) {
        return {
          icon: '🚨',
          title: 'EXPIRED',
          message: `${title} expired ${Math.abs(Math.round((new Date() - new Date(listing.expiration_date)) / (1000 * 60 * 60 * 24)))} days ago`,
          action: 'This item may no longer be safe - discard',
          actionType: 'discard',
          urgency: 'critical',
          color: 'red'
        };
      }

      return {
        icon: '⚠️',
        title: 'SPOILAGE RISK HIGH',
        message: `${title} has been in ${storageMethod} for ${Math.round(hoursSinceStorage)} hours`,
        action: 'This item may no longer be safe',
        actionType: 'inspect',
        urgency: 'critical',
        color: 'red'
      };
    }

    // Warning - act soon
    if (riskLevel === 'warning') {
      const canFreeze = !['water', 'produce'].includes(category);

      if (canFreeze && storageMethod === 'refrigerator') {
        return {
          icon: '❄️',
          title: 'FREEZE NOW',
          message: `${title} should be frozen if not using today`,
          action: 'Freeze now to preserve',
          actionType: 'freeze',
          urgency: 'high',
          color: 'orange'
        };
      }

      return {
        icon: '🍽️',
        title: 'USE TONIGHT',
        message: `${title} should be consumed within 12-24 hours`,
        action: 'Use tonight or freeze',
        actionType: 'use',
        urgency: 'high',
        color: 'orange'
      };
    }

    // Caution - plan to use soon
    if (riskLevel === 'caution') {
      if (storageMethod === 'refrigerator' && category === 'bakery') {
        return {
          icon: '🥖',
          title: 'BREAD IN FRIDGE',
          message: `${title} goes stale faster in refrigerator`,
          action: 'Move to counter or freeze',
          actionType: 'move',
          urgency: 'medium',
          color: 'yellow'
        };
      }

      const daysLeft = Math.ceil(risk.profile.warning - hoursSinceStorage) / 24;
      return {
        icon: '📅',
        title: 'PLAN TO USE SOON',
        message: `${title} is best within ${Math.round(daysLeft)} days`,
        action: `Plan to use within ${Math.round(daysLeft)} days`,
        actionType: 'plan',
        urgency: 'medium',
        color: 'yellow'
      };
    }

    // Safe - just a reminder
    return {
      icon: '✓',
      title: 'STILL FRESH',
      message: `${title} is properly stored`,
      action: 'No action needed',
      actionType: 'none',
      urgency: 'low',
      color: 'green'
    };
  };

  // Load and analyze all claimed listings
  React.useEffect(() => {
    if (!claimedListings || claimedListings.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Load dismissed alerts from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissed_spoilage_alerts') || '[]');
    setDismissedAlerts(dismissed);

    // Analyze each listing
    const analyzedAlerts = claimedListings
      .map(listing => {
        const risk = calculateSpoilageRisk(listing);
        const nudge = generateNudge(listing, risk);

        return {
          id: `alert_${listing.id}_${risk.riskLevel}`,
          listingId: listing.id,
          listing,
          risk,
          nudge,
          timestamp: new Date()
        };
      })
      .filter(alert => alert.risk.riskLevel !== 'safe') // Only show non-safe items
      .filter(alert => !dismissed.includes(alert.id)) // Exclude dismissed
      .sort((a, b) => b.risk.riskScore - a.risk.riskScore); // Highest risk first

    setAlerts(analyzedAlerts);
    setLoading(false);
  }, [claimedListings, calculateSpoilageRisk]);

  // Update storage method
  const updateStorageMethod = (listingId, method) => {
    const storageKey = `storage_method_${listingId}`;
    localStorage.setItem(storageKey, method);
    localStorage.setItem(`${storageKey}_since`, new Date().toISOString());

    setStorageData(prev => ({
      ...prev,
      [listingId]: { method, since: new Date() }
    }));

    // Re-analyze
    const listing = claimedListings.find(l => l.id === listingId);
    if (listing) {
      const risk = calculateSpoilageRisk(listing);
      const nudge = generateNudge(listing, risk);

      setAlerts(prev => prev.map(alert =>
        alert.listingId === listingId
          ? { ...alert, risk, nudge, timestamp: new Date() }
          : alert
      ));
    }
  };

  // Dismiss alert
  const dismissAlert = (alertId) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissed_spoilage_alerts', JSON.stringify(newDismissed));
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Mark as used/discarded
  const markAsHandled = (listingId, action) => {
    localStorage.setItem(`handled_${listingId}`, JSON.stringify({
      action,
      timestamp: new Date().toISOString()
    }));

    // Remove all alerts for this listing
    setAlerts(prev => prev.filter(a => a.listingId !== listingId));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <p className="text-gray-600">Analyzing spoilage risk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🤖 Spoilage Risk Alerts</h2>
              <p className="text-sm opacity-90">
                AI-powered monitoring of your claimed food items
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
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">All Clear!</h3>
              <p className="text-gray-600">
                No spoilage risks detected for your claimed items
              </p>
              <p className="text-sm text-gray-500 mt-2">
                We're monitoring your food and will alert you if action is needed
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Active Alerts</div>
                    <div className="text-2xl font-bold">{alerts.length}</div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-red-600 font-bold">
                        {alerts.filter(a => a.risk.riskLevel === 'danger').length}
                      </div>
                      <div className="text-gray-600">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-bold">
                        {alerts.filter(a => a.risk.riskLevel === 'warning').length}
                      </div>
                      <div className="text-gray-600">Warning</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 font-bold">
                        {alerts.filter(a => a.risk.riskLevel === 'caution').length}
                      </div>
                      <div className="text-gray-600">Caution</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border-2 rounded-lg p-4 ${alert.nudge.color === 'red' ? 'border-red-500 bg-red-50' :
                        alert.nudge.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                          alert.nudge.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                            'border-green-500 bg-green-50'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{alert.nudge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{alert.nudge.title}</h3>
                            <p className="text-sm text-gray-700">{alert.nudge.message}</p>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <span className="text-xl">×</span>
                          </button>
                        </div>

                        {/* Risk Details */}
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div className="bg-white bg-opacity-50 rounded p-2">
                            <div className="text-gray-600">Risk Score</div>
                            <div className="font-bold">{alert.risk.riskScore}/100</div>
                          </div>
                          <div className="bg-white bg-opacity-50 rounded p-2">
                            <div className="text-gray-600">Storage</div>
                            <div className="font-bold capitalize">{alert.risk.storageMethod}</div>
                          </div>
                          <div className="bg-white bg-opacity-50 rounded p-2">
                            <div className="text-gray-600">Time</div>
                            <div className="font-bold">{alert.risk.daysSincePickup.toFixed(1)}d</div>
                          </div>
                        </div>

                        {/* Action Recommendation */}
                        <div className={`font-bold text-sm mb-3 ${alert.nudge.color === 'red' ? 'text-red-700' :
                            alert.nudge.color === 'orange' ? 'text-orange-700' :
                              alert.nudge.color === 'yellow' ? 'text-yellow-700' :
                                'text-green-700'
                          }`}>
                          → {alert.nudge.action}
                        </div>

                        {/* Storage Method Selector */}
                        <div className="mb-3">
                          <label className="text-xs text-gray-600 block mb-1">
                            Update storage method:
                          </label>
                          <div className="flex gap-2">
                            {['refrigerator', 'freezer', 'counter'].map(method => (
                              <button
                                key={method}
                                onClick={() => updateStorageMethod(alert.listingId, method)}
                                className={`text-xs px-3 py-1 rounded ${alert.risk.storageMethod === method
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                {method === 'refrigerator' && '🧊'}
                                {method === 'freezer' && '❄️'}
                                {method === 'counter' && '🏠'}
                                {' '}
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {alert.nudge.actionType === 'freeze' && (
                            <button
                              onClick={() => {
                                updateStorageMethod(alert.listingId, 'freezer');
                                dismissAlert(alert.id);
                              }}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-blue-700"
                            >
                              ❄️ Moved to Freezer
                            </button>
                          )}
                          {(alert.nudge.actionType === 'use' || alert.nudge.actionType === 'discard') && (
                            <>
                              <button
                                onClick={() => markAsHandled(alert.listingId, 'used')}
                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-green-700"
                              >
                                ✓ Used It
                              </button>
                              <button
                                onClick={() => markAsHandled(alert.listingId, 'discarded')}
                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-gray-700"
                              >
                                🗑️ Discarded
                              </button>
                            </>
                          )}
                          {alert.nudge.actionType === 'plan' && (
                            <button
                              onClick={() => dismissAlert(alert.id)}
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-gray-700"
                            >
                              Got It
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold mb-2 text-blue-900">🤖 How It Works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Monitors time since pickup and storage method</li>
              <li>• Analyzes food type and perishability level</li>
              <li>• Calculates spoilage risk score (0-100)</li>
              <li>• Provides actionable nudges to prevent waste</li>
              <li>• Updates in real-time as you update storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact badge component for header
const SpoilageAlertBadge = ({ claimedListings }) => {
  const [alertCount, setAlertCount] = React.useState(0);
  const [highestRisk, setHighestRisk] = React.useState('safe');

  React.useEffect(() => {
    if (!claimedListings || claimedListings.length === 0) {
      setAlertCount(0);
      return;
    }

    // Quick risk calculation
    let count = 0;
    let maxRisk = 'safe';

    claimedListings.forEach(listing => {
      const now = new Date();
      const claimedDate = listing.claimed_at ? new Date(listing.claimed_at) : new Date(listing.updated_at || Date.now());
      const hoursSince = (now - claimedDate) / (1000 * 60 * 60);

      // Simple risk check
      if (hoursSince > 96 || (listing.expiration_date && new Date(listing.expiration_date) < now)) {
        count++;
        maxRisk = 'danger';
      } else if (hoursSince > 48 && listing.perishability === 'high') {
        count++;
        if (maxRisk !== 'danger') maxRisk = 'warning';
      }
    });

    setAlertCount(count);
    setHighestRisk(maxRisk);
  }, [claimedListings]);

  if (alertCount === 0) return null;

  return (
    <div
      className={`relative inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full ${highestRisk === 'danger' ? 'bg-red-600 animate-pulse' :
          highestRisk === 'warning' ? 'bg-orange-600' :
            'bg-yellow-600'
        }`}
    >
      {alertCount}
    </div>
  );
};

// Expose components globally
window.SpoilageRiskAlerts = SpoilageRiskAlerts;
window.SpoilageAlertBadge = SpoilageAlertBadge;
