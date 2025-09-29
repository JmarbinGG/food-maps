function DispatchHeaderComponent({ currentView, onViewChange }) {
  try {
    return (
      <header className="bg-white shadow-sm border-b h-20 flex items-center px-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="icon-truck text-white text-xl"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Dispatch Center</h1>
            <p className="text-sm text-gray-600">Real-time logistics management</p>
          </div>
        </div>
        
        <nav className="flex-1 flex justify-center">
          <div className="flex space-x-8">
            <button 
              onClick={() => onViewChange('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'overview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => onViewChange('routes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'routes' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Route Optimizer
            </button>
            <button 
              onClick={() => onViewChange('drivers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'drivers' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Drivers
            </button>
            <button 
              onClick={() => onViewChange('ai')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'ai' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              AI Engine
            </button>
          </div>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-900 font-medium">System Status</div>
            <div className="text-xs text-green-600">● All Systems Online</div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('DispatchHeader error:', error);
    return <div className="h-20 bg-red-100 flex items-center px-6">Header Error</div>;
  }
}

window.DispatchHeaderComponent = DispatchHeaderComponent;