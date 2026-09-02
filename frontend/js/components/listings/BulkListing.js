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

  // A guaranteed-visible alert: prefer the in-app modal, but ALWAYS
  // fall back to window.alert so the user never gets a silent button.
  const notify = (msg, opts) => {
    try {
      if (typeof window !== 'undefined' && typeof window.showAlert === 'function') {
        window.showAlert(msg, opts || {});
        return;
      }
    } catch (_) { /* fall through to alert */ }
    try { alert(msg); } catch (_) { /* nothing else we can do */ }
  };

  const handleSubmit = async () => {
    // Diagnostic: confirm the click handler fired even when something
    // else swallows the alert. Visible in DevTools console.
    try { console.log('[BulkListing] Post clicked', { rows: listings.length, user: user && user.id }); } catch (_) {}

    // Validate required fields up-front so we don't fire off half-baked
    // requests against the server.
    const missing = [];
    listings.forEach((l, idx) => {
      if (!l.title || !l.title.trim()) missing.push(`#${idx + 1} title`);
      if (!l.qty || isNaN(parseFloat(l.qty)) || parseFloat(l.qty) <= 0) missing.push(`#${idx + 1} qty`);
      if (!l.pickup_location || !l.pickup_location.trim()) missing.push(`#${idx + 1} pickup location`);
      if (!l.best_before) missing.push(`#${idx + 1} best-before`);
    });
    if (missing.length) {
      notify(
        `Please complete the required fields: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}.`,
        { title: 'Missing info', variant: 'error' }
      );
      return;
    }
    if (!user || user.id == null) {
      notify('Please sign in as a donor before posting listings.', { title: 'Sign in required', variant: 'error' });
      return;
    }
    if (!window.databaseService || typeof window.databaseService.createListing !== 'function') {
      notify('App is still loading. Please wait a moment and try again.', { title: 'Not ready', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    const results = { success: [], failed: [] };
    try {
      for (let i = 0; i < listings.length; i++) {
        const l = listings[i];
        // best_before is a datetime-local string (YYYY-MM-DDTHH:mm). Use
        // it for both expiration_date AND as the pickup window end so the
        // listing is still pickable until the food expires. Default the
        // pickup start to "now" so recipients can pick it up immediately.
        const expiry = l.best_before;
        let pickupStart, pickupEnd;
        try {
          pickupStart = new Date().toISOString();
          const d = new Date(expiry);
          if (isNaN(d.getTime())) throw new Error('Invalid best-before date');
          pickupEnd = d.toISOString();
        } catch (dateErr) {
          results.failed.push({ title: l.title, error: `Invalid best-before date (${expiry || 'empty'})` });
          continue;
        }
        const payload = {
          donor_id: user.id,
          title: l.title.trim(),
          desc: (l.description || '').trim(),
          category: l.category || 'prepared',
          qty: parseFloat(l.qty),
          unit: l.unit || 'units',
          perishability: 'medium',
          address: l.pickup_location.trim(),
          pickup_start: pickupStart,
          pickup_end: pickupEnd,
          images: (l.photo_url && l.photo_url.trim()) ? [l.photo_url.trim()] : [],
        };
        try {
          const res = await window.databaseService.createListing(payload);
          if (res && (res.success || res.listing)) {
            results.success.push(l.title);
          } else {
            results.failed.push({ title: l.title, error: (res && res.error) || 'unknown error' });
          }
        } catch (rowErr) {
          results.failed.push({ title: l.title, error: rowErr.message || 'network error' });
        }
      }

      // Notify the rest of the app so the map refetches.
      try {
        window.dispatchEvent(new CustomEvent('foodmaps:listings_changed', {
          detail: { actions: results.success.map(() => ({ tool: 'bulk_import_listings', ok: true })) },
        }));
      } catch (_) { /* ignore */ }

      if (results.failed.length === 0) {
        notify(`Successfully posted ${results.success.length} listing${results.success.length === 1 ? '' : 's'}!`, { title: 'Done', variant: 'success' });
        if (typeof onSuccess === 'function') onSuccess();
      } else if (results.success.length === 0) {
        notify(
          `All ${results.failed.length} listings failed. First error: ${results.failed[0].error}`,
          { title: 'Bulk post failed', variant: 'error' }
        );
      } else {
        notify(
          `Posted ${results.success.length} of ${listings.length} listings. ${results.failed.length} failed (e.g. "${results.failed[0].title}": ${results.failed[0].error}).`,
          { title: 'Partial success', variant: 'warning' }
        );
        if (typeof onSuccess === 'function') onSuccess();
      }
    } catch (error) {
      console.error('[BulkListing] submit error:', error);
      notify(`Failed to create listings: ${error && error.message || error}`, { title: 'Error', variant: 'error' });
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
              <button type="button" onClick={onCancel} className="btn-secondary">
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
                        type="button"
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
                type="button"
                onClick={addListing}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
              >
                <div className="icon-plus mr-2"></div>
                Add Another Listing
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Listings...' : `Post ${listings.length} Listings`}
                </button>
                <button type="button" onClick={onCancel} className="btn-secondary">
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