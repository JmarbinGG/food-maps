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
  // Address (Mapbox Autofill element)
  const [addressQuery, setAddressQuery] = React.useState('');
  const [addressSelected, setAddressSelected] = React.useState(null);
  const autofillRef = React.useRef(null);
  const suppressNextChange = React.useRef(false);

  // Build a single-line, human-friendly full address from a Mapbox feature
  const formatFullAddressFromFeature = React.useCallback((feat) => {
    try {
      const p = (feat && feat.properties) || {};
      const ctx = Array.isArray(feat && feat.context) ? feat.context : [];
      const getCtx = (regex) => ctx.find((c) => typeof c.id === 'string' && regex.test(c.id)) || {};

      const place = p.place || p.city || getCtx(/place\./).text;
      const region = p.region_code || p.region || (getCtx(/region\./).short_code ? getCtx(/region\./).short_code.split('-').pop() : getCtx(/region\./).text);
      const postcode = p.postcode || getCtx(/postcode\./).text;
      const line1 = p.address_line1 || [p.housenumber, p.street].filter(Boolean).join(' ');

      let composed = [
        line1 || p.name || '',
        place || '',
        [region || '', postcode || ''].filter(Boolean).join(' ')
      ].filter(Boolean).join(', ');

      if (!composed || composed.length < 5) {
        composed = feat.place_name || '';
      }
      // Trim trailing country for brevity
      composed = composed.replace(/,\s*United States$/i, '').trim();
      return composed;
    } catch (_) {
      return (feat && feat.place_name) || '';
    }
  }, []);

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

  // Initialize addressQuery from formData on mount
  React.useEffect(() => {
    setAddressQuery(formData.address || '');
    setAddressSelected(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to Mapbox Autofill "retrieve" event to capture the selected result
  React.useEffect(() => {
    const el = autofillRef.current;
    if (!el) return;
    const handleRetrieve = (e) => {
      try {
        let feat = null;
        const d = e && e.detail;
        if (d) {
          if (Array.isArray(d.features) && d.features[0]) {
            feat = d.features[0];
          } else if (Array.isArray(d) && d[0]) {
            // Some integrations emit an array of features directly
            feat = d[0];
          } else if (d.feature) {
            feat = d.feature;
          }
        }
        if (feat) {
          const selected = {
            id: feat.id,
            place_name: feat.place_name,
            center: feat.center,
            properties: feat.properties || {},
            feature: feat
          };
          setAddressSelected(selected);
          const preferred = (feat.properties && (feat.properties.full_address || feat.properties.fullAddress || feat.properties.address_line1)) || '';
          const formatted = preferred || formatFullAddressFromFeature(feat) || selected.place_name || '';
          // Defer update to run after the web component populates fields, so our full string wins
          suppressNextChange.current = true;
          setTimeout(() => {
            setAddressQuery(formatted);
            setFormData(prev => ({ ...prev, address: formatted }));
            // small delay to ignore the component's own change event
            setTimeout(() => { suppressNextChange.current = false; }, 150);
          }, 0);
          if (errors.address) setErrors({ ...errors, address: null });
        }
      } catch (_) {}
    };
    el.addEventListener('retrieve', handleRetrieve);
    return () => {
      try { el.removeEventListener('retrieve', handleRetrieve); } catch (_) {}
    };
  }, [errors.address, formatFullAddressFromFeature]);

  // Helper to format Date -> 'YYYY-MM-DDTHH:mm' in local time for datetime-local inputs
  const toLocalInput = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.qty || formData.qty <= 0) newErrors.qty = 'Valid quantity is required';
  if (!String(formData.address || '').trim()) newErrors.address = 'Pickup address is required';
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
    // Require auth token (server needs to tie phone to an authenticated donor)
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
  if (typeof window.showAlert === 'function') window.showAlert('Please sign in as a donor to create a listing.', { title: 'Sign in required', variant: 'error' });
        try { if (typeof window.openAuthModal === 'function') window.openAuthModal(); } catch (_) {}
        setIsSubmitting(false);
        return;
      }
    } catch (_) {}
    // Ensure donor has a phone number before allowing listing creation
    try {
      if (window.userAPI && typeof window.userAPI.getMeV2 === 'function') {
        const me = await window.userAPI.getMeV2();
        const phone = (me && me.phone) ? String(me.phone).trim() : '';
        if (!phone || phone.length < 7) {
          if (typeof window.requestPhone === 'function') {
            const ok = await window.requestPhone();
            if (!ok) {
              if (typeof window.showAlert === 'function') window.showAlert('A phone number is required to create a listing.', { title: 'Phone required', variant: 'error' });
              setIsSubmitting(false);
              return;
            }
          } else {
            if (typeof window.showAlert === 'function') window.showAlert('A phone number is required to create a listing.', { title: 'Phone required', variant: 'error' });
            setIsSubmitting(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Phone precheck unavailable, server will enforce');
    }
    // Normalize final address from selected feature if available
    let finalAddress = (formData.address || addressQuery || '').trim();
    try {
      if (addressSelected && addressSelected.feature) {
        const props = addressSelected.feature.properties || {};
        const fromFeatPreferred = props.full_address || props.fullAddress || props.address_line1 || '';
        const recomposed = fromFeatPreferred || formatFullAddressFromFeature(addressSelected.feature) || addressSelected.place_name || '';
        if (recomposed) finalAddress = recomposed;
      }
    } catch (_) {}

    const urlParams = new URLSearchParams({
      donor_id: JSON.parse(localStorage.getItem("current_user"))['id'],
      title: formData.title,
      desc: formData.description,
      category: formData.category,
      qty: formData.qty,
      unit: formData.unit,
      perishability: formData.perishability,
      address: finalAddress,
      pickup_start: formData.pickup_window_start,
      pickup_end: formData.pickup_window_end
    });

    try {
      // Validate address: require a selected suggestion or a geocoding hit
      try {
        if (!addressSelected) {
          const geo = typeof window.geocodeAddress === 'function' ? await window.geocodeAddress(finalAddress) : null;
          if (!geo) {
            if (typeof window.showAlert === 'function') window.showAlert('Please choose a valid address from the suggestions.', { title: 'Invalid address', variant: 'error' });
            setIsSubmitting(false);
            return;
          }
        }
      } catch (_) {}

      const payload = {
        donor_id: JSON.parse(localStorage.getItem('current_user'))['id'],
        title: formData.title,
        desc: formData.description,
        category: formData.category,
        qty: formData.qty,
        unit: formData.unit,
        perishability: formData.perishability,
        address: finalAddress,
        pickup_start: formData.pickup_window_start,
        pickup_end: formData.pickup_window_end
      };

      let res = await (window.databaseService ? window.databaseService.createListing(payload) : { success: false, error: 'No DB service' });
      if (res && res.success) {
  console.log('Created listing:', res.data || res);
  if (typeof window.showAlert === 'function') window.showAlert('Listing created successfully!', { title: 'Success', variant: 'success' });
        onSuccess();
      } else {
        let err = (res && res.error) || 'Failed to create listing';
        console.error('Create listing failed:', err);
        // If failure due to missing phone, prompt and retry once
        if (/phone/i.test(String(err))) {
          if (typeof window.requestPhone === 'function') {
            const ok = await window.requestPhone();
            if (ok) {
              res = await (window.databaseService ? window.databaseService.createListing(payload) : { success: false, error: 'No DB service' });
              if (res && res.success) {
                console.log('Created listing after phone:', res.data || res);
                if (typeof window.showAlert === 'function') window.showAlert('Listing created successfully!', { title: 'Success', variant: 'success' });
                onSuccess();
                setIsSubmitting(false);
                return;
              }
              err = (res && res.error) || err;
            }
          }
        }
  if (typeof window.showAlert === 'function') window.showAlert('Failed to create listing. ' + err, { title: 'Error', variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating listing:', error);
  if (typeof window.showAlert === 'function') window.showAlert('Failed to create listing. ' + (error?.message || 'Please try again.'), { title: 'Error', variant: 'error' });
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

              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Pickup Address *
                </label>
                <mapbox-address-autofill
                  ref={autofillRef}
                  access-token={window.MAPBOX_ACCESS_TOKEN || ''}
                  options='{"language":"en"}'
                >
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={addressQuery}
                    onChange={(e) => {
                      if (suppressNextChange.current) return;
                      setAddressQuery(e.target.value);
                      setAddressSelected(null);
                      setFormData(prev => ({ ...prev, address: e.target.value }));
                    }}
                    className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                    placeholder="Search address with Mapbox"
                  />
                </mapbox-address-autofill>
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Pickup Window Start *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={formData.pickup_window_start}
                      onChange={(e) => handleInputChange('pickup_window_start', e.target.value)}
                      className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                    />
                    <button
                      type="button"
                      className="btn-secondary whitespace-nowrap"
                      onClick={() => {
                        // Set to now rounded up to the next 5 minutes for nicer times
                        const now = new Date();
                        const ms = 1000 * 60 * 5; // 5 minutes
                        const rounded = new Date(Math.ceil(now.getTime() / ms) * ms);
                        handleInputChange('pickup_window_start', toLocalInput(rounded));
                      }}
                    >
                      Now
                    </button>
                  </div>
                  {errors.pickup_window_start && <p className="text-red-500 text-sm mt-1">{errors.pickup_window_start}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Pickup Window End *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={formData.pickup_window_end}
                      onChange={(e) => handleInputChange('pickup_window_end', e.target.value)}
                      className="w-full p-3 border border-[var(--border-color)] rounded-lg"
                    />
                    <button
                      type="button"
                      className="btn-secondary whitespace-nowrap"
                      onClick={() => {
                        // Convenience: if start set, end = start + 2h; else now + 2h
                        const base = formData.pickup_window_start ? new Date(formData.pickup_window_start) : new Date();
                        base.setHours(base.getHours() + 2);
                        handleInputChange('pickup_window_end', toLocalInput(base));
                      }}
                    >
                      +2h
                    </button>
                  </div>
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
