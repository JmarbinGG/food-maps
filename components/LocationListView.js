// Location list view component with distance-based sorting
function LocationListView({ listings = [], onListingClick, userLocation }) {
  const [sortBy, setSortBy] = React.useState('distance');
  const [zipFilter, setZipFilter] = React.useState('');

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;
    
    if (diffHours < 1) return 'Just posted';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Produce': 'carrot',
      'Packaged Foods': 'package',
      'Prepared Meals': 'utensils',
      'Bread & Pastries': 'wheat',
      'Seafood': 'fish',
      'Soups': 'soup',
      'Baby Food': 'baby',
      'Catering': 'chef-hat',
      'International': 'globe'
    };
    return icons[category] || 'utensils';
  };

  const sortedListings = React.useMemo(() => {
    let sorted = [...listings];
    
    if (zipFilter) {
      sorted = sorted.filter(listing => 
        listing.address?.toLowerCase().includes(zipFilter.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'time':
        return sorted.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
      case 'quantity':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted;
    }
  }, [listings, sortBy, zipFilter]);

  return (
    <div className="h-full bg-[var(--surface)] flex flex-col" data-name="location-list-view" data-file="components/LocationListView.js">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border-color)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Food Near You
          </h2>
          <span className="text-sm text-[var(--text-secondary)]">
            {sortedListings.length} locations found
          </span>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Enter ZIP code or area..."
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm bg-white"
          >
            <option value="distance">Sort by Distance</option>
            <option value="time">Sort by Newest</option>
            <option value="quantity">Sort by Quantity</option>
          </select>
        </div>
      </div>

      {/* Location List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedListings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => onListingClick(listing)}
            className="bg-white rounded-lg shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-[var(--secondary-color)] rounded-lg flex items-center justify-center flex-shrink-0">
                <div className={`icon-${getCategoryIcon(listing.category)} text-xl text-[var(--primary-color)]`}></div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                      {typeof listing.donor === 'string' ? listing.donor : (listing.donor && listing.donor.name) || listing.donor_id || 'Anonymous Donor'}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">
                      {listing.foodType}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                      {listing.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end ml-3">
                    <span className={`status-${listing.status}`}>
                      {listing.status}
                    </span>
                    {listing.distance !== undefined && (
                      <span className="text-sm font-medium text-[var(--text-primary)] mt-1">
                        {formatDistance(listing.distance)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="icon-map-pin text-xs mr-1"></div>
                      {listing.address?.split(',')[0] || 'Location available'}
                    </span>
                    <span className="flex items-center">
                      <div className="icon-package text-xs mr-1"></div>
                      {listing.quantity} servings
                    </span>
                    <span className="flex items-center">
                      <div className="icon-clock text-xs mr-1"></div>
                      {formatTime(listing.postedAt)}
                    </span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mt-2">
                  <span className="inline-block bg-[var(--surface)] text-[var(--text-secondary)] px-2 py-1 rounded text-xs">
                    {listing.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sortedListings.length === 0 && (
          <div className="text-center py-12">
            <div className="icon-search text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-[var(--text-secondary)] mb-2">No locations found</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {zipFilter ? 'Try adjusting your search criteria' : 'Try enabling location services'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

window.LocationListView = LocationListView;