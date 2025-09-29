function CommunityPartners({ user, onClose }) {
  const [partners, setPartners] = React.useState([]);
  const [showAddPartner, setShowAddPartner] = React.useState(false);
  const [partnerForm, setPartnerForm] = React.useState({
    name: '',
    type: 'restaurant',
    capacity: '',
    schedule: '',
    contact: '',
    specialties: []
  });

  React.useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = () => {
    setPartners([
      {
        id: 'p1',
        name: 'Green Valley Restaurant',
        type: 'restaurant',
        capacity: '200 meals/day',
        donated_meals: 15420,
        rating: 4.8,
        status: 'active',
        specialties: ['prepared meals', 'vegetarian options'],
        last_donation: '2025-01-09T10:00:00Z'
      },
      {
        id: 'p2',
        name: 'City Community Garden',
        type: 'farm',
        capacity: '150 lbs/week',
        donated_meals: 8930,
        rating: 4.9,
        status: 'active',
        specialties: ['fresh produce', 'organic vegetables'],
        last_donation: '2025-01-08T14:30:00Z'
      },
      {
        id: 'p3',
        name: 'Downtown Food Bank',
        type: 'food_bank',
        capacity: '500 families/week',
        donated_meals: 45200,
        rating: 4.7,
        status: 'active',
        specialties: ['packaged goods', 'emergency supplies'],
        last_donation: '2025-01-09T08:45:00Z'
      }
    ]);
  };

  const partnerTypes = [
    { value: 'restaurant', label: 'Restaurant/Cafe', icon: '🍽️' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'farm', label: 'Farm/Garden', icon: '🌱' },
    { value: 'food_bank', label: 'Food Bank', icon: '🏛️' },
    { value: 'school', label: 'School/Institution', icon: '🏫' },
    { value: 'corporate', label: 'Corporate Partner', icon: '🏢' }
  ];

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      const newPartner = {
        ...partnerForm,
        id: Date.now().toString(),
        donated_meals: 0,
        rating: 0,
        status: 'pending',
        last_donation: null
      };
      
      setPartners([...partners, newPartner]);
      setShowAddPartner(false);
      setPartnerForm({
        name: '',
        type: 'restaurant',
        capacity: '',
        schedule: '',
        contact: '',
        specialties: []
      });
      
      alert('Partnership request submitted for review!');
    } catch (error) {
      console.error('Error adding partner:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    const typeObj = partnerTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '🏢';
  };

  try {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <div className="icon-users text-green-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Community Partners</h1>
                <p className="text-green-600">Scale impact through organizational partnerships</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddPartner(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add Partner
              </button>
              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Partnership Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{partners.length}</div>
              <div className="text-sm text-gray-600">Active Partners</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {partners.reduce((sum, p) => sum + p.donated_meals, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(partners.reduce((sum, p) => sum + p.rating, 0) / partners.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-gray-600">Reliability</div>
            </div>
          </div>

          {/* Add Partner Form */}
          {showAddPartner && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Add New Partner</h2>
              
              <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="Organization name"
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                />
                
                <select
                  value={partnerForm.type}
                  onChange={(e) => setPartnerForm(prev => ({...prev, type: e.target.value}))}
                  className="p-3 border border-gray-300 rounded-lg"
                >
                  {partnerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={partnerForm.capacity}
                  onChange={(e) => setPartnerForm(prev => ({...prev, capacity: e.target.value}))}
                  placeholder="Daily/weekly capacity"
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                />
                
                <input
                  type="text"
                  value={partnerForm.contact}
                  onChange={(e) => setPartnerForm(prev => ({...prev, contact: e.target.value}))}
                  placeholder="Contact information"
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                />
                
                <input
                  type="text"
                  value={partnerForm.schedule}
                  onChange={(e) => setPartnerForm(prev => ({...prev, schedule: e.target.value}))}
                  placeholder="Donation schedule"
                  className="p-3 border border-gray-300 rounded-lg md:col-span-2"
                />
                
                <div className="md:col-span-2 flex space-x-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    Submit Partnership Request
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddPartner(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Partners List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold">Partner Organizations</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {partners.map(partner => (
                <div key={partner.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{getTypeIcon(partner.type)}</div>
                      <div>
                        <h3 className="font-bold text-lg">{partner.name}</h3>
                        <p className="text-gray-600 capitalize">{partner.type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Capacity: {partner.capacity}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                            {partner.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            ⭐ {partner.rating}/5.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {partner.donated_meals.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">meals donated</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Last: {partner.last_donation ? new Date(partner.last_donation).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.map(specialty => (
                        <span key={specialty} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CommunityPartners component error:', error);
    return null;
  }
}
