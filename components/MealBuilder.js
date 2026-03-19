// MealBuilder.js - AI-powered meal planning from available food
const { React } = window;
const { useState, useEffect } = React;

// Meal suggestion templates based on common food combinations
const MEAL_TEMPLATES = {
  simple: [
    {
      name: 'Rice Bowl',
      ingredients: ['rice', 'vegetable', 'protein'],
      time: 15,
      difficulty: 'easy',
      instructions: ['Cook rice', 'Heat vegetables and protein', 'Combine in bowl', 'Season to taste']
    },
    {
      name: 'Sandwich',
      ingredients: ['bread', 'protein', 'vegetable'],
      time: 5,
      difficulty: 'easy',
      instructions: ['Toast bread if desired', 'Layer ingredients', 'Add condiments']
    },
    {
      name: 'Pasta Bowl',
      ingredients: ['pasta', 'sauce', 'vegetable'],
      time: 15,
      difficulty: 'easy',
      instructions: ['Boil pasta', 'Heat sauce with vegetables', 'Toss together']
    }
  ],
  kidFriendly: [
    {
      name: 'Mac & Cheese',
      ingredients: ['pasta', 'cheese', 'milk'],
      time: 10,
      difficulty: 'easy',
      appeal: 'Kids love cheesy pasta!'
    },
    {
      name: 'Quesadilla',
      ingredients: ['tortilla', 'cheese', 'protein'],
      time: 5,
      difficulty: 'easy',
      appeal: 'Fun finger food for kids'
    },
    {
      name: 'Fruit & Yogurt Parfait',
      ingredients: ['yogurt', 'fruit', 'granola'],
      time: 3,
      difficulty: 'easy',
      appeal: 'Sweet and nutritious'
    }
  ],
  noOven: [
    {
      name: 'Stovetop Stir-Fry',
      ingredients: ['vegetable', 'protein', 'sauce'],
      time: 15,
      difficulty: 'easy',
      method: 'stovetop'
    },
    {
      name: 'Microwave Mug Meal',
      ingredients: ['rice', 'vegetable', 'protein'],
      time: 5,
      difficulty: 'easy',
      method: 'microwave'
    },
    {
      name: 'No-Cook Wrap',
      ingredients: ['tortilla', 'protein', 'vegetable'],
      time: 5,
      difficulty: 'easy',
      method: 'no-cook'
    }
  ]
};

// Cultural recipe templates
const CULTURAL_RECIPES = {
  mexican: [
    { name: 'Bean & Rice Bowl', ingredients: ['beans', 'rice', 'salsa'], time: 15 },
    { name: 'Tacos', ingredients: ['tortilla', 'protein', 'salsa'], time: 10 },
    { name: 'Quesadilla', ingredients: ['tortilla', 'cheese'], time: 5 }
  ],
  asian: [
    { name: 'Fried Rice', ingredients: ['rice', 'vegetable', 'egg'], time: 15 },
    { name: 'Noodle Stir-Fry', ingredients: ['noodles', 'vegetable', 'sauce'], time: 15 },
    { name: 'Rice Bowl', ingredients: ['rice', 'protein', 'vegetable'], time: 15 }
  ],
  italian: [
    { name: 'Pasta with Sauce', ingredients: ['pasta', 'sauce'], time: 15 },
    { name: 'Caprese Salad', ingredients: ['tomato', 'cheese', 'basil'], time: 5 },
    { name: 'Bruschetta', ingredients: ['bread', 'tomato', 'garlic'], time: 10 }
  ],
  american: [
    { name: 'Sandwich', ingredients: ['bread', 'protein', 'cheese'], time: 5 },
    { name: 'Mac & Cheese', ingredients: ['pasta', 'cheese'], time: 10 },
    { name: 'Breakfast Bowl', ingredients: ['egg', 'bread', 'vegetable'], time: 15 }
  ],
  mediterranean: [
    { name: 'Hummus Plate', ingredients: ['chickpeas', 'bread', 'vegetable'], time: 10 },
    { name: 'Greek Salad', ingredients: ['vegetable', 'cheese', 'olive'], time: 10 },
    { name: 'Pita Wrap', ingredients: ['bread', 'protein', 'vegetable'], time: 5 }
  ]
};

// Quick meal challenge generator
function generateQuickMealChallenge(availableItems) {
  const meals = [];
  const totalTime = 60; // 60 minutes for 3 meals
  let timeLeft = totalTime;

  // Generate 3 meals under 20 minutes each, no oven
  for (let i = 0; i < 3; i++) {
    const maxTime = Math.min(20, Math.floor(timeLeft / (3 - i)));
    const meal = suggestQuickMeal(availableItems, maxTime, true);
    if (meal) {
      meals.push(meal);
      timeLeft -= meal.time;
    }
  }

  return {
    meals,
    totalTime: totalTime - timeLeft,
    challenge: '3 meals, 20 minutes each, no oven'
  };
}

// Suggest a quick meal based on available items
function suggestQuickMeal(items, maxTime = 20, noOven = true) {
  // Categorize available items
  const proteins = items.filter(item =>
    ['prepared', 'leftovers'].includes(item.category) ||
    item.title.toLowerCase().includes('meat') ||
    item.title.toLowerCase().includes('chicken') ||
    item.title.toLowerCase().includes('fish')
  );

  const vegetables = items.filter(item =>
    item.category === 'produce' ||
    item.title.toLowerCase().includes('vegetable')
  );

  const grains = items.filter(item =>
    item.category === 'packaged' ||
    item.title.toLowerCase().includes('rice') ||
    item.title.toLowerCase().includes('pasta') ||
    item.title.toLowerCase().includes('bread')
  );

  // Simple meal suggestions based on what's available
  if (grains.length > 0 && vegetables.length > 0) {
    return {
      name: 'Veggie Bowl',
      ingredients: [grains[0].title, vegetables[0].title],
      items: [grains[0], vegetables[0]],
      time: 15,
      method: noOven ? 'stovetop/microwave' : 'any',
      instructions: [
        `Prepare ${grains[0].title} according to package`,
        `Heat or prepare ${vegetables[0].title}`,
        'Combine in a bowl',
        'Season with salt, pepper, or available sauces'
      ]
    };
  }

  if (proteins.length > 0 && grains.length > 0) {
    return {
      name: 'Protein & Grain Bowl',
      ingredients: [proteins[0].title, grains[0].title],
      items: [proteins[0], grains[0]],
      time: 12,
      method: noOven ? 'stovetop/microwave' : 'any',
      instructions: [
        `Prepare ${grains[0].title}`,
        `Heat ${proteins[0].title}`,
        'Combine and enjoy'
      ]
    };
  }

  // Fallback to simple single-item meals
  if (items.length > 0) {
    return {
      name: `Simple ${items[0].title}`,
      ingredients: [items[0].title],
      items: [items[0]],
      time: 5,
      method: 'ready-to-eat',
      instructions: ['Enjoy as-is or heat if desired']
    };
  }

  return null;
}

// Main Meal Builder Component
function MealBuilder({ userLocation = null, claimedListings = [] }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [preferenceType, setPreferenceType] = useState('simple');
  const [culturalPreference, setCulturalPreference] = useState('any');
  const [quickChallengeMode, setQuickChallengeMode] = useState(false);
  const [quickChallenge, setQuickChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-populate from claimed listings if available
  useEffect(() => {
    if (claimedListings && claimedListings.length > 0) {
      setSelectedItems(claimedListings);
      generateSuggestions(claimedListings, preferenceType, culturalPreference);
    }
  }, [claimedListings]);

  const generateSuggestions = (items, type, culture) => {
    const suggestions = [];

    // Quick challenge mode
    if (quickChallengeMode) {
      const challenge = generateQuickMealChallenge(items);
      setQuickChallenge(challenge);
      return;
    }

    // Generate regular suggestions
    for (let i = 0; i < 3; i++) {
      const meal = suggestQuickMeal(items, 20, type === 'noOven');
      if (meal) suggestions.push(meal);
    }

    setMealSuggestions(suggestions);
  };

  const handleItemSelect = (item) => {
    const isSelected = selectedItems.some(i => i.id === item.id);
    const newItems = isSelected
      ? selectedItems.filter(i => i.id !== item.id)
      : [...selectedItems, item];

    setSelectedItems(newItems);
    generateSuggestions(newItems, preferenceType, culturalPreference);
  };

  const handleQuickChallenge = () => {
    setQuickChallengeMode(!quickChallengeMode);
    if (!quickChallengeMode) {
      const challenge = generateQuickMealChallenge(selectedItems);
      setQuickChallenge(challenge);
    } else {
      setQuickChallenge(null);
    }
  };

  return React.createElement('div', { className: 'meal-builder' },
    // Header
    React.createElement('div', { className: 'bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-lg' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-2' }, '🍳 AI Meal Builder'),
      React.createElement('p', { className: 'text-sm opacity-90' },
        'Turn your picked-up food into delicious meals!'
      )
    ),

    // Main Content
    React.createElement('div', { className: 'p-6 bg-white' },
      // Selected Items
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h3', { className: 'font-bold text-lg mb-3' }, 'Your Available Food'),
        selectedItems.length === 0 ?
          React.createElement('div', { className: 'text-gray-500 text-sm italic' },
            'Select items you\'ve picked up or claimed to get meal suggestions'
          ) :
          React.createElement('div', { className: 'flex flex-wrap gap-2' },
            selectedItems.map(item =>
              React.createElement('div', {
                key: item.id,
                className: 'px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2'
              },
                React.createElement('span', {}, item.title),
                React.createElement('button', {
                  onClick: () => handleItemSelect(item),
                  className: 'text-green-600 hover:text-green-800 font-bold',
                  type: 'button'
                }, '×')
              )
            )
          )
      ),

      // Preferences
      React.createElement('div', { className: 'mb-6 grid grid-cols-1 md:grid-cols-3 gap-4' },
        // Meal Type
        React.createElement('div', {},
          React.createElement('label', { className: 'block text-sm font-semibold mb-2' }, 'Meal Type'),
          React.createElement('select', {
            className: 'w-full p-2 border border-gray-300 rounded',
            value: preferenceType,
            onChange: (e) => {
              setPreferenceType(e.target.value);
              generateSuggestions(selectedItems, e.target.value, culturalPreference);
            }
          },
            React.createElement('option', { value: 'simple' }, '🍽️ Simple & Easy'),
            React.createElement('option', { value: 'kidFriendly' }, '👶 Kid-Friendly'),
            React.createElement('option', { value: 'noOven' }, '⚡ No Oven Required')
          )
        ),

        // Cultural Preference
        React.createElement('div', {},
          React.createElement('label', { className: 'block text-sm font-semibold mb-2' }, 'Cultural Style'),
          React.createElement('select', {
            className: 'w-full p-2 border border-gray-300 rounded',
            value: culturalPreference,
            onChange: (e) => {
              setCulturalPreference(e.target.value);
              generateSuggestions(selectedItems, preferenceType, e.target.value);
            }
          },
            React.createElement('option', { value: 'any' }, '🌍 Any Style'),
            React.createElement('option', { value: 'mexican' }, '🌮 Mexican'),
            React.createElement('option', { value: 'asian' }, '🍜 Asian'),
            React.createElement('option', { value: 'italian' }, '🍝 Italian'),
            React.createElement('option', { value: 'american' }, '🍔 American'),
            React.createElement('option', { value: 'mediterranean' }, '🫒 Mediterranean')
          )
        ),

        // Quick Challenge Button
        React.createElement('div', { className: 'flex items-end' },
          React.createElement('button', {
            onClick: handleQuickChallenge,
            className: `w-full p-2 rounded font-semibold ${quickChallengeMode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`,
            type: 'button'
          }, quickChallengeMode ? '🔥 Challenge Active!' : '🔥 3 Meals, 20 Min, No Oven')
        )
      ),

      // Quick Challenge Results
      quickChallenge && React.createElement('div', { className: 'mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('h3', { className: 'font-bold text-lg text-orange-900' },
            '🔥 Quick Meal Challenge'
          ),
          React.createElement('div', { className: 'text-sm font-semibold text-orange-700' },
            `Total Time: ${quickChallenge.totalTime} minutes`
          )
        ),
        React.createElement('div', { className: 'space-y-3' },
          quickChallenge.meals.map((meal, idx) =>
            React.createElement('div', {
              key: idx,
              className: 'p-3 bg-white rounded border border-orange-200'
            },
              React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                React.createElement('span', { className: 'font-bold text-orange-900' },
                  `Meal ${idx + 1}: ${meal.name}`
                ),
                React.createElement('span', { className: 'text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold' },
                  `${meal.time} min`
                )
              ),
              React.createElement('div', { className: 'text-sm text-gray-700' },
                `${meal.ingredients.join(', ')}`
              ),
              meal.instructions && React.createElement('div', { className: 'mt-2 text-xs text-gray-600' },
                React.createElement('ol', { className: 'list-decimal list-inside space-y-1' },
                  meal.instructions.map((step, i) =>
                    React.createElement('li', { key: i }, step)
                  )
                )
              )
            )
          )
        )
      ),

      // Regular Meal Suggestions
      !quickChallengeMode && mealSuggestions.length > 0 && React.createElement('div', {},
        React.createElement('h3', { className: 'font-bold text-lg mb-3' }, 'Suggested Meals'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
          mealSuggestions.map((meal, idx) =>
            React.createElement('div', {
              key: idx,
              className: 'p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer',
              onClick: () => setShowModal(meal)
            },
              React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                React.createElement('h4', { className: 'font-bold text-gray-900' }, meal.name),
                React.createElement('span', { className: 'text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold' },
                  `${meal.time} min`
                )
              ),
              React.createElement('div', { className: 'text-sm text-gray-600 mb-3' },
                meal.ingredients.join(', ')
              ),
              meal.method && React.createElement('div', { className: 'text-xs text-gray-500' },
                `Method: ${meal.method}`
              ),
              React.createElement('button', {
                className: 'mt-3 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold',
                type: 'button'
              }, 'View Recipe →')
            )
          )
        )
      ),

      // Empty State
      selectedItems.length === 0 && React.createElement('div', { className: 'text-center py-8' },
        React.createElement('div', { className: 'text-6xl mb-4' }, '🍽️'),
        React.createElement('p', { className: 'text-gray-500 mb-4' },
          'Add your claimed items to start building meals'
        ),
        React.createElement('p', { className: 'text-sm text-gray-400' },
          'The AI will suggest simple, kid-friendly, and culturally relevant recipes'
        )
      )
    ),

    // Recipe Detail Modal
    showModal && React.createElement('div', {
      className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
      onClick: () => setShowModal(false)
    },
      React.createElement('div', {
        className: 'bg-white rounded-lg max-w-2xl w-full p-6',
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { className: 'flex justify-between items-start mb-4' },
          React.createElement('h3', { className: 'text-2xl font-bold text-gray-900' }, showModal.name),
          React.createElement('button', {
            onClick: () => setShowModal(false),
            className: 'text-gray-500 hover:text-gray-700 text-2xl font-bold',
            type: 'button'
          }, '×')
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('div', { className: 'flex gap-4 text-sm mb-4' },
            React.createElement('span', { className: 'bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold' },
              `⏱️ ${showModal.time} minutes`
            ),
            showModal.method && React.createElement('span', { className: 'bg-green-100 text-green-800 px-3 py-1 rounded font-semibold' },
              showModal.method
            )
          ),
          React.createElement('h4', { className: 'font-bold mb-2' }, 'Ingredients:'),
          React.createElement('ul', { className: 'list-disc list-inside mb-4 space-y-1' },
            showModal.ingredients.map((ing, i) =>
              React.createElement('li', { key: i, className: 'text-gray-700' }, ing)
            )
          ),
          showModal.instructions && React.createElement('div', {},
            React.createElement('h4', { className: 'font-bold mb-2' }, 'Instructions:'),
            React.createElement('ol', { className: 'list-decimal list-inside space-y-2' },
              showModal.instructions.map((step, i) =>
                React.createElement('li', { key: i, className: 'text-gray-700' }, step)
              )
            )
          )
        )
      )
    )
  );
}

// Compact Meal Builder Button for Dashboard
function MealBuilderButton({ onClick }) {
  return React.createElement('button', {
    onClick,
    className: 'w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-between',
    type: 'button'
  },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('span', { className: 'text-3xl' }, '🍳'),
      React.createElement('div', { className: 'text-left' },
        React.createElement('div', { className: 'font-bold text-lg' }, 'AI Meal Builder'),
        React.createElement('div', { className: 'text-sm opacity-90' }, 'Turn your food into meals')
      )
    ),
    React.createElement('span', { className: 'text-2xl' }, '→')
  );
}

// Export components
if (typeof window !== 'undefined') {
  window.MealBuilder = MealBuilder;
  window.MealBuilderButton = MealBuilderButton;
  window.generateQuickMealChallenge = generateQuickMealChallenge;
  window.suggestQuickMeal = suggestQuickMeal;
}
