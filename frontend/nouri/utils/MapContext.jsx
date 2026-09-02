import React, { createContext, useCallback, useContext, useMemo } from 'react';

const MapContext = createContext({
  applyToolResults: () => {},
  clearAIOverlays: () => {},
});

const MAP_TOOLS = new Set([
  'search_food_near_user', 'search_food_nearby', 'get_recent_listings',
  'get_community_listings', 'get_user_listings', 'get_my_claims',
  'get_mapbox_route', 'show_route_to_listing', 'query_distribution_centers',
  'optimize_pickup_route',
]);

export function MapProvider({ children }) {
  const applyToolResults = useCallback((toolResults) => {
    if (!Array.isArray(toolResults)) return;
    for (const tr of toolResults) {
      const tool = tr.tool;
      const result = tr.result ?? tr;
      if (!MAP_TOOLS.has(tool)) continue;
      if (tool === 'show_route_to_listing' && result.route) {
        try { window.__foodmapsPendingRoute = { route: result.route, at: Date.now() }; } catch (_) { /* */ }
        window.dispatchEvent(new CustomEvent('foodmaps:show_route', {
          detail: { route: result.route, summary: result.summary },
        }));
      }
      const listings = result.listings || result.results || result.stops;
      if (listings?.length) {
        const first = listings[0];
        const lat = first.latitude ?? first.lat ?? first.coords_lat;
        const lng = first.longitude ?? first.lng ?? first.coords_lng;
        if (lat != null && lng != null) {
          window.dispatchEvent(new CustomEvent('foodmaps:fly_to', {
            detail: { lat: parseFloat(lat), lng: parseFloat(lng), zoom: 13 },
          }));
        }
      }
    }
  }, []);

  const clearAIOverlays = useCallback(() => {
    try { delete window.__foodmapsPendingRoute; } catch (_) { /* */ }
  }, []);

  const value = useMemo(() => ({ applyToolResults, clearAIOverlays }), [applyToolResults, clearAIOverlays]);
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext() {
  return useContext(MapContext);
}
