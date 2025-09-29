// Autonomous dispatch coordination system
function AutonomousCoordinator({ vehicles = [], tasks = [], onAutoDispatch }) {
  const [isAutonomous, setIsAutonomous] = React.useState(false);
  const [coordinationRules, setCoordinationRules] = React.useState({
    autoAssign: true,
    rebalanceVehicles: true,
    emergencyOverride: true,
    maxWaitTime: 15
  });

  React.useEffect(() => {
    if (isAutonomous) {
      const interval = setInterval(runAutonomousCoordination, 30000);
      return () => clearInterval(interval);
    }
  }, [isAutonomous, vehicles, tasks]);

  const runAutonomousCoordination = async () => {
    console.log('Running autonomous coordination...');
    
    // AI-powered task assignment
    const unassignedTasks = tasks.filter(task => !task.assignedVehicle);
    const availableVehicles = vehicles.filter(v => v.status === 'available');

    for (const task of unassignedTasks) {
      const bestVehicle = findOptimalVehicle(task, availableVehicles);
      if (bestVehicle && onAutoDispatch) {
        onAutoDispatch(task, bestVehicle);
      }
    }

    // Dynamic rebalancing
    if (coordinationRules.rebalanceVehicles) {
      rebalanceFleet();
    }
  };

  const findOptimalVehicle = (task, vehicles) => {
    if (!vehicles.length) return null;

    return vehicles.reduce((best, vehicle) => {
      const score = calculateAssignmentScore(task, vehicle);
      return score > (best?.score || 0) ? { ...vehicle, score } : best;
    }, null);
  };

  const calculateAssignmentScore = (task, vehicle) => {
    const distance = calculateDistance(task.location, vehicle.location);
    const capacityMatch = vehicle.capacity >= task.requiredCapacity ? 1 : 0.5;
    const urgencyBonus = task.priority === 'high' ? 20 : 0;
    
    return (100 - distance) * capacityMatch + urgencyBonus;
  };

  const rebalanceFleet = () => {
    // Predict demand hotspots and pre-position vehicles
    console.log('Rebalancing fleet based on predicted demand...');
  };

  const calculateDistance = (loc1, loc2) => {
    return Math.random() * 50; // Simplified for demo
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="icon-cpu text-green-600 mr-2"></div>
            Autonomous Coordinator
          </h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Auto Mode</span>
            <button
              onClick={() => setIsAutonomous(!isAutonomous)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAutonomous ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAutonomous ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className={`p-3 rounded-lg ${isAutonomous ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isAutonomous ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">
              {isAutonomous ? 'Autonomous Mode Active' : 'Manual Mode'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {isAutonomous 
              ? 'AI is automatically assigning tasks and optimizing routes'
              : 'Manual task assignment required'
            }
          </p>
        </div>

        {/* Rules Configuration */}
        <div>
          <h4 className="font-medium mb-2">Coordination Rules</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={coordinationRules.autoAssign}
                onChange={(e) => setCoordinationRules(prev => ({
                  ...prev,
                  autoAssign: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-sm">Auto-assign new tasks</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={coordinationRules.rebalanceVehicles}
                onChange={(e) => setCoordinationRules(prev => ({
                  ...prev,
                  rebalanceVehicles: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-sm">Dynamic fleet rebalancing</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={coordinationRules.emergencyOverride}
                onChange={(e) => setCoordinationRules(prev => ({
                  ...prev,
                  emergencyOverride: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-sm">Emergency priority override</span>
            </label>
          </div>
        </div>

        {/* Performance Metrics */}
        {isAutonomous && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">2.3s</div>
              <div className="text-xs text-blue-600">Avg Assignment Time</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">94%</div>
              <div className="text-xs text-green-600">Optimization Rate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.AutonomousCoordinator = AutonomousCoordinator;