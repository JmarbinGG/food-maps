// Landing Page Application Entry Point
const initializeLandingApp = () => {
  try {
    const modalContainer = document.getElementById('ai-search-modal');
    if (modalContainer) {
      const aiSearchRoot = ReactDOM.createRoot(modalContainer);
      aiSearchRoot.render(<LandingAISearch />);
      console.log('Landing page AI search initialized');
    } else {
      console.warn('AI search modal container not found');
    }
  } catch (error) {
    console.error('Landing page initialization error:', error);
  }
};

// Ensure DOM is ready before initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLandingApp);
} else {
  initializeLandingApp();
}
