// ExpirationEducation.js - Educational component for food expiration dates
const { React } = window;
const { useState } = React;

// Date label education data
const DATE_LABEL_INFO = {
  'sell-by': {
    title: 'Sell By',
    icon: '',
    description: 'For stores, not you',
    meaning: 'This tells the store when to rotate stock. The food is still good for days or weeks after this date if stored properly.',
    safety: 'safe-after',
    safetyMessage: 'Safe to eat after this date',
    storageAdvice: 'Check for freshness using your senses - look, smell, and taste a small amount.',
    color: 'blue'
  },
  'use-by': {
    title: 'Use By',
    icon: '⏰',
    description: 'Best quality deadline',
    meaning: 'The manufacturer suggests using by this date for best quality and flavor. Most foods are still safe after this date.',
    safety: 'safe-with-care',
    safetyMessage: 'Usually safe if stored properly',
    storageAdvice: 'Check the food carefully. If it looks, smells, and tastes normal, it\'s likely fine.',
    exceptions: ['baby formula', 'infant food', 'some dietary supplements'],
    color: 'yellow'
  },
  'best-by': {
    title: 'Best By',
    icon: '⭐',
    description: 'Peak quality date',
    meaning: 'This is when the food tastes best. It doesn\'t mean the food is unsafe after this date - just that flavor or texture might change.',
    safety: 'safe-after',
    safetyMessage: 'Safe to eat after this date',
    storageAdvice: 'Quality may decline, but food is still safe. Canned goods often last years past this date.',
    color: 'green'
  },
  'expires-on': {
    title: 'Expires On',
    icon: '',
    description: 'Safety deadline',
    meaning: 'This date is used for foods where safety is a concern. Do not consume these items after the expiration date.',
    safety: 'do-not-consume',
    safetyMessage: 'Do not consume after this date',
    storageAdvice: 'Discard after this date. Used mainly for baby formula, certain medications, and highly perishable items.',
    exceptions: [],
    color: 'red'
  }
};

// Determine date label type from listing data
function determineDateLabelType(listing) {
  // Check if explicit label type is provided
  if (listing.date_label_type) {
    return listing.date_label_type;
  }

  // Infer from category and perishability
  const category = listing.category?.toLowerCase() || '';
  const perishability = listing.perishability?.toLowerCase() || '';

  // Baby formula and infant food always expire
  if (category.includes('baby') || category.includes('formula') || category.includes('infant')) {
    return 'expires-on';
  }

  // Highly perishable items use "use-by"
  if (perishability === 'highly' || perishability === 'high') {
    return 'use-by';
  }

  // Packaged and shelf-stable items use "best-by"
  if (category.includes('packaged') || category.includes('canned') || perishability === 'low') {
    return 'best-by';
  }

  // Prepared and fresh items use "sell-by"
  if (category.includes('prepared') || category.includes('produce') || perishability === 'medium') {
    return 'sell-by';
  }

  // Default to best-by
  return 'best-by';
}

// Calculate days until expiration
function calculateDaysUntil(expirationDate) {
  if (!expirationDate) return null;

  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Get visual countdown display
function getCountdownDisplay(daysUntil, labelType) {
  const info = DATE_LABEL_INFO[labelType] || DATE_LABEL_INFO['best-by'];

  if (daysUntil === null) {
    return { emoji: '', text: 'No date provided', color: 'gray', status: 'unknown' };
  }

  // Already expired
  if (daysUntil < 0) {
    const daysPast = Math.abs(daysUntil);

    // For "expires-on" type, show warning
    if (info.safety === 'do-not-consume') {
      return {
        emoji: '',
        text: `Expired ${daysPast}d ago`,
        color: 'red',
        status: 'expired-unsafe',
        message: 'Do not consume'
      };
    }

    // For other types, show it's likely still safe
    return {
      emoji: '',
      text: `${daysPast}d past label`,
      color: 'blue',
      status: 'past-date-safe',
      message: info.safetyMessage
    };
  }

  // Expires today
  if (daysUntil === 0) {
    return {
      emoji: '',
      text: 'Use today',
      color: info.safety === 'do-not-consume' ? 'orange' : 'yellow',
      status: 'expires-today'
    };
  }

  // Expires in 1-3 days (urgent)
  if (daysUntil <= 3) {
    return {
      emoji: '⏰',
      text: `${daysUntil}d left`,
      color: 'orange',
      status: 'urgent'
    };
  }

  // Expires in 4-7 days (soon)
  if (daysUntil <= 7) {
    return {
      emoji: '',
      text: `${daysUntil}d left`,
      color: 'yellow',
      status: 'soon'
    };
  }

  // More than 7 days (good)
  return {
    emoji: '',
    text: `${daysUntil}d left`,
    color: 'green',
    status: 'good'
  };
}

// Compact expiration display for listing cards
function ExpirationBadgeCompact({ expirationDate, labelType, category, perishability }) {
  const inferredType = labelType || determineDateLabelType({ category, perishability });
  const daysUntil = calculateDaysUntil(expirationDate);
  const countdown = getCountdownDisplay(daysUntil, inferredType);
  const info = DATE_LABEL_INFO[inferredType] || DATE_LABEL_INFO['best-by'];

  const colorClasses = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return React.createElement('div', {
    className: `inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${colorClasses[countdown.color] || colorClasses.gray}`,
    title: `${info.title}: ${info.description}`
  },
    React.createElement('span', { className: 'text-sm' }, countdown.emoji),
    React.createElement('span', {}, countdown.text)
  );
}

// Full expiration education component
function ExpirationEducation({ expirationDate, labelType, category, perishability, showFull = false }) {
  const [showEducation, setShowEducation] = useState(false);

  const inferredType = labelType || determineDateLabelType({ category, perishability });
  const daysUntil = calculateDaysUntil(expirationDate);
  const countdown = getCountdownDisplay(daysUntil, inferredType);
  const info = DATE_LABEL_INFO[inferredType] || DATE_LABEL_INFO['best-by'];

  if (!expirationDate && !showFull) {
    return null;
  }

  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    gray: 'bg-gray-50 border-gray-200'
  };

  const textColorClasses = {
    red: 'text-red-800',
    orange: 'text-orange-800',
    yellow: 'text-yellow-800',
    green: 'text-green-800',
    blue: 'text-blue-800',
    gray: 'text-gray-800'
  };

  return React.createElement('div', { className: 'mb-4' },
    // Main display
    React.createElement('div', {
      className: `p-4 rounded-lg border-2 ${colorClasses[info.color]} cursor-pointer hover:shadow-md transition-shadow`,
      onClick: () => setShowEducation(!showEducation)
    },
      React.createElement('div', { className: 'flex items-start justify-between' },
        // Left side - Label info
        React.createElement('div', { className: 'flex-1' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
            React.createElement('span', { className: 'text-2xl' }, info.icon),
            React.createElement('div', {},
              React.createElement('div', { className: `font-bold ${textColorClasses[info.color]}` }, info.title),
              React.createElement('div', { className: `text-sm ${textColorClasses[info.color]} opacity-75` }, info.description)
            )
          ),

          // Date display
          expirationDate && React.createElement('div', { className: `text-sm ${textColorClasses[info.color]} mb-2` },
            React.createElement('span', { className: 'font-medium' }, 'Date: '),
            React.createElement('span', {}, new Date(expirationDate).toLocaleDateString())
          ),

          // Countdown
          expirationDate && React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-3xl' }, countdown.emoji),
            React.createElement('div', {},
              React.createElement('div', { className: `font-bold text-lg ${textColorClasses[countdown.color]}` },
                countdown.text
              ),
              countdown.message && React.createElement('div', {
                className: `text-sm ${textColorClasses[countdown.color]} opacity-75`
              }, countdown.message)
            )
          )
        ),

        // Right side - Learn more indicator
        React.createElement('div', { className: `text-sm ${textColorClasses[info.color]} opacity-50` },
          showEducation ? '▼ Hide info' : '► Learn more'
        )
      ),

      // Safety message highlight
      React.createElement('div', {
        className: `mt-3 pt-3 border-t ${info.safety === 'do-not-consume' ? 'border-red-300' : 'border-gray-300'}`
      },
        React.createElement('div', {
          className: `text-sm font-medium ${textColorClasses[info.color]}`
        }, info.safetyMessage)
      )
    ),

    // Educational content (expandable)
    showEducation && React.createElement('div', {
      className: `mt-2 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-inner`
    },
      React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, 'What does this mean?'),
      React.createElement('p', { className: 'text-gray-700 mb-3' }, info.meaning),

      React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, 'Storage advice'),
      React.createElement('p', { className: 'text-gray-700 mb-3' }, info.storageAdvice),

      info.exceptions && info.exceptions.length > 0 && React.createElement('div', { className: 'mb-3' },
        React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, 'Important exceptions:'),
        React.createElement('p', { className: 'text-sm text-gray-600' },
          `Items like ${info.exceptions.join(', ')} should follow this date strictly.`
        )
      ),

      // General food safety tips
      React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-200' },
        React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, ' Food Safety Tips'),
        React.createElement('ul', { className: 'text-sm text-gray-700 space-y-1 list-disc list-inside' },
          React.createElement('li', {}, 'Trust your senses: if it looks, smells, or tastes off, don\'t eat it'),
          React.createElement('li', {}, 'Proper storage extends shelf life significantly'),
          React.createElement('li', {}, 'When in doubt, it\'s better to be safe than sorry'),
          React.createElement('li', {}, 'Refrigerate perishables within 2 hours of receiving them')
        )
      )
    )
  );
}

// Button to show expiration info modal
function ExpirationInfoButton({ expirationDate, labelType, category, perishability }) {
  const [showModal, setShowModal] = useState(false);

  if (!expirationDate) {
    return null;
  }

  return React.createElement(React.Fragment, {},
    React.createElement('button', {
      onClick: () => setShowModal(true),
      className: 'text-blue-600 hover:text-blue-800 text-sm font-medium underline',
      type: 'button'
    }, 'What does this date mean?'),

    showModal && React.createElement('div', {
      className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
      onClick: () => setShowModal(false)
    },
      React.createElement('div', {
        className: 'bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto',
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { className: 'p-6' },
          React.createElement('div', { className: 'flex justify-between items-start mb-4' },
            React.createElement('h3', { className: 'text-xl font-bold text-gray-800' },
              'Understanding Food Dates'
            ),
            React.createElement('button', {
              onClick: () => setShowModal(false),
              className: 'text-gray-500 hover:text-gray-700 text-2xl font-bold',
              type: 'button'
            }, '×')
          ),

          React.createElement(ExpirationEducation, {
            expirationDate,
            labelType,
            category,
            perishability,
            showFull: true
          }),

          // All date types reference
          React.createElement('div', { className: 'mt-6 pt-6 border-t border-gray-200' },
            React.createElement('h4', { className: 'font-bold text-gray-800 mb-3' },
              'Quick Reference: All Date Types'
            ),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
              Object.entries(DATE_LABEL_INFO).map(([key, value]) =>
                React.createElement('div', {
                  key,
                  className: 'p-3 border border-gray-200 rounded-lg'
                },
                  React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                    React.createElement('span', { className: 'text-xl' }, value.icon),
                    React.createElement('span', { className: 'font-bold text-sm' }, value.title)
                  ),
                  React.createElement('div', { className: 'text-xs text-gray-600' }, value.description)
                )
              )
            )
          )
        )
      )
    )
  );
}

// Export components
if (typeof window !== 'undefined') {
  window.ExpirationEducation = ExpirationEducation;
  window.ExpirationBadgeCompact = ExpirationBadgeCompact;
  window.ExpirationInfoButton = ExpirationInfoButton;
  window.DATE_LABEL_INFO = DATE_LABEL_INFO;
}
