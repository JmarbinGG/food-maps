function StoreOwnerDashboard({ user, onClose }) {
  const [activeTab, setActiveTab] = React.useState('inventory');
  const [myCenter, setMyCenter] = React.useState(null);
  const [inventory, setInventory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [isEditingCenter, setIsEditingCenter] = React.useState(false);
  const [centerFormData, setCenterFormData] = React.useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    hours: ''
  });
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: 'produce',
    quantity: '',
    unit: 'lbs',
    perishability: 'medium',
    expiration_date: ''
  });

  React.useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      // Get all centers and find user's center
      const centersResponse = await fetch('/api/centers');
      const centers = await centersResponse.json();
      const userCenter = centers.find(c => c.owner_id === user.id);

      if (userCenter) {
        setMyCenter(userCenter);
        setCenterFormData({
          name: userCenter.name || '',
          description: userCenter.description || '',
          address: userCenter.address || '',
          phone: userCenter.phone || '',
          hours: userCenter.hours || ''
        });
        await loadInventory(userCenter.id);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (centerId) => {
    try {
      const response = await fetch(`/api/centers/${centerId}/inventory`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!myCenter) {
      alert('Please create a distribution center first');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/centers/${myCenter.id}/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          expiration_date: formData.expiration_date || null
        })
      });

      if (response.ok) {
        await loadInventory(myCenter.id);
        setShowAddForm(false);
        setFormData({
          name: '',
          description: '',
          category: 'produce',
          quantity: '',
          unit: 'lbs',
          perishability: 'medium',
          expiration_date: ''
        });
        alert('Item added successfully!');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.detail || 'Failed to add item'));
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/centers/${myCenter.id}/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_available: !currentStatus
        })
      });

      if (response.ok) {
        await loadInventory(myCenter.id);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/centers/${myCenter.id}/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadInventory(myCenter.id);
        alert('Item deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏪</div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!myCenter) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold mb-4">No Distribution Center Found</h2>
          <p className="text-gray-600 mb-6">
            You need to set up a distribution center first. Please contact an administrator.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{myCenter.name}</h1>
              <p className="text-gray-600">{myCenter.address}</p>
              {myCenter.phone && <p className="text-gray-600">📞 {myCenter.phone}</p>}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'inventory'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'info'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Center Info
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Food Inventory</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {showAddForm ? 'Cancel' : '+ Add Food Item'}
              </button>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Add New Food Item</h3>
                <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="produce">Produce</option>
                      <option value="prepared">Prepared Food</option>
                      <option value="packaged">Packaged</option>
                      <option value="bakery">Bakery</option>
                      <option value="fruit">Fruit</option>
                      <option value="water">Water</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perishability
                    </label>
                    <select
                      value={formData.perishability}
                      onChange={(e) => setFormData({ ...formData, perishability: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="lbs">lbs</option>
                      <option value="lbs">lbs</option>
                      <option value="items">items</option>
                      <option value="boxes">boxes</option>
                      <option value="bags">bags</option>
                      <option value="servings">servings</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="col-span-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Inventory List */}
            <div className="grid gap-4">
              {inventory.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-600">No inventory items yet</p>
                  <p className="text-sm text-gray-500 mt-2">Click "Add Food Item" to get started</p>
                </div>
              ) : (
                inventory.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-sm p-4 ${!item.is_available ? 'opacity-60' : ''
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${item.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                            }`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {item.category}
                          </span>
                          <span className="text-gray-700">
                            <strong>Qty:</strong> {item.quantity} {item.unit}
                          </span>
                          {item.perishability && (
                            <span className={`px-2 py-1 rounded ${item.perishability === 'high' ? 'bg-red-100 text-red-800' :
                                item.perishability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {item.perishability}
                            </span>
                          )}
                        </div>
                        {item.expiration_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Expires: {new Date(item.expiration_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className={`px-3 py-1 rounded text-sm ${item.is_available
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          {item.is_available ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Distribution Center Information</h2>
              <button
                onClick={() => setIsEditingCenter(!isEditingCenter)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditingCenter ? 'Cancel' : 'Edit Info'}
              </button>
            </div>
            
            {isEditingCenter ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const token = localStorage.getItem('auth_token');
                  const response = await fetch(`/api/centers/${myCenter.id}`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(centerFormData)
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    setMyCenter(result.center);
                    setIsEditingCenter(false);
                    alert('Center information updated successfully!');
                  } else {
                    alert('Failed to update center information');
                  }
                } catch (error) {
                  console.error('Error updating center:', error);
                  alert('Network error. Please try again.');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={centerFormData.name}
                    onChange={(e) => setCenterFormData({ ...centerFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={centerFormData.address}
                    onChange={(e) => setCenterFormData({ ...centerFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={centerFormData.description}
                    onChange={(e) => setCenterFormData({ ...centerFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={centerFormData.phone}
                    onChange={(e) => setCenterFormData({ ...centerFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                  <input
                    type="text"
                    value={centerFormData.hours}
                    onChange={(e) => setCenterFormData({ ...centerFormData, hours: e.target.value })}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCenter(false);
                      setCenterFormData({
                        name: myCenter.name || '',
                        description: myCenter.description || '',
                        address: myCenter.address || '',
                        phone: myCenter.phone || '',
                        hours: myCenter.hours || ''
                      });
                    }}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{myCenter.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{myCenter.address}</p>
                </div>
                {myCenter.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{myCenter.description}</p>
                  </div>
                )}
                {myCenter.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{myCenter.phone}</p>
                  </div>
                )}
                {myCenter.hours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                    <p className="text-gray-900">{myCenter.hours}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded ${myCenter.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {myCenter.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
