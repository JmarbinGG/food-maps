function FilterPanel({ filters = {}, onFiltersChange = () => {} }) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'produce', label: 'Fresh Produce' },
    { value: 'prepared', label: 'Prepared Meals' },
    { value: 'packaged', label: 'Packaged Foods' },
    { value: 'bakery', label: 'Bakery Items' },
    { value: 'seafood', label: 'Fresh Seafood' },
    { value: 'baby_food', label: 'Baby Food' },
    { value: 'catering', label: 'Catering/Events' },
    { value: 'international', label: 'International Foods' },
    { value: 'beverages', label: 'Beverages' }
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'all', label: 'All Status' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  try {
    return (
      <div className="border-b border-[var(--border-color)] p-4 bg-[var(--surface)]" data-name="filter-panel" data-file="components/FilterPanel.js">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-[var(--border-color)] rounded-lg text-sm"
            >
              {categories.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Status</label>
            <select
              value={filters.status || 'available'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-[var(--border-color)] rounded-lg text-sm"
            >
              {statuses.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FilterPanel component error:', error);
    return null;
  }
}
