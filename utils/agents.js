// Agent Orchestrator for Food Maps Agentic Dispatch System
class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
    this.isRunning = false;
    this.intervalId = null;
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
    console.log(`Agent registered: ${name}`);
  }

  async start() {
    this.isRunning = true;
    console.log('Agent Orchestrator starting...');
    
    // Main orchestration loop - runs every 30 seconds
    this.intervalId = setInterval(() => {
      this.runOrchestrationCycle();
    }, 30000);
    
    // Run initial cycle
    await this.runOrchestrationCycle();
  }

  async runOrchestrationCycle() {
    if (!this.isRunning) return;
    
    try {
      console.log('Running orchestration cycle...');
      
      // Run agents in sequence
      await this.runAgent('intake');
      await this.runAgent('triage');
      await this.runAgent('bundler');
      await this.runAgent('optimizer');
      await this.runAgent('assignment');
      await this.runAgent('coverage');
      
    } catch (error) {
      console.error('Orchestration cycle error:', error);
    }
  }

  async runAgent(agentName) {
    const agent = this.agents.get(agentName);
    if (agent && typeof agent.execute === 'function') {
      try {
        await agent.execute();
      } catch (error) {
        console.error(`Agent ${agentName} error:`, error);
      }
    }
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Agent Orchestrator stopped');
  }
}

// Base Agent Class
class BaseAgent {
  constructor(name) {
    this.name = name;
    this.lastRun = null;
  }

  async execute() {
    this.lastRun = new Date();
    console.log(`Executing ${this.name} agent...`);
  }
}

// Intake Agent - processes new donations and requests
class IntakeAgent extends BaseAgent {
  constructor() {
    super('intake');
  }

  async execute() {
    await super.execute();
    
    // Process new donations
    const newDonations = await window.agentAPI.getNewDonations();
    for (const donation of newDonations) {
      await this.processDonation(donation);
    }
    
    // Process new requests
    const newRequests = await window.agentAPI.getNewRequests();
    for (const request of newRequests) {
      await this.processRequest(request);
    }
  }

  async processDonation(donation) {
    // Validate and geocode
    if (!donation.coords && donation.address) {
      const geocoded = await window.geocodeAddress(donation.address);
      if (geocoded) {
        donation.coords = { lat: geocoded.coordinates[1], lng: geocoded.coordinates[0] };
      }
    }
    
    // Estimate weight if not provided
    if (!donation.est_weight_kg) {
      donation.est_weight_kg = this.estimateWeight(donation.category, donation.qty, donation.unit);
    }
    
    await window.agentAPI.updateDonation(donation.id, donation);
  }

  async processRequest(request) {
    // Geocode if needed
    if (!request.coords && request.address) {
      const geocoded = await window.geocodeAddress(request.address);
      if (geocoded) {
        request.coords = { lat: geocoded.coordinates[1], lng: geocoded.coordinates[0] };
      }
    }
    
    await window.agentAPI.updateRequest(request.id, request);
  }

  estimateWeight(category, qty, unit) {
    const weights = {
      produce: { lbs: 1, kg: 2.2, items: 0.2 },
      prepared: { lbs: 1, kg: 2.2, servings: 0.3 },
      packaged: { lbs: 1, kg: 2.2, items: 0.4 },
      bakery: { lbs: 1, kg: 2.2, items: 0.15 }
    };
    
    return (weights[category] || weights.packaged)[unit] * qty || 1;
  }
}

// Triage Agent - assigns urgency scores and creates tasks
class TriageAgent extends BaseAgent {
  constructor() {
    super('triage');
  }

  async execute() {
    await super.execute();
    
    const openDonations = await window.agentAPI.getOpenDonations();
    const openRequests = await window.agentAPI.getOpenRequests();
    
    // Assign urgency scores
    for (const donation of openDonations) {
      donation.urgency_score = this.calculateUrgencyScore(donation);
      await window.agentAPI.updateDonation(donation.id, donation);
    }
    
    for (const request of openRequests) {
      request.urgency_score = this.calculateRequestUrgency(request);
      await window.agentAPI.updateRequest(request.id, request);
    }
  }

  calculateUrgencyScore(donation) {
    let score = 0;
    
    // Perishability impact
    if (donation.perishability === 'high') score += 10;
    else if (donation.perishability === 'medium') score += 5;
    
    // Time window pressure
    const now = new Date();
    const windowEnd = new Date(donation.window_end || donation.pickup_window_end);
    const hoursLeft = (windowEnd - now) / (1000 * 60 * 60);
    if (hoursLeft < 2) score += 15;
    else if (hoursLeft < 6) score += 10;
    else if (hoursLeft < 12) score += 5;
    
    // Category priority (water highest)
    if (donation.category === 'water') score += 20;
    else if (donation.category === 'produce') score += 8;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateRequestUrgency(request) {
    let score = 0;
    
    // Water priority
    if (request.special_needs?.includes('water')) score += 25;
    
    // Household size
    score += (request.household_size || 1) * 2;
    
    // Time since request
    const now = new Date();
    const created = new Date(request.created_at);
    const hoursWaiting = (now - created) / (1000 * 60 * 60);
    score += Math.min(hoursWaiting * 2, 20);
    
    return Math.max(0, Math.min(100, score));
  }
}

// Bundler Agent - groups nearby donations with recipients
class BundlerAgent extends BaseAgent {
  constructor() {
    super('bundler');
  }

  async execute() {
    await super.execute();
    
    const openDonations = await window.agentAPI.getOpenDonations();
    const openRequests = await window.agentAPI.getOpenRequests();
    
    // Create optimal bundles using AI matching
    const bundles = await this.createOptimalBundles(openDonations, openRequests);
    
    for (const bundle of bundles) {
      await window.agentAPI.createTask(bundle);
    }
  }

  async createOptimalBundles(donations, requests) {
    const bundles = [];
    
    // Sort by urgency and proximity
    const sortedRequests = requests.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0));
    
    for (const request of sortedRequests) {
      const nearbyDonations = this.findNearbyDonations(request, donations, 10); // 10km radius
      
      if (nearbyDonations.length > 0) {
        const bestMatch = this.selectBestMatch(request, nearbyDonations);
        
        if (bestMatch) {
          bundles.push({
            type: 'pickup_delivery',
            donation_id: bestMatch.id,
            request_id: request.id,
            pickup_coords: bestMatch.coords,
            delivery_coords: request.coords,
            urgency_score: Math.max(bestMatch.urgency_score || 0, request.urgency_score || 0),
            estimated_distance: this.calculateDistance(bestMatch.coords, request.coords)
          });
        }
      }
    }
    
    return bundles;
  }

  findNearbyDonations(request, donations, radiusKm) {
    return donations.filter(donation => {
      if (!donation.coords || !request.coords) return false;
      
      const distance = window.calculateDistance(
        donation.coords.lat, donation.coords.lng,
        request.coords.lat, request.coords.lng
      );
      
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = window.calculateDistance(a.coords.lat, a.coords.lng, request.coords.lat, request.coords.lng);
      const distB = window.calculateDistance(b.coords.lat, b.coords.lng, request.coords.lat, request.coords.lng);
      return distA - distB;
    });
  }

  selectBestMatch(request, donations) {
    // AI-powered matching algorithm
    let bestScore = 0;
    let bestMatch = null;
    
    for (const donation of donations) {
      let score = 0;
      
      // Category matching
      if (request.category === 'any' || request.category === donation.category) score += 20;
      
      // Special needs matching
      if (request.special_needs?.includes('water') && donation.category === 'water') score += 50;
      if (request.special_needs?.includes('baby_food') && donation.category === 'prepared') score += 30;
      
      // Quantity vs household size
      const qtyPerPerson = donation.qty / (request.household_size || 1);
      if (qtyPerPerson >= 1) score += 15;
      
      // Proximity bonus (closer is better)
      const distance = window.calculateDistance(
        donation.coords.lat, donation.coords.lng,
        request.coords.lat, request.coords.lng
      );
      score += Math.max(0, 20 - distance); // Max 20 points for distance
      
      // Urgency alignment
      if (donation.perishability === 'high' && request.special_needs?.includes('water')) score += 25;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = donation;
      }
    }
    
    return bestMatch;
  }

  calculateDistance(coords1, coords2) {
    return window.calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  }
}

// Optimizer Agent - optimizes volunteer routes
class OptimizerAgent extends BaseAgent {
  constructor() {
    super('optimizer');
  }

  async execute() {
    await super.execute();
    
    const pendingTasks = await window.agentAPI.getPendingTasks();
    const availableVolunteers = await window.agentAPI.getAvailableVolunteers();
    
    // Create optimized routes for volunteers
    const optimizedRoutes = await this.optimizeRoutes(pendingTasks, availableVolunteers);
    
    for (const route of optimizedRoutes) {
      await window.agentAPI.assignRoute(route.volunteer_id, route);
    }
  }

  async optimizeRoutes(tasks, volunteers) {
    const routes = [];
    
    // Group tasks by proximity and volunteer capacity
    for (const volunteer of volunteers) {
      if (!volunteer.available) continue;
      
      const suitableTasks = this.findSuitableTasks(volunteer, tasks);
      
      if (suitableTasks.length > 0) {
        const optimizedRoute = await this.createOptimizedRoute(volunteer, suitableTasks);
        routes.push(optimizedRoute);
      }
    }
    
    return routes;
  }

  findSuitableTasks(volunteer, tasks) {
    return tasks.filter(task => {
      // Check capacity constraints
      const estimatedWeight = task.estimated_weight_kg || 5;
      if (estimatedWeight > volunteer.vehicle_capacity_kg) return false;
      
      // Check refrigeration needs
      if (task.requires_refrigeration && !volunteer.refrigeration) return false;
      
      // Check proximity (within 25km of volunteer)
      const distance = window.calculateDistance(
        volunteer.coords.lat, volunteer.coords.lng,
        task.pickup_coords.lat, task.pickup_coords.lng
      );
      
      return distance <= 25;
    }).slice(0, 8); // Max 8 stops per route
  }

  async createOptimizedRoute(volunteer, tasks) {
    // Use Mapbox Optimization API or heuristic
    const optimizedTasks = await window.agentAPI.optimizeRoute(tasks);
    
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Calculate total route metrics
    for (let i = 0; i < optimizedTasks.length; i++) {
      const task = optimizedTasks[i];
      const prevCoords = i === 0 ? volunteer.coords : optimizedTasks[i-1].delivery_coords;
      
      const distance = window.calculateDistance(
        prevCoords.lat, prevCoords.lng,
        task.pickup_coords.lat, task.pickup_coords.lng
      );
      
      totalDistance += distance;
      totalDuration += distance * 3 + 15; // 3 min/km + 15 min per stop
    }
    
    return {
      volunteer_id: volunteer.id,
      tasks: optimizedTasks,
      total_distance_km: totalDistance,
      estimated_duration_min: totalDuration,
      status: 'planned'
    };
  }
}

// Coverage Guardian Agent - ensures all requests are served
class CoverageAgent extends BaseAgent {
  constructor() {
    super('coverage');
  }

  async execute() {
    await super.execute();
    
    // Create mock emergency requests for testing if they don't exist
    if (!window.mockEmergencyRequests) {
      window.mockEmergencyRequests = [
        {
          id: 'req1',
          user_id: 'user1',
          category: 'any',
          special_needs: ['water'],
          household_size: 4,
          coords: { lat: 37.7695, lng: -122.2650 },
          address: '2155 Central Ave, Alameda, CA 94501',
          urgency_score: 85,
          status: 'open',
          created_at: new Date().toISOString()
        },
        {
          id: 'req2', 
          user_id: 'user2',
          category: 'produce',
          special_needs: [],
          household_size: 2,
          coords: { lat: 37.7760, lng: -122.2405 },
          address: '2410 Alameda Ave, Alameda, CA 94501',
          urgency_score: 70,
          status: 'open',
          created_at: new Date().toISOString()
        }
      ];
      console.log('Created mock emergency requests for testing');
    }
    
    const coverage = await window.agentAPI.checkCoverage();
    
    // Alert if SLA risks detected
    if (coverage.slaRisks > 0) {
      await this.handleSLARisks(coverage.risks);
    }
    
    // Process mock emergency requests for testing
    const testRequests = window.mockEmergencyRequests || [];
    for (const request of testRequests) {
      await this.createEmergencyTask(request);
    }
    
    // Find unmatched requests and create emergency tasks
    const unmatchedRequests = await this.findUnmatchedRequests();
    
    for (const request of unmatchedRequests) {
      await this.createEmergencyTask(request);
    }
  }

  async handleSLARisks(risks) {
    for (const risk of risks) {
      console.warn(`SLA Risk: ${risk.type} ${risk.id} overdue by ${risk.hoursOverdue}h`);
      
      // Create high-priority emergency task
      await window.agentAPI.createTask({
        type: 'emergency_delivery',
        request_id: risk.id,
        urgency_score: 100,
        priority: 'critical'
      });
    }
  }

  async findUnmatchedRequests() {
    const openRequests = await window.agentAPI.getOpenRequests();
    const assignedTasks = await window.agentAPI.getAssignedTasks();
    
    const assignedRequestIds = new Set(assignedTasks.map(task => task.request_id));
    
    return openRequests.filter(request => !assignedRequestIds.has(request.id));
  }

  calculateDistance(coords1, coords2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async createEmergencyTask(request) {
    try {
      console.log(`Creating emergency task for request ${request.id}`, request);
      
      // Ensure fresh data is available from the real database service (snapshot fallback)
      let listings = [];
      try {
        listings = await (window.databaseService && window.databaseService.fetchListingsArray ? window.databaseService.fetchListingsArray() : (typeof window.getListingsArray === 'function' ? window.getListingsArray() : []));
      } catch (e) {
        listings = (typeof window.getListingsArray === 'function' ? window.getListingsArray() : (window.databaseService && Array.isArray(window.databaseService.listings) ? window.databaseService.listings : []));
      }
      if (!Array.isArray(listings) || listings.length === 0) {
        console.warn('No listings available from database or snapshot; using minimal emergency fallback');
        listings = [
          { id: 'emergency_1', title: 'Emergency Water Supply', category: 'beverages', qty: 24, status: 'available', coords: { lat: 37.7749, lng: -122.4194 }, created_at: new Date().toISOString() },
          { id: 'emergency_2', title: 'Emergency Food Package', category: 'packaged', qty: 10, status: 'available', coords: { lat: 37.7849, lng: -122.4094 }, created_at: new Date().toISOString() }
        ];
        try { if (window.databaseService) window.databaseService.listings = listings; } catch (e) { /* ignore */ }
      }

      const availableDonations = listings.filter(d => d.status === 'available' || d.status === 'AVAILABLE');
      console.log(`Found ${availableDonations.length} available donations for emergency task`);
      
      if (availableDonations.length === 0) {
        console.log('Creating community outreach task - no donations available');
        return {
          id: `task_${Date.now()}`,
          type: 'community_outreach',
          request_id: request.id,
          urgency_score: 85,
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString(),
          message: 'Seeking community resources for emergency request'
        };
      }
      
      // Match with first available donation
      const matchedDonation = availableDonations[0];
      console.log(`Emergency task matched request ${request.id} with donation ${matchedDonation.id}`);
      
      return {
        id: `task_${Date.now()}`,
        type: 'emergency_pickup_delivery',
        donation_id: matchedDonation.id,
        request_id: request.id,
        urgency_score: 95,
        priority: 'emergency',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error in createEmergencyTask for ${request.id}:`, error);
      return {
        id: `task_${Date.now()}`,
        type: 'error_recovery',
        request_id: request.id,
        status: 'failed',
        error: error.message,
        created_at: new Date().toISOString()
      };
    }
  }
}

// Global orchestrator instance
window.agentOrchestrator = new AgentOrchestrator();

// Initialize all agents
window.agentOrchestrator.registerAgent('intake', new IntakeAgent());
window.agentOrchestrator.registerAgent('triage', new TriageAgent());
window.agentOrchestrator.registerAgent('bundler', new BundlerAgent());
window.agentOrchestrator.registerAgent('optimizer', new OptimizerAgent());
window.agentOrchestrator.registerAgent('coverage', new CoverageAgent());
