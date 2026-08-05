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
  'School food distribution',
  'Meal preparation program',
];

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
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
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
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-700 text-white"
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
window.CENTER_AVAILABILITY_LABELS = CENTER_AVAILABILITY_LABELS;
window.formatCenterAvailability = formatCenterAvailability;
window.parseProviderTypes = parseProviderTypes;
window.getDistributionCenterShareUrl = getDistributionCenterShareUrl;
window.shareDistributionCenter = shareDistributionCenter;
