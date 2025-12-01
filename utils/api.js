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
      const response = await fetch(`/api/listings/get/${listingId}?recipient_id=${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to claim');
      return await response.json();
    } catch (error) {
      console.error('Claim error:', error);
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