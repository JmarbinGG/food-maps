// Dietary Preferences Component for Recipients
function DietaryPreferences({ user, onClose, onUpdate }) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Dietary data state
  const [dietaryData, setDietaryData] = React.useState({
    household_size: user?.household_size || 1,
    dietary_restrictions: [],
    allergies: [],
    preferred_categories: [],
    special_needs: user?.special_needs || ''
  });

  // Parse JSON fields from user object
  React.useEffect(() => {
    try {
      const parseDietaryRestrictions = user?.dietary_restrictions
        ? (typeof user.dietary_restrictions === 'string'
          ? JSON.parse(user.dietary_restrictions)
          : user.dietary_restrictions)
        : [];

      const parseAllergies = user?.allergies
        ? (typeof user.allergies === 'string'
          ? JSON.parse(user.allergies)
          : user.allergies)
        : [];

      const parsePreferredCategories = user?.preferred_categories
        ? (typeof user.preferred_categories === 'string'
          ? JSON.parse(user.preferred_categories)
          : user.preferred_categories)
        : [];

      setDietaryData({
        household_size: user?.household_size || 1,
        dietary_restrictions: parseDietaryRestrictions,
        allergies: parseAllergies,
        preferred_categories: parsePreferredCategories,
        special_needs: user?.special_needs || ''
      });
    } catch (e) {
      console.error('Error parsing dietary data:', e);
    }
  }, [user]);

  // Available options
  const dietaryRestrictionOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Halal',
    'Kosher',
    'Diabetic-Friendly',
    'Low-Sodium',
    'Keto',
    'Paleo',
    'Nut-Free'
  ];

  const allergyOptions = [
    'Peanuts',
    'Tree Nuts',
    'Dairy',
    'Eggs',
    'Soy',
    'Wheat/Gluten',
    'Fish',
    'Shellfish',
    'Sesame',
    'Corn',
    'Sulfites'
  ];

  const categoryOptions = [
    { value: 'produce', label: '🥬 Fresh Produce', icon: '🥬' },
    { value: 'prepared', label: '🍽️ Prepared Meals', icon: '🍽️' },
    { value: 'packaged', label: '📦 Packaged Foods', icon: '📦' },
    { value: 'bakery', label: '🥖 Bakery Items', icon: '🥖' },
    { value: 'water', label: '💧 Beverages', icon: '💧' },
    { value: 'fruit', label: '🍎 Fresh Fruit', icon: '🍎' }
  ];

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          household_size: dietaryData.household_size,
          dietary_restrictions: JSON.stringify(dietaryData.dietary_restrictions),
          allergies: JSON.stringify(dietaryData.allergies),
          preferred_categories: JSON.stringify(dietaryData.preferred_categories),
          special_needs: dietaryData.special_needs
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update dietary preferences');
      }

      const updatedUser = await response.json();

      // Update user in parent component
      if (onUpdate) {
        onUpdate({
          ...user,
          ...updatedUser
        });
      }

      alert('✅ Dietary preferences saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      alert('Failed to save dietary preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🍽️ Dietary Preferences
              </h2>
              <p className="text-green-50 text-sm mt-1">
                Help us find the best food matches for your needs
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Household Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👥 Household Size
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="20"
                value={dietaryData.household_size}
                onChange={(e) => setDietaryData({ ...dietaryData, household_size: parseInt(e.target.value) || 1 })}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-gray-600 text-sm">
                {dietaryData.household_size === 1 ? 'person' : 'people'} in your household
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This helps us recommend appropriate portion sizes
            </p>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🥗 Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dietaryRestrictionOptions.map(restriction => (
                <button
                  key={restriction}
                  onClick={() => setDietaryData({
                    ...dietaryData,
                    dietary_restrictions: toggleArrayItem(dietaryData.dietary_restrictions, restriction)
                  })}
                  className={`px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${dietaryData.dietary_restrictions.includes(restriction)
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                    }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ⚠️ Allergies & Food Sensitivities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allergyOptions.map(allergy => (
                <button
                  key={allergy}
                  onClick={() => setDietaryData({
                    ...dietaryData,
                    allergies: toggleArrayItem(dietaryData.allergies, allergy)
                  })}
                  className={`px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${dietaryData.allergies.includes(allergy)
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                    }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">
              ⚠️ We'll filter out foods containing these allergens
            </p>
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ❤️ Preferred Food Types
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category.value}
                  onClick={() => setDietaryData({
                    ...dietaryData,
                    preferred_categories: toggleArrayItem(dietaryData.preferred_categories, category.value)
                  })}
                  className={`px-4 py-3 rounded-lg border-2 transition font-medium text-sm flex items-center gap-2 ${dietaryData.preferred_categories.includes(category.value)
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.label.replace(/^.+?\s/, '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Needs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Additional Notes (Optional)
            </label>
            <textarea
              value={dietaryData.special_needs}
              onChange={(e) => setDietaryData({ ...dietaryData, special_needs: e.target.value })}
              placeholder="Any other dietary needs, preferences, or requirements we should know about..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Summary */}
          {(dietaryData.dietary_restrictions.length > 0 || dietaryData.allergies.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Your Dietary Profile</h4>
              <div className="space-y-2 text-sm">
                {dietaryData.dietary_restrictions.length > 0 && (
                  <p className="text-blue-800">
                    <span className="font-medium">Restrictions:</span> {dietaryData.dietary_restrictions.join(', ')}
                  </p>
                )}
                {dietaryData.allergies.length > 0 && (
                  <p className="text-red-800">
                    <span className="font-medium">Allergies:</span> {dietaryData.allergies.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg border-t flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : '✓ Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.DietaryPreferences = DietaryPreferences;
