// Delivery zones management component
function DeliveryZones({ map, zones = [], onZoneCreate, onZoneEdit }) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [selectedZone, setSelectedZone] = React.useState(null);
  const [drawControl, setDrawControl] = React.useState(null);

  React.useEffect(() => {
    if (!map) return;

    // Initialize Mapbox Draw for zone creation
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    map.addControl(draw, 'top-left');
    setDrawControl(draw);

    // Handle zone creation
    map.on('draw.create', (e) => {
      const feature = e.features[0];
      const zone = {
        id: `zone_${Date.now()}`,
        name: `Zone ${zones.length + 1}`,
        coordinates: feature.geometry.coordinates[0],
        type: 'delivery',
        active: true,
        created: new Date().toISOString()
      };
      
      if (onZoneCreate) onZoneCreate(zone);
      setIsCreating(false);
    });

    return () => {
      map.removeControl(draw);
    };
  }, [map]);

  // Add zones to map
  React.useEffect(() => {
    if (!map || !zones.length) return;

    zones.forEach(zone => {
      const sourceId = `zone-${zone.id}`;
      const layerId = `zone-layer-${zone.id}`;

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [zone.coordinates]
            },
            properties: zone
          }
        });

        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': zone.active ? '#3b82f6' : '#6b7280',
            'fill-opacity': 0.2
          }
        });

        map.addLayer({
          id: `${layerId}-border`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': zone.active ? '#2563eb' : '#4b5563',
            'line-width': 2
          }
        });
      }
    });
  }, [map, zones]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="icon-map text-blue-600 mr-2"></div>
            Delivery Zones
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary text-sm"
          >
            <div className="icon-plus mr-1"></div>
            Create Zone
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {zones.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="icon-map-pin text-4xl text-gray-300 mb-2"></div>
            <p>No delivery zones created</p>
            <p className="text-sm">Draw zones on the map to get started</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {zones.map(zone => (
              <div
                key={zone.id}
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedZone?.id === zone.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedZone(zone)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{zone.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      zone.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-xs text-gray-500">
                      {zone.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Type: {zone.type} • Created: {new Date(zone.created).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <span className="icon-users mr-1"></span>
                  {Math.floor(Math.random() * 50) + 10} deliveries this week
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.DeliveryZones = DeliveryZones;