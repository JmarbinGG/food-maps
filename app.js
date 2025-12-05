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
  const [showForgotPasswordModal, setShowForgotPasswordModal] = React.useState(false);
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
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [pendingClaimId, setPendingClaimId] = React.useState(null);
  const [showClaimConfirmationModal, setShowClaimConfirmationModal] = React.useState(false);
  const [pendingClaimListing, setPendingClaimListing] = React.useState(null);
  const [showUserProfile, setShowUserProfile] = React.useState(false);
  const [showDistributionMap, setShowDistributionMap] = React.useState(false);
  const [showStoreOwnerDashboard, setShowStoreOwnerDashboard] = React.useState(false);
  const [filters, setFilters] = React.useState({
    category: 'all',
    status: 'available',
    distance: 25,
    perishability: 'all'
  });
  // Phone modal state and helper
  const [phoneModalOpen, setPhoneModalOpen] = React.useState(false);
  const phoneResolveRef = React.useRef(null);
  const phoneInitialRef = React.useRef('');
  // Alert modal state
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertData, setAlertData] = React.useState({ title: 'Notice', message: '', variant: 'default' });
  const alertResolveRef = React.useRef(null);

  const requestPhone = React.useCallback(() => {
    return new Promise((resolve) => {
      phoneResolveRef.current = resolve;
      try {
        const stored = JSON.parse(localStorage.getItem('current_user') || 'null');
        phoneInitialRef.current = stored && stored.phone ? String(stored.phone) : '';
      } catch (_) { phoneInitialRef.current = ''; }
      setPhoneModalOpen(true);
    });
  }, []);

  const handlePhoneClose = React.useCallback(() => {
    setPhoneModalOpen(false);
    if (phoneResolveRef.current) {
      try { phoneResolveRef.current(false); } catch (_) { }
      phoneResolveRef.current = null;
    }
  }, []);

  const handlePhoneSubmit = React.useCallback(async (phone) => {
    try {
      await window.userAPI.updatePhone(phone);
      try {
        const cuRaw = localStorage.getItem('current_user');
        if (cuRaw) {
          const cu = JSON.parse(cuRaw);
          cu.phone = phone;
          localStorage.setItem('current_user', JSON.stringify(cu));
        }
      } catch (_) { }
      setPhoneModalOpen(false);
      if (phoneResolveRef.current) {
        try { phoneResolveRef.current(true); } catch (_) { }
        phoneResolveRef.current = null;
      }
    } catch (e) {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to save phone number. Please try again.', { title: 'Error', variant: 'error' });
      }
      throw e;
    }
  }, []);

  React.useEffect(() => {
    try {
      // No mock callback - prefer real database-backed listings

      // Check for hash parameter to set initial view
      if (window.location.hash === '#create') {
        setCurrentView('create');
        // Clear the hash to avoid confusion
        window.history.replaceState(null, null, window.location.pathname);
      }

      // Ensure DOM is ready before manipulating elements
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
      } else {
        initializeApp();
      }

      return () => { };
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

  // Validate JWT token on mount - must run after showAuthModal state is ready
  React.useEffect(() => {
    // Add a small delay to ensure React state is fully initialized
    const timeoutId = setTimeout(() => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('Validating token on mount:', token ? `Token found (length: ${token.length})` : 'No token');

        if (!token || token.trim() === '') {
          console.log('No token to validate - user not logged in');
          return;
        }

        const validation = validateToken(token);
        console.log('Token validation result:', validation);

        if (!validation.valid && !validation.isEmpty) {
          // Token exists but is invalid or expired
          console.warn(`Token validation failed: ${validation.reason} - clearing auth and showing modal`);
          handleTokenExpired();
        } else if (validation.valid && !validation.isEmpty) {
          console.log('Token is valid');
        }
      } catch (e) {
        console.error('Error validating token on mount', e);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [validateToken, handleTokenExpired]);

  // Refetch listings once user/auth is known to include relevant claimed items
  React.useEffect(() => {
    const refreshForUser = async () => {
      try {
        const dbListings = await (window.databaseService && window.databaseService.fetchListingsArray ? window.databaseService.fetchListingsArray() : []);
        if (Array.isArray(dbListings)) {
          // Normalize status to lowercase etc. (reuse normalize from init)
          const normalizeListing = (item) => {
            if (!item) return item;
            const copy = { ...item };
            copy.status = (copy.status || '').toString().toLowerCase();
            try {
              if (copy.coords && copy.coords.lat !== undefined && copy.coords.lng !== undefined) {
                copy.coords = { lat: parseFloat(copy.coords.lat), lng: parseFloat(copy.coords.lng) };
              } else if (copy.coords_lat !== undefined && copy.coords_lng !== undefined) {
                copy.coords = { lat: parseFloat(copy.coords_lat), lng: parseFloat(copy.coords_lng) };
              }
            } catch (_) { }
            copy.id = copy.id || copy.objectId || copy._id || copy.listing_id;
            return copy;
          };
          const normalized = dbListings.map(normalizeListing).filter(l => l && l.id);
          setListings(normalized);
          setFilteredListings(normalized);
        }
      } catch (e) {
        console.warn('Refresh listings after user hydration failed', e);
      }
    };
    // Only refetch when we have a user or a token present
    try {
      const token = localStorage.getItem('auth_token');
      if (user || token) {
        refreshForUser();
      }
    } catch (_) {
      if (user) refreshForUser();
    }
  }, [user]);

  // Expose phone request helper globally
  React.useEffect(() => {
    window.requestPhone = requestPhone;
    return () => { delete window.requestPhone; };
  }, [requestPhone]);
  var logout = false;
  // Alert helper
  const showAlert = React.useCallback((message, opts = {}, logout) => {
    logout = logout;
    if (logout) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    return new Promise((resolve) => {
      const { title = 'Notice', variant = 'default' } = opts || {};
      setAlertData({ title, message: String(message || ''), variant });
      alertResolveRef.current = resolve;
      setAlertOpen(true);
    });
  }, []);

  const handleAlertClose = React.useCallback(() => {
    setAlertOpen(false);
    if (logout) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      window.location.reload();
    }
    if (alertResolveRef.current) {
      try { alertResolveRef.current(true); } catch (_) { }
      alertResolveRef.current = null;
    }
  }, []);

  // Expose globally
  React.useEffect(() => {
    window.showAlert = showAlert;
    return () => { delete window.showAlert; };
  }, [showAlert]);

  // Parse JWT token
  const parseJwt = React.useCallback((token) => {
    try {
      const parts = String(token || '').split('.');
      if (parts.length < 2) return null;
      let payload = parts[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad > 0) payload += '='.repeat(4 - pad);
      const json = atob(payload);
      try {
        return JSON.parse(json);
      } catch (e) {
        return JSON.parse(decodeURIComponent(escape(json)));
      }
    } catch (e) {
      return null;
    }
  }, []);

  // Validate JWT token
  const validateToken = React.useCallback((token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { valid: true, isEmpty: true }; // Empty is valid state (not logged in)
    }

    const payload = parseJwt(token);
    if (!payload) {
      return { valid: false, isEmpty: false, reason: 'malformed' }; // Malformed token
    }

    // Check expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, isEmpty: false, reason: 'expired' }; // Expired token
      }
    }

    return { valid: true, isEmpty: false }; // Valid token
  }, [parseJwt]);

  // Handle expired/invalid token
  const handleTokenExpired = React.useCallback(() => {
    console.log('Token expired or invalid - clearing authentication');
    // Clear all auth-related localStorage immediately
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    // Clear any claimed listings cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('my_claimed_ids:')) {
        localStorage.removeItem(key);
      }
    });
    // Clear user state
    setUser(null);
    // Show auth modal
    setShowAuthModal(true);
    // Show alert (use setTimeout to ensure it runs after state updates)
    setTimeout(() => {
      if (typeof window.showAlert === 'function') {
        window.showAlert('Your session has expired. Please sign in again.', {
          title: 'Session Expired',
          variant: 'error'
        });
      }
    }, 100);
  }, []);

  // Expose globally for API error handling
  React.useEffect(() => {
    window.handleTokenExpired = handleTokenExpired;
    return () => { delete window.handleTokenExpired; };
  }, [handleTokenExpired]);

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
        // Check if it's a token expiration error
        if (dbError && (dbError.message?.includes('401') || dbError.message?.includes('expired') || dbError.message?.includes('Invalid token'))) {
          if (typeof window.handleTokenExpired === 'function') {
            window.handleTokenExpired();
          }
          return;
        }
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

      const role = String(user?.role || '').toLowerCase();
      const getUid = () => {
        try {
          if (user && user.id != null) return String(user.id);
          const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
          return cu && (cu.id != null || cu.user_id != null || cu.sub != null) ? String(cu.id ?? cu.user_id ?? cu.sub) : null;
        } catch (_) { return null; }
      };
      const uid = getUid();
      const getDonorId = (l) => {
        try { const v = (l?.donor_id ?? l?.donorId ?? l?.owner_id ?? l?.ownerId ?? (l?.donor && l?.donor.id)); return v != null ? String(v) : null; } catch { return null; }
      };
      const getRecipientId = (l) => {
        try { const v = (l?.recipient_id ?? l?.recipientId ?? (l?.recipient && l?.recipient.id)); return v != null ? String(v) : null; } catch { return null; }
      };

      const statusFilter = String(filters.status || 'available').toLowerCase();

      // Start with category/perishability filters only
      let base = listings.filter(l => {
        if (!l) return false;
        if (filters.category !== 'all' && l.category !== filters.category) return false;
        if (filters.perishability !== 'all' && l.perishability !== filters.perishability) return false;
        return true;
      });

      const isOwnedByDonor = (l) => uid && getDonorId(l) === uid;
      const isClaimedByMe = (l) => {
        const ridMatches = uid && getRecipientId(l) === uid;
        if (ridMatches) return true;
        try {
          const key = `my_claimed_ids:${uid}`;
          const arr = JSON.parse(localStorage.getItem(key) || '[]');
          return Array.isArray(arr) && arr.includes(String(l.id));
        } catch (_) { return false; }
      };
      const statusOf = (l) => String(l?.status || '').toLowerCase();
      const isClaimedStatus = (s) => s === 'claimed' || s === 'pending_confirmation';

      if (statusFilter === 'available') {
        const availableOnly = base.filter(l => statusOf(l) === 'available');
        // Union in relevant claimed items based on role
        let extras = [];
        if (role === 'donor') {
          extras = base.filter(l => isClaimedStatus(statusOf(l)) && isOwnedByDonor(l));
        } else if (role === 'recipient') {
          extras = base.filter(l => isClaimedStatus(statusOf(l)) && isClaimedByMe(l));
        }
        // Merge without duplicates by id
        const byId = new Map();
        for (const l of availableOnly) byId.set(String(l.id), l);
        for (const l of extras) byId.set(String(l.id), l);
        base = Array.from(byId.values());
      } else {
        // statusFilter === 'all' — hide irrelevant claimed based on role
        base = base.filter(l => {
          const s = statusOf(l);
          if (!isClaimedStatus(s)) return true;
          if (role === 'donor') return isOwnedByDonor(l);
          if (role === 'recipient') return isClaimedByMe(l);
          // unauth/other roles: hide claimed
          return false;
        });
      }

      console.log(`Filtering listings: ${listings.length} total -> ${base.length} filtered (status=${statusFilter}, role=${role}, uid=${uid})`);
      setFilteredListings(base);
    } catch (error) {
      console.error('Error in filtering effect:', error);
      setFilteredListings([]);
    }
  }, [listings, filters, user]);

  const handleClaimListing = async (listingId) => {
    // Require auth
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const role = String(user.role || '').toLowerCase();
    if (role !== 'recipient') {
      if (typeof window.showAlert === 'function') window.showAlert('Only recipients can claim food.', { title: 'Not allowed', variant: 'error' });
      return;
    }

    // Ensure listing is available
    const listing = (listings || []).find(l => String(l.id) === String(listingId));
    const status = String(listing?.status || '').toLowerCase();
    if (status && status !== 'available') {
      if (typeof window.showAlert === 'function') window.showAlert(status === 'claimed' ? 'This listing has already been claimed.' : 'This listing is not available to claim.', { title: 'Unavailable', variant: 'error' });
      return;
    }

    // Ensure token exists
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Ensure user has a phone number before claiming
      try {
        if (window.userAPI && typeof window.userAPI.getMeV2 === 'function') {
          const me = await window.userAPI.getMeV2();
          const phone = (me && me.phone) ? String(me.phone).trim() : '';
          if (!phone || phone.length < 7) {
            const ok = await requestPhone();
            if (!ok) {
              if (typeof window.showAlert === 'function') window.showAlert('A phone number is required to claim food.', { title: 'Phone required', variant: 'error' });
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Phone precheck failed or unavailable; proceeding to server enforcement');
      }

      let updatedListing = null;

      // Use dedicated claim endpoint
      if (window.listingAPI && typeof window.listingAPI.claim === 'function') {
        try {
          const resp = await window.listingAPI.claim(listingId, user.id, { timeout: 10000 });
          // Backend returns { success, message } or possibly an updated listing
          if (resp && resp.listing) {
            updatedListing = resp.listing;
          }
        } catch (err) {
          // Surface helpful messages on auth/permission/network
          const msg = String(err?.message || '');
          if (/401/.test(msg)) {
            if (typeof window.showAlert === 'function') window.showAlert('Your session has expired. Please sign in again.', { title: 'Session expired', variant: 'error' });
            setShowAuthModal(true);
            return;
          }
          if (/403/.test(msg)) {
            if (typeof window.showAlert === 'function') window.showAlert('You are not allowed to claim this listing.', { title: 'Not allowed', variant: 'error' });
            return;
          }
          if (/timeout|abort/i.test(msg)) {
            if (typeof window.showAlert === 'function') window.showAlert('The server did not respond in time. Please try again.', { title: 'Timeout', variant: 'error' });
            return;
          }
          console.warn('listingAPI.claim failed:', err);
        }
      }

      // Fallback: try updating locally if API did not return listing
      if (!updatedListing && databaseConnected && window.databaseService && typeof window.databaseService.updateListingStatus === 'function') {
        try {
          const result = await window.databaseService.updateListingStatus(listingId, 'claimed', user.id);
          if (result && result.success && result.data) {
            updatedListing = result.data;
          }
        } catch (e) {
          console.warn('databaseService.updateListingStatus failed:', e);
        }
      }

      // Update client state
      if (updatedListing) {
        const updatedListings = listings.map(l => String(l.id) === String(listingId) ? ({ ...l, ...updatedListing, status: (updatedListing.status || 'claimed'), recipient_id: (updatedListing.recipient_id ?? user.id) }) : l);
        setListings(updatedListings);
        setFilteredListings(updatedListings);
        // Sync snapshot so map and other globals see latest state
        try {
          if (window.databaseService && Array.isArray(window.databaseService.listings)) {
            const idx = window.databaseService.listings.findIndex(li => String(li.id) === String(listingId));
            if (idx !== -1) {
              window.databaseService.listings[idx] = { ...window.databaseService.listings[idx], status: (updatedListing.status || 'claimed'), recipient_id: (updatedListing.recipient_id ?? user.id) };
            }
          }
        } catch (_) { }
      } else {
        // optimistic update
        const updatedListings = listings.map(l => String(l.id) === String(listingId) ? ({ ...l, status: 'claimed', recipient_id: user.id }) : l);
        setListings(updatedListings);
        setFilteredListings(updatedListings);
        // Sync snapshot
        try {
          if (window.databaseService && Array.isArray(window.databaseService.listings)) {
            const idx = window.databaseService.listings.findIndex(li => String(li.id) === String(listingId));
            if (idx !== -1) {
              window.databaseService.listings[idx] = { ...window.databaseService.listings[idx], status: 'claimed', recipient_id: user.id };
            }
          }
        } catch (_) { }
      }

      // Always show confirmation modal for pending_confirmation status
      const needsConfirmation = updatedListing && (updatedListing.status === 'pending_confirmation' || updatedListing.needs_confirmation);
      
      if (needsConfirmation) {
        setPendingClaimId(listingId);
        setPendingClaimListing(listing);
        setShowClaimConfirmationModal(true);
        if (typeof window.showAlert === 'function') window.showAlert('Check your phone for confirmation code.', { title: 'Code Sent', variant: 'info' });
      } else {
        if (typeof window.showAlert === 'function') window.showAlert('Listing claimed successfully!', { title: 'Success', variant: 'success' });
      }
      // Persist a local record that this user claimed this listing (fallback if backend lacks recipient_id)
      try {
        const uid = String(user.id);
        const key = `my_claimed_ids:${uid}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        if (!arr.includes(String(listingId))) {
          arr.push(String(listingId));
          localStorage.setItem(key, JSON.stringify(arr));
        }
      } catch (_) { }

      // Refresh listings from server to get updated status
      try {
        await initializeApp();
      } catch (e) {
        console.warn('Failed to refresh listings after claim:', e);
      }
    } catch (error) {
      console.error('Error claiming listing:', error);
      if (typeof window.showAlert === 'function') window.showAlert('Failed to claim listing. Please try again.', { title: 'Error', variant: 'error' });
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
    // If listing is pending confirmation and user is the claimant, show confirmation modal
    const listingStatus = String(listing.status || '').toLowerCase();
    
    // Check localStorage for claimed listings
    const isClaimedByMe = (() => {
      if (!user) return false;
      const userId = String(user.id);
      try {
        const key = `my_claimed_ids:${userId}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(arr) && arr.includes(String(listing.id));
      } catch (_) {
        return false;
      }
    })();
    
    if (listingStatus === 'pending_confirmation' && user && isClaimedByMe) {
      setPendingClaimId(listing.id);
      setPendingClaimListing(listing);
      setShowClaimConfirmationModal(true);
      return;
    }
    setSelectedListing(listing);
    setShowDetailModal(true);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
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

    //Allw nested components to trigger the auth modal
    window.showForgotPasswordModal = () => {
      setShowAuthModal(false);
      setShowForgotPasswordModal(true);
    };

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

    // Setup global user profile callback
    window.openUserProfile = () => {
      setShowUserProfile(true);
    };

    // Setup distribution map callback
    window.openDistributionMap = () => {
      setShowDistributionMap(true);
    };

    // Setup store owner dashboard callback
    window.openStoreOwnerDashboard = () => {
      setShowStoreOwnerDashboard(true);
    };

    // Setup admin panel callback
    window.openAdminPanel = () => {
      setCurrentView('admin');
    };

    // Setup listing detail modal trigger
    window.triggerListingDetailModal = (listing) => {
      setSelectedListing(listing);
      setShowDetailModal(true);
    };

    return () => {
      delete window.handleClaimListing;
      delete window.handleShowDetails;
      delete window.showAISearch;
      delete window.showFoodSearch;
      delete window.showDetailedModal;
      delete window.openStoreMenu;
      delete window.openAuthModal;
      delete window.openUserProfile;
      delete window.openDistributionMap;
      delete window.openStoreOwnerDashboard;
      delete window.triggerListingDetailModal;
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
                task.id === taskId ? { ...task, status } : task
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
                      onSelect={handleShowDetails}
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
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${viewMode === 'map'
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'text-gray-600 hover:text-[var(--primary-color)]'
                    }`}
                >
                  <div className="icon-map text-lg mr-1"></div>
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center ${viewMode === 'list'
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

        {showForgotPasswordModal && (
          <ForgotPasswordModal
            onClose={() => setShowForgotPasswordModal(false)}
            onBackToLogin={() => {
              setShowForgotPasswordModal(false);
              setShowAuthModal(true);
            }}
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

        {/* Phone Modal */}
        {typeof PhoneModal !== 'undefined' && (
          <PhoneModal
            isOpen={phoneModalOpen}
            onClose={handlePhoneClose}
            onSubmit={handlePhoneSubmit}
            initialPhone={phoneInitialRef.current}
          />
        )}

        {/* Alert Modal */}
        {typeof AlertModal !== 'undefined' && (
          <AlertModal
            isOpen={alertOpen}
            title={alertData.title}
            message={alertData.message}
            variant={alertData.variant}
            onClose={handleAlertClose}
          />
        )}

        {/* Confirmation Modal */}
        {typeof ConfirmationModal !== 'undefined' && (
          <ConfirmationModal
            isOpen={showConfirmationModal}
            listingId={pendingClaimId}
            onClose={() => {
              setShowConfirmationModal(false);
              setPendingClaimId(null);
            }}
            onConfirmed={() => {
              // Refresh listings after confirmation
              window.location.reload();
            }}
          />
        )}

        {/* Claim Confirmation Modal */}
        {typeof ClaimConfirmationModal !== 'undefined' && (
          <ClaimConfirmationModal
            isOpen={showClaimConfirmationModal}
            listing={pendingClaimListing}
            onClose={() => {
              setShowClaimConfirmationModal(false);
              setPendingClaimListing(null);
            }}
            onConfirm={() => {
              setShowClaimConfirmationModal(false);
              setPendingClaimListing(null);
              // Refresh listings
              window.location.reload();
            }}
          />
        )}

        {/* User Profile Modal */}
        {showUserProfile && (
          <UserProfile
            user={user}
            onClose={() => setShowUserProfile(false)}
            onUserUpdate={setUser}
          />
        )}

        {/* Distribution Center Map */}
        {showDistributionMap && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="h-full flex flex-col">
              <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">🏪 Distribution Centers</h1>
                <button
                  onClick={() => setShowDistributionMap(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="flex-1">
                <DistributionCenterMap user={user} />
              </div>
            </div>
          </div>
        )}

        {/* Store Owner Dashboard */}
        {showStoreOwnerDashboard && (
          <StoreOwnerDashboard
            user={user}
            onClose={() => setShowStoreOwnerDashboard(false)}
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

// Render PhoneModal portal at body end via React 18 root if needed from global
// Integrate into App by appending JSX for PhoneModal
