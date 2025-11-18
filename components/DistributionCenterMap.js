function DistributionCenterMap({ user, onCenterSelect }) {
  const mapContainer = React.useRef(null);
  const map = React.useRef(null);
  const markers = React.useRef([]);
  const [centers, setCenters] = React.useState([]);
  const [selectedCenter, setSelectedCenter] = React.useState(null);
  const [centerInventory, setCenterInventory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showInventoryModal, setShowInventoryModal] = React.useState(false);

  React.useEffect(() => {
    loadCenters();
    initializeMap();
  }, []);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/centers');
      const data = await response.json();
      setCenters(data);
    } catch (error) {
      console.error('Error loading distribution centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (map.current || !mapContainer.current) return;

    if (typeof mapboxgl === 'undefined') {
      console.warn('Mapbox not available');
      return;
    }

    try {
      mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.4194, 37.7749], // San Francisco
        zoom: 12
      });

      map.current.on('load', () => {
        updateMarkers();
      });

    } catch (error) {
      console.error('Map initialization error:', error);
    }
  };

  React.useEffect(() => {
    if (map.current && centers.length > 0) {
      updateMarkers();
    }
  }, [centers]);

  const updateMarkers = () => {
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for each center
    centers.forEach(center => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'distribution-center-marker';
      el.innerHTML = `
        <div class="marker-pin" style="
          background-color: #10b981;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
          ">🏪</span>
        </div>
      `;

      el.addEventListener('click', () => handleCenterClick(center));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([center.coords_lng, center.coords_lat])
        .addTo(map.current);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${center.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${center.address}</p>
            <button 
              onclick="window.viewCenterInventory(${center.id})"
              style="
                background-color: #10b981;
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                border: none;
                font-size: 12px;
                cursor: pointer;
                margin-top: 4px;
              "
            >
              View Inventory
            </button>
          </div>
        `);

      marker.setPopup(popup);
      markers.current.push(marker);
    });
  };

  const handleCenterClick = async (center) => {
    setSelectedCenter(center);
    await loadCenterInventory(center.id);
    setShowInventoryModal(true);
  };

  const loadCenterInventory = async (centerId) => {
    try {
      const response = await fetch(`/api/centers/${centerId}/inventory`);
      const data = await response.json();
      setCenterInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // Global function for popup buttons
  React.useEffect(() => {
    window.viewCenterInventory = (centerId) => {
      const center = centers.find(c => c.id === centerId);
      if (center) {
        handleCenterClick(center);
      }
    };

    return () => {
      delete window.viewCenterInventory;
    };
  }, [centers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600">Loading Distribution Centers...</p>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && selectedCenter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInventoryModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-green-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedCenter.address}</p>
                {selectedCenter.phone && (
                  <p className="text-sm text-gray-600">📞 {selectedCenter.phone}</p>
                )}
              </div>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <h3 className="text-lg font-semibold mb-4">Available Food Items</h3>

              {centerInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No items currently available</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {centerInventory.filter(item => item.is_available).map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                              {item.category}
                            </span>
                            <span className="text-gray-700">
                              <strong>Qty:</strong> {item.quantity} {item.unit}
                            </span>
                            {item.perishability && (
                              <span className={`px-2 py-1 rounded ${item.perishability === 'high' ? 'bg-red-100 text-red-800' :
                                  item.perishability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {item.perishability} perishability
                              </span>
                            )}
                          </div>
                          {item.expiration_date && (
                            <p className="text-xs text-gray-500 mt-2">
                              Expires: {new Date(item.expiration_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
            🏪
          </div>
          <span className="text-sm">Distribution Centers</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Click on a pin to view inventory</p>
      </div>
    </div>
  );
}
