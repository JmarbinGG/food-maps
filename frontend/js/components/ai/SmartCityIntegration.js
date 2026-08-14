// Smart city integration component
function SmartCityIntegration({ onTrafficUpdate, onInfrastructureAlert }) {
  const [integrations, setIntegrations] = React.useState({
    trafficLights: { connected: true, status: 'optimized' },
    parkingSensors: { connected: true, status: 'monitoring' },
    weatherService: { connected: true, status: 'active' },
    emergencyServices: { connected: false, status: 'pending' }
  });

  const [cityData, setCityData] = React.useState({
    trafficFlow: 75,
    airQuality: 82,
    roadConditions: 'good',
    publicTransportStatus: 'normal'
  });

  React.useEffect(() => {
    // Simulate real-time city data updates
    const interval = setInterval(updateCityData, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateCityData = () => {
    const newData = {
      trafficFlow: Math.max(30, Math.min(100, cityData.trafficFlow + (Math.random() - 0.5) * 10)),
      airQuality: Math.max(0, Math.min(100, cityData.airQuality + (Math.random() - 0.5) * 5)),
      roadConditions: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
      publicTransportStatus: ['normal', 'delayed', 'disrupted'][Math.floor(Math.random() * 3)]
    };
    
    setCityData(newData);
    
    if (onTrafficUpdate) {
      onTrafficUpdate(newData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimized':
      case 'active':
      case 'monitoring': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="icon-globe text-blue-600 mr-2"></div>
          Smart City Integration
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Integration Status */}
        <div>
          <h4 className="font-medium mb-3">System Connections</h4>
          <div className="space-y-2">
            {Object.entries(integrations).map(([system, data]) => (
              <div key={system} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    data.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">
                    {system.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time City Data */}
        <div>
          <h4 className="font-medium mb-3">City Conditions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{cityData.trafficFlow}%</div>
              <div className="text-xs text-blue-600">Traffic Flow</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{cityData.airQuality}</div>
              <div className="text-xs text-green-600">Air Quality Index</div>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Road Conditions:</span>
              <span className="font-medium capitalize">{cityData.roadConditions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Public Transport:</span>
              <span className={`font-medium capitalize ${
                cityData.publicTransportStatus === 'normal' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {cityData.publicTransportStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Smart Features */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Active Optimizations</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Dynamic traffic light coordination for delivery routes</li>
            <li>• Real-time parking availability integration</li>
            <li>• Weather-adaptive route planning active</li>
            <li>• Emergency service priority routing enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

window.SmartCityIntegration = SmartCityIntegration;