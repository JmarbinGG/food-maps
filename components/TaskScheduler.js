function TaskScheduler({ onScheduleTask, onClose }) {
  try {
    const [taskType, setTaskType] = React.useState('pickup_delivery');
    const [priority, setPriority] = React.useState('normal');
    const [scheduledTime, setScheduledTime] = React.useState('');
    const [driverId, setDriverId] = React.useState('auto-assign');
    const [estimatedDuration, setEstimatedDuration] = React.useState(30);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const taskData = {
        type: taskType,
        priority,
        scheduledTime: scheduledTime || new Date(Date.now() + 30 * 60000).toISOString(),
        driverId,
        estimatedTime: estimatedDuration,
        createdAt: new Date().toISOString()
      };

      if (onScheduleTask) {
        onScheduleTask(taskData);
      }
      
      onClose();
    };

    const getMinDateTime = () => {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
           data-name="task-scheduler" data-file="components/TaskScheduler.js">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Schedule New Task</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-xl"></div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="pickup_delivery">Pickup & Delivery</option>
                <option value="pickup_only">Pickup Only</option>
                <option value="delivery_only">Delivery Only</option>
                <option value="emergency_response">Emergency Response</option>
                <option value="community_outreach">Community Outreach</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={getMinDateTime()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Leave empty for immediate scheduling"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to schedule 30 minutes from now
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Driver
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="auto-assign">Auto-assign Available Driver</option>
                <option value="driver_001">Driver #001 - Available</option>
                <option value="driver_002">Driver #002 - Available</option>
                <option value="driver_003">Driver #003 - Busy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
                min="10"
                max="240"
                step="5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('TaskScheduler component error:', error);
    return null;
  }
}

window.TaskScheduler = TaskScheduler;