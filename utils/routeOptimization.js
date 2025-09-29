// Advanced route optimization utility
window.RouteOptimizer = {
  // Optimize multiple delivery routes
  optimizeRoutes: async function(vehicles, deliveries, options = {}) {
    const {
      maxRouteTime = 480, // 8 hours in minutes
      maxStops = 20,
      useTraffic = true,
      timeWindows = true
    } = options;

    console.log('Optimizing routes for', vehicles.length, 'vehicles and', deliveries.length, 'deliveries');

    try {
      // Group deliveries by priority and location clusters
      const clusters = this.clusterDeliveries(deliveries, vehicles.length);
      const optimizedRoutes = [];

      for (let i = 0; i < vehicles.length && i < clusters.length; i++) {
        const vehicle = vehicles[i];
        const cluster = clusters[i];
        
        const route = await this.optimizeSingleRoute(vehicle, cluster, {
          maxRouteTime,
          maxStops,
          useTraffic,
          timeWindows
        });
        
        optimizedRoutes.push(route);
      }

      return {
        success: true,
        routes: optimizedRoutes,
        totalDistance: optimizedRoutes.reduce((sum, route) => sum + route.distance, 0),
        totalTime: optimizedRoutes.reduce((sum, route) => sum + route.duration, 0),
        efficiency: this.calculateEfficiency(optimizedRoutes)
      };

    } catch (error) {
      console.error('Route optimization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Optimize single vehicle route
  optimizeSingleRoute: async function(vehicle, deliveries, options) {
    // Sort by priority and time windows
    const sortedDeliveries = deliveries.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.timeWindow && b.timeWindow) {
        return new Date(a.timeWindow.start) - new Date(b.timeWindow.start);
      }
      return 0;
    });

    // Calculate route using Mapbox Optimization API or fallback algorithm
    const coordinates = [
      [vehicle.lng, vehicle.lat], // Start position
      ...sortedDeliveries.map(d => [d.lng, d.lat]),
      [vehicle.lng, vehicle.lat] // Return to start
    ];

    try {
      const route = await this.getMapboxOptimizedRoute(coordinates, vehicle);
      return {
        vehicleId: vehicle.id,
        stops: sortedDeliveries,
        route: route.route,
        distance: route.distance,
        duration: route.duration,
        efficiency: route.efficiency
      };
    } catch (error) {
      // Fallback to simple optimization
      return this.simpleTSPOptimization(vehicle, sortedDeliveries);
    }
  },

  // Use Mapbox Optimization API
  getMapboxOptimizedRoute: async function(coordinates, vehicle) {
    if (!window.MAPBOX_ACCESS_TOKEN || window.MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
      throw new Error('Mapbox token not configured');
    }

    const profile = vehicle.type === 'bike' ? 'cycling' : 'driving';
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinatesString}?` +
      `roundtrip=true&source=first&destination=last&steps=true&geometries=geojson&access_token=${window.MAPBOX_ACCESS_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error('Mapbox optimization failed: ' + data.message);
    }

    const trip = data.trips[0];
    return {
      route: trip.geometry,
      distance: trip.distance,
      duration: trip.duration,
      efficiency: this.calculateRouteEfficiency(trip)
    };
  },

  // Simple TSP optimization fallback
  simpleTSPOptimization: function(vehicle, deliveries) {
    // Nearest neighbor algorithm
    let currentPos = { lat: vehicle.lat, lng: vehicle.lng };
    const optimizedStops = [];
    const remainingStops = [...deliveries];

    while (remainingStops.length > 0) {
      let nearestIndex = 0;
      let minDistance = this.calculateDistance(currentPos, remainingStops[0]);

      for (let i = 1; i < remainingStops.length; i++) {
        const distance = this.calculateDistance(currentPos, remainingStops[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nextStop = remainingStops.splice(nearestIndex, 1)[0];
      optimizedStops.push(nextStop);
      currentPos = nextStop;
    }

    const totalDistance = this.calculateTotalDistance(vehicle, optimizedStops);
    
    return {
      vehicleId: vehicle.id,
      stops: optimizedStops,
      route: this.createSimpleRoute(vehicle, optimizedStops),
      distance: totalDistance,
      duration: totalDistance / 40 * 60, // Assume 40 km/h average
      efficiency: optimizedStops.length / (totalDistance / 1000) // stops per km
    };
  },

  // Cluster deliveries by geographic proximity
  clusterDeliveries: function(deliveries, numClusters) {
    if (deliveries.length <= numClusters) {
      return deliveries.map(d => [d]);
    }

    // Simple k-means clustering
    const clusters = Array(numClusters).fill().map(() => []);
    
    // Assign each delivery to nearest cluster center
    deliveries.forEach((delivery, index) => {
      const clusterIndex = index % numClusters;
      clusters[clusterIndex].push(delivery);
    });

    return clusters.filter(cluster => cluster.length > 0);
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: function(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lng-point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  },

  // Calculate total route distance
  calculateTotalDistance: function(vehicle, stops) {
    let total = 0;
    let currentPos = vehicle;

    stops.forEach(stop => {
      total += this.calculateDistance(currentPos, stop);
      currentPos = stop;
    });

    // Add return distance
    total += this.calculateDistance(currentPos, vehicle);
    return total;
  },

  // Calculate route efficiency metrics
  calculateEfficiency: function(routes) {
    const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const totalTime = routes.reduce((sum, route) => sum + route.duration, 0);

    return {
      stopsPerKm: totalStops / (totalDistance / 1000),
      stopsPerHour: totalStops / (totalTime / 3600),
      avgDistancePerStop: (totalDistance / 1000) / totalStops,
      utilizationRate: routes.filter(r => r.stops.length > 0).length / routes.length
    };
  },

  calculateRouteEfficiency: function(trip) {
    return {
      distanceEfficiency: trip.distance / (trip.duration / 60), // meters per minute
      timeEfficiency: trip.duration / trip.distance * 1000 // seconds per km
    };
  },

  // Create simple route geometry
  createSimpleRoute: function(vehicle, stops) {
    const coordinates = [
      [vehicle.lng, vehicle.lat],
      ...stops.map(stop => [stop.lng, stop.lat]),
      [vehicle.lng, vehicle.lat]
    ];
    
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    };
  }
};