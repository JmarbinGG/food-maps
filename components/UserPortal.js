function UserPortal({ user, onClose, onViewChange, onUserUpdate }) {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [profileData, setProfileData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dietary_preferences: user?.dietary_preferences || [],
    notification_settings: user?.notification_settings || {
      email: true,
      sms: false,
      push: true
    },
    // Partner-specific fields
    organization_type: user?.organization_type || '',
    business_name: user?.business_name || '',
    license_number: user?.license_number || '',
    capacity: user?.capacity || '',
    operating_hours: user?.operating_hours || '',
    specialties: user?.specialties || [],
    certifications: user?.certifications || [],
    donation_frequency: user?.donation_frequency || '',
    pickup_capabilities: user?.pickup_capabilities || false,
    delivery_radius: user?.delivery_radius || 0
  });
  
  const [stats, setStats] = React.useState({
    listings_created: 12,
    food_shared: 45,
    people_helped: 23,
    points_earned: 340,
    // Partner stats
    total_donations: 156,
    meals_provided: 892,
    partner_since: '2024-03-15',
    reliability_score: 98
  });

  const isPartner = user?.role === 'partner' || user?.organization_type;

  const handleProfileUpdate = () => {
    try {
      const updatedUser = { ...user, ...profileData };
      onUserUpdate(updatedUser);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {isPartner ? 'Partner Organization Profile' : 'Profile Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isPartner ? 'Contact Name' : 'Full Name'}
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => setProfileData(prev => ({...prev, address: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {isPartner && (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Organization Type</label>
              <select
                value={profileData.organization_type}
                onChange={(e) => setProfileData(prev => ({...prev, organization_type: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Type</option>
                <option value="restaurant">Restaurant</option>
                <option value="grocery_store">Grocery Store</option>
                <option value="bakery">Bakery</option>
                <option value="cafe">Café</option>
                <option value="catering">Catering Company</option>
                <option value="food_bank">Food Bank</option>
                <option value="nonprofit">Nonprofit Organization</option>
                <option value="school">School/University</option>
                <option value="corporate">Corporate Cafeteria</option>
                <option value="hotel">Hotel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={profileData.business_name}
                onChange={(e) => setProfileData(prev => ({...prev, business_name: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Operating Hours</label>
              <input
                type="text"
                placeholder="e.g., Mon-Fri 9AM-6PM"
                value={profileData.operating_hours}
                onChange={(e) => setProfileData(prev => ({...prev, operating_hours: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </>
        )}
      </div>

      <button onClick={handleProfileUpdate} className="btn-primary">
        Update Profile
      </button>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Your Impact</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.listings_created}</div>
          <div className="text-sm text-gray-600">Listings Created</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.food_shared}</div>
          <div className="text-sm text-gray-600">Meals Shared</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.people_helped}</div>
          <div className="text-sm text-gray-600">People Helped</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.points_earned}</div>
          <div className="text-sm text-gray-600">Impact Points</div>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => { onViewChange('create'); onClose(); }}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="icon-plus-circle text-2xl text-green-600 mr-3"></div>
          <div className="text-left">
            <div className="font-medium">Share Food</div>
            <div className="text-sm text-gray-600">Create a new food listing</div>
          </div>
        </button>
        
        <button
          onClick={() => { onViewChange('bulk-create'); onClose(); }}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="icon-upload text-2xl text-blue-600 mr-3"></div>
          <div className="text-left">
            <div className="font-medium">Bulk Upload</div>
            <div className="text-sm text-gray-600">Upload multiple listings</div>
          </div>
        </button>
        
        <button
          onClick={() => { onViewChange('consumption'); onClose(); }}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="icon-bar-chart text-2xl text-purple-600 mr-3"></div>
          <div className="text-left">
            <div className="font-medium">Track Food</div>
            <div className="text-sm text-gray-600">Log consumption</div>
          </div>
        </button>
        
        <button
          onClick={() => { onViewChange('dashboard'); onClose(); }}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div className="icon-user text-2xl text-orange-600 mr-3"></div>
          <div className="text-left">
            <div className="font-medium">Dashboard</div>
            <div className="text-sm text-gray-600">View full dashboard</div>
          </div>
        </button>
      </div>
    </div>
  );

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">User Portal</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <div className="icon-x text-xl"></div>
              </button>
            </div>
            
            <div className="flex space-x-1 mt-4">
              {['profile', 'stats', 'actions'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    activeTab === tab ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-96">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'actions' && renderQuickActions()}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('UserPortal component error:', error);
    return null;
  }
}