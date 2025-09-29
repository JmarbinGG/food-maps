// Agent API for Food Maps Agentic Dispatch System
// Simulates backend API calls using mock data

class AgentAPI {
  constructor() {
    this.mockRequests = [];
    this.mockTasks = [];
    this.mockVolunteers = [];
    
    // Initialize with some test data
    this.initializeTestData();
  }

  initializeTestData() {
    // Ensure mock data is available
    if (!window.mockListings && typeof window.initializeMockData === 'function') {
      console.log('Initializing mock data from AgentAPI...');
      window.initializeMockData();
    }
    
    // Add some mock emergency requests
    this.mockRequests = [
      {
        id: 'req1',
        type: 'emergency',
        category: 'any',
        household_size: 4,
        special_needs: ['water'],
        coords: { lat: 37.7689, lng: -122.2644 },
        address: '1550 Oak St, Alameda, CA',
        urgency_score: 95,
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req2',
        type: 'emergency',
        category: 'any',
        household_size: 2,
        special_needs: ['produce'],
        coords: { lat: 37.7756, lng: -122.2398 },
        address: '2300 Alameda Ave, Alameda, CA',
        urgency_score: 85,
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Mock volunteers
    this.mockVolunteers = [
      {
        id: 'vol1',
        name: 'David Wilson',
        coords: { lat: 37.7756, lng: -122.2398 },
        available: true,
        vehicle_capacity_kg: 50,
        refrigeration: false
      }
    ];
  }

  async getNewDonations() {
    // Ensure mock data is available
    if (!window.mockListings || window.mockListings.length === 0) {
      console.log('Initializing mock data for getNewDonations...');
      if (typeof window.ensureMockDataAvailable === 'function') {
        window.ensureMockDataAvailable();
      } else if (typeof window.getMockListings === 'function') {
        window.mockListings = window.getMockListings();
      }
    }
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const listings = window.mockListings || [];
    console.log(`AgentAPI getNewDonations - Found ${listings.length} total listings for new donations check`);
    
    if (listings.length === 0) {
      console.error('No mock listings available in AgentAPI.getNewDonations');
      return [];
    }
    
    return listings.filter(listing => 
      new Date(listing.created_at) > oneHourAgo && listing.status === 'available'
    );
  }

  async getOpenDonations() {
    // Always ensure data is available before any operation
    window.ensureMockDataAvailable();
    
    // Get listings with guaranteed fallback
    let listings = window.mockListings;
    
    // Triple-check with direct creation if needed
    if (!listings || listings.length === 0) {
      console.warn('AgentAPI: Creating emergency donation data');
      listings = [
        {
          id: 'api_emergency_1', title: 'Emergency Water', category: 'beverages',
          qty: 50, status: 'available', coords: { lat: 37.7749, lng: -122.4194 },
          created_at: new Date().toISOString()
        },
        {
          id: 'api_emergency_2', title: 'Emergency Food Kit', category: 'packaged', 
          qty: 20, status: 'available', coords: { lat: 37.7849, lng: -122.4094 },
          created_at: new Date().toISOString()
        }
      ];
      window.mockListings = listings;
    }
    
    const openDonations = listings.filter(listing => listing.status === 'available');
    console.log(`AgentAPI: Found ${openDonations.length} open donations out of ${listings.length} total`);
    
    return openDonations;
  }

  async getNewRequests() {
    return this.mockRequests.filter(req => req.status === 'pending');
  }

  async getOpenRequests() {
    return this.mockRequests.filter(req => req.status === 'pending');
  }

  async updateDonation(id, data) {
    console.log(`Updating donation ${id}`, data);
    return Promise.resolve(data);
  }

  async updateRequest(id, data) {
    console.log(`Updating request ${id}`, data);
    return Promise.resolve(data);
  }

  async getPendingTasks() {
    return this.mockTasks.filter(task => task.status === 'pending');
  }

  async getAvailableVolunteers() {
    return this.mockVolunteers.filter(vol => vol.available);
  }

  async createTask(task) {
    task.id = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.mockTasks.push(task);
    console.log('Task created:', task);
    return task;
  }

  async assignRoute(volunteerId, route) {
    console.log(`Route assigned to volunteer ${volunteerId}:`, route);
    return Promise.resolve(route);
  }

  async optimizeRoute(tasks) {
    // Simple optimization - return tasks as-is for now
    return Promise.resolve(tasks);
  }

  async checkCoverage() {
    const overdueRequests = this.mockRequests.filter(req => {
      const created = new Date(req.created_at);
      const now = new Date();
      const hoursOld = (now - created) / (1000 * 60 * 60);
      return hoursOld > 4; // 4 hour SLA
    });

    return {
      slaRisks: overdueRequests.length,
      risks: overdueRequests.map(req => ({
        type: 'request',
        id: req.id,
        hoursOverdue: Math.floor((new Date() - new Date(req.created_at)) / (1000 * 60 * 60)) - 4
      }))
    };
  }

  async getAssignedTasks() {
    return this.mockTasks.filter(task => task.status === 'assigned');
  }
}

// Initialize global agent API
window.agentAPI = new AgentAPI();

console.log('Agent API initialized with mock data');