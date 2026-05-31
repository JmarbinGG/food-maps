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
  // generic "cancel" chatter. We deliberately do NOT match the bare
  // pronouns "it" / "that" — "drop it" / "cancel that" can mean almost
  // anything in casual chat, and false-firing this chip mislabels the
  // user's intent before the AI has even responded.
  { rx: /\b(cancel|release|unclaim|drop)\b.{0,40}\b(my\s+)?(claim|listing|reservation|pickup|food|order)\b/i,
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
  // Recipient-facing AI helpers — the AI opens these as modals via
  // navigate_ui. Match common phrasings for each so the chip describes
  // exactly which helper is being opened.
  { rx: /\b(recipe|cook|meal\s+idea|what\s+can\s+i\s+(make|cook)|leftovers?)\b/i,   label: 'Pulling up meal ideas…', tool: 'navigate_ui' },
  { rx: /\b(spoil(age)?|going\s+bad|about\s+to\s+expire|expiring\s+soon|food\s+waste)\b/i,
                                                                                    label: 'Checking spoilage risk…', tool: 'navigate_ui' },
  { rx: /\b(how\s+do\s+i\s+store|storage|fridge\s+vs|how\s+long\s+(does|will)\s+\w+\s+(last|keep)|keep\s+(food\s+)?fresh)\b/i,
                                                                                    label: 'Opening storage coach…', tool: 'navigate_ui' },
  { rx: /\b(smart\s+notifications?|tune\s+(my\s+)?(alerts|notifications)|notification\s+preferences?|too\s+many\s+notifications)\b/i,
                                                                                    label: 'Opening notification settings…', tool: 'navigate_ui' },
  { rx: /\b(pickup\s+reminders?|remind\s+me\s+(about|of)\s+(my\s+)?pickup|don'?t\s+let\s+me\s+forget)\b/i,
                                                                                    label: 'Opening pickup reminders…', tool: 'navigate_ui' },
  { rx: /\b(enable\s+sms|text\s+me|sms\s+(opt[\s-]?in|consent|notifications?)|turn\s+on\s+text)\b/i,
                                                                                    label: 'Opening SMS settings…', tool: 'navigate_ui' },
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
  show_route_to_listing: { ok: '✓ Route on map',  err: '✗ Could not draw route', verb: 'Drawing route…' },
  navigate_ui:         { ok: '✓ UI updated',      err: '✗ Could not update UI', verb: 'Updating UI…' },
  bulk_import_listings:{ ok: '✓ Listings imported', err: '✗ Bulk import failed', verb: 'Bulk-importing listings…' },
};
function ActionChip({ action }) {
  const cfg = ACTION_CHIP_LABELS[action.tool];
  if (!cfg) return null; // skip non-action tools
  // A tool can succeed at the DB layer (action.ok === true) but still
  // fail post-write verification — e.g. a listing posted without coords
  // is in the database but won't show on the map. Surface this as a
  // distinct "warn" state so the user doesn't get a green ✓ for a
  // listing that's effectively invisible. The AI's text answer should
  // also explain it; the chip just makes sure it's never missed.
  const issues = Array.isArray(action.verify_issues) ? action.verify_issues : [];
  const verifyFailed = action.ok && action.verified === false && issues.length > 0;
  const isDuplicate = action.ok && action.duplicate_of_recent === true;
  let cls;
  if (!action.ok) cls = 'foodmaps-action-chip error';
  else if (verifyFailed) cls = 'foodmaps-action-chip warn';
  else cls = 'foodmaps-action-chip done';
  // For navigate_ui the server already produced a user-friendly summary
  // ('Opened AI meal suggestions.') — surface it directly so the chip
  // tells the user exactly which surface was opened, not the generic
  // 'UI updated' fallback.
  let label;
  if (action.ok && action.tool === 'navigate_ui' && action.summary) {
    label = `✓ ${action.summary.replace(/\.$/, '')}`;
  } else if (verifyFailed) {
    label = `⚠ ${cfg.ok.replace(/^✓\s*/, '')} (verify failed)`;
  } else if (isDuplicate) {
    label = `↺ ${cfg.ok.replace(/^✓\s*/, '')} (duplicate)`;
  } else {
    label = action.ok ? cfg.ok : cfg.err;
  }
  // Tooltip: prefer detailed verify_issues, then summary.
  const titleText = verifyFailed
    ? `Post-check found: ${issues.join('; ')}`
    : (action.summary || '');
  return (
    <span className={cls} title={titleText}>
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
const UI_CONTROL_TOOLS = new Set(['show_map', 'navigate_ui', 'show_route_to_listing']);
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
      } else if (a.tool === 'show_route_to_listing' && a.route) {
        // First flip to the map view so the listener has something to
        // draw on, then dispatch the route payload. We also stash the
        // route on window so a freshly-mounted Map component (which
        // missed the event during the view switch) can pick it up.
        try { window.__foodmapsPendingRoute = { route: a.route, summary: a.summary || null, at: Date.now() }; } catch (_) {}
        window.dispatchEvent(new CustomEvent('foodmaps:show_map', {
          detail: { summary: a.summary || null },
        }));
        // Defer the route event so React has a chance to mount the
        // Map component if we just switched views — otherwise the
        // event fires synchronously into an unmounted listener and
        // the route never appears.
        const payload = { route: a.route, summary: a.summary || null };
        setTimeout(() => {
          try {
            window.dispatchEvent(new CustomEvent('foodmaps:show_route', { detail: payload }));
          } catch (_) { /* ignore */ }
        }, 250);
      }
    } catch (_) { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// Starter suggestions
// ---------------------------------------------------------------------------
// Shown as clickable chips under the very first assistant greeting so a
// new user has obvious things to try instead of staring at an empty
// chat. The set is tailored to the user's role (donor / recipient /
// driver / admin) and the active UI language. Clicking a chip sends it
// as a normal user message — the same as typing.
//
// Keep these PHRASED EXACTLY as a user would type them, because the
// chip text is what gets sent to the AI.

const STARTER_SUGGESTIONS = {
  en: {
    anonymous: [
      "How does FoodMaps work?",
      "Is sharing food safe?",
      "How do I sign up?",
      "What can I share?",
    ],
    recipient: [
      "What food is available near me?",
      "Show me the map",
      "Any expiring food I should grab?",
      "Set a pickup reminder",
    ],
    donor: [
      "Post a new listing",
      "What's expiring soon?",
      "Show my dashboard",
      "How do pickups work?",
    ],
    driver: [
      "Show my route plan",
      "What's in the dispatch queue?",
      "Next pickup details",
    ],
    admin: [
      "Show platform stats",
      "Open admin panel",
      "Recent feedback",
    ],
    default: [
      "What food is available near me?",
      "Show me the map",
      "Post a new listing",
      "Storage tips for vegetables",
    ],
  },
  es: {
    anonymous: [
      "¿Cómo funciona FoodMaps?",
      "¿Es seguro compartir comida?",
      "¿Cómo me registro?",
      "¿Qué puedo compartir?",
    ],
    recipient: [
      "¿Qué comida hay cerca?",
      "Muéstrame el mapa",
      "¿Hay comida por vencer?",
      "Pon un recordatorio de recogida",
    ],
    donor: [
      "Publicar una donación",
      "¿Qué se vence pronto?",
      "Abre mi panel",
      "¿Cómo funcionan las recogidas?",
    ],
    driver: [
      "Muéstrame mi ruta",
      "¿Qué hay en la cola de despacho?",
      "Detalles de la próxima recogida",
    ],
    admin: [
      "Estadísticas de la plataforma",
      "Abre el panel admin",
      "Comentarios recientes",
    ],
    default: [
      "¿Qué comida hay cerca?",
      "Muéstrame el mapa",
      "Publicar una donación",
      "Consejos para guardar verduras",
    ],
  },
};

function getStarterSuggestions(anonymous) {
  let lang = 'en';
  try {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
      lang = window.i18n.getCurrentLanguage() || 'en';
    }
  } catch (_) { /* ignore */ }
  const bank = STARTER_SUGGESTIONS[lang] || STARTER_SUGGESTIONS.en;
  if (anonymous) return bank.anonymous.slice();

  let role = '';
  try {
    if (typeof localStorage !== 'undefined') {
      const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
      role = (cu && cu.role ? String(cu.role) : '').toLowerCase();
    }
  } catch (_) { /* ignore */ }
  if (role && bank[role]) return bank[role].slice();
  return bank.default.slice();
}

function buildGreetingMessage(anonymous) {
  let lang = 'en';
  try {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
      lang = window.i18n.getCurrentLanguage() || 'en';
    }
  } catch (_) { /* ignore */ }
  const greetings = {
    en: {
      anon: "Hi! I'm the FoodMaps assistant. Ask me anything about how food sharing works, food safety, or how to sign up.",
      auth: "Hi! I'm your FoodMaps assistant. Ask me about listings, pickups, reminders, or recipes.",
    },
    es: {
      anon: "¡Hola! Soy el asistente de FoodMaps. Pregúntame sobre cómo funciona compartir comida, seguridad alimentaria o cómo registrarte.",
      auth: "¡Hola! Soy tu asistente de FoodMaps. Pregúntame sobre publicaciones, recogidas, recordatorios o recetas.",
    },
  };
  const greet = greetings[lang] || greetings.en;
  return {
    role: 'assistant',
    text: anonymous ? greet.anon : greet.auth,
    suggestions: getStarterSuggestions(anonymous),
  };
}

// --- Inline ghost-text autocomplete -------------------------------
// Gmail Smart Compose-style: as the user types in the chat input, the
// longest matching common phrase from a role+language-keyed dictionary
// is shown grayed out after the cursor. Tab or ArrowRight (when caret
// is at end of input) accepts it; Esc dismisses just that suggestion;
// Enter still sends what's actually typed (NOT the ghost).
//
// We deliberately keep the dictionary small and 100% local — no extra
// API call, no model latency. The pool is built from:
//   1. The same STARTER_SUGGESTIONS bucket the user is in (so role
//      coverage + i18n come for free).
//   2. A small set of EXTRA_AUTOCOMPLETE patterns that are common
//      mid-typing prefixes ("Claim listing #", "Update my address to",
//      "Find food near", confirmation codes) which don't make sense as
//      a starter chip but are useful as completions.
//   3. The user's own last 30 sent messages (foodmaps_chat_history in
//      localStorage), so frequently-repeated questions auto-suggest
//      themselves on the next visit.
const EXTRA_AUTOCOMPLETE = {
  en: [
    "Claim listing #",
    "Cancel my claim for ",
    "Confirm pickup code ",
    "Update my address to ",
    "Update my phone to ",
    "Find food near ",
    "What can I do with ",
    "Storage tips for ",
    "Recipe ideas for ",
    "How long does ",
    "Is it safe to eat ",
    "Set a pickup reminder for ",
    "Show me listings expiring today",
    "Show me listings expiring this week",
    "Open my dashboard",
    "Open the admin panel",
  ],
  es: [
    "Reclamar publicación #",
    "Cancelar mi reclamo de ",
    "Confirmar código de recogida ",
    "Actualizar mi dirección a ",
    "Actualizar mi teléfono a ",
    "Buscar comida cerca de ",
    "¿Qué puedo hacer con ",
    "Consejos para guardar ",
    "Ideas de recetas para ",
    "¿Cuánto dura ",
    "¿Es seguro comer ",
    "Pon un recordatorio de recogida para ",
    "Muéstrame publicaciones que vencen hoy",
    "Muéstrame publicaciones que vencen esta semana",
    "Abrir mi panel",
    "Abrir el panel admin",
  ],
};

const CHAT_HISTORY_KEY = 'foodmaps_chat_history';
const CHAT_HISTORY_MAX = 30;

function _currentLang() {
  try {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
      return window.i18n.getCurrentLanguage() || 'en';
    }
  } catch (_) { /* ignore */ }
  return 'en';
}

function _currentRole() {
  try {
    if (typeof localStorage !== 'undefined') {
      const cu = JSON.parse(localStorage.getItem('current_user') || 'null');
      return (cu && cu.role ? String(cu.role) : '').toLowerCase();
    }
  } catch (_) { /* ignore */ }
  return '';
}

function _loadChatHistory() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string' && s.trim()) : [];
  } catch (_) { return []; }
}

function pushChatHistory(text) {
  try {
    if (typeof localStorage === 'undefined') return;
    const trimmed = (text || '').trim();
    if (!trimmed || trimmed.length > 200) return;
    const prev = _loadChatHistory();
    // De-dupe (case-insensitive) + put newest at the front + cap size.
    const lower = trimmed.toLowerCase();
    const filtered = prev.filter((s) => s.toLowerCase() !== lower);
    filtered.unshift(trimmed);
    localStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(filtered.slice(0, CHAT_HISTORY_MAX)),
    );
  } catch (_) { /* ignore */ }
}

// Build the full autocomplete pool for the current (lang, role, mode).
function getAutocompletePool(anonymous) {
  const lang = _currentLang();
  const bank = STARTER_SUGGESTIONS[lang] || STARTER_SUGGESTIONS.en;
  const extras = EXTRA_AUTOCOMPLETE[lang] || EXTRA_AUTOCOMPLETE.en;

  let starters = [];
  if (anonymous) {
    starters = bank.anonymous || [];
  } else {
    const role = _currentRole();
    starters = (role && bank[role]) ? bank[role] : (bank.default || []);
  }

  // For non-anonymous users, only include extras that make sense.
  // Anonymous users on the landing page can't claim/update profile, so
  // we skip those entries.
  const pool = anonymous
    ? starters.slice()
    : starters.concat(extras);

  // History last (highest priority for matching). De-dupe case-insensitively.
  const history = anonymous ? [] : _loadChatHistory();
  const seen = new Set();
  const out = [];
  for (const list of [history, pool]) {
    for (const phrase of list) {
      const k = phrase.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(phrase);
    }
  }
  return out;
}

// Find the shortest phrase that case-insensitively starts with `input`
// and is strictly longer. Shortest = least intrusive completion.
function findAutocompleteSuggestion(input, anonymous, dismissed) {
  if (!input) return '';
  // Require at least 2 visible characters before suggesting anything,
  // and bail out if the user has just typed whitespace (no ghost on
  // ' '). We intentionally match against the FULL input (incl. any
  // leading whitespace) instead of the stripped form, because the
  // overlay renders the ghost as `phrase.slice(input.length)`. If we
  // matched on a stripped needle, leading-whitespace input would
  // produce a misaligned ghost (e.g. '  hi' + slice('Hi there',4) =
  // '  hi'+'here' = '  hihere'). Phrases never start with whitespace,
  // so leading-whitespace input simply yields no suggestion \u2014 the
  // desired behavior.
  const visible = input.replace(/^\s+/, '');
  if (visible.length < 2) return '';
  const needle = input.toLowerCase();
  let best = '';
  for (const phrase of getAutocompletePool(anonymous)) {
    if (phrase.length <= input.length) continue;
    if (!phrase.toLowerCase().startsWith(needle)) continue;
    if (dismissed && dismissed.has(phrase.toLowerCase())) continue;
    if (!best || phrase.length < best.length) best = phrase;
  }
  return best;
}

function AIChatbot() {
  // Anonymous mode (e.g. landing page) — no auth, uses /api/ai/public_chat,
  // no voice assistant, no mic in chat.
  const anonymous = typeof window !== 'undefined' && window.FOODMAPS_AI_ANONYMOUS === true;

  // mode: 'idle' (just bot) | 'chooser' (two round options) | 'chat' | 'voice'
  const [mode, setMode] = React.useState('idle');
  const open = mode === 'chat';
  const [messages, setMessages] = React.useState(() => [
    buildGreetingMessage(anonymous),
  ]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  // Inline ghost-text autocomplete state. `dismissedSuggestions` holds
  // case-folded phrases the user has explicitly Esc'd this session so
  // we don't keep re-proposing the same completion every keystroke.
  const dismissedSuggestionsRef = React.useRef(new Set());
  // Bumped whenever the dismissed set mutates, so the useMemo below
  // re-runs even though the Set reference is the same. (Without this,
  // pressing Esc would only hide the ghost on the NEXT keystroke,
  // because React bails on setState updates that return the same
  // reference.)
  const [dismissTick, setDismissTick] = React.useState(0);
  // Horizontal scroll offset of the chat input. We mirror it onto the
  // ghost-overlay's translateX so that, when the user types more text
  // than fits in the visible width and the <input> scrolls, the ghost
  // suggestion stays glued to the actual caret position instead of
  // floating at the left edge.
  const [inputScrollLeft, setInputScrollLeft] = React.useState(0);
  const autocompleteSuggestion = React.useMemo(
    () => findAutocompleteSuggestion(input, anonymous, dismissedSuggestionsRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, anonymous, dismissTick],
  );
  // Clear the dismissed-set whenever the input becomes empty (a new
  // message starts fresh — old dismissals shouldn't haunt the next
  // sentence).
  React.useEffect(() => {
    if (!input && dismissedSuggestionsRef.current.size) {
      dismissedSuggestionsRef.current = new Set();
      setDismissTick((t) => t + 1);
    }
  }, [input]);
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
  const inputRef = React.useRef(null);

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

  // Keep the chat input focused when the panel is open. Without this,
  // the browser drops the text caret whenever the input is hidden via
  // `display: none`, briefly disabled while a reply is pending, or the
  // surrounding tree re-renders for streaming/typing indicators — so
  // the cursor appears to "keep disappearing" while the user is mid-
  // sentence. We only auto-focus when the chat panel is open and the
  // user is not actively interacting with another field (e.g. a file
  // picker), to avoid hijacking focus.
  React.useEffect(() => {
    if (!open) return;
    const el = inputRef.current;
    if (!el) return;
    const ae = (typeof document !== 'undefined') ? document.activeElement : null;
    const isOtherFormControl = ae && ae !== el && (
      ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT'
    );
    if (isOtherFormControl) return;
    // Defer to the next tick so any pending re-render settles first.
    const id = window.setTimeout(() => {
      try {
        if (inputRef.current && !inputRef.current.disabled) {
          inputRef.current.focus({ preventScroll: true });
        }
      } catch (_) { /* ignore */ }
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, sending, messages.length]);

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

  // External components (DetailedModal "Get directions" button, listing
  // cards, etc.) can ask the assistant a question programmatically by
  // dispatching a `foodmaps:ai_ask` CustomEvent. We open the chat panel
  // and forward the text to sendMessage on the next tick (so the panel
  // is mounted/visible by the time the user message lands).
  //
  //   window.dispatchEvent(new CustomEvent('foodmaps:ai_ask', {
  //     detail: { text: 'directions to listing #42',
  //               displayText: '🧭 Get directions to Fresh Tomatoes' }
  //   }));
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (event) => {
      const detail = (event && event.detail) || {};
      const text = (detail.text || '').trim();
      if (!text) return;
      setMode('chat');
      // Defer so React commits the mode change (panel becomes visible)
      // before we kick off the fetch. Without this, the user message
      // can flash in before the panel animates open.
      setTimeout(() => {
        sendMessage(text, detail.displayText ? { displayText: detail.displayText } : {});
      }, 50);
    };
    window.addEventListener('foodmaps:ai_ask', handler);
    return () => window.removeEventListener('foodmaps:ai_ask', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function sendMessage(text, opts = {}) {
    const trimmed = (text || '').trim();
    if (!trimmed || sending) return;
    const displayText = opts.displayText || trimmed;

    if (anonymous) {
      setMessages(m => [...m, { role: 'user', text: displayText }]);
      setInput('');
      // Record real typed messages (not file uploads) for autocomplete.
      if (!opts.displayText) pushChatHistory(trimmed);
      const guess = guessPending(trimmed);
      setPendingLabel(guess.label);
      setPendingTool(guess.tool);
      setSending(true);
      try {
        const res = await fetch('/api/ai/public_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, lang: (window.i18n && window.i18n.getCurrentLanguage()) || 'en' }),
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
    // Record real typed messages (not file uploads) for autocomplete.
    if (!opts.displayText) pushChatHistory(trimmed);
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
        body: JSON.stringify({ user_id: userId, message: trimmed, include_audio: false, lang: (window.i18n && window.i18n.getCurrentLanguage()) || 'en' }),
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
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
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
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
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
          {messages.map((m, i) => {
            const isLastAssistant = m.role === 'assistant' && i === messages.length - 1;
            const showSuggestions = isLastAssistant && !sending
              && Array.isArray(m.suggestions) && m.suggestions.length > 0;
            return (
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
              {showSuggestions && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '6px',
                  maxWidth: '90%',
                }}>
                  {m.suggestions.map((s, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => { if (!sending) sendMessage(s); }}
                      disabled={sending}
                      style={{
                        background: 'white',
                        color: '#059669',
                        border: '1.5px solid #10b981',
                        borderRadius: '999px',
                        padding: '7px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: sending ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(16,185,129,0.15)',
                        transition: 'background 0.15s, color 0.15s, transform 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (sending) return;
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#10b981';
                      }}
                    >{s}</button>
                  ))}
                </div>
              )}
            </div>
            );
          })}
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
        <div style={{ padding: '10px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '6px', background: 'white', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', background: sending ? '#f9fafb' : 'white', borderRadius: '8px' }}>
            {/* Ghost-text overlay — sits behind the input, exact same
                font/padding/border so the user's typed text occupies
                the same horizontal space (rendered transparent) and
                only the ghost suffix is visible in gray. */}
            {autocompleteSuggestion && !sending && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  padding: '8px 12px',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: 'normal',
                  whiteSpace: 'pre',
                  overflow: 'hidden',
                  textOverflow: 'clip',
                  color: '#9ca3af',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ display: 'inline-block', transform: `translateX(${-inputScrollLeft}px)` }}>
                  <span style={{ color: 'transparent' }}>{input}</span>
                  <span>{autocompleteSuggestion.slice(input.length)}</span>
                </span>
              </div>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onScroll={(e) => setInputScrollLeft(e.target.scrollLeft)}
              onKeyDown={(e) => {
                // While the user is mid-composition with an IME (CJK,
                // dead-key accents, etc.), e.isComposing is true and
                // the keystroke is part of building the next character.
                // Hijacking Tab / ArrowRight / Escape during that
                // window would break Chinese / Japanese / accented
                // input completely, so we let those keys pass through.
                if (e.nativeEvent && e.nativeEvent.isComposing) return;
                // Accept the ghost suggestion with Tab (always) or
                // ArrowRight when the caret is already at the end of
                // the typed text. We never hijack ArrowRight in the
                // middle of the line — that would break normal cursor
                // navigation.
                if (autocompleteSuggestion && !sending) {
                  // Compare against e.target.value rather than the
                  // React state — the DOM is the source of truth at the
                  // exact moment of the keypress.
                  const liveLen = e.target.value.length;
                  const atEnd = e.target.selectionStart === liveLen
                    && e.target.selectionEnd === liveLen;
                  if (e.key === 'Tab' || (e.key === 'ArrowRight' && atEnd)) {
                    e.preventDefault();
                    setInput(autocompleteSuggestion);
                    return;
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    dismissedSuggestionsRef.current.add(autocompleteSuggestion.toLowerCase());
                    // Bump the tick so the memo re-runs immediately;
                    // setInput((v)=>v) would no-op since React bails
                    // on identical state.
                    setDismissTick((t) => t + 1);
                    return;
                  }
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending) sendMessage(input);
                }
              }}
              placeholder={sending ? 'Waiting for reply…' : 'Type a message…'}
              readOnly={sending}
              aria-busy={sending}
              aria-autocomplete="inline"
              autoComplete="off"
              autoFocus
              style={{
                width: '100%',
                // Without min-width:0 the input refuses to shrink below
                // its placeholder width, pushing the Send button off the
                // right edge on narrow viewports (mobile, 360px panel).
                minWidth: 0,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: 'normal',
                fontFamily: 'inherit',
                outline: 'none',
                caretColor: '#10b981',
                opacity: sending ? 0.7 : 1,
                background: sending ? '#f9fafb' : 'transparent',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
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
                style={{ flexShrink: 0, padding: '8px 10px', border: 'none', borderRadius: '8px', background: '#f3f4f6', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><CameraIcon size={18} /></button>
              <button
                onClick={() => csvInputRef.current && csvInputRef.current.click()}
                title="Bulk-import listings from a CSV file"
                aria-label="Bulk import CSV"
                disabled={sending}
                style={{ flexShrink: 0, padding: '8px 10px', border: 'none', borderRadius: '8px', background: '#f3f4f6', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
              style={{ flexShrink: 0, padding: '8px 12px', border: 'none', borderRadius: '8px', background: recording ? '#ef4444' : '#f3f4f6', color: recording ? 'white' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ><MicIcon size={18} /></button>
          )}
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            style={{ flexShrink: 0, padding: '8px 14px', border: 'none', borderRadius: '8px', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '14px', opacity: (sending || !input.trim()) ? 0.6 : 1 }}
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
// Auto-starts listening on open and shows a live partial transcript on the
// orb as the user speaks (Web Speech API), so the user knows the AI is
// really listening. Falls back to MediaRecorder + Whisper when the browser
// has no SpeechRecognition (e.g., Firefox).
function VoiceAssistant({ onClose, getAuth }) {
  // status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [status, setStatus] = React.useState('idle');
  const [userText, setUserText] = React.useState('');     // committed transcript
  const [interimText, setInterimText] = React.useState(''); // live partial
  const [aiText, setAiText] = React.useState('Listening… start talking.');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Web Speech API
  const recognitionRef = React.useRef(null);
  const finalTranscriptRef = React.useRef('');
  const wantListeningRef = React.useRef(false);
  const restartTimerRef = React.useRef(null);
  const submittingRef = React.useRef(false);

  // MediaRecorder fallback
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const streamRef = React.useRef(null);

  // TTS playback
  const audioRef = React.useRef(null);

  // Barge-in state: keep status accessible inside SR callbacks (which
  // capture stale closures), remember the AI's last reply so we can tell
  // it which part the user actually heard before interrupting, and track
  // how much of that reply had played so the AI can respond consciously.
  const statusRef = React.useRef('idle');
  const lastAiReplyRef = React.useRef('');
  const replyStartedAtRef = React.useRef(0);
  const replyDurationRef = React.useRef(0);
  const interruptedRef = React.useRef(false);
  // Resolver for the in-flight playReply() so barge-in can unblock the
  // awaiting submitTranscript() and release submittingRef.
  const pendingPlayResolveRef = React.useRef(null);
  // Debounced silence-based submit: continuous mode pushes utterances
  // to the AI ~END_OF_UTTERANCE_MS after the last final result, so the
  // user doesn't have to wait for the browser to fully end the session.
  const utteranceTimerRef = React.useRef(null);
  const END_OF_UTTERANCE_MS = 900;

  function setStatusBoth(s) {
    statusRef.current = s;
    setStatus(s);
  }

  const SR = (typeof window !== 'undefined') &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const useNativeSR = !!SR;

  function pickLang() {
    try {
      const docLang = (document.documentElement.lang || '').toLowerCase();
      if (docLang.startsWith('es')) return 'es-ES';
      const nav = (navigator.language || 'en-US').toLowerCase();
      if (nav.startsWith('es')) return 'es-ES';
    } catch (e) { }
    return 'en-US';
  }

  function preflightMic() {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return 'Voice needs a secure (HTTPS) connection. Please open this site on https:// to use the voice assistant.';
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'Your browser does not support microphone capture.';
    }
    return null;
  }

  function explainMicErrorName(name) {
    if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'not-allowed') {
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

  // ---- Web Speech API path (live partial transcripts) ----------------

  function startNativeRecognition() {
    const blocker = preflightMic();
    if (blocker) {
      setStatusBoth('error');
      setErrorMsg(blocker);
      return;
    }
    setErrorMsg('');
    finalTranscriptRef.current = '';
    setUserText('');
    setInterimText('');
    setAiText('Listening… start talking.');

    let rec;
    try {
      rec = new SR();
    } catch (e) {
      // Some Safari builds throw on construction; fall back.
      console.warn('SpeechRecognition unavailable, falling back', e);
      setStatusBoth('error');
      startMediaRecorder();
      return;
    }
    rec.lang = pickLang();
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      // Only flip the UI to "listening" when we're not currently mid-AI
      // reply. While speaking/thinking, we keep recognition running in
      // the background for barge-in but don't visually steal the state.
      if (statusRef.current !== 'speaking' && statusRef.current !== 'thinking') {
        setStatusBoth('listening');
      }
    };
    rec.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const text = r[0] && r[0].transcript ? r[0].transcript : '';
        if (r.isFinal) finalChunk += text;
        else interim += text;
      }
      const interimTrim = interim.trim();
      const finalTrim = finalChunk.trim();

      // Barge-in: if the user starts speaking while the AI is thinking
      // or speaking, immediately interrupt the audio and switch to
      // listening. Require a few characters of interim speech (or any
      // final result) to filter out coughs / echo blips.
      const meaningful = finalTrim.length >= 1 || interimTrim.length >= 3;
      if (meaningful &&
          (statusRef.current === 'speaking' || statusRef.current === 'thinking')) {
        interruptAi();
      }

      if (finalChunk) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalChunk).trim();
        setUserText(finalTranscriptRef.current);
      }
      setInterimText(interim);

      // Continuous mode: any new speech (interim or final) cancels a
      // pending submit so we don't cut the user off mid-thought. Then,
      // if we have a final chunk, schedule a submit after a short
      // silence window — that's our end-of-utterance trigger.
      if (utteranceTimerRef.current) {
        clearTimeout(utteranceTimerRef.current);
        utteranceTimerRef.current = null;
      }
      if (finalChunk) {
        utteranceTimerRef.current = setTimeout(() => {
          utteranceTimerRef.current = null;
          if (!wantListeningRef.current) return;
          if (submittingRef.current) return;
          const text = finalTranscriptRef.current.trim();
          if (!text) return;
          // Only submit when the user has the floor (status is listening).
          // If they happened to barge-in mid-AI, interruptAi() already
          // flipped status to 'listening' so this still fires.
          if (statusRef.current !== 'listening') return;
          finalTranscriptRef.current = '';
          submitTranscript(text);
        }, END_OF_UTTERANCE_MS);
      }
    };
    rec.onerror = (e) => {
      const err = e && e.error;
      console.warn('SR error:', err);
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        wantListeningRef.current = false;
        setStatusBoth('error');
        setErrorMsg(explainMicErrorName(err));
        return;
      }
      if (err === 'no-speech' || err === 'aborted' || err === 'audio-capture') {
        // Let onend handle restart / submission.
        return;
      }
    };
    rec.onend = () => {
      // Keep the recognizer alive across utterances so the user can
      // barge in while the AI is speaking. Submission is handled by the
      // end-of-utterance timer in onresult, not here — onend only fires
      // when the engine fully stops, which can lag well behind the
      // user's natural pause.
      if (!wantListeningRef.current) return;
      // If we somehow have a queued transcript and no pending timer
      // (rare), submit it as a safety net.
      const text = finalTranscriptRef.current.trim();
      const canSubmit = text && !submittingRef.current && !utteranceTimerRef.current &&
        (statusRef.current === 'listening' || statusRef.current === 'idle');
      if (canSubmit) {
        finalTranscriptRef.current = '';
        submitTranscript(text);
      }
      // Always restart — silent gaps and AI playback shouldn't kill the mic.
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (!wantListeningRef.current) return;
        try { rec.start(); } catch (e) { /* already running */ }
      }, 250);
    };

    recognitionRef.current = rec;
    wantListeningRef.current = true;
    try {
      rec.start();
    } catch (e) {
      // Already started or transient — try again shortly
      setTimeout(() => { try { rec.start(); } catch (_) { } }, 250);
    }
  }

  function stopNativeRecognition({ submit = true } = {}) {
    wantListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (utteranceTimerRef.current) {
      clearTimeout(utteranceTimerRef.current);
      utteranceTimerRef.current = null;
    }
    const rec = recognitionRef.current;
    const text = finalTranscriptRef.current.trim();
    if (rec) {
      try { rec.stop(); } catch (e) { }
    }
    if (submit && text) {
      submitTranscript(text);
    } else if (!submit) {
      setStatusBoth('idle');
    }
  }

  // ---- Barge-in: user starts speaking while AI is replying ----------

  function interruptAi() {
    // Stop the playing TTS audio (if any) and remember how much of the
    // reply the user actually heard, so the AI can answer consciously.
    let heardMs = 0;
    if (audioRef.current) {
      try {
        const a = audioRef.current;
        const startedAt = replyStartedAtRef.current || 0;
        if (startedAt) heardMs = Math.max(0, Date.now() - startedAt);
        a.onended = null;
        a.onerror = null;
        a.pause();
      } catch (e) { /* ignore */ }
      audioRef.current = null;
    }
    replyDurationRef.current = heardMs;
    interruptedRef.current = true;
    // Unblock the awaiting playReply() promise so submitTranscript()
    // can release submittingRef and accept the next utterance.
    if (pendingPlayResolveRef.current) {
      const r = pendingPlayResolveRef.current;
      pendingPlayResolveRef.current = null;
      try { r(); } catch (e) { /* ignore */ }
    }
    // Flip the UI back to listening so the live transcript is visible.
    if (statusRef.current !== 'listening') {
      setStatusBoth('listening');
    }
    setAiText('Listening…');
    // Make sure recognition is actually running. Chrome's SR can be in
    // an "ended" state right now (after a long silence during playback)
    // and would otherwise stay deaf until the next onend tick.
    kickRecognizer();
  }

  function kickRecognizer() {
    if (!useNativeSR) return;
    if (!wantListeningRef.current) return;
    const rec = recognitionRef.current;
    if (!rec) return;
    try { rec.start(); } catch (e) { /* already running — fine */ }
  }

  // ---- Send transcript through /api/ai/chat -------------------------

  async function submitTranscript(text) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatusBoth('thinking');
    setInterimText('');
    setAiText('Thinking…');

    // If the user spoke while the AI was talking, give the AI conscious
    // context: which part of its previous reply the user actually heard
    // before being cut off, so its next answer references that gracefully
    // ("Sorry, let me address that — you asked about…") instead of
    // continuing as if nothing happened.
    let messageToSend = text;
    if (interruptedRef.current && lastAiReplyRef.current) {
      const heardSec = (replyDurationRef.current || 0) / 1000;
      const heardLabel = heardSec > 0 ? `~${heardSec.toFixed(1)}s of` : 'the start of';
      messageToSend =
        `[Voice context: the user interrupted you mid-reply. They heard ${heardLabel} ` +
        `your previous message: "${lastAiReplyRef.current.slice(0, 400)}". ` +
        `Acknowledge the interruption briefly if it changes the topic, then respond to ` +
        `their new request.] User now says: ${text}`;
    }
    interruptedRef.current = false;
    replyDurationRef.current = 0;

    // Clear the prior turn's committed transcript from the orb display
    // (the live one is already cleared); the next utterance will populate
    // fresh text as the user speaks.
    setUserText('');

    const { token, userId } = getAuth();
    if (!token || !userId) {
      submittingRef.current = false;
      setStatusBoth('error');
      setErrorMsg('Please sign in to use the voice assistant.');
      return;
    }
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: String(userId),
          message: messageToSend,
          include_audio: true,
          lang: (window.i18n && window.i18n.getCurrentLanguage()) || 'en',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const replyText = data.text || '(no response)';
      setAiText(replyText);
      lastAiReplyRef.current = replyText;
      maybeBroadcastListingsChanged(data.actions);
      maybeBroadcastUIControl(data.actions);
      await playReply(data.audio_url);
    } catch (e) {
      console.error('voice chat error:', e);
      setStatusBoth('error');
      setErrorMsg('Could not reach the assistant. Try again.');
    } finally {
      submittingRef.current = false;
      // After the turn ends (success, error, or barge-in), make sure
      // the recognizer is actively listening for the next utterance.
      kickRecognizer();
    }
  }

  function playReply(audioUrl) {
    return new Promise((resolve) => {
      // Wrap resolve so interruptAi() and the audio callbacks cooperate
      // — whichever fires first wins and the other becomes a no-op.
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        if (pendingPlayResolveRef.current === settle) {
          pendingPlayResolveRef.current = null;
        }
        resolve();
      };
      pendingPlayResolveRef.current = settle;

      if (!audioUrl) {
        // No TTS available — go straight back to listening.
        setStatusBoth('listening');
        kickRecognizer();
        if (!useNativeSR) autoResume();
        settle();
        return;
      }
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        replyStartedAtRef.current = Date.now();
        replyDurationRef.current = 0;
        const done = () => {
          // Audio either ended naturally or was interrupted by barge-in.
          // If barge-in already flipped status to 'listening', leave it.
          if (audioRef.current === audio) audioRef.current = null;
          if (statusRef.current === 'speaking') {
            setStatusBoth('listening');
          }
          // Always make sure the mic is actively listening for the next
          // turn. Chrome's SR may have ended during playback.
          kickRecognizer();
          if (!useNativeSR) autoResume();
          settle();
        };
        audio.onended = done;
        audio.onerror = done;
        setStatusBoth('speaking');
        audio.play().catch(() => done());
      } catch (e) {
        setStatusBoth('listening');
        kickRecognizer();
        if (!useNativeSR) autoResume();
        settle();
      }
    });
  }

  function autoResume() {
    // Only used by the MediaRecorder fallback. Native SR stays live.
    setTimeout(() => {
      if (useNativeSR) return;
      startMediaRecorder();
    }, 400);
  }

  // ---- MediaRecorder fallback (Firefox etc.) ------------------------

  async function startMediaRecorder() {
    const blocker = preflightMic();
    if (blocker) {
      setStatusBoth('error');
      setErrorMsg(blocker);
      return;
    }
    if (typeof window.MediaRecorder === 'undefined') {
      setStatusBoth('error');
      setErrorMsg('Your browser does not support audio recording.');
      return;
    }
    setErrorMsg('');
    setUserText('');
    setInterimText('');
    setAiText('Listening… tap the orb when you finish.');
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
      setStatusBoth('listening');
    } catch (e) {
      console.error('mic error:', e);
      setStatusBoth('error');
      setErrorMsg(explainMicErrorName(e && e.name));
    }
  }

  function stopMediaRecorder() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setStatusBoth('thinking');
    setAiText('Thinking…');
  }

  async function sendVoiceBlob(blob) {
    const { token, userId } = getAuth();
    if (!token || !userId) {
      setStatusBoth('error');
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
      const replyText = data.text || '(no response)';
      setAiText(replyText);
      lastAiReplyRef.current = replyText;
      maybeBroadcastListingsChanged(data.actions);
      maybeBroadcastUIControl(data.actions);
      await playReply(data.audio_url);
    } catch (e) {
      console.error('voice error:', e);
      setStatusBoth('error');
      setErrorMsg('Could not reach the assistant. Try again.');
    }
  }

  // ---- Orb click handler --------------------------------------------

  function handleOrbClick() {
    if (status === 'thinking') return;
    if (status === 'speaking') {
      // Manual interrupt: treat the same as voice barge-in so the AI
      // gets context on what was cut off.
      interruptAi();
      return;
    }
    if (status === 'listening') {
      // Tap to send what we've captured so far
      if (useNativeSR) stopNativeRecognition({ submit: true });
      else stopMediaRecorder();
      return;
    }
    // idle / error → start listening
    if (useNativeSR) startNativeRecognition();
    else startMediaRecorder();
  }

  // ---- Auto-start on mount + cleanup --------------------------------

  React.useEffect(() => {
    if (useNativeSR) startNativeRecognition();
    else startMediaRecorder();
    return () => {
      wantListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (utteranceTimerRef.current) clearTimeout(utteranceTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { }
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch (e) { }
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioRef.current) { try { audioRef.current.pause(); } catch (e) { } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = {
    idle: 'Tap to talk',
    listening: useNativeSR ? 'Listening…' : 'Listening… tap to send',
    thinking: 'Thinking…',
    speaking: 'Speaking… tap to interrupt',
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

      {/* User transcript — shows live partial as you speak */}
      <div style={{
        minHeight: 28, maxWidth: 560, textAlign: 'center',
        color: 'rgba(255,255,255,0.85)', fontSize: 16, fontStyle: 'italic',
        marginBottom: 24, padding: '0 20px',
        transition: 'color 0.2s ease',
      }}>
        {userText && <span>{userText}</span>}
        {interimText && (
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>
            {userText ? ' ' : ''}{interimText}
          </span>
        )}
        {!userText && !interimText && status === 'listening' && (
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>I'm listening…</span>
        )}
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
    .foodmaps-action-chip.warn {
      background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;
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
