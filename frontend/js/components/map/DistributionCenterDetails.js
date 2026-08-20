// Shared dropdown for extended distribution-center details.
// Used by Map / DistributionCenterMap modals and AdminPanel list cards.

const PROVIDER_TYPE_TAGS = [
  'Food pantry',
  'Mobile food pantry',
  'Home delivery',
  'Community fridge',
  'Community meal / hot meals',
  'Senior meal program',
  'School meal program',
  'Food box distribution',
  'Grocery assistance',
  'Farmers market',
  'Produce distribution',
  'Food rescue',
  'Community Closet',
  'Community Garden',
  'School food distribution',
  'Meal preparation program',
  'Foodbank',
];

/** Distinct color classes per provider category (selected / idle / chip display). */
const PROVIDER_TYPE_COLOR_MAP = {
  'Food pantry': {
    selected: 'bg-amber-600 text-white border-amber-600',
    idle: 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500',
    chip: 'bg-amber-100 text-amber-900 border-amber-300',
    filterActive: 'bg-amber-600 text-white border-amber-600',
    filterIdle: 'bg-white text-amber-800 border-amber-400 hover:bg-amber-600 hover:text-white',
  },
  'Mobile food pantry': {
    selected: 'bg-orange-600 text-white border-orange-600',
    idle: 'bg-orange-50 text-orange-900 border-orange-300 hover:border-orange-500',
    chip: 'bg-orange-100 text-orange-900 border-orange-300',
    filterActive: 'bg-orange-600 text-white border-orange-600',
    filterIdle: 'bg-white text-orange-800 border-orange-400 hover:bg-orange-600 hover:text-white',
  },
  'Home delivery': {
    selected: 'bg-sky-600 text-white border-sky-600',
    idle: 'bg-sky-50 text-sky-900 border-sky-300 hover:border-sky-500',
    chip: 'bg-sky-100 text-sky-900 border-sky-300',
    filterActive: 'bg-sky-600 text-white border-sky-600',
    filterIdle: 'bg-white text-sky-800 border-sky-400 hover:bg-sky-600 hover:text-white',
  },
  'Community fridge': {
    selected: 'bg-cyan-600 text-white border-cyan-600',
    idle: 'bg-cyan-50 text-cyan-900 border-cyan-300 hover:border-cyan-500',
    chip: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    filterActive: 'bg-cyan-600 text-white border-cyan-600',
    filterIdle: 'bg-white text-cyan-800 border-cyan-400 hover:bg-cyan-600 hover:text-white',
  },
  'Community meal / hot meals': {
    selected: 'bg-rose-600 text-white border-rose-600',
    idle: 'bg-rose-50 text-rose-900 border-rose-300 hover:border-rose-500',
    chip: 'bg-rose-100 text-rose-900 border-rose-300',
    filterActive: 'bg-rose-600 text-white border-rose-600',
    filterIdle: 'bg-white text-rose-800 border-rose-400 hover:bg-rose-600 hover:text-white',
  },
  'Senior meal program': {
    selected: 'bg-purple-600 text-white border-purple-600',
    idle: 'bg-purple-50 text-purple-900 border-purple-300 hover:border-purple-500',
    chip: 'bg-purple-100 text-purple-900 border-purple-300',
    filterActive: 'bg-purple-600 text-white border-purple-600',
    filterIdle: 'bg-white text-purple-800 border-purple-400 hover:bg-purple-600 hover:text-white',
  },
  'School meal program': {
    selected: 'bg-indigo-600 text-white border-indigo-600',
    idle: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:border-indigo-500',
    chip: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    filterActive: 'bg-indigo-600 text-white border-indigo-600',
    filterIdle: 'bg-white text-indigo-800 border-indigo-400 hover:bg-indigo-600 hover:text-white',
  },
  'Food box distribution': {
    selected: 'bg-yellow-500 text-yellow-950 border-yellow-500',
    idle: 'bg-yellow-50 text-yellow-900 border-yellow-300 hover:border-yellow-500',
    chip: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    filterActive: 'bg-yellow-500 text-yellow-950 border-yellow-500',
    filterIdle: 'bg-white text-yellow-800 border-yellow-400 hover:bg-yellow-500 hover:text-yellow-950',
  },
  'Grocery assistance': {
    selected: 'bg-lime-600 text-white border-lime-600',
    idle: 'bg-lime-50 text-lime-900 border-lime-300 hover:border-lime-500',
    chip: 'bg-lime-100 text-lime-900 border-lime-300',
    filterActive: 'bg-lime-600 text-white border-lime-600',
    filterIdle: 'bg-white text-lime-800 border-lime-400 hover:bg-lime-600 hover:text-white',
  },
  'Farmers market': {
    selected: 'bg-emerald-600 text-white border-emerald-600',
    idle: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500',
    chip: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    filterActive: 'bg-emerald-600 text-white border-emerald-600',
    filterIdle: 'bg-white text-emerald-800 border-emerald-400 hover:bg-emerald-600 hover:text-white',
  },
  'Produce distribution': {
    selected: 'bg-green-600 text-white border-green-600',
    idle: 'bg-green-50 text-green-900 border-green-300 hover:border-green-500',
    chip: 'bg-green-100 text-green-900 border-green-300',
    filterActive: 'bg-green-600 text-white border-green-600',
    filterIdle: 'bg-white text-green-800 border-green-400 hover:bg-green-600 hover:text-white',
  },
  'Food rescue': {
    selected: 'bg-teal-600 text-white border-teal-600',
    idle: 'bg-teal-50 text-teal-900 border-teal-300 hover:border-teal-500',
    chip: 'bg-teal-100 text-teal-900 border-teal-300',
    filterActive: 'bg-teal-600 text-white border-teal-600',
    filterIdle: 'bg-white text-teal-800 border-teal-400 hover:bg-teal-600 hover:text-white',
  },
  'Community Closet': {
    selected: 'bg-fuchsia-600 text-white border-fuchsia-600',
    idle: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300 hover:border-fuchsia-500',
    chip: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    filterActive: 'bg-fuchsia-600 text-white border-fuchsia-600',
    filterIdle: 'bg-white text-fuchsia-800 border-fuchsia-400 hover:bg-fuchsia-600 hover:text-white',
  },
  'Community Garden': {
    selected: 'bg-green-700 text-white border-green-700',
    idle: 'bg-green-50 text-green-900 border-green-400 hover:border-green-600',
    chip: 'bg-green-200 text-green-950 border-green-500',
    filterActive: 'bg-green-700 text-white border-green-700',
    filterIdle: 'bg-white text-green-800 border-green-500 hover:bg-green-700 hover:text-white',
  },
  'School food distribution': {
    selected: 'bg-blue-600 text-white border-blue-600',
    idle: 'bg-blue-50 text-blue-900 border-blue-300 hover:border-blue-500',
    chip: 'bg-blue-100 text-blue-900 border-blue-300',
    filterActive: 'bg-blue-600 text-white border-blue-600',
    filterIdle: 'bg-white text-blue-800 border-blue-400 hover:bg-blue-600 hover:text-white',
  },
  'Meal preparation program': {
    selected: 'bg-pink-600 text-white border-pink-600',
    idle: 'bg-pink-50 text-pink-900 border-pink-300 hover:border-pink-500',
    chip: 'bg-pink-100 text-pink-900 border-pink-300',
    filterActive: 'bg-pink-600 text-white border-pink-600',
    filterIdle: 'bg-white text-pink-800 border-pink-400 hover:bg-pink-600 hover:text-white',
  },
  'Foodbank': {
    selected: 'bg-red-700 text-white border-red-700',
    idle: 'bg-red-50 text-red-900 border-red-300 hover:border-red-500',
    chip: 'bg-red-100 text-red-900 border-red-300',
    filterActive: 'bg-red-700 text-white border-red-700',
    filterIdle: 'bg-white text-red-800 border-red-400 hover:bg-red-700 hover:text-white',
  },
};

const PROVIDER_TYPE_COLOR_FALLBACK = {
  selected: 'bg-slate-700 text-white border-slate-700',
  idle: 'bg-white text-gray-700 border-gray-300 hover:border-slate-500',
  chip: 'bg-slate-100 text-slate-800 border-slate-300',
  filterActive: 'bg-slate-700 text-white border-slate-700',
  filterIdle: 'bg-white text-slate-800 border-slate-400 hover:bg-slate-700 hover:text-white',
};

function getProviderTypeClasses(tag, variant = 'chip') {
  const colors = PROVIDER_TYPE_COLOR_MAP[tag] || PROVIDER_TYPE_COLOR_FALLBACK;
  return colors[variant] || colors.chip;
}

const CENTER_AVAILABILITY_LABELS = {
  open: 'Open / Walk-in welcome',
  limited: 'Limited availability',
  appointment: 'Appointment / registration required',
  first_come: 'First come, first served',
  seasonal: 'Seasonal / schedule varies',
  closed: 'Temporarily closed',
};

function parseProviderTypes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch (_) { /* ignore */ }
  return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
}

function getProviderTypeOptions() {
  if (typeof window !== 'undefined' && Array.isArray(window.PROVIDER_TYPE_TAGS) && window.PROVIDER_TYPE_TAGS.length) {
    return window.PROVIDER_TYPE_TAGS;
  }
  return PROVIDER_TYPE_TAGS;
}

function resolveIsAdmin(user) {
  const fromUser = user?.role != null ? String(user.role).toLowerCase() : '';
  if (fromUser === 'admin') return true;
  try {
    const stored = JSON.parse(localStorage.getItem('current_user') || 'null');
    return String(stored?.role || '').toLowerCase() === 'admin';
  } catch (_) {
    return false;
  }
}

function formatCenterAvailability(value) {
  if (!value) return null;
  return CENTER_AVAILABILITY_LABELS[value] || value;
}

function normalizeExternalUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getDistributionCenterShareUrl(centerOrId) {
  const id = centerOrId && typeof centerOrId === 'object'
    ? centerOrId.id
    : centerOrId;
  if (id == null || id === '') return null;
  try {
    const url = new URL(window.location.origin + (window.location.pathname || '/'));
    // Keep the path on index / app root so guests and signed-in users
    // both land on the same public map experience.
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/';
    }
    url.search = '';
    url.hash = '';
    url.searchParams.set('center', String(id));
    return url.toString();
  } catch (_) {
    return `${window.location.origin}/?center=${encodeURIComponent(String(id))}`;
  }
}

async function copyTextToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

async function shareDistributionCenter(center) {
  if (!center || center.id == null) {
    return { method: 'error', message: 'Missing center' };
  }
  const url = getDistributionCenterShareUrl(center);
  const title = center.name || 'Food distribution center';
  const bits = [
    `Check out ${center.name || 'this distribution center'} on Food Maps`,
  ];
  if (center.address) bits.push(center.address);
  if (center.hours) bits.push(`Hours: ${center.hours}`);
  bits.push('No account required to view.');
  const text = bits.join('\n');

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return { method: 'native', url };
    } catch (err) {
      if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
        return { method: 'cancelled', url };
      }
      // Fall through to clipboard for browsers that reject share payloads.
    }
  }

  const copied = await copyTextToClipboard(url);
  if (copied) return { method: 'clipboard', url };
  return { method: 'error', url, message: 'Unable to share or copy link' };
}

function DistributionCenterCategories({
  center,
  user = null,
  canEdit = null,
  onCenterUpdated = null,
  compact = false,
}) {
  const [saving, setSaving] = React.useState(false);
  const [localTypes, setLocalTypes] = React.useState(() => parseProviderTypes(center?.provider_types));
  const options = getProviderTypeOptions();
  const isAdmin = canEdit != null ? Boolean(canEdit) : resolveIsAdmin(user);

  React.useEffect(() => {
    setLocalTypes(parseProviderTypes(center?.provider_types));
  }, [center?.id, center?.provider_types]);

  if (!center) return null;

  const saveTypes = async (nextTypes) => {
    const previous = localTypes;
    setLocalTypes(nextTypes);
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/centers/${center.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_types: JSON.stringify(nextTypes || []),
        }),
      });
      if (!response.ok) {
        setLocalTypes(previous);
        const error = await response.json().catch(() => ({}));
        const message = error.detail || 'Failed to update categories';
        if (typeof window.showAlert === 'function') {
          window.showAlert(message, { variant: 'error' });
        } else {
          alert(message);
        }
        return;
      }
      const data = await response.json().catch(() => ({}));
      const updated = data.center
        ? { ...center, ...data.center, provider_types: JSON.stringify(nextTypes) }
        : { ...center, provider_types: JSON.stringify(nextTypes) };
      if (typeof onCenterUpdated === 'function') {
        onCenterUpdated(updated);
      }
    } catch (err) {
      setLocalTypes(previous);
      console.error('Error updating categories:', err);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to update categories', { variant: 'error' });
      } else {
        alert('Failed to update categories');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag) => {
    if (!isAdmin || saving) return;
    const on = localTypes.includes(tag);
    const next = on ? localTypes.filter((t) => t !== tag) : [...localTypes, tag];
    saveTypes(next);
  };

  if (!isAdmin && localTypes.length === 0) return null;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50/60">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-800">Categories</div>
          {isAdmin ? (
            <span className="text-xs text-green-700">
              {saving ? 'Saving…' : `${localTypes.length} selected — click to update`}
            </span>
          ) : null}
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-1.5">
            {options.map((tag) => {
              const on = localTypes.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={saving}
                  title={on ? `Remove ${tag}` : `Add ${tag}`}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors disabled:opacity-60 ${
                    on
                      ? getProviderTypeClasses(tag, 'selected')
                      : getProviderTypeClasses(tag, 'idle')
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {localTypes.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getProviderTypeClasses(tag, 'chip')}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DistributionCenterDetails({
  center,
  user = null,
  canEditCategories = null,
  onCenterUpdated = null,
  showCategories = true,
  defaultOpen = false,
  compact = false,
}) {
  if (!center) return null;

  const availabilityLabel = formatCenterAvailability(center.availability);
  const websiteUrl = normalizeExternalUrl(center.website);
  const isAdmin = canEditCategories != null ? Boolean(canEditCategories) : resolveIsAdmin(user);
  const selectedTypes = parseProviderTypes(center.provider_types);

  const rows = [
    center.description ? { label: 'Description', value: center.description } : null,
    center.eligibility ? { label: 'Eligibility', value: center.eligibility } : null,
    center.languages ? { label: 'Languages spoken', value: center.languages } : null,
    availabilityLabel ? { label: 'Availability', value: availabilityLabel } : null,
    center.coverage_areas ? { label: 'Coverage areas', value: center.coverage_areas } : null,
    center.social_media ? { label: 'Social media', value: center.social_media } : null,
  ].filter(Boolean);

  const hasWebsite = Boolean(websiteUrl);
  const hasDetails = rows.length > 0 || hasWebsite;
  const categoriesVisible = showCategories && (isAdmin || selectedTypes.length > 0);

  if (!hasDetails && !categoriesVisible) {
    return (
      <div className={`text-sm text-gray-500 ${compact ? 'mt-2' : 'mt-3'}`}>
        No additional details available for this location yet.
      </div>
    );
  }

  return (
    <div className={compact ? 'mt-2 space-y-2' : 'mt-3 space-y-2'}>
      {showCategories ? (
        <DistributionCenterCategories
          center={center}
          user={user}
          canEdit={isAdmin}
          onCenterUpdated={onCenterUpdated}
          compact={compact}
        />
      ) : null}
      {hasDetails ? (
        <div className="rounded-lg border border-green-200 bg-green-50/60">
          <div className="px-3 py-2 space-y-2 text-sm text-gray-700">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.label}</div>
                <div className="whitespace-pre-wrap break-words">{row.value}</div>
              </div>
            ))}
            {hasWebsite && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</div>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline break-all"
                >
                  {center.website}
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DistributionCenterShareButton({ center, className = '' }) {
  const [status, setStatus] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  if (!center || center.id == null) return null;

  const handleShare = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setBusy(true);
    setStatus('');
    try {
      const result = await shareDistributionCenter(center);
      if (result.method === 'clipboard') {
        setStatus('Link copied — works with or without an account');
        if (typeof window.showAlert === 'function') {
          window.showAlert('Link copied. Anyone can open it, even without an account.', {
            variant: 'success',
          });
        }
      } else if (result.method === 'native') {
        setStatus('Shared');
      } else if (result.method === 'error') {
        setStatus(result.message || 'Share failed');
        if (typeof window.showAlert === 'function') {
          window.showAlert(result.message || 'Unable to share this center.', {
            variant: 'error',
          });
        }
      }
      if (result.method === 'clipboard' || result.method === 'native') {
        setTimeout(() => setStatus(''), 3500);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`inline-flex flex-col items-stretch ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors text-sm font-medium"
        title="Share a public link — no account required to view"
      >
        {busy ? 'Sharing…' : 'Share'}
      </button>
      {status ? (
        <span className="text-xs text-gray-600 mt-1 max-w-[14rem]">{status}</span>
      ) : null}
    </div>
  );
}

window.DistributionCenterDetails = DistributionCenterDetails;
window.DistributionCenterCategories = DistributionCenterCategories;
window.DistributionCenterShareButton = DistributionCenterShareButton;
window.PROVIDER_TYPE_TAGS = window.PROVIDER_TYPE_TAGS || PROVIDER_TYPE_TAGS;
window.PROVIDER_TYPE_COLOR_MAP = window.PROVIDER_TYPE_COLOR_MAP || PROVIDER_TYPE_COLOR_MAP;
window.getProviderTypeClasses = window.getProviderTypeClasses || getProviderTypeClasses;
window.CENTER_AVAILABILITY_LABELS = CENTER_AVAILABILITY_LABELS;
window.formatCenterAvailability = formatCenterAvailability;
window.parseProviderTypes = parseProviderTypes;
window.getDistributionCenterShareUrl = getDistributionCenterShareUrl;
window.shareDistributionCenter = shareDistributionCenter;
