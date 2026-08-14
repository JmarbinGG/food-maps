function AILogisticsEngineComponent() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [metrics, setMetrics] = React.useState({
    routesOptimized: 0,
    fuelSaved: 0,
    timeSaved: 0,
    efficiency: 0
  });

  try {
    React.useEffect(() => {
      // Simulate real-time metrics
      const interval = setInterval(() => {
        setMetrics(prev => ({
          routesOptimized: prev.routesOptimized + Math.floor(Math.random() * 2),
          fuelSaved: prev.fuelSaved + Math.random() * 0.5,
          timeSaved: prev.timeSaved + Math.random() * 2,
          efficiency: Math.min(100, prev.efficiency + Math.random() * 0.1)
        }));
      }, 5000);

      return () => clearInterval(interval);
    }, []);

    const runOptimization = async () => {
      setIsRunning(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsRunning(false);
    };

    return (
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">AI Logistics Engine</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Routes Optimized</h4>
            <div className="text-2xl font-bold text-blue-600">{metrics.routesOptimized}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Fuel Saved</h4>
            <div className="text-2xl font-bold text-green-600">{metrics.fuelSaved.toFixed(1)}L</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">Time Saved</h4>
            <div className="text-2xl font-bold text-purple-600">{metrics.timeSaved.toFixed(0)}m</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900">Efficiency</h4>
            <div className="text-2xl font-bold text-orange-600">{metrics.efficiency.toFixed(1)}%</div>
          </div>
        </div>

        <button 
          onClick={runOptimization}
          disabled={isRunning}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running AI Analysis...' : 'Run Full System Optimization'}
        </button>

        {isRunning && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <div className="animate-pulse text-blue-800">
              AI analyzing traffic patterns and optimizing routes...
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('AILogisticsEngine error:', error);
    return <div className="p-6 text-red-600">AI engine error</div>;
  }
}

window.AILogisticsEngineComponent = AILogisticsEngineComponent;