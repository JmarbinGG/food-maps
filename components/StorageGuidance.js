// Storage Guidance Component - Shows food safety storage information
const STORAGE_GUIDANCE = {
  // Produce
  produce: {
    storage_type: 'refrigerate',
    icon: '🌡️',
    temp_range: '35-38°F',
    temp_range_c: '2-3°C',
    use_within_days: 5,
    opened_use_days: 3,
    notes: 'Store in crisper drawer. Wash before eating.'
  },

  // Prepared Foods
  prepared: {
    storage_type: 'refrigerate',
    icon: '❄️',
    temp_range: '35-38°F',
    temp_range_c: '2-3°C',
    use_within_days: 2,
    opened_use_days: 1,
    notes: 'Consume quickly. Reheat to 165°F before eating.'
  },

  // Packaged Foods
  packaged: {
    storage_type: 'shelf-stable',
    icon: '📦',
    temp_range: 'Room temp',
    temp_range_c: '20-25°C',
    use_within_days: 365,
    opened_use_days: 30,
    notes: 'Check expiration date. Store in cool, dry place.'
  },

  // Bakery
  bakery: {
    storage_type: 'shelf-stable',
    icon: '🍞',
    temp_range: 'Room temp',
    temp_range_c: '20-25°C',
    use_within_days: 3,
    opened_use_days: 2,
    notes: 'Can freeze for longer storage (up to 3 months).'
  },

  // Water/Beverages
  water: {
    storage_type: 'shelf-stable',
    icon: '💧',
    temp_range: 'Room temp',
    temp_range_c: '20-25°C',
    use_within_days: 365,
    opened_use_days: 7,
    notes: 'Once opened, refrigerate and use within 7 days.'
  },

  // Fruit
  fruit: {
    storage_type: 'refrigerate',
    icon: '🍎',
    temp_range: '35-38°F',
    temp_range_c: '2-3°C',
    use_within_days: 7,
    opened_use_days: 5,
    notes: 'Some fruits ripen better at room temp first.'
  },

  // Leftovers
  leftovers: {
    storage_type: 'refrigerate',
    icon: '🥡',
    temp_range: '35-38°F',
    temp_range_c: '2-3°C',
    use_within_days: 3,
    opened_use_days: 1,
    notes: 'Refrigerate within 2 hours. Reheat thoroughly.'
  },

  // Default for unknown categories
  default: {
    storage_type: 'refrigerate',
    icon: '🌡️',
    temp_range: '35-38°F',
    temp_range_c: '2-3°C',
    use_within_days: 3,
    opened_use_days: 2,
    notes: 'When in doubt, refrigerate. Check for signs of spoilage.'
  }
};

// Special handling for frozen items
const FREEZER_GUIDANCE = {
  storage_type: 'freeze',
  icon: '❄️',
  temp_range: '0°F or below',
  temp_range_c: '-18°C or below',
  use_within_days: 180,
  opened_use_days: 90,
  notes: 'Keep frozen until ready to use. Thaw in refrigerator.'
};

function StorageGuidance({ category, isFrozen, isRefrigerated, size = 'default', showDetails = false }) {
  // Determine storage guidance
  const getGuidance = () => {
    if (isFrozen) return FREEZER_GUIDANCE;

    const categoryKey = category ? category.toLowerCase() : 'default';
    return STORAGE_GUIDANCE[categoryKey] || STORAGE_GUIDANCE.default;
  };

  const guidance = getGuidance();

  // Size classes
  const sizeClasses = {
    compact: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  };

  const textSize = sizeClasses[size] || sizeClasses.default;

  // Storage type badge styling
  const getStorageBadge = () => {
    const badges = {
      'refrigerate': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        label: 'Refrigerate'
      },
      'freeze': {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        label: 'Keep Frozen'
      },
      'shelf-stable': {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: 'Shelf Stable'
      }
    };

    const badge = badges[guidance.storage_type] || badges['refrigerate'];

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg} ${badge.text} border ${badge.border} ${textSize} font-medium`}>
        <span className="text-base">{guidance.icon}</span>
        <span>{badge.label}</span>
      </div>
    );
  };

  if (!showDetails) {
    // Compact version - just the badge
    return getStorageBadge();
  }

  // Detailed version with all storage info
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{guidance.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>Storage Instructions</span>
            {getStorageBadge()}
          </div>

          <div className="space-y-2 text-sm">
            {/* Temperature Range */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🌡️</span>
              <div>
                <span className="font-semibold">Temperature:</span>
                <span className="ml-2 text-gray-700">
                  {guidance.temp_range} ({guidance.temp_range_c})
                </span>
              </div>
            </div>

            {/* Use Within */}
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <span className="font-semibold">Use within:</span>
                <span className="ml-2 text-gray-700">
                  {guidance.use_within_days} {guidance.use_within_days === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            {/* Once Opened */}
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <div>
                <span className="font-semibold">Once opened:</span>
                <span className="ml-2 text-gray-700">
                  Use within {guidance.opened_use_days} {guidance.opened_use_days === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            {/* Safety Notes */}
            {guidance.notes && (
              <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {guidance.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for listing cards
function StorageGuidanceCompact({ category, isFrozen, isRefrigerated }) {
  const getGuidance = () => {
    if (isFrozen) return FREEZER_GUIDANCE;
    const categoryKey = category ? category.toLowerCase() : 'default';
    return STORAGE_GUIDANCE[categoryKey] || STORAGE_GUIDANCE.default;
  };

  const guidance = getGuidance();

  const getStorageIcon = () => {
    if (guidance.storage_type === 'freeze') return '❄️';
    if (guidance.storage_type === 'refrigerate') return '🌡️';
    return '📦';
  };

  const getStorageColor = () => {
    if (guidance.storage_type === 'freeze') return 'text-cyan-600';
    if (guidance.storage_type === 'refrigerate') return 'text-blue-600';
    return 'text-amber-600';
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${getStorageColor()} text-xs`}
      title={`${guidance.storage_type === 'freeze' ? 'Keep Frozen' : guidance.storage_type === 'refrigerate' ? 'Refrigerate' : 'Shelf Stable'} at ${guidance.temp_range} • Use within ${guidance.use_within_days} days`}
    >
      <span className="text-sm">{getStorageIcon()}</span>
      <span>{guidance.temp_range}</span>
      <span className="text-gray-400">•</span>
      <span>{guidance.use_within_days}d</span>
    </div>
  );
}

// Storage info button that shows detailed modal
function StorageInfoButton({ category, isFrozen, isRefrigerated, listing }) {
  const [showModal, setShowModal] = React.useState(false);

  const getGuidance = () => {
    if (isFrozen) return FREEZER_GUIDANCE;
    const categoryKey = category ? category.toLowerCase() : 'default';
    return STORAGE_GUIDANCE[categoryKey] || STORAGE_GUIDANCE.default;
  };

  const guidance = getGuidance();

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-700 transition-colors"
        title="View storage instructions"
      >
        <span>{guidance.icon}</span>
        <span>Storage Info</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Storage Instructions</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>

            {listing && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900">{listing.title}</div>
                <div className="text-sm text-gray-600 capitalize">{listing.category}</div>
              </div>
            )}

            <StorageGuidance
              category={category}
              isFrozen={isFrozen}
              isRefrigerated={isRefrigerated}
              size="default"
              showDetails={true}
            />

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div className="text-xs text-yellow-900">
                  <p className="font-semibold mb-1">Food Safety Reminder:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>When in doubt, throw it out</li>
                    <li>Check for unusual odors or appearance</li>
                    <li>Keep hot foods hot (140°F+) and cold foods cold (40°F or below)</li>
                    <li>Wash hands before handling food</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Export guidance data for API use
window.STORAGE_GUIDANCE = STORAGE_GUIDANCE;
window.FREEZER_GUIDANCE = FREEZER_GUIDANCE;
