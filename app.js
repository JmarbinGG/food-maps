class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [user, setUser] = React.useState(null);
  const [listings, setListings] = React.useState([]);
  const [filteredListings, setFilteredListings] = React.useState([]);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showAISearch, setShowAISearch] = React.useState(false);
  const [showFoodSearch, setShowFoodSearch] = React.useState(false);
  const [showDetailedModal, setShowDetailedModal] = React.useState(false);
  const [detailedListing, setDetailedListing] = React.useState(null);
  const [currentView, setCurrentView] = React.useState('map');
  const [viewMode, setViewMode] = React.useState('map'); // 'map' or 'list'
  const [userLocation, setUserLocation] = React.useState(null);
  const [schedules, setSchedules] = React.useState([]);
  const [activeTasks, setActiveTasks] = React.useState([]);
  const [databaseConnected, setDatabaseConnected] = React.useState(false);
  const [showUserPortal, setShowUserPortal] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showStoreMenu, setShowStoreMenu] = React.useState(false);
  const [showStorePortal, setShowStorePortal] = React.useState(false);
  const [selectedStoreId, setSelectedStoreId] = React.useState(null);
  const [filters, setFilters] = React.useState({
    category: 'all',
    status: 'available',
    distance: 25,
    perishability: 'all'
  });

  React.useEffect(() => {
    try {
      // No mock callback - prefer real database-backed listings
      
      // Ensure DOM is ready before manipulating elements
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
      } else {
        initializeApp();
      }
      
      return () => {};
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }, []);

  // Hydrate user from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('current_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch (e) {
          console.error('Failed to parse stored user', e);
        }
      }
    } catch (e) {
      console.error('Error hydrating user from localStorage', e);
    }
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing Food Maps app...');
      
      // Always initialize mock data first with error handling
      // let mockData = null;
      // try {
      //   if (typeof window.initializeAllMockData === 'function') {
      //     mockData = window.initializeAllMockData();
      //     console.log('Mock data initialized:', mockData);
      //   } else {
      //     console.log('Mock data initialization function not found, using fallback');
      //     // Ensure mock listings exist
      //     if (!window.databaseService.getListings || !Array.isArray(window.databaseService.getListings)) {
      //       window.databaseService.getListings = [];
      //     }
      //   }
      // } catch (mockError) {
      //   console.error('Error initializing mock data:', mockError);
      //   window.databaseService.getListings = [];
      // }
      
      // Initialize database service
      // Initialize database service connection state
      try {
        if (window.databaseService && typeof window.databaseService.isConnected !== 'undefined') {
          setDatabaseConnected(Boolean(window.databaseService.isConnected));
        }
      } catch (e) { /* ignore */ }

      // Load data from database (use snapshot fallback)
      try {
        const dbListings = await (window.databaseService && window.databaseService.fetchListingsArray ? window.databaseService.fetchListingsArray() : (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []));
        const normalizeListing = (item) => {
          if (!item) return item;
          const copy = { ...item };
          // Normalize status to lowercase
          copy.status = (copy.status || '').toString().toLowerCase();

          // Normalize coords to copy.coords = { lat, lng }
          try {
            if (copy.coords && copy.coords.lat !== undefined && copy.coords.lng !== undefined) {
              copy.coords = { lat: parseFloat(copy.coords.lat), lng: parseFloat(copy.coords.lng) };
            } else if (copy.coords_lat !== undefined && copy.coords_lng !== undefined) {
              copy.coords = { lat: parseFloat(copy.coords_lat), lng: parseFloat(copy.coords_lng) };
            } else if (Array.isArray(copy.coordinates) && copy.coordinates.length >= 2) {
              // coordinates stored as [lng, lat]
              copy.coords = { lat: parseFloat(copy.coordinates[1]), lng: parseFloat(copy.coordinates[0]) };
            }
            // Validate and auto-swap if values look reversed
            if (copy.coords) {
              const lat = copy.coords.lat;
              const lng = copy.coords.lng;
              const validLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
              const validLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;
              if (!validLat && validLng) {
                // try swapping
                if (Number.isFinite(lng) && lng >= -90 && lng <= 90 && Number.isFinite(lat) && lat >= -180 && lat <= 180) {
                  copy.coords = { lat: lng, lng: lat };
                } else {
                  // invalid coords - remove
                  delete copy.coords;
                }
              } else if (!validLng && validLat) {
                if (Number.isFinite(lat) && lat >= -180 && lat <= 180 && Number.isFinite(lng) && lng >= -90 && lng <= 90) {
                  copy.coords = { lat: lng, lng: lat };
                } else {
                  delete copy.coords;
                }
              } else if (!validLat || !validLng) {
                delete copy.coords;
              }
            }
          } catch (e) {
            // leave as-is if normalization fails
            console.error('Listing normalization error', e);
          }

          // Ensure id exists
          copy.id = copy.id || copy.objectId || copy._id || copy.listing_id;
          return copy;
        };

        const normalized = Array.isArray(dbListings) ? dbListings.map(item => normalizeListing(item)).filter(l => l && l.id) : [];
        setListings(normalized);
        setFilteredListings(normalized);
        console.log(`Loaded ${normalized.length} listings from database`);
      } catch (dbError) {
        console.error('Database error:', dbError);
        const fallback = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : (window.databaseService && Array.isArray(window.databaseService.listings) ? window.databaseService.listings : []));
        setListings(fallback);
        setFilteredListings(fallback);
        console.log(`Database failed, using snapshot fallback: ${fallback.length} listings`);
      }
      
      // Initialize scheduling data
      if (typeof window.getMockSchedules === 'function') {
        const mockSchedules = window.getMockSchedules();
        setSchedules(mockSchedules);
      }
      
      if (typeof window.getMockTasks === 'function') {
        const mockTasks = window.getMockTasks();
        setActiveTasks(mockTasks);
      }
      
      // Check for selected food from landing page
      const selectedFood = localStorage.getItem('selectedFood');
      if (selectedFood) {
        try {
          const food = JSON.parse(selectedFood);
          setSelectedListing(food);
          setShowDetailModal(true);
          localStorage.removeItem('selectedFood');
        } catch (error) {
          console.error('Error parsing selected food:', error);
        }
      }
      
      // Get user location for distance calculations
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Default to San Francisco if geolocation fails
            setUserLocation({ lat: 37.7749, lng: -122.4194 });
          }
        );
      } else {
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
      }
      
      // Start agent orchestrator with guaranteed data
      setTimeout(() => {
        if (window.agentOrchestrator && !window.agentOrchestrator.isRunning) {
          console.log('Starting AI Agent Orchestrator...');
          window.agentOrchestrator.start();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in app initialization:', error);
    }
  };

  React.useEffect(() => {
    try {
      if (!Array.isArray(listings)) {
        console.log('Listings is not an array:', listings);
        setFilteredListings([]);
        return;
      }
      
      const filtered = listings.filter(listing => {
        try {
          if (!listing) return false;
          if (filters.status !== 'all' && listing.status !== filters.status) return false;
          if (filters.category !== 'all' && listing.category !== filters.category) return false;
          if (filters.perishability !== 'all' && listing.perishability !== filters.perishability) return false;
          return true;
        } catch (error) {
          console.error('Error filtering listing:', listing, error);
          return false;
        }
      });
      
      console.log(`Filtering listings: ${listings.length} total -> ${filtered.length} filtered`);
      console.log('Active filters:', filters);
      setFilteredListings(filtered);
    } catch (error) {
      console.error('Error in filtering effect:', error);
      setFilteredListings([]);
    }
  }, [listings, filters]);

  const handleClaimListing = async (listingId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Prefer to update via backend API if available
      let updatedListing = null;
      if (window.listingAPI && window.listingAPI.update) {
        try {
          const resp = await window.listingAPI.update(listingId, { status: 'claimed', recipient_id: user.id });
          // resp may include a 'listing' object depending on backend
          if (resp && resp.listing) {
            updatedListing = resp.listing;
          }
        } catch (apiErr) {
          console.warn('listingAPI.update failed, falling back to databaseService', apiErr);
        }
      }

      // Fallback to databaseService update if API didn't return updated listing
      if (!updatedListing && databaseConnected && window.databaseService) {
        const result = await window.databaseService.updateListingStatus(listingId, 'claimed', user.id);
        if (result && result.success && result.data) {
          updatedListing = result.data;
        }
      }

      // Update local state based on updatedListing or optimistic update
      if (updatedListing) {
        const updatedListings = listings.map(l => l.id === listingId ? ({ ...l, ...updatedListing, status: (updatedListing.status || 'claimed') }) : l);
        setListings(updatedListings);
        setFilteredListings(updatedListings);
      } else {
        // optimistic fallback
        const updatedListings = listings.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'claimed', recipient_id: user.id }
            : listing
        );
        setListings(updatedListings);
        setFilteredListings(updatedListings);
      }

      alert('Listing claimed successfully!');
      
    } catch (error) {
      console.error('Error claiming listing:', error);
      alert('Failed to claim listing. Please try again.');
    }
  };

  const handleSchedulePickup = (pickupData) => {
    const newSchedule = {
      id: `schedule_${Date.now()}`,
      type: 'pickup',
      listingId: pickupData.listingId,
      scheduledTime: pickupData.scheduledTime,
      driverId: pickupData.driverId,
      status: 'scheduled',
      priority: pickupData.priority || 'normal',
      estimatedDuration: pickupData.estimatedDuration || 30,
      createdAt: new Date().toISOString()
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    console.log('Pickup scheduled:', newSchedule);
  };

  const handleScheduleDelivery = (deliveryData) => {
    const newSchedule = {
      id: `schedule_${Date.now()}`,
      type: 'delivery',
      listingId: deliveryData.listingId,
      recipientId: deliveryData.recipientId,
      scheduledTime: deliveryData.scheduledTime,
      driverId: deliveryData.driverId,
      status: 'scheduled',
      priority: deliveryData.priority || 'normal',
      estimatedDuration: deliveryData.estimatedDuration || 20,
      deliveryAddress: deliveryData.address,
      createdAt: new Date().toISOString()
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    console.log('Delivery scheduled:', newSchedule);
  };

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: `task_${Date.now()}`,
      type: taskData.type,
      pickupScheduleId: taskData.pickupScheduleId,
      deliveryScheduleId: taskData.deliveryScheduleId,
      driverId: taskData.driverId,
      status: 'pending',
      route: taskData.route,
      estimatedTime: taskData.estimatedTime,
      priority: taskData.priority,
      createdAt: new Date().toISOString()
    };
    
    setActiveTasks(prev => [...prev, newTask]);
    console.log('Task created:', newTask);
  };

  // Check for new user onboarding
  React.useEffect(() => {
    if (user && user.isNewUser && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleShowDetails = (listing) => {
    setSelectedListing(listing);
    setShowDetailModal(true);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const getLocationsWithDistance = () => {
    if (!userLocation) return filteredListings;
    
    return filteredListings.map(listing => {
      let lat, lng;
      
      // Handle both coordinate formats safely
      if (listing.coords) {
        lat = listing.coords.lat;
        lng = listing.coords.lng;
      } else if (listing.coordinates && Array.isArray(listing.coordinates) && listing.coordinates.length >= 2) {
        lng = listing.coordinates[0];
        lat = listing.coordinates[1];
      }
      
      const distance = (lat && lng) ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      ) : 0;
      
      return {
        ...listing,
        distance
      };
    }).sort((a, b) => a.distance - b.distance);
  };

  // Make handlers available globally for map popup buttons
  React.useEffect(() => {
    window.handleClaimListing = handleClaimListing;
    window.handleShowDetails = handleShowDetails;
    window.showAISearch = () => setShowAISearch(true);
    window.showFoodSearch = () => setShowFoodSearch(true);
    // Allow nested components to trigger the auth modal
    window.openAuthModal = () => setShowAuthModal(true);
    
    // Setup global detailed modal callback
    window.showDetailedModal = (listing) => {
      setDetailedListing(listing);
      setShowDetailedModal(true);
    };

    // Setup global store menu callback
    window.openStoreMenu = (storeId) => {
      setSelectedStoreId(storeId);
      setShowStoreMenu(true);
    };
    
    return () => {
      delete window.handleClaimListing;
      delete window.handleShowDetails;
      delete window.showAISearch;
      delete window.showFoodSearch;
      delete window.showDetailedModal;
      delete window.openStoreMenu;
      delete window.openAuthModal;
    };
  }, [handleClaimListing, handleShowDetails]);

  const handleCloseDetailedModal = () => {
    setShowDetailedModal(false);
    setDetailedListing(null);
  };

  const handleClaimFromModal = (listingId) => {
    handleCloseDetailedModal();
    handleClaimListing(listingId);
  };

  const renderView = () => {
    switch (currentView) {
      case 'create':
          return (
            <CreateListing
              user={user}
              onCancel={() => setCurrentView('map')}
              onSuccess={async () => {
                // Fetch latest listings from backend after creation
                try {
                  if (window.listingAPI && window.listingAPI.getAll) {
                    const latestListings = await window.listingAPI.getAll();
                    if (Array.isArray(latestListings)) {
                      setListings(latestListings);
                      setFilteredListings(latestListings);
                    }
                  }
                } catch (err) {
                  console.error('Failed to refresh listings after creation', err);
                }
                // Ensure we go back to the map view and recenter to new listings
                setCurrentView('map');
                try {
                  if (window.recenterMap) {
                    window.recenterMap();
                  }
                } catch (e) {
                  console.error('recenterMap call failed', e);
                }
              }}
            />
          );
      case 'bulk-create':
        return (
          <BulkListing
            user={user}
            onCancel={() => setCurrentView('map')}
            onSuccess={() => setCurrentView('map')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onViewChange={setCurrentView}
          />
        );
      case 'ai-matching':
        return (
          <AIMatching
            onClose={() => setCurrentView('map')}
          />
        );
      case 'routes':
        return (
          <VolunteerRoutes
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'dispatch':
        return (
          <DispatchDashboard
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'consumption':
        return (
          <ConsumptionTracker
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'emergency':
        return (
          <EmergencyResponse
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'nutrition':
        return (
          <NutritionTracker
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'partners':
        return (
          <CommunityPartners
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'food-rescue':
        return (
          <FoodRescueNetwork
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'meal-planning':
        return (
          <MealPlanning
            user={user}
            onClose={() => setCurrentView('map')}
          />
        );
      case 'schedule':
        return (
          <ScheduleManager
            schedules={schedules}
            activeTasks={activeTasks}
            listings={listings}
            onSchedulePickup={handleSchedulePickup}
            onScheduleDelivery={handleScheduleDelivery}
            onCreateTask={handleCreateTask}
            onViewChange={setCurrentView}
          />
        );
      case 'driver':
        return (
          <DriverInterface
            tasks={activeTasks}
            schedules={schedules}
            onTaskUpdate={(taskId, status) => {
              setActiveTasks(prev => prev.map(task => 
                task.id === taskId ? {...task, status} : task
              ));
            }}
            onViewChange={setCurrentView}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            onClose={() => setCurrentView('map')}
          />
        );
      default:
        return (
          <div className="flex h-[calc(100vh-64px)] min-h-[500px]">
            {/* Desktop Sidebar */}
            <div className="sidebar w-96 bg-white border-r border-[var(--border-color)] flex flex-col hidden lg:flex">
              <FilterPanel 
                filters={filters}
                onFiltersChange={setFilters}
              />
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {user && String(user.role).toLowerCase() === 'donor' ? 'My Listings' : 'All Listings'} ({(() => {
                      const isDonor = user && String(user.role).toLowerCase() === 'donor';
                      const getUid = () => {
                        try {
                          if (user && user.id != null) return String(user.id);
                          const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
                          return cu && (cu.id != null || cu.user_id != null || cu.sub != null) ? String(cu.id ?? cu.user_id ?? cu.sub) : null;
                        } catch (_) { return null; }
                      };
                      const uid = getUid();
                      const ownOnly = isDonor ? (filteredListings || []).filter(l => {
                        try {
                          const did = (l && ((l.donor_id ?? l.donorId ?? l.owner_id ?? l.ownerId) ?? (l.donor && l.donor.id)))
                          return uid && did != null && String(did) === uid;
                        } catch (_) { return false; }
                      }) : filteredListings;
                      return (ownOnly || []).length;
                    })()})
                  </h2>
                </div>
                
                {(() => {
                  const isDonor = user && String(user.role).toLowerCase() === 'donor';
                  const getUid = () => {
                    try {
                      if (user && user.id != null) return String(user.id);
                      const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
                      return cu && (cu.id != null || cu.user_id != null || cu.sub != null) ? String(cu.id ?? cu.user_id ?? cu.sub) : null;
                    } catch (_) { return null; }
                  };
                  const uid = getUid();
                  const sidebarListings = isDonor ? (filteredListings || []).filter(l => {
                    try {
                      const did = (l && ((l.donor_id ?? l.donorId ?? l.owner_id ?? l.ownerId) ?? (l.donor && l.donor.id)))
                      return uid && did != null && String(did) === uid;
                    } catch (_) { return false; }
                  }) : filteredListings;
                  return (sidebarListings || []).map(listing => 
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClaim={handleClaimListing}
                    onSelect={(listing) => {
                      setSelectedListing(listing);
                      setShowDetailModal(true);
                    }}
                    user={user}
                  />
                  );
                })()}
                
                {(() => {
                  const isDonor = user && String(user.role).toLowerCase() === 'donor';
                  const getUid = () => {
                    try {
                      if (user && user.id != null) return String(user.id);
                      const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
                      return cu && (cu.id != null || cu.user_id != null || cu.sub != null) ? String(cu.id ?? cu.user_id ?? cu.sub) : null;
                    } catch (_) { return null; }
                  };
                  const uid = getUid();
                  const sidebarListings = isDonor ? (filteredListings || []).filter(l => {
                    try {
                      const did = (l && ((l.donor_id ?? l.donorId ?? l.owner_id ?? l.ownerId) ?? (l.donor && l.donor.id)))
                      return uid && did != null && String(did) === uid;
                    } catch (_) { return false; }
                  }) : filteredListings;
                  return (sidebarListings || []).length === 0;
                })() && (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    <div className="icon-search text-3xl mb-2"></div>
                    <p>No listings found{user && String(user.role).toLowerCase() === 'donor' ? ' for your account ' : ''}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map - Full width on mobile, shared on desktop */}
            <div className="map-full-width flex-1 min-w-0 relative">
              {/* View Toggle */}
              <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${
                    viewMode === 'map' 
                      ? 'bg-[var(--primary-color)] text-white' 
                      : 'text-gray-600 hover:text-[var(--primary-color)]'
                  }`}
                >
                  <div className="icon-map text-lg mr-1"></div>
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${
                    viewMode === 'list' 
                      ? 'bg-[var(--primary-color)] text-white' 
                      : 'text-gray-600 hover:text-[var(--primary-color)]'
                  }`}
                >
                  <div className="icon-list text-lg mr-1"></div>
                  List
                </button>
              </div>

              {viewMode === 'map' ? (
                <MapComponent
                  listings={filteredListings}
                  selectedListing={selectedListing}
                  onListingSelect={setSelectedListing}
                  user={user}
                />
              ) : (
                <LocationListView
                  listings={getLocationsWithDistance()}
                  onListingClick={handleShowDetails}
                  userLocation={userLocation}
                />
              )}
            </div>
          </div>
        );
    }
  };

  try {
    return (
      <div className="min-h-screen bg-[var(--background)]" data-name="app" data-file="app.js">
        <Header 
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={() => {
            // clear persisted auth
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            setUser(null);
          }}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        {renderView()}

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onAuth={setUser}
          />
        )}

        {showDetailModal && selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedListing(null);
            }}
            onClaim={handleClaimListing}
            user={user}
          />
        )}

        {showAISearch && (
          <AIFoodSearch
            onClose={() => setShowAISearch(false)}
            onSelectFood={(food) => {
              setSelectedListing(food);
              setShowDetailModal(true);
            }}
          />
        )}

        {showFoodSearch && (
          <FoodSearch
            onClose={() => setShowFoodSearch(false)}
            onSelectFood={(food) => {
              setSelectedListing(food);
              setShowDetailModal(true);
            }}
            user={user}
          />
        )}

        {showUserPortal && (
          <UserPortal
            user={user}
            onClose={() => setShowUserPortal(false)}
            onViewChange={setCurrentView}
            onUserUpdate={setUser}
          />
        )}

        {showOnboarding && (
          <OnboardingWizard
            user={user}
            onComplete={(updatedUser) => {
              setUser(updatedUser);
              setShowOnboarding(false);
            }}
            onSkip={() => setShowOnboarding(false)}
          />
        )}

        {showDetailedModal && detailedListing && (
          <DetailedModal
            listing={detailedListing}
            onClose={handleCloseDetailedModal}
            onClaim={handleClaimFromModal}
          />
        )}

        {showStoreMenu && (
          <StoreMenu
            storeId={selectedStoreId}
            onClose={() => {
              setShowStoreMenu(false);
              setSelectedStoreId(null);
            }}
          />
        )}

        {showStorePortal && (
          <StorePortal
            user={user}
            onClose={() => setShowStorePortal(false)}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
