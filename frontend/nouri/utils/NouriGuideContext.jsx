import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nouri_guide_state_v1';

const defaultSettings = {
  easyMode: false,
  voiceOutput: false,
  largeText: false,
  highContrast: false,
  alwaysShowCaptions: false,
  preferTextOverVoice: false,
  formVoiceGuideEnabled: true,
};

const defaultGuide = {
  source: null,
  caption: '',
  text: '',
  label: '',
  section: '',
  stepIndex: 0,
  stepTotal: 0,
  formId: null,
  isSpeaking: false,
  isMuted: false,
  isDismissed: false,
  hasResume: false,
  goalKey: null,
};

const NouriGuideContext = createContext({
  settings: defaultSettings,
  guide: defaultGuide,
  updateSetting: () => {},
  syncFromChat: () => {},
  resetGuideSession: () => {},
  cancelVoice: () => {},
  toggleMute: () => {},
  dismiss: () => {},
  replay: () => {},
  resume: () => {},
});

export function NouriGuideProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultSettings, ...JSON.parse(raw).settings };
    } catch { /* */ }
    return defaultSettings;
  });
  const [guide, setGuide] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultGuide, ...JSON.parse(raw).guide };
    } catch { /* */ }
    return defaultGuide;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, guide }));
  }, [settings, guide]);

  useEffect(() => {
    const onFormFocus = (ev) => {
      const detail = ev?.detail;
      if (!detail || typeof detail !== 'object') return;
      setGuide((g) => ({
        ...g,
        formId: detail.formId ?? g.formId,
        fieldName: detail.fieldName ?? g.fieldName,
        label: detail.label ?? g.label,
        stepIndex: detail.stepIndex ?? g.stepIndex,
        stepTotal: detail.stepTotal ?? g.stepTotal,
        path: detail.path ?? g.path,
        pageKey: detail.pageKey ?? g.pageKey,
        source: detail.source ?? 'form',
      }));
    };
    window.addEventListener('foodmaps:form_focus', onFormFocus);
    return () => window.removeEventListener('foodmaps:form_focus', onFormFocus);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const syncFromChat = useCallback((patch) => {
    if (patch?.settings) setSettings((s) => ({ ...s, ...patch.settings }));
    if (patch?.guide) setGuide((g) => ({ ...g, ...patch.guide }));
  }, []);

  const cancelVoice = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setGuide((g) => ({ ...g, isSpeaking: false }));
  }, []);

  const resetGuideSession = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setGuide((g) => ({
      ...defaultGuide,
      isMuted: g.isMuted,
      isDismissed: g.isDismissed,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    setGuide((g) => ({ ...g, isMuted: !g.isMuted }));
    cancelVoice();
  }, [cancelVoice]);

  const dismiss = useCallback(() => {
    setGuide((g) => ({ ...g, isDismissed: true, isSpeaking: false }));
    cancelVoice();
  }, [cancelVoice]);

  const replay = useCallback(() => {
    setGuide((g) => ({ ...g, isDismissed: false }));
  }, []);

  const resume = useCallback(() => {
    setGuide((g) => ({ ...g, isDismissed: false, hasResume: false }));
  }, []);

  const value = useMemo(() => ({
    settings,
    guide,
    updateSetting,
    syncFromChat,
    resetGuideSession,
    cancelVoice,
    toggleMute,
    dismiss,
    replay,
    resume,
  }), [settings, guide, updateSetting, syncFromChat, resetGuideSession, cancelVoice, toggleMute, dismiss, replay, resume]);

  return <NouriGuideContext.Provider value={value}>{children}</NouriGuideContext.Provider>;
}

export function useNouriGuide() {
  return useContext(NouriGuideContext);
}
