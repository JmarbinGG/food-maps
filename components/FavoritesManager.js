function FavoritesManager({ user, onClose }) {
  const [favorites, setFavorites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFavorite, setSelectedFavorite] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');

  React.useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        console.error('Failed to load favorites');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    if (!confirm('Remove this location from your favorites?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
        if (typeof window.showAlert === 'function') {
          window.showAlert('Location removed from favorites', { variant: 'success' });
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to remove favorite', { variant: 'error' });
      }
    }
  };

  const recordVisit = async (favoriteId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}/visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadFavorites(); // Reload to update visit count
      }
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  };

  const openEditModal = (favorite) => {
    setSelectedFavorite(favorite);
    setShowEditModal(true);
  };

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || fav.location_type === filterType;
    return matchesSearch && matchesType;
  });

  const getLocationIcon = (type) => {
    switch (type) {
      case 'donor': return '🏪';
      case 'distribution_center': return '🏢';
      default: return '📍';
    }
  };

  const getLocationTypeLabel = (type) => {
    switch (type) {
      case 'donor': return 'Trusted Donor';
      case 'distribution_center': return 'Distribution Center';
      default: return 'Saved Location';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">⭐ My Favorite Locations</h2>
              <p className="text-purple-100">Your trusted spots for food access</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="donor">Trusted Donors</option>
              <option value="distribution_center">Distribution Centers</option>
              <option value="general">General Locations</option>
            </select>
          </div>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading favorites...</div>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery || filterType !== 'all' ? 'No matching favorites' : 'No favorites yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Save locations by clicking the star icon on listings and distribution centers'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFavorites.map(fav => (
                <div key={fav.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getLocationIcon(fav.location_type)}</span>
                        <h3 className="font-semibold text-lg text-gray-900">{fav.name}</h3>
                      </div>
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium mb-2">
                        {getLocationTypeLabel(fav.location_type)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {fav.address}
                  </p>

                  {fav.notes && (
                    <p className="text-gray-700 text-sm mb-3 italic bg-yellow-50 p-2 rounded border-l-4 border-yellow-300">
                      💭 {fav.notes}
                    </p>
                  )}

                  {fav.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {JSON.parse(fav.tags).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fav.visit_count} visit{fav.visit_count !== 1 ? 's' : ''}
                    </span>
                    {fav.last_visited && (
                      <span>Last: {new Date(fav.last_visited).toLocaleDateString()}</span>
                    )}
                  </div>

                  {fav.notify_new_listings && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-green-700 bg-green-50 p-2 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notifications enabled ({fav.notification_radius_km}km radius)
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => recordVisit(fav.id)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition text-sm font-medium"
                    >
                      ✓ Mark Visit
                    </button>
                    <button
                      onClick={() => openEditModal(fav)}
                      className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 transition text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (fav.coords_lat && fav.coords_lng) {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${fav.coords_lat},${fav.coords_lng}`, '_blank');
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition text-sm font-medium"
                      title="Get directions"
                    >
                      🗺️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 border-t p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{favorites.length}</div>
              <div className="text-sm text-gray-600">Saved Locations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {favorites.reduce((sum, f) => sum + f.visit_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Visits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {favorites.filter(f => f.notify_new_listings).length}
              </div>
              <div className="text-sm text-gray-600">With Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedFavorite && (
        <EditFavoriteModal
          favorite={selectedFavorite}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFavorite(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedFavorite(null);
            loadFavorites();
          }}
        />
      )}
    </div>
  );
}

function EditFavoriteModal({ favorite, onClose, onSave }) {
  const [name, setName] = React.useState(favorite.name);
  const [notes, setNotes] = React.useState(favorite.notes || '');
  const [tags, setTags] = React.useState(favorite.tags ? JSON.parse(favorite.tags).join(', ') : '');
  const [notifyNewListings, setNotifyNewListings] = React.useState(favorite.notify_new_listings);
  const [notificationRadius, setNotificationRadius] = React.useState(favorite.notification_radius_km);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favorite.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          notes,
          tags: JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)),
          notify_new_listings: notifyNewListings,
          notification_radius_km: parseFloat(notificationRadius)
        })
      });

      if (response.ok) {
        if (typeof window.showAlert === 'function') {
          window.showAlert('Favorite updated successfully', { variant: 'success' });
        }
        onSave();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to update favorite', { variant: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h3 className="text-xl font-bold mb-4">Edit Favorite Location</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Add personal notes about this location..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="family-friendly, fresh-produce, open-late"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyNewListings}
                onChange={(e) => setNotifyNewListings(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Notify me of new listings from this location
              </span>
            </label>
          </div>

          {notifyNewListings && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Radius (km)
              </label>
              <input
                type="number"
                value={notificationRadius}
                onChange={(e) => setNotificationRadius(e.target.value)}
                min="1"
                max="50"
                step="0.5"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
