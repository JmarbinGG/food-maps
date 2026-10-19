import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../AuthContext.jsx';
import aiChatService from '../services/aiChatService.js';
import { useNouriGuide } from '../NouriGuideContext.jsx';
import { recordGuideSuccess, recordGuideFailure, clearGuideFailures } from '../nouriGuide/humanHandoff.js';

export const AI_TONE_OPTIONS = ['warm', 'professional', 'casual', 'empathetic'];
export const AI_TONE_LABELS = {
  warm: 'Warm',
  professional: 'Professional',
  casual: 'Casual',
  empathetic: 'Empathetic',
};

// Matches AIPublicChatRequest.message max_length on the backend.
const PUBLIC_CHAT_MAX_CHARS = 1500;

const LISTINGS_MUTATING_TOOLS = new Set([
  'claim_listing', 'confirm_claim', 'cancel_claim',
  'post_food_listing', 'post_food_request', 'bulk_import_listings',
]);

function maybeBroadcastListingsChanged(actions) {
  if (!Array.isArray(actions)) return;
  const successful = actions.filter((a) => a && a.ok && LISTINGS_MUTATING_TOOLS.has(a.tool));
  if (successful.length) {
    window.dispatchEvent(new CustomEvent('foodmaps:listings_changed', { detail: { actions: successful } }));
  }
  for (const a of successful) {
    if (a.tool === 'claim_listing' && a.listing_id != null) {
      window.dispatchEvent(new CustomEvent('foodmaps:open_claim_confirm', {
        detail: {
          listing_id: a.listing_id,
          title: a.title,
          needs_confirmation: a.needs_confirmation !== false,
        },
      }));
    }
  }
}

function normalizeAssistantMessage(data) {
  const toolResults = (data.actions || []).map((a) => ({
    tool: a.tool,
    ok: a.ok,
    result: a,
    summary: a.summary,
  }));
  return {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    // Server row id; /api/ai/feedback needs this, not the client id above.
    conversationId: data.conversation_id || null,
    timestamp: data.timestamp || new Date().toISOString(),
    role: 'assistant',
    message: data.text || '',
    toolResults,
    suggestions: data.suggestions || [],
    requiresConfirmation: data.requires_confirmation,
    pendingAction: data.pending_action,
    fromHistory: false,
  };
}

export function useAIChat() {
  const { user, isAuthenticated } = useAuthContext();
  const { settings: a11ySettings, guide } = useNouriGuide();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('nouri_chat_lang') || 'en');
  const [tone, setToneState] = useState('warm');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [pageContext, setPageContext] = useState({ pageKey: 'map', path: '/find' });
  const lastUserMessageRef = useRef('');
  const voiceSeqRef = useRef(0);

  useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail;
      if (detail && typeof detail === 'object') {
        setPageContext((prev) => ({ ...prev, ...detail }));
      }
    };
    window.addEventListener('foodmaps:page_context', handler);
    return () => window.removeEventListener('foodmaps:page_context', handler);
  }, []);

  const guideState = useMemo(() => {
    const role = String(user?.role || '').toLowerCase().trim() || undefined;
    return {
      ...guide,
      pageKey: pageContext.pageKey || guide.pageKey,
      path: pageContext.path || guide.path,
      // Backend chip forks need role even when profile lookup lags.
      ...(role ? { role, community_role: role } : {}),
    };
  }, [guide, pageContext, user?.role]);

  useEffect(() => {
    localStorage.setItem('nouri_chat_lang', language);
  }, [language]);

  useEffect(() => {
    if (!user?.id) {
      setHistoryLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const hist = await aiChatService.getHistory(user.id);
        if (cancelled) return;
        const rows = hist?.messages || hist || [];
        if (Array.isArray(rows) && rows.length) {
          setMessages(rows.map((m, i) => {
            const meta = m.metadata || {};
            const actions = meta.actions || [];
            return {
              id: `h-${i}`,
              conversationId: m.id || null,
              timestamp: m.created_at || m.timestamp || undefined,
              role: m.role,
              message: m.message || m.text || '',
              fromHistory: true,
              toolResults: (m.toolResults || actions).map((a) => ({
                tool: a.tool,
                ok: a.ok,
                result: a,
                summary: a.summary,
              })),
              suggestions: meta.suggestions || [],
              requiresConfirmation: meta.requires_confirmation,
              pendingAction: meta.pending_action,
            };
          }));
        }
      } catch {
        /* history optional */
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const setTone = useCallback(async (next) => {
    setToneState(next);
    if (user?.id) {
      try { await aiChatService.setTone(user.id, next); } catch { /* */ }
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (text, opts = {}) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    // opts.lang lets a caller switch language and send in the same tick,
    // before the setLanguage() state update has reached this closure.
    const lang = opts.lang || language;
    setError(null);
    if (!opts.silent) {
      lastUserMessageRef.current = trimmed;
      setMessages((m) => [...m, {
        id: `u-${Date.now()}`,
        role: 'user',
        message: opts.displayText || trimmed,
        timestamp: new Date().toISOString(),
      }]);
    }
    setIsLoading(true);
    try {
      let data;
      if (!isAuthenticated || !user?.id) {
        if (trimmed.length > PUBLIC_CHAT_MAX_CHARS) {
          setError(lang === 'es'
            ? `El mensaje es demasiado largo (máximo ${PUBLIC_CHAT_MAX_CHARS} caracteres). Inicia sesión para mensajes más largos.`
            : `That message is too long (max ${PUBLIC_CHAT_MAX_CHARS} characters). Sign in to send longer messages.`);
          return;
        }
        data = await aiChatService.publicChat(trimmed, lang);
        setMessages((m) => [...m, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          message: data.text || '',
          suggestions: data.suggestions || [],
          timestamp: new Date().toISOString(),
        }]);
        return;
      }
      data = await aiChatService.chat(user.id, trimmed, {
        tone,
        lang,
        accessibilityProfile: a11ySettings,
        guideState,
        includeAudio: opts.includeAudio,
      });
      const assistant = normalizeAssistantMessage(data);
      setMessages((m) => [...m, assistant]);
      maybeBroadcastListingsChanged(data.actions);
      recordGuideSuccess();
    } catch (err) {
      recordGuideFailure(err?.message || 'chat');
      setError(err?.message || 'Chat failed');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, language, tone, a11ySettings, guideState]);

  // System-generated follow-ups (e.g. "bulk create already done"): the
  // instruction text goes to the model but never shows as a user bubble.
  const sendSilentMessage = useCallback(
    (text, opts = {}) => sendMessage(text, { ...opts, silent: true }),
    [sendMessage],
  );

  const sendVoice = useCallback(async (blob) => {
    if (!user?.id) {
      setError('Sign in to use voice');
      return null;
    }
    const seq = ++voiceSeqRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiChatService.voice(user.id, blob, {
        lang: language,
        tone,
        accessibilityProfile: a11ySettings,
        guideState,
        includeAudio: false,
      });
      if (seq !== voiceSeqRef.current) return null;
      if (data.transcript) {
        setMessages((m) => [...m, {
          id: `u-${Date.now()}`,
          role: 'user',
          message: data.transcript,
          source: 'voice',
          timestamp: new Date().toISOString(),
        }]);
      }
      const assistant = {
        ...normalizeAssistantMessage(data),
        source: 'voice',
      };
      setMessages((m) => [...m, assistant]);
      maybeBroadcastListingsChanged(data.actions);
      recordGuideSuccess();
      return {
        transcript: data.transcript || '',
        text: data.text || '',
        messageId: assistant.id,
      };
    } catch (err) {
      if (seq !== voiceSeqRef.current) return null;
      const aiErr = err?.aiError?.detail || err?.aiError;
      const unintelligible = aiErr?.error_code === 'invalid_input'
        || aiErr?.code === 'invalid_input';
      if (unintelligible) {
        const soft = language === 'es'
          ? 'No te escuché con claridad. Intenta hablar de nuevo o escribe tu mensaje.'
          : "I didn't quite catch that. Please try speaking again or type your message.";
        setMessages((m) => [...m, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          message: soft,
          source: 'voice',
          isError: false,
        }]);
        return { transcript: '', text: soft, unintelligible: true };
      }
      recordGuideFailure(err?.message || 'voice');
      setError(err?.message || 'Voice failed');
      throw err;
    } finally {
      if (seq === voiceSeqRef.current) setIsLoading(false);
    }
  }, [user?.id, language, tone, a11ySettings, guideState]);

  const clearHistory = useCallback(async () => {
    lastUserMessageRef.current = '';
    setError(null);
    clearGuideFailures();
    if (user?.id) {
      await aiChatService.clearHistory(user.id);
    }
    setMessages([]);
  }, [user?.id]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Accepts either a client message id (what the panel passes) or a server
  // conversation id. Never rejects: feedback is best-effort.
  const submitFeedback = useCallback(async (messageOrConversationId, rating, comment) => {
    if (!user?.id) return false;
    const msg = messagesRef.current.find((m) => m.id === messageOrConversationId);
    const conversationId = msg ? msg.conversationId : messageOrConversationId;
    if (!/^\d+$/.test(String(conversationId ?? ''))) return false;
    try {
      await aiChatService.submitFeedback({
        user_id: user.id,
        conversation_id: String(conversationId),
        rating,
        comment,
      });
      return true;
    } catch (err) {
      console.warn('[Nouri] feedback not saved:', err?.message || err);
      return false;
    }
  }, [user?.id]);

  const appendLocalMessage = useCallback((msg) => {
    setMessages((m) => [...m, { id: `l-${Date.now()}`, ...msg }]);
  }, []);

  const retryMessage = useCallback(() => {
    if (lastUserMessageRef.current) sendMessage(lastUserMessageRef.current);
  }, [sendMessage]);

  const regenerateLast = retryMessage;

  const confirmPendingAction = useCallback(async (confirm = true) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await aiChatService.confirm(user.id, { confirm });
      const assistant = normalizeAssistantMessage(data);
      setMessages((m) => [...m, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || 'Confirm failed');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return useMemo(() => ({
    messages,
    sendMessage,
    sendVoice,
    isLoading,
    error,
    language,
    setLanguage,
    clearHistory,
    submitFeedback,
    appendLocalMessage,
    sendSilentMessage,
    retryMessage,
    regenerateLast,
    historyLoaded,
    tone,
    setTone,
    confirmPendingAction,
    isAuthenticated,
  }), [
    messages, sendMessage, sendVoice, isLoading, error, language,
    clearHistory, submitFeedback, appendLocalMessage, sendSilentMessage,
    retryMessage, regenerateLast, historyLoaded, tone, setTone,
    confirmPendingAction, isAuthenticated,
  ]);
}
