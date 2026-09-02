// Minimal agent API shim — legacy FoodSearch/AIMatching use Nouri chat instead.
window.agentAPI = {
  findBestMatches: async () => {
    window.dispatchEvent(new CustomEvent('nouri:open-chat', {
      detail: { message: 'Find food near me' },
    }));
    return [];
  },
  autoAssignFood: async () => [],
  createTask: async () => ({}),
};
