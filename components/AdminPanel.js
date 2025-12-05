function AdminPanel({ onClose }) {
  try {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [exportStatus, setExportStatus] = React.useState(null);
    const [dbStats, setDbStats] = React.useState({});
    const [centers, setCenters] = React.useState([]);
    const [showCenterForm, setShowCenterForm] = React.useState(false);
    const [editingCenter, setEditingCenter] = React.useState(null);
    const [centerForm, setCenterForm] = React.useState({
      name: '',
      description: '',
      address: '',
      phone: '',
      hours: '',
      coords_lat: '',
      coords_lng: ''
    });
    const [referralStats, setReferralStats] = React.useState([]);
    const [referralLoading, setReferralLoading] = React.useState(false);
    const [listings, setListings] = React.useState([]);
    const [listingsLoading, setListingsLoading] = React.useState(false);

    React.useEffect(() => {
      loadDatabaseStats();
      if (activeTab === 'centers') {
        loadCenters();
      } else if (activeTab === 'referrals') {
        loadReferralStats();
      } else if (activeTab === 'listings') {
        loadListings();
      }
    }, [activeTab]);

    const loadCenters = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error loading centers:', error);
      }
    };

    const handleSaveCenter = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const url = editingCenter ? `/api/centers/${editingCenter.id}` : '/api/centers';
        const method = editingCenter ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(centerForm)
        });

        if (response.ok) {
          setShowCenterForm(false);
          setEditingCenter(null);
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

    const handleEditCenter = (center) => {
      setCenterForm({
        name: center.name || '',
        description: center.description || '',
        address: center.address || '',
        phone: center.phone || '',
        hours: center.hours || '',
        coords_lat: center.coords_lat || '',
        coords_lng: center.coords_lng || ''
      });
      setEditingCenter(center);
      setShowCenterForm(true);
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
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/admin/referrals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setReferralStats(data);
        }
      } catch (error) {
        console.error('Error loading referral stats:', error);
      } finally {
        setReferralLoading(false);
      }
    };

    const loadListings = async () => {
      setListingsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/listings/get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setListings(data);
        }
      } catch (error) {
        console.error('Error loading listings:', error);
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

    const loadDatabaseStats = async () => {
      try {
        if (window.databaseService && window.databaseService.isConnected) {
          // Get stats from database
          const usersResult = await trickleListObjects('users', 10);
          const listingsResult = await trickleListObjects('food_listings', 10);
          const schedulesResult = await trickleListObjects('schedules', 10);
          const tasksResult = await trickleListObjects('tasks', 10);

          setDbStats({
            users: usersResult.items?.length || 0,
            listings: listingsResult.items?.length || 0,
            schedules: schedulesResult.items?.length || 0,
            tasks: tasksResult.items?.length || 0,
            connected: true
          });
        } else {
          // setDbStats({
          //   users: window.mockUsers?.length || 0,
          //   listings: window.databaseService.getListings?.length || 0,
          //   schedules: window.mockSchedules?.length || 0,
          //   tasks: window.mockTasks?.length || 0,
          //   connected: false
          // });
        }
      } catch (error) {
        console.error('Error loading database stats:', error);
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        data-name="admin-panel" data-file="components/AdminPanel.js">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'centers', label: 'Distribution Centers', icon: 'map-pin' },
                { id: 'listings', label: 'Listings', icon: 'package' },
                { id: 'referrals', label: 'Referrals', icon: 'users' },
                { id: 'database', label: 'Database', icon: 'database' },
                { id: 'export', label: 'Export', icon: 'download' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                    setCenterForm({ name: '', description: '', address: '', phone: '', hours: '', coords_lat: '', coords_lng: '' });
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
                <div className="card">
                  <h4 className="text-md font-semibold mb-4">
                    {editingCenter ? 'Edit Distribution Center' : 'Add New Distribution Center'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Center Name"
                      value={centerForm.name}
                      onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={centerForm.phone}
                      onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                      className="input"
                    />
                    <textarea
                      placeholder="Description"
                      value={centerForm.description}
                      onChange={(e) => setCenterForm({ ...centerForm, description: e.target.value })}
                      className="input md:col-span-2"
                      rows="2"
                    ></textarea>
                    <input
                      type="text"
                      placeholder="Address"
                      value={centerForm.address}
                      onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                      className="input md:col-span-2"
                    />
                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={centerForm.coords_lat}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lat: e.target.value })}
                        className="input"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={centerForm.coords_lng}
                        onChange={(e) => setCenterForm({ ...centerForm, coords_lng: e.target.value })}
                        className="input"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!centerForm.address) {
                            alert('Please enter an address first');
                            return;
                          }
                          try {
                            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(centerForm.address)}.json?access_token=pk.eyJ1Ijoiamhhbm1hcmJpbiIsImEiOiJjbTQ4ZTgxZjYwMzNjMmtzNnBienoyMmljIn0.Sz0YC4asDk_vgqA8V0OlsQ&limit=1`);
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
                      className="input md:col-span-2"
                    />
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
                {centers.map(center => (
                  <div key={center.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{center.name}</h4>
                        <p className="text-gray-600 mb-2">{center.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Address:</strong> {center.address}</p>
                          {center.coords_lat && center.coords_lng && (
                            <p><strong>Coordinates:</strong> {center.coords_lat}, {center.coords_lng}</p>
                          )}
                          <p><strong>Phone:</strong> {center.phone}</p>
                          <p><strong>Hours:</strong> {center.hours}</p>
                          <p><strong>Status:</strong>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${center.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {center.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
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
                ))}
                {centers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No distribution centers found. Add one to get started.
                  </div>
                )}
              </div>
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
                                    <p><strong>Expires:</strong> {new Date(listing.expiry_date).toLocaleDateString()}</p>
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

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Database Status</h3>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${dbStats.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${dbStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStats.connected ? 'Connected to Trickle Database' : 'Using Mock Data'}
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
        </div>
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
