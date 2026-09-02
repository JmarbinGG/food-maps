import { useCallback, useMemo, useState } from 'react';

export const SHARE_FOOD_WELCOME = 'Welcome! I can guide you through sharing food step by step.';
export const SHARE_FOOD_HINTS = {};
export const REQUEST_FOOD_WELCOME = 'Welcome! I can help you request food from the community.';
export const REQUEST_FOOD_HINTS = {};

export default function useFormVoiceGuide({
  welcomeMessage = '',
  fieldHints = {},
  preferText = false,
  alwaysShowCaptions = true,
} = {}) {
  const [activeField, setActiveField] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');

  const activeHint = activeField && fieldHints[activeField]
    ? { text: fieldHints[activeField] }
    : null;

  const speak = useCallback((text) => {
    if (!text || isMuted || typeof window === 'undefined') return;
    setCurrentCaption(text);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  }, [isMuted]);

  const speakField = useCallback((fieldName) => {
    setActiveField(fieldName);
    const hint = fieldHints[fieldName];
    if (hint) speak(hint);
  }, [fieldHints, speak]);

  const speakWelcome = useCallback(() => {
    if (welcomeMessage) speak(welcomeMessage);
  }, [welcomeMessage, speak]);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const dismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const reportError = useCallback((message) => {
    speak(typeof message === 'string' ? message : 'Please check this field.');
  }, [speak]);

  const guide = useMemo(() => ({
    welcomeMessage,
    activeHint,
    currentCaption,
    isMuted,
    isSpeaking,
    isDismissed,
    preferText,
    alwaysShowCaptions,
    toggleMute,
    speakWelcome,
    dismiss,
  }), [
    welcomeMessage, activeHint, currentCaption, isMuted, isSpeaking,
    isDismissed, preferText, alwaysShowCaptions, toggleMute, speakWelcome, dismiss,
  ]);

  return { guide, speakField, reportError, speakWelcome, toggleMute, dismiss };
}
