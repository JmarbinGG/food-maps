// Database integration utilities for Food Maps
// Consolidated, valid implementation exposing a normalized listings API.

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.listings = [];
    // Start connection test but don't block construction
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      const res = await fetch('/api/dbtest').catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      if (json && json.success) {
        this.isConnected = true;
        console.log('Database service connected successfully');
      } else {
        console.warn('Trickle database functions not available, using mock mode');
        this.isConnected = false;
      }
    } catch (error) {
      console.warn('DB test fetch failed, using mock mode', error);
      this.isConnected = false;
    }
  }

  // User operations
  async createUser(userData) {
    try {
      const user = await trickleCreateObject('users', {
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      });
      return { success: true, data: user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  async getUser(userId) {
    if (!this.isConnected) return this.getMockUser(userId);
    try {
      const user = await trickleGetObject('users', userId);
      return { success: true, data: user };
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId, updates) {
    if (!this.isConnected) return this.createMockResponse('user', updates);
    try {
      const user = await trickleUpdateObject('users', userId, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      return { success: true, data: user };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  // Food listing operations
  async createListing(listingData) {
    if (!this.isConnected) return this.createMockResponse('listing', listingData);
    try {
      const listing = await trickleCreateObject('food_listings', {
        ...listingData,
        status: 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { success: true, data: listing };
    } catch (error) {
      console.error('Error creating listing:', error);
      return { success: false, error: error.message };
    }
  }

  // Raw DB call - returns { success, data }
  async getListings(limit = 100) {
    try {
      const response = await fetch(`/api/listings?limit=${limit}`).catch(() => null);
      if (!response) return { success: false, error: 'Fetch failed' };
      const data = await response.json().catch(() => null);
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching listings:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper that returns an array of listings for callers
  async fetchListingsArray(limit = 100) {
    try {
      // Always try to fetch from the backend. Even if the initial
      // connection probe failed, attempt a live fetch here so the
      // UI can recover when the backend becomes available later.
      const res = await this.getListings(limit);
      if (res && res.success && Array.isArray(res.data)) {
        this.listings = res.data;
        try { window.databaseService.listings = res.data; } catch (e) { /* ignore */ }
        return res.data;
      }
      if (res && res.success && res.data && Array.isArray(res.data.items)) {
        this.listings = res.data.items;
        try { window.databaseService.listings = res.data.items; } catch (e) { /* ignore */ }
        return res.data.items;
      }

      // Fallbacks
      if (typeof window.getListingsArray === 'function') {
        return window.getListingsArray();
      }

      if (Array.isArray(this.listings) && this.listings.length > 0) {
        return this.listings;
      }

      // No mock fallback here - prefer snapshot helpers or empty array
      return [];
    } catch (err) {
      console.error('fetchListingsArray error:', err);
      return Array.isArray(this.listings) ? this.listings : [];
    }
  }

  async updateListingStatus(listingId, status, recipientId = null) {
    if (!this.isConnected) return this.createMockResponse('listing', { status });
    try {
      const updates = {
        status,
        updated_at: new Date().toISOString()
      };
      if (recipientId) {
        updates.recipient_id = recipientId;
        updates.claimed_at = new Date().toISOString();
      }
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      const listing = await trickleUpdateObject('food_listings', listingId, updates);
      return { success: true, data: listing };
    } catch (error) {
      console.error('Error updating listing status:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock helpers
  createMockResponse(type, data) {
    return {
      success: true,
      data: {
        objectId: `mock_${type}_${Date.now()}`,
        objectType: type,
        objectData: data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  getMockUser(userId) {
    return {
      success: true,
      data: {
        objectId: userId,
        objectData: {
          id: userId,
          email: 'mock@example.com',
          full_name: 'Mock User',
          role: 'donor'
        }
      }
    };
  }
}

// Initialize singleton and expose compatibility helper
try {
  window.databaseService = window.databaseService || new DatabaseService();
} catch (e) {
  // In non-browser test environments, ignore
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

// Export helper for manual use in dev
try {
  if (!window.exportToSupabase) {
    window.exportToSupabase = {
      async exportAllData() {
        const exportData = { users: [], food_listings: [], schedules: [], tasks: [], ai_matches: [], agent_logs: [], exported_at: new Date().toISOString() };
        try {
          const usersResponse = await trickleListObjects('users', 1000).catch(() => ({ items: [] }));
          exportData.users = usersResponse.items || [];
          const listingsResponse = await trickleListObjects('food_listings', 1000).catch(() => ({ items: [] }));
          exportData.food_listings = listingsResponse.items || [];
          const schedulesResponse = await trickleListObjects('schedules', 1000).catch(() => ({ items: [] }));
          exportData.schedules = schedulesResponse.items || [];
          const tasksResponse = await trickleListObjects('tasks', 1000).catch(() => ({ items: [] }));
          exportData.tasks = tasksResponse.items || [];
          const matchesResponse = await trickleListObjects('ai_matches', 1000).catch(() => ({ items: [] }));
          exportData.ai_matches = matchesResponse.items || [];
          const logsResponse = await trickleListObjects('agent_logs', 1000).catch(() => ({ items: [] }));
          exportData.agent_logs = logsResponse.items || [];
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
