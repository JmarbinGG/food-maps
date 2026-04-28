// FoodMaps AI floating chatbot widget
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
// last user message so the user sees a hint like "Claiming…" before the
// backend replies. We deliberately keep these rules CONSERVATIVE: each
// pattern must be unambiguous in isolation, otherwise we fall back to
// the neutral "Thinking…" label. The post-response ActionChip and
// SuccessBanner already show the *actual* tool the backend executed,
// so a missed guess just means a generic spinner — much better than a
// wrong "Claiming…" chip while the user is posting a listing, or
// "Posting…" while the user is claiming.
//
// Rules of thumb encoded below:
//   - 4-digit only message ("1234")              -> confirm_claim
//   - explicit "confirm 1234" / "my code is …"   -> confirm_claim
//   - "cancel/release/unclaim my claim"          -> cancel_claim
//   - "claim listing 42" / "claim #42" / "claim listing <name>"
//     / "I'll take listing 42" / "reserve listing 42"
//     / explicit "claim it/that/the <name>"      -> claim_listing
//   - "post a listing" / "create a listing"
//     / "I want to donate/share food/give away food"
//     / "list food to give away"                 -> post_food_listing
//   - "request food" / "I need food"             -> post_food_request
//   - "update/change my profile/address/phone"   -> update_user_profile
//   - "find food near me" / "search for bread"   -> search (no tool chip)
// Anything that doesn't clearly match -> "Thinking…" (tool: null).
//
// Order matters because some patterns share keywords; the first match
// wins. We sort from most specific -> least specific.
const PENDING_LABELS = [
  // 4-digit-only message is the strongest signal of confirm_claim.
  { rx: /^\s*\d{4}\s*$/,                                                            label: 'Confirming claim…',   tool: 'confirm_claim' },
  { rx: /\b(confirm|my\s+code\s+is|here'?s\s+(my|the)\s+code|use\s+code)\b.*\d{3,4}|\bconfirm\s+\d{3,4}\b/i,
                                                                                    label: 'Confirming claim…',   tool: 'confirm_claim' },
  // Cancel/release MUST mention claim/listing/reservation to avoid hitting
  // generic "cancel" chatter.
  { rx: /\b(cancel|release|unclaim|drop)\b.*\b(claim|listing|reservation|it|that)\b/i,
                                                                                    label: 'Releasing claim…',    tool: 'cancel_claim' },
  // Update profile must explicitly target profile fields.
  { rx: /\b(update|change|set)\s+(my\s+)?(profile|address|phone|name|email|diet(ary)?|allergen|preferences?)\b/i,
                                                                                    label: 'Updating profile…',   tool: 'update_user_profile' },
  // Bulk CSV import — fenced ```csv block or "bulk import"/"import these"
  // phrasing. Match early so it doesn't fall through to a generic donor
  // intent chip.
  { rx: /```csv\b|\bbulk[-\s]?import\b|\bimport\s+(these|this)\s+listings?\b/i,
                                                                                    label: 'Bulk-importing listings…', tool: 'bulk_import_listings' },
  // Photo upload — short "image: <url>" payload from the camera button.
  // We can't tell at chip-time whether the photo will be attached to a
  // new listing or an existing one, so stay neutral.
  { rx: /^\s*image:\s*https?:\/\//i,                                                label: 'Looking at your photo…', tool: null },
  // EXPLICIT confirmation to post — only these phrases are strong
  // enough to assume the AI is about to call post_food_listing on this
  // turn. Bare "yes" / "ok" can mean anything; we don't claim them.
  { rx: /^\s*(yes,?\s*)?post\s+it\b/i,                                              label: 'Posting listing…',    tool: 'post_food_listing' },
  { rx: /\b(go\s+ahead\s+(and\s+)?post|please\s+post|post\s+(the|that)\s+listing)\b/i,
                                                                                    label: 'Posting listing…',    tool: 'post_food_listing' },
  // Donor INTENT — kicks off a thorough intake; the AI will ask
  // freshness, pickup window, allergens, and a photo BEFORE actually
  // posting. So we show "Setting up listing…", not "Posting listing…",
  // to set the right expectation.
  { rx: /\b(post|create|put\s+up|add)\s+(a|an|new)?\s*listing\b/i,
                                                                                    label: 'Setting up listing…', tool: 'post_food_listing' },
  { rx: /\b(donate|give\s+away|share)\s+(food|some|extra|leftover|leftovers|meal|meals|bread|produce|fruit|vegetables?|pizza|soup|cans?|boxes?)\b/i,
                                                                                    label: 'Setting up listing…', tool: 'post_food_listing' },
  { rx: /\bi\s+(want|wanna|would\s+like|need)\s+to\s+(donate|give\s+away|share|post|list)\b/i,
                                                                                    label: 'Setting up listing…', tool: 'post_food_listing' },
  { rx: /\bi\s+have\s+(some\s+|extra\s+|leftover\s+|a\s+few\s+|\d+\s+)?(food|bread|meals?|leftovers|produce|fruit|vegetables?|pizza|soup|cans?|boxes?|loaves?)\b/i,
                                                                                    label: 'Setting up listing…', tool: 'post_food_listing' },
  // Posting a food request: "request food", "I need food", "looking for food".
  { rx: /\b(post|submit)\s+(a\s+)?(food\s+)?request\b/i,                            label: 'Setting up request…', tool: 'post_food_request' },
  { rx: /\bi\s+need\s+(food|something\s+to\s+eat|a\s+meal|groceries)\b/i,           label: 'Setting up request…', tool: 'post_food_request' },
  { rx: /\b(looking\s+for|searching\s+for)\s+(food|a\s+meal|groceries)\b/i,         label: 'Setting up request…', tool: 'post_food_request' },
  // Claiming: must reference "claim/reserve/take" tied to a listing/number.
  { rx: /\b(claim|reserve)\s+(listing\s+)?#?\d+\b/i,                                label: 'Claiming…',           tool: 'claim_listing' },
  { rx: /\b(claim|reserve)\s+(the|that|listing|#)/i,                                label: 'Claiming…',           tool: 'claim_listing' },
  { rx: /\bi'?ll\s+(take|claim|grab)\s+(it|that|the|listing|#?\d+|number\s+\d+)\b/i,
                                                                                    label: 'Claiming…',           tool: 'claim_listing' },
  { rx: /\bi\s+want\s+(it|that\s+one|the\s+\w+|listing\s+\d+|number\s+\d+)\b/i,     label: 'Claiming…',           tool: 'claim_listing' },
  // Searching is read-only -> neutral chip without a tool name.
  { rx: /\b(near\s+me|nearby|around\s+me|find\s+food|search\s+for|what'?s\s+available)\b/i,
                                                                                    label: 'Finding food near you…', tool: null },
  { rx: /\b(route|directions|navigate)\b/i,                                         label: 'Planning route…',     tool: null },
  { rx: /\b(recipe|cook|meal\s+idea)\b/i,                                           label: 'Looking up recipes…', tool: null },
];
function guessPending(text) {
  const t = String(text || '').trim();
  if (!t) return { label: 'Thinking…', tool: null };
  for (const entry of PENDING_LABELS) {
    if (entry.rx.test(t)) return { label: entry.label, tool: entry.tool };
  }
  return { label: 'Thinking…', tool: null };
}
function guessPendingLabel(text) {
  return guessPending(text).label;
}

// Map server-side tool names to user-facing chip text + state. The chip
// is rendered "done" when the tool succeeded and "error" if it returned
// an error payload. We deliberately only surface the action-y tools;
// pure read tools (search, dashboard, profile) don't get a chip.
const ACTION_CHIP_LABELS = {
  claim_listing:       { ok: '✓ Food claimed', err: '✗ Claim failed', verb: 'Claiming…' },
  confirm_claim:       { ok: '✓ Pickup confirmed', err: '✗ Confirmation failed', verb: 'Confirming…' },
  cancel_claim:        { ok: '✓ Claim released',  err: '✗ Release failed',  verb: 'Releasing…' },
  post_food_listing:   { ok: '✓ Listing posted',  err: '✗ Listing failed',  verb: 'Posting listing…' },
  attach_photos_to_listing: { ok: '✓ Photo added', err: '✗ Could not add photo', verb: 'Adding photo…' },
  post_food_request:   { ok: '✓ Request posted',  err: '✗ Request failed',  verb: 'Posting request…' },
  update_user_profile: { ok: '✓ Profile updated', err: '✗ Update failed',   verb: 'Updating profile…' },
  send_user_message:   { ok: '✓ Message sent',    err: '✗ Send failed',     verb: 'Sending…' },
  show_map:            { ok: '✓ Map opened',      err: '✗ Could not open map', verb: 'Opening map…' },
  navigate_ui:         { ok: '✓ UI updated',      err: '✗ Could not update UI', verb: 'Updating UI…' },
  bulk_import_listings:{ ok: '✓ Listings imported', err: '✗ Bulk import failed', verb: 'Bulk-importing listings…' },
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

// Tools whose successful execution deserves a prominent celebratory
// banner inside the assistant bubble (in addition to the small chip),
// so the user can't miss that the claim actually went through.
const SUCCESS_BANNER_TOOLS = {
  claim_listing: {
    title: 'Food claimed!',
    detail: 'Reply with the 4-digit code to confirm pickup.',
  },
  confirm_claim: {
    title: 'Pickup confirmed!',
    detail: 'You\u2019re all set \u2014 head to the pickup spot.',
  },
  post_food_listing: {
    title: 'Listing posted!',
    detail: 'Recipients can now see and claim it on the map.',
  },
  post_food_request: {
    title: 'Request posted!',
    detail: 'Donors near you will be notified.',
  },
  bulk_import_listings: {
    title: 'Listings imported!',
    detail: 'Your inventory is live on the map.',
  },
};
function SuccessBanner({ action }) {
  const cfg = SUCCESS_BANNER_TOOLS[action.tool];
  if (!cfg || !action.ok) return null;
  return (
    <div className="foodmaps-success-banner" role="status" aria-live="polite">
      <span className="foodmaps-success-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="11" fill="#10b981" />
          <path d="M7 12.5l3.2 3.2L17 9" stroke="white" strokeWidth="2.4"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="foodmaps-success-text">
        <div className="foodmaps-success-title">{cfg.title}</div>
        <div className="foodmaps-success-detail">{action.summary || cfg.detail}</div>
      </div>
    </div>
  );
}

// In-progress chip shown while the assistant is working. We guess the
// likely tool from the user's message so the user sees “⟳ Claiming…”
// (chip styling) the moment they hit send, instead of just dots.
// We prefer the explicit label passed by the caller — it carries
// flow-specific phrasing (e.g. "Setting up listing…" during the
// gather phase vs. "Posting listing…" only after a confirm). The
// tool's generic verb is used only when no label is provided.
function PendingActionChip({ tool, label }) {
  const cfg = tool ? ACTION_CHIP_LABELS[tool] : null;
  const text = label || (cfg && cfg.verb) || 'Working…';
  return (
    <span className="foodmaps-action-chip in-progress" title="AI is working on this…">
      <span className="spin" aria-hidden="true" />
      <span>{text}</span>
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
  'bulk_import_listings',
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
const UI_CONTROL_TOOLS = new Set(['show_map', 'navigate_ui']);
function maybeBroadcastUIControl(actions) {
  if (!Array.isArray(actions) || typeof window === 'undefined') return;
  const ui = actions.filter(a => a && a.ok && UI_CONTROL_TOOLS.has(a.tool));
  for (const a of ui) {
    try {
      if (a.tool === 'show_map') {
        window.dispatchEvent(new CustomEvent('foodmaps:show_map', {
          detail: { summary: a.summary || null },
        }));
      } else if (a.tool === 'navigate_ui') {
        window.dispatchEvent(new CustomEvent('foodmaps:navigate_ui', {
          detail: {
            action: a.action || null,
            target: a.target || null,
            summary: a.summary || null,
          },
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
  const [pendingTool, setPendingTool] = React.useState(null);
  const [recording, setRecording] = React.useState(false);
  const scrollRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const photoInputRef = React.useRef(null);
  const csvInputRef = React.useRef(null);

  // ----- File attach helpers ---------------------------------------
  // Photos are uploaded to /api/ai/upload_image, which returns a short
  // URL like '/uploads/ai/<uuid>.jpg'. We then send that URL to the AI
  // as 'image: <url>' — way smaller than a base64 data URL and it fits
  // in the message size limit + database TEXT column.
  async function handlePhotoFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size && file.size > 8 * 1024 * 1024) {
      alert('That photo is over 8MB — please choose a smaller image.');
      return;
    }
    const { token, userId } = getAuth();
    if (!token || !userId) {
      alert('Please sign in before uploading a photo.');
      return;
    }
    const sizeKb = Math.round((file.size || 0) / 1024);
    setMessages(m => [...m, { role: 'user', text: `📎 Uploading photo — ${file.name || 'image'} (${sizeKb} KB)…` }]);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('user_id', userId);
      const res = await fetch('/api/ai/upload_image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
      }
      const data = await res.json();
      if (!data || !data.url) throw new Error('Upload returned no URL');
      const url = data.url;
      // Pop the "Uploading…" placeholder; sendMessage will add the final bubble.
      setMessages(m => m.slice(0, -1));
      sendMessage(`image: ${url}`, { displayText: `📎 Uploaded photo — ${file.name || 'image'} (${sizeKb} KB)` });
    } catch (e) {
      console.error('Photo upload failed:', e);
      setMessages(m => m.slice(0, -1).concat([{ role: 'assistant', text: `Sorry, I couldn't upload that photo (${e.message || 'error'}). Please try again.` }]));
    }
  }

  // CSV / TXT / PDF (text) for bulk import. PDF is read as text — the
  // browser doesn't parse PDFs natively, so for now we accept .csv/.txt
  // (PDF support requires a server-side extractor; we surface a friendly
  // message if the user picks a PDF).
  function handleCsvFile(file) {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (isPdf) {
      alert('PDF bulk import is coming soon. For now, please export to CSV (title,qty,unit,category,address,description).');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => alert('Could not read that file.');
    reader.onload = () => {
      const text = String(reader.result || '').trim();
      if (!text) return;
      const rowCount = Math.max(0, text.split(/\r?\n/).filter(Boolean).length - 1);
      const payload = '```csv\n' + text + '\n```\nPlease bulk-import these listings.';
      sendMessage(payload, { displayText: `📎 Uploaded ${file.name || 'inventory.csv'} (${rowCount} row${rowCount === 1 ? '' : 's'})` });
    };
    reader.readAsText(file);
  }

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

  // navigate_ui can also target the chatbot itself (chat/voice/filters)
  // and any 'close' should minimize the assistant when the user is
  // jumping to another part of the app.
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (event) => {
      const detail = (event && event.detail) || {};
      const action = (detail.action || '').toLowerCase();
      const target = (detail.target || '').toLowerCase();
      if (action === 'close') {
        if (target === 'chat' || target === 'voice' || target === '' || target === 'map') {
          setMode('idle');
        }
        return;
      }
      if (action === 'open' || action === 'toggle') {
        if (target === 'chat') setMode(action === 'toggle' && mode === 'chat' ? 'idle' : 'chat');
        else if (target === 'voice') setMode(action === 'toggle' && mode === 'voice' ? 'idle' : 'voice');
        else if (target && target !== 'filters') {
          // Navigating elsewhere — get out of the way.
          setMode('idle');
        }
      }
    };
    window.addEventListener('foodmaps:navigate_ui', handler);
    return () => window.removeEventListener('foodmaps:navigate_ui', handler);
  }, [mode]);

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

  async function sendMessage(text, opts = {}) {
    const trimmed = (text || '').trim();
    if (!trimmed || sending) return;
    const displayText = opts.displayText || trimmed;

    if (anonymous) {
      setMessages(m => [...m, { role: 'user', text: displayText }]);
      setInput('');
      const guess = guessPending(trimmed);
      setPendingLabel(guess.label);
      setPendingTool(guess.tool);
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
    setMessages(m => [...m, { role: 'user', text: displayText }]);
    setInput('');
    const guess = guessPending(trimmed);
    setPendingLabel(guess.label);
    setPendingTool(guess.tool);
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
                  {m.actions.map((a, j) => (
                    <React.Fragment key={j}>
                      <SuccessBanner action={a} />
                      <ActionChip action={a} />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '4px 4px 8px' }}>
              <PendingActionChip tool={pendingTool} label={pendingLabel} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                <span className="foodmaps-typing-dots" aria-label="Assistant is typing">
                  <span /><span /><span />
                </span>
                <span>{pendingLabel}</span>
              </div>
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
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => { handlePhotoFile(e.target.files && e.target.files[0]); e.target.value = ''; }}
              />
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => { handleCsvFile(e.target.files && e.target.files[0]); e.target.value = ''; }}
              />
              <button
                onClick={() => photoInputRef.current && photoInputRef.current.click()}
                title="Attach a photo of the food"
                aria-label="Attach a photo"
                disabled={sending}
                style={{ padding: '8px 10px', border: 'none', borderRadius: '8px', background: '#f3f4f6', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><CameraIcon size={18} /></button>
              <button
                onClick={() => csvInputRef.current && csvInputRef.current.click()}
                title="Bulk-import listings from a CSV file"
                aria-label="Bulk import CSV"
                disabled={sending}
                style={{ padding: '8px 10px', border: 'none', borderRadius: '8px', background: '#f3f4f6', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><FileIcon size={18} /></button>
            </>
          )}
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
      // Voice path can also trigger listing-mutating tools; broadcast so
      // the rest of the app patches/refetches just like in text chat.
      maybeBroadcastListingsChanged(data.actions);
      maybeBroadcastUIControl(data.actions);
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

// Stroked camera icon for the photo-upload button.
function CameraIcon({ size = 18, color = 'currentColor' }) {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// Stroked document/file icon for the CSV bulk-import button.
function FileIcon({ size = 18, color = 'currentColor' }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
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
    .foodmaps-success-banner {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 12px; margin: 6px 0 4px;
      border-radius: 10px;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #6ee7b7;
      box-shadow: 0 1px 3px rgba(16,185,129,0.18);
      animation: foodmapsBannerPop 0.45s cubic-bezier(0.34,1.56,0.64,1);
    }
    .foodmaps-success-check {
      flex: 0 0 auto; display: inline-flex;
      animation: foodmapsCheckPop 0.6s cubic-bezier(0.34,1.56,0.64,1);
    }
    .foodmaps-success-text { line-height: 1.35; }
    .foodmaps-success-title {
      font-size: 14px; font-weight: 600; color: #065f46;
    }
    .foodmaps-success-detail {
      font-size: 12.5px; color: #047857; margin-top: 2px;
    }
    @keyframes foodmapsBannerPop {
      0%   { opacity: 0; transform: translateY(-4px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes foodmapsCheckPop {
      0%   { transform: scale(0.2); opacity: 0; }
      60%  { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); }
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
