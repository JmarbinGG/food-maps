function DriverDashboardComponent({ drivers = [] }) {
  try {
    const [selectedDriver, setSelectedDriver] = React.useState(null);

    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'available': return 'bg-blue-100 text-blue-800';
        case 'offline': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Driver Management</h3>
        
        <div className="space-y-3">
          {drivers.map(driver => (
            <div key={driver.id} className="dispatch-card">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{driver.name}</h4>
                  <p className="text-sm text-gray-600">{driver.vehicle}</p>
                  <p className="text-xs text-gray-500">{driver.location}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                  {driver.status.toUpperCase()}
                </span>
              </div>
              
              {driver.status === 'active' && driver.currentRoute && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-600">Current Route: {driver.currentRoute}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {drivers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No drivers available
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('DriverDashboard error:', error);
    return <div className="p-6 text-red-600">Driver dashboard error</div>;
  }
}

window.DriverDashboardComponent = DriverDashboardComponent;