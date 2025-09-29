function BulkListing({ user, onCancel, onSuccess }) {
  const [listings, setListings] = React.useState([{
    id: Date.now(),
    title: '',
    description: '',
    category: 'prepared',
    qty: '',
    unit: 'portions',
    best_before: '',
    photo_url: '',
    pickup_location: ''
  }]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const addListing = () => {
    setListings([...listings, {
      id: Date.now(),
      title: '',
      description: '',
      category: 'prepared',
      qty: '',
      unit: 'portions',
      best_before: '',
      photo_url: '',
      pickup_location: ''
    }]);
  };

  const removeListing = (id) => {
    setListings(listings.filter(listing => listing.id !== id));
  };

  const updateListing = (id, field, value) => {
    setListings(listings.map(listing => 
      listing.id === id ? { ...listing, [field]: value } : listing
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Creating bulk listings:', listings);
      alert(`Successfully created ${listings.length} food listings!`);
      onSuccess();
    } catch (error) {
      console.error('Error creating bulk listings:', error);
      alert('Failed to create listings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'prepared', label: 'Prepared Food' },
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'packaged', label: 'Packaged Items' },
    { value: 'bakery', label: 'Bakery Items' }
  ];

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Bulk Food Listing</h1>
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            </div>

            <div className="space-y-6">
              {listings.map((listing, index) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Listing #{index + 1}</h3>
                    {listings.length > 1 && (
                      <button
                        onClick={() => removeListing(listing.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <div className="icon-trash-2"></div>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Food Title *</label>
                      <input
                        type="text"
                        value={listing.title}
                        onChange={(e) => updateListing(listing.id, 'title', e.target.value)}
                        placeholder="e.g., Fresh sandwiches from cafe"
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        value={listing.category}
                        onChange={(e) => updateListing(listing.id, 'category', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={listing.qty}
                        onChange={(e) => updateListing(listing.id, 'qty', e.target.value)}
                        placeholder="e.g., 10 portions"
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Best Before *</label>
                      <input
                        type="datetime-local"
                        value={listing.best_before}
                        onChange={(e) => updateListing(listing.id, 'best_before', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                      <input
                        type="text"
                        value={listing.pickup_location}
                        onChange={(e) => updateListing(listing.id, 'pickup_location', e.target.value)}
                        placeholder="Street address or nearby landmark"
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={listing.description}
                        onChange={(e) => updateListing(listing.id, 'description', e.target.value)}
                        placeholder="Describe the food, any special instructions..."
                        className="w-full p-2 border border-gray-300 rounded"
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Photo URL (optional)</label>
                      <input
                        type="url"
                        value={listing.photo_url}
                        onChange={(e) => updateListing(listing.id, 'photo_url', e.target.value)}
                        placeholder="https://example.com/food-photo.jpg"
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">Add a photo to make your listing more appealing</p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addListing}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
              >
                <div className="icon-plus mr-2"></div>
                Add Another Listing
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Listings...' : `Post ${listings.length} Listings`}
                </button>
                <button onClick={onCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('BulkListing component error:', error);
    return null;
  }
}