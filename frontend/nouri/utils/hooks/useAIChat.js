import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../AuthContext.jsx';
import aiChatService from '../services/aiChatService.js';
import { useNouriGuide } from '../NouriGuideContext.jsx';

export const AI_TONE_OPTIONS = ['warm', 'professional', 'casual', 'empathetic'];
export const AI_TONE_LABELS = {
  warm: 'Warm',
  professional: 'Professional',
  casual: 'Casual',
  empathetic: 'Empathetic',
};

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

  const guideState = useMemo(() => ({
    ...guide,
    pageKey: pageContext.pageKey || guide.pageKey,
    path: pageContext.path || guide.path,
  }), [guide, pageContext]);

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
    setError(null);
    lastUserMessageRef.current = trimmed;
    setMessages((m) => [...m, {
      id: `u-${Date.now()}`,
      role: 'user',
      message: opts.displayText || trimmed,
    }]);
    setIsLoading(true);
    try {
      let data;
      if (!isAuthenticated || !user?.id) {
        data = await aiChatService.publicChat(trimmed, language);
        setMessages((m) => [...m, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          message: data.text || '',
          suggestions: data.suggestions || [],
        }]);
        return;
      }
      data = await aiChatService.chat(user.id, trimmed, {
        tone,
        lang: language,
        accessibilityProfile: a11ySettings,
        guideState,
        includeAudio: opts.includeAudio,
      });
      const assistant = normalizeAssistantMessage(data);
      setMessages((m) => [...m, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || 'Chat failed');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, language, tone, a11ySettings, guideState]);

  const sendSilentMessage = sendMessage;

  const sendVoice = useCallback(async (blob) => {
    if (!user?.id) {
      setError('Sign in to use voice');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiChatService.voice(user.id, blob, { lang: language });
      if (data.transcript) {
        setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', message: data.transcript }]);
      }
      const assistant = normalizeAssistantMessage(data);
      setMessages((m) => [...m, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || 'Voice failed');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, language]);

  const clearHistory = useCallback(async () => {
    if (user?.id) {
      try { await aiChatService.clearHistory(user.id); } catch { /* */ }
    }
    setMessages([]);
  }, [user?.id]);

  const submitFeedback = useCallback(async (conversationId, rating, comment) => {
    if (!user?.id) return;
    await aiChatService.submitFeedback({
      user_id: user.id,
      conversation_id: String(conversationId),
      rating,
      comment,
    });
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
