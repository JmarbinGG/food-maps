// Mapbox utilities and API integration
// IMPORTANT: Replace this demo token with your own Mapbox access token
// Get a free token at: https://www.mapbox.com/
window.MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2lnbndpc2UiLCJhIjoiY21jOTZhZDl4MXd4cjJtcHRpZmMybzI2NSJ9.9ipnwxM81T2qguB27nt96Q';

// Check if Mapbox GL JS is available
window.MAPBOX_AVAILABLE = typeof mapboxgl !== 'undefined';

// Validate token format
const isValidToken = (token) => {
  return token && 
         (token.startsWith('pk.') || token.startsWith('sk.')) && 
         token !== 'YOUR_MAPBOX_TOKEN_HERE';
};

// Initialize Mapbox GL JS with error handling
if (window.MAPBOX_AVAILABLE) {
  try {
    if (!isValidToken(window.MAPBOX_ACCESS_TOKEN)) {
      console.error('Invalid or missing Mapbox access token. Please set a valid token in utils/mapbox.js');
      window.MAPBOX_AVAILABLE = false;
    } else {
      mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
      console.log('Mapbox GL JS initialized successfully');
    }
  } catch (error) {
    console.error('Mapbox initialization error:', error);
    window.MAPBOX_AVAILABLE = false;
  }
} else {
  console.warn('Mapbox GL JS not loaded');
}

// Geocoding utilities
window.geocodeAddress = async function(address) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${window.MAPBOX_ACCESS_TOKEN}&types=address,poi&limit=5`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        coordinates: feature.center,
        place_name: feature.place_name,
        address: feature.properties.address || feature.text
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Cached geocoding with simple in-memory cache and basic rate-limiting guard
window._geocodeCache = window._geocodeCache || new Map();
window._geocodeQueue = window._geocodeQueue || Promise.resolve();

window.geocodeAddressCached = async function(address) {
  if (!address) return null;
  const key = address.trim().toLowerCase();
  if (window._geocodeCache.has(key)) return window._geocodeCache.get(key);

  // Serialize requests to avoid hitting rate limits too quickly
  window._geocodeQueue = window._geocodeQueue.then(async () => {
    try {
      const result = await window.geocodeAddress(address);
      window._geocodeCache.set(key, result);
      // Small delay between calls to be polite to the API
      await new Promise(res => setTimeout(res, 150));
      return result;
    } catch (err) {
      console.error('geocodeAddressCached error:', err);
      return null;
    }
  });

  return window._geocodeQueue;
};

// Reverse geocoding
window.reverseGeocode = async function(lng, lat) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${window.MAPBOX_ACCESS_TOKEN}&types=address`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Directions API
window.getDirections = async function(from, to, profile = 'driving') {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?steps=true&geometries=geojson&access_token=${window.MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        geometry: route.geometry,
        duration: route.duration,
        distance: route.distance,
        steps: route.legs[0].steps
      };
    }
    return null;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
};

// Optimization API for multi-stop routes
window.getOptimizedRoute = async function(waypoints, profile = 'driving') {
  try {
    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    const response = await fetch(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinates}?steps=true&geometries=geojson&access_token=${window.MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();
    
    if (data.trips && data.trips.length > 0) {
      const trip = data.trips[0];
      return {
        geometry: trip.geometry,
        duration: trip.duration,
        distance: trip.distance,
        waypoints: data.waypoints
      };
    }
    return null;
  } catch (error) {
    console.error('Optimization error:', error);
    return null;
  }
};

// Distance calculation (Haversine formula)
window.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format duration for display
window.formatDuration = function(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format distance for display
window.formatDistance = function(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

// Enhanced Mapbox utilities
window.MapboxUtils = {
  // Initialize directions plugin
  initDirections: function(map) {
    if (typeof MapboxDirections !== 'undefined') {
      const directions = new MapboxDirections({
        accessToken: window.MAPBOX_ACCESS_TOKEN,
        unit: 'metric',
        profile: 'mapbox/driving-traffic',
        alternatives: true,
        geometries: 'geojson',
        controls: {
          instructions: false,
          profileSwitcher: false
        },
        flyTo: false
      });
      
      map.addControl(directions, 'top-left');
      return directions;
    }
    return null;
  },

  // Add navigation controls
  addNavigationControls: function(map) {
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    
    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.addControl(geolocate, 'top-right');
    return geolocate;
  },

  // Create enhanced popup
  createEnhancedPopup: function(options = {}) {
    return new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '400px',
      className: 'food-listing-popup',
      ...options
    });
  },

  // Add route layer to map
  addRouteLayer: function(map, route, id = 'route') {
    // Remove existing route if present
    if (map.getSource(id)) {
      map.removeLayer(id);
      map.removeSource(id);
    }

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      }
    });

    map.addLayer({
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });
  }
};
