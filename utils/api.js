// API utilities
window.listingAPI = {
  getAll: async function() {
    try {
      const response = await fetch('/api/listings/get');
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  },
  
  claim: async function(listingId, userId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/listings/claim/${listingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to claim');
      }
      return await response.json();
    } catch (error) {
      console.error('Claim error:', error);
      throw error;
    }
  },

  getCounterparty: async function(listingId, options = {}) {
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

window.userAPI = {
  getMeV2: async function() {
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
  
  updatePhone: async function(phone) {
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