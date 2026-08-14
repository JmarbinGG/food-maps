// Emergency protocols and disaster response coordination
window.EmergencyProtocols = {
  activeEmergencies: [],
  protocols: {
    naturalDisaster: {
      priority: 1,
      responseTime: 300, // 5 minutes
      vehicleAllocation: 'all_available',
      routes: 'emergency_only'
    },
    medicalEmergency: {
      priority: 2,
      responseTime: 600, // 10 minutes
      vehicleAllocation: 'nearest_equipped',
      routes: 'priority_lanes'
    },
    infrastructureFailure: {
      priority: 3,
      responseTime: 900, // 15 minutes
      vehicleAllocation: 'specialized',
      routes: 'alternate'
    }
  },

  declareEmergency: function(type, location, severity = 'high') {
    const emergency = {
      id: `emergency_${Date.now()}`,
      type,
      location,
      severity,
      declared: new Date().toISOString(),
      status: 'active',
      affectedArea: this.calculateAffectedArea(location, severity),
      protocol: this.protocols[type] || this.protocols.infrastructureFailure
    };

    this.activeEmergencies.push(emergency);
    this.activateEmergencyResponse(emergency);
    return emergency;
  },

  activateEmergencyResponse: function(emergency) {
    console.log(`Activating emergency response for ${emergency.type}`);
    
    // Notify all relevant systems
    this.notifyDispatchSystem(emergency);
    this.reroute_traffic(emergency);
    this.allocateEmergencyVehicles(emergency);
    this.establishCommunicationChannels(emergency);
  },

  calculateAffectedArea: function(location, severity) {
    const radius = severity === 'critical' ? 10 : severity === 'high' ? 5 : 2;
    return {
      center: location,
      radius: radius, // km
      coordinates: this.generateCircleCoordinates(location, radius)
    };
  },

  generateCircleCoordinates: function(center, radiusKm) {
    const points = [];
    const radiusDegrees = radiusKm / 111; // Rough conversion
    
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * 2 * Math.PI;
      points.push([
        center.lng + radiusDegrees * Math.cos(angle),
        center.lat + radiusDegrees * Math.sin(angle)
      ]);
    }
    
    return [points]; // Polygon format for mapping
  },

  notifyDispatchSystem: function(emergency) {
    // Integration with dispatch system
    if (window.dispatchSystem) {
      window.dispatchSystem.handleEmergency(emergency);
    }
  },

  reroute_traffic: function(emergency) {
    // Automatic traffic rerouting
    console.log('Rerouting traffic around emergency area');
  },

  allocateEmergencyVehicles: function(emergency) {
    const allocation = emergency.protocol.vehicleAllocation;
    console.log(`Allocating vehicles: ${allocation}`);
  },

  establishCommunicationChannels: function(emergency) {
    // Set up emergency communication
    console.log('Establishing emergency communication channels');
  },

  resolveEmergency: function(emergencyId) {
    const emergency = this.activeEmergencies.find(e => e.id === emergencyId);
    if (emergency) {
      emergency.status = 'resolved';
      emergency.resolved = new Date().toISOString();
      this.deactivateEmergencyResponse(emergency);
    }
  },

  deactivateEmergencyResponse: function(emergency) {
    console.log(`Deactivating emergency response for ${emergency.id}`);
    // Restore normal operations
  },

  getActiveEmergencies: function() {
    return this.activeEmergencies.filter(e => e.status === 'active');
  }
};