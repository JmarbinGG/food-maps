import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

const UIControlContext = createContext({
  registerHandler: () => () => {},
  executeUIAction: () => 0,
  executeUIActionsFromToolResults: () => 0,
});

const UI_CONTROL_TOOLS = new Set(['show_map', 'navigate_ui', 'show_route_to_listing', 'open_listing']);

function dispatchUIAction(action) {
  if (!action) return;
  const act = (action.action || 'open').toLowerCase();
  // Prefer semantic target (e.g. "dispatch") over path ("/admin/distribution")
  // so SPA view keys match app.js handlers.
  const rawTarget = (action.target || action.path || '').toString();
  const pathNoSlash = rawTarget.replace(/^\//, '');
  const tgt = pathNoSlash.split('?')[0].toLowerCase();
  const query = pathNoSlash.includes('?')
    ? pathNoSlash.split('?').slice(1).join('?')
    : (action.query || null);
  if (action.tool === 'show_route_to_listing' && action.route) {
    try {
      window.__foodmapsPendingRoute = { route: action.route, summary: action.summary || null, at: Date.now() };
    } catch (_) { /* */ }
    window.dispatchEvent(new CustomEvent('foodmaps:show_map', { detail: { summary: action.summary } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('foodmaps:show_route', {
        detail: { route: action.route, summary: action.summary || null },
      }));
    }, 150);
    return;
  }
  if (action.tool === 'open_listing' || act === 'open_listing') {
    const listingId = action.listing_id;
    if (listingId != null) {
      window.dispatchEvent(new CustomEvent('foodmaps:open_listing', {
        detail: { listing_id: listingId, title: action.title || '' },
      }));
    }
    return;
  }
  if (action.tool === 'show_map' || act === 'open_map' || tgt === 'map') {
    window.dispatchEvent(new CustomEvent('foodmaps:show_map', { detail: { summary: action.summary } }));
    return;
  }
  window.dispatchEvent(new CustomEvent('foodmaps:navigate_ui', {
    detail: {
      action: act || 'open',
      target: tgt,
      path: action.path || null,
      query,
      summary: action.summary,
    },
  }));
}

export function UIControlProvider({ children }) {
  const handlersRef = useRef([]);

  const registerHandler = useCallback((fn) => {
    handlersRef.current.push(fn);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== fn);
    };
  }, []);

  const executeUIAction = useCallback((action) => {
    dispatchUIAction(action);
    handlersRef.current.forEach((h) => { try { h(action); } catch (_) { /* */ } });
    return 1;
  }, []);

  const executeUIActionsFromToolResults = useCallback((toolResults) => {
    if (!Array.isArray(toolResults)) return 0;
    let count = 0;
    for (const tr of toolResults) {
      const result = tr.result ?? tr;
      if (UI_CONTROL_TOOLS.has(tr.tool) && (result.ok || result.success !== false)) {
        dispatchUIAction({ ...result, tool: tr.tool });
        count += 1;
      }
      if (result.frontend_hint?.path) {
        dispatchUIAction({ target: result.frontend_hint.path, action: 'open' });
        count += 1;
      }
    }
    return count;
  }, []);

  const value = useMemo(() => ({
    registerHandler,
    executeUIAction,
    executeUIActionsFromToolResults,
  }), [registerHandler, executeUIAction, executeUIActionsFromToolResults]);

  return <UIControlContext.Provider value={value}>{children}</UIControlContext.Provider>;
}

export function useUIControl() {
  return useContext(UIControlContext);
}
