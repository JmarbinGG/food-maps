// Landing Page Application Entry Point

function dispatchLandingPageContext() {
  try {
    window.dispatchEvent(new CustomEvent('foodmaps:page_context', {
      detail: { pageKey: 'landing', path: '/' },
    }));
  } catch (_) { /* ignore */ }
}

function normalizeNavigateTarget(detail) {
  let raw = (detail && (detail.target || detail.path || '')).toString().trim();
  if (raw.startsWith('/')) raw = raw.slice(1);
  const q = raw.indexOf('?');
  if (q >= 0) raw = raw.slice(0, q);
  return raw.toLowerCase();
}

function handleLandingNavigateUi(ev) {
  try {
    const detail = (ev && ev.detail) || {};
    const action = String(detail.action || 'open').toLowerCase();
    const closeActions = new Set(['close', 'close_modal', 'dismiss']);
    if (closeActions.has(action)) return;

    const target = normalizeNavigateTarget(detail);
    if (!target) return;

    const query = detail.query || detail.prefill || detail.params || null;
    if (query && typeof query === 'object') {
      try {
        sessionStorage.setItem('nouri_share_prefill', JSON.stringify(query));
      } catch (_) { /* ignore */ }
    }

    if (target === 'login' || target === 'signup') {
      sessionStorage.setItem('nouri_open_auth', '1');
      window.location.href = '/index.html';
      return;
    }

    if (target === 'share' || target === 'create' || target === 'bulk-create' || target === 'bulk-upload') {
      const view = (target === 'share') ? 'create'
        : (target === 'bulk-upload') ? 'bulk-create'
        : target;
      sessionStorage.setItem('nouri_initial_view', view);
      window.location.href = '/index.html';
      return;
    }

    if (target === 'find' || target === 'near-me' || target === 'map' || target === 'listings') {
      sessionStorage.setItem('nouri_initial_view', 'map');
      window.location.href = '/index.html';
      return;
    }

    if (target === 'profile' || target === 'dashboard' || target === 'settings') {
      sessionStorage.setItem('nouri_initial_view', 'dashboard');
      window.location.href = '/index.html';
      return;
    }

    // Default: send to main app
    window.location.href = '/index.html';
  } catch (err) {
    console.warn('landing navigate_ui handler failed', err);
  }
}

const initializeLandingApp = () => {
  try {
    dispatchLandingPageContext();
    window.addEventListener('foodmaps:navigate_ui', handleLandingNavigateUi);

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
