// Mapbox Directions API Integration for Route Optimization
window.DirectionsAPI = {
  
  async getOptimizedRoute(coordinates, profile = 'mapbox/driving-traffic', options = {}) {
    try {
      if (!window.MAPBOX_ACCESS_TOKEN) {
        throw new Error('Mapbox access token not configured');
      }

      // Format coordinates for API
      const coordString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      
      // Build API URL with options
      const params = new URLSearchParams({
        access_token: window.MAPBOX_ACCESS_TOKEN,
        geometries: 'geojson',
        steps: 'true',
        overview: 'full',
        alternatives: 'true',
        annotations: 'distance,duration,speed,congestion',
        ...options
      });

      const url = `https://api.mapbox.com/directions/v5/${profile}/${coordString}?${params}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error(`Directions API error: ${data.code}`);
      }

      return data;
    } catch (error) {
      console.error('Directions API error:', error);
      throw error;
    }
  },

  async optimizeMultiStopRoute(pickups, dropoffs, driverLocation) {
    try {
      // Create optimized waypoint sequence
      const allCoordinates = [
        driverLocation,
        ...pickups.map(p => p.coordinates),
        ...dropoffs.map(d => d.coordinates)
      ];

      const routeData = await this.getOptimizedRoute(allCoordinates, 'mapbox/driving-traffic', {
        waypoints: `0;${pickups.length};${allCoordinates.length - 1}`,
        waypoint_names: [
          'Driver Location',
          ...pickups.map(p => p.name),
          ...dropoffs.map(d => d.name)
        ].join(';')
      });

      return {
        route: routeData.routes[0],
        alternatives: routeData.routes.slice(1),
        optimizedSequence: this.extractStopSequence(routeData),
        totalDistance: routeData.routes[0].distance,
        totalDuration: routeData.routes[0].duration,
        estimatedArrival: new Date(Date.now() + routeData.routes[0].duration * 1000)
      };
    } catch (error) {
      console.error('Multi-stop optimization error:', error);
      return null;
    }
  },

  extractStopSequence(routeData) {
    const route = routeData.routes[0];
    return route.legs.map((leg, index) => ({
      legIndex: index,
      startPoint: leg.steps[0]?.maneuver?.location,
      endPoint: leg.steps[leg.steps.length - 1]?.maneuver?.location,
      distance: leg.distance,
      duration: leg.duration,
      summary: leg.summary
    }));
  },

  calculateEfficiencyMetrics(routes) {
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const totalTime = routes.reduce((sum, route) => sum + route.duration, 0);
    
    return {
      avgSpeed: (totalDistance / totalTime) * 3.6, // km/h
      fuelEfficiency: totalDistance / 1000 * 0.08, // Estimated fuel usage
      co2Reduction: this.calculateCO2Savings(totalDistance),
      costSavings: this.calculateCostSavings(totalDistance, totalTime)
    };
  },

  calculateCO2Savings(distance) {
    const baseEmission = distance / 1000 * 0.21; // kg CO2 per km
    const optimizedEmission = baseEmission * 0.75; // 25% reduction
    return baseEmission - optimizedEmission;
  },

  calculateCostSavings(distance, time) {
    const fuelCost = (distance / 1000) * 0.08 * 4.5; // $4.5 per gallon
    const timeCost = (time / 3600) * 25; // $25 per hour
    return { fuel: fuelCost, time: timeCost, total: fuelCost + timeCost };
  }
};

// Route Optimization Engine
window.RouteOptimizer = {
  
  async optimizeAllRoutes(distributionCenters, dropPoints, availableDrivers) {
    try {
      const optimizedRoutes = [];
      
      // Group deliveries by priority and proximity
      const priorityGroups = this.groupByPriority(dropPoints);
      
      for (const [priority, points] of Object.entries(priorityGroups)) {
        const clusters = this.clusterByProximity(points, 3); // Max 3 stops per route
        
        for (const cluster of clusters) {
          const nearestDriver = this.findNearestAvailableDriver(cluster, availableDrivers);
          const nearestHub = this.findNearestHub(cluster, distributionCenters);
          
          if (nearestDriver && nearestHub) {
            const route = await window.DirectionsAPI.optimizeMultiStopRoute(
              [nearestHub],
              cluster,
              nearestDriver.coordinates
            );
            
            if (route) {
              optimizedRoutes.push({
                id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                driverId: nearestDriver.id,
                driverName: nearestDriver.name,
                priority,
                pickupLocation: nearestHub,
                deliveryPoints: cluster,
                routeData: route,
                status: 'optimized',
                createdAt: new Date().toISOString()
              });
              
              // Mark driver as assigned
              nearestDriver.status = 'assigned';
            }
          }
        }
      }
      
      return optimizedRoutes;
    } catch (error) {
      console.error('Route optimization error:', error);
      return [];
    }
  },

  groupByPriority(dropPoints) {
    return dropPoints.reduce((groups, point) => {
      const priority = point.urgency || 'medium';
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(point);
      return groups;
    }, {});
  },

  clusterByProximity(points, maxPerCluster) {
    const clusters = [];
    const remaining = [...points];
    
    while (remaining.length > 0) {
      const cluster = [remaining.shift()];
      const clusterCenter = cluster[0].coordinates;
      
      // Find nearby points
      for (let i = remaining.length - 1; i >= 0 && cluster.length < maxPerCluster; i--) {
        const distance = this.calculateDistance(clusterCenter, remaining[i].coordinates);
        if (distance < 5000) { // Within 5km
          cluster.push(remaining.splice(i, 1)[0]);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  },

  findNearestAvailableDriver(cluster, drivers) {
    const clusterCenter = this.getClusterCenter(cluster);
    let nearest = null;
    let minDistance = Infinity;
    
    drivers.filter(d => d.status === 'available').forEach(driver => {
      const distance = this.calculateDistance(clusterCenter, driver.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = driver;
      }
    });
    
    return nearest;
  },

  findNearestHub(cluster, hubs) {
    const clusterCenter = this.getClusterCenter(cluster);
    let nearest = null;
    let minDistance = Infinity;
    
    hubs.forEach(hub => {
      const distance = this.calculateDistance(clusterCenter, hub.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = hub;
      }
    });
    
    return nearest;
  },

  getClusterCenter(cluster) {
    const avgLat = cluster.reduce((sum, point) => sum + point.coordinates[1], 0) / cluster.length;
    const avgLng = cluster.reduce((sum, point) => sum + point.coordinates[0], 0) / cluster.length;
    return [avgLng, avgLat];
  },

  calculateDistance(coord1, coord2) {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = coord1[1] * Math.PI / 180;
    const lat2Rad = coord2[1] * Math.PI / 180;
    const deltaLatRad = (coord2[1] - coord1[1]) * Math.PI / 180;
    const deltaLngRad = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad/2) * Math.sin(deltaLngRad/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
};