function AIMatching({ onClose }) {
  const [matches, setMatches] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [autoAssignMode, setAutoAssignMode] = React.useState(false);

  React.useEffect(() => {
    loadMatches();
    if (autoAssignMode) {
      const interval = setInterval(runAutoAssignment, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [autoAssignMode]);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const assignments = await window.agentAPI.autoAssignFood();
      setMatches(assignments);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAutoAssignment = async () => {
    console.log('Running auto-assignment...');
    await loadMatches();
  };

  const confirmAssignment = async (assignment) => {
    try {
      await window.agentAPI.createTask({
        type: 'auto_assignment',
        donation_id: assignment.donation_id,
        request_id: assignment.request_id,
        estimated_delivery: assignment.estimated_delivery
      });
      
      alert(`Assignment confirmed! Estimated delivery: ${new Date(assignment.estimated_delivery).toLocaleString()}`);
      loadMatches();
    } catch (error) {
      console.error('Error confirming assignment:', error);
      alert('Failed to confirm assignment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="icon-loader text-3xl text-blue-500 animate-spin mb-4"></div>
          <p>AI is finding optimal food matches...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">AI Food Matching</h1>
            <div className="flex space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoAssignMode}
                  onChange={(e) => setAutoAssignMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-assign</span>
              </label>
              <button onClick={loadMatches} className="btn-secondary">
                <div className="icon-refresh-cw mr-2"></div>
                Refresh
              </button>
              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <h2 className="text-lg font-semibold mb-4">Matching Statistics</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{matches.length}</div>
                <div className="text-sm text-gray-500">Optimal Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {matches.length > 0 ? (matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-gray-500">Avg Match Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {matches.length > 0 ? (matches.reduce((sum, m) => sum + (m.distance_km * 0.621371), 0) / matches.length).toFixed(1) : 0} mi
                </div>
                <div className="text-sm text-gray-500">Avg Distance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {matches.filter(m => m.match_score > 80).length}
                </div>
                <div className="text-sm text-gray-500">High Quality</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {matches.map(assignment => (
              <div key={`${assignment.request_id}-${assignment.donation_id}`} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assignment.match_score > 80 ? 'bg-green-100 text-green-800' :
                        assignment.match_score > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assignment.match_score}% Match
                      </div>
                      <span className="text-sm text-gray-500">
                        {(assignment.distance_km * 0.621371).toFixed(1)} mi away
                      </span>
                      <span className="text-sm text-gray-500">
                        ETA: {new Date(assignment.estimated_delivery).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Request</h4>
                        <p className="text-sm text-gray-600">ID: {assignment.request_id}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Donation</h4>
                        <p className="text-sm text-gray-600">ID: {assignment.donation_id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => confirmAssignment(assignment)}
                      className="btn-primary text-sm"
                    >
                      Confirm Match
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {matches.length === 0 && (
              <div className="text-center py-12">
                <div className="icon-search text-4xl text-gray-400 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500">The AI couldn't find optimal food matches at the moment.</p>
                <button onClick={loadMatches} className="btn-primary mt-4">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AIMatching component error:', error);
    return null;
  }
}