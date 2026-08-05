function AdminPanel({ onClose }) {
  try {
    const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200';
    const [activeTab, setActiveTab] = React.useState('overview');
    const [exportStatus, setExportStatus] = React.useState(null);
    const [dbStats, setDbStats] = React.useState({});
    const [centers, setCenters] = React.useState([]);
    const [showCenterForm, setShowCenterForm] = React.useState(false);
    const [editingCenter, setEditingCenter] = React.useState(null);
    const emptyCenterForm = {
      name: '',
      description: '',
      address: '',
      phone: '',
      hours: '',
      coords_lat: '',
      coords_lng: '',
      eligibility: '',
      languages: '',
      availability: '',
      website: '',
      social_media: '',
      coverage_areas: '',
      provider_types: '',
      logo_url: ''
    };
    const [centerForm, setCenterForm] = React.useState({ ...emptyCenterForm });
    const providerTypeOptions = (typeof window !== 'undefined' && Array.isArray(window.PROVIDER_TYPE_TAGS))
      ? window.PROVIDER_TYPE_TAGS
      : [
          'Food pantry', 'Mobile food pantry', 'Home delivery', 'Community fridge',
          'Community meal / hot meals', 'Senior meal program', 'School meal program',
          'Food box distribution', 'Grocery assistance', 'Farmers market',
          'Produce distribution', 'Food rescue', 'Community Closet',
          'School food distribution', 'Meal preparation program'
        ];
    const parseCenterTypes = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      } catch (_) { /* ignore */ }
      return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    };
    const selectedProviderTypes = parseCenterTypes(centerForm.provider_types);
    const toggleProviderType = (tag) => {
      const next = selectedProviderTypes.includes(tag)
        ? selectedProviderTypes.filter((t) => t !== tag)
        : [...selectedProviderTypes, tag];
      setCenterForm({ ...centerForm, provider_types: JSON.stringify(next) });
    };
    const availabilityOptions = [
      { value: '', label: 'Not specified' },
      { value: 'open', label: 'Open / Walk-in welcome' },
      { value: 'limited', label: 'Limited availability' },
      { value: 'appointment', label: 'Appointment / registration required' },
      { value: 'first_come', label: 'First come, first served' },
      { value: 'seasonal', label: 'Seasonal / schedule varies' },
      { value: 'closed', label: 'Temporarily closed' },
    ];
    const [referralStats, setReferralStats] = React.useState([]);
    const [referralLoading, setReferralLoading] = React.useState(false);
    const [listings, setListings] = React.useState([]);
    const [listingsLoading, setListingsLoading] = React.useState(false);
    const [showFeedbackViewer, setShowFeedbackViewer] = React.useState(false);
    const [centersError, setCentersError] = React.useState('');
    const [referralsError, setReferralsError] = React.useState('');
    const [listingsError, setListingsError] = React.useState('');
    const [users, setUsers] = React.useState([]);
    const [userCounts, setUserCounts] = React.useState({ all: 0, donor: 0, recipient: 0, admin: 0, driver: 0, volunteer: 0 });
    const [usersLoading, setUsersLoading] = React.useState(false);
    const [usersError, setUsersError] = React.useState('');
    const [userRoleFilter, setUserRoleFilter] = React.useState('all');
    const [userSearch, setUserSearch] = React.useState('');
    const [listingCategories, setListingCategories] = React.useState([]);
    const [listingCategoriesLoading, setListingCategoriesLoading] = React.useState(false);
    const [listingCategoriesError, setListingCategoriesError] = React.useState('');
    const [listingCategoriesSaving, setListingCategoriesSaving] = React.useState(false);

    const listingCategoryOptions = listingCategories.length
      ? listingCategories.filter((c) => c.is_active !== false).map((c) => ({ value: c.value, label: c.label }))
      : [
          { value: 'produce', label: 'Fresh Produce' },
          { value: 'prepared', label: 'Prepared Meals' },
          { value: 'packaged', label: 'Packaged Foods' },
          { value: 'bakery', label: 'Bakery Items' },
          { value: 'water', label: 'Water' },
          { value: 'fruit', label: 'Fruit' },
          { value: 'leftovers', label: 'Leftovers' },
        ];

    const normalizeListing = (listing) => ({
      id: listing.id,
      image_url: listing.image_url || (Array.isArray(listing.images) ? listing.images[0] : null),
      name: listing.name || listing.title || 'Untitled listing',
      description: listing.description || '',
      quantity: listing.quantity || (listing.qty != null ? `${listing.qty} ${listing.unit || ''}`.trim() : 'N/A'),
      location: listing.location || listing.address || 'Unknown',
      expiry_date: listing.expiry_date || listing.expiration_date,
      user_name: listing.user_name || listing.donor?.name || 'Unknown',
      status: listing.status || 'available',
      category: listing.category || '',
    });

    React.useEffect(() => {
      loadDatabaseStats();
      if (activeTab === 'centers') {
        loadCenters();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'referrals') {
        loadReferralStats();
      } else if (activeTab === 'listings') {
        loadListings();
      } else if (activeTab === 'categories') {
        loadListingCategories();
      }
    }, [activeTab]);

    React.useEffect(() => {
      if (activeTab === 'users') {
        loadUsers();
      }
    }, [userRoleFilter]);

    const loadCenters = async () => {
      try {
        setCentersError('');
        const token = localStorage.getItem('auth_token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/centers', { headers });
        console.log('AdminPanel: Centers response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('AdminPanel: Loaded centers:', data);
          setCenters(data);
        } else {
          console.error('AdminPanel: Failed to load centers:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('AdminPanel: Error details:', errorData);
          setCentersError(errorData.detail || 'Failed to load centers');
        }
      } catch (error) {
        console.error('Error loading centers:', error);
        setCentersError('Failed to load centers');
      }
    };

    const handleSaveCenter = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const url = editingCenter ? `/api/centers/${editingCenter.id}` : '/api/centers';
        const method = editingCenter ? 'PUT' : 'POST';

        const types = parseCenterTypes(centerForm.provider_types);
        const payload = {
          ...centerForm,
          coords_lat: centerForm.coords_lat === '' || centerForm.coords_lat == null
            ? null
            : Number(centerForm.coords_lat),
          coords_lng: centerForm.coords_lng === '' || centerForm.coords_lng == null
            ? null
            : Number(centerForm.coords_lng),
          provider_types: JSON.stringify(types),
          logo_url: centerForm.logo_url || null,
        };

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setShowCenterForm(false);
          setEditingCenter(null);
          setCenterForm({ ...emptyCenterForm });
          loadCenters();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to save center');
        }
      } catch (error) {
        console.error('Error saving center:', error);
        alert('Failed to save center');
      }
    };

    const handleUpdateCenterCategories = async (center, nextTypes) => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/centers/${center.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            provider_types: JSON.stringify(nextTypes || [])
          })
        });
        if (response.ok) {
          loadCenters();
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Failed to update categories');
        }
      } catch (error) {
        console.error('Error updating categories:', error);
        alert('Failed to update categories');
      }
    };

    const handleEditCenter = (center) => {
      setCenterForm({
        name: center.name || '',
        description: center.description || '',
        address: center.address || '',
        phone: center.phone || '',
        hours: center.hours || '',
        coords_lat: center.coords_lat || '',
        coords_lng: center.coords_lng || '',
        eligibility: center.eligibility || '',
        languages: center.languages || '',
        availability: center.availability || '',
        website: center.website || '',
        social_media: center.social_media || '',
        coverage_areas: center.coverage_areas || '',
        provider_types: center.provider_types
          ? (typeof center.provider_types === 'string'
              ? center.provider_types
              : JSON.stringify(center.provider_types))
          : '',
        logo_url: center.logo_url || ''
      });
      setEditingCenter(center);
      setShowCenterForm(true);
      setTimeout(() => {
        try {
          const el = document.getElementById('admin-center-form');
          if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (_) { /* ignore */ }
      }, 50);
    };

    const handleDeleteCenter = async (centerId) => {
      if (!confirm('Are you sure you want to delete this distribution center?')) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/centers/${centerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          loadCenters();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to delete center');
        }
      } catch (error) {
        console.error('Error deleting center:', error);
        alert('Failed to delete center');
      }
    };

    const loadReferralStats = async () => {
      setReferralLoading(true);
      try {
        setReferralsError('');
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/referrals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReferralStats(data);
        } else {
          const error = await response.json().catch(() => ({}));
          setReferralsError(error.detail || 'Failed to load referral analytics');
        }
      } catch (error) {
        console.error('Error loading referral stats:', error);
        setReferralsError('Failed to load referral analytics');
      } finally {
        setReferralLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        setUsersError('');
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams();
        if (userRoleFilter && userRoleFilter !== 'all') {
          params.set('role', userRoleFilter);
        }
        const qs = params.toString();
        const response = await fetch(`/api/admin/users${qs ? `?${qs}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data.users) ? data.users : []);
          setUserCounts(data.counts || { all: 0, donor: 0, recipient: 0, admin: 0, driver: 0, volunteer: 0 });
        } else {
          const error = await response.json().catch(() => ({}));
          setUsersError(error.detail || 'Failed to load users');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setUsersError('Failed to load users');
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    const loadListings = async () => {
      setListingsLoading(true);
      try {
        setListingsError('');
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/listings/get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setListings(Array.isArray(data) ? data.map(normalizeListing) : []);
        } else {
          const error = await response.json().catch(() => ({}));
          setListingsError(error.detail || 'Failed to load listings');
        }
      } catch (error) {
        console.error('Error loading listings:', error);
        setListingsError('Failed to load listings');
      } finally {
        setListingsLoading(false);
      }
    };

    const handleDeleteListing = async (listingId) => {
      if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/listings/get/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Listing deleted successfully');
          // Notify the main app so React state and the map refresh too.
          try {
            window.dispatchEvent(new CustomEvent('listingDeleted', { detail: { id: listingId } }));
          } catch (e) { /* ignore */ }
          loadListings();
        } else {
          const error = await response.json();
          alert(error.detail || 'Failed to delete listing');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      }
    };

    const handleUpdateListingCategory = async (listing, nextCategory) => {
      if (!listing?.id || !nextCategory || nextCategory === listing.category) return;
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/listings/get/${listing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ category: nextCategory }),
        });
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const next = (data.listing && data.listing.category) || nextCategory;
          setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, category: next } : l)));
          try {
            window.dispatchEvent(new CustomEvent('listingUpdated', {
              detail: data.listing || { id: listing.id, category: next },
            }));
          } catch (_) { /* ignore */ }
        } else {
          const error = await response.json().catch(() => ({}));
          alert(error.detail || 'Failed to update category');
        }
      } catch (error) {
        console.error('Error updating listing category:', error);
        alert('Failed to update category');
      }
    };

    const loadListingCategories = async () => {
      setListingCategoriesLoading(true);
      setListingCategoriesError('');
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data.categories) ? data.categories : [];
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setListingCategories(list);
        } else {
          const error = await response.json().catch(() => ({}));
          setListingCategoriesError(error.detail || 'Failed to load categories');
        }
      } catch (error) {
        console.error('Error loading listing categories:', error);
        setListingCategoriesError('Failed to load categories');
      } finally {
        setListingCategoriesLoading(false);
      }
    };

    const updateListingCategoryField = (id, patch) => {
      setListingCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    };

    const moveListingCategory = (id, direction) => {
      setListingCategories((prev) => {
        const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const idx = sorted.findIndex((c) => c.id === id);
        if (idx < 0) return prev;
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= sorted.length) return prev;
        const a = sorted[idx];
        const b = sorted[swapWith];
        const aOrder = a.sort_order;
        sorted[idx] = { ...a, sort_order: b.sort_order };
        sorted[swapWith] = { ...b, sort_order: aOrder };
        return sorted.sort((x, y) => (x.sort_order || 0) - (y.sort_order || 0));
      });
    };

    const saveListingCategories = async () => {
      setListingCategoriesSaving(true);
      setListingCategoriesError('');
      try {
        const token = localStorage.getItem('auth_token');
        const payload = {
          categories: listingCategories.map((c, i) => ({
            id: c.id,
            label: c.label,
            is_active: c.is_active,
            sort_order: c.sort_order != null ? c.sort_order : i + 1,
          })),
        };
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data.categories) ? data.categories : [];
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setListingCategories(list);
          window.LISTING_CATEGORIES = list
            .filter((c) => c.is_active !== false)
            .map((c) => ({ value: c.value, label: c.label }));
          try {
            window.dispatchEvent(new CustomEvent('listingCategoriesUpdated', {
              detail: { categories: window.LISTING_CATEGORIES },
            }));
          } catch (_) { /* ignore */ }
          alert('Categories saved. The main page filter list will update on refresh.');
        } else {
          const error = await response.json().catch(() => ({}));
          setListingCategoriesError(error.detail || 'Failed to save categories');
        }
      } catch (error) {
        console.error('Error saving listing categories:', error);
        setListingCategoriesError('Failed to save categories');
      } finally {
        setListingCategoriesSaving(false);
      }
    };

    const loadDatabaseStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const statsResp = await fetch('/api/admin/stats', { headers });
        if (statsResp.ok) {
          const stats = await statsResp.json();
          setDbStats({
            users: stats.users || 0,
            listings: stats.listings || 0,
            schedules: stats.schedules || 0,
            tasks: stats.tasks || 0,
            connected: stats.connected !== false
          });
          return;
        }

        // Fallback for non-admin sessions: show what we can and mark disconnected.
        const [listingsResp, centersResp] = await Promise.all([
          fetch('/api/listings/get?limit=500', { headers }),
          fetch('/api/centers', { headers })
        ]);

        const listingsData = listingsResp.ok ? await listingsResp.json() : [];
        const centersData = centersResp.ok ? await centersResp.json() : [];

        setDbStats({
          users: 0,
          listings: Array.isArray(listingsData) ? listingsData.length : 0,
          schedules: 0,
          tasks: Array.isArray(centersData) ? centersData.filter(c => c.is_active).length : 0,
          connected: false
        });
      } catch (error) {
        console.error('Error loading database stats:', error);
        setDbStats({ users: 0, listings: 0, schedules: 0, tasks: 0, connected: false });
      }
    };

    const handleExportData = async () => {
      setExportStatus('exporting');
      try {
        const result = await window.exportToSupabase.downloadExport();
        if (result.success) {
          setExportStatus('success');
          setTimeout(() => setExportStatus(null), 3000);
        } else {
          setExportStatus('error');
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (error) {
        console.error('Export error:', error);
        setExportStatus('error');
        setTimeout(() => setExportStatus(null), 3000);
      }
    };

    const handleSupabaseMigration = async () => {
      setExportStatus('migrating');
      try {
        const result = await window.supabaseExporter.downloadSupabaseMigration();
        if (result.success) {
          setExportStatus('migration_success');
          setTimeout(() => setExportStatus(null), 3000);
        } else {
          setExportStatus('migration_error');
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (error) {
        console.error('Migration error:', error);
        setExportStatus('migration_error');
        setTimeout(() => setExportStatus(null), 3000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-5"
        data-name="admin-panel" data-file="components/AdminPanel.js">
        <div className="bg-white rounded-lg w-[min(96vw,1100px)] max-h-[90dvh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 pt-4 sm:px-6 sm:pt-6">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          <div className="px-4 pb-4 sm:px-6 sm:pb-6 overflow-y-auto overflow-x-hidden min-w-0">

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'users', label: 'Users', icon: 'users' },
                { id: 'centers', label: 'Distribution Centers', icon: 'map-pin' },
                { id: 'listings', label: 'Listings', icon: 'package' },
                { id: 'categories', label: 'Categories', icon: 'tags' },
                { id: 'referrals', label: 'Referrals', icon: 'user-plus' },
                { id: 'feedback', label: 'Feedback', icon: 'message-square' },
                { id: 'messages', label: 'Messages', icon: 'message-circle' },
                { id: 'ai_broadcasts', label: 'AI Broadcasts', icon: 'megaphone' },
                { id: 'database', label: 'Database', icon: 'database' },
                { id: 'export', label: 'Export', icon: 'download' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className={`icon-${tab.icon} mr-2`}></div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-users text-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{dbStats.users}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-package text-green-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Food Listings</p>
                    <p className="text-2xl font-bold text-green-600">{dbStats.listings}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-orange-50 border-orange-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-calendar text-orange-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Schedules</p>
                    <p className="text-2xl font-bold text-orange-600">{dbStats.schedules}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-list-checks text-purple-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">{dbStats.tasks}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'centers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Distribution Centers</h3>
                <button
                  onClick={() => {
                    setCenterForm({ ...emptyCenterForm });
                    setEditingCenter(null);
                    setShowCenterForm(true);
                  }}
                  className="btn-primary flex items-center"
                >
                  <div className="icon-plus mr-2"></div>
                  Add Center
                </button>
              </div>

              {showCenterForm && (
                <div className="card" id="admin-center-form">
                  <h4 className="text-md font-semibold mb-4">
                    {editingCenter ? 'Edit Distribution Center' : 'Add New Distribution Center'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Center Name"
                      value={centerForm.name}
                      onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={centerForm.phone}
                      onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                      className={inputClass}
                    />
                    <textarea
                      placeholder="Description"
                      value={centerForm.description}
                      onChange={(e) => setCenterForm({ ...centerForm, description: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                      rows="2"
                    ></textarea>
                    <input
                      type="text"
                      placeholder="Address"
                      value={centerForm.address}
                      onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                    />
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={centerForm.coords_lat}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lat: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={centerForm.coords_lng}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lng: e.target.value })}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!centerForm.address) {
                            alert('Please enter an address first');
                            return;
                          }
                          try {
                            const mapboxToken = window.MAPBOX_ACCESS_TOKEN;
                            if (!mapboxToken) {
                              alert('Mapbox token not configured');
                              return;
                            }
                            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(centerForm.address)}.json?access_token=${encodeURIComponent(mapboxToken)}&limit=1`);
                            const data = await response.json();
                            if (data.features && data.features[0]) {
                              const [lng, lat] = data.features[0].center;
                              setCenterForm({ ...centerForm, coords_lat: lat, coords_lng: lng });
                              alert('Coordinates found!');
                            } else {
                              alert('Could not find coordinates for this address');
                            }
                          } catch (error) {
                            console.error('Geocoding error:', error);
                            alert('Failed to geocode address');
                          }
                        }}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <div className="icon-map-pin mr-1"></div>
                        Geocode
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Operating Hours (e.g., Mon-Fri 9AM-5PM)"
                      value={centerForm.hours}
                      onChange={(e) => setCenterForm({ ...centerForm, hours: e.target.value })}
                      className={`${inputClass} md:col-span-2`}
                    />

                    <div className="md:col-span-2 rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-green-900">Categories</h5>
                        <p className="text-xs text-green-800 mt-1">
                          Select all provider types that apply. These power filters on the Providers page.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {providerTypeOptions.map((tag) => {
                          const on = selectedProviderTypes.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleProviderType(tag)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                on
                                  ? 'bg-green-700 text-white border-green-700'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                      {selectedProviderTypes.length > 0 && (
                        <p className="text-xs text-green-800">
                          Selected: {selectedProviderTypes.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-amber-900">Additional location details</h5>
                        <p className="text-xs text-amber-800 mt-1">
                          Optional fields shown on the map location card.
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                          type="text"
                          placeholder="/logos/AGLfoundationLOGO.png or https://..."
                          value={centerForm.logo_url || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, logo_url: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                        <select
                          value={centerForm.availability || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, availability: e.target.value })}
                          className={inputClass}
                        >
                          {availabilityOptions.map((opt) => (
                            <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Eligibility</label>
                        <textarea
                          placeholder="Who can receive food, ID requirements, etc."
                          value={centerForm.eligibility || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, eligibility: e.target.value })}
                          className={inputClass}
                          rows="2"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Languages spoken on-site</label>
                        <input
                          type="text"
                          placeholder="e.g., English, Spanish"
                          value={centerForm.languages || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, languages: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Coverage areas</label>
                        <textarea
                          placeholder="Neighborhoods / areas served"
                          value={centerForm.coverage_areas || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, coverage_areas: e.target.value })}
                          className={inputClass}
                          rows="2"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={centerForm.website || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, website: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Social media accounts</label>
                        <textarea
                          placeholder="Facebook, Instagram, etc."
                          value={centerForm.social_media || ''}
                          onChange={(e) => setCenterForm({ ...centerForm, social_media: e.target.value })}
                          className={inputClass}
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setShowCenterForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCenter}
                      className="btn-primary"
                    >
                      {editingCenter ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {centersError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{centersError}</div>
                )}
                {centers.map(center => {
                  const centerTypes = parseCenterTypes(center.provider_types);
                  return (
                  <div key={center.id} className="card">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg">{center.name}</h4>
                        <p className="text-gray-600 mb-2">{center.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Address:</strong> {center.address}</p>
                          {center.coords_lat && center.coords_lng && (
                            <p><strong>Coordinates:</strong> {center.coords_lat}, {center.coords_lng}</p>
                          )}
                          <p><strong>Phone:</strong> {center.phone || '—'}</p>
                          <p><strong>Hours:</strong> {center.hours || '—'}</p>
                          <p><strong>Status:</strong>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${center.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {center.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>

                        <div className="mt-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Categories</p>
                            <span className="text-xs text-green-700">{centerTypes.length} selected</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {providerTypeOptions.map((tag) => {
                              const on = centerTypes.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  title={on ? `Remove ${tag}` : `Add ${tag}`}
                                  onClick={() => {
                                    const next = on
                                      ? centerTypes.filter((t) => t !== tag)
                                      : [...centerTypes, tag];
                                    handleUpdateCenterCategories(center, next);
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                    on
                                      ? 'bg-green-700 text-white border-green-700'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
                                  }`}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {(() => {
                          const Details = window.DistributionCenterDetails;
                          return typeof Details === 'function'
                            ? <Details center={center} compact={true} showCategories={false} />
                            : null;
                        })()}
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 shrink-0">
                        {(() => {
                          const ShareBtn = window.DistributionCenterShareButton;
                          return typeof ShareBtn === 'function'
                            ? <ShareBtn center={center} />
                            : null;
                        })()}
                        <button
                          onClick={() => handleEditCenter(center)}
                          className="btn-secondary text-sm"
                        >
                          <div className="icon-edit mr-1"></div>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCenter(center.id)}
                          className="btn-danger text-sm"
                        >
                          <div className="icon-trash mr-1"></div>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
                {centers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No distribution centers found. Add one to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold">All Users</h3>
                <button
                  onClick={loadUsers}
                  className="btn-secondary flex items-center self-start"
                >
                  <div className="icon-refresh-cw mr-2"></div>
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'all', label: 'All', active: 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' },
                  { key: 'donor', label: 'Donors', active: 'bg-green-50 border-green-400 ring-1 ring-green-300' },
                  { key: 'recipient', label: 'Recipients', active: 'bg-orange-50 border-orange-400 ring-1 ring-orange-300' },
                  { key: 'admin', label: 'Admins', active: 'bg-purple-50 border-purple-400 ring-1 ring-purple-300' },
                ].map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setUserRoleFilter(card.key)}
                    className={`card text-left border ${
                      userRoleFilter === card.key
                        ? card.active
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {userCounts[card.key] ?? 0}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, or referral code…"
                  className={inputClass + ' sm:flex-1'}
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className={inputClass + ' sm:w-48'}
                >
                  <option value="all">All roles</option>
                  <option value="donor">Donors</option>
                  <option value="recipient">Recipients</option>
                  <option value="admin">Admins</option>
                  <option value="driver">Drivers</option>
                  <option value="volunteer">Volunteers</option>
                </select>
              </div>

              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  {usersError && (
                    <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{usersError}</div>
                  )}
                  {(() => {
                    const needle = userSearch.trim().toLowerCase();
                    const visible = users.filter((u) => {
                      if (!needle) return true;
                      const hay = [
                        u.name, u.email, u.phone, u.role, u.referral_code, u.address, u.referred_by_code
                      ].filter(Boolean).join(' ').toLowerCase();
                      return hay.includes(needle);
                    });
                    return (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          Showing <strong className="text-gray-900">{visible.length}</strong> user{visible.length === 1 ? '' : 's'}
                          {userRoleFilter !== 'all' ? ` (${userRoleFilter}s)` : ''}
                        </p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-gray-600">
                              <th className="py-2 pr-3">Name</th>
                              <th className="py-2 pr-3">Email</th>
                              <th className="py-2 pr-3">Role</th>
                              <th className="py-2 pr-3">Phone</th>
                              <th className="py-2 pr-3">Referral code</th>
                              <th className="py-2 pr-3">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visible.map((user) => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-2.5 pr-3 font-medium text-gray-900">{user.name || '—'}</td>
                                <td className="py-2.5 pr-3 text-gray-700">{user.email || '—'}</td>
                                <td className="py-2.5 pr-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                    user.role === 'donor' ? 'bg-green-100 text-green-800' :
                                    user.role === 'recipient' ? 'bg-orange-100 text-orange-800' :
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {user.role || 'unknown'}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-3 text-gray-700">{user.phone || '—'}</td>
                                <td className="py-2.5 pr-3">
                                  {user.referral_code ? (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.referral_code}</code>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">
                                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {visible.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            No users match these filters.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Referral Analytics</h3>
                <button
                  onClick={loadReferralStats}
                  className="btn-secondary flex items-center"
                >
                  <div className="icon-refresh-cw mr-2"></div>
                  Refresh
                </button>
              </div>

              {referralLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading referral data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referralsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{referralsError}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-blue-50 border-blue-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-users text-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Referrers</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {referralStats.filter(r => r.referral_count > 0).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-green-50 border-green-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-user-plus text-green-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Referrals</p>
                          <p className="text-2xl font-bold text-green-600">
                            {referralStats.reduce((sum, r) => sum + r.referral_count, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-purple-50 border-purple-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <div className="icon-trending-up text-purple-600"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg per Referrer</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {referralStats.length > 0 ?
                              Math.round(referralStats.reduce((sum, r) => sum + r.referral_count, 0) / referralStats.filter(r => r.referral_count > 0).length * 10) / 10 || 0
                              : 0
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4">Top Referrers</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">User</th>
                            <th className="text-left py-2">Email</th>
                            <th className="text-left py-2">Referral Code</th>
                            <th className="text-right py-2">Referrals</th>
                            <th className="text-left py-2">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralStats
                            .sort((a, b) => b.referral_count - a.referral_count)
                            .slice(0, 10)
                            .map(user => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 font-medium">{user.name}</td>
                                <td className="py-2 text-gray-600">{user.email}</td>
                                <td className="py-2">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {user.referral_code}
                                  </code>
                                </td>
                                <td className="py-2 text-right">
                                  <span className={`px-2 py-1 rounded-full text-sm ${user.referral_count > 5 ? 'bg-green-100 text-green-800' :
                                    user.referral_count > 2 ? 'bg-blue-100 text-blue-800' :
                                      user.referral_count > 0 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.referral_count}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-600 text-sm">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {referralStats.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No referral data available yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4">Recent Referrals</h4>
                    <div className="space-y-2">
                      {referralStats
                        .filter(user => user.referred_users && user.referred_users.length > 0)
                        .slice(0, 5)
                        .map(referrer =>
                          referrer.referred_users.map(referred => (
                            <div key={`${referrer.id}-${referred.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{referred.name}</span>
                                <span className="text-gray-600 ml-2">({referred.email})</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Referred by <span className="font-medium">{referrer.name}</span>
                                <span className="ml-2">{new Date(referred.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      {referralStats.filter(u => u.referred_users && u.referred_users.length > 0).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No recent referrals to display.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Food Listings Management</h3>
                <button
                  onClick={loadListings}
                  className="btn-secondary flex items-center"
                >
                  <div className="icon-refresh-cw mr-2"></div>
                  Refresh
                </button>
              </div>

              {listingsLoading ? (
                <div className="text-center py-8">
                  <div className="icon-loader-2 animate-spin text-2xl text-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading listings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listingsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{listingsError}</div>
                  )}
                  {listings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No listings found.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.map(listing => (
                        <div key={listing.id} className="card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                {listing.image_url && (
                                  <img
                                    src={listing.image_url}
                                    alt={listing.name}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{listing.name}</h4>
                                  <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                                  <div className="text-sm text-gray-500 space-y-1">
                                    <p><strong>Quantity:</strong> {listing.quantity}</p>
                                    <p><strong>Location:</strong> {listing.location}</p>
                                    <p><strong>Expires:</strong> {listing.expiry_date ? new Date(listing.expiry_date).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Posted by:</strong> {listing.user_name || 'Unknown'}</p>
                                    <p><strong>Status:</strong>
                                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${listing.status === 'available' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                        {listing.status}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50/60 p-3">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Category</p>
                                      <span className="text-xs text-green-700">
                                        {listing.category
                                          ? (listingCategoryOptions.find((c) => c.value === listing.category)?.label || listing.category)
                                          : 'Not set'}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {listingCategoryOptions.map((opt) => {
                                        const on = listing.category === opt.value;
                                        return (
                                          <button
                                            key={opt.value}
                                            type="button"
                                            title={`Set category to ${opt.label}`}
                                            onClick={() => handleUpdateListingCategory(listing, opt.value)}
                                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                              on
                                                ? 'bg-green-700 text-white border-green-700'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
                                            }`}
                                          >
                                            {opt.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="btn-danger text-sm ml-4"
                            >
                              <div className="icon-trash mr-1"></div>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Listing Categories</h3>
                  <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    These are the category options in the left sidebar filters on the main map page.
                    Rename labels, show or hide categories, and change order — then save.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={loadListingCategories} className="btn-secondary flex items-center">
                    <div className="icon-refresh-cw mr-2"></div>
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={saveListingCategories}
                    disabled={listingCategoriesSaving || listingCategoriesLoading}
                    className="btn-primary flex items-center disabled:opacity-60"
                  >
                    {listingCategoriesSaving ? 'Saving…' : 'Save categories'}
                  </button>
                </div>
              </div>

              {listingCategoriesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading categories…</div>
              ) : (
                <div className="space-y-3">
                  {listingCategoriesError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{listingCategoriesError}</div>
                  )}

                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-900">
                    <strong>Preview (left sidebar):</strong>{' '}
                    All Categories
                    {listingCategories
                      .filter((c) => c.is_active)
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((c) => ` · ${c.label || c.value}`)
                      .join('')}
                  </div>

                  {listingCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No categories found.</div>
                  ) : (
                    <div className="grid gap-3">
                      {listingCategories
                        .slice()
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .map((cat, index, arr) => (
                          <div key={cat.id} className="card flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                title="Move up"
                                disabled={index === 0}
                                onClick={() => moveListingCategory(cat.id, 'up')}
                                className="px-2 py-1 border rounded text-sm disabled:opacity-40"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                title="Move down"
                                disabled={index === arr.length - 1}
                                onClick={() => moveListingCategory(cat.id, 'down')}
                                className="px-2 py-1 border rounded text-sm disabled:opacity-40"
                              >
                                ↓
                              </button>
                              <span className="text-xs font-mono text-gray-500 w-20 truncate" title={cat.value}>
                                {cat.value}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={cat.label || ''}
                              onChange={(e) => updateListingCategoryField(cat.id, { label: e.target.value })}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Display label"
                            />
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!cat.is_active}
                                onChange={(e) => updateListingCategoryField(cat.id, { is_active: e.target.checked })}
                              />
                              Show in sidebar
                            </label>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Database Status</h3>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${dbStats.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${dbStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStats.connected ? 'Connected to Database' : 'Database Error'}
                  </span>
                </div>
                <button
                  onClick={loadDatabaseStats}
                  className="btn-secondary"
                >
                  Refresh Stats
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Data Export</h3>
                <p className="text-gray-600 mb-4">
                  Export all Food Maps data for backup or migration purposes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    disabled={exportStatus === 'exporting'}
                    className="btn-primary flex items-center justify-center"
                  >
                    {exportStatus === 'exporting' ? (
                      <>
                        <div className="icon-loader-2 mr-2 animate-spin"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <div className="icon-download mr-2"></div>
                        Export JSON Data
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSupabaseMigration}
                    disabled={exportStatus === 'migrating'}
                    className="btn-secondary flex items-center justify-center"
                  >
                    {exportStatus === 'migrating' ? (
                      <>
                        <div className="icon-loader-2 mr-2 animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <div className="icon-database mr-2"></div>
                        Supabase Migration
                      </>
                    )}
                  </button>
                </div>

                {exportStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    Data exported successfully!
                  </div>
                )}

                {exportStatus === 'migration_success' && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    Supabase migration file generated successfully!
                  </div>
                )}

                {(exportStatus === 'error' || exportStatus === 'migration_error') && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    Export failed. Please try again.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">User Feedback & Bug Reports</h3>
                <button
                  onClick={() => setShowFeedbackViewer(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  View All Feedback
                </button>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <AdminMessagePanel />
          )}

          {activeTab === 'ai_broadcasts' && (
            <AIBroadcastsPanel />
          )}
          </div>
        </div>

        {showFeedbackViewer && (
          <FeedbackViewer onClose={() => setShowFeedbackViewer(false)} />
        )}
      </div>
    );
  } catch (error) {
    console.error('AdminPanel component error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel Error</h2>
          <p className="text-gray-600">Unable to load admin panel</p>
        </div>
      </div>
    );
  }
}

window.AdminPanel = AdminPanel;
