/**
 * Legacy shim — re-export guide engine voice helpers (DoGoods parity).
 */
export {
  subscribeAiVoice,
  getAiVoiceState,
  setAiCaption,
  clearAiCaption,
  cancelAllSpeech,
  speakWithAiVoice,
  registerExternalSpeechStop,
} from './nouriGuide/engine.js';
