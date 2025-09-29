function FoodRescueNetwork({ user, onClose }) {
  const [rescueRequests, setRescueRequests] = React.useState([]);
  const [wasteAlerts, setWasteAlerts] = React.useState([]);
  const [showCreateAlert, setShowCreateAlert] = React.useState(false);
  const [alertForm, setAlertForm] = React.useState({
    food_type: 'prepared',
    quantity: '',
    expiry_time: '',
    location: '',
    urgency: 'medium'
  });

  React.useEffect(() => {
    loadRescueData();
  }, []);

  const loadRescueData = () => {
    setRescueRequests([
      {
        id: 'rescue1',
        restaurant: 'Pizza Palace',
        food_type: 'prepared',
        quantity: '50 slices',
        expires_in: '2 hours',
        status: 'available',
        location: 'Downtown',
        created_at: '2025-01-09T16:00:00Z'
      },
      {
        id: 'rescue2',
        restaurant: 'Green Grocers',
        food_type: 'produce',
        quantity: '20 lbs vegetables',
        expires_in: '6 hours',
        status: 'claimed',
        location: 'Midtown',
        created_at: '2025-01-09T14:30:00Z'
      }
    ]);

    setWasteAlerts([
      {
        id: 'alert1',
        type: 'expiry_warning',
        message: '15 items expiring in next 2 hours',
        severity: 'high',
        count: 15
      },
      {
        id: 'alert2',
        type: 'surplus_detected',
        message: '3 restaurants have excess food',
        severity: 'medium',
        count: 3
      }
    ]);
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const newAlert = {
        ...alertForm,
        id: Date.now().toString(),
        status: 'urgent',
        created_at: new Date().toISOString()
      };
      
      alert('Food rescue alert created! Volunteers will be notified.');
      setShowCreateAlert(false);
      setAlertForm({
        food_type: 'prepared',
        quantity: '',
        expiry_time: '',
        location: '',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('Error creating rescue alert:', error);
    }
  };

  try {
    return (
      <div className="min-h-screen bg-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="icon-recycle text-orange-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-800">Food Rescue Network</h1>
                <p className="text-orange-600">Preventing waste, saving surplus food</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCreateAlert(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Report Surplus
              </button>
              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Waste Prevention Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">12.5K</div>
              <div className="text-sm text-gray-600">Lbs Rescued</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">$8,200</div>
              <div className="text-sm text-gray-600">Value Saved</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Active Rescuers</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Rescue Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Active Rescue Requests</h2>
              
              <div className="space-y-3">
                {rescueRequests.map(request => (
                  <div key={request.id} className="border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{request.restaurant}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'available' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">{request.quantity}</p>
                    <p className="text-sm text-gray-600">📍 {request.location}</p>
                    <p className="text-xs text-red-600 font-medium">⏰ Expires in {request.expires_in}</p>
                    
                    {request.status === 'available' && (
                      <button className="mt-2 bg-orange-600 text-white px-3 py-1 text-sm rounded hover:bg-orange-700">
                        Accept Rescue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Waste Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Waste Prevention Alerts</h2>
              
              <div className="space-y-3">
                {wasteAlerts.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${
                    alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{alert.message}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      {alert.count} items need immediate attention
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Alert Form */}
              {showCreateAlert && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-3">Report Surplus Food</h3>
                  <form onSubmit={handleCreateAlert} className="space-y-3">
                    <select
                      value={alertForm.food_type}
                      onChange={(e) => setAlertForm(prev => ({...prev, food_type: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="prepared">Prepared Meals</option>
                      <option value="produce">Fresh Produce</option>
                      <option value="bakery">Bakery Items</option>
                      <option value="packaged">Packaged Goods</option>
                    </select>
                    
                    <input
                      type="text"
                      value={alertForm.quantity}
                      onChange={(e) => setAlertForm(prev => ({...prev, quantity: e.target.value}))}
                      placeholder="Quantity (e.g., 50 meals, 20 lbs)"
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                    
                    <input
                      type="datetime-local"
                      value={alertForm.expiry_time}
                      onChange={(e) => setAlertForm(prev => ({...prev, expiry_time: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                    
                    <div className="flex space-x-2">
                      <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700">
                        Create Alert
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowCreateAlert(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FoodRescueNetwork component error:', error);
    return null;
  }
}