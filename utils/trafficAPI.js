// Traffic and ETA utility using Mapbox APIs
window.TrafficService = {
  // Get real-time traffic information
  getTrafficInfo: async function(route) {
    if (!window.MAPBOX_ACCESS_TOKEN || window.MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const coordinates = route.coordinates || route.geometry.coordinates;
      const coordinateString = coordinates.slice(0, 25).map(coord => coord.join(',')).join(';');
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinateString}?` +
        `alternatives=true&geometries=geojson&steps=true&annotations=duration,distance,speed&access_token=${window.MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error('Traffic API error: ' + data.message);
      }

      const primaryRoute = data.routes[0];
      
      return {
        success: true,
        duration: primaryRoute.duration,
        distance: primaryRoute.distance,
        trafficLevel: this.classifyTrafficLevel(primaryRoute),
        alternatives: data.routes.slice(1).map(route => ({
          duration: route.duration,
          distance: route.distance,
          trafficLevel: this.classifyTrafficLevel(route)
        })),
        incidents: await this.getTrafficIncidents(coordinates)
      };

    } catch (error) {
      console.error('Traffic service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate ETA for delivery
  calculateETA: async function(from, to, vehicleType = 'car') {
    const profile = vehicleType === 'bike' ? 'cycling' : 'driving-traffic';
    
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?` +
        `access_token=${window.MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const now = new Date();
        const eta = new Date(now.getTime() + route.duration * 1000);
        
        return {
          success: true,
          eta: eta.toISOString(),
          duration: route.duration,
          distance: route.distance,
          confidence: this.calculateConfidence(route)
        };
      }
      
      throw new Error('No route found');

    } catch (error) {
      // Fallback calculation
      const distance = this.calculateDistance(from, to);
      const speed = vehicleType === 'bike' ? 15 : 40; // km/h
      const duration = (distance / 1000) / speed * 3600; // seconds
      
      const now = new Date();
      const eta = new Date(now.getTime() + duration * 1000);
      
      return {
        success: false,
        eta: eta.toISOString(),
        duration: duration,
        distance: distance,
        confidence: 0.6,
        fallback: true
      };
    }
  },

  // Classify traffic level based on route data
  classifyTrafficLevel: function(route) {
    const avgSpeed = (route.distance / route.duration) * 3.6; // km/h
    
    if (avgSpeed < 15) return 'heavy';
    if (avgSpeed < 30) return 'moderate';
    if (avgSpeed < 50) return 'light';
    return 'free-flow';
  },

  // Get traffic incidents along route
  getTrafficIncidents: async function(coordinates) {
    // Simplified incident detection based on speed variations
    const incidents = [];
    
    try {
      // Check for significant speed drops that might indicate incidents
      const segments = this.analyzeRouteSegments(coordinates);
      
      segments.forEach((segment, index) => {
        if (segment.speedDrop > 0.3) {
          incidents.push({
            type: 'congestion',
            location: segment.midpoint,
            severity: segment.speedDrop > 0.5 ? 'major' : 'minor',
            impact: `${Math.round(segment.delay / 60)} min delay`
          });
        }
      });

    } catch (error) {
      console.error('Error analyzing incidents:', error);
    }

    return incidents;
  },

  // Analyze route segments for incidents
  analyzeRouteSegments: function(coordinates) {
    const segments = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const segment = {
        start: coordinates[i],
        end: coordinates[i + 1],
        midpoint: [
          (coordinates[i][0] + coordinates[i + 1][0]) / 2,
          (coordinates[i][1] + coordinates[i + 1][1]) / 2
        ],
        speedDrop: Math.random() * 0.4, // Simulated for demo
        delay: Math.random() * 300 // seconds
      };
      segments.push(segment);
    }
    
    return segments;
  },

  // Calculate ETA confidence
  calculateConfidence: function(route) {
    const factors = {
      distance: route.distance < 10000 ? 0.9 : 0.7, // Higher confidence for shorter routes
      traffic: 0.8, // Assume moderate traffic reliability
      time: new Date().getHours() > 6 && new Date().getHours() < 22 ? 0.9 : 0.7 // Day vs night
    };
    
    return Object.values(factors).reduce((acc, val) => acc * val, 1);
  },

  // Calculate distance between two points
  calculateDistance: function(from, to) {
    const R = 6371e3;
    const φ1 = from.lat * Math.PI/180;
    const φ2 = to.lat * Math.PI/180;
    const Δφ = (to.lat - from.lat) * Math.PI/180;
    const Δλ = (to.lng - from.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
};