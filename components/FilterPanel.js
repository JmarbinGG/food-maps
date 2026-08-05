function FilterPanel({ filters, onFiltersChange }) {
  const fallbackCategories = [
    { value: 'produce', label: 'Produce' },
    { value: 'prepared', label: 'Prepared' },
    { value: 'packaged', label: 'Packaged' },
  ];
  const [categories, setCategories] = React.useState(
    () => (Array.isArray(window.LISTING_CATEGORIES) && window.LISTING_CATEGORIES.length
      ? window.LISTING_CATEGORIES
      : fallbackCategories)
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((c) => ({ value: c.value, label: c.label || c.value }))
          : [];
        if (!cancelled && list.length) {
          setCategories(list);
          window.LISTING_CATEGORIES = list;
        }
      } catch (err) {
        console.warn('FilterPanel: failed to load categories', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-3">Filters</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="available">Available</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ZipLookupPopup({
  isOpen,
  onClose,
  zipInput,
  onZipInputChange,
  distance,
  onDistanceChange,
  locationLabel,
  searching,
  error,
  onApplyZip,
  onUseMyLocation,
  onClear
}) {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      try { inputRef.current && inputRef.current.focus(); } catch (_) { /* ignore */ }
    }, 50);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyZip?.();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zip-lookup-title"
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 id="zip-lookup-title" className="font-semibold text-gray-900">Update search area</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP code</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={zipInput}
              onChange={(e) => onZipInputChange?.(e.target.value)}
              placeholder="e.g. 94612"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {typeof distance !== 'undefined' && typeof onDistanceChange === 'function' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Within</label>
              <select
                value={distance}
                onChange={(e) => onDistanceChange?.(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {locationLabel && !error && (
            <p className="text-sm text-green-700">Currently showing near {locationLabel}</p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={searching}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
            >
              {searching ? 'Searching…' : 'Search this area'}
            </button>
            {typeof onUseMyLocation === 'function' && (
              <button
                type="button"
                disabled={searching}
                onClick={onUseMyLocation}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Use my location
              </button>
            )}
            {locationLabel && onClear && (
              <button
                type="button"
                onClick={() => { onClear(); onClose?.(); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear search area
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

window.FilterPanel = FilterPanel;
window.ZipLookupPopup = ZipLookupPopup;
