function CreateListing({ user, onCancel, onSuccess }) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    category: 'produce',
    qty: '',
    unit: 'lbs',
    expiration_date: '',
    perishability: 'medium',
    address: '',
    pickup_window_start: '',
    pickup_window_end: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const categories = [
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'prepared', label: 'Prepared Meals' },
    { value: 'packaged', label: 'Packaged Foods' },
    { value: 'bakery', label: 'Bakery Items' }
  ];

  const perishabilityLevels = [
    { value: 'high', label: 'High (consume within hours)' },
    { value: 'medium', label: 'Medium (consume within days)' },
    { value: 'low', label: 'Low (shelf stable)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.qty || formData.qty <= 0) newErrors.qty = 'Valid quantity is required';
    if (!formData.address.trim()) newErrors.address = 'Pickup address is required';
    if (!formData.pickup_window_start) newErrors.pickup_window_start = 'Start time is required';
    if (!formData.pickup_window_end) newErrors.pickup_window_end = 'End time is required';
    
    const now = new Date();
    const startTime = new Date(formData.pickup_window_start);
    const endTime = new Date(formData.pickup_window_end);
    
    if (startTime <= now) {
      newErrors.pickup_window_start = 'Pickup must be in the future';
    }
    
    if (endTime <= startTime) {
      newErrors.pickup_window_end = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    
    try {
      // In production, this would call the API
      const newListing = {
        ...formData,
        id: Date.now().toString(),
        donor_id: user.id,
        status: 'available',
        coords: { lat: 40.7128, lng: -74.0060 }, // Would geocode address
        created_at: new Date().toISOString()
      };
      
      console.log('Creating listing:', newListing);
      alert('Listing created successfully!');
      onSuccess();
      
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'donor') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="icon-lock text-3xl text-[var(--text-secondary)] mb-2"></div>
          <p className="text-[var(--text-secondary)]">Only donors can create listings</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[var(--surface)] p-4" data-name="create-listing" data-file="components/CreateListing.js">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--border-color)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Share Food</h1>
              <button onClick={onCancel} className="btn-secondary">
                <div className="icon-x text-lg mr-2"></div>
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  placeholder="e.g., Fresh vegetables from community garden"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  placeholder="Describe the food items..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Perishability
                  </label>
                  <select
                    value={formData.perishability}
                    onChange={(e) => handleInputChange('perishability', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  >
                    {perishabilityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  />
                  {errors.qty && <p className="text-red-500 text-sm mt-1">{errors.qty}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  >
                    <option value="lbs">Pounds</option>
                    <option value="kg">Kilograms</option>
                    <option value="items">Items</option>
                    <option value="servings">Servings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  placeholder="Street address for pickup"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Pickup Window Start *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickup_window_start}
                    onChange={(e) => handleInputChange('pickup_window_start', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  />
                  {errors.pickup_window_start && <p className="text-red-500 text-sm mt-1">{errors.pickup_window_start}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Pickup Window End *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickup_window_end}
                    onChange={(e) => handleInputChange('pickup_window_end', e.target.value)}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                  />
                  {errors.pickup_window_end && <p className="text-red-500 text-sm mt-1">{errors.pickup_window_end}</p>}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Listing'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CreateListing component error:', error);
    return null;
  }
}