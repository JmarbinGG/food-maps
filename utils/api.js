// API utilities for backend communication
window.API_BASE_URL = 'http://localhost:8000';

// API request wrapper with error handling
window.apiRequest = async function(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API calls
window.authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  refresh: () => apiRequest('/auth/refresh', { method: 'POST' })
};

// User API calls
window.userAPI = {
  getMe: () => apiRequest('/me'),
  updateMe: (userData) => apiRequest('/me', {
    method: 'PUT',
    body: JSON.stringify(userData)
  })
};

// Listing API calls
// Listing API (real backend)
window.listingAPI = {
  create: (listingData) => apiRequest('/api/listings', {
    method: 'POST',
    body: JSON.stringify(listingData)
  }),

  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/listings${queryString ? '?' + queryString : ''}`);
  },

  getById: (id) => apiRequest(`/api/listings/${id}`),

  update: (id, listingData) => apiRequest(`/api/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(listingData)
  }),

  delete: (id) => apiRequest(`/api/listings/${id}`, { method: 'DELETE' })
};

// Transaction API calls
window.transactionAPI = {
  create: (transactionData) => apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData)
  }),
  
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions${queryString ? '?' + queryString : ''}`);
  },
  
  updateStatus: (id, status) => apiRequest(`/transactions/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  addMessage: (id, message) => apiRequest(`/transactions/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ message })
  })
};

// Volunteer API calls
window.volunteerAPI = {
  updateAvailability: (availability) => apiRequest('/volunteers/availability', {
    method: 'PUT',
    body: JSON.stringify(availability)
  }),
  
  getTasks: () => apiRequest('/volunteers/tasks'),
  
  acceptTask: (transactionId) => apiRequest(`/volunteers/tasks/${transactionId}/accept`, {
    method: 'PUT'
  }),
  
  getRoutes: (date) => apiRequest(`/volunteers/routes?date=${date}`)
};

// Food consumption and resource APIs
window.consumptionAPI = {
  logConsumption: async (consumptionData) => {
    try {
      return await apiRequest('/food/consumption', {
        method: 'POST',
        body: JSON.stringify(consumptionData)
      });
    } catch (error) {
      console.error('Error logging consumption:', error);
      throw error;
    }
  },
  
  getConsumptionHistory: async (days = 30) => {
    try {
      return await apiRequest(`/food/consumption?days=${days}`);
    } catch (error) {
      console.error('Error getting consumption history:', error);
      // Return mock data as fallback
      return [
        {
          id: 1,
          food_name: 'Fresh Vegetables',
          category: 'produce',
          qty_consumed: 2,
          unit: 'lbs',
          consumption_date: new Date().toISOString(),
          source_type: 'donation',
          notes: 'Sample consumption log'
        }
      ];
    }
  },
  
  getMyResources: async () => {
    try {
      return await apiRequest('/food/my-resources');
    } catch (error) {
      console.error('Error getting resources:', error);
      return [];
    }
  },
  
  createResource: async (resourceData) => {
    try {
      return await apiRequest('/food/resources', {
        method: 'POST',
        body: JSON.stringify(resourceData)
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }
};

// (Legacy /food/resources handlers removed) - use /api/listings instead.

// Mock mode toggle for development
// Disable mock API by default so the app uses the real backend
window.USE_MOCK_API = false;

// Mock API responses for development
window.mockResponses = {
  // listings are served by the real backend /api/listings
  '/me': () => Promise.resolve({ data: { id: '1', name: 'Test User', role: 'recipient' } }),
  '/food/consumption': (options) => {
    if (options?.method === 'GET') {
      return Promise.resolve([]);
    } else if (options?.method === 'POST') {
      return Promise.resolve({ id: Date.now(), success: true });
    }
    return Promise.resolve([]);
  },
  // legacy /food/resources mock removed
  '/food/my-resources': () => Promise.resolve([])
};

// Override API request in mock mode
if (window.USE_MOCK_API) {
  const originalApiRequest = window.apiRequest;
  window.apiRequest = async function(endpoint, options = {}) {
    try {
      // Check if we have a mock response for this endpoint
      const mockResponse = window.mockResponses[endpoint];
      if (mockResponse) {
        return await mockResponse(options);
      }
      
      // Check for parameterized endpoints
      if (endpoint.includes('/food/consumption')) {
        return await window.mockResponses['/food/consumption'](options);
      }
      if (endpoint.includes('/food/resources')) {
        return await window.mockResponses['/food/resources'](options);
      }
      
      // Return empty array for unhandled endpoints
      console.warn(`Mock API: No handler for ${endpoint}, returning empty data`);
      return [];
    } catch (error) {
      console.error('Mock API error:', error);
      return [];
    }
  };
}
