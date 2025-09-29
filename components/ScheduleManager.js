function ScheduleManager({ schedules, activeTasks, listings, onSchedulePickup, onScheduleDelivery, onCreateTask, onViewChange }) {
  try {
    const [selectedTab, setSelectedTab] = React.useState('overview');
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [selectedListing, setSelectedListing] = React.useState(null);

    const getSchedulesByType = (type) => schedules.filter(s => s.type === type);
    const getTasksByStatus = (status) => activeTasks.filter(t => t.status === status);

    const handleQuickSchedule = (listing) => {
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
      
      onSchedulePickup({
        listingId: listing.id,
        scheduledTime: scheduledTime.toISOString(),
        driverId: 'auto-assign',
        priority: listing.category === 'beverages' ? 'high' : 'normal',
        estimatedDuration: 30
      });
      
      // Auto-create delivery schedule 1 hour after pickup
      const deliveryTime = new Date(scheduledTime.getTime() + 60 * 60000);
      onScheduleDelivery({
        listingId: listing.id,
        recipientId: 'auto-match',
        scheduledTime: deliveryTime.toISOString(),
        driverId: 'auto-assign',
        priority: listing.category === 'beverages' ? 'high' : 'normal',
        estimatedDuration: 20,
        address: 'To be determined'
      });
    };

    return (
      <div className="min-h-screen bg-gray-50" data-name="schedule-manager" data-file="components/ScheduleManager.js">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button onClick={() => onViewChange('map')} className="mr-4 text-gray-600 hover:text-green-600">
                  <div className="icon-arrow-left text-xl"></div>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onViewChange('driver')}
                  className="btn-secondary flex items-center"
                >
                  <div className="icon-truck mr-2"></div>
                  Driver View
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary flex items-center"
                >
                  <div className="icon-plus mr-2"></div>
                  Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'pickups', label: 'Pickups', icon: 'package' },
                { id: 'deliveries', label: 'Deliveries', icon: 'truck' },
                { id: 'routes', label: 'Routes', icon: 'route' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-3 py-4 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className={`icon-${tab.icon} mr-2`}></div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card bg-blue-50 border-blue-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <div className="icon-calendar text-blue-600"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Scheduled Today</p>
                      <p className="text-2xl font-bold text-blue-600">{schedules.length}</p>
                    </div>
                  </div>
                </div>
                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <div className="icon-check-circle text-green-600"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{getTasksByStatus('completed').length}</p>
                    </div>
                  </div>
                </div>
                <div className="card bg-orange-50 border-orange-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <div className="icon-clock text-orange-600"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-orange-600">{getTasksByStatus('in_progress').length}</p>
                    </div>
                  </div>
                </div>
                <div className="card bg-purple-50 border-purple-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <div className="icon-users text-purple-600"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Drivers</p>
                      <p className="text-2xl font-bold text-purple-600">12</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Listings for Quick Schedule */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Available for Scheduling</h3>
                    <span className="text-sm text-gray-500">{listings.filter(l => l.status === 'available').length} items</span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {listings.filter(l => l.status === 'available').slice(0, 5).map(listing => (
                      <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{listing.title}</h4>
                          <p className="text-sm text-gray-600">{listing.address}</p>
                          <div className="flex items-center mt-1">
                            <span className="status-available">{listing.category}</span>
                            {listing.category === 'beverages' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Priority</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuickSchedule(listing)}
                          className="btn-primary text-sm"
                        >
                          Quick Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    {activeTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Task {task.id.slice(-6)} {task.status}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ScheduleManager component error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Schedule Manager Error</h2>
          <p className="text-gray-600">Unable to load scheduling interface</p>
        </div>
      </div>
    );
  }
}

window.ScheduleManager = ScheduleManager;