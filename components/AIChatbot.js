// DoGoods AI floating chatbot widget
// Calls backend /api/ai/chat — token read from localStorage.auth_token

// Inline bot avatar — white levitating 3D-style head with glowing cyan face
function BotAvatar({ size = 32 }) {
  const uid = React.useId ? React.useId() : 'bot' + Math.random().toString(36).slice(2, 8);
  const bodyGrad = `bodyGrad-${uid}`;
  const faceGrad = `faceGrad-${uid}`;
  const glow = `glow-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        {/* soft body shading (top-light, bottom-shadow) */}
        <radialGradient id={bodyGrad} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        {/* dark rounded face screen */}
        <linearGradient id={faceGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        {/* cyan glow filter for eyes + mouth */}
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* antennae */}
      <line x1="78" y1="22" x2="96" y2="6" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <line x1="62" y1="18" x2="72" y2="2" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="96" cy="6" r="2.5" fill="#e2e8f0" />
      <circle cx="72" cy="2" r="2.3" fill="#e2e8f0" />

      {/* side earpieces (cyan) */}
      <ellipse cx="16" cy="62" rx="7" ry="10" fill="#7dd3fc" />
      <ellipse cx="16" cy="62" rx="3" ry="5" fill="#bae6fd" />
      <ellipse cx="104" cy="62" rx="7" ry="10" fill="#7dd3fc" />
      <ellipse cx="104" cy="62" rx="3" ry="5" fill="#bae6fd" />

      {/* head body */}
      <circle cx="60" cy="62" r="40" fill={`url(#${bodyGrad})`} stroke="#e2e8f0" strokeWidth="1" />

      {/* face screen */}
      <rect x="30" y="46" width="60" height="34" rx="12" ry="12" fill={`url(#${faceGrad})`} />

      {/* happy closed-curve eyes (glowing cyan) */}
      <g filter={`url(#${glow})`} stroke="#67e8f9" strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M42 60 Q46 54 50 60" />
        <path d="M70 60 Q74 54 78 60" />
      </g>

      {/* glowing smile */}
      <path d="M50 68 Q60 78 70 68 Q60 74 50 68 Z"
        fill="#67e8f9" filter={`url(#${glow})`} />

      {/* soft ground shadow */}
      <ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity="0.18" />
    </svg>
  );
}

// Pretty labels for the typing-dots indicator. We pick one based on the
// last user message so the user gets visual feedback like "Claiming…",
// "Posting listing…" instead of just "Thinking…".
const PENDING_LABELS = [
  { rx: /\b(claim|reserve|take|grab|i'll take)\b/i, label: 'Claiming…' },
  { rx: /\b(confirm|my code|here's the code)\b/i,    label: 'Confirming claim…' },
  { rx: /\b(cancel|release|unclaim|drop)\b/i,        label: 'Releasing claim…' },
  { rx: /\b(post|list|donate|share food|give away)\b/i, label: 'Posting listing…' },
  { rx: /\b(request|need food|i need)\b/i,           label: 'Posting request…' },
  { rx: /\b(near|nearby|around me|find food|search)\b/i, label: 'Finding food near you…' },
  { rx: /\b(route|directions|navigate)\b/i,          label: 'Planning route…' },
  { rx: /\b(recipe|cook|meal)\b/i,                   label: 'Looking up recipes…' },
  { rx: /\b(update|change|set)\s+(my|profile)/i,     label: 'Updating profile…' },
];
function guessPendingLabel(text) {
  const t = String(text || '');
  for (const { rx, label } of PENDING_LABELS) {
    if (rx.test(t)) return label;
  }
  return 'Thinking…';
}

// Map server-side tool names to user-facing chip text + state. The chip
// is rendered "done" when the tool succeeded and "error" if it returned
// an error payload. We deliberately only surface the action-y tools;
// pure read tools (search, dashboard, profile) don't get a chip.
const ACTION_CHIP_LABELS = {
  claim_listing:       { ok: '✓ Claim initiated', err: '✗ Claim failed', verb: 'Claiming…' },
  confirm_claim:       { ok: '✓ Claim confirmed', err: '✗ Confirmation failed', verb: 'Confirming…' },
  cancel_claim:        { ok: '✓ Claim released',  err: '✗ Release failed',  verb: 'Releasing…' },
  post_food_listing:   { ok: '✓ Listing posted',  err: '✗ Listing failed',  verb: 'Posting listing…' },
  post_food_request:   { ok: '✓ Request posted',  err: '✗ Request failed',  verb: 'Posting request…' },
  update_user_profile: { ok: '✓ Profile updated', err: '✗ Update failed',   verb: 'Updating profile…' },
  send_user_message:   { ok: '✓ Message sent',    err: '✗ Send failed',     verb: 'Sending…' },
  show_map:            { ok: '✓ Map opened',      err: '✗ Could not open map', verb: 'Opening map…' },
};
function ActionChip({ action }) {
  const cfg = ACTION_CHIP_LABELS[action.tool];
  if (!cfg) return null; // skip non-action tools
  const cls = action.ok ? 'foodmaps-action-chip done' : 'foodmaps-action-chip error';
  const label = action.ok ? cfg.ok : cfg.err;
  return (
    <span className={cls} title={action.summary || ''}>
      <span>{label}</span>
    </span>
  );
}

// Tool names whose successful execution should trigger a listings
// refresh in the rest of the app (so claimed items stop showing the
// Claim button etc.).
const LISTINGS_MUTATING_TOOLS = new Set([
  'claim_listing',
  'confirm_claim',
  'cancel_claim',
  'post_food_listing',
  'post_food_request',
]);
function maybeBroadcastListingsChanged(actions) {
  if (!Array.isArray(actions) || typeof window === 'undefined') return;
  const successful = actions.filter(a => a && a.ok && LISTINGS_MUTATING_TOOLS.has(a.tool));
  if (successful.length) {
    try {
      window.dispatchEvent(new CustomEvent('foodmaps:listings_changed', {
        detail: { actions: successful },
      }));
    } catch (_) { /* ignore */ }
  }
}

// UI-control tools tell the rest of the app to navigate / change view.
// We broadcast a separate event so app.js can flip viewMode/currentView
// without having to refresh listings.
const UI_CONTROL_TOOLS = new Set(['show_map']);
function maybeBroadcastUIControl(actions) {
  if (!Array.isArray(actions) || typeof window === 'undefined') return;
  const ui = actions.filter(a => a && a.ok && UI_CONTROL_TOOLS.has(a.tool));
  for (const a of ui) {
    try {
      if (a.tool === 'show_map') {
        window.dispatchEvent(new CustomEvent('foodmaps:show_map', {
          detail: { summary: a.summary || null },
        }));
      }
    } catch (_) { /* ignore */ }
  }
}

function AIChatbot() {
  // Anonymous mode (e.g. landing page) — no auth, uses /api/ai/public_chat,
  // no voice assistant, no mic in chat.
  const anonymous = typeof window !== 'undefined' && window.FOODMAPS_AI_ANONYMOUS === true;

  // mode: 'idle' (just bot) | 'chooser' (two round options) | 'chat' | 'voice'
  const [mode, setMode] = React.useState('idle');
  const open = mode === 'chat';
  const [messages, setMessages] = React.useState([
    {
      role: 'assistant', text: anonymous
        ? "Hi! I'm the FoodMaps assistant. Ask me anything about how food sharing works, food safety, or how to sign up."
        : "Hi! I'm your FoodMaps assistant. Ask me about listings, pickups, reminders, or recipes."
    }
  ]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  // Hint text shown next to the animated typing dots while a reply is
  // pending, so the user knows what kind of work is happening.
  const [pendingLabel, setPendingLabel] = React.useState('Thinking…');
  const [recording, setRecording] = React.useState(false);
  const scrollRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // When the AI calls show_map, minimize the chatbot so the user can
  // actually see the map underneath.
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = () => setMode('idle');
    window.addEventListener('foodmaps:show_map', handler);
    return () => window.removeEventListener('foodmaps:show_map', handler);
  }, []);

  function getAuth() {
    const token = localStorage.getItem('auth_token');
    let userId = null;
    try {
      const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
      if (cu && cu.id) userId = String(cu.id);
    } catch (e) { /* ignore */ }
    if (!userId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.sub != null) userId = String(payload.sub);
      } catch (e) { /* ignore */ }
    }
    return { token, userId };
  }

  async function sendMessage(text) {
    const trimmed = (text || '').trim();
    if (!trimmed || sending) return;

    if (anonymous) {
      setMessages(m => [...m, { role: 'user', text: trimmed }]);
      setInput('');
      setPendingLabel(guessPendingLabel(trimmed));
      setSending(true);
      try {
        const res = await fetch('/api/ai/public_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        const data = await res.json();
        setMessages(m => [...m, { role: 'assistant', text: data.text || '(no response)' }]);
      } catch (e) {
        console.error('AI public_chat error:', e);
        setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I could not reach the assistant right now.' }]);
      } finally {
        setSending(false);
      }
      return;
    }

    const { token, userId } = getAuth();
    if (!token || !userId) {
      setMessages(m => [...m, { role: 'assistant', text: 'Please sign in to chat with the assistant.' }]);
      return;
    }
    setMessages(m => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setPendingLabel(guessPendingLabel(trimmed));
    setSending(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, message: trimmed, include_audio: false }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
      }
      const data = await res.json();
      setMessages(m => [...m, {
        role: 'assistant',
        text: data.text || '(no response)',
        actions: Array.isArray(data.actions) ? data.actions : [],
      }]);
      maybeBroadcastListingsChanged(data.actions);
      maybeBroadcastUIControl(data.actions);
    } catch (e) {
      console.error('AI chat error:', e);
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I could not reach the assistant right now.' }]);
    } finally {
      setSending(false);
    }
  }

  function micUnavailableReason() {
    if (typeof window === 'undefined') return null;
    if (!window.isSecureContext) {
      return 'Microphone requires a secure (HTTPS) connection. Please open this site on https:// to use voice.';
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'Your browser does not support microphone capture. Try Chrome, Edge, Safari, or Firefox.';
    }
    if (typeof window.MediaRecorder === 'undefined') {
      return 'Your browser does not support audio recording. Try a different browser.';
    }
    return null;
  }

  function explainMicError(e) {
    const name = e && e.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'Microphone access blocked. Click the lock icon in your address bar and allow microphone for this site.';
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return 'No microphone detected. Plug one in or check your device settings.';
    }
    if (name === 'NotReadableError') {
      return 'Microphone is in use by another app. Close it and try again.';
    }
    return 'Microphone unavailable. Please check your browser permissions.';
  }

  async function startRecording() {
    const blocker = micUnavailableReason();
    if (blocker) {
      setMessages(m => [...m, { role: 'assistant', text: blocker }]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        await sendVoice(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e) {
      console.error('mic error:', e);
      setMessages(m => [...m, { role: 'assistant', text: explainMicError(e) }]);
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setRecording(false);
  }

  async function sendVoice(blob) {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      setMessages(m => [...m, { role: 'assistant', text: 'Please sign in first.' }]);
      return;
    }
    setPendingLabel('Transcribing…');
    setSending(true);
    const fd = new FormData();
    fd.append('audio', blob, 'voice.webm');
    fd.append('user_id', userId);
    fd.append('include_audio', 'false');
    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.transcript) setMessages(m => [...m, { role: 'user', text: data.transcript }]);
      setMessages(m => [...m, {
        role: 'assistant',
        text: data.text || '(no response)',
        actions: Array.isArray(data.actions) ? data.actions : [],
      }]);
      maybeBroadcastListingsChanged(data.actions);
      maybeBroadcastUIControl(data.actions);
    } catch (e) {
      console.error('voice error:', e);
      setMessages(m => [...m, { role: 'assistant', text: 'Voice request failed. Try text instead.' }]);
    } finally {
      setSending(false);
    }
  }

  const panelStyle = {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '360px',
    height: '520px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 140px)',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    display: open ? 'flex' : 'none',
    flexDirection: 'column',
    zIndex: 9998,
    overflow: 'hidden',
  };
  const buttonStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '104px',
    height: '104px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    outline: 'none',
    filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.28))',
    animation: open ? 'none' : 'foodmapsBotLevitate 3.2s ease-in-out infinite',
  };

  return (
    <React.Fragment>
      <div style={panelStyle}>
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BotAvatar size={40} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>FoodMaps Assistant</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Ask about food, pickups, reminders</div>
            </div>
          </div>
          <button onClick={() => setMode('idle')} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>×</button>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', background: '#f9fafb' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
              <div style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: '12px',
                background: m.role === 'user' ? '#10b981' : 'white',
                color: m.role === 'user' ? 'white' : '#111',
                border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>{m.text}</div>
              {m.role === 'assistant' && Array.isArray(m.actions) && m.actions.length > 0 && (
                <div style={{ maxWidth: '80%', marginTop: '2px' }}>
                  {m.actions.map((a, j) => <ActionChip key={j} action={a} />)}
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', padding: '4px 4px 8px' }}>
              <span className="foodmaps-typing-dots" aria-label="Assistant is typing">
                <span /><span /><span />
              </span>
              <span>{pendingLabel}</span>
            </div>
          )}
        </div>
        <div style={{ padding: '10px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '6px', background: 'white' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Type a message…"
            disabled={sending}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          />
          {!anonymous && (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              title="Hold to record"
              aria-label="Hold to record voice message"
              disabled={sending}
              style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', background: recording ? '#ef4444' : '#f3f4f6', color: recording ? 'white' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><MicIcon size={18} /></button>
          )}
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: (sending || !input.trim()) ? 0.6 : 1 }}
          >Send</button>
        </div>
      </div>
      <button
        onClick={() => setMode(m => {
          if (m === 'idle') return anonymous ? 'chat' : 'chooser';
          return 'idle';
        })}
        style={buttonStyle}
        title={anonymous ? 'Chat with FoodMaps Assistant' : 'FoodMaps Assistant — tap to choose'}
        aria-label="FoodMaps Assistant"
      >
        {mode !== 'idle'
          ? <span style={{ fontSize: 38, lineHeight: 1, color: '#334155', background: 'white', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>×</span>
          : <BotAvatar size={104} />}
      </button>

      {/* Chooser: two round transparent bubbles above the bot */}
      {mode === 'chooser' && (
        <React.Fragment>
          <div
            onClick={() => setMode('idle')}
            style={{ position: 'fixed', inset: 0, background: 'transparent', zIndex: 9997 }}
          />
          <div style={{ position: 'fixed', right: '36px', bottom: '110px', display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 9999, animation: 'foodmapsChooserIn 0.25s ease-out' }}>
            <ChooserBubble
              icon={<ChatIcon size={22} />}
              label="Chat"
              onClick={() => setMode('chat')}
            />
            <ChooserBubble
              icon={<MicIcon size={22} />}
              label="Voice Assistant"
              onClick={() => setMode('voice')}
            />
          </div>
        </React.Fragment>
      )}

      {/* Voice Assistant — modern full-screen orb UI */}
      {mode === 'voice' && (
        <VoiceAssistant onClose={() => setMode('idle')} getAuth={getAuth} />
      )}
    </React.Fragment>
  );
}

// Modern voice assistant modal: gradient background, pulsing orb, live status.
function VoiceAssistant({ onClose, getAuth }) {
  // status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [status, setStatus] = React.useState('idle');
  const [userText, setUserText] = React.useState('');
  const [aiText, setAiText] = React.useState('Tap the orb and start talking.');
  const [errorMsg, setErrorMsg] = React.useState('');
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const streamRef = React.useRef(null);
  const audioRef = React.useRef(null);

  async function startListening() {
    setErrorMsg('');
    // Upfront context check — avoids cryptic DOMException on HTTP pages
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus('error');
      setErrorMsg('Voice needs a secure (HTTPS) connection. Please open this site on https:// to use the voice assistant.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error');
      setErrorMsg('Your browser does not support microphone capture.');
      return;
    }
    if (typeof window.MediaRecorder === 'undefined') {
      setStatus('error');
      setErrorMsg('Your browser does not support audio recording.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        await sendVoiceBlob(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setStatus('listening');
      setUserText('');
      setAiText('Listening…');
    } catch (e) {
      console.error('mic error:', e);
      setStatus('error');
      const name = e && e.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setErrorMsg('Microphone access blocked. Click the lock icon in your address bar and allow microphone for this site.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setErrorMsg('No microphone detected. Plug one in or check your device settings.');
      } else if (name === 'NotReadableError') {
        setErrorMsg('Microphone is in use by another app. Close it and try again.');
      } else {
        setErrorMsg('Microphone unavailable. Please check your browser permissions.');
      }
    }
  }

  function stopListening() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setStatus('thinking');
    setAiText('Thinking…');
  }

  async function sendVoiceBlob(blob) {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      setStatus('error');
      setErrorMsg('Please sign in to use the voice assistant.');
      return;
    }
    const fd = new FormData();
    fd.append('audio', blob, 'voice.webm');
    fd.append('user_id', userId);
    fd.append('include_audio', 'true');
    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.transcript) setUserText(data.transcript);
      setAiText(data.text || '(no response)');
      if (data.audio_url) {
        setStatus('speaking');
        const audio = new Audio(data.audio_url);
        audioRef.current = audio;
        audio.onended = () => setStatus('idle');
        audio.onerror = () => setStatus('idle');
        audio.play().catch(() => setStatus('idle'));
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error('voice error:', e);
      setStatus('error');
      setErrorMsg('Could not reach the assistant. Try again.');
    }
  }

  function handleOrbClick() {
    if (status === 'listening') return stopListening();
    if (status === 'thinking') return;
    if (status === 'speaking') {
      if (audioRef.current) { try { audioRef.current.pause(); } catch (e) { } }
      setStatus('idle');
      return;
    }
    startListening();
  }

  React.useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioRef.current) { try { audioRef.current.pause(); } catch (e) { } }
    };
  }, []);

  const statusLabel = {
    idle: 'Tap to talk',
    listening: 'Listening… tap to stop',
    thinking: 'Thinking…',
    speaking: 'Speaking… tap to stop',
    error: 'Something went wrong',
  }[status];

  const orbClass = status === 'listening' ? 'foodmaps-orb foodmaps-orb-listening'
    : status === 'thinking' ? 'foodmaps-orb foodmaps-orb-thinking'
      : status === 'speaking' ? 'foodmaps-orb foodmaps-orb-speaking'
        : 'foodmaps-orb';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'radial-gradient(circle at 30% 20%, #1e3a8a 0%, #0f172a 55%, #020617 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'foodmapsFadeIn 0.25s ease-out',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
          color: 'white', fontSize: 22, cursor: 'pointer',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      >×</button>

      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
        FoodMaps Voice Assistant
      </div>

      {/* User transcript */}
      <div style={{
        minHeight: 28, maxWidth: 560, textAlign: 'center',
        color: 'rgba(255,255,255,0.85)', fontSize: 16, fontStyle: 'italic',
        marginBottom: 24, padding: '0 20px',
      }}>
        {userText ? `"${userText}"` : ''}
      </div>

      {/* Orb */}
      <button
        onClick={handleOrbClick}
        className={orbClass}
        disabled={status === 'thinking'}
        aria-label={statusLabel}
      >
        <span style={{ fontSize: 56, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
          {status === 'thinking' ? '…' : '🎤'}
        </span>
      </button>

      {/* Status */}
      <div style={{ color: 'white', fontSize: 18, fontWeight: 500, marginTop: 32, letterSpacing: 0.3 }}>
        {statusLabel}
      </div>

      {/* AI reply */}
      <div style={{
        maxWidth: 640, textAlign: 'center',
        color: 'rgba(255,255,255,0.92)', fontSize: 18, lineHeight: 1.55,
        marginTop: 18, padding: '0 24px', minHeight: 56,
      }}>
        {aiText}
      </div>

      {errorMsg && (
        <div style={{ color: '#fca5a5', fontSize: 14, marginTop: 12 }}>{errorMsg}</div>
      )}
    </div>
  );
}

// Round glassy bubble used by the chooser
// Simple stroked microphone icon used in the chat input and chooser
// instead of an emoji/image. Inherits color via currentColor.
function MicIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

// Simple stroked chat-bubble icon used for the Chat chooser.
function ChatIcon({ size = 22, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
    </svg>
  );
}

function ChooserBubble({ icon, label, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
      <span style={{
        background: 'rgba(17, 24, 39, 0.82)', color: 'white',
        padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        opacity: hover ? 1 : 0.92,
      }}>{label}</span>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={label}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#0f172a', fontSize: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          transform: hover ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
      >{icon}</button>
    </div>
  );
}

// One-time style injection for the levitation animation
(function injectAIChatbotStyles() {
  if (document.getElementById('foodmaps-ai-chatbot-styles')) return;
  const style = document.createElement('style');
  style.id = 'foodmaps-ai-chatbot-styles';
  style.textContent = `
    @keyframes foodmapsBotLevitate {
      0%   { transform: translateY(0)     rotate(-2deg); }
      50%  { transform: translateY(-10px) rotate(2deg); }
      100% { transform: translateY(0)     rotate(-2deg); }
    }
    @keyframes foodmapsChooserIn {
      0%   { opacity: 0; transform: translateY(8px) scale(0.92); }
      100% { opacity: 1; transform: translateY(0)   scale(1);   }
    }
    @keyframes foodmapsFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes foodmapsOrbPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6), 0 20px 60px rgba(16,185,129,0.35); }
      50%      { box-shadow: 0 0 0 28px rgba(16,185,129,0),  0 20px 60px rgba(16,185,129,0.55); }
    }
    @keyframes foodmapsOrbSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes foodmapsOrbBreathe {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.06); }
    }
    @keyframes foodmapsTypingBlink {
      0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
      40%           { opacity: 1;    transform: translateY(-3px); }
    }
    @keyframes foodmapsChipSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes foodmapsChipPop {
      0%   { transform: scale(0.85); opacity: 0; }
      60%  { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); }
    }
    .foodmaps-typing-dots { display: inline-flex; gap: 4px; align-items: center; }
    .foodmaps-typing-dots span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #10b981;
      animation: foodmapsTypingBlink 1.2s infinite ease-in-out;
    }
    .foodmaps-typing-dots span:nth-child(2) { animation-delay: 0.15s; }
    .foodmaps-typing-dots span:nth-child(3) { animation-delay: 0.3s; }
    .foodmaps-action-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 12px; font-weight: 500;
      animation: foodmapsChipPop 0.35s ease-out;
      margin: 4px 4px 0 0;
    }
    .foodmaps-action-chip.in-progress {
      background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;
    }
    .foodmaps-action-chip.done {
      background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7;
    }
    .foodmaps-action-chip.error {
      background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;
    }
    .foodmaps-action-chip .spin {
      width: 10px; height: 10px;
      border: 2px solid #10b981; border-top-color: transparent;
      border-radius: 50%;
      animation: foodmapsChipSpin 0.8s linear infinite;
    }
    .foodmaps-orb {
      width: 180px; height: 180px; border-radius: 50%;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at 30% 25%, #34d399 0%, #10b981 45%, #047857 100%);
      box-shadow: 0 20px 60px rgba(16,185,129,0.35), inset 0 -10px 30px rgba(0,0,0,0.25), inset 0 10px 30px rgba(255,255,255,0.25);
      transition: transform 0.2s ease;
      position: relative;
    }
    .foodmaps-orb:hover { transform: scale(1.04); }
    .foodmaps-orb:active { transform: scale(0.97); }
    .foodmaps-orb:disabled { cursor: default; }
    .foodmaps-orb-listening {
      background: radial-gradient(circle at 30% 25%, #f87171 0%, #ef4444 45%, #991b1b 100%);
      animation: foodmapsOrbPulse 1.4s ease-out infinite;
    }
    .foodmaps-orb-listening { box-shadow: 0 0 0 0 rgba(239,68,68,0.6), 0 20px 60px rgba(239,68,68,0.4); }
    .foodmaps-orb-thinking::after {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.25); border-top-color: #fff;
      animation: foodmapsOrbSpin 0.9s linear infinite;
    }
    .foodmaps-orb-speaking {
      background: radial-gradient(circle at 30% 25%, #60a5fa 0%, #3b82f6 45%, #1e40af 100%);
      animation: foodmapsOrbBreathe 1.1s ease-in-out infinite;
      box-shadow: 0 20px 60px rgba(59,130,246,0.45);
    }
  `;
  document.head.appendChild(style);
})();

// Mount the chatbot once the DOM is ready
(function mountAIChatbot() {
  function doMount() {
    if (document.getElementById('ai-chatbot-root')) return;
    const host = document.createElement('div');
    host.id = 'ai-chatbot-root';
    document.body.appendChild(host);
    const root = ReactDOM.createRoot(host);
    root.render(<AIChatbot />);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(doMount, 1200));
  } else {
    setTimeout(doMount, 1200);
  }
})();
