/**
 * Unified Accessibility + AI Guide context (DoGoods engine + Food Maps storage).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  subscribeNouriGuide,
  setNouriA11yPrefs,
  setGuideMuted,
  dismissGuide,
  startFormGuide,
  syncGuideFromFormField,
  handleChatAssistantMessage,
  resumeGuide,
  replayGuide,
  speakGuideText,
  cancelSpeech,
  loadPersistedGuideState,
  reportFieldError,
  notifyFieldChanged,
  setAutoplayBlockedHandler,
  clearGuideState,
} from './nouriGuide/engine.js';

const STORAGE_KEY = 'nouri_guide_state_v1';

export const defaultSettings = {
  easyMode: false,
  voiceOutput: false,
  largeText: false,
  highContrast: false,
  alwaysShowCaptions: true,
  preferTextOverVoice: false,
  formVoiceGuideEnabled: true,
  simpleLanguage: false,
  preferredLanguage: 'en',
  reduceMotion: false,
  listFirstFind: true,
  screenReaderOptimized: false,
};

const A11Y_CLASS_MAP = {
  largeText: 'a11y-large-text',
  highContrast: 'a11y-high-contrast',
  reduceMotion: 'a11y-reduce-motion',
  simpleLanguage: 'a11y-simple-language',
  easyMode: 'a11y-easy-mode',
  listFirstFind: 'a11y-list-first-find',
  screenReaderOptimized: 'a11y-screen-reader',
};

export function applyAccessibilityClasses(settings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(A11Y_CLASS_MAP).forEach(([key, className]) => {
    root.classList.toggle(className, Boolean(settings?.[key]));
  });
  const lang = String(settings?.preferredLanguage || 'en').toLowerCase().slice(0, 2) || 'en';
  root.setAttribute('lang', lang);
}

const NouriGuideContext = createContext({
  settings: defaultSettings,
  guide: loadPersistedGuideState?.() || {},
  updateSetting: () => {},
  resetSettings: () => {},
  syncFromChat: () => {},
  resetGuideSession: () => {},
  cancelVoice: () => {},
  toggleMute: () => {},
  dismiss: () => {},
  replay: () => {},
  resume: () => {},
  setAutoplayBlockedHandler: () => {},
  speak: () => {},
});

export function NouriGuideProvider({ children }) {
  const osMotionApplied = useRef(false);

  const [settings, setSettings] = useState(() => {
    let initial = { ...defaultSettings };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) initial = { ...defaultSettings, ...JSON.parse(raw).settings };
    } catch { /* */ }
    return initial;
  });

  const [guide, setGuide] = useState(() => loadPersistedGuideState() || {
    source: 'system',
    caption: '',
    text: '',
    isSpeaking: false,
    isMuted: false,
    isDismissed: false,
    hasResume: false,
    stepIndex: 0,
    stepTotal: 0,
    section: '',
    label: '',
    fieldName: '',
    formId: null,
    goalKey: null,
  });

  // Honor OS prefers-reduced-motion once on mount.
  useEffect(() => {
    if (osMotionApplied.current) return;
    osMotionApplied.current = true;
    try {
      if (typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setSettings((prev) => (prev.reduceMotion ? prev : { ...prev, reduceMotion: true }));
      }
    } catch { /* */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings }));
    } catch { /* */ }
    applyAccessibilityClasses(settings);
    setNouriA11yPrefs({
      preferTextOverVoice: settings.preferTextOverVoice,
      formVoiceGuideEnabled: settings.formVoiceGuideEnabled,
      simpleLanguage: settings.simpleLanguage,
      alwaysShowCaptions: settings.alwaysShowCaptions,
      preferredLanguage: settings.preferredLanguage || 'en',
    });
    // Sync across multiple React roots (chat shell + profile mount).
    try {
      window.dispatchEvent(new CustomEvent('foodmaps:a11y_settings', { detail: settings }));
    } catch { /* */ }
  }, [settings]);

  // Accept settings updates from another NouriGuideProvider root.
  useEffect(() => {
    const onRemote = (ev) => {
      const next = ev?.detail;
      if (!next || typeof next !== 'object') return;
      setSettings((prev) => {
        const merged = { ...defaultSettings, ...next };
        const keys = Object.keys(defaultSettings);
        const same = keys.every((k) => prev[k] === merged[k]);
        return same ? prev : merged;
      });
    };
    window.addEventListener('foodmaps:a11y_settings', onRemote);
    return () => window.removeEventListener('foodmaps:a11y_settings', onRemote);
  }, []);

  useEffect(() => subscribeNouriGuide(setGuide), []);

  // SPA listing forms dispatch foodmaps:form_focus
  useEffect(() => {
    const onFormFocus = (ev) => {
      const detail = ev?.detail;
      if (!detail || typeof detail !== 'object') return;
      const lang = settings.preferredLanguage || 'en';
      if (detail.formId && detail.fieldName) {
        syncGuideFromFormField({
          formId: detail.formId,
          fieldName: detail.fieldName,
          label: detail.label,
          text: detail.text || detail.label || '',
          hints: detail.hints || {},
        }, { lang });
      }
    };
    window.addEventListener('foodmaps:form_focus', onFormFocus);
    return () => window.removeEventListener('foodmaps:form_focus', onFormFocus);
  }, [settings.preferredLanguage]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);

  const toggleMute = useCallback(() => {
    setGuideMuted(!guide.isMuted);
  }, [guide.isMuted]);

  const dismiss = useCallback(() => {
    dismissGuide();
  }, []);

  const registerForm = useCallback((opts, lang) => {
    const resolved = lang || settings.preferredLanguage || 'en';
    startFormGuide(opts, { lang: resolved });
  }, [settings.preferredLanguage]);

  const onFieldFocus = useCallback((opts, lang) => {
    const resolved = lang || settings.preferredLanguage || 'en';
    syncGuideFromFormField(opts, { lang: resolved });
  }, [settings.preferredLanguage]);

  const syncFromChat = useCallback((messageOrPatch, opts = {}) => {
    if (
      messageOrPatch
      && typeof messageOrPatch === 'object'
      && (messageOrPatch.guide || messageOrPatch.settings)
    ) {
      if (messageOrPatch.settings) {
        setSettings((s) => ({ ...s, ...messageOrPatch.settings }));
      }
      const patch = messageOrPatch.guide || {};
      const speak = !!patch.isSpeaking;
      const text = patch.caption || patch.text || '';
      if (text) {
        return handleChatAssistantMessage(text, {
          lang: opts.lang || settings.preferredLanguage || 'en',
          speak,
        });
      }
      return false;
    }

    const message = String(messageOrPatch || '');
    const resolved = opts.lang || settings.preferredLanguage || 'en';
    return handleChatAssistantMessage(message, {
      lang: resolved,
      speak: !!opts.speak,
    });
  }, [settings.preferredLanguage]);

  const resume = useCallback((lang) => {
    resumeGuide({ lang: lang || settings.preferredLanguage || 'en' });
  }, [settings.preferredLanguage]);

  const replay = useCallback((lang) => {
    replayGuide({ lang: lang || settings.preferredLanguage || 'en' });
  }, [settings.preferredLanguage]);

  const speak = useCallback((text, lang) => {
    speakGuideText(text, { lang: lang || settings.preferredLanguage || 'en' });
  }, [settings.preferredLanguage]);

  const cancelVoice = useCallback(() => {
    cancelSpeech();
  }, []);

  const resetGuideSession = useCallback(() => {
    clearGuideState();
  }, []);

  const setAutoplayBlockedHandlerCb = useCallback((fn) => {
    setAutoplayBlockedHandler(fn);
  }, []);

  const reportFieldErrorFn = useCallback((formId, fieldName, errorMessage, label) => {
    reportFieldError(formId, fieldName, errorMessage, label);
  }, []);

  const notifyFieldActivity = useCallback(() => {
    notifyFieldChanged();
  }, []);

  const value = useMemo(() => ({
    settings,
    guide,
    updateSetting,
    resetSettings,
    toggleMute,
    dismiss,
    registerForm,
    onFieldFocus,
    syncFromChat,
    resume,
    replay,
    speak,
    cancelVoice,
    resetGuideSession,
    setAutoplayBlockedHandler: setAutoplayBlockedHandlerCb,
    reportFieldError: reportFieldErrorFn,
    notifyFieldActivity,
  }), [
    settings,
    guide,
    updateSetting,
    resetSettings,
    toggleMute,
    dismiss,
    registerForm,
    onFieldFocus,
    syncFromChat,
    resume,
    replay,
    speak,
    cancelVoice,
    resetGuideSession,
    setAutoplayBlockedHandlerCb,
    reportFieldErrorFn,
    notifyFieldActivity,
  ]);

  return (
    <NouriGuideContext.Provider value={value}>
      {children}
    </NouriGuideContext.Provider>
  );
}

export function useNouriGuide() {
  return useContext(NouriGuideContext);
}

/** @deprecated alias */
export function useAccessibility() {
  const ctx = useContext(NouriGuideContext);
  if (!ctx) {
    return {
      settings: defaultSettings,
      updateSetting: () => {},
      resetSettings: () => {},
    };
  }
  return {
    settings: ctx.settings,
    updateSetting: ctx.updateSetting,
    resetSettings: ctx.resetSettings || (() => {}),
  };
}

export const AccessibilityProvider = NouriGuideProvider;
