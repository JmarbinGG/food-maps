const PickupReminders = ({ user, listings, onClose }) => {
  const [reminders, setReminders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [reminderSettings, setReminderSettings] = React.useState({
    enabled: true,
    advance_notice_hours: 2,
    sms_enabled: true,
    email_enabled: false,
    auto_reminder: true
  });

  // Fetch reminders and settings
  React.useEffect(() => {
    if (user) {
      fetchReminders();
      fetchSettings();
    }
  }, [user]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pickup-reminders/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pickup-reminders/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setReminderSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pickup-reminders/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(newSettings).toString()
      });

      if (response.ok) {
        const data = await response.json();
        setReminderSettings(newSettings);
        if (typeof window.showAlert === 'function') {
          window.showAlert('Reminder settings updated!', { variant: 'success' });
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to update settings', { variant: 'error' });
      }
    }
  };

  const scheduleReminder = async (listingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pickup-reminders/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ listing_id: listingId }).toString()
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window.showAlert === 'function') {
          window.showAlert('Reminder scheduled!', { variant: 'success' });
        }
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to schedule reminder', { variant: 'error' });
      }
    }
  };

  const cancelReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pickup-reminders/${reminderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (typeof window.showAlert === 'function') {
          window.showAlert('Reminder cancelled', { variant: 'success' });
        }
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
    }
  };

  const snoozeReminder = async (reminderId, minutes) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pickup-reminders/${reminderId}/snooze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ minutes: minutes.toString() }).toString()
      });

      if (response.ok) {
        if (typeof window.showAlert === 'function') {
          window.showAlert(`Reminder snoozed for ${minutes} minutes`, { variant: 'success' });
        }
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  // Calculate time until pickup
  const getTimeUntilPickup = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return 'Overdue';
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  // Get urgency level
  const getUrgencyLevel = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffHours = (pickup - now) / (1000 * 60 * 60);

    if (diffHours < 0) return 'overdue';
    if (diffHours < 1) return 'critical';
    if (diffHours < 4) return 'high';
    if (diffHours < 24) return 'medium';
    return 'low';
  };

  // Filter reminders by status
  const filterReminders = (status) => {
    return reminders.filter(r => {
      if (status === 'upcoming') {
        return r.status === 'scheduled' || r.status === 'snoozed';
      }
      if (status === 'sent') {
        return r.status === 'sent';
      }
      if (status === 'completed') {
        return r.status === 'completed' || r.status === 'cancelled';
      }
      return true;
    });
  };

  const filteredReminders = filterReminders(activeTab);

  // Get claimed listings without reminders
  const getListingsNeedingReminders = () => {
    if (!listings) return [];

    const reminderListingIds = new Set(reminders.map(r => r.listing_id));
    return listings.filter(l =>
      l.status === 'claimed' &&
      l.recipient_id === user.id &&
      !reminderListingIds.has(l.id) &&
      new Date(l.pickup_window_start) > new Date()
    );
  };

  const listingsNeedingReminders = getListingsNeedingReminders();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="icon-bell text-2xl"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pickup Reminders</h2>
                <p className="text-blue-100 text-sm">Never miss a food pickup</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                title="Settings"
              >
                <div className="icon-sliders text-xl"></div>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="icon-sliders mr-2"></div>
              Reminder Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.enabled}
                  onChange={(e) => updateSettings({ ...reminderSettings, enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Enable pickup reminders</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.auto_reminder}
                  onChange={(e) => updateSettings({ ...reminderSettings, auto_reminder: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Auto-schedule for new claims</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.sms_enabled}
                  onChange={(e) => updateSettings({ ...reminderSettings, sms_enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Send SMS reminders</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderSettings.email_enabled}
                  onChange={(e) => updateSettings({ ...reminderSettings, email_enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Send email reminders</span>
              </label>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance notice (hours before pickup)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="72"
                  step="0.5"
                  value={reminderSettings.advance_notice_hours}
                  onChange={(e) => updateSettings({ ...reminderSettings, advance_notice_hours: parseFloat(e.target.value) })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="ml-2 text-sm text-gray-600">hours</span>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Close Settings
            </button>
          </div>
        )}

        {/* Listings Needing Reminders */}
        {listingsNeedingReminders.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <div className="icon-alert-triangle mr-2"></div>
              Claimed Items Without Reminders ({listingsNeedingReminders.length})
            </h3>
            <div className="space-y-2">
              {listingsNeedingReminders.map(listing => (
                <div key={listing.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-600">
                      Pickup: {new Date(listing.pickup_window_start).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => scheduleReminder(listing.id)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Schedule Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition ${activeTab === 'upcoming'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <div className="icon-calendar mr-2 inline-block align-middle"></div>
            Upcoming ({filterReminders('upcoming').length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition ${activeTab === 'sent'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <div className="icon-send mr-2 inline-block align-middle"></div>
            Sent ({filterReminders('sent').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition ${activeTab === 'completed'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <div className="icon-check-circle mr-2 inline-block align-middle"></div>
            History ({filterReminders('completed').length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading reminders...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'upcoming' && <div className="icon-calendar text-5xl text-gray-300"></div>}
                {activeTab === 'sent' && <div className="icon-send text-5xl text-gray-300"></div>}
                {activeTab === 'completed' && <div className="icon-check-circle text-5xl text-gray-300"></div>}
              </div>
              <p className="text-gray-600 text-lg font-medium">
                {activeTab === 'upcoming' && 'No upcoming reminders'}
                {activeTab === 'sent' && 'No sent reminders'}
                {activeTab === 'completed' && 'No reminder history'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {activeTab === 'upcoming' && 'Schedule reminders for your claimed items above'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReminders.map(reminder => {
                const urgency = getUrgencyLevel(reminder.scheduled_time);
                const timeUntil = getTimeUntilPickup(reminder.scheduled_time);

                return (
                  <div
                    key={reminder.id}
                    className={`border rounded-lg p-4 transition ${urgency === 'overdue' ? 'border-red-300 bg-red-50' :
                        urgency === 'critical' ? 'border-orange-300 bg-orange-50' :
                          urgency === 'high' ? 'border-yellow-300 bg-yellow-50' :
                            'border-gray-200 bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {urgency === 'overdue' && <div className="icon-alert-circle text-red-600"></div>}
                            {urgency === 'critical' && <div className="icon-alert-triangle text-orange-600"></div>}
                            {urgency === 'high' && <div className="icon-clock text-yellow-600"></div>}
                            {urgency === 'medium' && <div className="icon-bell text-blue-600"></div>}
                            {urgency === 'low' && <div className="icon-calendar text-gray-500"></div>}
                          </span>
                          <h3 className="font-semibold text-gray-900">{reminder.listing_title}</h3>
                          {reminder.status === 'snoozed' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Snoozed
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <span className="w-24 font-medium">Pickup time:</span>
                            <span>{new Date(reminder.scheduled_time).toLocaleString()}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="w-24 font-medium">Time until:</span>
                            <span className={`font-medium ${urgency === 'overdue' ? 'text-red-600' :
                                urgency === 'critical' ? 'text-orange-600' :
                                  'text-gray-900'
                              }`}>
                              {timeUntil}
                            </span>
                          </p>
                          {reminder.reminder_sent_at && (
                            <p className="flex items-center">
                              <span className="w-24 font-medium">Sent:</span>
                              <span>{new Date(reminder.reminder_sent_at).toLocaleString()}</span>
                            </p>
                          )}
                          {reminder.location && (
                            <p className="flex items-center">
                              <span className="w-24 font-medium">Location:</span>
                              <span>{reminder.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {activeTab === 'upcoming' && (
                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => snoozeReminder(reminder.id, 30)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                            title="Snooze for 30 minutes"
                          >
                             30m
                          </button>
                          <button
                            onClick={() => snoozeReminder(reminder.id, 60)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                            title="Snooze for 1 hour"
                          >
                             1h
                          </button>
                          <button
                            onClick={() => cancelReminder(reminder.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                            title="Cancel reminder"
                          >
                            
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {reminderSettings.enabled ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Reminders enabled • {reminderSettings.advance_notice_hours}h advance notice
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Reminders disabled
                </span>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PickupReminders = PickupReminders;
