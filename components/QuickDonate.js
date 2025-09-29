function QuickDonate({ onClose, onSuccess }) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    address: '',
    coords: null,
    title: '',
    category: 'produce',
    qty: '',
    unit: 'lbs',
    perishability: 'medium',
    ready_at: '',
    window_end: '',
    notes: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [qrCode, setQrCode] = React.useState(null);

  const handleAddressSelect = async (address) => {
    setFormData(prev => ({ ...prev, address }));
    
    // Geocode address
    const geocoded = await window.geocodeAddress(address);
    if (geocoded) {
      setFormData(prev => ({
        ...prev,
        coords: { lat: geocoded.coordinates[1], lng: geocoded.coordinates[0] }
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create donation
      const donation = {
        ...formData,
        id: Date.now().toString(),
        status: 'available',
        created_at: new Date().toISOString(),
        urgency_score: 0
      };
      
      // Generate QR code for pickup
      const qrData = {
        id: donation.id,
        type: 'donation_pickup',
        address: formData.address
      };
      setQrCode(`QR_${donation.id}_PICKUP`);
      
      console.log('Quick donation created:', donation);
      
      // Send email/SMS with QR (mock)
      alert('Donation created! QR code and pickup link sent to your email.');
      
      setStep(3);
      
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Failed to create donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Where should we pick up?</h3>
      <div>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleAddressSelect(e.target.value)}
          placeholder="Enter pickup address..."
          className="w-full p-3 border border-gray-300 rounded-lg text-base"
          autoFocus
        />
        <p className="text-sm text-gray-500 mt-1">We'll use this for volunteer routing</p>
      </div>
      <button
        onClick={() => setStep(2)}
        disabled={!formData.address}
        className="btn-primary w-full disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">What are you sharing?</h3>
      
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="e.g., Fresh vegetables, Prepared meals..."
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      
      <div className="grid grid-cols-2 gap-3">
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="p-3 border border-gray-300 rounded-lg"
        >
          <option value="produce">Fresh Produce</option>
          <option value="prepared">Prepared Meals</option>
          <option value="packaged">Packaged Foods</option>
          <option value="bakery">Bakery Items</option>
          <option value="water">Water</option>
        </select>
        
        <select
          value={formData.perishability}
          onChange={(e) => setFormData(prev => ({ ...prev, perishability: e.target.value }))}
          className="p-3 border border-gray-300 rounded-lg"
        >
          <option value="high">Use within hours</option>
          <option value="medium">Use within days</option>
          <option value="low">Shelf stable</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={formData.qty}
          onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
          placeholder="Quantity"
          className="p-3 border border-gray-300 rounded-lg"
        />
        <select
          value={formData.unit}
          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
          className="p-3 border border-gray-300 rounded-lg"
        >
          <option value="lbs">Pounds</option>
          <option value="kg">Kilograms</option>
          <option value="items">Items</option>
          <option value="servings">Servings</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ready for pickup</label>
          <input
            type="datetime-local"
            value={formData.ready_at}
            onChange={(e) => setFormData(prev => ({ ...prev, ready_at: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Must pick up by</label>
          <input
            type="datetime-local"
            value={formData.window_end}
            onChange={(e) => setFormData(prev => ({ ...prev, window_end: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button onClick={() => setStep(1)} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.title || !formData.qty}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Share Food'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <div className="icon-check text-2xl text-green-600"></div>
      </div>
      
      <h3 className="text-lg font-semibold text-green-800">Donation Created!</h3>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-mono text-lg mb-2">{qrCode}</p>
        <p className="text-sm text-gray-600">Show this QR code to the volunteer at pickup</p>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>✓ Pickup link sent to your email</p>
        <p>✓ Volunteer will be assigned automatically</p>
        <p>✓ Tax receipt generated after pickup</p>
      </div>
      
      <button onClick={onSuccess} className="btn-primary w-full">
        Done
      </button>
    </div>
  );

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Quick Donate</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <div className="icon-x text-xl"></div>
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i <= step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Step {step} of 3</p>
          </div>
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    );
  } catch (error) {
    console.error('QuickDonate component error:', error);
    return null;
  }
}