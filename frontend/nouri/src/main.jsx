import React from 'react';

import { createRoot } from 'react-dom/client';

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';



import { AuthProvider } from '../utils/AuthContext.jsx';

import { MapProvider } from '../utils/MapContext.jsx';

import { UIControlProvider } from '../utils/UIControlContext.jsx';

import { NouriGuideProvider } from '../utils/NouriGuideContext.jsx';

import AIChatPanel from './assistant/AIChatPanel.jsx';

import NouriGuideBar from './common/NouriGuideBar.jsx';

import RoleInsightsPanel from './assistant/RoleInsightsPanel.jsx';

import ShareBulkCsvPanel from './food/ShareBulkCsvPanel.jsx';

import VoiceLocationSearch from './food/VoiceLocationSearch.jsx';

import AIRecipePanel from './food/AIRecipePanel.jsx';

import AIQueryPanel from './assistant/AIQueryPanel.jsx';

import AIHealthBanner from './common/AIHealthBanner.jsx';

import AICaptionBar from './common/AICaptionBar.jsx';

import FormVoiceGuideHost from './common/FormVoiceGuideHost.jsx';

import HumanSupportBridge from './common/HumanSupportBridge.jsx';

import AccessibilitySettings from './common/AccessibilitySettings.jsx';



import './nouri.css';

import 'react-toastify/dist/ReactToastify.css';



const mountRoots = new Map();



function NouriShell() {

  return (

    <>

      <AIHealthBanner />

      <AICaptionBar />

      <NouriGuideBar />

      <HumanSupportBridge />

      <AIChatPanel />

      <ToastContainer position="top-center" autoClose={4000} hideProgressBar theme="colored" />

    </>

  );

}



function Providers({ children }) {

  return (

    <AuthProvider>

        <NouriGuideProvider>

          <MapProvider>

            <UIControlProvider>

              {children}

            </UIControlProvider>

          </MapProvider>

        </NouriGuideProvider>

    </AuthProvider>

  );

}



function mountChat(hostId) {

  let host = document.getElementById(hostId);

  if (!host) {

    host = document.createElement('div');

    host.id = hostId;

    document.body.appendChild(host);

  }

  if (mountRoots.has(hostId)) return mountRoots.get(hostId);

  const root = createRoot(host);

  mountRoots.set(hostId, root);

  root.render(

    <Providers>

      <NouriShell />

    </Providers>,

  );

  return root;

}



function mountPanel(Component, hostId, props = {}) {

  let host = document.getElementById(hostId);

  if (!host) return null;

  if (mountRoots.has(hostId)) {

    mountRoots.get(hostId).render(

      <Providers>

        <Component {...props} />

      </Providers>,

    );

    return mountRoots.get(hostId);

  }

  const root = createRoot(host);

  mountRoots.set(hostId, root);

  root.render(

    <Providers>

      <Component {...props} />

    </Providers>,

  );

  return root;

}



function mountWithRetry(mountFn, attempts = 10, intervalMs = 500) {

  let tries = 0;

  const run = () => {

    tries += 1;

    const ok = mountFn();

    if (ok !== false || tries >= attempts) return;

    setTimeout(run, intervalMs);

  };

  run();

  window.addEventListener('load', run, { once: true });

}



window.FoodMapsNouri = {

  mountChat,

  mountPanel,

  mountWithRetry,

  RoleInsightsPanel,

  ShareBulkCsvPanel,

  VoiceLocationSearch,

  AIRecipePanel,

  AIQueryPanel,

  FormVoiceGuideHost,

  AccessibilitySettings,

  mountRoleInsights: (hostId, props) => mountPanel(RoleInsightsPanel, hostId, props),

  mountBulkCsv: (hostId, props) => mountPanel(ShareBulkCsvPanel, hostId, props),

  mountVoiceSearch: (hostId, props) => mountPanel(VoiceLocationSearch, hostId, props),

  mountRecipePanel: (hostId, props) => mountPanel(AIRecipePanel, hostId, props),

  mountQueryPanel: (hostId, props) => mountPanel(AIQueryPanel, hostId, props),

  mountFormVoiceGuide: (hostId, props) => mountPanel(FormVoiceGuideHost, hostId, props),

  mountAccessibilitySettings: (hostId, props) => mountPanel(AccessibilitySettings, hostId, props),

  unmountAccessibilitySettings: (hostId = 'nouri-a11y-settings-root') => {
    const root = mountRoots.get(hostId);
    if (!root) return;
    try {
      root.unmount();
    } catch { /* */ }
    mountRoots.delete(hostId);
  },

};



function bootNouriChat() {
  mountChat('nouri-ai-root');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootNouriChat);
  } else {
    bootNouriChat();
  }
  window.addEventListener('load', bootNouriChat);
}


