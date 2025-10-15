// Database integration utilities for Food Maps (backend-backed)
// This module replaces the old "trickle" local DB calls with HTTP calls
// to the backend using the shared `window.apiRequest` / `window.*API` helpers.

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.listings = [];
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      // Try a lightweight listing fetch to confirm backend availability.
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const probe = await fetch('/api/listings/get?limit=1', { headers });
      if (!probe || !probe.ok) throw new Error('probe failed');
      this.isConnected = true;
      console.log('Database service: backend reachable');
    } catch (err) {
      this.isConnected = false;
      console.warn('Database service: backend unreachable, operating with local snapshot only', err?.message || err);
    }
  }

  // User operations
  async createUser(userData) {
    try {
      // Use query-string POST like AuthModal for compatibility with backend handlers
      const params = new URLSearchParams(userData).toString();
      const response = await fetch('/api/user/create?' + params, { method: 'POST' });
      const json = await response.json().catch(() => ({}));
      return { success: true, data: json };
    } catch (error) {
      console.error('Error creating user via backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication helpers that mirror the query-string POST style used by AuthModal
  async authLogin(email, password) {
    try {
      const params = new URLSearchParams({ email, password }).toString();
      const response = await fetch('/api/user/login?' + params, { method: 'POST' });
      const json = await response.json().catch(() => ({}));
      return json;
    } catch (error) {
      console.error('authLogin error:', error);
      return { success: false, error: error.message };
    }
  }

  async authRegister(userData) {
    try {
      const params = new URLSearchParams(userData).toString();
      const response = await fetch('/api/user/create?' + params, { method: 'POST' });
      const json = await response.json().catch(() => ({}));
      return json;
    } catch (error) {
      console.error('authRegister error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUser(userId) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await fetch(`/api/users/${userId}`, { headers });
      if (!resp.ok) throw new Error('fetch failed');
      const json = await resp.json().catch(() => ({}));
      return { success: true, data: json };
    } catch (error) {
      console.warn('getUser failed, falling back to /me when possible', error?.message || error);
      try {
        // Try /me endpoint as a fallback
        const token = localStorage.getItem('auth_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const meResp = await fetch('/api/me', { headers });
        if (meResp && meResp.ok) {
          const meJson = await meResp.json().catch(() => ({}));
          return { success: true, data: meJson };
        }
      } catch (e) {
        // ignore
      }
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId, updates) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const resp = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
      });
      const json = await resp.json().catch(() => ({}));
      return { success: true, data: json };
    } catch (error) {
      console.error('Error updating user via backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Listing operations
  async createListing(listingData) {
    try {
      // Backend expects query-string POST to /api/listings/create (see backend/app.py)
      if (!listingData.status) listingData.status = 'available';
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Ensure numeric fields are coerced
      const paramsObj = Object.assign({}, listingData);
      if (paramsObj.qty !== undefined && paramsObj.qty !== null) {
        paramsObj.qty = parseInt(paramsObj.qty, 10) || 0;
      }
      if (paramsObj.donor_id !== undefined && paramsObj.donor_id !== null) {
        paramsObj.donor_id = parseInt(paramsObj.donor_id, 10) || paramsObj.donor_id;
      }

      const params = new URLSearchParams(paramsObj).toString();
      const response = await fetch('/api/listings/create?' + params, {
        method: 'POST',
        headers
      });
      const resp = await response.json().catch(() => ({}));
      const created = resp && (resp.listing || resp.data || resp);
      if (created) {
        // update local snapshot
        try { this.listings.unshift(created); } catch (e) {}
        try { window.databaseService.listings = this.listings; } catch (e) {}
      }
      return { success: true, data: created };
    } catch (error) {
      console.error('Error creating listing via backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Raw listing fetch
  async getListings(limit = 100) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await fetch(`/api/listings/get?limit=${limit}`, { headers });
      if (!resp.ok) throw new Error('fetch failed');
      const json = await resp.json().catch(() => null);
      return { success: true, data: json };
    } catch (error) {
      console.error('Error fetching listings from backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Return an array of listings (normalize different response shapes)
  async fetchListingsArray(limit = 100) {
    try {
      const res = await this.getListings(limit);
      if (res && res.success) {
        const data = res.data;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.items)) items = data.items;
        else if (Array.isArray(data.data)) items = data.data;

        this.listings = items;
        try { window.databaseService.listings = items; } catch (e) {}
        return items;
      }
      // fallback to snapshot
      if (Array.isArray(this.listings) && this.listings.length) return this.listings;
      return [];
    } catch (error) {
      console.error('fetchListingsArray error:', error);
      return Array.isArray(this.listings) ? this.listings : [];
    }
  }

  async updateListingStatus(listingId, status, recipientId = null) {
    try {
      const updates = { status, updated_at: new Date().toISOString() };
      if (recipientId) {
        updates.recipient_id = recipientId;
        updates.claimed_at = new Date().toISOString();
      }
      if (status === 'completed') updates.completed_at = new Date().toISOString();

      const token = localStorage.getItem('auth_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const respFetch = await fetch(`/api/listings/get/${listingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      const resp = await respFetch.json().catch(() => ({}));
      const updated = resp && (resp.listing || resp.data || resp);
      // update local snapshot if present
      try {
        const idx = this.listings.findIndex(l => l.id === listingId || l.objectId == listingId);
        if (idx !== -1) this.listings[idx] = { ...this.listings[idx], ...updated };
        try { window.databaseService.listings = this.listings; } catch (e) {}
      } catch (e) { /* ignore */ }

      return { success: true, data: updated };
    } catch (error) {
      console.error('Error updating listing status via backend:', error);
      return { success: false, error: error.message };
    }
  }

  // General listing update (title, desc, qty, unit, address, windows, etc.)
  async updateListing(listingId, updates) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const respFetch = await fetch(`/api/listings/get/${listingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
      });
      const resp = await respFetch.json().catch(() => ({}));
      if (respFetch.status === 401 || respFetch.status === 403) {
        return { success: false, error: resp?.detail || 'Not authorized' };
      }
      const updated = resp && (resp.listing || resp.data || resp);
      // update local snapshot if present
      try {
        const idx = this.listings.findIndex(l => l.id === listingId || String(l.id) === String(listingId));
        if (idx !== -1) this.listings[idx] = { ...this.listings[idx], ...updated };
        try { window.databaseService.listings = this.listings; } catch (e) {}
      } catch (e) { /* ignore */ }

      return { success: true, data: updated };
    } catch (error) {
      console.error('Error updating listing via backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Utilities
  createMockResponse(type, data) {
    // Keep a lightweight mock response function for non-critical dev flows
    return {
      success: true,
      data: {
        id: `mock_${type}_${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }
}

// Initialize singleton and expose compatibility helper
try {
  window.databaseService = window.databaseService || new DatabaseService();
} catch (e) {
  // non-browser environment: ignore
}

// Synchronous helper: return the latest snapshot (may be empty)
try {
  if (typeof window.getListingsArray !== 'function') {
    window.getListingsArray = function() {
      try {
        if (window.databaseService && Array.isArray(window.databaseService.listings)) return window.databaseService.listings;
      } catch (err) { /* ignore */ }
      return [];
    };
  }
} catch (e) { /* ignore */ }

// Export helper for manual use in dev: implement via backend where possible
  try {
    if (!window.exportToSupabase) {
      window.exportToSupabase = {
        async exportAllData() {
          const exportData = { users: [], food_listings: [], schedules: [], tasks: [], ai_matches: [], agent_logs: [], exported_at: new Date().toISOString() };
          try {
            // Users - attempt to fetch via /api/users
            try {
              const usersResp = await fetch('/api/users?limit=1000');
              const usersJson = await usersResp.json().catch(() => ({}));
              exportData.users = usersJson.items || usersJson.data || usersJson || [];
            } catch (e) {
              exportData.users = [];
            }

            // Listings
            try {
              const listingsResp = await fetch('/api/listings/get?limit=1000');
              const listingsJson = await listingsResp.json().catch(() => ({}));
              exportData.food_listings = listingsJson.items || listingsJson.data || listingsJson || [];
            } catch (e) {
              exportData.food_listings = [];
            }

            // Other collections: best-effort or leave empty
            exportData.schedules = [];
            exportData.tasks = [];
            exportData.ai_matches = [];
            exportData.agent_logs = [];

            return exportData;
          } catch (error) {
            console.error('Export error:', error);
            throw error;
          }
        },

        async downloadExport() {
          try {
            const data = await this.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `food-maps-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return { success: true };
          } catch (error) {
            console.error('Download error:', error);
            return { success: false, error: error.message };
          }
        }
      };
    }
  } catch (e) { /* ignore */ }
