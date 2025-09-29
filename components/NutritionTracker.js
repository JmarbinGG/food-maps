function NutritionTracker({ user, onClose }) {
  const [nutritionData, setNutritionData] = React.useState({
    daily_calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    vitamins: {},
    water_intake: 0
  });
  const [weeklyData, setWeeklyData] = React.useState([]);
  const [nutritionGoals, setNutritionGoals] = React.useState({
    calories: 2000,
    protein: 150,
    fiber: 25,
    water: 8
  });
  const [showAddMeal, setShowAddMeal] = React.useState(false);

  React.useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = () => {
    // Mock nutrition data
    setNutritionData({
      daily_calories: 1650,
      protein: 85,
      carbs: 200,
      fat: 55,
      fiber: 18,
      vitamins: { A: 80, C: 120, D: 60, B12: 90 },
      water_intake: 6
    });

    setWeeklyData([
      { day: 'Mon', calories: 1800, protein: 95, fiber: 22 },
      { day: 'Tue', calories: 1650, protein: 85, fiber: 18 },
      { day: 'Wed', calories: 1900, protein: 110, fiber: 25 },
      { day: 'Thu', calories: 1750, protein: 90, fiber: 20 },
      { day: 'Fri', calories: 2100, protein: 125, fiber: 28 },
      { day: 'Sat', calories: 1950, protein: 100, fiber: 24 },
      { day: 'Sun', calories: 1850, protein: 95, fiber: 21 }
    ]);
  };

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNutritionAdvice = () => {
    const advice = [];
    
    if (nutritionData.daily_calories < nutritionGoals.calories * 0.8) {
      advice.push("💡 You're under your calorie goal. Try adding healthy snacks.");
    }
    
    if (nutritionData.protein < nutritionGoals.protein * 0.8) {
      advice.push("🥩 Consider adding more protein sources like beans, eggs, or fish.");
    }
    
    if (nutritionData.fiber < nutritionGoals.fiber * 0.8) {
      advice.push("🌾 Include more fruits, vegetables, and whole grains for fiber.");
    }
    
    if (nutritionData.water_intake < nutritionGoals.water * 0.8) {
      advice.push("💧 Don't forget to drink more water throughout the day.");
    }

    return advice;
  };

  try {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="icon-heart text-blue-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">Nutrition Tracker</h1>
                <p className="text-blue-600">Monitor your health and dietary intake</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Daily Progress */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Today's Progress</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{nutritionData.daily_calories}</div>
                  <div className="text-sm text-gray-500">/ {nutritionGoals.calories} calories</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nutritionData.daily_calories, nutritionGoals.calories)}`}
                      style={{ width: `${Math.min((nutritionData.daily_calories / nutritionGoals.calories) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{nutritionData.protein}g</div>
                  <div className="text-sm text-gray-500">/ {nutritionGoals.protein}g protein</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nutritionData.protein, nutritionGoals.protein)}`}
                      style={{ width: `${Math.min((nutritionData.protein / nutritionGoals.protein) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{nutritionData.fiber}g</div>
                  <div className="text-sm text-gray-500">/ {nutritionGoals.fiber}g fiber</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nutritionData.fiber, nutritionGoals.fiber)}`}
                      style={{ width: `${Math.min((nutritionData.fiber / nutritionGoals.fiber) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">{nutritionData.water_intake}</div>
                  <div className="text-sm text-gray-500">/ {nutritionGoals.water} glasses</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(nutritionData.water_intake, nutritionGoals.water)}`}
                      style={{ width: `${Math.min((nutritionData.water_intake / nutritionGoals.water) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Macronutrients Breakdown */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Macronutrients</h3>
                <div className="flex space-x-4">
                  <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{nutritionData.carbs}g</div>
                    <div className="text-sm text-blue-800">Carbs</div>
                  </div>
                  <div className="flex-1 bg-red-100 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-600">{nutritionData.fat}g</div>
                    <div className="text-sm text-red-800">Fat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Advice */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Daily Advice</h2>
              
              <div className="space-y-3">
                {getNutritionAdvice().map((advice, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">{advice}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowAddMeal(true)}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Meal
              </button>
            </div>
          </div>

          {/* Vitamin Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Vitamin Status</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(nutritionData.vitamins).map(([vitamin, percentage]) => (
                <div key={vitamin} className="text-center">
                  <div className={`text-2xl font-bold ${percentage >= 100 ? 'text-green-600' : percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Vitamin {vitamin}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${percentage >= 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('NutritionTracker component error:', error);
    return null;
  }
}