function ConsumptionTracker({ user, onClose }) {
  const [consumptionLogs, setConsumptionLogs] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    food_name: '',
    category: 'produce',
    qty_consumed: '',
    unit: 'lbs',
    source_type: 'donation',
    waste_amount: 0,
    notes: ''
  });

  React.useEffect(() => {
    loadConsumptionHistory();
  }, []);

  const loadConsumptionHistory = async () => {
    try {
      const logs = await window.consumptionAPI.getConsumptionHistory(30);
      setConsumptionLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error('Error loading consumption history:', error);
      // Set empty array as fallback
      setConsumptionLogs([]);
    }
  };

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    try {
      const result = await window.consumptionAPI.logConsumption(formData);
      if (result) {
        setShowAddForm(false);
        setFormData({
          food_name: '',
          category: 'produce',
          qty_consumed: '',
          unit: 'lbs',
          source_type: 'donation',
          waste_amount: 0,
          notes: ''
        });
        await loadConsumptionHistory();
        alert('Consumption logged successfully!');
      }
    } catch (error) {
      console.error('Error logging consumption:', error);
      alert('Failed to log consumption. Please try again.');
    }
  };

  const sourceTypeOptions = [
    { value: 'donation', label: 'Food Bank Donation' },
    { value: 'own_harvest', label: 'Own Garden/Tree' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'leftover', label: 'Home Leftovers' }
  ];

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Food Consumption Tracker</h1>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                <div className="icon-plus mr-2"></div>
                Log Consumption
              </button>
              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Log Food Consumption</h2>
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.food_name}
                    onChange={(e) => setFormData(prev => ({...prev, food_name: e.target.value}))}
                    placeholder="Food name (e.g., Apples, Leftover pasta)"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="produce">Fresh Produce</option>
                    <option value="fruit">Fruit</option>
                    <option value="prepared">Prepared Meals</option>
                    <option value="leftovers">Leftovers</option>
                    <option value="packaged">Packaged Foods</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.qty_consumed}
                    onChange={(e) => setFormData(prev => ({...prev, qty_consumed: parseFloat(e.target.value)}))}
                    placeholder="Quantity"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="lbs">Pounds</option>
                    <option value="kg">Kilograms</option>
                    <option value="items">Items</option>
                    <option value="servings">Servings</option>
                    <option value="cups">Cups</option>
                  </select>
                  <select
                    value={formData.source_type}
                    onChange={(e) => setFormData(prev => ({...prev, source_type: e.target.value}))}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    {sourceTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Notes (optional)"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={2}
                />

                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary">
                    Log Consumption
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Consumption (Last 30 days)</h2>
            </div>
            
            <div className="p-6">
              {consumptionLogs.length > 0 ? (
                <div className="space-y-3">
                  {consumptionLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{log.food_name}</h4>
                        <p className="text-sm text-gray-600">
                          {log.qty_consumed} {log.unit} • {log.source_type.replace('_', ' ')} • {new Date(log.consumption_date).toLocaleDateString()}
                        </p>
                        {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {log.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="icon-utensils text-3xl text-gray-400 mb-2"></div>
                  <p className="text-gray-500">No consumption logs yet</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary mt-4"
                  >
                    Start Tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ConsumptionTracker component error:', error);
    return null;
  }
}
