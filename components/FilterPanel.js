function FilterPanel({ filters, onFiltersChange }) {
  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-3">Filters</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select 
            value={filters.category} 
            onChange={(e) => onFiltersChange({...filters, category: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="produce">Produce</option>
            <option value="prepared">Prepared</option>
            <option value="packaged">Packaged</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => onFiltersChange({...filters, status: e.target.value})}
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