function LogisticsMapComponent({ currentView, routes = [], drivers = [], stores = [] }) {
  const mapContainer = React.useRef(null);
  
  try {
    React.useEffect(() => {
      if (mapContainer.current) {
        displayMap();
      }
    }, [currentView, routes, drivers, stores]);

    const displayMap = () => {
      try {
        if (window.MAPBOX_ACCESS_TOKEN && window.mapboxgl) {
          displayRealMap();
        } else {
          displayFallbackMap();
        }
      } catch (error) {
        console.error('Map display error:', error);
        displayFallbackMap();
      }
    };

    const displayRealMap = () => {
      mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
      
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.4194, 37.7749],
        zoom: 11,
        minZoom: 8,
        maxZoom: 20,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      // Add navigation controls (zoom in/out, compass, etc.)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
      // Add geolocate control
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

      map.on('load', () => {
        // Track user interaction to prevent auto-fitting after user controls the map
        let userHasInteracted = false;
        
        map.on('zoomstart', () => {
          userHasInteracted = true;
        });
        
        map.on('dragstart', () => {
          userHasInteracted = true;
        });
        
        map.on('pitchstart', () => {
          userHasInteracted = true;
        });
        
        map.on('rotatestart', () => {
          userHasInteracted = true;
        });
        
        // Store interaction state on map instance
        map.userHasInteracted = () => userHasInteracted;
        
        // Resize map to ensure proper rendering
        setTimeout(() => {
          map.resize();
        }, 100);
        
        addMarkers(map);
        
        // Fit map to show all markers only if user hasn't interacted
        if ((stores.length > 0 || drivers.length > 0) && !userHasInteracted) {
          const bounds = new mapboxgl.LngLatBounds();
          
          stores.forEach(store => {
            bounds.extend(store.coordinates);
          });
          
          drivers.forEach(driver => {
            bounds.extend(driver.coordinates);
          });
          
          map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      });

      // Handle resize events
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      
      if (mapContainer.current) {
        resizeObserver.observe(mapContainer.current);
      }
      
      return () => {
        resizeObserver.disconnect();
        map.remove();
      };
    };

    const addMarkers = (map) => {
      // Add distribution centers with detailed popups
      stores.filter(s => s.type === 'distribution_center').forEach(store => {
        const el = document.createElement('div');
        el.className = 'w-12 h-12 bg-green-600 rounded-lg border-3 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform';
        el.innerHTML = '<div class="icon-warehouse text-white text-xl"></div>';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-4 min-w-[280px]">
              <h3 class="font-bold text-lg mb-2">${store.name}</h3>
              <div class="text-sm text-gray-600 mb-3">${store.address}</div>
              <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                <div class="bg-blue-50 p-2 rounded">
                  <div class="text-blue-600 font-medium">Current Stock</div>
                  <div class="font-bold">${store.currentStock}/${store.capacity}</div>
                </div>
                <div class="bg-orange-50 p-2 rounded">
                  <div class="text-orange-600 font-medium">Pending Pickups</div>
                  <div class="font-bold">${store.pendingPickups}</div>
                </div>
              </div>
              <div class="text-xs text-gray-500">
                Hours: ${store.operatingHours}<br>
                Manager: ${store.manager}
              </div>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat(store.coordinates)
          .setPopup(popup)
          .addTo(map);
      });

      // Add drop points with urgency-based styling
      stores.filter(s => s.type === 'drop_point').forEach(store => {
        const urgencyColors = {
          critical: 'bg-red-600 animate-pulse',
          high: 'bg-orange-600',
          medium: 'bg-yellow-600',
          low: 'bg-green-600'
        };
        
        const el = document.createElement('div');
        el.className = `w-10 h-10 ${urgencyColors[store.urgency] || 'bg-blue-600'} rounded-full border-3 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`;
        el.innerHTML = '<div class="icon-map-pin text-white"></div>';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-4 min-w-[280px]">
              <h3 class="font-bold text-lg mb-2">${store.name}</h3>
              <div class="text-sm text-gray-600 mb-3">${store.address}</div>
              <div class="flex justify-between items-center mb-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${
                  store.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                  store.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                  store.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }">
                  ${(store.urgency || 'normal').toUpperCase()} PRIORITY
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>Families Served: <strong>${store.familiesServed}</strong></div>
                <div>Pending: <strong>${store.pendingDeliveries}</strong></div>
              </div>
              <div class="text-xs text-gray-600">
                <strong>Requested Items:</strong><br>
                ${store.requestedItems.join(', ')}<br>
                <strong>Last Delivery:</strong> ${store.lastDelivery}
              </div>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat(store.coordinates)
          .setPopup(popup)
          .addTo(map);
      });

      // Add active drivers with real-time status
      drivers.forEach(driver => {
        const el = document.createElement('div');
        el.className = `w-12 h-12 rounded-full border-3 border-white shadow-xl flex items-center justify-center cursor-pointer ${
          driver.status === 'active' ? 'bg-blue-600 animate-pulse' : 
          driver.status === 'available' ? 'bg-green-500' : 'bg-gray-500'
        }`;
        el.innerHTML = '<div class="icon-truck text-white text-lg"></div>';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-4 min-w-[300px]">
              <h3 class="font-bold text-lg mb-2">${driver.name}</h3>
              <div class="text-sm text-gray-600 mb-3">${driver.vehicle}</div>
              <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                <div class="bg-blue-50 p-2 rounded">
                  <div class="text-blue-600 font-medium">Status</div>
                  <div class="font-bold capitalize">${driver.status}</div>
                </div>
                <div class="bg-green-50 p-2 rounded">
                  <div class="text-green-600 font-medium">Capacity</div>
                  <div class="font-bold">${driver.vehicleCapacity}</div>
                </div>
                <div class="bg-purple-50 p-2 rounded">
                  <div class="text-purple-600 font-medium">Deliveries</div>
                  <div class="font-bold">${driver.deliveriesCompleted}</div>
                </div>
                <div class="bg-orange-50 p-2 rounded">
                  <div class="text-orange-600 font-medium">Hours</div>
                  <div class="font-bold">${driver.hoursWorked}h</div>
                </div>
              </div>
              ${driver.currentRoute ? `<div class="text-xs text-gray-600 bg-yellow-50 p-2 rounded">Current Route: <strong>${driver.currentRoute}</strong></div>` : ''}
              <div class="text-xs text-gray-500 mt-2">
                Phone: ${driver.phone}<br>
                Emergency: ${driver.emergencyContact}
              </div>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat(driver.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    };

    const displayFallbackMap = () => {
      mapContainer.current.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
          <div class="text-center z-10">
            <div class="icon-map text-6xl text-blue-400 mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-700">Dispatch Map View</h3>
            <p class="text-gray-500 mb-4">Configure Mapbox token for interactive map</p>
            <div class="bg-white rounded-lg p-4 shadow-lg max-w-md mx-auto text-left">
              <h4 class="font-semibold text-gray-800 mb-2">Setup Instructions:</h4>
              <ol class="text-sm text-gray-600 space-y-1">
                <li>1. Get a free Mapbox token</li>
                <li>2. Open utils/mapbox.js</li>
                <li>3. Replace YOUR_MAPBOX_TOKEN_HERE</li>
                <li>4. Refresh the page</li>
              </ol>
            </div>
          </div>
          <div class="absolute inset-0 bg-blue-200 opacity-20"></div>
          <div class="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
            <div class="text-xs text-gray-600">Zoom controls would appear here</div>
          </div>
        </div>
      `;
    };

    return (
      <div className="full-map-container">
        <div 
          ref={mapContainer} 
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '400px' }}
        ></div>
        
        {/* Floating Control Panels */}
        <div className="absolute top-4 right-4 space-y-3 z-10">
          {/* Real-time Stats */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-[280px] border">
            <h4 className="font-bold mb-3 text-gray-900">Live Dispatch Stats</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{routes.length}</div>
                <div className="text-gray-600">Active Routes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.status === 'active').length}
                </div>
                <div className="text-gray-600">Active Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stores.filter(s => s.urgency === 'critical').length}
                </div>
                <div className="text-gray-600">Critical Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {drivers.filter(d => d.status === 'available').length}
                </div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-[280px] border">
            <h4 className="font-bold mb-3 text-gray-900">Dispatch Controls</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <div className="icon-refresh-cw text-base"></div>
                <span>Refresh All Routes</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <div className="icon-zap text-base"></div>
                <span>Auto-Optimize</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 text-sm bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <div className="icon-eye text-base"></div>
                <span>View All Locations</span>
              </button>
            </div>
          </div>

          {/* Map Legend */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-[280px] border">
            <h4 className="font-bold mb-3 text-gray-900">Map Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded-lg border-2 border-white shadow"></div>
                <span>Distribution Centers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow"></div>
                <span>Critical Deliveries</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-orange-600 rounded-full border-2 border-white shadow"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow animate-pulse"></div>
                <span>Active Drivers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-500 rounded-full border-2 border-white shadow"></div>
                <span>Available Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-3 z-10">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-600">System Status: <span className="text-green-600 font-medium">● Online</span></span>
              <span className="text-gray-600">Last Update: <span className="font-medium">{new Date().toLocaleTimeString()}</span></span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-600">Total Distance Today: <span className="font-medium text-blue-600">1,247 km</span></span>
              <span className="text-gray-600">Fuel Saved: <span className="font-medium text-green-600">18.3L</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LogisticsMap error:', error);
    return <div className="h-full bg-red-100 flex items-center justify-center">Map Error</div>;
  }
}

window.LogisticsMapComponent = LogisticsMapComponent;