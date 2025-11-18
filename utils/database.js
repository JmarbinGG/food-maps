// Database service
window.databaseService = {
  listings: [],
  isConnected: true,
  
  fetchListingsArray: async function() {
    return this.listings || [];
  },
  
  authLogin: async function(email, password) {
    return { success: true, token: 'demo-token' };
  },
  
  authRegister: async function(userData) {
    return { success: true };
  }
};

window.getListingsArray = function() {
  return window.databaseService.listings || [];
};