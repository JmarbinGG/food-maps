// Real-time alerts and notifications component
function RealTimeAlerts({ vehicles = [], routes = [] }) {
  const [alerts, setAlerts] = React.useState([]);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    // Generate real-time alerts
    const generateAlerts = () => {
      const newAlerts = [];
      
      // Vehicle-based alerts
      vehicles.forEach(vehicle => {
        // Simulate various alert conditions
        if (Math.random() < 0.1) {
          newAlerts.push({
            id: `alert_${Date.now()}_${vehicle.id}`,
            type: 'vehicle',
            severity: 'warning',
            title: 'Low Fuel Warning',
            message: `${vehicle.driver}'s ${vehicle.type} has low fuel (15%)`,
            vehicleId: vehicle.id,
            timestamp: new Date().toISOString(),
            actions: ['Refuel', 'Reassign Route']
          });
        }
        
        if (Math.random() < 0.05) {
          newAlerts.push({
            id: `alert_${Date.now()}_delay_${vehicle.id}`,
            type: 'delivery',
            severity: 'high',
            title: 'Delivery Delay',
            message: `${vehicle.driver} is 25 minutes behind schedule`,
            vehicleId: vehicle.id,
            timestamp: new Date().toISOString(),
            actions: ['Contact Driver', 'Notify Recipients']
          });
        }
      });

      // Route-based alerts
      if (Math.random() < 0.15) {
        newAlerts.push({
          id: `alert_${Date.now()}_traffic`,
          type: 'traffic',
          severity: 'medium',
          title: 'Traffic Incident',
          message: 'Heavy congestion reported on Highway 101',
          timestamp: new Date().toISOString(),
          actions: ['Reroute Vehicles', 'Monitor']
        });
      }

      // System alerts
      if (Math.random() < 0.08) {
        newAlerts.push({
          id: `alert_${Date.now()}_system`,
          type: 'system',
          severity: 'low',
          title: 'Route Optimization Complete',
          message: '3 new optimized routes generated for evening deliveries',
          timestamp: new Date().toISOString(),
          actions: ['View Routes', 'Apply Changes']
        });
      }

      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    };

    // Generate initial alerts
    generateAlerts();

    // Set up real-time alert generation
    const interval = setInterval(generateAlerts, 15000);
    return () => clearInterval(interval);
  }, [vehicles, routes]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'warning': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vehicle': return 'truck';
      case 'delivery': return 'clock';
      case 'traffic': return 'alert-triangle';
      case 'system': return 'settings';
      default: return 'bell';
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="icon-bell text-red-600 mr-2"></div>
            Real-Time Alerts
            {alerts.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                {alerts.length}
              </span>
            )}
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="icon-check-circle text-4xl text-green-300 mb-2"></div>
            <p>All systems normal</p>
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {displayedAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`icon-${getTypeIcon(alert.type)} mr-2`}></div>
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <div className="icon-x text-sm"></div>
                  </button>
                </div>
                
                <p className="text-sm mb-2">{alert.message}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {alert.actions && (
                    <div className="flex space-x-2">
                      {alert.actions.slice(0, 2).map((action, index) => (
                        <button
                          key={index}
                          className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {alerts.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full p-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {showAll ? 'Show Less' : `Show All (${alerts.length - 5} more)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

window.RealTimeAlerts = RealTimeAlerts;