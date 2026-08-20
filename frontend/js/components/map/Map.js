function getEffectiveStatusFromListing(listing) {
  try {
    if (typeof window !== 'undefined' && typeof window.getEffectiveListingStatus === 'function') {
      return String(window.getEffectiveListingStatus(listing) || '').toLowerCase();
    }
  } catch (_) {
    // Fall through to local calculation.
  }

  const rawStatus = String(listing?.status || '').toLowerCase();
  if (rawStatus && rawStatus !== 'available') return rawStatus;

  const toTimestamp = (value) => {
    if (!value) return null;
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : null;
  };

  const deadlines = [
    toTimestamp(listing?.pickup_window_end),
    toTimestamp(listing?.expiration_date)
  ].filter((value) => value != null);

  if (deadlines.length && Math.min(...deadlines) <= Date.now()) return 'expired';
  return rawStatus || 'available';
}

// Food Maps operates in the SF Bay Area. Far-away / placeholder coords
// (0,0 or out-of-region pins) must not yank the default camera away.
const BAY_AREA_CENTER = Object.freeze([-122.2711, 37.8044]); // Oakland / inner East Bay
const BAY_AREA_DEFAULT_ZOOM = 10;
const BAY_AREA_BOUNDS = Object.freeze({
  minLat: 36.8,
  maxLat: 38.6,
  minLng: -123.2,
  maxLng: -121.4,
});

function parseMapCoord(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function isValidMapCoords(lat, lng) {
  const latitude = parseMapCoord(lat);
  const longitude = parseMapCoord(lng);
  if (latitude == null || longitude == null) return false;
  // Reject Null Island / missing geocodes stored as 0,0.
  if (Math.abs(latitude) < 0.01 && Math.abs(longitude) < 0.01) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  return true;
}

function isInBayArea(lat, lng) {
  if (!isValidMapCoords(lat, lng)) return false;
  const latitude = parseMapCoord(lat);
  const longitude = parseMapCoord(lng);
  return (
    latitude >= BAY_AREA_BOUNDS.minLat &&
    latitude <= BAY_AREA_BOUNDS.maxLat &&
    longitude >= BAY_AREA_BOUNDS.minLng &&
    longitude <= BAY_AREA_BOUNDS.maxLng
  );
}

// Map legend categories for distribution centers (pin color + label).
const MAP_LEGEND_PROVIDER_TYPES = Object.freeze([
  {
    label: 'Schools',
    color: '#4f46e5',
    match: ['schools', 'school meal program', 'school food distribution'],
  },
  {
    label: 'Food Pantry',
    color: '#d97706',
    match: ['food pantry'],
  },
  {
    label: 'Food Rescue',
    color: '#0d9488',
    match: ['food rescue'],
  },
  {
    label: 'Community Garden',
    color: '#15803d',
    match: ['community garden'],
  },
  {
    label: 'Foodbank',
    color: '#b91c1c',
    match: ['foodbank', 'food bank'],
  },
  {
    label: 'Mobile Food Pantry',
    color: '#ea580c',
    match: ['mobile food pantry'],
  },
  {
    label: 'Food Delivery',
    color: '#0284c7',
    match: ['food delivery', 'home delivery'],
  },
]);

const MAP_LEGEND_DEFAULT_CENTER_COLOR = '#10b981';

function parseCenterProviderTypes(raw) {
  if (typeof window.parseProviderTypes === 'function') {
    return window.parseProviderTypes(raw);
  }
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch (_) { /* ignore */ }
  return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
}

function getCenterLegendColor(center) {
  const types = parseCenterProviderTypes(center?.provider_types)
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);
  if (!types.length) return MAP_LEGEND_DEFAULT_CENTER_COLOR;

  for (const entry of MAP_LEGEND_PROVIDER_TYPES) {
    if (entry.match.some((m) => types.includes(m))) return entry.color;
  }
  return MAP_LEGEND_DEFAULT_CENTER_COLOR;
}

function flyToBayArea(mapInstance, duration = 0) {
  if (!mapInstance) return;
  try {
    mapInstance.flyTo({
      center: BAY_AREA_CENTER.slice(),
      zoom: BAY_AREA_DEFAULT_ZOOM,
      duration,
      essential: true,
    });
  } catch (_) { /* ignore */ }
}

function MapComponent({ listings = [], selectedListing, onListingSelect, user }) {
  const mapContainer = React.useRef(null);
  const map = React.useRef(null);
  const markersRef = React.useRef([]);
  const mapInitAttemptsRef = React.useRef(0);
  const mapInitTimerRef = React.useRef(null);
  const mapResizeObserverRef = React.useRef(null);
  const safeListings = Array.isArray(listings) ? listings : [];
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [mapInitError, setMapInitError] = React.useState(null);
  const [centers, setCenters] = React.useState([]);
  const [showCenterModal, setShowCenterModal] = React.useState(false);
  const [selectedCenter, setSelectedCenter] = React.useState(null);
  const [centerInventory, setCenterInventory] = React.useState([]);
  const userRole = React.useMemo(() => {
    const fromUser = user?.role != null ? String(user.role).toLowerCase() : '';
    if (fromUser) return fromUser;
    try {
      const stored = JSON.parse(localStorage.getItem('current_user') || 'null');
      return stored?.role ? String(stored.role).toLowerCase() : '';
    } catch (_) {
      return '';
    }
  }, [user]);
  const currentUserId = React.useMemo(() => {
    if (user?.id != null) return String(user.id);
    if (user?.user_id != null) return String(user.user_id);
    if (user?.sub != null) return String(user.sub);
    try {
      const stored = JSON.parse(localStorage.getItem('current_user') || 'null');
      const sid = stored?.id ?? stored?.user_id ?? stored?.sub;
      if (sid != null) return String(sid);
    } catch (_) { }
    return null;
  }, [user]);
  const showDistributionCenters = userRole !== 'donor';
  const visibleCenters = React.useMemo(
    () => (showDistributionCenters ? centers : []),
    [showDistributionCenters, centers]
  );
  const getListingDonorId = React.useCallback((listing) => {
    const donorId = listing?.donor_id ?? listing?.donorId ?? listing?.owner_id ?? listing?.ownerId ?? listing?.donor?.id;
    return donorId != null ? String(donorId) : null;
  }, []);

  // Global function to add/remove favorites from map popups
  React.useEffect(() => {
    window.toggleMapFavorite = async (type, id) => {
      if (!user) {
        if (typeof window.showAlert === 'function') window.showAlert('Please sign in to save favorites', { variant: 'error' });
        return;
      }

      if (type === 'donor' && userRole === 'donor' && currentUserId) {
        const listing = safeListings.find((item) => String(item.id) === String(id));
        const donorId = listing ? getListingDonorId(listing) : null;
        if (!donorId || donorId === currentUserId) {
          if (typeof window.showAlert === 'function') {
            window.showAlert('You cannot favorite your own listing.', { variant: 'error' });
          }
          return;
        }
      }

      const result = await window.databaseService.getFavorites();
      if (result.success) {
        const fav = result.favorites.find(f => f.location_type === type && String(f.location_id) === String(id));
        if (fav) {
          await window.databaseService.removeFavorite(fav.id);
          if (typeof window.showAlert === 'function') window.showAlert('Removed from favorites', { variant: 'success' });
        } else {
          await window.databaseService.addFavorite(type, id);
          if (typeof window.showAlert === 'function') window.showAlert('Added to favorites', { variant: 'success' });
        }
      }
    };
    return () => { delete window.toggleMapFavorite; };
  }, [user, userRole, currentUserId, safeListings, getListingDonorId]);

  // Load distribution centers
  React.useEffect(() => {
    if (showDistributionCenters) {
      loadDistributionCenters();
    } else {
      setCenters([]);
      setShowCenterModal(false);
      setSelectedCenter(null);
      setCenterInventory([]);
    }

    // Set up global function for popup buttons to trigger the detail modal
    window.handleListingDetailsClick = (listingId) => {
      const listing = safeListings.find(l => l.id === listingId);
      if (listing) {
        // First update the selected listing
        if (onListingSelect) {
          onListingSelect(listing);
        }
        // Then trigger the modal via global function (set in app.js)
        if (window.triggerListingDetailModal) {
          window.triggerListingDetailModal(listing);
        }
      }
    };

    return () => {
      delete window.handleListingDetailsClick;
    };
  }, [safeListings, onListingSelect, showDistributionCenters]);

  const loadDistributionCenters = async () => {
    if (!showDistributionCenters) {
      setCenters([]);
      return;
    }

    try {
      console.log('Loading distribution centers...');
      const response = await fetch('/api/centers');
      console.log('Centers response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded distribution centers:', data);
        setCenters(data);
      } else {
        console.error('Failed to load centers:', response.status);
      }
    } catch (error) {
      console.error('Error loading distribution centers:', error);
    }
  };

  React.useEffect(() => {
    let isUnmounted = false;

    const clearInitTimer = () => {
      if (mapInitTimerRef.current) {
        clearTimeout(mapInitTimerRef.current);
        mapInitTimerRef.current = null;
      }
    };

    const initializeMap = () => {
      if (isUnmounted || map.current || !mapContainer.current) return;

      if (typeof mapboxgl === 'undefined') {
        mapInitAttemptsRef.current += 1;
        if (mapInitAttemptsRef.current <= 20) {
          mapInitTimerRef.current = setTimeout(initializeMap, 150);
        } else {
          setMapInitError('Map failed to load. Please refresh the page.');
          console.warn('Mapbox not available after retries');
        }
        return;
      }

      try {
        setMapInitError(null);
        mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: BAY_AREA_CENTER.slice(),
          zoom: BAY_AREA_DEFAULT_ZOOM,
          minZoom: 3,
          maxZoom: 18,
          attributionControl: true, // Keep attribution but we'll style it smaller
          logoPosition: 'bottom-left'
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: false
          }),
          'top-right'
        );

        // Wait for first idle frame to avoid rendering a blank canvas as "loaded".
        map.current.once('idle', () => {
          if (isUnmounted) return;
          setMapLoaded(true);
          try {
            map.current && map.current.resize();
          } catch (_) {
            // Ignore resize failures during startup race conditions.
          }
        });

        map.current.on('error', (event) => {
          const message = event?.error?.message;
          if (message) {
            console.error('Map runtime error:', message);
          }
        });

      } catch (error) {
        console.error('Map initialization error:', error);
        setMapInitError('Map failed to initialize. Please refresh the page.');
      }
    };

    initializeMap();

    const handleResize = () => {
      if (!map.current) return;
      try {
        map.current.resize();
      } catch (_) {
        // Ignore transient resize issues.
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (typeof ResizeObserver !== 'undefined' && mapContainer.current) {
      mapResizeObserverRef.current = new ResizeObserver(() => handleResize());
      mapResizeObserverRef.current.observe(mapContainer.current);
    }

    return () => {
      isUnmounted = true;
      clearInitTimer();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mapResizeObserverRef.current) {
        mapResizeObserverRef.current.disconnect();
        mapResizeObserverRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Listen for AI-driven flyTo requests (e.g. after the user posts a new
  // listing through the chatbot). This gives unmistakable visual proof
  // that the post is on the map by centering on it and zooming in.
  React.useEffect(() => {
    const handler = (event) => {
      try {
        const detail = event && event.detail;
        if (!detail) return;
        const lat = parseFloat(detail.lat);
        const lng = parseFloat(detail.lng);
        const zoom = Number.isFinite(parseFloat(detail.zoom)) ? parseFloat(detail.zoom) : 15;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (!map.current) return;
        // Defer slightly so the marker effect (keyed on safeListings) has
        // a chance to render the newly-fetched marker before we fly to it.
        setTimeout(() => {
          try {
            map.current && map.current.flyTo({
              center: [lng, lat],
              zoom,
              duration: 1200,
              essential: true,
            });
          } catch (_) { /* ignore */ }
        }, 150);
      } catch (_) { /* ignore */ }
    };
    window.addEventListener('foodmaps:fly_to', handler);
    return () => window.removeEventListener('foodmaps:fly_to', handler);
  }, []);

  // Listen for AI-driven route-drawing requests. The chat assistant
  // dispatches `foodmaps:show_route` after calling the
  // show_route_to_listing tool. We render the route as a blue line on
  // a dedicated GeoJSON source so re-issuing the event simply replaces
  // the previous path. Two helper markers (origin = green, destination
  // = red) make the endpoints obvious, and we fit both into view.
  React.useEffect(() => {
    const SOURCE_ID = 'ai-route-source';
    const LAYER_ID = 'ai-route-layer';
    const LAYER_CASING_ID = 'ai-route-casing-layer';
    let originMarker = null;
    let destMarker = null;

    const clearRoute = () => {
      try {
        const m = map.current;
        if (!m) return;
        if (m.getLayer(LAYER_ID)) m.removeLayer(LAYER_ID);
        if (m.getLayer(LAYER_CASING_ID)) m.removeLayer(LAYER_CASING_ID);
        if (m.getSource(SOURCE_ID)) m.removeSource(SOURCE_ID);
      } catch (_) { /* ignore */ }
      try { if (originMarker) originMarker.remove(); } catch (_) {}
      try { if (destMarker) destMarker.remove(); } catch (_) {}
      originMarker = null;
      destMarker = null;
    };

    const drawRoute = (route) => {
      const m = map.current;
      if (!m || !route || !route.geometry) return;
      const origin = route.origin || {};
      const dest = route.destination || {};
      const oLng = parseFloat(origin.lng);
      const oLat = parseFloat(origin.lat);
      const dLng = parseFloat(dest.lng);
      const dLat = parseFloat(dest.lat);
      if (!Number.isFinite(oLng) || !Number.isFinite(oLat) ||
          !Number.isFinite(dLng) || !Number.isFinite(dLat)) return;

      const apply = () => {
        clearRoute();
        try {
          m.addSource(SOURCE_ID, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            },
          });
          // Casing (white outline) for contrast against any basemap.
          m.addLayer({
            id: LAYER_CASING_ID,
            type: 'line',
            source: SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 0.9,
            },
          });
          m.addLayer({
            id: LAYER_ID,
            type: 'line',
            source: SOURCE_ID,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: Object.assign(
              {
                'line-color': route.fallback ? '#6b7280' : '#2563eb',
                'line-width': 5,
                'line-opacity': 0.95,
              },
              route.fallback ? { 'line-dasharray': [2, 1.5] } : {},
            ),
          });
        } catch (err) {
          console.warn('Failed to draw AI route:', err);
        }
        try {
          if (typeof window !== 'undefined' && window.mapboxgl) {
            originMarker = new window.mapboxgl.Marker({ color: '#16a34a' })
              .setLngLat([oLng, oLat])
              .setPopup(new window.mapboxgl.Popup({ offset: 18 }).setText('You'))
              .addTo(m);
            const destLabel = dest.title
              || (dest.listing_id != null ? `Listing #${dest.listing_id}` : 'Pickup');
            destMarker = new window.mapboxgl.Marker({ color: '#dc2626' })
              .setLngLat([dLng, dLat])
              .setPopup(new window.mapboxgl.Popup({ offset: 18 }).setText(destLabel))
              .addTo(m);
          }
        } catch (_) { /* ignore */ }
        try {
          const bounds = new window.mapboxgl.LngLatBounds([oLng, oLat], [oLng, oLat]);
          (route.geometry.coordinates || []).forEach((c) => {
            if (Array.isArray(c) && c.length >= 2) bounds.extend([c[0], c[1]]);
          });
          bounds.extend([dLng, dLat]);
          m.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom: 15 });
        } catch (_) { /* ignore */ }
      };

      // Robust readiness check: 'load' only fires once during init, so
      // a route dispatched AFTER load (e.g. the user requests a second
      // route) must run apply() right away if the style is already up.
      const styleReady = (typeof m.isStyleLoaded === 'function' && m.isStyleLoaded())
        || (typeof m.loaded === 'function' && m.loaded());
      if (styleReady) {
        apply();
      } else {
        // Run apply once on the next 'load' OR 'idle' (whichever fires
        // first); a guard makes sure we don't draw twice.
        let applied = false;
        const once = () => { if (applied) return; applied = true; apply(); };
        m.once('load', once);
        try { m.once('idle', once); } catch (_) { /* older mapbox-gl */ }
      }
    };

    const handler = (event) => {
      try {
        const detail = event && event.detail;
        if (!detail || !detail.route) return;
        drawRoute(detail.route);
      } catch (err) {
        console.warn('foodmaps:show_route handler failed:', err);
      }
    };
    const clearHandler = () => clearRoute();

    window.addEventListener('foodmaps:show_route', handler);
    window.addEventListener('foodmaps:clear_route', clearHandler);

    // If a route was queued while the Map was unmounted (e.g. the AI
    // asked for show_map + show_route in the same tick, before the
    // view-switch finished), drain it now. Use a small delay so the
    // map style has time to load on a fresh mount.
    let pendingTimer = null;
    try {
      const pending = (typeof window !== 'undefined') ? window.__foodmapsPendingRoute : null;
      if (pending && pending.route && (Date.now() - (pending.at || 0)) < 15000) {
        pendingTimer = setTimeout(() => {
          try {
            drawRoute(pending.route);
            window.__foodmapsPendingRoute = null;
          } catch (_) { /* ignore */ }
        }, 300);
      }
    } catch (_) { /* ignore */ }

    return () => {
      window.removeEventListener('foodmaps:show_route', handler);
      window.removeEventListener('foodmaps:clear_route', clearHandler);
      if (pendingTimer) { try { clearTimeout(pendingTimer); } catch (_) {} }
      clearRoute();
    };
  }, []);

  // Update markers when listings or centers change
  React.useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log('Map not ready yet. mapLoaded:', mapLoaded);
      return;
    }

    console.log('Updating markers. Listings:', safeListings.length, 'Centers:', visibleCenters.length);
    console.log('Centers data:', JSON.stringify(visibleCenters, null, 2));

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Build a coord-collision map so multiple listings posted at the
    // exact same address (a common pattern when a donor — especially via
    // the AI chatbot — posts several items from their home) don't stack
    // into a single pin. Without this, only one marker is visible and
    // the donor thinks the others "didn't post on the map".
    //
    // For each unique (lat,lng) key we record how many listings share it
    // and assign each one an index. At render time we offset every pin
    // after the first into a tight circle (~6 metres per "ring step")
    // around the true location so all of them are visible and clickable.
    const COORD_KEY = (listing) => `${Number(listing.coords_lat).toFixed(6)},${Number(listing.coords_lng).toFixed(6)}`;
    const coordGroups = new Map(); // key -> total count
    safeListings.forEach(l => {
      if (!l || !l.coords_lat || !l.coords_lng) return;
      const k = COORD_KEY(l);
      coordGroups.set(k, (coordGroups.get(k) || 0) + 1);
    });
    const coordSeenIndex = new Map(); // key -> next index to use

    // Add food listing markers (red/orange)
    safeListings.forEach(listing => {
      if (listing.coords_lat && listing.coords_lng) {
        // Check if this listing is claimed by the current user
        const isClaimedByMe = (() => {
          if (!user) return false;
          const userId = String(user.id);

          // Check recipient_id
          const recipientId = listing.recipient_id ?? listing.recipientId ?? listing.recipient?.id;
          if (recipientId && String(recipientId) === userId) return true;

          // Check localStorage fallback
          try {
            const key = `my_claimed_ids:${userId}`;
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(arr) && arr.includes(String(listing.id));
          } catch (_) {
            return false;
          }
        })();

        const borderColor = isClaimedByMe && user?.role === 'recipient' ? '#3b82f6' : 'white';
        const borderWidth = isClaimedByMe && user?.role === 'recipient' ? '4px' : '3px';

        const el = document.createElement('div');
        el.className = 'food-listing-marker';
        el.innerHTML = `
          <div style="
            background-color: #f59e0b;
            width: 35px;
            height: 35px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: ${borderWidth} solid ${borderColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">🍎</span>
          </div>
        `;

        el.addEventListener('click', () => {
          if (onListingSelect) onListingSelect(listing);
        });

        const expirationDate = listing.pickup_window_end || listing.expiration_date;
        const formattedExpiration = expirationDate ? new Date(expirationDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }) : 'N/A';

        const listingStatus = getEffectiveStatusFromListing(listing);
        const statusBgColor = (listingStatus === 'available') ? '#d1fae5' :
          (listingStatus === 'reserved' || listingStatus === 'claimed' || listingStatus === 'pending_confirmation') ? '#fef3c7' :
            (listingStatus === 'picked_up' || listingStatus === 'completed') ? '#e5e7eb' : '#fee2e2';
        const statusTextColor = (listingStatus === 'available') ? '#065f46' :
          (listingStatus === 'reserved' || listingStatus === 'claimed' || listingStatus === 'pending_confirmation') ? '#92400e' :
            (listingStatus === 'picked_up' || listingStatus === 'completed') ? '#374151' : '#991b1b';
        const statusText = listingStatus === 'pending_confirmation'
          ? 'Pending Confirmation'
          : listingStatus
            .split('_')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        const listingDonorId = getListingDonorId(listing);
        const canFavoriteListing = userRole !== 'donor' || (currentUserId && listingDonorId && listingDonorId !== currentUserId);
        const saveButtonHtml = canFavoriteListing ? `
                      <button 
                        onclick="window.toggleMapFavorite('donor', ${listing.id})"
                        style="
                          background-color: #f59e0b;
                          color: white;
                          padding: 12px 16px;
                          border-radius: 8px;
                          border: none;
                          font-size: 15px;
                          font-weight: 600;
                          cursor: pointer;
                          width: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          gap: 8px;
                          transition: background-color 0.2s;
                        "
                        onmouseover="this.style.backgroundColor='#d97706'"
                        onmouseout="this.style.backgroundColor='#f59e0b'"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Save
                      </button>
                    ` : '';

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat((() => {
            // If this listing shares its exact coords with one or more
            // siblings, distribute the pins on a small circle so each is
            // independently visible & clickable instead of stacking.
            const key = COORD_KEY(listing);
            const total = coordGroups.get(key) || 1;
            if (total <= 1) {
              return [listing.coords_lng, listing.coords_lat];
            }
            const idx = coordSeenIndex.get(key) || 0;
            coordSeenIndex.set(key, idx + 1);
            // ~0.00007 deg latitude ≈ 7.7 m; grow the ring as the group
            // gets larger so 10+ pins still don't overlap. The first pin
            // (idx 0) stays at the true location.
            if (idx === 0) {
              return [listing.coords_lng, listing.coords_lat];
            }
            const ringStep = 0.00007;
            const ring = Math.ceil(idx / 8); // 8 pins per ring, then expand
            const slotsInRing = Math.min(8, total - 1 - 8 * (ring - 1));
            const slotIdx = (idx - 1) - 8 * (ring - 1);
            const angle = (2 * Math.PI * slotIdx) / Math.max(1, slotsInRing);
            const dLat = Math.cos(angle) * ringStep * ring;
            // longitude shrinks with cos(latitude) so the visual offset
            // matches the latitude offset at this map location.
            const cosLat = Math.cos((listing.coords_lat * Math.PI) / 180) || 1;
            const dLng = (Math.sin(angle) * ringStep * ring) / cosLat;
            return [listing.coords_lng + dLng, listing.coords_lat + dLat];
          })())
          .setPopup(
            new mapboxgl.Popup({ offset: 25, maxWidth: '320px' })
              .setHTML(`
                <div style="padding: 0; min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="padding: 16px 20px;">
                    <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0; line-height: 1.3;">
                      ${listing.title}
                    </h3>
                    <div style="display: inline-block; background-color: ${statusBgColor}; color: ${statusTextColor}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
                      ${statusText}
                    </div>
                    
                    <div style="margin-top: 12px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Category:</span>
                        <span style="font-size: 14px; color: #111827; font-weight: 600; text-transform: capitalize;">${listing.category || 'N/A'}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Quantity:</span>
                        <span style="font-size: 14px; color: #111827; font-weight: 600;">${listing.qty || 0} ${listing.unit || 'items'}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Expires:</span>
                        <span style="font-size: 14px; color: #111827; font-weight: 600;">${formattedExpiration}</span>
                      </div>
                    </div>

                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                      <button 
                        onclick="window.handleListingDetailsClick(${listing.id})"
                        style="
                          background-color: #2563eb;
                          color: white;
                          padding: 12px 16px;
                          border-radius: 8px;
                          border: none;
                          font-size: 15px;
                          font-weight: 600;
                          cursor: pointer;
                          width: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          gap: 8px;
                          transition: background-color 0.2s;
                        "
                        onmouseover="this.style.backgroundColor='#1d4ed8'"
                        onmouseout="this.style.backgroundColor='#2563eb'"
                      >
                        Details
                      </button>
                      ${saveButtonHtml}
                      <button 
                        onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${listing.coords_lat},${listing.coords_lng}', '_blank')"
                        style="
                          background-color: #16a34a;
                          color: white;
                          padding: 12px 16px;
                          border-radius: 8px;
                          border: none;
                          font-size: 15px;
                          font-weight: 600;
                          cursor: pointer;
                          width: 100%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          gap: 8px;
                          transition: background-color 0.2s;
                        "
                        onmouseover="this.style.backgroundColor='#15803d'"
                        onmouseout="this.style.backgroundColor='#16a34a'"
                      >
                        Directions
                      </button>
                    </div>
                    ${isClaimedByMe && user?.role === 'recipient' ? '<div style="margin-top: 12px; padding: 8px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 13px; font-weight: 600; text-align: center;">Claimed by you</div>' : ''}
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      }
    });

    // Add distribution center markers colored by provider type (see legend)
    console.log('Adding', visibleCenters.length, 'distribution center markers');
    visibleCenters.forEach((center) => {
      if (!center.coords_lat || !center.coords_lng) {
        console.warn('Skipping center with missing coordinates:', center.name);
        return;
      }

      const color = getCenterLegendColor(center);

      console.log('Adding center marker:', center.name, 'at', center.coords_lat, center.coords_lng, 'with color:', color);
      const el = document.createElement('div');
      el.className = 'distribution-center-marker';
      el.innerHTML = `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 20px;">🏪</span>
        </div>
      `;

      el.addEventListener('click', () => handleCenterClick(center));

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([center.coords_lng, center.coords_lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px; color: ${color};">🏪 ${center.name}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${center.address}</p>
                ${center.phone ? `<p style="font-size: 11px; color: #666;">Phone: ${center.phone}</p>` : ''}
                ${center.availability ? `<p style="font-size: 11px; color: #065f46; margin-bottom: 4px;">${(window.formatCenterAvailability && window.formatCenterAvailability(center.availability)) || center.availability}</p>` : ''}
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                  <button 
                    onclick="window.viewCenterDetails(${center.id})"
                    style="
                      background-color: ${color};
                      color: white;
                      padding: 4px 12px;
                      border-radius: 4px;
                      border: none;
                      font-size: 12px;
                      cursor: pointer;
                      flex: 1;
                    "
                  >
                    View Inventory
                  </button>
                  <button 
                    onclick="window.toggleMapFavorite('center', ${center.id})"
                    style="
                      background-color: #f59e0b;
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      border: none;
                      font-size: 12px;
                      cursor: pointer;
                    "
                    title="Save to favorites"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </button>
                </div>
              </div>
            `)
        );

      console.log('Adding marker to map. Map exists:', !!map.current, 'Marker:', marker);
      marker.addTo(map.current);

      console.log('Center marker added successfully:', center.name);
      markersRef.current.push(marker);
    });

    // Fit bounds to Bay Area markers only. Out-of-region / Null-Island
    // coords used to yank the camera across the Pacific and force users
    // to spin the map back to find distribution centers and local listings.
    if (markersRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasBayAreaPoint = false;

      safeListings.forEach(listing => {
        if (isInBayArea(listing.coords_lat, listing.coords_lng)) {
          bounds.extend([listing.coords_lng, listing.coords_lat]);
          hasBayAreaPoint = true;
        }
      });

      visibleCenters.forEach(center => {
        if (isInBayArea(center.coords_lat, center.coords_lng)) {
          bounds.extend([center.coords_lng, center.coords_lat]);
          hasBayAreaPoint = true;
        }
      });

      try {
        if (hasBayAreaPoint && !bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 14, // Prevent zooming in too close
            duration: 1000
          });
        } else {
          flyToBayArea(map.current, 800);
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
        flyToBayArea(map.current, 800);
      }
    } else {
      // No markers yet - stay focused on the Bay Area service region
      console.log('No markers to display, showing default Bay Area view');
      flyToBayArea(map.current, 0);
    }
  }, [mapLoaded, safeListings, visibleCenters, showDistributionCenters, user]);

  const handleCenterClick = async (center) => {
    if (!showDistributionCenters) return;
    setSelectedCenter(center);
    await loadCenterInventory(center.id);
    setShowCenterModal(true);
  };

  const loadCenterInventory = async (centerId) => {
    try {
      const response = await fetch(`/api/centers/${centerId}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setCenterInventory(data);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // Setup global function for popup buttons
  React.useEffect(() => {
    if (!showDistributionCenters) {
      delete window.viewCenterDetails;
      return () => { delete window.viewCenterDetails; };
    }

    window.viewCenterDetails = (centerId) => {
      const center = visibleCenters.find(c => c.id === centerId);
      if (center) {
        handleCenterClick(center);
      }
    };

    return () => {
      delete window.viewCenterDetails;
    };
  }, [visibleCenters, showDistributionCenters]);

  return (
    <div className="w-full h-full relative flex flex-col">
      <div id="map-container" ref={mapContainer} className="map-container w-full flex-1 min-h-[300px] bg-gray-100" />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600">Loading map...</p>
            {mapInitError && <p className="text-xs text-red-600 mt-2">{mapInitError}</p>}
          </div>
        </div>
      )}

      {/* Legend - Compact and semi-transparent */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-md p-2.5 text-xs max-w-[200px] max-h-[42vh] overflow-y-auto">
        <div className="font-semibold mb-1.5 text-gray-800">Legend</div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            backgroundColor: '#f59e0b',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ transform: 'rotate(45deg)', fontSize: '8px' }}>🍎</span>
          </div>
          <span>Food listings</span>
        </div>
        {showDistributionCenters && (
          <>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1 mt-1">Providers</div>
            {MAP_LEGEND_PROVIDER_TYPES.map((entry) => (
              <div key={entry.label} className="flex items-center gap-1.5 mb-1">
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  backgroundColor: entry.color,
                  flexShrink: 0,
                  border: '1.5px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }} />
                <span>{entry.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 mb-0.5">
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                backgroundColor: MAP_LEGEND_DEFAULT_CENTER_COLOR,
                flexShrink: 0,
                border: '1.5px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }} />
              <span>Other centers</span>
            </div>
          </>
        )}
      </div>

      {/* Distribution Center Inventory Modal */}
      {showDistributionCenters && showCenterModal && selectedCenter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowCenterModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-green-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h2>
                  {user && (
                    <button
                      onClick={async () => {
                        if (window.toggleMapFavorite) {
                          await window.toggleMapFavorite('center', selectedCenter.id);
                        }
                      }}
                      className="text-2xl text-yellow-700 hover:scale-110 transition-transform"
                      title="Save to favorites"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedCenter.address}</p>
                {selectedCenter.phone && (
                  <p className="text-sm text-gray-600">Phone: {selectedCenter.phone}</p>
                )}
                {selectedCenter.hours && (
                  <p className="text-sm text-gray-600">Hours: {selectedCenter.hours}</p>
                )}
                {(() => {
                  const Details = window.DistributionCenterDetails;
                  return typeof Details === 'function'
                    ? (
                      <Details
                        center={selectedCenter}
                        user={user}
                        canEditCategories={userRole === 'admin'}
                        onCenterUpdated={(updated) => {
                          setSelectedCenter((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
                          setCenters((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
                        }}
                      />
                    )
                    : null;
                })()}
              </div>
              <button
                onClick={() => setShowCenterModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
              <h3 className="text-lg font-semibold mb-4">Available Food Items</h3>

              {centerInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-xs mb-2 uppercase tracking-[0.2em] text-gray-400">Inventory</div>
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
                          <div className="flex gap-3 mt-2 text-sm flex-wrap">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {item.category}
                            </span>
                            <span className="text-gray-700">
                              <strong>Qty:</strong> {item.quantity} {item.unit}
                            </span>
                            {item.perishability && (
                              <span className={`px-2 py-1 rounded text-xs ${item.perishability === 'high' ? 'bg-red-100 text-red-800' :
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

            <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-2 justify-between items-start">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setShowCenterModal(false);
                    // Navigate to center on map
                    if (map.current) {
                      map.current.flyTo({
                        center: [selectedCenter.coords_lng, selectedCenter.coords_lat],
                        zoom: 15,
                        duration: 1000
                      });
                    }
                  }}
                  className="px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-lg transition-colors text-sm"
                >
                  Show on Map
                </button>
                {(() => {
                  const ShareBtn = window.DistributionCenterShareButton;
                  return typeof ShareBtn === 'function'
                    ? <ShareBtn center={selectedCenter} />
                    : null;
                })()}
              </div>
              <button
                onClick={() => setShowCenterModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.MapComponent = MapComponent;
window.MAP_LEGEND_PROVIDER_TYPES = MAP_LEGEND_PROVIDER_TYPES;
window.getCenterLegendColor = getCenterLegendColor;