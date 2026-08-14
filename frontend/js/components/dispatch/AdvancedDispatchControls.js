// Advanced dispatch controls with AI insights
function AdvancedDispatchControls({ onControlChange }) {
  const [controlSettings, setControlSettings] = React.useState({
    aiAssistLevel: 80,
    riskTolerance: 'medium',
    optimizationGoal: 'balanced',
    emergencyMode: false
  });

  const [aiInsights, setAiInsights] = React.useState([
    { type: 'efficiency', message: 'Route consolidation could save 23% travel time', priority: 'high' },
    { type: 'cost', message: 'Current fuel costs 15% above optimal', priority: 'medium' },
    { type: 'service', message: 'Customer satisfaction trending upward (+5%)', priority: 'low' }
  ]);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...controlSettings, [setting]: value };
    setControlSettings(newSettings);
    if (onControlChange) onControlChange(newSettings);
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="icon-sliders text-indigo-600 mr-2"></div>
          Advanced Controls
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Assistance Level */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">AI Assistance Level</label>
            <span className="text-sm text-gray-600">{controlSettings.aiAssistLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={controlSettings.aiAssistLevel}
            onChange={(e) => handleSettingChange('aiAssistLevel', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Manual</span>
            <span>Semi-Auto</span>
            <span>Full Auto</span>
          </div>
        </div>

        {/* Risk Tolerance */}
        <div>
          <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
          <div className="grid grid-cols-3 gap-2">
            {['conservative', 'medium', 'aggressive'].map(level => (
              <button
                key={level}
                onClick={() => handleSettingChange('riskTolerance', level)}
                className={`p-2 text-sm rounded border transition-colors capitalize ${
                  controlSettings.riskTolerance === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Optimization Goal */}
        <div>
          <label className="text-sm font-medium mb-2 block">Optimization Goal</label>
          <select
            value={controlSettings.optimizationGoal}
            onChange={(e) => handleSettingChange('optimizationGoal', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="speed">Minimize Time</option>
            <option value="cost">Minimize Cost</option>
            <option value="balanced">Balanced</option>
            <option value="sustainability">Eco-Friendly</option>
            <option value="service">Customer First</option>
          </select>
        </div>

        {/* Emergency Mode */}
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
          <div>
            <span className="font-medium text-red-800">Emergency Mode</span>
            <p className="text-xs text-red-600">Override all constraints for critical deliveries</p>
          </div>
          <button
            onClick={() => handleSettingChange('emergencyMode', !controlSettings.emergencyMode)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              controlSettings.emergencyMode
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-600 border border-red-600'
            }`}
          >
            {controlSettings.emergencyMode ? 'Active' : 'Inactive'}
          </button>
        </div>

        {/* AI Insights */}
        <div>
          <h4 className="font-medium mb-3">AI Insights</h4>
          <div className="space-y-2">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.priority)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase">{insight.type}</span>
                  <span className="text-xs">{insight.priority} priority</span>
                </div>
                <p className="text-sm">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.AdvancedDispatchControls = AdvancedDispatchControls;