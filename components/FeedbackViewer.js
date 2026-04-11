function FeedbackViewer({ onClose }) {
  const [feedbackList, setFeedbackList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    type: 'all',
    status: 'all'
  });
  const [selectedFeedback, setSelectedFeedback] = React.useState(null);

  React.useEffect(() => {
    loadFeedback();
  }, [filters]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await fetch(`/api/feedback/list?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load feedback');

      const data = await response.json();
      console.log('Feedback data received:', data);
      setFeedbackList(data.feedback || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      alert('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      loadFeedback();
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      bug: 'bg-red-100 text-red-800',
      error_report: 'bg-orange-100 text-orange-800',
      feature_request: 'bg-blue-100 text-blue-800',
      improvement: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.new;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Feedback & Reports</h2>
            <p className="text-blue-100">Manage user feedback and error reports</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="bug"> Bug Reports</option>
                <option value="error_report"> Error Reports</option>
                <option value="feature_request"> Feature Requests</option>
                <option value="improvement"> Improvements</option>
                <option value="general"> General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="icon-loader animate-spin text-3xl text-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading feedback...</p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-8">
              <div className="icon-inbox text-4xl text-gray-400 mb-2"></div>
              <p className="text-gray-600">No feedback found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList.map(feedback => (
                <div
                  key={feedback.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                          {feedback.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status.replace('_', ' ')}
                        </span>
                        {feedback.has_screenshot && (
                          <span className="text-xs text-gray-500"></span>
                        )}
                        {feedback.has_error_stack && (
                          <span className="text-xs text-red-500"></span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800">{feedback.subject}</h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{feedback.message}</p>
                  {feedback.email && (
                    <p className="text-xs text-gray-500 mt-2"> {feedback.email}</p>
                  )}
                  {feedback.url && (
                    <p className="text-xs text-gray-500 mt-1"> {feedback.url}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <div className="icon-x text-xl"></div>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedFeedback.status}
                  onChange={(e) => updateStatus(selectedFeedback.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getTypeColor(selectedFeedback.type)}`}>
                  {selectedFeedback.type.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-800">{selectedFeedback.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>

              {selectedFeedback.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <p className="text-gray-800">{selectedFeedback.email}</p>
                </div>
              )}

              {selectedFeedback.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page URL</label>
                  <p className="text-gray-800 text-sm break-all">{selectedFeedback.url}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-gray-800">{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>

              {selectedFeedback.screenshot && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot</label>
                  <div className="bg-gray-50 p-2 rounded">
                    <img
                      src={selectedFeedback.screenshot}
                      alt="Feedback screenshot"
                      className="max-w-full h-auto border border-gray-300 rounded-lg shadow-sm"
                      onError={(e) => {
                        console.error('Screenshot failed to load:', selectedFeedback.screenshot?.substring(0, 100));
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none' }} className="text-red-600 text-sm p-4 bg-red-50 rounded">
                      Failed to load screenshot. The image data may be corrupted.
                    </div>
                  </div>
                </div>
              )}

              {!selectedFeedback.screenshot && selectedFeedback.has_screenshot && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot</label>
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800 text-sm">
                    Screenshot was captured but data is not available. This may be due to database storage limits.
                  </div>
                </div>
              )}

              {selectedFeedback.error_stack && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Error Stack Trace</label>
                  <pre className="text-xs bg-red-50 border border-red-200 rounded-lg p-3 overflow-x-auto text-red-800 font-mono">
                    {selectedFeedback.error_stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
