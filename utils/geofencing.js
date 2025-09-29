// Geofencing utility for delivery zones and boundary management
window.GeofencingService = {
  zones: [],
  alerts: [],

  // Create delivery zone
  createDeliveryZone: function(name, coordinates, type = 'delivery') {
    const zone = {
      id: `zone_${Date.now()}`,
      name,
      type,
      coordinates,
      active: true,
      created: new Date().toISOString(),
      alertRules: {
        onEntry: true,
        onExit: true,
        dwellTime: 300 // 5 minutes
      }
    };
    
    this.zones.push(zone);
    return zone;
  },

  // Check if point is within zone
  isPointInZone: function(lat, lng, zoneId) {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return false;

    // Simple polygon check (for complex shapes, use turf.js)
    const coords = zone.coordinates;
    let inside = false;
    
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      if (((coords[i][1] > lng) !== (coords[j][1] > lng)) &&
          (lat < (coords[j][0] - coords[i][0]) * (lng - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
        inside = !inside;
      }
    }
    
    return inside;
  },

  // Monitor vehicle positions
  checkVehicleGeofences: function(vehicles) {
    const alerts = [];
    
    vehicles.forEach(vehicle => {
      this.zones.forEach(zone => {
        const isInside = this.isPointInZone(
          vehicle.lat, 
          vehicle.lng, 
          zone.id
        );
        
        const wasInside = vehicle.inZones && vehicle.inZones.includes(zone.id);
        
        if (isInside && !wasInside) {
          alerts.push({
            type: 'zone_entry',
            vehicleId: vehicle.id,
            zoneId: zone.id,
            timestamp: new Date().toISOString()
          });
        } else if (!isInside && wasInside) {
          alerts.push({
            type: 'zone_exit',
            vehicleId: vehicle.id,
            zoneId: zone.id,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    return alerts;
  },

  // Get zones for map display
  getZonesForMap: function() {
    return this.zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      type: zone.type,
      coordinates: zone.coordinates,
      active: zone.active
    }));
  }
};