// AllergenDietaryFlags.js - Allergen warnings and dietary information component
const { React } = window;
const { useState } = React;

// Allergen definitions with icons and severity
const ALLERGENS = {
  nuts: {
    name: 'Nuts',
    icon: '',
    color: 'red',
    severity: 'high',
    description: 'Contains or may contain tree nuts or peanuts'
  },
  dairy: {
    name: 'Dairy',
    icon: '',
    color: 'orange',
    severity: 'medium',
    description: 'Contains milk, cheese, or other dairy products'
  },
  gluten: {
    name: 'Gluten',
    icon: '',
    color: 'yellow',
    severity: 'medium',
    description: 'Contains wheat, barley, rye, or other gluten-containing grains'
  },
  shellfish: {
    name: 'Shellfish',
    icon: '',
    color: 'red',
    severity: 'high',
    description: 'Contains or may contain shellfish (shrimp, crab, lobster, etc.)'
  },
  soy: {
    name: 'Soy',
    icon: '',
    color: 'yellow',
    severity: 'medium',
    description: 'Contains soy or soy-derived ingredients'
  },
  eggs: {
    name: 'Eggs',
    icon: '',
    color: 'yellow',
    severity: 'medium',
    description: 'Contains eggs or egg-derived ingredients'
  },
  fish: {
    name: 'Fish',
    icon: '',
    color: 'orange',
    severity: 'medium',
    description: 'Contains or may contain fish'
  },
  sesame: {
    name: 'Sesame',
    icon: '',
    color: 'orange',
    severity: 'medium',
    description: 'Contains sesame seeds or sesame oil'
  }
};

// Cross-contamination warning levels
const CONTAMINATION_WARNINGS = {
  'shared-kitchen': {
    label: 'Prepared in shared kitchen',
    icon: '',
    color: 'yellow',
    description: 'Prepared in a facility that also processes common allergens',
    severity: 'medium'
  },
  'shared-equipment': {
    label: 'Shared equipment',
    icon: '',
    color: 'orange',
    description: 'Prepared using equipment shared with allergen-containing foods',
    severity: 'medium'
  },
  'may-contain': {
    label: 'May contain traces',
    icon: '',
    color: 'yellow',
    description: 'May contain traces of allergens due to production process',
    severity: 'low'
  },
  'home-kitchen': {
    label: 'Home kitchen',
    icon: '',
    color: 'blue',
    description: 'Prepared in a home kitchen (allergen exposure varies)',
    severity: 'low'
  }
};

// Dietary preference tags
const DIETARY_TAGS = {
  vegetarian: {
    name: 'Vegetarian',
    icon: '',
    color: 'green',
    description: 'No meat, poultry, or fish'
  },
  vegan: {
    name: 'Vegan',
    icon: '',
    color: 'green',
    description: 'No animal products (meat, dairy, eggs, honey)'
  },
  halal: {
    name: 'Halal',
    icon: '',
    color: 'green',
    description: 'Prepared according to Islamic dietary guidelines'
  },
  kosher: {
    name: 'Kosher',
    icon: '',
    color: 'green',
    description: 'Prepared according to Jewish dietary laws'
  },
  'gluten-free': {
    name: 'Gluten-Free',
    icon: '',
    color: 'blue',
    description: 'Does not contain gluten'
  },
  'dairy-free': {
    name: 'Dairy-Free',
    icon: '',
    color: 'blue',
    description: 'Does not contain dairy products'
  },
  'nut-free': {
    name: 'Nut-Free',
    icon: '',
    color: 'blue',
    description: 'Does not contain nuts'
  }
};

// Compact allergen badges for listing cards
function AllergenBadgesCompact({ allergens = [], contaminationWarning = null }) {
  if (!allergens || allergens.length === 0) {
    return null;
  }

  const colorClasses = {
    red: 'bg-red-100 text-red-800 border-red-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  return React.createElement('div', { className: 'flex gap-1 flex-wrap' },
    allergens.slice(0, 3).map(allergen => {
      const info = ALLERGENS[allergen];
      if (!info) return null;

      return React.createElement('div', {
        key: allergen,
        className: `inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-medium ${colorClasses[info.color]}`,
        title: info.description
      },
        React.createElement('span', {}, info.icon),
        React.createElement('span', {}, info.name)
      );
    }),

    allergens.length > 3 && React.createElement('div', {
      className: 'inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium',
      title: `${allergens.length - 3} more allergen${allergens.length - 3 > 1 ? 's' : ''}`
    }, `+${allergens.length - 3}`)
  );
}

// Dietary tag badges (compact)
function DietaryTagsCompact({ tags = [] }) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return React.createElement('div', { className: 'flex gap-1 flex-wrap' },
    tags.map(tag => {
      const info = DIETARY_TAGS[tag];
      if (!info) return null;

      return React.createElement('div', {
        key: tag,
        className: `inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-medium ${colorClasses[info.color]}`,
        title: info.description
      },
        React.createElement('span', {}, info.icon),
        React.createElement('span', {}, info.name)
      );
    })
  );
}

// Full allergen and dietary information panel
function AllergenDietaryPanel({
  allergens = [],
  contaminationWarning = null,
  dietaryTags = [],
  ingredientsList = null,
  showDetails = false
}) {
  const [expanded, setExpanded] = useState(showDetails);

  const hasAllergens = allergens && allergens.length > 0;
  const hasDietaryTags = dietaryTags && dietaryTags.length > 0;
  const hasContamination = contaminationWarning != null;

  if (!hasAllergens && !hasDietaryTags && !hasContamination) {
    return null;
  }

  const severityColorClasses = {
    high: 'bg-red-50 border-red-300',
    medium: 'bg-orange-50 border-orange-300',
    low: 'bg-yellow-50 border-yellow-300'
  };

  const textColorClasses = {
    high: 'text-red-800',
    medium: 'text-orange-800',
    low: 'text-yellow-800'
  };

  // Determine overall severity
  const highSeverityAllergens = allergens.filter(a => ALLERGENS[a]?.severity === 'high');
  const overallSeverity = highSeverityAllergens.length > 0 ? 'high' :
    allergens.length > 0 ? 'medium' : 'low';

  return React.createElement('div', { className: 'mb-4' },
    // Allergen Warning Section
    hasAllergens && React.createElement('div', {
      className: `p-4 rounded-lg border-2 ${severityColorClasses[overallSeverity]} ${expanded ? '' : 'cursor-pointer hover:shadow-md transition-shadow'}`,
      onClick: expanded ? undefined : () => setExpanded(true)
    },
      React.createElement('div', { className: 'flex items-start justify-between' },
        React.createElement('div', { className: 'flex-1' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
            React.createElement('span', { className: 'text-2xl' }, ''),
            React.createElement('div', {},
              React.createElement('div', { className: `font-bold ${textColorClasses[overallSeverity]}` },
                'Allergen Warning'
              ),
              React.createElement('div', { className: `text-sm ${textColorClasses[overallSeverity]} opacity-75` },
                `Contains ${allergens.length} allergen${allergens.length > 1 ? 's' : ''}`
              )
            )
          ),

          // Allergen badges
          React.createElement('div', { className: 'flex gap-2 flex-wrap mb-3' },
            allergens.map(allergen => {
              const info = ALLERGENS[allergen];
              if (!info) return null;

              const badgeColorClasses = {
                red: 'bg-red-100 text-red-800 border-red-300',
                orange: 'bg-orange-100 text-orange-800 border-orange-300',
                yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300'
              };

              return React.createElement('div', {
                key: allergen,
                className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-bold ${badgeColorClasses[info.color]}`,
                title: info.description
              },
                React.createElement('span', { className: 'text-lg' }, info.icon),
                React.createElement('span', {}, info.name)
              );
            })
          ),

          // Important safety message
          React.createElement('div', {
            className: `mt-2 pt-2 border-t ${overallSeverity === 'high' ? 'border-red-300' : 'border-orange-300'}`
          },
            React.createElement('div', {
              className: `text-sm font-bold ${textColorClasses[overallSeverity]}`
            },
              highSeverityAllergens.length > 0
                ? ' SEVERE ALLERGY RISK - If you have allergies to these items, DO NOT consume'
                : ' Check ingredients carefully if you have food allergies'
            )
          )
        ),

        !expanded && React.createElement('div', {
          className: `text-sm ${textColorClasses[overallSeverity]} opacity-50`
        }, '► More info')
      ),

      // Expanded details
      expanded && React.createElement('div', { className: 'mt-4 space-y-3' },
        React.createElement('div', { className: 'pt-3 border-t border-gray-300' },
          React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, 'Allergen Details'),
          React.createElement('div', { className: 'space-y-2' },
            allergens.map(allergen => {
              const info = ALLERGENS[allergen];
              if (!info) return null;

              return React.createElement('div', {
                key: allergen,
                className: 'flex items-start gap-2 text-sm'
              },
                React.createElement('span', { className: 'text-lg mt-0.5' }, info.icon),
                React.createElement('div', {},
                  React.createElement('div', { className: 'font-semibold' }, info.name),
                  React.createElement('div', { className: 'text-gray-600' }, info.description)
                )
              );
            })
          )
        ),

        ingredientsList && React.createElement('div', { className: 'pt-3 border-t border-gray-300' },
          React.createElement('h4', { className: 'font-bold text-gray-800 mb-2' }, 'Ingredients'),
          React.createElement('p', { className: 'text-sm text-gray-700' }, ingredientsList)
        )
      )
    ),

    // Cross-contamination warning
    hasContamination && React.createElement('div', {
      className: 'mt-2 p-3 rounded-lg border bg-yellow-50 border-yellow-300'
    },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-lg' },
          CONTAMINATION_WARNINGS[contaminationWarning]?.icon || ''
        ),
        React.createElement('div', { className: 'flex-1' },
          React.createElement('div', { className: 'font-semibold text-yellow-900 text-sm' },
            CONTAMINATION_WARNINGS[contaminationWarning]?.label || contaminationWarning
          ),
          React.createElement('div', { className: 'text-xs text-yellow-800' },
            CONTAMINATION_WARNINGS[contaminationWarning]?.description || 'Cross-contamination possible'
          )
        )
      )
    ),

    // Dietary tags section
    hasDietaryTags && React.createElement('div', {
      className: 'mt-3 p-3 rounded-lg border bg-green-50 border-green-300'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
        React.createElement('span', { className: 'text-lg' }, ''),
        React.createElement('div', { className: 'font-semibold text-green-900 text-sm' },
          'Dietary Information'
        )
      ),
      React.createElement('div', { className: 'flex gap-2 flex-wrap' },
        dietaryTags.map(tag => {
          const info = DIETARY_TAGS[tag];
          if (!info) return null;

          const badgeColorClasses = {
            green: 'bg-green-100 text-green-800 border-green-300',
            blue: 'bg-blue-100 text-blue-800 border-blue-300'
          };

          return React.createElement('div', {
            key: tag,
            className: `inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${badgeColorClasses[info.color]}`,
            title: info.description
          },
            React.createElement('span', {}, info.icon),
            React.createElement('span', {}, info.name)
          );
        })
      )
    ),

    // General safety notice
    React.createElement('div', { className: 'mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800' },
      React.createElement('div', { className: 'font-semibold mb-1' }, ' Safety Notice'),
      React.createElement('div', {},
        'Always check food carefully before consuming. If you have severe allergies, ask the donor for detailed ingredient information. When in doubt, don\'t eat it.'
      )
    )
  );
}

// Modal for detailed allergen/dietary information
function AllergenInfoModal({ onClose, allergens, contaminationWarning, dietaryTags, ingredientsList }) {
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto',
      onClick: (e) => e.stopPropagation()
    },
      React.createElement('div', { className: 'p-6' },
        React.createElement('div', { className: 'flex justify-between items-start mb-4' },
          React.createElement('h3', { className: 'text-xl font-bold text-gray-800' },
            'Allergen & Dietary Information'
          ),
          React.createElement('button', {
            onClick: onClose,
            className: 'text-gray-500 hover:text-gray-700 text-2xl font-bold',
            type: 'button'
          }, '×')
        ),

        React.createElement(AllergenDietaryPanel, {
          allergens,
          contaminationWarning,
          dietaryTags,
          ingredientsList,
          showDetails: true
        }),

        React.createElement('div', { className: 'mt-6 pt-4 border-t border-gray-200' },
          React.createElement('h4', { className: 'font-bold text-gray-800 mb-3' },
            'Common Allergens Reference'
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-2 text-sm' },
            Object.entries(ALLERGENS).map(([key, info]) =>
              React.createElement('div', {
                key,
                className: 'flex items-center gap-2 p-2 bg-gray-50 rounded'
              },
                React.createElement('span', { className: 'text-lg' }, info.icon),
                React.createElement('span', { className: 'font-medium' }, info.name)
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
  window.AllergenBadgesCompact = AllergenBadgesCompact;
  window.DietaryTagsCompact = DietaryTagsCompact;
  window.AllergenDietaryPanel = AllergenDietaryPanel;
  window.AllergenInfoModal = AllergenInfoModal;
  window.ALLERGENS = ALLERGENS;
  window.DIETARY_TAGS = DIETARY_TAGS;
  window.CONTAMINATION_WARNINGS = CONTAMINATION_WARNINGS;
}
