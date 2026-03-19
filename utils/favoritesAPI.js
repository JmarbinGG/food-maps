// Favorites API utilities
window.favoritesAPI = {
  getAll: async function () {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return await response.json();
    } catch (error) {
      console.error('Favorites API error:', error);
      return [];
    }
  },

  add: async function (favoriteData) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(favoriteData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add favorite');
      }
      return await response.json();
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  },

  remove: async function (favoriteId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return await response.json();
    } catch (error) {
      console.error('Remove favorite error:', error);
      throw error;
    }
  },

  update: async function (favoriteId, updateData) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      return await response.json();
    } catch (error) {
      console.error('Update favorite error:', error);
      throw error;
    }
  },

  recordVisit: async function (favoriteId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}/visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to record visit');
      return await response.json();
    } catch (error) {
      console.error('Record visit error:', error);
      throw error;
    }
  },

  // Helper to add a listing as favorite
  addFromListing: async function (listing) {
    const favoriteData = {
      name: listing.title || 'Saved Location',
      address: listing.address,
      coords_lat: listing.coords_lat,
      coords_lng: listing.coords_lng,
      location_type: 'donor',
      donor_id: listing.donor_id,
      notes: '',
      tags: JSON.stringify([]),
      notify_new_listings: false,
      notification_radius_km: 5.0
    };
    return await this.add(favoriteData);
  },

  // Helper to add a distribution center as favorite
  addFromCenter: async function (center) {
    const favoriteData = {
      name: center.name,
      address: center.address,
      coords_lat: center.coords_lat,
      coords_lng: center.coords_lng,
      location_type: 'distribution_center',
      center_id: center.id,
      notes: '',
      tags: JSON.stringify([]),
      notify_new_listings: false,
      notification_radius_km: 5.0
    };
    return await this.add(favoriteData);
  },

  // Helper to add a general location as favorite
  addGeneral: async function (name, address, coords_lat, coords_lng, notes = '', tags = []) {
    const favoriteData = {
      name,
      address,
      coords_lat,
      coords_lng,
      location_type: 'general',
      notes,
      tags: JSON.stringify(tags),
      notify_new_listings: false,
      notification_radius_km: 5.0
    };
    return await this.add(favoriteData);
  },

  // Check if a location is already favorited
  isFavorited: async function (donorId = null, centerId = null) {
    try {
      const favorites = await this.getAll();
      if (donorId) {
        return favorites.some(f => f.donor && f.donor.id === donorId);
      }
      if (centerId) {
        return favorites.some(f => f.center && f.center.id === centerId);
      }
      return false;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
};
