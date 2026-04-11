/**
 * Smart Meal Suggestions Component
 * AI-powered meal suggestions that prevent waste
 * Combines expiring items into quick, practical meals
 * Focuses on safety, dignity, and nutrition
 */

const SmartMealSuggestions = ({ user, claimedListings, onClose }) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMeal, setSelectedMeal] = React.useState(null);

  // Analyze claimed food and generate waste-prevention meal suggestions
  const generateMealSuggestions = React.useCallback((listings) => {
    const now = new Date();

    // Group items by urgency and type
    const expiringItems = listings
      .filter(item => {
        if (!item.expiration_date) return false;
        const expiryDate = new Date(item.expiration_date);
        const hoursUntil = (expiryDate - now) / (1000 * 60 * 60);
        return hoursUntil > 0 && hoursUntil < 72; // Expiring within 3 days
      })
      .map(item => {
        const expiryDate = new Date(item.expiration_date);
        const hoursUntil = (expiryDate - now) / (1000 * 60 * 60);
        return {
          ...item,
          hoursUntilExpiry: hoursUntil,
          urgency: hoursUntil < 24 ? 'critical' : hoursUntil < 48 ? 'high' : 'medium'
        };
      })
      .sort((a, b) => a.hoursUntilExpiry - b.hoursUntilExpiry);

    if (expiringItems.length === 0) {
      return [];
    }

    // Categorize ingredients
    const ingredients = {
      proteins: [],
      vegetables: [],
      greens: [],
      fruits: [],
      grains: [],
      dairy: [],
      bakery: [],
      prepared: []
    };

    expiringItems.forEach(item => {
      const title = item.title.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const text = `${title} ${desc}`;

      // Categorize by keywords
      if (text.match(/chicken|turkey|beef|pork|fish|salmon|tuna|meat|protein/)) {
        ingredients.proteins.push(item);
      }
      if (text.match(/lettuce|spinach|kale|arugula|greens|salad/)) {
        ingredients.greens.push(item);
      }
      if (text.match(/carrot|pepper|broccoli|tomato|onion|celery|vegetable|veggie|zucchini|squash/)) {
        ingredients.vegetables.push(item);
      }
      if (text.match(/apple|banana|berry|orange|fruit|grape|melon/)) {
        ingredients.fruits.push(item);
      }
      if (text.match(/rice|pasta|bread|tortilla|grain|quinoa|oat/)) {
        ingredients.grains.push(item);
      }
      if (text.match(/cheese|milk|yogurt|dairy|cream/)) {
        ingredients.dairy.push(item);
      }
      if (text.match(/bread|bagel|muffin|baked/)) {
        ingredients.bakery.push(item);
      }
      if (item.category === 'prepared' || item.category === 'leftovers') {
        ingredients.prepared.push(item);
      }
    });

    // Generate meal suggestions based on combinations
    const meals = [];

    // Meal Pattern 1: Protein + Greens = Quick Salad/Wrap
    if (ingredients.proteins.length > 0 && ingredients.greens.length > 0) {
      const protein = ingredients.proteins[0];
      const greens = ingredients.greens[0];
      const extras = [...ingredients.vegetables, ...ingredients.fruits].slice(0, 2);

      meals.push({
        id: 'protein_greens',
        title: 'Quick Protein Salad',
        cookTime: '10 minutes',
        difficulty: 'Easy - No cooking',
        items: [protein, greens, ...extras],
        urgency: Math.min(protein.hoursUntilExpiry, greens.hoursUntilExpiry) < 24 ? 'critical' : 'high',
        description: `Use your ${protein.title} + ${greens.title} before they expire`,
        instructions: [
          `Chop or shred the ${protein.title}`,
          `Wash and tear the ${greens.title}`,
          extras.length > 0 ? `Add chopped ${extras.map(e => e.title).join(' and ')}` : 'Add any other veggies you have',
          'Drizzle with olive oil and lemon, or any dressing',
          'Season with salt and pepper'
        ],
        nutritionFocus: 'High protein, vitamins from greens, filling and nutritious',
        safetyNote: protein.hoursUntilExpiry < 24 ? ' Use TODAY - protein expires soon' : null,
        dignityNote: 'This is a complete, restaurant-quality meal',
        alternatives: [
          'Wrap in a tortilla if you have one',
          'Serve over rice or pasta',
          'Turn into a grain bowl'
        ]
      });
    }

    // Meal Pattern 2: Protein + Vegetables = Stir Fry/Saute
    if (ingredients.proteins.length > 0 && ingredients.vegetables.length > 0) {
      const protein = ingredients.proteins[0];
      const veggies = ingredients.vegetables.slice(0, 3);

      meals.push({
        id: 'protein_veggie_stirfry',
        title: 'Quick Protein & Veggie Stir-Fry',
        cookTime: '15 minutes',
        difficulty: 'Easy - One pan',
        items: [protein, ...veggies],
        urgency: protein.hoursUntilExpiry < 24 ? 'critical' : 'high',
        description: `Prevent waste: Cook ${protein.title} + ${veggies.length} vegetables tonight`,
        instructions: [
          'Heat a large pan with oil on medium-high',
          `Cook ${protein.title} until done (cut into bite-size pieces)`,
          `Add chopped ${veggies.map(v => v.title).join(', ')}`,
          'Stir-fry for 5-7 minutes until tender',
          'Season with salt, pepper, garlic powder, or soy sauce if you have it'
        ],
        nutritionFocus: 'Complete meal with protein and 3+ vegetables',
        safetyNote: protein.hoursUntilExpiry < 24 ? ' COOK TONIGHT - expires within 24 hours' : null,
        dignityNote: 'Simple cooking that creates a proper hot meal',
        alternatives: [
          'Serve over rice if you have it',
          'Make into a wrap or sandwich',
          'Add scrambled eggs for extra protein'
        ]
      });
    }

    // Meal Pattern 3: Vegetables + Grains = Veggie Bowl
    if (ingredients.vegetables.length >= 2 && ingredients.grains.length > 0) {
      const veggies = ingredients.vegetables.slice(0, 3);
      const grain = ingredients.grains[0];

      meals.push({
        id: 'veggie_grain_bowl',
        title: 'Veggie & Grain Bowl',
        cookTime: '20 minutes',
        difficulty: 'Easy - One pot',
        items: [...veggies, grain],
        urgency: Math.min(...veggies.map(v => v.hoursUntilExpiry)) < 48 ? 'high' : 'medium',
        description: `Use ${veggies.length} vegetables + ${grain.title} expiring soon`,
        instructions: [
          `Prepare ${grain.title} according to package (or reheat if already cooked)`,
          `Chop ${veggies.map(v => v.title).join(', ')}`,
          'Saute vegetables in a pan with oil for 5-8 minutes',
          'Serve vegetables over prepared grain',
          'Top with any sauce, cheese, or seasoning you have'
        ],
        nutritionFocus: 'Fiber-rich, plant-based, very filling',
        safetyNote: veggies.some(v => v.hoursUntilExpiry < 24) ? '⏰ Use vegetables today or tomorrow' : null,
        dignityNote: 'Wholesome bowl meal - warm, satisfying, nutritious',
        alternatives: [
          'Add an egg on top for protein',
          'Mix in canned beans if you have them',
          'Make into fried rice by scrambling with the grain'
        ]
      });
    }

    // Meal Pattern 4: Greens + Vegetables = Big Salad
    if (ingredients.greens.length > 0 && (ingredients.vegetables.length > 0 || ingredients.fruits.length > 0)) {
      const greens = ingredients.greens[0];
      const toppings = [...ingredients.vegetables, ...ingredients.fruits].slice(0, 4);

      meals.push({
        id: 'big_salad',
        title: 'Big Fresh Salad',
        cookTime: '10 minutes',
        difficulty: 'Easy - No cooking',
        items: [greens, ...toppings],
        urgency: greens.hoursUntilExpiry < 48 ? 'high' : 'medium',
        description: `Use ${greens.title} + ${toppings.length} items before they wilt`,
        instructions: [
          `Wash and tear ${greens.title} into bite-size pieces`,
          `Chop ${toppings.map(t => t.title).join(', ')}`,
          'Combine in a large bowl',
          'Add any protein you have (canned tuna, beans, nuts, cheese)',
          'Dress with oil + vinegar, or lemon juice, or any dressing'
        ],
        nutritionFocus: 'Vitamins, minerals, fiber - very healthy',
        safetyNote: greens.hoursUntilExpiry < 24 ? ' Use greens today before they spoil' : null,
        dignityNote: 'Fresh, crisp, restaurant-style salad',
        alternatives: [
          'Turn into a wrap with a tortilla',
          'Add hard-boiled eggs',
          'Mix with cooked pasta for a pasta salad'
        ]
      });
    }

    // Meal Pattern 5: Bakery + Anything = Toast/Sandwich
    if (ingredients.bakery.length > 0) {
      const bread = ingredients.bakery[0];
      const fillings = [...ingredients.proteins, ...ingredients.vegetables, ...ingredients.greens].slice(0, 3);

      if (fillings.length > 0) {
        meals.push({
          id: 'bread_creation',
          title: fillings.some(f => ingredients.proteins.includes(f)) ? 'Loaded Sandwich' : 'Veggie Toast',
          cookTime: '5 minutes',
          difficulty: 'Very Easy',
          items: [bread, ...fillings],
          urgency: bread.hoursUntilExpiry < 48 ? 'high' : 'medium',
          description: `Use ${bread.title} + ${fillings.length} ingredients expiring soon`,
          instructions: [
            bread.title.toLowerCase().includes('bread') ? `Toast the ${bread.title} if desired` : `Use ${bread.title} as is`,
            `Layer with ${fillings.map(f => f.title).join(', ')}`,
            'Add condiments if you have them (mayo, mustard, oil)',
            'Season with salt and pepper',
            'Cut and serve'
          ],
          nutritionFocus: 'Quick energy, customizable nutrition',
          safetyNote: fillings.some(f => f.hoursUntilExpiry < 24 && ingredients.proteins.includes(f))
            ? ' Use protein fillings today' : null,
          dignityNote: 'Quick meal that feels normal and satisfying',
          alternatives: [
            'Make it open-face with one slice',
            'Grill/press it if you have a pan',
            'Cut into small pieces for a snack platter'
          ]
        });
      }
    }

    // Meal Pattern 6: Fruit + Dairy/Grain = Quick Breakfast
    if (ingredients.fruits.length > 0 && (ingredients.dairy.length > 0 || ingredients.grains.length > 0)) {
      const fruits = ingredients.fruits.slice(0, 2);
      const base = ingredients.dairy[0] || ingredients.grains[0];

      meals.push({
        id: 'fruit_breakfast',
        title: 'Fruit & Grain Bowl',
        cookTime: '5 minutes',
        difficulty: 'Very Easy - No cooking',
        items: [...fruits, base],
        urgency: fruits.some(f => f.hoursUntilExpiry < 48) ? 'high' : 'medium',
        description: `Use ${fruits.map(f => f.title).join(' + ')} before they go bad`,
        instructions: [
          base.title.toLowerCase().includes('yogurt') || base.title.toLowerCase().includes('dairy')
            ? `Put ${base.title} in a bowl`
            : `Prepare ${base.title} (or use cold)`,
          `Chop ${fruits.map(f => f.title).join(' and ')}`,
          'Mix together',
          'Add honey, sugar, or cinnamon if you have it',
          'Enjoy immediately'
        ],
        nutritionFocus: 'Natural sugars for energy, vitamins, easy to digest',
        safetyNote: null,
        dignityNote: 'Bright, fresh, feel-good meal',
        alternatives: [
          'Blend into a smoothie if you have a blender',
          'Layer as a parfait',
          'Eat fruits as-is for a snack'
        ]
      });
    }

    // Meal Pattern 7: Prepared/Leftovers = Just Reheat
    if (ingredients.prepared.length > 0) {
      const prepared = ingredients.prepared[0];
      const sides = [...ingredients.greens, ...ingredients.vegetables].slice(0, 2);

      meals.push({
        id: 'reheat_meal',
        title: 'Ready-to-Eat Meal',
        cookTime: '3 minutes',
        difficulty: 'Very Easy - Just reheat',
        items: [prepared, ...sides],
        urgency: prepared.hoursUntilExpiry < 24 ? 'critical' : 'high',
        description: `${prepared.title} needs to be eaten soon`,
        instructions: [
          `Reheat ${prepared.title} in microwave (2-3 min) or stovetop`,
          'Make sure it\'s steaming hot (165°F if you can check)',
          sides.length > 0 ? `Serve with fresh ${sides.map(s => s.title).join(' and ')} on the side` : 'Ready to eat!',
          'Season or add sauce if needed'
        ],
        nutritionFocus: 'Complete meal, already prepared',
        safetyNote: prepared.hoursUntilExpiry < 24
          ? ' HEAT THOROUGHLY - prepared food must reach 165°F'
          : ' Reheat until steaming hot throughout',
        dignityNote: 'Full meal with minimal effort',
        alternatives: [
          'Eat cold if it\'s meant to be (like pasta salad)',
          'Add to rice or noodles to stretch it',
          'Top with cheese and re-bake if oven-safe'
        ]
      });
    }

    // Sort by urgency and remove duplicates
    const uniqueMeals = meals
      .filter((meal, index, self) =>
        index === self.findIndex(m => m.id === meal.id)
      )
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });

    return uniqueMeals.slice(0, 5); // Top 5 suggestions
  }, []);

  // Load suggestions on mount
  React.useEffect(() => {
    if (!claimedListings || claimedListings.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const meals = generateMealSuggestions(claimedListings);
      setSuggestions(meals);
      setLoading(false);
    }, 500);
  }, [claimedListings, generateMealSuggestions]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse"></div>
            <p className="text-gray-600">Finding meals to prevent waste...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMeal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-2xl w-full my-8">
          {/* Header */}
          <div className={`p-6 rounded-t-lg text-white ${selectedMeal.urgency === 'critical' ? 'bg-gradient-to-r from-red-600 to-orange-600' :
              selectedMeal.urgency === 'high' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                'bg-gradient-to-r from-green-500 to-blue-500'
            }`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedMeal.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span>⏱ {selectedMeal.cookTime}</span>
                  <span> {selectedMeal.difficulty}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Why This Meal */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="font-bold mb-1"> Why This Meal:</div>
              <div className="text-sm">{selectedMeal.description}</div>
            </div>

            {/* Safety Note */}
            {selectedMeal.safetyNote && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="font-bold text-red-900 mb-1"> Food Safety:</div>
                <div className="text-sm text-red-800">{selectedMeal.safetyNote}</div>
              </div>
            )}

            {/* Using These Items */}
            <div>
              <h3 className="font-bold mb-3"> Using These Items:</h3>
              <div className="space-y-2">
                {selectedMeal.items.map(item => {
                  const hoursLeft = item.hoursUntilExpiry;
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.qty} {item.unit}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${hoursLeft < 24 ? 'bg-red-100 text-red-700' :
                          hoursLeft < 48 ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {hoursLeft < 24 ? 'Use today' :
                          hoursLeft < 48 ? 'Use tomorrow' :
                            `${Math.round(hoursLeft / 24)} days left`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-bold mb-3"> Simple Steps:</h3>
              <ol className="space-y-2">
                {selectedMeal.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Nutrition Focus */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="font-bold text-green-900 mb-1"> Nutrition:</div>
              <div className="text-sm text-green-800">{selectedMeal.nutritionFocus}</div>
            </div>

            {/* Dignity Note */}
            {selectedMeal.dignityNote && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <div className="font-bold text-purple-900 mb-1"> Note:</div>
                <div className="text-sm text-purple-800">{selectedMeal.dignityNote}</div>
              </div>
            )}

            {/* Alternatives */}
            <div>
              <h3 className="font-bold mb-2"> Other Ways to Make This:</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {selectedMeal.alternatives.map((alt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  // Mark items as "planned to use"
                  selectedMeal.items.forEach(item => {
                    localStorage.setItem(`meal_planned_${item.id}`, JSON.stringify({
                      meal: selectedMeal.title,
                      timestamp: new Date().toISOString()
                    }));
                  });
                  setSelectedMeal(null);
                }}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                 I'll Make This
              </button>
              <button
                onClick={() => setSelectedMeal(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2"> Smart Meal Suggestions</h2>
              <p className="text-sm opacity-90">
                Prevent waste with quick meals using your expiring items
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Nothing Expiring Soon!</h3>
              <p className="text-gray-600">
                Your claimed items are still fresh. We'll suggest meals when items need to be used.
              </p>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl"></span>
                  <div>
                    <div className="font-bold text-blue-900 mb-1">
                      These meals prevent waste AND provide nutrition
                    </div>
                    <div className="text-sm text-blue-800">
                      Each suggestion uses items expiring soon, with simple steps anyone can follow.
                      No fancy ingredients needed - just what you already have.
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal Suggestions */}
              <div className="space-y-4">
                {suggestions.map((meal, index) => (
                  <div
                    key={meal.id}
                    className={`border-2 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${meal.urgency === 'critical' ? 'border-red-500 bg-red-50' :
                        meal.urgency === 'high' ? 'border-orange-500 bg-orange-50' :
                          'border-yellow-500 bg-yellow-50'
                      }`}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {meal.urgency === 'critical' && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                              USE TODAY
                            </span>
                          )}
                          {meal.urgency === 'high' && (
                            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded font-bold">
                              USE SOON
                            </span>
                          )}
                          <span className="text-gray-600 text-sm">#{index + 1}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{meal.title}</h3>
                        <p className="text-sm text-gray-700 mb-3">{meal.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>⏱ {meal.cookTime}</span>
                          <span> {meal.difficulty}</span>
                          <span> Uses {meal.items.length} items</span>
                        </div>
                      </div>
                      <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
                        See Recipe →
                      </button>
                    </div>

                    {/* Preview of items */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-300">
                      {meal.items.slice(0, 4).map(item => (
                        <span
                          key={item.id}
                          className="text-xs bg-white px-2 py-1 rounded border border-gray-300"
                        >
                          {item.title}
                        </span>
                      ))}
                      {meal.items.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{meal.items.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Info */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <div className="font-semibold mb-2"> Why These Suggestions:</div>
                <ul className="space-y-1">
                  <li>• <strong>Safety First:</strong> Items are safe to eat now, but need to be used soon</li>
                  <li>• <strong>Dignity:</strong> Real meals, not survival food - these are normal, satisfying dishes</li>
                  <li>• <strong>Nutrition:</strong> Balanced combinations that fuel your body</li>
                  <li>• <strong>Zero Waste:</strong> Use food before it spoils, save money, help planet</li>
                  <li>• <strong>Simple:</strong> 5-20 minute meals with basic cooking or no cooking at all</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Expose component globally
window.SmartMealSuggestions = SmartMealSuggestions;
