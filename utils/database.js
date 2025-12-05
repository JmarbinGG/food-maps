// Database service
window.databaseService = {
  listings: [],
  isConnected: true,

  async getListings(limit = 100, include_claimed_for_me = false) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      params.append('include_claimed_for_me', include_claimed_for_me);

      const response = await fetch(`/api/listings/get?${params.toString()}`, {
        method: 'GET'
      });

      if (response.status === 401) {
        const error = await response.json().catch(() => ({}));
        console.log('401 Unauthorized - token expired or invalid');
        if (typeof window.handleTokenExpired === 'function') {
          window.handleTokenExpired();
        } else {
          // Fallback if handler not available
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          if (typeof window.showAlert === 'function') {
            await window.showAlert('Your session has expired. Please sign in again.', { title: 'Session Expired', variant: 'error' });
          }
          window.location.reload();
        }
        return { success: false, error: 'Session expired' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = typeof error.detail === 'string' ? error.detail : 'Failed to fetch listings';
        console.error('Failed to fetch listings:', errorMessage);
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log('Fetched listings from API:', data.length);

      // Update local cache
      this.listings = Array.isArray(data) ? data : [];

      return { success: true, listings: this.listings };
    } catch (error) {
      console.error('Get listings error:', error);
      const errorMessage = error && error.message ? String(error.message) : 'Network error';
      return { success: false, error: errorMessage };
    }
  },

  async fetchListingsArray() {
    const result = await this.getListings();
    return result.success ? result.listings : [];
  },

  authLogin: async function (email, password) {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('password', password);

      const response = await fetch(`/api/user/login?${params.toString()}`, {
        method: 'POST'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.detail || 'Invalid email or password';
        return { success: false, error: errorMessage };
      }

      if (!data.success || !data.token) {
        return { success: false, error: 'Invalid response from server' };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  },

  authRegister: async function (userData) {
    try {
      const params = new URLSearchParams();
      params.append('name', userData.name);
      params.append('email', userData.email);
      params.append('password', userData.password);
      params.append('role', userData.role);
      if (userData.referral_code) {
        params.append('referral_code', userData.referral_code);
      }

      const response = await fetch(`/api/user/create?${params.toString()}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = typeof error.detail === 'string' ? error.detail : 'Registration failed';
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error && error.message ? String(error.message) : 'Network error';
      return { success: false, error: errorMessage };
    }
  },

  createListing: async function (listingData) {
    try {
      const params = new URLSearchParams();
      params.append('donor_id', listingData.donor_id);
      params.append('title', listingData.title);
      params.append('desc', listingData.desc || listingData.description || '');
      params.append('category', listingData.category);
      params.append('qty', listingData.qty);
      params.append('unit', listingData.unit);
      params.append('perishability', listingData.perishability);
      params.append('address', listingData.address);
      params.append('pickup_start', listingData.pickup_start);
      params.append('pickup_end', listingData.pickup_end);
      if (listingData.est_w) params.append('est_w', listingData.est_w);

      const response = await fetch(`/api/listings/create?${params.toString()}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = typeof error.detail === 'string' ? error.detail : 'Failed to create listing';
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Update local listings cache if successful
      if (data && data.listing) {
        this.listings.unshift(data.listing);
      }

      return data;
    } catch (error) {
      console.error('Create listing error:', error);
      const errorMessage = error && error.message ? String(error.message) : 'Network error';
      return { success: false, error: errorMessage };
    }
  },

  updateListing: async function (listingId, updates) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`/api/listings/get/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = typeof error.detail === 'string' ? error.detail : 'Failed to update listing';
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Update local cache
      if (data && data.listing) {
        const idx = this.listings.findIndex(l => String(l.id) === String(listingId));
        if (idx !== -1) {
          this.listings[idx] = { ...this.listings[idx], ...data.listing };
        }
      }

      return { success: true, data: data.listing };
    } catch (error) {
      console.error('Update listing error:', error);
      const errorMessage = error && error.message ? String(error.message) : 'Network error';
      return { success: false, error: errorMessage };
    }
  }
};

window.getListingsArray = function () {
  return window.databaseService.listings || [];
};