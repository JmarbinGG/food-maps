function AdminPanel({ onClose }) {
  try {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [exportStatus, setExportStatus] = React.useState(null);
    const [dbStats, setDbStats] = React.useState({});

    React.useEffect(() => {
      loadDatabaseStats();
    }, []);

    const loadDatabaseStats = async () => {
      try {
        if (window.databaseService && window.databaseService.isConnected) {
          // Get stats from database
          const usersResult = await trickleListObjects('users', 10);
          const listingsResult = await trickleListObjects('food_listings', 10);
          const schedulesResult = await trickleListObjects('schedules', 10);
          const tasksResult = await trickleListObjects('tasks', 10);
          
          setDbStats({
            users: usersResult.items?.length || 0,
            listings: listingsResult.items?.length || 0,
            schedules: schedulesResult.items?.length || 0,
            tasks: tasksResult.items?.length || 0,
            connected: true
          });
        } else {
          setDbStats({
            users: window.mockUsers?.length || 0,
            listings: window.mockListings?.length || 0,
            schedules: window.mockSchedules?.length || 0,
            tasks: window.mockTasks?.length || 0,
            connected: false
          });
        }
      } catch (error) {
        console.error('Error loading database stats:', error);
      }
    };

    const handleExportData = async () => {
      setExportStatus('exporting');
      try {
        const result = await window.exportToSupabase.downloadExport();
        if (result.success) {
          setExportStatus('success');
          setTimeout(() => setExportStatus(null), 3000);
        } else {
          setExportStatus('error');
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (error) {
        console.error('Export error:', error);
        setExportStatus('error');
        setTimeout(() => setExportStatus(null), 3000);
      }
    };

    const handleSupabaseMigration = async () => {
      setExportStatus('migrating');
      try {
        const result = await window.supabaseExporter.downloadSupabaseMigration();
        if (result.success) {
          setExportStatus('migration_success');
          setTimeout(() => setExportStatus(null), 3000);
        } else {
          setExportStatus('migration_error');
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (error) {
        console.error('Migration error:', error);
        setExportStatus('migration_error');
        setTimeout(() => setExportStatus(null), 3000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
           data-name="admin-panel" data-file="components/AdminPanel.js">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'database', label: 'Database', icon: 'database' },
                { id: 'export', label: 'Export', icon: 'download' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className={`icon-${tab.icon} mr-2`}></div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-users text-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{dbStats.users}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-package text-green-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Food Listings</p>
                    <p className="text-2xl font-bold text-green-600">{dbStats.listings}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-orange-50 border-orange-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-calendar text-orange-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Schedules</p>
                    <p className="text-2xl font-bold text-orange-600">{dbStats.schedules}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="icon-list-checks text-purple-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">{dbStats.tasks}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Database Status</h3>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${dbStats.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${dbStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStats.connected ? 'Connected to Trickle Database' : 'Using Mock Data'}
                  </span>
                </div>
                <button
                  onClick={loadDatabaseStats}
                  className="btn-secondary"
                >
                  Refresh Stats
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Data Export</h3>
                <p className="text-gray-600 mb-4">
                  Export all Food Maps data for backup or migration purposes.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    disabled={exportStatus === 'exporting'}
                    className="btn-primary flex items-center justify-center"
                  >
                    {exportStatus === 'exporting' ? (
                      <>
                        <div className="icon-loader-2 mr-2 animate-spin"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <div className="icon-download mr-2"></div>
                        Export JSON Data
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleSupabaseMigration}
                    disabled={exportStatus === 'migrating'}
                    className="btn-secondary flex items-center justify-center"
                  >
                    {exportStatus === 'migrating' ? (
                      <>
                        <div className="icon-loader-2 mr-2 animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <div className="icon-database mr-2"></div>
                        Supabase Migration
                      </>
                    )}
                  </button>
                </div>
                
                {exportStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    Data exported successfully!
                  </div>
                )}
                
                {exportStatus === 'migration_success' && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    Supabase migration file generated successfully!
                  </div>
                )}
                
                {(exportStatus === 'error' || exportStatus === 'migration_error') && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    Export failed. Please try again.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('AdminPanel component error:', error);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel Error</h2>
          <p className="text-gray-600">Unable to load admin panel</p>
        </div>
      </div>
    );
  }
}

window.AdminPanel = AdminPanel;
