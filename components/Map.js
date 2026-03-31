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
          center: [-119.4179, 36.7783], // California center
          zoom: 6,
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
                        <span style="font-size: 18px;">⭐</span> Save
                      </button>
                    ` : '';

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([listing.coords_lng, listing.coords_lat])
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
                        <span style="font-size: 18px;">ℹ️</span> View Details
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
                        <span style="font-size: 18px;">🧭</span> Get Directions
                      </button>
                    </div>
                    ${isClaimedByMe && user?.role === 'recipient' ? '<div style="margin-top: 12px; padding: 8px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 13px; font-weight: 600; text-align: center;">✓ Claimed by you</div>' : ''}
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      }
    });

    // Color palette for distribution centers
    const centerColors = [
      '#10b981', // Green
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#84cc16', // Lime
    ];

    // Add distribution center markers with unique colors
    console.log('Adding', visibleCenters.length, 'distribution center markers');
    visibleCenters.forEach((center, index) => {
      if (!center.coords_lat || !center.coords_lng) {
        console.warn('Skipping center with missing coordinates:', center.name);
        return;
      }

      // Assign color based on index (wraps around if more centers than colors)
      const color = centerColors[index % centerColors.length];

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
                ${center.phone ? `<p style="font-size: 11px; color: #666;">📞 ${center.phone}</p>` : ''}
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
                    ⭐
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

    // Fit bounds to show all markers (both listings and distribution centers)
    if (markersRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      // Add all food listings to bounds
      safeListings.forEach(listing => {
        if (listing.coords_lat && listing.coords_lng) {
          bounds.extend([listing.coords_lng, listing.coords_lat]);
        }
      });

      // Add all distribution centers to bounds
      visibleCenters.forEach(center => {
        if (center.coords_lat && center.coords_lng) {
          bounds.extend([center.coords_lng, center.coords_lat]);
        }
      });

      // Fit map to show all markers with appropriate padding
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 14, // Prevent zooming in too close
          duration: 1000
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to California center if bounds fail
        map.current.flyTo({ center: [-119.4179, 36.7783], zoom: 6 });
      }
    } else {
      // No markers yet - show California by default
      console.log('No markers to display, showing default California view');
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
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow-md p-2 text-xs max-w-[150px]">
        <div className="font-semibold mb-1 text-gray-800">Legend</div>
        <div className="flex items-center gap-1 mb-1">
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            backgroundColor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ transform: 'rotate(45deg)', fontSize: '10px' }}>🍎</span>
          </div>
          <span>Food</span>
        </div>
        {showDistributionCenters && (
          <div className="flex items-center gap-1">
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ transform: 'rotate(45deg)', fontSize: '10px' }}>🏪</span>
            </div>
            <span>Centers</span>
          </div>
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
                  <h2 className="text-2xl font-bold text-gray-900">🏪 {selectedCenter.name}</h2>
                  {user && (
                    <button
                      onClick={async () => {
                        if (window.toggleMapFavorite) {
                          await window.toggleMapFavorite('center', selectedCenter.id);
                        }
                      }}
                      className="text-2xl hover:scale-110 transition-transform"
                      title="Save to favorites"
                    >
                      ⭐
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">📍 {selectedCenter.address}</p>
                {selectedCenter.phone && (
                  <p className="text-sm text-gray-600">📞 {selectedCenter.phone}</p>
                )}
                {selectedCenter.hours && (
                  <p className="text-sm text-gray-600">🕒 {selectedCenter.hours}</p>
                )}
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

            <div className="p-4 border-t bg-gray-50 flex justify-between">
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