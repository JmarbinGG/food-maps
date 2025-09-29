function Dashboard({ user, onViewChange }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [userListings, setUserListings] = React.useState([]);
  const [userTransactions, setUserTransactions] = React.useState([]);
  const [volunteerTasks, setVolunteerTasks] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    // Mock data - in production would fetch from API
    if (user.role === 'donor') {
      setUserListings([
        {
          id: '1',
          title: 'Fresh Vegetables',
          status: 'available',
          created_at: '2025-01-07T10:00:00Z',
          claims: 0
        }
      ]);
    }
    
    if (user.role === 'recipient') {
      setUserTransactions([
        {
          id: 'txn1',
          listing_title: 'Fresh Bread',
          status: 'claimed',
          created_at: '2025-01-08T17:00:00Z'
        }
      ]);
    }
    
    if (user.role === 'volunteer') {
      setVolunteerTasks([
        {
          id: 'task1',
          from: '123 Main St',
          to: '456 Oak Ave',
          distance: '2.5 km',
          status: 'available'
        }
      ]);
    }
  };

  const renderDonorDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-package text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Listings</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{userListings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-users text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Claims</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-heart text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Meals Shared</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">My Listings</h3>
          <button onClick={() => onViewChange('create')} className="btn-primary text-sm">
            <div className="icon-plus text-lg mr-1"></div>
            Add Listing
          </button>
        </div>
        
        <div className="space-y-3">
          {userListings.map(listing => (
            <div key={listing.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">{listing.title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Created {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="status-available">{listing.status}</span>
                <button className="text-[var(--primary-color)] text-sm hover:underline">Edit</button>
              </div>
            </div>
          ))}
          
          {userListings.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-package text-3xl mb-2"></div>
              <p>No listings yet</p>
              <button onClick={() => onViewChange('create')} className="btn-primary mt-2">
                Create First Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecipientDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-shopping-bag text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Active Claims</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{userTransactions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-check-circle text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Completed</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">8</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-utensils text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Meals Received</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">24</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">My Claims</h3>
        
        <div className="space-y-3">
          {userTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">{transaction.listing_title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Claimed {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="status-claimed">{transaction.status}</span>
            </div>
          ))}
          
          {userTransactions.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-shopping-bag text-3xl mb-2"></div>
              <p>No claims yet</p>
              <div className="flex space-x-2 mt-2">
                <button onClick={() => onViewChange('map')} className="btn-primary">
                  Find Food
                </button>
                <button onClick={() => onViewChange('consumption')} className="btn-secondary">
                  Track Food
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVolunteerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="icon-truck text-xl text-[var(--primary-color)]"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Available Tasks</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{volunteerTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="icon-clock text-xl text-blue-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Hours This Month</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">15</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="icon-route text-xl text-purple-600"></div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Deliveries</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">32</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Available Tasks</h3>
        
        <div className="space-y-3">
          {volunteerTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Pickup & Delivery</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  From {task.from} to {task.to} • {task.distance}
                </p>
              </div>
              <button className="btn-primary text-sm">Accept Task</button>
            </div>
          ))}
          
          {volunteerTasks.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-truck text-3xl mb-2"></div>
              <p>No tasks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="icon-lock text-3xl text-[var(--text-secondary)] mb-2"></div>
          <p className="text-[var(--text-secondary)]">Please sign in to view dashboard</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[var(--surface)] p-4" data-name="dashboard" data-file="components/Dashboard.js">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back, {user.name}!
            </h1>
            <p className="text-[var(--text-secondary)] capitalize">{user.role} Dashboard</p>
          </div>

          {user.role === 'donor' && renderDonorDashboard()}
          {user.role === 'recipient' && renderRecipientDashboard()}
          {user.role === 'volunteer' && renderVolunteerDashboard()}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard component error:', error);
    return null;
  }
}