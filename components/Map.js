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

  // Create custom marker element with donor type color coding
  const createMarkerElement = (listing) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    
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
    
    el.innerHTML = `
      <div style="
        width: 36px;
        height: 46px;
        background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
        border: 3px solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
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

    // Get current listings - prioritize window.mockListings
    const currentListings = window.mockListings || safeListings || [];
    console.log('Updating markers with listings:', currentListings.length);

    // Add new markers for each listing - with safe coordinate access
    currentListings
      .filter(listing => {
        // Check for both coordinate formats
        const hasCoords = listing && (
          (listing.coords && listing.coords.lat && listing.coords.lng) ||
          (listing.coordinates && Array.isArray(listing.coordinates) && listing.coordinates.length >= 2)
        );
        return hasCoords;
      })
      .forEach(listing => {
        console.log('Adding marker for listing:', listing.title);
        const markerElement = createMarkerElement(listing);
        
        // Handle both coordinate formats safely
        let lng, lat;
        if (listing.coords) {
          lng = listing.coords.lng;
          lat = listing.coords.lat;
        } else if (listing.coordinates && Array.isArray(listing.coordinates)) {
          lng = listing.coordinates[0];
          lat = listing.coordinates[1];
        }
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .addTo(map.current);

        // Add click handler to marker
        markerElement.addEventListener('click', () => {
          const canClaim = user && user.role === 'recipient' && listing.status === 'available';
          const statusBadgeClass = listing.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                                listing.status === 'claimed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-gray-100 text-gray-800 border-gray-200';
          
          const formatDateTime = (dateString) => {
            if (!dateString) return 'Not specified';
            try {
              const date = new Date(dateString);
              return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (error) {
              return 'Invalid date';
            }
          };

          const getPerishabilityInfo = (level) => {
            switch (level) {
              case 'high': return { text: 'High - Consume within hours', color: 'text-red-600' };
              case 'medium': return { text: 'Medium - Consume within days', color: 'text-yellow-600' };
              case 'low': return { text: 'Low - Shelf stable', color: 'text-green-600' };
              default: return { text: 'Not specified', color: 'text-gray-600' };
            }
          };

          const perishabilityInfo = getPerishabilityInfo(listing.perishability);
          const donorType = getDonorType(listing);
          
          const donorTypeLabels = {
            restaurant: 'Restaurant/Café',
            store: 'Store/Market',
            organization: 'Organization',
            personal: 'Personal Donor'
          };
          
          const donorTypeColors = {
            restaurant: 'bg-red-100 text-red-800 border-red-200',
            store: 'bg-blue-100 text-blue-800 border-blue-200',
            organization: 'bg-purple-100 text-purple-800 border-purple-200',
            personal: 'bg-green-100 text-green-800 border-green-200'
          };
          
          const popupHTML = `
            <div class="p-4 min-w-0 max-w-xs">
              <!-- Header -->
              <div class="mb-3">
                <h3 class="font-bold text-base text-gray-900 mb-1">${listing.title}</h3>
                <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}">
                  ${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>

              <!-- Basic Info -->
              <div class="mb-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Category:</span>
                  <span class="font-medium capitalize">${listing.category}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Quantity:</span>
                  <span class="font-medium">${listing.qty} ${listing.unit}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Expires:</span>
                  <span class="font-medium text-xs">${formatDateTime(listing.expiration_date)}</span>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="space-y-2">
                <button onclick="window.viewDetailsFromMap('${listing.id}')" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <div class="icon-info text-sm mr-2"></div>
                  View Details
                </button>
                <button onclick="window.getDirectionsFromMap('${listing.id}')" 
                        class="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                  <div class="icon-navigation text-sm mr-2"></div>
                  Get Directions
                </button>
              </div>
            </div>
          `;

          // Create popup
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'food-listing-popup'
          })
            .setLngLat([listing.coords.lng, listing.coords.lat])
            .setHTML(popupHTML)
            .addTo(map.current);

          // Setup global callback functions
          window.claimFromMap = (listingId) => {
            popup.remove();
            if (window.handleClaimListing) {
              window.handleClaimListing(listingId);
            }
          };

          window.selectFromMap = (listingId) => {
            popup.remove();
            const selectedListing = currentListings.find(l => l.id === listingId);
            if (selectedListing && window.handleShowDetails) {
              window.handleShowDetails(selectedListing);
            }
          };

          window.viewDetailsFromMap = (listingId) => {
            popup.remove();
            const selectedListing = currentListings.find(l => l.id === listingId);
            if (selectedListing && window.showDetailedModal) {
              window.showDetailedModal(selectedListing);
            }
          };

          window.getDirectionsFromMap = (listingId) => {
            popup.remove();
            const selectedListing = currentListings.find(l => l.id === listingId);
            if (selectedListing) {
              // Handle both coordinate formats safely
              let destLat, destLng;
              if (selectedListing.coords) {
                destLat = selectedListing.coords.lat;
                destLng = selectedListing.coords.lng;
              } else if (selectedListing.coordinates && Array.isArray(selectedListing.coordinates)) {
                destLng = selectedListing.coordinates[0];
                destLat = selectedListing.coordinates[1];
              }
              
              if (destLat && destLng) {
                // Open directions in new tab using Google Maps
                const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
                window.open(url, '_blank');
              }
            }
          };
        });

        markersRef.current.push(marker);
      });

    // Add distribution center markers
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

    // Add new markers for each listing
    safeListings
      .filter(listing => listing && listing.coords)
      .forEach(listing => {
        const markerElement = createMarkerElement(listing);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([listing.coords.lng, listing.coords.lat])
          .addTo(map.current);

        // Add click handler to marker
        markerElement.addEventListener('click', () => {
          const canClaim = user && user.role === 'recipient' && listing.status === 'available';
          const statusBadgeClass = listing.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                                listing.status === 'claimed' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-gray-100 text-gray-800 border-gray-200';
          
          const formatDateTime = (dateString) => {
            if (!dateString) return 'Not specified';
            try {
              const date = new Date(dateString);
              return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (error) {
              return 'Invalid date';
            }
          };

          const getPerishabilityInfo = (level) => {
            switch (level) {
              case 'high': return { text: 'High - Consume within hours', color: 'text-red-600' };
              case 'medium': return { text: 'Medium - Consume within days', color: 'text-yellow-600' };
              case 'low': return { text: 'Low - Shelf stable', color: 'text-green-600' };
              default: return { text: 'Not specified', color: 'text-gray-600' };
            }
          };

          const perishabilityInfo = getPerishabilityInfo(listing.perishability);
          const donorType = getDonorType(listing);
          
          const donorTypeLabels = {
            restaurant: 'Restaurant/Café',
            store: 'Store/Market',
            organization: 'Organization',
            personal: 'Personal Donor'
          };
          
          const donorTypeColors = {
            restaurant: 'bg-red-100 text-red-800 border-red-200',
            store: 'bg-blue-100 text-blue-800 border-blue-200',
            organization: 'bg-purple-100 text-purple-800 border-purple-200',
            personal: 'bg-green-100 text-green-800 border-green-200'
          };
          
          const popupHTML = `
            <div class="p-5 min-w-0 max-w-sm">
              <!-- Header -->
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div class="flex items-center space-x-2">
                  <div class="icon-info text-lg text-blue-600"></div>
                  <h3 class="font-bold text-base text-gray-900">Food Listing Details</h3>
                </div>
              </div>

              <!-- Title and Status -->
              <div class="mb-4">
                <h4 class="font-bold text-lg text-gray-900 mb-2">${listing.title}</h4>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full border ${statusBadgeClass}">
                    ${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                  <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full border ${donorTypeColors[donorType]}">
                    ${donorTypeLabels[donorType]}
                  </span>
                </div>
              </div>
              
              <!-- Description -->
              ${listing.description ? `
                <div class="mb-4">
                  <h5 class="font-semibold text-gray-900 mb-2">Description</h5>
                  <p class="text-sm text-gray-700 leading-relaxed">${listing.description}</p>
                </div>
              ` : ''}
              
              <!-- Food Information -->
              <div class="mb-4">
                <h5 class="font-semibold text-gray-900 mb-3">Food Information</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Category:</span>
                    <span class="font-medium text-gray-900 capitalize">${listing.category}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Quantity:</span>
                    <span class="font-medium text-gray-900">${listing.qty} ${listing.unit}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Perishability:</span>
                    <span class="font-medium ${perishabilityInfo.color}">${perishabilityInfo.text}</span>
                  </div>
                  ${listing.expiration_date ? `
                    <div class="flex justify-between items-center py-1">
                      <span class="text-gray-600">Expires:</span>
                      <span class="font-medium text-gray-900 text-xs">${formatDateTime(listing.expiration_date)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
              
              <!-- Pickup Information -->
              <div class="mb-4">
                <h5 class="font-semibold text-gray-900 mb-3">Pickup Information</h5>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="text-gray-600 block mb-1">Address:</span>
                    <span class="font-medium text-gray-900 text-sm leading-tight">${listing.address}</span>
                  </div>
                  ${listing.pickup_window_start ? `
                    <div>
                      <span class="text-gray-600 block mb-1">Pickup Window:</span>
                      <div class="text-xs space-y-1">
                        <div><span class="font-medium text-gray-900">From: ${formatDateTime(listing.pickup_window_start)}</span></div>
                        ${listing.pickup_window_end ? `<div><span class="font-medium text-gray-900">To: ${formatDateTime(listing.pickup_window_end)}</span></div>` : ''}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Donor Information -->
              ${listing.donor_name ? `
                <div class="mb-4">
                  <h5 class="font-semibold text-gray-900 mb-3">Donor Information</h5>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center py-1">
                      <span class="text-gray-600">Donor:</span>
                      <span class="font-medium text-gray-900">${listing.donor_name}</span>
                    </div>
                    ${listing.contact_info ? `
                      <div class="flex justify-between items-center py-1">
                        <span class="text-gray-600">Contact:</span>
                        <span class="font-medium text-gray-900">${listing.contact_info}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Listing Information -->
              <div class="mb-4 pb-4 border-b border-gray-200">
                <h5 class="font-semibold text-gray-900 mb-3">Listing Information</h5>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600 block text-xs">Posted on:</span>
                    <span class="font-medium text-gray-900 text-xs">${formatDateTime(listing.created_at)}</span>
                  </div>
                  <div>
                    <span class="text-gray-600 block text-xs">Listing ID:</span>
                    <span class="font-medium text-gray-900">${listing.id}</span>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2">
                ${canClaim ? `
                  <button onclick="window.claimFromMap('${listing.id}')" 
                          class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors whitespace-nowrap flex items-center justify-center">
                    <div class="icon-shopping-bag text-sm mr-1"></div>
                    Claim
                  </button>
                ` : ''}
                <button onclick="window.selectFromMap('${listing.id}')" 
                        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center">
                  <div class="icon-eye text-sm mr-1"></div>
                  Show Details
                </button>
              </div>
            </div>
          `;

          // Create popup
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'food-listing-popup'
          })
            .setLngLat([listing.coords.lng, listing.coords.lat])
            .setHTML(popupHTML)
            .addTo(map.current);

          // Setup global callback functions
          window.claimFromMap = (listingId) => {
            popup.remove();
            if (window.handleClaimListing) {
              window.handleClaimListing(listingId);
            }
          };

          window.selectFromMap = (listingId) => {
            popup.remove();
            const selectedListing = safeListings.find(l => l.id === listingId);
            if (selectedListing && window.handleShowDetails) {
              window.handleShowDetails(selectedListing);
            }
          };

          // Store-specific functions
          window.viewStoreMenu = (storeId) => {
            if (window.openStoreMenu) {
              window.openStoreMenu(storeId);
            }
          };

          window.getStoreDirections = (storeId) => {
            const store = doGoodsStores.find(s => s.id === storeId);
            if (store && store.coords) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coords.lat},${store.coords.lng}&travelmode=driving`;
              window.open(url, '_blank');
            }
          };

          // Distribution center functions - use globally registered function
          // Note: viewDistributionCenterMenu is already registered in mockData.js

          window.getDistributionCenterDirections = (centerId) => {
            const center = distributionCenters.find(c => c.id === centerId);
            if (center && center.coords) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coords.lat},${center.coords.lng}&travelmode=driving`;
              window.open(url, '_blank');
            }
          };
        });

        markersRef.current.push(marker);
      });
  };

  // Fit map to show all listings, distribution centers, stores and kiosks
  const fitMapToListings = () => {
    const currentListings = window.mockListings || safeListings || [];
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
    
    // Include food listings - priority for positioning
    currentListings.forEach(listing => {
      let lng, lat;
      
      // Handle both coordinate formats safely
      if (listing.coords && listing.coords.lat && listing.coords.lng) {
        lng = listing.coords.lng;
        lat = listing.coords.lat;
      } else if (listing.coordinates && Array.isArray(listing.coordinates) && listing.coordinates.length >= 2) {
        lng = listing.coordinates[0];
        lat = listing.coordinates[1];
      }
      
      if (lng && lat) {
        bounds.extend([lng, lat]);
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
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 16,
        duration: 1000
      });
    } else {
      // Fallback to Alameda center if no valid bounds
      map.current.flyTo({
        center: [-122.2416, 37.7652],
        zoom: 13,
        duration: 1000
      });
    }
  };

  // Update markers when data changes
  React.useEffect(() => {
    if (!mapLoaded || !map.current) return;

    console.log('Updating markers on map:', safeListings.length, 'listings,', distributionCenters.length, 'centers,', doGoodsStores.length, 'stores,', doGoodsKiosks.length, 'kiosks');
    
    // Get latest data from window globals
    const currentListings = window.mockListings || safeListings;
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
      if (window.mockListings && window.mockListings.length > 0 && mapLoaded && !hasFitted) {
        console.log('Found window.mockListings:', window.mockListings.length);
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