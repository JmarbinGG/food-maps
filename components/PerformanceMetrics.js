// Performance metrics and analytics component
function PerformanceMetrics({ vehicles = [], routes = [], deliveries = [] }) {
  const [timeFrame, setTimeFrame] = React.useState('today');
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    calculateMetrics();
  }, [vehicles, routes, deliveries, timeFrame]);

  const calculateMetrics = () => {
    const now = new Date();
    const completedDeliveries = deliveries.filter(d => d.status === 'completed');
    
    // Calculate various performance metrics
    const newMetrics = {
      totalDeliveries: completedDeliveries.length,
      onTimeRate: (completedDeliveries.filter(d => !d.delayed).length / completedDeliveries.length * 100) || 0,
      avgDeliveryTime: calculateAvgDeliveryTime(completedDeliveries),
      fuelEfficiency: calculateFuelEfficiency(vehicles),
      routeOptimization: calculateRouteEfficiency(routes),
      customerSatisfaction: 87 + Math.random() * 10, // Simulated
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      totalDistance: routes.reduce((sum, route) => sum + (route.distance || 0), 0),
      costPerDelivery: 12.50 + Math.random() * 5 // Simulated
    };

    setMetrics(newMetrics);
  };

  const calculateAvgDeliveryTime = (deliveries) => {
    if (!deliveries.length) return 0;
    const times = deliveries.map(d => d.deliveryTime || 30);
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const calculateFuelEfficiency = (vehicles) => {
    const efficiency = vehicles.map(v => v.fuelEfficiency || 8.5);
    return efficiency.reduce((sum, eff) => sum + eff, 0) / efficiency.length || 0;
  };

  const calculateRouteEfficiency = (routes) => {
    if (!routes.length) return 85;
    return 80 + Math.random() * 15; // Simulated efficiency score
  };

  const MetricCard = ({ title, value, unit, change, icon, color = 'blue' }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <div className={`icon-${icon} text-${color}-600`}></div>
        </div>
        {change && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            change > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
        {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Time Frame Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Deliveries"
          value={metrics.totalDeliveries}
          icon="package"
          color="blue"
          change={5.2}
        />
        <MetricCard
          title="On-Time Rate"
          value={metrics.onTimeRate}
          unit="%"
          icon="clock"
          color="green"
          change={2.1}
        />
        <MetricCard
          title="Avg Delivery Time"
          value={metrics.avgDeliveryTime}
          unit="min"
          icon="timer"
          color="purple"
          change={-3.5}
        />
        <MetricCard
          title="Active Vehicles"
          value={metrics.activeVehicles}
          icon="truck"
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Fuel Efficiency"
          value={metrics.fuelEfficiency}
          unit="km/L"
          icon="fuel"
          color="yellow"
          change={1.8}
        />
        <MetricCard
          title="Route Optimization"
          value={metrics.routeOptimization}
          unit="%"
          icon="route"
          color="indigo"
          change={4.2}
        />
        <MetricCard
          title="Customer Satisfaction"
          value={metrics.customerSatisfaction}
          unit="%"
          icon="star"
          color="pink"
          change={0.8}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-4">Delivery Trends</h4>
          <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">Chart visualization would go here</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-4">Cost Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Cost per Delivery</span>
              <span className="font-medium">${metrics.costPerDelivery?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Distance</span>
              <span className="font-medium">{(metrics.totalDistance / 1609.34).toFixed(1)} mi</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Efficiency Score</span>
              <span className="font-medium">{metrics.routeOptimization?.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PerformanceMetrics = PerformanceMetrics;