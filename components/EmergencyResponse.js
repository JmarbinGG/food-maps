function EmergencyResponse({ user, onClose }) {
  const [emergencyRequests, setEmergencyRequests] = React.useState([]);
  const [isCreatingRequest, setIsCreatingRequest] = React.useState(false);
  const [emergencyForm, setEmergencyForm] = React.useState({
    urgency: 'critical',
    people_affected: 1,
    location: '',
    situation_type: 'individual',
    special_needs: [],
    contact: '',
    description: ''
  });

  React.useEffect(() => {
    loadEmergencyRequests();
  }, []);

  const loadEmergencyRequests = async () => {
    // Mock emergency requests
    setEmergencyRequests([
      {
        id: 'emg1',
        urgency: 'critical',
        people_affected: 4,
        location: 'Downtown Shelter',
        situation_type: 'shelter',
        created_at: '2025-01-09T08:00:00Z',
        status: 'dispatching',
        eta: '45 minutes'
      },
      {
        id: 'emg2',
        urgency: 'high',
        people_affected: 1,
        location: 'Elderly Care Center',
        situation_type: 'medical',
        created_at: '2025-01-09T07:30:00Z',
        status: 'assigned',
        eta: '2 hours'
      }
    ]);
  };

  const handleCreateEmergency = async (e) => {
    e.preventDefault();
    setIsCreatingRequest(true);

    try {
      const newRequest = {
        ...emergencyForm,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        status: 'urgent',
        estimated_response: emergencyForm.urgency === 'critical' ? '30 minutes' : '2 hours'
      };

      alert(`Emergency request created! Estimated response: ${newRequest.estimated_response}`);
      setIsCreatingRequest(false);
      setEmergencyForm({
        urgency: 'critical',
        people_affected: 1,
        location: '',
        situation_type: 'individual',
        special_needs: [],
        contact: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating emergency request:', error);
      alert('Failed to create emergency request');
      setIsCreatingRequest(false);
    }
  };

  const situationTypes = [
    { value: 'individual', label: 'Individual/Family Crisis' },
    { value: 'shelter', label: 'Shelter Emergency' },
    { value: 'medical', label: 'Medical Facility' },
    { value: 'disaster', label: 'Natural Disaster' },
    { value: 'school', label: 'School/Educational' }
  ];

  try {
    return (
      <div className="min-h-screen bg-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <div className="icon-alert-triangle text-red-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-800">Emergency Food Response</h1>
                <p className="text-red-600">Critical hunger situations - immediate response</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emergency Request Form */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h2 className="text-lg font-bold mb-4 text-red-800">Report Emergency</h2>
              
              <form onSubmit={handleCreateEmergency} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={emergencyForm.urgency}
                    onChange={(e) => setEmergencyForm(prev => ({...prev, urgency: e.target.value}))}
                    className="p-3 border border-red-200 rounded-lg focus:border-red-500"
                  >
                    <option value="critical">🚨 Critical (0-1 hour)</option>
                    <option value="high">⚠️ High (1-4 hours)</option>
                    <option value="medium">🔔 Medium (4-12 hours)</option>
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={emergencyForm.people_affected}
                    onChange={(e) => setEmergencyForm(prev => ({...prev, people_affected: parseInt(e.target.value)}))}
                    placeholder="People affected"
                    className="p-3 border border-red-200 rounded-lg"
                    required
                  />
                </div>

                <select
                  value={emergencyForm.situation_type}
                  onChange={(e) => setEmergencyForm(prev => ({...prev, situation_type: e.target.value}))}
                  className="w-full p-3 border border-red-200 rounded-lg"
                >
                  {situationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={emergencyForm.location}
                  onChange={(e) => setEmergencyForm(prev => ({...prev, location: e.target.value}))}
                  placeholder="Emergency location/address"
                  className="w-full p-3 border border-red-200 rounded-lg"
                  required
                />

                <input
                  type="text"
                  value={emergencyForm.contact}
                  onChange={(e) => setEmergencyForm(prev => ({...prev, contact: e.target.value}))}
                  placeholder="Emergency contact (phone/name)"
                  className="w-full p-3 border border-red-200 rounded-lg"
                  required
                />

                <textarea
                  value={emergencyForm.description}
                  onChange={(e) => setEmergencyForm(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the emergency situation and specific needs..."
                  rows={3}
                  className="w-full p-3 border border-red-200 rounded-lg"
                  required
                />

                <button
                  type="submit"
                  disabled={isCreatingRequest}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {isCreatingRequest ? 'Creating Emergency Request...' : '🚨 Submit Emergency Request'}
                </button>
              </form>
            </div>

            {/* Active Emergency Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Active Emergencies</h2>
              
              <div className="space-y-3">
                {emergencyRequests.map(request => (
                  <div key={request.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.urgency === 'critical' ? 'bg-red-600 text-white' :
                        request.urgency === 'high' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {request.urgency.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">ETA: {request.eta}</span>
                    </div>
                    
                    <h4 className="font-medium capitalize">{request.situation_type} Emergency</h4>
                    <p className="text-sm text-gray-600">{request.location}</p>
                    <p className="text-sm text-gray-600">{request.people_affected} people affected</p>
                    
                    <div className="mt-3 flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        request.status === 'dispatching' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'assigned' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('EmergencyResponse component error:', error);
    return null;
  }
}