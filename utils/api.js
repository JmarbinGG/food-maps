// API utilities
window.listingAPI = {
  getAll: async function () {
    try {
      const response = await fetch('/api/listings/get');
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  },

  claim: async function (listingId, userId, options = {}) {
    const controller = new AbortController();
    const timeoutMs = Number(options.timeout) > 0 ? Number(options.timeout) : 15000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/listings/claim/${listingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || `Failed to claim (HTTP ${response.status})`;
        throw new Error(detail);
      }
      const data = await response.json();
      // SMS fallback: when Twilio is unavailable the backend returns the
      // 4-digit code inline. Surface it to the recipient so they can type
      // it into the confirmation modal — otherwise they wait for a text
      // that never arrives and the claim silently auto-releases.
      if (data && data.success && data.sms_delivered === false && data.confirm_code) {
        try {
          if (typeof window.showAlert === 'function') {
            window.showAlert(
              `SMS delivery is unavailable. Your confirmation code is ${data.confirm_code} — enter it in the confirmation dialog within 5 minutes.`,
              { title: 'Confirmation code', variant: 'info' }
            );
          } else {
            alert(`Your confirmation code is ${data.confirm_code}`);
          }
        } catch (_) {}
      }
      return data;
    } catch (error) {
      if (error && error.name === 'AbortError') {
        const e = new Error('Request timeout');
        e.name = 'AbortError';
        console.error('Claim error: timeout');
        throw e;
      }
      console.error('Claim error:', error);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  },

  getCounterparty: async function (listingId, options = {}) {
    try {
      const token = localStorage.getItem('auth_token');
      const controller = new AbortController();
      const timeout = options.timeout || 10000;
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`/api/listings/user-details/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('Get counterparty error:', error);
      throw error;
    }
  }

};

window.favoritesAPI = {
    list: async function () {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return await response.json();
    },
    add: async function ({ name, address, coords_lat, coords_lng, notes }) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, address, coords_lat, coords_lng, notes })
      });
      if (!response.ok) throw new Error('Failed to add favorite');
      return await response.json();
    },
    remove: async function (favoriteId) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return await response.json();
    }
  };

  window.userAPI = {
    getMeV2: async function () {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to get user');
        return await response.json();
      } catch (error) {
        console.error('User API error:', error);
        return null;
      }
    },

    updatePhone: async function (phone) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/user/phone', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone })
        });
        if (!response.ok) throw new Error('Failed to update phone');
        return await response.json();
      } catch (error) {
        console.error('Phone update error:', error);
        throw error;
      }
    }
  };