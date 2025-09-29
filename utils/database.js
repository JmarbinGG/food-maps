// Database integration utilities for Food Maps
// Handles all database operations using Trickle Database API

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.initializeConnection();
  }

  async initializeConnection() {
    try {
      // Test connection by checking if Trickle database functions are available
      if (typeof trickleCreateObject === 'function') {
        this.isConnected = true;
        console.log('Database service connected successfully');
      } else {
        console.warn('Trickle database functions not available, using mock mode');
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Database connection error:', error);
      this.isConnected = false;
    }
  }

  // User operations
  async createUser(userData) {
    if (!this.isConnected) return this.createMockResponse('user', userData);
    
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

  async getListings(limit = 100) {
  try {
    const response = await fetch(`/api/listings?limit=${limit}`);
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { success: false, error: error.message };
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
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const listing = await trickleUpdateObject('food_listings', listingId, updates);
      return { success: true, data: listing };
    } catch (error) {
      console.error('Error updating listing status:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock responses for development
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

  getMockListings() {
    return {
      success: true,
      data: window.mockListings || []
    };
  }
}

// Initialize database service
window.databaseService = new DatabaseService();

// Export utilities for Supabase migration
window.exportToSupabase = {
  async exportAllData() {
    const exportData = {
      users: [],
      food_listings: [],
      schedules: [],
      tasks: [],
      ai_matches: [],
      agent_logs: [],
      exported_at: new Date().toISOString()
    };

    try {
      // Export users
      const usersResponse = await trickleListObjects('users', 1000);
      exportData.users = usersResponse.items || [];

      // Export food listings
      const listingsResponse = await trickleListObjects('food_listings', 1000);
      exportData.food_listings = listingsResponse.items || [];

      // Export schedules
      const schedulesResponse = await trickleListObjects('schedules', 1000);
      exportData.schedules = schedulesResponse.items || [];

      // Export tasks
      const tasksResponse = await trickleListObjects('tasks', 1000);
      exportData.tasks = tasksResponse.items || [];

      // Export AI matches
      const matchesResponse = await trickleListObjects('ai_matches', 1000);
      exportData.ai_matches = matchesResponse.items || [];

      // Export agent logs
      const logsResponse = await trickleListObjects('agent_logs', 1000);
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
