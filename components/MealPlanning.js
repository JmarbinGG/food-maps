function MealPlanning({ user, onClose }) {
  const [mealPlan, setMealPlan] = React.useState({});
  const [budgetGoal, setBudgetGoal] = React.useState(50);
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState([]);
  const [householdSize, setHouseholdSize] = React.useState(1);
  const [showPlanner, setShowPlanner] = React.useState(false);

  React.useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = () => {
    setMealPlan({
      Monday: {
        breakfast: 'Oatmeal with banana',
        lunch: 'Vegetable soup + bread',
        dinner: 'Rice and beans',
        cost: 8.50
      },
      Tuesday: {
        breakfast: 'Toast with peanut butter',
        lunch: 'Pasta salad',
        dinner: 'Chicken stir-fry',
        cost: 12.25
      },
      Wednesday: {
        breakfast: 'Scrambled eggs',
        lunch: 'Leftover stir-fry',
        dinner: 'Lentil curry + rice',
        cost: 9.75
      }
    });
  };

  const generateMealPlan = async () => {
    setShowPlanner(true);
    
    // Mock AI meal planning
    setTimeout(() => {
      const newPlan = {
        Monday: {
          breakfast: 'Banana smoothie',
          lunch: 'Bean and rice bowl',
          dinner: 'Vegetable pasta',
          cost: 7.80
        },
        Tuesday: {
          breakfast: 'Yogurt with fruit',
          lunch: 'Tuna sandwich',
          dinner: 'Chicken and vegetables',
          cost: 11.50
        }
      };
      
      setMealPlan(newPlan);
      setShowPlanner(false);
      alert('New meal plan generated based on your preferences!');
    }, 2000);
  };

  const weekTotal = Object.values(mealPlan).reduce((sum, day) => sum + (day.cost || 0), 0);
  const isOverBudget = weekTotal > budgetGoal;

  const restrictionOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'
  ];

  try {
    return (
      <div className="min-h-screen bg-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="icon-calendar text-purple-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Smart Meal Planning</h1>
                <p className="text-purple-600">Optimize nutrition within your budget</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meal Plan Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Planning Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weekly Budget ($)</label>
                  <input
                    type="number"
                    value={budgetGoal}
                    onChange={(e) => setBudgetGoal(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Household Size</label>
                  <input
                    type="number"
                    min="1"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                  <div className="space-y-2">
                    {restrictionOptions.map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={dietaryRestrictions.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDietaryRestrictions([...dietaryRestrictions, option]);
                            } else {
                              setDietaryRestrictions(dietaryRestrictions.filter(r => r !== option));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={generateMealPlan}
                  disabled={showPlanner}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {showPlanner ? 'Generating...' : '🤖 Generate AI Meal Plan'}
                </button>
              </div>
            </div>

            {/* Weekly Meal Plan */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">This Week's Plan</h2>
                <div className="text-right">
                  <div className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    ${weekTotal.toFixed(2)} / ${budgetGoal}
                  </div>
                  <div className="text-sm text-gray-500">Weekly total</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(mealPlan).map(([day, meals]) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{day}</h3>
                      <span className="text-sm text-gray-600">${meals.cost?.toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Breakfast</div>
                        <div className="text-sm">{meals.breakfast}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Lunch</div>
                        <div className="text-sm">{meals.lunch}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Dinner</div>
                        <div className="text-sm">{meals.dinner}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(mealPlan).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="icon-calendar text-3xl mb-2"></div>
                  <p>Generate your first meal plan to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('MealPlanning component error:', error);
    return null;
  }
}