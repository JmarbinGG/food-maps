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

function AIChatbot() {
  // mode: 'idle' (just bot) | 'chooser' (two round options) | 'chat' | 'voice'
  const [mode, setMode] = React.useState('idle');
  const open = mode === 'chat';
  const [messages, setMessages] = React.useState([
    { role: 'assistant', text: "Hi! I'm your FoodMaps assistant. Ask me about listings, pickups, reminders, or recipes." }
  ]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const scrollRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

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
    const { token, userId } = getAuth();
    if (!token || !userId) {
      setMessages(m => [...m, { role: 'assistant', text: 'Please sign in to chat with the assistant.' }]);
      return;
    }
    setMessages(m => [...m, { role: 'user', text: trimmed }]);
    setInput('');
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
      setMessages(m => [...m, { role: 'assistant', text: data.text || '(no response)' }]);
    } catch (e) {
      console.error('AI chat error:', e);
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I could not reach the assistant right now.' }]);
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
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
      setMessages(m => [...m, { role: 'assistant', text: 'Microphone access denied.' }]);
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
      setMessages(m => [...m, { role: 'assistant', text: data.text || '(no response)' }]);
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
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
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
            </div>
          ))}
          {sending && (
            <div style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>Thinking…</div>
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
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            title="Hold to record"
            disabled={sending}
            style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', background: recording ? '#ef4444' : '#f3f4f6', color: recording ? 'white' : '#111', cursor: 'pointer', fontSize: '16px' }}
          >🎤</button>
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: (sending || !input.trim()) ? 0.6 : 1 }}
          >Send</button>
        </div>
      </div>
      <button
        onClick={() => setMode(m => (m === 'idle' ? 'chooser' : 'idle'))}
        style={buttonStyle}
        title="FoodMaps Assistant — tap to choose"
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
              icon="🤖"
              label="Assistant"
              onClick={() => setMode('chat')}
            />
            <ChooserBubble
              icon="🎤"
              label="Voice Search"
              onClick={() => setMode('voice')}
            />
          </div>
        </React.Fragment>
      )}

      {/* Voice Search modal */}
      {mode === 'voice' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setMode('idle'); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '20px',
          }}
        >
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>🎤 Voice Search</h2>
              <button onClick={() => setMode('idle')} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            {window.VoiceSearch
              ? React.createElement(window.VoiceSearch)
              : <p style={{ color: '#6b7280' }}>Voice search unavailable.</p>}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

// Round glassy bubble used by the chooser
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
