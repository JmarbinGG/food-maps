const FoodSafetyChecklist = ({ foodItem, onSafetyUpdate, mode = 'create' }) => {
  const [safetyData, setSafetyData] = React.useState({
    storageTemperature: foodItem?.storage_temperature || '',
    isRefrigerated: foodItem?.is_refrigerated || false,
    isFrozen: foodItem?.is_frozen || false,
    packagingCondition: foodItem?.packaging_condition || 'good',
    safetyChecks: {
      properTemperature: false,
      notExpired: false,
      intactPackaging: false,
      noContamination: false,
      properLabeling: false,
      allergenInfo: false,
      storageCompliant: false,
      visualInspection: false
    },
    safetyNotes: foodItem?.safety_notes || '',
    lastChecked: foodItem?.safety_last_checked || null
  });

  const [showDetails, setShowDetails] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState([]);

  // Food category temperature requirements
  const temperatureRequirements = {
    'Dairy': { min: 32, max: 40, unit: '°F', storage: 'Refrigerated' },
    'Meat': { min: 32, max: 40, unit: '°F', storage: 'Refrigerated or Frozen (0°F)' },
    'Produce': { min: 32, max: 45, unit: '°F', storage: 'Refrigerated (most items)' },
    'Frozen': { min: -10, max: 0, unit: '°F', storage: 'Frozen' },
    'Prepared': { min: 32, max: 40, unit: '°F', storage: 'Refrigerated' },
    'Baked': { min: 50, max: 75, unit: '°F', storage: 'Room Temperature (if sealed)' },
    'Canned': { min: 50, max: 70, unit: '°F', storage: 'Room Temperature' },
    'Dry': { min: 50, max: 70, unit: '°F', storage: 'Cool, Dry Place' }
  };

  const packagingOptions = [
    { value: 'excellent', label: 'Excellent', icon: '✨', color: 'green' },
    { value: 'good', label: 'Good', icon: '👍', color: 'blue' },
    { value: 'fair', label: 'Fair', icon: '⚠️', color: 'yellow' },
    { value: 'poor', label: 'Poor', icon: '❌', color: 'red' }
  ];

  const safetyCheckItems = [
    {
      key: 'properTemperature',
      label: 'Stored at proper temperature',
      description: 'Food has been kept within safe temperature range',
      required: true
    },
    {
      key: 'notExpired',
      label: 'Not expired or within safe use period',
      description: 'Best-by date has not passed or food is still safe',
      required: true
    },
    {
      key: 'intactPackaging',
      label: 'Packaging is intact and sealed',
      description: 'No tears, holes, or compromised sealing',
      required: true
    },
    {
      key: 'noContamination',
      label: 'No signs of contamination',
      description: 'No mold, discoloration, or unusual odors',
      required: true
    },
    {
      key: 'properLabeling',
      label: 'Proper labeling present',
      description: 'Ingredients, dates, and handling instructions visible',
      required: false
    },
    {
      key: 'allergenInfo',
      label: 'Allergen information available',
      description: 'Common allergens are clearly marked',
      required: false
    },
    {
      key: 'storageCompliant',
      label: 'Storage conditions met requirements',
      description: 'Humidity, light, and location appropriate for food type',
      required: false
    },
    {
      key: 'visualInspection',
      label: 'Visual inspection passed',
      description: 'Food appearance is normal and appetizing',
      required: true
    }
  ];

  // Calculate safety score
  const calculateSafetyScore = () => {
    const totalChecks = Object.keys(safetyData.safetyChecks).length;
    const passedChecks = Object.values(safetyData.safetyChecks).filter(Boolean).length;
    const requiredChecks = safetyCheckItems.filter(item => item.required);
    const passedRequired = requiredChecks.filter(item => safetyData.safetyChecks[item.key]).length;

    const score = Math.round((passedChecks / totalChecks) * 100);
    const allRequiredPassed = passedRequired === requiredChecks.length;

    return { score, allRequiredPassed };
  };

  // Validate temperature
  const validateTemperature = () => {
    if (!foodItem?.category || !safetyData.storageTemperature) return true;

    const requirements = temperatureRequirements[foodItem.category];
    if (!requirements) return true;

    const temp = parseFloat(safetyData.storageTemperature);
    if (isNaN(temp)) return false;

    return temp >= requirements.min && temp <= requirements.max;
  };

  // Check if food is expired
  const checkExpiration = () => {
    if (!foodItem?.expiration_date) return { isExpired: false, daysRemaining: null };

    const expirationDate = new Date(foodItem.expiration_date);
    const today = new Date();
    const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    return {
      isExpired: daysRemaining < 0,
      daysRemaining: daysRemaining,
      isNearExpiration: daysRemaining <= 3 && daysRemaining >= 0
    };
  };

  // Handle checkbox change
  const handleCheckChange = (key, checked) => {
    setSafetyData(prev => ({
      ...prev,
      safetyChecks: {
        ...prev.safetyChecks,
        [key]: checked
      }
    }));
  };

  // Handle storage type change
  const handleStorageChange = (type) => {
    setSafetyData(prev => ({
      ...prev,
      isRefrigerated: type === 'refrigerated',
      isFrozen: type === 'frozen'
    }));
  };

  // Validate and submit
  const handleSubmit = () => {
    const errors = [];
    const { score, allRequiredPassed } = calculateSafetyScore();
    const tempValid = validateTemperature();
    const { isExpired } = checkExpiration();

    // Validation rules
    if (!allRequiredPassed) {
      errors.push('All required safety checks must be completed');
    }

    if (isExpired) {
      errors.push('Food item is expired and cannot be listed');
    }

    if (!tempValid) {
      errors.push('Storage temperature is outside safe range for this food category');
    }

    if (safetyData.packagingCondition === 'poor') {
      errors.push('Poor packaging condition - food may not be safe to distribute');
    }

    if (score < 60) {
      errors.push('Safety score too low (minimum 60% required)');
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      onSafetyUpdate({
        ...safetyData,
        safetyScore: score,
        safetyPassed: true,
        lastChecked: new Date().toISOString()
      });
    }
  };

  const { score, allRequiredPassed } = calculateSafetyScore();
  const tempValid = validateTemperature();
  const expirationInfo = checkExpiration();
  const requirements = foodItem?.category ? temperatureRequirements[foodItem.category] : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Food Safety Checklist</h3>
            <p className="text-sm text-gray-500">
              Ensure food meets safety standards before distribution
            </p>
          </div>
        </div>

        {mode === 'view' && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {/* Safety Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Safety Score</span>
          <span className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' :
              score >= 60 ? 'text-yellow-600' :
                'text-red-600'
            }`}>
            {score}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${score >= 80 ? 'bg-green-500' :
                score >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
              }`}
            style={{ width: `${score}%` }}
          />
        </div>
        {!allRequiredPassed && (
          <p className="text-xs text-red-600 mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Complete all required checks to pass safety standards
          </p>
        )}
      </div>

      {/* Temperature Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🌡️</span>
          Temperature & Storage
        </h4>

        {requirements && (
          <div className="mb-3 p-3 bg-blue-50 rounded text-sm">
            <p className="font-medium text-blue-900">Required for {foodItem.category}:</p>
            <p className="text-blue-700">
              {requirements.min}°F to {requirements.max}°F ({requirements.storage})
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Storage Temperature (°F) *
            </label>
            <input
              type="number"
              value={safetyData.storageTemperature}
              onChange={(e) => setSafetyData({ ...safetyData, storageTemperature: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${tempValid ? 'border-gray-300' : 'border-red-300 bg-red-50'
                }`}
              placeholder="e.g., 38"
              disabled={mode === 'view'}
            />
            {!tempValid && safetyData.storageTemperature && (
              <p className="text-xs text-red-600 mt-1">Temperature outside safe range</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Type *
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStorageChange('room')}
                disabled={mode === 'view'}
                className={`flex-1 px-3 py-2 rounded-lg border font-medium text-sm transition ${!safetyData.isRefrigerated && !safetyData.isFrozen
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Room Temp
              </button>
              <button
                onClick={() => handleStorageChange('refrigerated')}
                disabled={mode === 'view'}
                className={`flex-1 px-3 py-2 rounded-lg border font-medium text-sm transition ${safetyData.isRefrigerated
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Refrigerated
              </button>
              <button
                onClick={() => handleStorageChange('frozen')}
                disabled={mode === 'view'}
                className={`flex-1 px-3 py-2 rounded-lg border font-medium text-sm transition ${safetyData.isFrozen
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Frozen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expiration Status */}
      {foodItem?.expiration_date && (
        <div className={`mb-6 p-4 rounded-lg border ${expirationInfo.isExpired ? 'bg-red-50 border-red-200' :
            expirationInfo.isNearExpiration ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {expirationInfo.isExpired ? '🚫' :
                  expirationInfo.isNearExpiration ? '⚠️' : '✅'}
              </span>
              <div>
                <p className="font-semibold text-gray-900">
                  {expirationInfo.isExpired ? 'EXPIRED' :
                    expirationInfo.isNearExpiration ? 'Expires Soon' : 'Fresh'}
                </p>
                <p className="text-sm text-gray-600">
                  {expirationInfo.isExpired
                    ? `Expired ${Math.abs(expirationInfo.daysRemaining)} days ago`
                    : `${expirationInfo.daysRemaining} days remaining`}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {new Date(foodItem.expiration_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Packaging Condition */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Packaging Condition *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {packagingOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSafetyData({ ...safetyData, packagingCondition: option.value })}
              disabled={mode === 'view'}
              className={`p-3 rounded-lg border-2 transition ${safetyData.packagingCondition === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className={`text-sm font-medium ${safetyData.packagingCondition === option.value
                  ? `text-${option.color}-700`
                  : 'text-gray-700'
                }`}>
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Checks */}
      {(mode === 'create' || showDetails) && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Safety Inspection Checklist</h4>
          <div className="space-y-2">
            {safetyCheckItems.map(item => (
              <label
                key={item.key}
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition ${safetyData.safetyChecks[item.key]
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={safetyData.safetyChecks[item.key]}
                  onChange={(e) => handleCheckChange(item.key, e.target.checked)}
                  disabled={mode === 'view'}
                  className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    {item.required && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Safety Notes
        </label>
        <textarea
          value={safetyData.safetyNotes}
          onChange={(e) => setSafetyData({ ...safetyData, safetyNotes: e.target.value })}
          disabled={mode === 'view'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Any special handling instructions, observations, or concerns..."
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="font-semibold text-red-900 mb-2 flex items-center">
            <span className="mr-2">⚠️</span>
            Safety Validation Failed
          </h5>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {mode === 'create' && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg font-medium transition ${allRequiredPassed && tempValid && !expirationInfo.isExpired
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            disabled={!allRequiredPassed || !tempValid || expirationInfo.isExpired}
          >
            Complete Safety Check
          </button>
        </div>
      )}

      {/* Last Checked */}
      {mode === 'view' && safetyData.lastChecked && (
        <div className="text-xs text-gray-500 text-right">
          Last safety check: {new Date(safetyData.lastChecked).toLocaleString()}
        </div>
      )}
    </div>
  );
};

window.FoodSafetyChecklist = FoodSafetyChecklist;
