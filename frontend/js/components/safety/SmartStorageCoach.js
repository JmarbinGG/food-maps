/**
 * Smart Storage Coach Component
 * AI-powered storage guidance for food items
 * Provides personalized advice on how to store food safely
 */

const SmartStorageCoach = ({ listing, onClose }) => {
  const [storageAdvice, setStorageAdvice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [customFood, setCustomFood] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // Comprehensive storage knowledge base
  const storageDatabase = {
    // Produce
    produce: {
      icon: '',
      storage: 'refrigerator',
      temperature: '32-40°F (0-4°C)',
      location: 'crisper drawer',
      bestWithin: '3-7 days',
      canFreeze: false,
      freezeAdvice: 'Most fresh produce loses texture when frozen. Blanch vegetables before freezing.',
      tips: [
        'Store in perforated plastic bags to maintain humidity',
        'Keep away from ethylene-producing fruits (apples, bananas)',
        'Wash only before eating to prevent premature spoilage',
        'Remove any damaged pieces to prevent spread'
      ],
      warnings: ['Do not wash before storing', 'Check daily for spoilage']
    },

    // Prepared meals
    prepared: {
      icon: '',
      storage: 'refrigerator',
      temperature: '40°F (4°C) or below',
      location: 'main shelf',
      bestWithin: '2-3 days',
      canFreeze: true,
      freezeAdvice: 'Cool completely before freezing. Use within 2-3 months. Reheat to 165°F.',
      tips: [
        'Store in airtight containers to prevent odor absorption',
        'Label with pickup date and consume-by date',
        'Reheat to 165°F (74°C) before eating',
        'Divide large portions into smaller containers for faster cooling'
      ],
      warnings: ['Never leave at room temperature >2 hours', 'Smell and inspect before eating']
    },

    // Bakery items
    bakery: {
      icon: '',
      storage: 'counter or freezer',
      temperature: 'room temperature or 0°F (-18°C)',
      location: 'bread box or freezer bag',
      bestWithin: '2-3 days (counter), 3 months (frozen)',
      canFreeze: true,
      freezeAdvice: 'Slice before freezing for easy single-serve portions. Wrap tightly in foil.',
      tips: [
        'Store at room temperature in paper bag or bread box',
        'DO NOT refrigerate bread - it goes stale faster',
        'Freeze if not eating within 2-3 days',
        'Toast frozen bread directly from freezer'
      ],
      warnings: ['Refrigerating bread makes it stale', 'Check for mold before eating']
    },

    // Packaged foods
    packaged: {
      icon: '',
      storage: 'pantry or refrigerator',
      temperature: 'room temperature or 40°F (4°C)',
      location: 'depends on package',
      bestWithin: 'check label',
      canFreeze: 'depends on item',
      freezeAdvice: 'Follow package instructions. Most canned goods should not be frozen.',
      tips: [
        'Check "best by" or expiration date on package',
        'Follow package storage instructions',
        'Once opened, transfer to airtight container',
        'Refrigerate after opening if label indicates'
      ],
      warnings: ['Discard if package is damaged or swollen', 'Follow label instructions']
    },

    // Fruit
    fruit: {
      icon: '',
      storage: 'counter or refrigerator',
      temperature: 'room temp for ripening, then 40°F (4°C)',
      location: 'fruit bowl or crisper drawer',
      bestWithin: '3-7 days',
      canFreeze: true,
      freezeAdvice: 'Wash, dry, and slice before freezing. Great for smoothies.',
      tips: [
        'Ripen at room temperature, then refrigerate',
        'Keep bananas, tomatoes at room temp',
        'Berries: refrigerate immediately in original container',
        'Apples emit ethylene - store separately'
      ],
      warnings: ['Separate ethylene producers from sensitive produce', 'Rinse before eating']
    },

    // Leftovers
    leftovers: {
      icon: '',
      storage: 'refrigerator',
      temperature: '40°F (4°C) or below',
      location: 'main shelf',
      bestWithin: '3-4 days',
      canFreeze: true,
      freezeAdvice: 'Cool to room temp first. Freeze within 2 days. Use within 3 months.',
      tips: [
        'Store in shallow containers for quick cooling',
        'Label with date received',
        'Reheat to 165°F (74°C)',
        'Use "first in, first out" method'
      ],
      warnings: ['Discard if >4 days old', 'When in doubt, throw it out']
    },

    // Water
    water: {
      icon: '',
      storage: 'pantry or refrigerator',
      temperature: 'room temperature or chilled',
      location: 'any shelf',
      bestWithin: 'unopened: years, opened: 3-5 days',
      canFreeze: false,
      freezeAdvice: 'Water can be frozen but bottles may crack. Leave space for expansion.',
      tips: [
        'Unopened bottles are shelf-stable',
        'Once opened, refrigerate and use within 3-5 days',
        'Store away from direct sunlight',
        'Keep away from chemicals or strong odors'
      ],
      warnings: ['Discard if bottle is damaged', 'Do not reuse single-use bottles']
    }
  };

  // Specific food items knowledge base
  const specificFoods = {
    // Vegetables
    'lettuce': { category: 'produce', bestWithin: '3-5 days', special: 'Wrap in paper towel, store in plastic bag' },
    'spinach': { category: 'produce', bestWithin: '3-5 days', special: 'Keep in original container, do not wash until use' },
    'carrots': { category: 'produce', bestWithin: '2-3 weeks', special: 'Remove greens, store in water in fridge' },
    'tomatoes': { category: 'fruit', storage: 'counter', bestWithin: '5-7 days', special: 'NEVER refrigerate - loses flavor' },
    'potatoes': { category: 'produce', storage: 'pantry', bestWithin: '2-3 weeks', special: 'Store in cool, dark place. NOT in fridge' },
    'onions': { category: 'produce', storage: 'pantry', bestWithin: '1-2 months', special: 'Store in mesh bag, away from potatoes' },
    'bell peppers': { category: 'produce', bestWithin: '5-7 days', special: 'Store in crisper drawer' },
    'cucumbers': { category: 'produce', bestWithin: '4-6 days', special: 'Wrap in paper towel to absorb moisture' },

    // Fruits
    'bananas': { category: 'fruit', storage: 'counter', bestWithin: '3-5 days', special: 'Separate from other fruit to slow ripening' },
    'apples': { category: 'fruit', bestWithin: '3 weeks (fridge)', special: 'Refrigerate for longer storage' },
    'berries': { category: 'fruit', bestWithin: '3-5 days', special: 'Do not wash until ready to eat' },
    'oranges': { category: 'fruit', storage: 'counter', bestWithin: '1-2 weeks', special: 'Room temp for best flavor' },
    'grapes': { category: 'fruit', bestWithin: '5-7 days', special: 'Keep in original bag in fridge' },
    'strawberries': { category: 'fruit', bestWithin: '3-5 days', special: 'Leave stems on, wash before eating' },

    // Dairy
    'milk': { category: 'packaged', storage: 'refrigerator', bestWithin: '7 days after opening', special: 'Keep at 40°F or below' },
    'cheese': { category: 'packaged', bestWithin: '2-4 weeks', canFreeze: true, special: 'Wrap tightly to prevent drying' },
    'yogurt': { category: 'packaged', bestWithin: '7-10 days', special: 'Check for separation or mold' },

    // Meat & Protein
    'chicken': { category: 'prepared', bestWithin: '1-2 days (raw), 3-4 days (cooked)', canFreeze: true, special: 'Store on bottom shelf to prevent drips' },
    'beef': { category: 'prepared', bestWithin: '3-5 days (raw), 3-4 days (cooked)', canFreeze: true, special: 'Freeze if not using within 2 days' },
    'fish': { category: 'prepared', bestWithin: '1-2 days', canFreeze: true, special: 'Store in coldest part of fridge, use quickly' },
    'eggs': { category: 'packaged', bestWithin: '3-5 weeks', special: 'Keep in original carton, not door' },

    // Bread
    'bread': { category: 'bakery', bestWithin: '2-3 days (counter), 3 months (frozen)', special: 'NEVER refrigerate bread' },
    'bagels': { category: 'bakery', bestWithin: '2-3 days (counter), 6 months (frozen)', special: 'Freeze extras immediately' },
    'muffins': { category: 'bakery', bestWithin: '2-3 days', canFreeze: true, special: 'Store in airtight container' },

    // Prepared items
    'pizza': { category: 'leftovers', bestWithin: '3-4 days', canFreeze: true, special: 'Separate slices with parchment when freezing' },
    'soup': { category: 'leftovers', bestWithin: '3-4 days', canFreeze: true, special: 'Cool before refrigerating, freeze in portions' },
    'rice': { category: 'leftovers', bestWithin: '3-4 days', canFreeze: true, special: 'Cool quickly, store in shallow container' },
    'pasta': { category: 'leftovers', bestWithin: '3-5 days', canFreeze: true, special: 'Toss with oil to prevent sticking' }
  };

  // AI analysis function
  const analyzeFood = React.useCallback((foodItem) => {
    const title = foodItem.title?.toLowerCase() || '';
    const description = foodItem.description?.toLowerCase() || '';
    const category = foodItem.category?.toLowerCase() || 'packaged';

    // Check for specific food matches
    let specificMatch = null;
    for (const [food, data] of Object.entries(specificFoods)) {
      if (title.includes(food) || description.includes(food)) {
        specificMatch = { name: food, ...data };
        break;
      }
    }

    // Get category-level advice
    const categoryAdvice = storageDatabase[category] || storageDatabase.packaged;

    // Combine specific and category advice
    const advice = {
      ...categoryAdvice,
      itemName: foodItem.title,
      category: category,
      specificMatch: specificMatch,
      perishability: foodItem.perishability,
      expirationDate: foodItem.expiration_date,
      quantity: foodItem.qty,
      unit: foodItem.unit
    };

    // Add perishability-specific warnings
    if (foodItem.perishability === 'high') {
      advice.urgency = 'HIGH';
      advice.urgencyMessage = ' HIGHLY PERISHABLE - Use within 1-2 days';
    } else if (foodItem.perishability === 'medium') {
      advice.urgency = 'MEDIUM';
      advice.urgencyMessage = ' MODERATELY PERISHABLE - Use within 3-5 days';
    } else {
      advice.urgency = 'LOW';
      advice.urgencyMessage = ' STABLE - Can store for longer period';
    }

    // Calculate days until expiration
    if (foodItem.expiration_date) {
      const expiryDate = new Date(foodItem.expiration_date);
      const today = new Date();
      const daysUntil = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      advice.daysUntilExpiry = daysUntil;

      if (daysUntil <= 0) {
        advice.expiryWarning = ' EXPIRED - Do not consume';
      } else if (daysUntil <= 1) {
        advice.expiryWarning = ' EXPIRES TODAY - Use immediately';
      } else if (daysUntil <= 2) {
        advice.expiryWarning = ' Expires in ' + daysUntil + ' days - Use soon';
      } else {
        advice.expiryWarning = ' Expires in ' + daysUntil + ' days';
      }
    }

    return advice;
  }, []);

  // Load advice on mount or when listing changes
  React.useEffect(() => {
    if (listing) {
      setLoading(true);
      // Simulate AI processing
      setTimeout(() => {
        const advice = analyzeFood(listing);
        setStorageAdvice(advice);
        setLoading(false);
      }, 500);
    }
  }, [listing, analyzeFood]);

  // Handle custom food lookup
  const handleCustomLookup = () => {
    if (!customFood.trim()) return;

    setLoading(true);
    const mockListing = {
      title: customFood,
      description: '',
      category: 'packaged',
      perishability: 'medium'
    };

    setTimeout(() => {
      const advice = analyzeFood(mockListing);
      setStorageAdvice(advice);
      setLoading(false);
      setShowCustomInput(false);
      setCustomFood('');
    }, 500);
  };

  if (!storageAdvice && !showCustomInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold mb-4">Smart Storage Coach</h2>
            <p className="text-gray-600 mb-6">
              Get AI-powered storage guidance for your food items
            </p>
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Look Up Food Storage
            </button>
            <button
              onClick={onClose}
              className="w-full mt-3 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCustomInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4"> What food do you have?</h2>
          <input
            type="text"
            value={customFood}
            onChange={(e) => setCustomFood(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomLookup()}
            placeholder="e.g., lettuce, bread, chicken..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-lg"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleCustomLookup}
              disabled={!customFood.trim()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            >
              Get Storage Advice
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomFood('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse"></div>
            <p className="text-gray-600">Analyzing storage requirements...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-5xl mb-3">{storageAdvice.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{storageAdvice.itemName}</h2>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {storageAdvice.category}
                    </span>
                    {storageAdvice.quantity && (
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        {storageAdvice.quantity} {storageAdvice.unit}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Main Storage Instructions */}
            <div className="p-6 space-y-6">
              {/* Urgency Alert */}
              {storageAdvice.expiryWarning && (
                <div className={`p-4 rounded-lg font-semibold ${storageAdvice.daysUntilExpiry <= 0 ? 'bg-red-100 text-red-800' :
                    storageAdvice.daysUntilExpiry <= 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                  }`}>
                  {storageAdvice.expiryWarning}
                </div>
              )}

              {storageAdvice.urgencyMessage && (
                <div className={`p-4 rounded-lg font-semibold ${storageAdvice.urgency === 'HIGH' ? 'bg-red-50 text-red-700' :
                    storageAdvice.urgency === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                  }`}>
                  {storageAdvice.urgencyMessage}
                </div>
              )}

              {/* Primary Storage Instruction */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-xl font-bold mb-4 text-blue-900"> How to Store</h3>
                <div className="space-y-3 text-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <div className="font-bold text-blue-900">Location</div>
                      <div className="text-gray-700 capitalize">{storageAdvice.storage} - {storageAdvice.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <div className="font-bold text-blue-900">Temperature</div>
                      <div className="text-gray-700">{storageAdvice.temperature}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <div className="font-bold text-blue-900">Best Within</div>
                      <div className="text-gray-700">{storageAdvice.specificMatch?.bestWithin || storageAdvice.bestWithin}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specific Food Advice */}
              {storageAdvice.specificMatch?.special && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2">
                    <span className="text-xl"></span>
                    <div>
                      <div className="font-bold text-purple-900 mb-1">Special Tip</div>
                      <div className="text-purple-800">{storageAdvice.specificMatch.special}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Freezing Guidance */}
              <div className={`p-4 rounded-lg border-2 ${storageAdvice.canFreeze ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl"></span>
                  <div className="flex-1">
                    <div className="font-bold mb-1">
                      {storageAdvice.canFreeze ? ' Can Freeze' : ' Do Not Freeze'}
                    </div>
                    <div className="text-sm text-gray-700">{storageAdvice.freezeAdvice}</div>
                  </div>
                </div>
              </div>

              {/* Storage Tips */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg"> Storage Tips</h3>
                <ul className="space-y-2">
                  {storageAdvice.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-bold mt-0.5"></span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <span></span> Important Warnings
                </h3>
                <ul className="space-y-1">
                  {storageAdvice.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Look Up Another Food
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Got It!
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Compact trigger button component
const StorageCoachButton = ({ listing, compact = false }) => {
  const [showCoach, setShowCoach] = React.useState(false);

  const handleOpenCoach = React.useCallback((event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setShowCoach(true);
  }, []);

  if (compact) {
    return (
      <>
        <button
          onClick={handleOpenCoach}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          title="Get storage advice"
        >
          <span></span>
          <span>Storage Tips</span>
        </button>
        {showCoach && (
          <SmartStorageCoach
            listing={listing}
            onClose={() => setShowCoach(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenCoach}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
      >
        <span className="text-xl"></span>
        <span>Get Smart Storage Advice</span>
      </button>
      {showCoach && (
        <SmartStorageCoach
          listing={listing}
          onClose={() => setShowCoach(false)}
        />
      )}
    </>
  );
};

// Expose components globally
window.SmartStorageCoach = SmartStorageCoach;
window.StorageCoachButton = StorageCoachButton;
