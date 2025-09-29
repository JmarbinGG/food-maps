// Predictive analytics component for demand forecasting
function PredictiveAnalytics({ historicalData = [], currentMetrics = {} }) {
  const [predictions, setPredictions] = React.useState({});
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    generatePredictions();
  }, [historicalData, currentMetrics]);

  const generatePredictions = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI-powered predictions
    const demandForecast = {
      nextHour: Math.floor(15 + Math.random() * 10),
      next4Hours: Math.floor(45 + Math.random() * 20),
      today: Math.floor(120 + Math.random() * 40),
      tomorrow: Math.floor(110 + Math.random() * 50)
    };

    const hotspots = [
      { area: 'Downtown', demand: 85, lat: 37.7749, lng: -122.4194 },
      { area: 'Mission District', demand: 72, lat: 37.7599, lng: -122.4148 },
      { area: 'Castro', demand: 68, lat: 37.7609, lng: -122.4350 }
    ];

    setPredictions({
      demandForecast,
      hotspots,
      optimalVehicles: Math.ceil(demandForecast.nextHour / 5),
      peakTime: '12:30 PM',
      efficiency: 89 + Math.random() * 8
    });
    
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="icon-trending-up text-purple-600 mr-2"></div>
          Predictive Analytics
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Demand Forecast */}
        <div>
          <h4 className="font-medium mb-3">Demand Forecast</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {predictions.demandForecast?.nextHour}
              </div>
              <div className="text-xs text-blue-600">Next Hour</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {predictions.demandForecast?.next4Hours}
              </div>
              <div className="text-xs text-green-600">Next 4 Hours</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {predictions.demandForecast?.today}
              </div>
              <div className="text-xs text-orange-600">Today</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {predictions.demandForecast?.tomorrow}
              </div>
              <div className="text-xs text-purple-600">Tomorrow</div>
            </div>
          </div>
        </div>

        {/* High Demand Areas */}
        <div>
          <h4 className="font-medium mb-3">High Demand Hotspots</h4>
          <div className="space-y-2">
            {predictions.hotspots?.map((hotspot, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{hotspot.area}</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${hotspot.demand}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{hotspot.demand}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">AI Recommendations</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Deploy {predictions.optimalVehicles} additional vehicles by {predictions.peakTime}</li>
            <li>• Focus resources on Downtown area (85% demand spike predicted)</li>
            <li>• Consider pre-positioning vehicles at high-demand locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

window.PredictiveAnalytics = PredictiveAnalytics;