function DonationScheduler({ user, onClose }) {
  const [schedules, setSchedules] = React.useState([]);
  const [reminders, setReminders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('schedules'); // schedules or reminders

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    category: 'produce',
    estimated_quantity: '',
    unit: 'lbs',
    perishability: 'medium',
    frequency: 'weekly',
    day_of_week: 1, // Monday
    day_of_month: 1,
    time_of_day: '09:00',
    custom_interval_days: 7,
    send_reminders: true,
    reminder_hours_before: 24
  });

  React.useEffect(() => {
    if (user) {
      loadSchedules();
      loadReminders();
      const interval = setInterval(() => {
        loadSchedules();
        loadReminders();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/schedules/donations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingSchedule
        ? `/api/schedules/donations/${editingSchedule.id}`
        : '/api/schedules/donations';

      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setEditingSchedule(null);
        resetForm();
        await loadSchedules();
        if (typeof window.showAlert === 'function') {
          window.showAlert(editingSchedule ? 'Schedule updated successfully!' : 'Schedule created successfully!', { variant: 'success' });
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this donation schedule?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/schedules/donations/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadSchedules();
        if (typeof window.showAlert === 'function') {
          window.showAlert('Schedule deleted successfully!', { variant: 'success' });
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/schedules/donations/${schedule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !schedule.is_active })
      });

      if (response.ok) {
        await loadSchedules();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      alert('Failed to update schedule');
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      category: schedule.category,
      estimated_quantity: schedule.estimated_quantity,
      unit: schedule.unit,
      perishability: schedule.perishability || 'medium',
      frequency: schedule.frequency,
      day_of_week: schedule.day_of_week || 1,
      day_of_month: schedule.day_of_month || 1,
      time_of_day: schedule.time_of_day || '09:00',
      custom_interval_days: schedule.custom_interval_days || 7,
      send_reminders: schedule.send_reminders,
      reminder_hours_before: schedule.reminder_hours_before || 24
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'produce',
      estimated_quantity: '',
      unit: 'lbs',
      perishability: 'medium',
      frequency: 'weekly',
      day_of_week: 1,
      day_of_month: 1,
      time_of_day: '09:00',
      custom_interval_days: 7,
      send_reminders: true,
      reminder_hours_before: 24
    });
  };

  const handleDismissReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/reminders/${reminderId}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadReminders();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to dismiss reminder');
      }
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      alert('Failed to dismiss reminder');
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadReminders();
        await loadSchedules();
        if (typeof window.showAlert === 'function') {
          window.showAlert('Donation completed! Next donation scheduled.', { variant: 'success' });
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to complete reminder');
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Failed to complete reminder');
    }
  };

  const getFrequencyDisplay = (frequency, schedule) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly on ${dayNames[schedule.day_of_week]}`;
      case 'biweekly':
        return `Every 2 weeks on ${dayNames[schedule.day_of_week]}`;
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month}`;
      case 'custom':
        return `Every ${schedule.custom_interval_days} days`;
      default:
        return frequency;
    }
  };

  if (user?.role !== 'donor') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>Only donors can create donation schedules.</p>
          <button onClick={onClose} className="mt-4 btn-primary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donation Scheduler</h2>
            <p className="text-sm text-gray-500">Set up recurring donation schedules and reminders</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-3 border-b-2 font-medium text-sm ${activeTab === 'schedules'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="icon-calendar"></div>
                Schedules ({schedules.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`py-3 border-b-2 font-medium text-sm ${activeTab === 'reminders'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="icon-bell"></div>
                Reminders ({reminders.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'schedules' && (
            <div>
              {/* Create Button */}
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mb-6 btn-primary flex items-center gap-2"
                >
                  <div className="icon-plus"></div>
                  Create New Schedule
                </button>
              )}

              {/* Create/Edit Form */}
              {showCreateForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-green-200">
                  <h3 className="text-lg font-bold mb-4">
                    {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Schedule Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Weekly Bakery Donations"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="produce">Produce</option>
                          <option value="prepared">Prepared Food</option>
                          <option value="packaged">Packaged Goods</option>
                          <option value="bakery">Bakery Items</option>
                          <option value="fruit">Fruit</option>
                          <option value="water">Water</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Quantity *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={formData.estimated_quantity}
                          onChange={(e) => setFormData({ ...formData, estimated_quantity: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit *
                        </label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="lbs">Pounds (lbs)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="items">Items</option>
                          <option value="boxes">Boxes</option>
                          <option value="bags">Bags</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency *
                        </label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Every 2 Weeks</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom Interval</option>
                        </select>
                      </div>

                      {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Day of Week *
                          </label>
                          <select
                            value={formData.day_of_week}
                            onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="0">Monday</option>
                            <option value="1">Tuesday</option>
                            <option value="2">Wednesday</option>
                            <option value="3">Thursday</option>
                            <option value="4">Friday</option>
                            <option value="5">Saturday</option>
                            <option value="6">Sunday</option>
                          </select>
                        </div>
                      )}

                      {formData.frequency === 'monthly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Day of Month *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={formData.day_of_month}
                            onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}

                      {formData.frequency === 'custom' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interval (days) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.custom_interval_days}
                            onChange={(e) => setFormData({ ...formData, custom_interval_days: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
                        <input
                          type="time"
                          value={formData.time_of_day}
                          onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows="2"
                        placeholder="Optional notes about this donation schedule..."
                      />
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.send_reminders}
                          onChange={(e) => setFormData({ ...formData, send_reminders: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium">Send me reminders</span>
                      </label>

                      {formData.send_reminders && (
                        <div className="mt-3">
                          <label className="block text-sm text-gray-700 mb-1">
                            Remind me (hours before)
                          </label>
                          <select
                            value={formData.reminder_hours_before}
                            onChange={(e) => setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="1">1 hour before</option>
                            <option value="2">2 hours before</option>
                            <option value="4">4 hours before</option>
                            <option value="12">12 hours before</option>
                            <option value="24">24 hours before</option>
                            <option value="48">48 hours before</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary">
                        {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingSchedule(null);
                          resetForm();
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Schedules List */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading schedules...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="icon-calendar text-6xl text-gray-300 mb-4"></div>
                  <p className="text-gray-600 mb-2">No donation schedules yet</p>
                  <p className="text-sm text-gray-500">Create your first recurring donation schedule above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`border rounded-lg p-4 ${schedule.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{schedule.title}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                              }`}>
                              {schedule.is_active ? 'Active' : 'Paused'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Category:</span>{' '}
                              <span className="capitalize">{schedule.category}</span>
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>{' '}
                              {schedule.estimated_quantity} {schedule.unit}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span>{' '}
                              {getFrequencyDisplay(schedule.frequency, schedule)}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {schedule.time_of_day}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Next Donation:</span>{' '}
                              <span className="text-green-600 font-semibold">
                                {new Date(schedule.next_donation_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {schedule.description && (
                              <div className="col-span-2 text-gray-500 italic">
                                {schedule.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleToggleActive(schedule)}
                            className={`px-3 py-1 rounded text-sm font-medium ${schedule.is_active
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            {schedule.is_active ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div>
              {reminders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="icon-bell text-6xl text-gray-300 mb-4"></div>
                  <p className="text-gray-600 mb-2">No pending reminders</p>
                  <p className="text-sm text-gray-500">Reminders will appear here when donations are coming up</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="icon-bell text-2xl text-yellow-600 mt-1"></div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{reminder.title}</h3>
                          <p className="text-sm text-gray-700 mb-2">{reminder.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                               Donation: {new Date(reminder.donation_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {reminder.status === 'sent' && reminder.sent_at && (
                              <span>
                                 Sent {new Date(reminder.sent_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleCompleteReminder(reminder.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 whitespace-nowrap"
                          >
                             Mark Done
                          </button>
                          <button
                            onClick={() => handleDismissReminder(reminder.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.DonationScheduler = DonationScheduler;
