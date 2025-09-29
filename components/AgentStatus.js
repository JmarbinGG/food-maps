function AgentStatus({ onClose }) {
  const [agentStates, setAgentStates] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadAgentStatus();
    const interval = setInterval(loadAgentStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const loadAgentStatus = async () => {
    try {
      // Mock agent status data
      const mockStates = {
        intake: {
          status: 'running',
          lastRun: new Date(Date.now() - 5000).toISOString(),
          processed: 12,
          errors: 0
        },
        triage: {
          status: 'running',
          lastRun: new Date(Date.now() - 15000).toISOString(),
          processed: 8,
          errors: 0
        },
        bundler: {
          status: 'running',
          lastRun: new Date(Date.now() - 45000).toISOString(),
          processed: 3,
          errors: 0
        },
        optimizer: {
          status: 'running',
          lastRun: new Date(Date.now() - 60000).toISOString(),
          processed: 2,
          errors: 1
        },
        assignment: {
          status: 'running',
          lastRun: new Date(Date.now() - 30000).toISOString(),
          processed: 5,
          errors: 0
        },
        coverage: {
          status: 'running',
          lastRun: new Date(Date.now() - 20000).toISOString(),
          processed: 1,
          errors: 0
        }
      };
      
      setAgentStates(mockStates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading agent status:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'stopped': return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return 'icon-play-circle';
      case 'error': return 'icon-alert-circle';
      case 'stopped': return 'icon-pause-circle';
      default: return 'icon-help-circle';
    }
  };

  const formatLastRun = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="icon-loader text-2xl text-gray-400 animate-spin"></div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4" data-name="agent-status" data-file="components/AgentStatus.js">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Agent Status</h1>
            {onClose && (
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(agentStates).map(([agentName, state]) => (
              <div key={agentName} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{agentName} Agent</h3>
                  <div className={`${getStatusIcon(state.status)} text-xl ${getStatusColor(state.status)}`}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium capitalize ${getStatusColor(state.status)}`}>
                      {state.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Run:</span>
                    <span className="text-sm">{formatLastRun(state.lastRun)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Processed:</span>
                    <span className="font-medium">{state.processed}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Errors:</span>
                    <span className={`font-medium ${state.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {state.errors}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:underline">
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">System Health</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <div className="text-sm text-gray-500">Avg Cycle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">45</div>
                <div className="text-sm text-gray-500">Tasks/Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-sm text-gray-500">Queue Depth</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AgentStatus component error:', error);
    return null;
  }
}