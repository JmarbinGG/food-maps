function AuthModal({ onClose, onAuth }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [showDemoOptions, setShowDemoOptions] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'recipient'
  });

  const demoUsers = [
    {
      id: 'demo_donor_1',
      name: 'Sarah Chen',
      email: 'sarah@foodbank.demo',
      role: 'donor',
      onboardingCompleted: true,
      address: '123 Restaurant Row, NYC',
      coords: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 'demo_recipient_1', 
      name: 'Maria Rodriguez',
      email: 'maria@family.demo',
      role: 'recipient',
      onboardingCompleted: true,
      address: '456 Community St, NYC',
      coords: { lat: 40.7200, lng: -73.9900 },
      household_size: 4
    },
    {
      id: 'demo_volunteer_1',
      name: 'Alex Kim',
      email: 'alex@volunteer.demo', 
      role: 'volunteer',
      onboardingCompleted: true,
      address: '789 Helper Ave, NYC',
      coords: { lat: 40.7350, lng: -74.0050 },
      vehicle_info: { type: 'car', capacity: 'medium' }
    },
    {
      id: 'demo_dispatcher_1',
      name: 'Jordan Taylor',
      email: 'jordan@dispatch.demo',
      role: 'dispatcher', 
      onboardingCompleted: true,
      address: 'NYC Food Distribution Center',
      coords: { lat: 40.7280, lng: -73.9950 }
    },
    {
      id: 'demo_admin_1',
      name: 'Admin User',
      email: 'admin@foodmaps.demo',
      role: 'admin',
      onboardingCompleted: true,
      address: 'Food Maps HQ',
      coords: { lat: 40.7500, lng: -73.9850 }
    },
    {
      id: 'demo_store_owner_1',
      name: 'Store Manager',
      email: 'manager@dogoods.demo',
      role: 'store_owner',
      storeId: 'dogoods-main',
      onboardingCompleted: true,
      address: 'DoGoods Distribution Center',
      coords: { lat: 40.7300, lng: -73.9800 }
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      id: Date.now().toString(),
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      role: formData.role,
      isNewUser: !isLogin
    };
    
    onAuth(userData);
    onClose();
  };

  const handleDemoLogin = (demoUser) => {
    onAuth(demoUser);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-name="auth-modal" data-file="components/Auth/AuthModal.js">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <div className="icon-x text-xl"></div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full p-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="recipient">Recipient</option>
                  <option value="donor">Donor</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo Login Section */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowDemoOptions(!showDemoOptions)}
              className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <div className="icon-play-circle text-lg mr-2 inline-block"></div>
              {showDemoOptions ? 'Hide Demo Accounts' : 'Try Demo Accounts'}
            </button>
            
            {showDemoOptions && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 mb-3">Click any demo user to sign in instantly:</p>
                {demoUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleDemoLogin(user)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Demo
                    </div>
                  </button>
                ))}
                <div className="text-xs text-gray-400 mt-2 text-center">
                  No registration required • Full feature access
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--primary-color)] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AuthModal component error:', error);
    return null;
  }
}
