// Advanced route planner and optimization component
function RoutePlanner({ vehicles = [], deliveries = [], onRouteUpdate }) {
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [optimizationSettings, setOptimizationSettings] = React.useState({
    prioritizeTime: true,
    considerTraffic: true,
    maxRouteHours: 8,
    allowOvertime: false
  });
  const [routes, setRoutes] = React.useState([]);

  const optimizeRoutes = async () => {
    setIsOptimizing(true);
    
    try {
      // Use the RouteOptimizer utility
      const result = await window.RouteOptimizer.optimizeRoutes(
        vehicles, 
        deliveries, 
        optimizationSettings
      );
      
      if (result.success) {
        setRoutes(result.routes);
        if (onRouteUpdate) {
          onRouteUpdate(result.routes);
        }
      } else {
        console.error('Route optimization failed:', result.error);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getRouteColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
    return colors[index % colors.length];
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="icon-route text-blue-600 mr-2"></div>
          Route Optimization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={optimizationSettings.prioritizeTime}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  prioritizeTime: e.target.checked
                }))}
                className="mr-2"
              />
              Prioritize delivery time
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={optimizationSettings.considerTraffic}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  considerTraffic: e.target.checked
                }))}
                className="mr-2"
              />
              Consider real-time traffic
            </label>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max route hours: {optimizationSettings.maxRouteHours}
              </label>
              <input
                type="range"
                min="4"
                max="12"
                value={optimizationSettings.maxRouteHours}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  maxRouteHours: parseInt(e.target.value)
                }))}
                className="w-full"
              />
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={optimizationSettings.allowOvertime}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  allowOvertime: e.target.checked
                }))}
                className="mr-2"
              />
              Allow overtime
            </label>
          </div>
        </div>
        
        <button
          onClick={optimizeRoutes}
          disabled={isOptimizing}
          className="btn-primary w-full md:w-auto"
        >
          {isOptimizing ? (
            <>
              <div className="icon-loader animate-spin mr-2"></div>
              Optimizing Routes...
            </>
          ) : (
            <>
              <div className="icon-zap mr-2"></div>
              Optimize Routes
            </>
          )}
        </button>
      </div>

      {/* Route Results */}
      {routes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Optimized Routes</h4>
            <p className="text-sm text-gray-600">
              {routes.length} routes generated for {routes.reduce((sum, route) => sum + route.stops.length, 0)} deliveries
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {routes.map((route, index) => (
              <div key={route.vehicleId} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded bg-${getRouteColor(index)}-500 mr-3`}></div>
                    <span className="font-medium">
                      Vehicle {route.vehicleId} - {route.stops.length} stops
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDuration(route.duration)} • {(route.distance / 1000).toFixed(1)}km
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <span className="ml-1 font-medium">{(route.distance / 1000).toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">{formatDuration(route.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Efficiency:</span>
                    <span className="ml-1 font-medium">{route.efficiency?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ETA:</span>
                    <span className="ml-1 font-medium">
                      {new Date(Date.now() + route.duration * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Route Stops:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {route.stops.slice(0, 6).map((stop, stopIndex) => (
                      <div key={stopIndex} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        {stop.address || stop.name || `Stop ${stopIndex + 1}`}
                      </div>
                    ))}
                    {route.stops.length > 6 && (
                      <div className="text-gray-500">
                        +{route.stops.length - 6} more stops
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="btn-secondary text-sm">
            <div className="icon-download mr-1"></div>
            Export Routes
          </button>
          <button className="btn-secondary text-sm">
            <div className="icon-send mr-1"></div>
            Send to Drivers
          </button>
          <button className="btn-secondary text-sm">
            <div className="icon-refresh-cw mr-1"></div>
            Re-optimize
          </button>
        </div>
      </div>
    </div>
  );
}

window.RoutePlanner = RoutePlanner;