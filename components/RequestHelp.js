function RequestHelp({ onClose, onSuccess }) {
  const [formData, setFormData] = React.useState({
    address: '',
    coords: null,
    category: 'any',
    household_size: 1,
    special_needs: [],
    dietary_restrictions: '',
    latest_by: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const specialNeedsOptions = [
    { id: 'water', label: 'Water (urgent)' },
    { id: 'baby_food', label: 'Baby food' },
    { id: 'diabetic', label: 'Diabetic-friendly' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'vegetarian', label: 'Vegetarian' }
  ];

  const toggleSpecialNeed = (needId) => {
    setFormData(prev => ({
      ...prev,
      special_needs: prev.special_needs.includes(needId)
        ? prev.special_needs.filter(id => id !== needId)
        : [...prev.special_needs, needId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Geocode address if provided
      let coords = formData.coords;
      if (formData.address && !coords) {
        const geocoded = await window.geocodeAddress(formData.address);
        if (geocoded) {
          coords = { lat: geocoded.coordinates[1], lng: geocoded.coordinates[0] };
        }
      }
      
      // Create request
      const request = {
        ...formData,
        id: Date.now().toString(),
        coords,
        status: 'open',
        created_at: new Date().toISOString(),
        urgency_score: 0
      };
      
      console.log('Help request created:', request);
      
      // Calculate ETA based on urgency
      const hasWater = formData.special_needs.includes('water');
      const eta = hasWater ? '4-6 hours' : '6-24 hours';
      
      alert(`Request submitted! Expected delivery: ${eta}`);
      onSuccess();
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coords: { lat: latitude, lng: longitude }
          }));
          
          // Reverse geocode to get address
          const address = await window.reverseGeocode(longitude, latitude);
          if (address) {
            setFormData(prev => ({ ...prev, address }));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    }
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Request Help</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <div className="icon-x text-xl"></div>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address for delivery"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleGeolocation}
                  className="text-sm text-blue-600 hover:underline"
                >
                  📍 Use my current location
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.household_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, household_size: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Need by (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.latest_by}
                  onChange={(e) => setFormData(prev => ({ ...prev, latest_by: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Needs
              </label>
              <div className="grid grid-cols-2 gap-2">
                {specialNeedsOptions.map(option => (
                  <label key={option.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.special_needs.includes(option.id)}
                      onChange={() => toggleSpecialNeed(option.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific requests or dietary restrictions..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.address}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Request Help'}
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RequestHelp component error:', error);
    return null;
  }
}
