function MapComponent({ listings = [], selectedListing, onListingSelect, user }) {
  const mapContainer = React.useRef(null);
  const map = React.useRef(null);
  const markersRef = React.useRef([]);
  const [userLocation, setUserLocation] = React.useState(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  const safeListings = Array.isArray(listings) ? listings : [];
  const [distributionCenters, setDistributionCenters] = React.useState([]);
  const [doGoodsStores, setDoGoodsStores] = React.useState([]);
  const [doGoodsKiosks, setDoGoodsKiosks] = React.useState([]);

  // Load distribution centers, stores and kiosks
  React.useEffect(() => {
    if (typeof window.getMockDistributionCenters === 'function') {
      setDistributionCenters(window.getMockDistributionCenters());
    }
    if (typeof window.getMockDoGoodsStores === 'function') {
      setDoGoodsStores(window.getMockDoGoodsStores());
    }
    if (typeof window.getMockDoGoodsKiosks === 'function') {
      setDoGoodsKiosks(window.getMockDoGoodsKiosks());
    }
  }, []);

  // Initialize map
  React.useEffect(() => {
    if (map.current) return;
    
    // Check if container is available
    if (!mapContainer.current) {
      console.error('Map container not available');
      return;
    }
    
    // Set map as available by default for better UX
    if (typeof mapboxgl === 'undefined') {
      console.warn('Mapbox GL JS not loaded, using fallback');
      window.MAPBOX_AVAILABLE = false;
      return;
    }

    // Check if token is available
    if (!window.MAPBOX_ACCESS_TOKEN || window.MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
      console.warn('Using demo token - replace with your Mapbox token');
      // Continue with demo functionality
    }

    try {
      mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;
      
      // Check if mobile device
      const isMobile = window.innerWidth <= 768;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-122.2416, 37.7652], // Alameda center
        zoom: isMobile ? 12 : 13,
        minZoom: 8,
        maxZoom: 20,
        pitch: 0,
        bearing: 0,
        // Mobile-specific settings
        touchZoomRotate: true,
        touchPitch: false,
        dragRotate: !isMobile,
        pitchWithRotate: false,
        dragPan: true,
        scrollZoom: true,
        doubleClickZoom: true,
        keyboard: !isMobile
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        window.MAPBOX_AVAILABLE = true;
        
        // Track user interaction to prevent auto-fitting after user controls the map
        let userHasInteracted = false;
        
        map.current.on('zoomstart', () => {
          userHasInteracted = true;
        });
        
        map.current.on('dragstart', () => {
          userHasInteracted = true;
        });
        
        map.current.on('pitchstart', () => {
          userHasInteracted = true;
        });
        
        map.current.on('rotatestart', () => {
          userHasInteracted = true;
        });
        
        // Store interaction state on map instance
        map.current.userHasInteracted = () => userHasInteracted;

        // Define global handlers once for map popups/actions
        window.claimFromMap = (listingId) => {
          try { if (map.current && map.current._lastListingPopup) map.current._lastListingPopup.remove(); } catch (e) {}
          if (window.handleClaimListing) {
            window.handleClaimListing(listingId);
          }
        };

        window.selectFromMap = (listingId) => {
          try { if (map.current && map.current._lastListingPopup) map.current._lastListingPopup.remove(); } catch (e) {}
          const idStr = listingId != null ? String(listingId) : null;
          let listingsArr = [];
          try { listingsArr = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []); } catch (e) { listingsArr = []; }
          let selectedListing = null;
          if (idStr) {
            selectedListing = listingsArr.find(l => {
              const lid = l && l.id != null ? String(l.id) : null;
              const loid = l && l.objectId != null ? String(l.objectId) : null;
              return (lid && lid === idStr) || (loid && loid === idStr);
            });
          }
          if (!selectedListing) {
            // Best-effort: nothing else we can do without props
          }
          if (selectedListing && window.handleShowDetails) {
            window.handleShowDetails(selectedListing);
          }
        };
        
        // Mobile-specific map adjustments
        if (window.innerWidth <= 768) {
          // Disable map rotation on mobile to prevent accidental rotation
          map.current.dragRotate.disable();
          map.current.touchZoomRotate.disableRotation();
          
          // Add resize handler for mobile orientation changes
          const handleResize = () => {
            setTimeout(() => {
              if (map.current && map.current.isStyleLoaded()) {
                map.current.resize();
              }
            }, 100);
          };
          
          window.addEventListener('orientationchange', handleResize);
          window.addEventListener('resize', handleResize);
          
          // Store cleanup function
          map.current._mobileCleanup = () => {
            window.removeEventListener('orientationchange', handleResize);
            window.removeEventListener('resize', handleResize);
          };
        }
        
        // Removed Mapbox global clustering; we'll group markers by identical address only

        // Trigger resize to ensure proper display
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 100);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        window.MAPBOX_AVAILABLE = false;
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: false
      }), 'top-right');

    } catch (error) {
      console.error('Map initialization error:', error);
      window.MAPBOX_AVAILABLE = false;
    }
  }, []);

  // Create distribution center marker element
  const createDistributionCenterElement = (center) => {
    const el = document.createElement('div');
    el.className = 'distribution-center-marker';
    
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #1f2937, #374151);
        border: 3px solid #10b981;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          font-size: 18px;
          color: #10b981;
        ">🏪</div>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        ">✓</div>
      </div>
    `;
    
    el.addEventListener('mouseenter', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1.1)';
        }
      } catch (error) {
        console.error('Distribution center marker hover error:', error);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1)';
        }
      } catch (error) {
        console.error('Distribution center marker leave error:', error);
      }
    });
    
    return el;
  };

  // Create DoGoods store marker element
  const createDoGoodsStoreElement = (store) => {
    const el = document.createElement('div');
    el.className = 'dogoods-store-marker';
    
    const levelColors = {
      'Gold Partner': '#f59e0b',
      'Silver Partner': '#6b7280', 
      'Bronze Partner': '#cd7c2f'
    };
    
    el.innerHTML = `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        border: 3px solid ${levelColors[store.participation_level] || '#7c3aed'};
        border-radius: 8px;
        box-shadow: 0 3px 12px rgba(124, 58, 237, 0.4);
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          font-size: 16px;
          color: white;
        ">🏪</div>
      </div>
    `;
    
    el.addEventListener('mouseenter', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1.1)';
        }
      } catch (error) {
        console.error('DoGoods store marker hover error:', error);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1)';
        }
      } catch (error) {
        console.error('DoGoods store marker leave error:', error);
      }
    });
    
    return el;
  };

  // Create DoGoods kiosk marker element
  const createDoGoodsKioskElement = (kiosk) => {
    const el = document.createElement('div');
    el.className = 'dogoods-kiosk-marker';
    
    el.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #0891b2, #06b6d4);
        border: 2px solid white;
        border-radius: 6px;
        box-shadow: 0 3px 10px rgba(8, 145, 178, 0.4);
        cursor: pointer;
        position: relative;
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          font-size: 14px;
          color: white;
        ">🖥️</div>
      </div>
    `;
    
    el.addEventListener('mouseenter', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1.1)';
        }
      } catch (error) {
        console.error('DoGoods kiosk marker hover error:', error);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'scale(1)';
        }
      } catch (error) {
        console.error('DoGoods kiosk marker leave error:', error);
      }
    });
    
    return el;
  };

  // Determine donor type from listing information
  const getDonorType = (listing) => {
    if (!listing.donor_name) return 'personal';
    
    const donorName = listing.donor_name.toLowerCase();
    
    // Restaurant keywords
    if (donorName.includes('restaurant') || donorName.includes('bistro') || 
        donorName.includes('café') || donorName.includes('deli') || 
        donorName.includes('catering') || donorName.includes('kitchen') ||
        donorName.includes('eatery') || donorName.includes('grill')) {
      return 'restaurant';
    }
    
    // Store keywords
    if (donorName.includes('market') || donorName.includes('store') || 
        donorName.includes('shop') || donorName.includes('foods') || 
        donorName.includes('grocery') || donorName.includes('mart')) {
      return 'store';
    }
    
    // Organization keywords
    if (donorName.includes('center') || donorName.includes('community') || 
        donorName.includes('garden') || donorName.includes('foundation') ||
        donorName.includes('organization') || donorName.includes('corp') ||
        donorName.includes('company') || donorName.includes('services')) {
      return 'organization';
    }
    
    // Default to personal donor
    return 'personal';
  };

  // Resolve coordinates from many possible shapes:
  // - listing.coords = { lat, lng }
  // - listing.coordinates = [lng, lat]
  // - listing.coords_lat / listing.coords_lng (flat DB columns)
  const resolveCoords = (listing) => {
    if (!listing) return null;
    try {
      if (listing.coords && (listing.coords.lat || listing.coords.lng)) {
        let lat = parseFloat(listing.coords.lat);
        let lng = parseFloat(listing.coords.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          // Validate ranges - lat should be between -90/90, lng between -180/180
          const validLat = lat >= -90 && lat <= 90;
          const validLng = lng >= -180 && lng <= 180;
          if (!validLat && validLng && lat >= -180 && lat <= 180 && lng >= -90 && lng <= 90) {
            // swapped values - swap them
            const tmp = lat; lat = lng; lng = tmp;
          }
          if ((lat >= -90 && lat <= 90) && (lng >= -180 && lng <= 180)) {
            return { lat, lng };
          }
        }
      }

      if (listing.coordinates && Array.isArray(listing.coordinates) && listing.coordinates.length >= 2) {
        let lng = parseFloat(listing.coordinates[0]);
        let lat = parseFloat(listing.coordinates[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          // Validate and swap if reversed
          if (!(lat >= -90 && lat <= 90) && (lng >= -90 && lng <= 90)) {
            const tmp = lat; lat = lng; lng = tmp;
          }
          if ((lat >= -90 && lat <= 90) && (lng >= -180 && lng <= 180)) {
            return { lat, lng };
          }
        }
      }

      // Support flat DB columns commonly named coords_lat / coords_lng
      const latKey = listing.coords_lat !== undefined ? 'coords_lat' : (listing.lat !== undefined ? 'lat' : null);
      const lngKey = listing.coords_lng !== undefined ? 'coords_lng' : (listing.lng !== undefined ? 'lng' : null);
      if (latKey && lngKey) {
        let lat = parseFloat(listing[latKey]);
        let lng = parseFloat(listing[lngKey]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          // Swap if reversed
          if (!(lat >= -90 && lat <= 90) && (lng >= -90 && lng <= 90)) {
            const tmp = lat; lat = lng; lng = tmp;
          }
          if ((lat >= -90 && lat <= 90) && (lng >= -180 && lng <= 180)) return { lat, lng };
        }
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  // Create custom marker element with donor type color coding
  const createMarkerElement = (listing) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    
    // Determine if this listing belongs to the current user (donor)
    const getCurrentUserId = () => {
      try {
        if (user && user.id != null) return String(user.id);
        const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
        if (cu && (cu.id != null || cu.user_id != null || cu.sub != null)) {
          return String(cu.id ?? cu.user_id ?? cu.sub);
        }
      } catch (_) {}
      return null;
    };
    const getListingDonorId = (l) => {
      try {
        const val = (l && (
          (l.donor_id != null ? l.donor_id : null) ??
          (l.donorId != null ? l.donorId : null) ??
          (l.owner_id != null ? l.owner_id : null) ??
          (l.ownerId != null ? l.ownerId : null) ??
          (l.donor && l.donor.id != null ? l.donor.id : null)
        ));
        return val != null ? String(val) : null;
      } catch (_) { return null; }
    };
    const currentUserId = getCurrentUserId();
    const listingDonorId = getListingDonorId(listing);
    const isOwner = currentUserId && listingDonorId && (currentUserId === String(listingDonorId));

    const donorType = getDonorType(listing);
    
    // Color scheme based on donor type
    const donorTypeColors = {
      restaurant: {
        primary: '#dc2626', // Red for restaurants
        secondary: '#fca5a5',
        icon: '🍽️'
      },
      store: {
        primary: '#2563eb', // Blue for stores/markets
        secondary: '#93c5fd',
        icon: '🏪'
      },
      organization: {
        primary: '#7c3aed', // Purple for organizations
        secondary: '#c4b5fd',
        icon: '🏢'
      },
      personal: {
        primary: '#10b981', // Green for personal donors
        secondary: '#6ee7b7',
        icon: '🏠'
      }
    };
    
    // Use status for availability, but donor type for base color
    const colors = donorTypeColors[donorType] || donorTypeColors.personal;
    const isAvailable = listing.status === 'available';
    const primaryColor = isAvailable ? colors.primary : '#6b7280';
    const borderColor = isAvailable ? colors.secondary : '#9ca3af';
    
    const categoryIcons = {
      produce: '🥬',
      prepared: '🍽️',
      packaged: '📦',
      bakery: '🍞',
      seafood: '🐟',
      baby_food: '🍼',
      catering: '🎂',
      international: '🌍',
      beverages: '💧'
    };
    
    // Owner outline uses subtle blue ring outside the existing border
    const ownerBoxShadow = isOwner
      ? '0 0 0 2px rgba(59,130,246,0.9), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
      : '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)';

    el.innerHTML = `
      <div style="
        width: 36px;
        height: 46px;
        background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
        border: 3px solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: ${ownerBoxShadow};
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          font-size: 16px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">${categoryIcons[listing.category] || '🍴'}</div>
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 16px;
          height: 16px;
          background: ${colors.primary};
          border: 2px solid white;
          border-radius: 50%;
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${colors.icon}</div>
      </div>
    `;
    
    el.addEventListener('mouseenter', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'rotate(-45deg) scale(1.15)';
          el.firstChild.style.filter = 'brightness(1.1)';
        }
      } catch (error) {
        console.error('Marker hover error:', error);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      try {
        if (el.firstChild && el.firstChild.style) {
          el.firstChild.style.transform = 'rotate(-45deg) scale(1)';
          el.firstChild.style.filter = 'brightness(1)';
        }
      } catch (error) {
        console.error('Marker leave error:', error);
      }
    });
    
    return el;
  };

  // Update individual markers
  const updateMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Get current listings from a single source: prefer window snapshot, fallback to props
    let sourceListingsRaw = [];
    try {
      const snapshot = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []);
      sourceListingsRaw = (Array.isArray(snapshot) && snapshot.length) ? snapshot : (safeListings || []);
    } catch (e) {
      sourceListingsRaw = safeListings || [];
    }

    // Deduplicate by stable key to avoid duplicate markers
    const seen = new Set();
    const currentListings = [];
    for (const listing of sourceListingsRaw) {
      const key = (listing && (listing.id || listing.objectId || (listing.title && listing.address && `${listing.title}|${listing.address}`))) || Math.random().toString(36).slice(2);
      if (!seen.has(key)) {
        seen.add(key);
        currentListings.push(listing);
      }
    }

    console.log('Updating markers with listings:', currentListings.length);

    // Schedule geocoding for listings that lack coordinates.
    // Use a small in-memory in-flight map on the map instance to avoid duplicates.
    try {
      if (!map.current._geocodeInFlight) map.current._geocodeInFlight = new Map();
      if (!map.current._lastGeocodeTrigger) map.current._lastGeocodeTrigger = 0;

      currentListings.forEach(listing => {
        if (!resolveCoords(listing) && listing && listing.address) {
          const key = listing.id || listing.objectId || listing.title || listing.address;
          if (!map.current._geocodeInFlight.has(key)) {
            map.current._geocodeInFlight.set(key, true);
            window.geocodeAddressCached(listing.address).then(result => {
              map.current._geocodeInFlight.delete(key);
              if (result && result.coordinates && Array.isArray(result.coordinates)) {
                const lat = parseFloat(result.coordinates[1]);
                const lng = parseFloat(result.coordinates[0]);
                if (!isNaN(lat) && !isNaN(lng)) {
                  // Update snapshot on window.databaseService if present
                  try {
                    if (window.databaseService && Array.isArray(window.databaseService.listings)) {
                      const idx = window.databaseService.listings.findIndex(l => (l.id && l.id === listing.id) || (l.objectId && l.objectId === listing.objectId) || (l.title && l.title === listing.title && l.address === listing.address));
                      if (idx !== -1) {
                        window.databaseService.listings[idx] = { ...window.databaseService.listings[idx], coords: { lat, lng } };
                      }
                    }
                  } catch (e) { /* ignore */ }

                  // Update the passed-in listing object as well
                  try { listing.coords = { lat, lng }; } catch (e) { /* ignore */ }

                  // Debounced refresh of markers
                  const now = Date.now();
                  if (now - map.current._lastGeocodeTrigger > 300) {
                    map.current._lastGeocodeTrigger = now;
                    setTimeout(() => {
                      try { updateMarkers(); fitMapToListings(); } catch (e) { /* ignore */ }
                    }, 250);
                  }
                }
              }
            }).catch(err => {
              map.current._geocodeInFlight.delete(key);
              console.error('Geocode failed for', listing.address, err);
            });
          }
        }
      });
    } catch (e) { console.error('Geocode scheduling error:', e); }

    // Per-listing emoji markers with slight offset for identical-address items
    const normalizeAddress = (addr) => (typeof addr === 'string' ? addr.trim().toLowerCase() : null);
    const groupsByKey = new Map();
    currentListings.forEach(l => {
      const c = resolveCoords(l);
      if (!c) return;
      const key = normalizeAddress(l.address) || `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;
      if (!groupsByKey.has(key)) groupsByKey.set(key, []);
      groupsByKey.get(key).push(l);
    });

    // Deterministic offset function for items in same group
    const toRadians = (deg) => deg * Math.PI / 180;
    const offsetCoords = (base, index, total) => {
      if (total <= 1) return base;
      const radius = 0.00012; // ~10-15m
      const angle = (2 * Math.PI * index) / total;
      const latOffset = radius * Math.sin(angle);
      const lngOffset = radius * Math.cos(angle) / Math.cos(toRadians(base.lat || base[1] || 0));
      return { lat: base.lat + latOffset, lng: base.lng + lngOffset };
    };

    for (const [key, arr] of groupsByKey) {
      // Stable order by id for deterministic offsets
      const sorted = arr.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
      sorted.forEach((listing, idx) => {
        const coords = resolveCoords(listing);
        if (!coords) return;
        const adjusted = offsetCoords(coords, idx, sorted.length);
        const el = createMarkerElement(listing);
        const marker = new mapboxgl.Marker(el).setLngLat([adjusted.lng, adjusted.lat]).addTo(map.current);
        el.addEventListener('click', () => {
          // Ensure only the latest popup is visible
          try { if (map.current && map.current._lastListingPopup) map.current._lastListingPopup.remove(); } catch (e) {}
          const canClaim = user && user.role === 'recipient' && listing.status === 'available';
          const statusBadgeClass = listing.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                                listing.status === 'claimed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-gray-100 text-gray-800 border-gray-200';
          const getPerishabilityInfo = (level) => {
            switch (level) { case 'high': return { text: 'High - Consume within hours', color: 'text-red-600' }; case 'medium': return { text: 'Medium - Consume within days', color: 'text-yellow-600' }; case 'low': return { text: 'Low - Shelf stable', color: 'text-green-600' }; default: return { text: 'Not specified', color: 'text-gray-600' }; }
          };
          const perishabilityInfo = getPerishabilityInfo(listing.perishability);
          const donorType = getDonorType(listing);
          const donorTypeLabels = { restaurant: 'Restaurant/Café', store: 'Store/Market', organization: 'Organization', personal: 'Personal Donor' };
          const donorTypeColors = { restaurant: 'bg-red-100 text-red-800 border-red-200', store: 'bg-blue-100 text-blue-800 border-blue-200', organization: 'bg-purple-100 text-purple-800 border-purple-200', personal: 'bg-green-100 text-green-800 border-green-200' };
          const popupHTML = `
            <div class="p-5 min-w-0 max-w-sm">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div class="flex items-center space-x-2">
                  <div class="icon-info text-lg text-blue-600"></div>
                  <h3 class="font-bold text-base text-gray-900">Food Listing Details</h3>
                </div>
              </div>
              <div class="mb-4">
                <h4 class="font-bold text-lg text-gray-900 mb-2">${listing.title}</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full border ${statusBadgeClass}">${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</span>
                  <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full border ${donorTypeColors[donorType]}">${donorTypeLabels[donorType]}</span>
                </div>
              </div>
              <div class="mb-4">
                <h5 class="font-semibold text-gray-900 mb-3">Food Information</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center py-1"><span class="text-gray-600">Category:</span><span class="font-medium text-gray-900 capitalize">${listing.category}</span></div>
                  <div class="flex justify-between items-center py-1"><span class="text-gray-600">Quantity:</span><span class="font-medium text-gray-900">${listing.qty} ${listing.unit}</span></div>
                  <div class="flex justify-between items-center py-1"><span class="text-gray-600">Perishability:</span><span class="font-medium ${perishabilityInfo.color}">${perishabilityInfo.text}</span></div>
                </div>
              </div>
              <div class="flex gap-2">
                ${canClaim ? `<button onclick="window.claimFromMap('${listing.id}')" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors whitespace-nowrap flex items-center justify-center"><div class="icon-shopping-bag text-sm mr-1"></div>Claim</button>` : ''}
                <button onclick="window.selectFromMap('${listing.id}')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center"><div class="icon-eye text-sm mr-1"></div>Show Details</button>
              </div>
            </div>`;
          try { if (map.current && map.current._lastListingPopup) map.current._lastListingPopup.remove(); } catch (e) {}
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, closeOnClick: false, className: 'food-listing-popup' })
            .setLngLat([adjusted.lng, adjusted.lat])
            .setHTML(popupHTML)
            .addTo(map.current);
          map.current._lastListingPopup = popup;
        });
        markersRef.current.push(marker);
      });
    }

    // Keep distribution centers, stores, and kiosks as custom DOM markers
    distributionCenters
      .filter(center => center && center.coords)
      .forEach(center => {
        const markerElement = createDistributionCenterElement(center);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([center.coords.lng, center.coords.lat])
          .addTo(map.current);

        // Add click handler for distribution center
        markerElement.addEventListener('click', () => {
          const popupHTML = `
            <div class="p-4 min-w-0">
              <div class="flex items-start mb-3 gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span class="text-lg">🏪</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-sm break-words">${center.name}</h3>
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">Distribution Center</span>
                </div>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">📍</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${center.address}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">🕒</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${center.hours}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">📞</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${center.contact}</span>
                </div>
              </div>
              
              <div class="mt-4">
                <p class="text-xs text-gray-500 mb-2 font-medium">Services:</p>
                <div class="flex flex-wrap gap-1 mb-3">
                  ${center.services.map(service => 
                    `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap">${service}</span>`
                  ).join('')}
                </div>
                
                <div class="flex flex-col gap-2">
                  <button onclick="window.viewDistributionCenterMenu('${center.id}')" class="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                    Available Food
                  </button>
                  <button onclick="window.getDistributionCenterDirections('${center.id}')" class="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          `;

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'distribution-center-popup'
          })
            .setLngLat([center.coords.lng, center.coords.lat])
            .setHTML(popupHTML)
            .addTo(map.current);
        });

        markersRef.current.push(marker);
      });

    // Add DoGoods store markers
    doGoodsStores
      .filter(store => store && store.coords)
      .forEach(store => {
        const markerElement = createDoGoodsStoreElement(store);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([store.coords.lng, store.coords.lat])
          .addTo(map.current);

        // Add click handler for DoGoods store
        markerElement.addEventListener('click', () => {
          const popupHTML = `
            <div class="p-4 min-w-0">
              <div class="flex items-start mb-3 gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <span class="text-lg">🏪</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-sm break-words">${store.name}</h3>
                  <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full whitespace-nowrap">${store.participation_level}</span>
                </div>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">📍</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${store.address}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">🕒</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${store.hours}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">📞</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${store.contact}</span>
                </div>
              </div>
              
              <div class="mt-4">
                <p class="text-xs text-gray-500 mb-2 font-medium">Services:</p>
                <div class="flex flex-wrap gap-1 mb-3">
                  ${store.services.map(service => 
                    `<span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded whitespace-nowrap">${service}</span>`
                  ).join('')}
                </div>
                
                <div class="flex flex-col gap-2">
                  <button onclick="window.getStoreDirections('${store.id}')" class="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
                    Get Directions
                  </button>
                  <div class="text-xs text-gray-500 mt-2 text-center">
                    Partner store - Visit for DoGoods services
                  </div>
                </div>
              </div>
            </div>
          `;

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'dogoods-store-popup'
          })
            .setLngLat([store.coords.lng, store.coords.lat])
            .setHTML(popupHTML)
            .addTo(map.current);
        });

        markersRef.current.push(marker);
      });

    // Add DoGoods kiosk markers
    doGoodsKiosks
      .filter(kiosk => kiosk && kiosk.coords)
      .forEach(kiosk => {
        const markerElement = createDoGoodsKioskElement(kiosk);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([kiosk.coords.lng, kiosk.coords.lat])
          .addTo(map.current);

        // Add click handler for DoGoods kiosk
        markerElement.addEventListener('click', () => {
          const popupHTML = `
            <div class="p-4 min-w-0">
              <div class="flex items-start mb-3 gap-3">
                <div class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                  <span class="text-lg">🖥️</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-sm break-words">${kiosk.name}</h3>
                  <span class="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full whitespace-nowrap">Food Access Kiosk</span>
                </div>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">📍</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${kiosk.address}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 shrink-0">🕒</span>
                  <span class="text-gray-700 break-words flex-1 min-w-0">${kiosk.hours}</span>
                </div>
              </div>
              
              <div class="mt-4">
                <p class="text-xs text-gray-500 mb-2 font-medium">Services:</p>
                <div class="flex flex-wrap gap-1 mb-3">
                  ${kiosk.services.map(service => 
                    `<span class="text-xs bg-cyan-100 text-cyan-600 px-2 py-1 rounded whitespace-nowrap">${service}</span>`
                  ).join('')}
                </div>
                <p class="text-xs text-gray-500 mb-1 font-medium">Languages:</p>
                <div class="flex flex-wrap gap-1">
                  ${kiosk.languages.map(lang => 
                    `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap">${lang}</span>`
                  ).join('')}
                </div>
              </div>
            </div>
          `;

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'dogoods-kiosk-popup'
          })
            .setLngLat([kiosk.coords.lng, kiosk.coords.lat])
            .setHTML(popupHTML)
            .addTo(map.current);
        });

        markersRef.current.push(marker);
      });

  // Removed duplicate fallback path to prevent inconsistent popups and duplicates
  };

  // Fit map to show all listings, distribution centers, stores and kiosks
  const fitMapToListings = () => {
    const currentListings = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : (safeListings || []));
    const currentCenters = window.mockDistributionCenters || distributionCenters || [];
    const currentStores = window.mockDoGoodsStores || doGoodsStores || [];
    const currentKiosks = window.mockDoGoodsKiosks || doGoodsKiosks || [];
    
    const hasAnyData = currentListings.length > 0 || currentCenters.length > 0 || 
                      currentStores.length > 0 || currentKiosks.length > 0;
    
    // Don't auto-fit if user has interacted with the map
    if (!map.current || !hasAnyData) {
      return;
    }
    
    // Check if user has interacted with map controls
    if (map.current.userHasInteracted && map.current.userHasInteracted()) {
      console.log('User has interacted with map, skipping auto-fit');
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidBounds = false;
    const extendIfValid = (lat, lng) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
      bounds.extend([lng, lat]);
      return true;
    };

    // Include food listings - priority for positioning
    currentListings.forEach(listing => {
      const coords = resolveCoords(listing);
      if (coords && extendIfValid(coords.lat, coords.lng)) {
        hasValidBounds = true;
      }
    });
    
    // Include distribution centers
    currentCenters.forEach(center => {
      if (center.coords && center.coords.lat && center.coords.lng) {
        bounds.extend([center.coords.lng, center.coords.lat]);
        hasValidBounds = true;
      }
    });

    // Include DoGoods stores
    currentStores.forEach(store => {
      if (store.coords && store.coords.lat && store.coords.lng) {
        bounds.extend([store.coords.lng, store.coords.lat]);
        hasValidBounds = true;
      }
    });

    // Include DoGoods kiosks
    currentKiosks.forEach(kiosk => {
      if (kiosk.coords && kiosk.coords.lat && kiosk.coords.lng) {
        bounds.extend([kiosk.coords.lng, kiosk.coords.lat]);
        hasValidBounds = true;
      }
    });

    if (hasValidBounds) {
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 16,
          duration: 1000
        });
      } catch (err) {
        console.error('fitBounds failed, falling back to center', err);
        // fallback to safe center
        if (userLocation && userLocation.lat && userLocation.lng) {
          map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13, duration: 1000 });
        }
      }
    } else {
      // Fallback to user location or Alameda center if no valid bounds
      if (userLocation && userLocation.lat && userLocation.lng) {
        map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13, duration: 1000 });
      } else {
        map.current.flyTo({ center: [-122.2416, 37.7652], zoom: 13, duration: 1000 });
      }
    }
  };

  // Expose a global recenter function so other parts of the app can force a fit
  React.useEffect(() => {
    window.recenterMap = () => {
      try {
        if (!map.current) return;
        // Temporarily bypass user interaction flag and fit
        const originalUserHasInteracted = map.current.userHasInteracted ? map.current.userHasInteracted() : false;
        // Call fitMapToListings directly
        fitMapToListings();
        return true;
      } catch (err) {
        console.error('recenterMap failed', err);
        return false;
      }
    };

    return () => {
      try { delete window.recenterMap; } catch (e) {}
    };
  }, [mapLoaded, safeListings, distributionCenters, doGoodsStores, doGoodsKiosks]);

  // Update markers when data changes
  React.useEffect(() => {
    if (!mapLoaded || !map.current) return;

    console.log('Updating markers on map:', safeListings.length, 'listings,', distributionCenters.length, 'centers,', doGoodsStores.length, 'stores,', doGoodsKiosks.length, 'kiosks');
    
  // Get latest data from window globals (snapshot)
  const currentListings = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : (safeListings || []));
    const currentCenters = window.mockDistributionCenters || distributionCenters;
    const currentStores = window.mockDoGoodsStores || doGoodsStores;
    const currentKiosks = window.mockDoGoodsKiosks || doGoodsKiosks;
    
    console.log('Using current data:', currentListings.length, 'listings');
    
    // Always update markers when data changes
    updateMarkers();

    // Only auto-fit if user hasn't interacted with the map
    const hasAnyData = currentListings.length > 0 || currentCenters.length > 0 || 
                      currentStores.length > 0 || currentKiosks.length > 0;
    if (hasAnyData) {
      // Add slight delay to ensure markers are rendered
      setTimeout(() => {
        fitMapToListings();
      }, 100);
    }

  }, [mapLoaded, safeListings, distributionCenters, doGoodsStores, doGoodsKiosks]);
  
  // Force refresh when window data is available - but only fit once on initial load
  React.useEffect(() => {
    let hasFitted = false;
    
    const checkForData = () => {
      const snapshot = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []);
      if (snapshot && snapshot.length > 0 && mapLoaded && !hasFitted) {
        console.log('Found listings snapshot:', snapshot.length);
        updateMarkers();
        // Only auto-fit on initial data load, not after user interaction
        if (!map.current.userHasInteracted || !map.current.userHasInteracted()) {
          setTimeout(() => {
            fitMapToListings();
            hasFitted = true;
          }, 200);
        } else {
          hasFitted = true; // Mark as fitted even if we skip it due to user interaction
        }
      }
    };
    
    // Check immediately and then only a few times
    checkForData();
    const timeout = setTimeout(checkForData, 1000);
    
    return () => clearTimeout(timeout);
  }, [mapLoaded]);

  // Handle window resize and cleanup
  React.useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup mobile-specific listeners
      if (map.current && map.current._mobileCleanup) {
        map.current._mobileCleanup();
      }
    };
  }, []);

  try {
    // Show fallback if Mapbox is not available
    if (window.MAPBOX_AVAILABLE === false) {
      return (
        <div className="h-full flex items-center justify-center bg-[var(--surface)]">
          <div className="text-center p-8 max-w-md">
            <div className="icon-map text-4xl text-[var(--primary-color)] mb-4"></div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Mapbox Setup Required</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              To display the interactive map, you need to configure your Mapbox access token.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://www.mapbox.com/" target="_blank" className="underline">mapbox.com</a> and create a free account</li>
                <li>Get your access token from the account dashboard</li>
                <li>Open <code className="bg-blue-100 px-1 rounded">utils/mapbox.js</code></li>
                <li>Replace <code className="bg-blue-100 px-1 rounded">YOUR_MAPBOX_TOKEN_HERE</code> with your actual token</li>
              </ol>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Reload After Setup
            </button>
            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              {safeListings.length} food listings available in sidebar
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative flex flex-col" data-name="map-component" data-file="components/Map.js">
        <div ref={mapContainer} className="w-full flex-1 min-h-[300px]" />
        <MapListView 
          listings={safeListings}
          onListingSelect={onListingSelect}
          onClaimListing={(listingId) => {
            if (window.handleClaimListing) {
              window.handleClaimListing(listingId);
            }
          }}
          user={user}
        />
      </div>
    );
  } catch (error) {
    console.error('MapComponent render error:', error);
    return (
      <div className="h-full flex items-center justify-center bg-[var(--surface)]">
        <div className="text-center">
          <div className="icon-alert-triangle text-3xl text-red-500 mb-2"></div>
          <p className="text-[var(--text-secondary)]">Map failed to load</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">Check console for details</p>
        </div>
      </div>
    );
  }
}