import React, { createContext, useContext } from 'react';

const AccessibilityContext = createContext({
  settings: {},
  updateSetting: () => {},
});

export function AccessibilityProvider({ children }) {
  const value = React.useMemo(() => ({
    settings: { alwaysShowCaptions: true },
    updateSetting: () => {},
  }), []);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
