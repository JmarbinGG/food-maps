function VolunteerRoutes({ user, onClose }) {
  const [routes, setRoutes] = React.useState([]);
  const [activeRoute, setActiveRoute] = React.useState(null);
  const [currentStop, setCurrentStop] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadVolunteerRoutes();
  }, []);

  const loadVolunteerRoutes = async () => {
    try {
      // Mock routes data
      const mockRoutes = [
        {
          id: 'route1',
          date: '2025-01-09',
          status: 'assigned',
          total_distance: '7.8 mi',
          estimated_time: '2h 15m',
          stops: [
            {
              id: 'stop1',
              type: 'pickup',
              address: '123 Main St, NY',
              coords: { lat: 40.7128, lng: -74.0060 },
              contact: 'Pizza Palace',
              items: 'Fresh pizza slices (8)',
              time_window: '10:00 - 12:00',
              status: 'pending'
            },
            {
              id: 'stop2',
              type: 'dropoff',
              address: '456 Oak Ave, NY',
              coords: { lat: 40.7200, lng: -73.9900 },
              contact: 'Maria Garcia',
              items: 'Food delivery',
              time_window: '11:00 - 13:00',
              status: 'pending'
            }
          ]
        }
      ];
      
      setRoutes(mockRoutes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading routes:', error);
      setIsLoading(false);
    }
  };

  const startRoute = (route) => {
    setActiveRoute(route);
    setCurrentStop(0);
  };

  const completeStop = (stopIndex) => {
    if (activeRoute) {
      const updatedRoute = { ...activeRoute };
      updatedRoute.stops[stopIndex].status = 'completed';
      setActiveRoute(updatedRoute);
      
      if (stopIndex < updatedRoute.stops.length - 1) {
        setCurrentStop(stopIndex + 1);
      } else {
        alert('Route completed! Great job.');
        setActiveRoute(null);
        setCurrentStop(0);
      }
    }
  };

  if (!user || user.role !== 'volunteer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Only volunteers can access routes.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="icon-loader text-2xl text-gray-400 animate-spin"></div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4" data-name="volunteer-routes" data-file="components/VolunteerRoutes.js">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Routes</h1>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                <div className="icon-x mr-2"></div>
                Close
              </button>
            )}
          </div>

          {activeRoute ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Active Route</h2>
                  <span className="text-sm text-gray-500">
                    Stop {currentStop + 1} of {activeRoute.stops.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {activeRoute.stops.map((stop, index) => (
                    <div 
                      key={stop.id}
                      className={`p-4 border rounded-lg ${
                        index === currentStop ? 'border-blue-500 bg-blue-50' :
                        stop.status === 'completed' ? 'border-green-500 bg-green-50' :
                        'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              stop.status === 'completed' ? 'bg-green-500 text-white' :
                              index === currentStop ? 'bg-blue-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium capitalize">{stop.type}</p>
                              <p className="text-sm text-gray-600">{stop.contact}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2 ml-11">
                            <p className="text-sm text-gray-700">{stop.address}</p>
                            <p className="text-sm text-gray-600">{stop.items}</p>
                            <p className="text-xs text-gray-500">Window: {stop.time_window}</p>
                          </div>
                        </div>
                        
                        {index === currentStop && stop.status !== 'completed' && (
                          <button
                            onClick={() => completeStop(index)}
                            className="btn-primary text-sm"
                          >
                            Complete
                          </button>
                        )}
                        
                        {stop.status === 'completed' && (
                          <div className="text-green-600 text-sm font-medium">✓ Done</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map(route => (
                <div key={route.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Route for {route.date}</h3>
                      <p className="text-sm text-gray-600">
                        {route.stops.length} stops • {route.total_distance} • {route.estimated_time}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">Status: {route.status}</p>
                    </div>
                    <button
                      onClick={() => startRoute(route)}
                      className="btn-primary"
                    >
                      Start Route
                    </button>
                  </div>
                </div>
              ))}
              
              {routes.length === 0 && (
                <div className="text-center py-12">
                  <div className="icon-truck text-4xl text-gray-400 mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No routes assigned</h3>
                  <p className="text-gray-500">Check back later for new delivery assignments.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('VolunteerRoutes component error:', error);
    return null;
  }
}