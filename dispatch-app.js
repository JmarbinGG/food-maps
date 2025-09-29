class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dispatch app error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="icon-alert-triangle text-6xl text-red-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dispatch System Error</h2>
            <p className="text-gray-600 mb-4">Something went wrong. Please refresh to restart.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DispatchApp() {
  const [currentView, setCurrentView] = React.useState('overview');
  const [activeRoutes, setActiveRoutes] = React.useState([]);
  const [drivers, setDrivers] = React.useState([]);
  const [stores, setStores] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeDispatch = async () => {
      try {
        // Set Mapbox access token
        if (!window.MAPBOX_ACCESS_TOKEN) {
          window.MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        }
        
        // Initialize dispatch data
        if (window.initializeLogisticsData) {
          const data = window.initializeLogisticsData();
          setActiveRoutes(data.routes || []);
          setDrivers(data.drivers || []);
          setStores(data.stores || []);
        } else {
          // Fallback data if logistics not loaded
          setActiveRoutes([]);
          setDrivers([]);
          setStores([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize dispatch:', error);
        setIsLoading(false);
      }
    };

    initializeDispatch();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dispatch system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {window.DispatchHeaderComponent && (
        <window.DispatchHeaderComponent currentView={currentView} onViewChange={setCurrentView} />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <div className="dispatch-sidebar">
          <div className="sidebar-scroll">
            {currentView === 'overview' && (
              <div>
                {/* System Metrics */}
                <div className="sidebar-section">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">System Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="metric-card">
                      <div className="text-xs text-blue-600 mb-1">Total Routes</div>
                      <div className="text-xl font-bold text-blue-800">{activeRoutes.length}</div>
                    </div>
                    <div className="metric-card">
                      <div className="text-xs text-green-600 mb-1">Active Drivers</div>
                      <div className="text-xl font-bold text-green-800">
                        {drivers.filter(d => d.status === 'active').length}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="text-xs text-orange-600 mb-1">Pending Orders</div>
                      <div className="text-xl font-bold text-orange-800">
                        {stores.filter(s => s.type === 'drop_point' && !s.completed).length}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="text-xs text-purple-600 mb-1">Available</div>
                      <div className="text-xl font-bold text-purple-800">
                        {drivers.filter(d => d.status === 'available').length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Routes */}
                <div className="sidebar-section">
                  <h4 className="font-semibold mb-3 text-gray-900">Active Routes ({activeRoutes.length})</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activeRoutes.map(route => (
                      <div key={route.id} className="dispatch-card">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{route.driverName}</h5>
                            <p className="text-xs text-gray-600">{route.stops?.length || 0} stops • ETA: {route.estimatedTime || 'Calculating...'}</p>
                          </div>
                          <span className={`${
                            route.priority === 'critical' ? 'priority-critical' :
                            route.priority === 'high' ? 'priority-high' :
                            route.priority === 'medium' ? 'priority-medium' : 'priority-low'
                          }`}>
                            {route.priority?.toUpperCase() || 'NORMAL'}
                          </span>
                        </div>
                        <div className="route-progress mb-2">
                          <div className="progress-bar" style={{width: `${route.progress || 0}%`}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress: {route.progress || 0}%</span>
                          <span>Distance: {route.totalDistance || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver Status */}
                <div className="sidebar-section">
                  <h4 className="font-semibold mb-3 text-gray-900">Driver Status</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {drivers.map(driver => (
                      <div key={driver.id} className="dispatch-card">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{driver.name}</h5>
                            <p className="text-xs text-gray-600">{driver.vehicle} • {driver.location}</p>
                          </div>
                          <span className={`status-${driver.status}`}>
                            {driver.status.toUpperCase()}
                          </span>
                        </div>
                        {driver.currentRoute && (
                          <div className="mt-2 text-xs text-blue-600">
                            Current: {driver.currentRoute}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Centers */}
                <div className="sidebar-section">
                  <h4 className="font-semibold mb-3 text-gray-900">Distribution Centers</h4>
                  <div className="space-y-2">
                    {stores.filter(s => s.type === 'distribution_center').map(center => (
                      <div key={center.id} className="dispatch-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{center.name}</h5>
                            <p className="text-xs text-gray-600">{center.address}</p>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-gray-600">Stock: {center.currentStock}/{center.capacity}</div>
                            <div className="text-blue-600">{center.pendingPickups || 0} pending</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Orders */}
                <div className="sidebar-section">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                    <div className="icon-alert-triangle text-red-500 mr-2"></div>
                    Critical Orders
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {stores.filter(s => s.urgency === 'critical').map(order => (
                      <div key={order.id} className="dispatch-card border-red-200 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-red-900">{order.name}</h5>
                            <p className="text-xs text-red-700">{order.address}</p>
                          </div>
                          <span className="priority-critical">URGENT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentView === 'routes' && window.RouteOptimizerComponent && (
              <window.RouteOptimizerComponent routes={activeRoutes} stores={stores} />
            )}

            {currentView === 'drivers' && window.DriverDashboardComponent && (
              <window.DriverDashboardComponent drivers={drivers} />
            )}

            {currentView === 'ai' && window.AILogisticsEngineComponent && (
              <window.AILogisticsEngineComponent />
            )}
          </div>
        </div>

        <div className="dispatch-main">
          <div className="w-full h-full relative">
            {window.LogisticsMapComponent ? (
              <window.LogisticsMapComponent 
                currentView={currentView}
                routes={activeRoutes}
                drivers={drivers}
                stores={stores}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="icon-map text-6xl text-gray-400 mb-4"></div>
                  <p className="text-gray-500">Map component loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <DispatchApp />
  </ErrorBoundary>
);
