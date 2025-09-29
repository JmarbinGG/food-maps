function DriverInterface({ tasks, schedules, onTaskUpdate, onViewChange }) {
  try {
    const [selectedTask, setSelectedTask] = React.useState(null);
    const [driverStatus, setDriverStatus] = React.useState('available');
    const [currentLocation, setCurrentLocation] = React.useState(null);

    React.useEffect(() => {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => console.log('Location error:', error)
        );
      }
    }, []);

    const handleTaskAction = (taskId, action) => {
      const statusMap = {
        'start': 'in_progress',
        'complete': 'completed',
        'cancel': 'cancelled'
      };
      
      onTaskUpdate(taskId, statusMap[action]);
      
      if (action === 'complete') {
        setSelectedTask(null);
      }
    };

    const getTaskPriority = (task) => {
      if (task.priority === 'emergency') return 'bg-red-100 text-red-800 border-red-200';
      if (task.priority === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
      return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const activeTasks = tasks.filter(t => t.status === 'in_progress');

    return (
      <div className="min-h-screen bg-gray-50" data-name="driver-interface" data-file="components/DriverInterface.js">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button onClick={() => onViewChange('schedule')} className="mr-4 text-gray-600 hover:text-green-600">
                  <div className="icon-arrow-left text-xl"></div>
                </button>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="icon-truck text-green-600"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
                    <p className="text-sm text-gray-600">Driver ID: DRV001</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select 
                  value={driverStatus} 
                  onChange={(e) => setDriverStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
                <div className={`w-3 h-3 rounded-full ${
                  driverStatus === 'available' ? 'bg-green-500' : 
                  driverStatus === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="icon-clock text-blue-600"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
                </div>
              </div>
            </div>
            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="icon-play text-orange-600"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-orange-600">{activeTasks.length}</p>
                </div>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="icon-check-circle text-green-600"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Task Card */}
          {activeTasks.length > 0 && (
            <div className="card mb-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600">Current Task</h3>
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">In Progress</span>
              </div>
              {activeTasks.map(task => (
                <div key={task.id} className="bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Task #{task.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">Type: {task.type}</p>
                      <p className="text-sm text-gray-600">Estimated: {task.estimatedTime} minutes</p>
                    </div>
                    <button
                      onClick={() => handleTaskAction(task.id, 'complete')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Tasks</h3>
              <span className="text-sm text-gray-500">{pendingTasks.length} pending</span>
            </div>
            
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="icon-check-circle text-4xl mb-2"></div>
                <p>No pending tasks available</p>
                <p className="text-sm">Great job! Check back later for new deliveries.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className={`p-4 border rounded-lg ${getTaskPriority(task)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium">Task #{task.id.slice(-6)}</h4>
                          {task.priority === 'emergency' && (
                            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">URGENT</span>
                          )}
                        </div>
                        <p className="text-sm mb-1">Type: {task.type.replace('_', ' ')}</p>
                        <p className="text-sm mb-1">Priority: {task.priority}</p>
                        <p className="text-sm text-gray-600">Estimated: {task.estimatedTime || 30} minutes</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleTaskAction(task.id, 'start')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          Start Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Task Details</h3>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                  <div className="icon-x text-xl"></div>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Task ID</p>
                  <p className="text-sm">{selectedTask.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-sm">{selectedTask.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Priority</p>
                  <p className="text-sm capitalize">{selectedTask.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm">{new Date(selectedTask.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleTaskAction(selectedTask.id, 'start');
                    setSelectedTask(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  Start Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('DriverInterface component error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Driver Interface Error</h2>
          <p className="text-gray-600">Unable to load driver dashboard</p>
        </div>
      </div>
    );
  }
}

window.DriverInterface = DriverInterface;
