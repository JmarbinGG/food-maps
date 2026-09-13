/**
 * Form voice guide — thin adapter over unified NouriGuideContext / engine.
 * Food Maps SPA does not use react-router; lang comes from props or settings.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useNouriGuide } from '../NouriGuideContext.jsx';
import { resolveGuideLang } from '../guideLang.js';
import { reapplyPendingGuideField } from '../formFieldGuide.js';
import {
  SHARE_FOOD_HINTS,
  REQUEST_FOOD_HINTS,
  BULK_UPLOAD_HINTS,
} from '../nouriGuide/registry.js';

export const SHARE_FOOD_WELCOME =
  'Welcome! I can guide you through sharing food step by step.';
export const REQUEST_FOOD_WELCOME =
  'Welcome! I can help you request food from the community.';
export const BULK_UPLOAD_WELCOME =
  'Upload a CSV of food listings. I can guide you through each step.';

export {
  SHARE_FOOD_HINTS,
  REQUEST_FOOD_HINTS,
  BULK_UPLOAD_HINTS,
};

const FIELD_DEBOUNCE_MS = 80;

export default function useFormVoiceGuide({
  hints,
  fieldHints,
  welcomeMessage = '',
  lang = 'en',
  formId = 'share-food',
  preferText = false,
} = {}) {
  const resolvedHints = hints || fieldHints || {};
  const {
    settings,
    guide,
    registerForm,
    onFieldFocus,
    toggleMute,
    dismiss,
    replay,
    reportFieldError,
    notifyFieldActivity,
  } = useNouriGuide();

  const guideLang = resolveGuideLang(null, settings.preferredLanguage, lang);
  const welcomedRef = useRef(false);
  const fieldTimerRef = useRef(null);

  useEffect(() => {
    if (welcomedRef.current || guide.isDismissed || !welcomeMessage) return;
    if (settings.preferTextOverVoice && preferText) {
      /* captions still register form */
    }
    welcomedRef.current = true;
    const timer = setTimeout(() => {
      registerForm({ formId, welcomeMessage, hints: resolvedHints }, guideLang);
    }, 80);
    return () => clearTimeout(timer);
  }, [
    formId,
    welcomeMessage,
    resolvedHints,
    guideLang,
    registerForm,
    guide.isDismissed,
    settings.preferTextOverVoice,
    preferText,
  ]);

  const speakField = useCallback((fieldName) => {
    if (guide.isDismissed) return;
    const entry = resolvedHints[fieldName];
    if (!entry) return;

    const text = typeof entry === 'string' ? entry : entry.text;
    const label = typeof entry === 'string' ? null : entry.label;
    if (!text) return;

    notifyFieldActivity();

    if (fieldTimerRef.current) clearTimeout(fieldTimerRef.current);
    fieldTimerRef.current = setTimeout(() => {
      fieldTimerRef.current = null;
      onFieldFocus({ formId, fieldName, label, text, hints: resolvedHints }, guideLang);
    }, FIELD_DEBOUNCE_MS);
  }, [guide.isDismissed, resolvedHints, formId, guideLang, onFieldFocus, notifyFieldActivity]);

  const speakWelcome = useCallback(() => {
    if (guide.isDismissed || !welcomeMessage) return;
    registerForm({ formId, welcomeMessage, hints: resolvedHints }, guideLang);
  }, [guide.isDismissed, welcomeMessage, formId, resolvedHints, guideLang, registerForm]);

  const reportError = useCallback((fieldName, errorMessage) => {
    const entry = resolvedHints[fieldName];
    const label = entry && typeof entry !== 'string' ? entry.label : fieldName;
    reportFieldError(formId, fieldName, errorMessage, label);
  }, [formId, resolvedHints, reportFieldError]);

  useEffect(() => () => {
    if (fieldTimerRef.current) clearTimeout(fieldTimerRef.current);
  }, []);

  useEffect(() => {
    if (guide.isDismissed) return;
    const t = setTimeout(() => reapplyPendingGuideField(), 60);
    return () => clearTimeout(t);
  }, [formId, guide.fieldName, guide.isDismissed]);

  return {
    welcomeMessage,
    guide: {
      welcomeMessage,
      activeHint: guide.fieldName && resolvedHints[guide.fieldName]
        ? { text: typeof resolvedHints[guide.fieldName] === 'string'
          ? resolvedHints[guide.fieldName]
          : resolvedHints[guide.fieldName].text }
        : (guide.caption ? { text: guide.caption } : null),
      activeField: guide.fieldName,
      currentCaption: guide.caption || guide.text || '',
      isSpeaking: guide.isSpeaking,
      isMuted: guide.isMuted,
      isDismissed: guide.isDismissed,
      preferText: settings.preferTextOverVoice || preferText,
      alwaysShowCaptions: settings.alwaysShowCaptions !== false,
      speakField,
      speakWelcome,
      toggleMute,
      dismiss,
      replay,
      reportError,
    },
    speakField,
    speakWelcome,
    toggleMute,
    dismiss,
    replay,
    reportError,
    settings,
  };
}
