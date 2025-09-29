function DispatchDashboard({ user, onClose }) {
  const [metrics, setMetrics] = React.useState({});
  const [alerts, setAlerts] = React.useState([]);
  const [slaRisks, setSlaRisks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock dashboard data
      setMetrics({
        openDonations: 12,
        openRequests: 8,
        activeVolunteers: 5,
        completedToday: 24,
        slaCompliance: 92,
        avgResponseTime: '4.2h'
      });

      setAlerts([
        {
          id: 'alert1',
          severity: 'high',
          message: 'Water request exceeding 4h SLA',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          linkedId: 'req1'
        },
        {
          id: 'alert2',
          severity: 'medium',
          message: 'High perishable food expiring in 2h',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          linkedId: 'donation3'
        }
      ]);

      setSlaRisks([
        {
          id: 'req1',
          type: 'request',
          address: '456 Oak Ave',
          hoursOverdue: 2.5,
          priority: 'water'
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const handleReplan = async () => {
    alert('Triggering agent replanning...');
    // In production, would call API to trigger replanning
  };

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (!user || !['dispatcher', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Access denied. Dispatcher role required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="icon-loader text-2xl text-gray-400 animate-spin"></div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4" data-name="dispatch-dashboard" data-file="components/DispatchDashboard.js">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Dispatch Control</h1>
            <div className="flex space-x-3">
              <button onClick={handleReplan} className="btn-secondary">
                <div className="icon-refresh-cw mr-2"></div>
                Force Replan
              </button>
              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Open Donations</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.openDonations}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Open Requests</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.openRequests}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Active Volunteers</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeVolunteers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.completedToday}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">SLA Compliance</p>
              <p className="text-2xl font-bold text-green-600">{metrics.slaCompliance}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-2xl font-bold text-gray-600">{metrics.avgResponseTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <div className="icon-x"></div>
                      </button>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No active alerts</p>
                )}
              </div>
            </div>

            {/* SLA Risks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">SLA Risk Items</h2>
              <div className="space-y-3">
                {slaRisks.map(risk => (
                  <div key={risk.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{risk.type}</p>
                        <p className="text-sm text-gray-600">{risk.address}</p>
                        <p className="text-xs text-red-600">
                          {risk.hoursOverdue}h overdue • {risk.priority} priority
                        </p>
                      </div>
                      <button className="btn-primary text-sm">
                        Escalate
                      </button>
                    </div>
                  </div>
                ))}
                
                {slaRisks.length === 0 && (
                  <p className="text-gray-500 text-center py-4">All items within SLA</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DispatchDashboard component error:', error);
    return null;
  }
}