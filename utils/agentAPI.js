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
    // Prefer real database listings; avoid forcing mock initialization here.
    
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
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const listings = await (window.databaseService && window.databaseService.fetchListingsArray ? window.databaseService.fetchListingsArray() : (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []));

    if (!Array.isArray(listings) || listings.length === 0) {
      return [];
    }

    return listings.filter(listing => {
      try {
        return new Date(listing.created_at) > oneHourAgo && (listing.status === 'available' || listing.status === 'AVAILABLE');
      } catch (e) {
        return false;
      }
    });
  }

  async getOpenDonations() {
    const listings = await (window.databaseService && window.databaseService.fetchListingsArray ? window.databaseService.fetchListingsArray() : (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []));
    if (!Array.isArray(listings)) return [];
    return listings.filter(listing => listing && (listing.status === 'available' || listing.status === 'AVAILABLE'));
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