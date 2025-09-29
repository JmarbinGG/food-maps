// Vehicle tracking and monitoring component
function VehicleTracker({ vehicles = [], onVehicleSelect, selectedVehicle }) {
  const [trackingData, setTrackingData] = React.useState({});
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    // Simulate real-time vehicle tracking
    const interval = setInterval(() => {
      updateVehiclePositions();
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicles]);

  const updateVehiclePositions = () => {
    const newTrackingData = {};
    
    vehicles.forEach(vehicle => {
      // Simulate GPS updates with slight position changes
      const currentData = trackingData[vehicle.id] || {
        lat: vehicle.lat,
        lng: vehicle.lng,
        speed: 0,
        heading: 0,
        lastUpdate: Date.now()
      };

      // Simulate movement
      const speedVariation = (Math.random() - 0.5) * 10; // ±5 km/h
      const newSpeed = Math.max(0, Math.min(60, currentData.speed + speedVariation));
      
      newTrackingData[vehicle.id] = {
        ...currentData,
        speed: newSpeed,
        heading: (currentData.heading + (Math.random() - 0.5) * 20) % 360,
        lastUpdate: Date.now(),
        batteryLevel: vehicle.type === 'electric' ? Math.max(20, Math.random() * 100) : null,
        fuelLevel: vehicle.type !== 'electric' ? Math.max(10, Math.random() * 100) : null
      };
    });
    
    setTrackingData(newTrackingData);
  };

  const getVehicleStatus = (vehicle) => {
    const data = trackingData[vehicle.id];
    if (!data) return 'offline';
    
    const timeSinceUpdate = Date.now() - data.lastUpdate;
    if (timeSinceUpdate > 30000) return 'offline';
    if (data.speed > 5) return 'moving';
    return 'stopped';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'moving': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="icon-truck text-blue-600 mr-2"></div>
          Vehicle Tracker
        </h3>
        <p className="text-sm text-gray-600">{vehicles.length} vehicles active</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {vehicles.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No vehicles available
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {vehicles.map(vehicle => {
              const status = getVehicleStatus(vehicle);
              const data = trackingData[vehicle.id];
              
              return (
                <div
                  key={vehicle.id}
                  onClick={() => onVehicleSelect && onVehicleSelect(vehicle)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                      <span className="font-medium text-gray-900">{vehicle.driver}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {vehicle.type} • {vehicle.capacity}kg capacity
                  </div>
                  
                  {data && (
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="icon-gauge mr-1"></span>
                        {Math.round(data.speed)} km/h
                      </div>
                      <div>
                        <span className="icon-clock mr-1"></span>
                        {new Date(data.lastUpdate).toLocaleTimeString()}
                      </div>
                      {data.batteryLevel && (
                        <div>
                          <span className="icon-battery mr-1"></span>
                          {Math.round(data.batteryLevel)}%
                        </div>
                      )}
                      {data.fuelLevel && (
                        <div>
                          <span className="icon-fuel mr-1"></span>
                          {Math.round(data.fuelLevel)}%
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-400">
                    Route: {vehicle.currentRoute || 'No active route'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {alerts.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <div className="text-sm font-medium text-red-800 mb-1">Active Alerts</div>
          {alerts.slice(0, 3).map((alert, index) => (
            <div key={index} className="text-xs text-red-600">
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.VehicleTracker = VehicleTracker;