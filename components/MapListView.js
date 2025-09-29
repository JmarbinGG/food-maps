function MapListView({ listings, onListingSelect, onClaimListing, user }) {
  try {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [groupedLocations, setGroupedLocations] = React.useState([]);
    const [selectedLocation, setSelectedLocation] = React.useState(null);
    const [showLocationFood, setShowLocationFood] = React.useState(false);

    React.useEffect(() => {
      // Group available listings by address/location
      const availableListings = (listings || []).filter(listing => 
        listing.status === 'available'
      );
      
      const locationGroups = {};
      availableListings.forEach(listing => {
        const address = listing.address || listing.pickup_address || 'Unknown Location';
        if (!locationGroups[address]) {
          locationGroups[address] = {
            address: address,
            coordinates: listing.coordinates,
            foodItems: [],
            totalItems: 0
          };
        }
        locationGroups[address].foodItems.push(listing);
        locationGroups[address].totalItems += 1;
      });
      
      setGroupedLocations(Object.values(locationGroups));
    }, [listings]);

    const getCategoryIcon = (category) => {
      const icons = {
        produce: 'apple',
        prepared: 'chef-hat', 
        packaged: 'package',
        beverages: 'cup-soda',
        bakery: 'croissant',
        dairy: 'milk'
      };
      return icons[category] || 'package';
    };

    const getPriorityColor = (priority) => {
      const colors = {
        emergency: 'text-red-600 bg-red-100',
        high: 'text-orange-600 bg-orange-100',
        normal: 'text-blue-600 bg-blue-100', 
        low: 'text-gray-600 bg-gray-100'
      };
      return colors[priority] || colors.normal;
    };

    const handleLocationClick = (location) => {
      setSelectedLocation(location);
      setShowLocationFood(true);
    };

    const handleBackToLocations = () => {
      setShowLocationFood(false);
      setSelectedLocation(null);
    };

    const getCategoryMix = (foodItems) => {
      const categories = [...new Set(foodItems.map(item => item.category))];
      return categories.slice(0, 3);
    };

    return (
      <div 
        className={`bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ${
          isExpanded ? 'h-80' : 'h-20'
        }`}
        data-name="map-list-view" 
        data-file="components/MapListView.js"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
          onClick={() => showLocationFood ? handleBackToLocations() : setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            {showLocationFood && (
              <button 
                onClick={(e) => {e.stopPropagation(); handleBackToLocations();}}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                <div className="icon-arrow-left text-gray-600"></div>
              </button>
            )}
            <div className="icon-map-pin text-xl text-gray-600 mr-3"></div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {showLocationFood 
                  ? `Food at Location (${selectedLocation?.totalItems || 0})` 
                  : `Locations (${groupedLocations.length})`
                }
              </h3>
              <p className="text-sm text-gray-500">
                {showLocationFood 
                  ? selectedLocation?.address
                  : isExpanded ? 'Click to minimize' : 'Click to view all locations'
                }
              </p>
            </div>
          </div>
          <div className={`icon-chevron-up text-gray-600 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}></div>
        </div>

        {/* List Content */}
        {isExpanded && !showLocationFood && (
          <div className="px-4 pb-4 h-64 overflow-y-auto">
            {groupedLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="icon-search text-4xl mb-2"></div>
                <p>No locations with available food</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedLocations.map((location, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    onClick={() => handleLocationClick(location)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 bg-blue-100">
                          <div className="icon-map-pin text-blue-600"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {location.address}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {location.totalItems} food item{location.totalItems !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex -space-x-1">
                        {getCategoryMix(location.foodItems).map(category => (
                          <div 
                            key={category}
                            className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center"
                          >
                            <div className={`icon-${getCategoryIcon(category)} text-xs text-green-600`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Food Details for Selected Location */}
        {isExpanded && showLocationFood && selectedLocation && (
          <div className="px-4 pb-4 h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedLocation.foodItems.map(listing => (
                <div 
                  key={listing.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  onClick={() => onListingSelect && onListingSelect(listing)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 bg-green-100">
                        <div className={`icon-${getCategoryIcon(listing.category)} text-green-600`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {listing.qty} {listing.unit}
                        </p>
                      </div>
                    </div>
                    {listing.priority_level && listing.priority_level !== 'normal' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(listing.priority_level)}`}>
                        {listing.priority_level}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {listing.description}
                  </p>
                  
                  <div className="flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onClaimListing) {
                          onClaimListing(listing.id);
                        }
                      }}
                      disabled={!user}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {user ? 'Claim' : 'Sign In'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('MapListView component error:', error);
    return (
      <div className="bg-white border-t border-gray-200 h-20 flex items-center justify-center">
        <p className="text-gray-500">Unable to load food listings</p>
      </div>
    );
  }
}

window.MapListView = MapListView;