// Trust Badge Component - Shows verification and partner status
function parseTimestamp(dateStr) {
  if (!dateStr) return null;
  try {
    // Backend often sends naive ISO strings (no timezone). Treat them as UTC.
    const raw = String(dateStr).trim();
    const isoLike = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
    const hasTimezone = /([zZ]|[+\-]\d{2}:?\d{2})$/.test(raw);
    const normalized = hasTimezone ? isoLike : `${isoLike}Z`;
    const date = new Date(normalized);
    return Number.isFinite(date.getTime()) ? date : null;
  } catch (_) {
    return null;
  }
}

function TrustBadge({
  verifiedByAGLF,
  schoolPartner,
  partnerBadge,
  partnerSince,
  lastActive,
  lastUpdated,
  trustScore,
  size = 'default',
  showDetails = false
}) {
  const badges = [];

  // AGLF Verification Badge
  if (verifiedByAGLF) {
    badges.push({
      type: 'aglf',
      icon: '✓',
      label: 'AGLF Verified',
      color: 'bg-green-100 text-green-800 border-green-300',
      tooltip: 'Verified by All Good Living Foundation'
    });
  }

  // School Partner Badge
  if (schoolPartner) {
    badges.push({
      type: 'school',
      icon: '🎓',
      label: 'School Partner',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      tooltip: 'Official School Partner'
    });
  }

  // Generic Partner Badge
  if (partnerBadge && !verifiedByAGLF && !schoolPartner) {
    const badgeConfig = {
      'community': { icon: '🤝', label: 'Community Partner', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'verified_donor': { icon: '⭐', label: 'Verified Donor', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'trusted': { icon: '🛡️', label: 'Trusted Member', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
    };

    const config = badgeConfig[partnerBadge] || {
      icon: '✓',
      label: 'Partner',
      color: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    badges.push({
      type: partnerBadge,
      ...config,
      tooltip: `${config.label} status`
    });
  }

  // Calculate time since last activity/update
  const getTimeSince = (dateStr) => {
    if (!dateStr) return null;

    const date = parseTimestamp(dateStr);
    if (!date) return null;
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const timeSince = getTimeSince(lastUpdated || lastActive);
  const partnerDuration = partnerSince ? getTimeSince(partnerSince) : null;

  // Determine freshness indicator
  const getFreshnessColor = () => {
    if (!timeSince) return 'text-gray-500';

    const dateToCheck = parseTimestamp(lastUpdated || lastActive);
    if (!dateToCheck) return 'text-gray-500';
    const now = new Date();
    const hoursSince = Math.max(0, (now - dateToCheck) / 3600000);

    if (hoursSince < 1) return 'text-green-600'; // Very fresh
    if (hoursSince < 24) return 'text-green-500'; // Fresh
    if (hoursSince < 72) return 'text-yellow-600'; // Recent
    if (hoursSince < 168) return 'text-orange-500'; // Week old
    return 'text-gray-500'; // Older
  };

  const sizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    large: 'text-base px-3 py-1.5'
  };

  if (badges.length === 0 && !showDetails) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Trust Badges */}
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className={`inline-flex items-center gap-1 ${badge.color} border rounded-full ${sizeClasses[size]} font-medium`}
          title={badge.tooltip}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
          {partnerDuration && showDetails && badge.type === 'aglf' && (
            <span className="text-xs opacity-75">({partnerDuration})</span>
          )}
        </div>
      ))}

      {/* Last Update Time - Shows credibility through recency */}
      {timeSince && showDetails && (
        <div
          className={`inline-flex items-center gap-1 ${getFreshnessColor()} text-sm`}
          title={`Last ${lastUpdated ? 'updated' : 'active'}: ${(parseTimestamp(lastUpdated || lastActive) || new Date()).toLocaleString()}`}
        >
          <i className="lucide-clock" style={{ width: '14px', height: '14px' }}></i>
          <span>Updated {timeSince}</span>
        </div>
      )}

      {/* Trust Score Indicator */}
      {trustScore !== undefined && showDetails && (
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm border ${trustScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
              trustScore >= 60 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                trustScore >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          title="Trust Score based on verified exchanges and feedback"
        >
          <i className="lucide-shield-check" style={{ width: '14px', height: '14px' }}></i>
          <span>{trustScore}% Trust</span>
        </div>
      )}
    </div>
  );
}

// Compact version for listing cards
function TrustBadgeCompact({ verifiedByAGLF, schoolPartner, partnerBadge, lastActive, lastUpdated }) {
  const badges = [];

  if (verifiedByAGLF) badges.push({ icon: '✓', color: 'text-green-600', tooltip: 'AGLF Verified' });
  if (schoolPartner) badges.push({ icon: '🎓', color: 'text-blue-600', tooltip: 'School Partner' });
  if (partnerBadge && !verifiedByAGLF && !schoolPartner) {
    badges.push({ icon: '⭐', color: 'text-yellow-600', tooltip: 'Verified Partner' });
  }

  const getTimeSince = (dateStr) => {
    if (!dateStr) return null;
    const date = parseTimestamp(dateStr);
    if (!date) return null;
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  const timeSince = getTimeSince(lastUpdated || lastActive);

  if (badges.length === 0 && !timeSince) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className={`${badge.color} font-medium`}
          title={badge.tooltip}
        >
          {badge.icon}
        </span>
      ))}
      {timeSince && (
        <span className="text-gray-500" title={`Last updated ${timeSince} ago`}>
          • {timeSince}
        </span>
      )}
    </div>
  );
}

// Admin tool to assign badges
function AssignTrustBadgeModal({ user, onClose, onUpdate }) {
  const [verifiedByAGLF, setVerifiedByAGLF] = React.useState(user?.verified_by_aglf || false);
  const [schoolPartner, setSchoolPartner] = React.useState(user?.school_partner || false);
  const [partnerBadge, setPartnerBadge] = React.useState(user?.partner_badge || '');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${user.id}/trust-badges`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verified_by_aglf: verifiedByAGLF,
          school_partner: schoolPartner,
          partner_badge: partnerBadge || null,
          partner_since: (verifiedByAGLF || schoolPartner) && !user.partner_since ? new Date().toISOString() : undefined
        })
      });

      if (response.ok) {
        const updated = await response.json();
        if (typeof window.showAlert === 'function') {
          window.showAlert('Trust badges updated successfully', { variant: 'success' });
        }
        onUpdate?.(updated);
        onClose();
      } else {
        throw new Error('Failed to update badges');
      }
    } catch (error) {
      console.error('Error updating trust badges:', error);
      if (typeof window.showAlert === 'function') {
        window.showAlert('Failed to update trust badges', { variant: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Assign Trust Badges</h2>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600">
            Assign official verification and partner badges to: <strong>{user?.name}</strong>
          </p>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedByAGLF}
              onChange={(e) => setVerifiedByAGLF(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium text-green-700">✓ AGLF Verified</div>
              <div className="text-xs text-gray-500">Verified by All Good Living Foundation</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={schoolPartner}
              onChange={(e) => setSchoolPartner(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <div className="font-medium text-blue-700">🎓 School Partner</div>
              <div className="text-xs text-gray-500">Official school partnership status</div>
            </div>
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Badge (Optional)
            </label>
            <select
              value={partnerBadge}
              onChange={(e) => setPartnerBadge(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">None</option>
              <option value="community">🤝 Community Partner</option>
              <option value="verified_donor">⭐ Verified Donor</option>
              <option value="trusted">🛡️ Trusted Member</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Badges'}
          </button>
        </div>
      </div>
    </div>
  );
}
