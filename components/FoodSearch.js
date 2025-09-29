function FoodSearch({ onClose, onSelectFood, user }) {
  const [searchMode, setSearchMode] = React.useState('quick'); // 'quick', 'advanced', 'ai'
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState(null);
  const [searchFilters, setSearchFilters] = React.useState({
    category: 'all',
    radius: 10,
    perishability: 'all',
    sortBy: 'distance',
    minQuantity: '',
    maxDistance: 25,
    availableToday: false,
    dietaryRestrictions: []
  });

  const quickSearchOptions = [
    { query: 'Fresh vegetables', icon: '🥬', category: 'produce' },
    { query: 'Ready meals', icon: '🍽️', category: 'prepared' },
    { query: 'Water bottles', icon: '💧', category: 'water' },
    { query: 'Bread and bakery', icon: '🍞', category: 'bakery' },
    { query: 'Fruit for family', icon: '🍎', category: 'produce' },
    { query: 'Canned goods', icon: '🥫', category: 'packaged' }
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'diabetic-friendly'
  ];

  React.useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && searchMode !== 'advanced') return;
    
    setIsSearching(true);
    try {
      const searchRequest = {
        query: searchQuery,
        location: userLocation,
        ...searchFilters,
        household_size: user?.household_size || 1
      };

      let results = [];
      
      if (searchMode === 'ai') {
        results = await window.agentAPI.findBestMatches(searchRequest);
      } else {
        results = await performStandardSearch(searchRequest);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const performStandardSearch = async (request) => {
    const listings = window.getMockListings() || [];
    let filtered = listings.filter(listing => listing.status === 'available');

    // Apply filters
    if (request.category !== 'all') {
      filtered = filtered.filter(l => l.category === request.category);
    }
    
    if (request.perishability !== 'all') {
      filtered = filtered.filter(l => l.perishability === request.perishability);
    }
    
    if (request.availableToday) {
      const today = new Date().toDateString();
      filtered = filtered.filter(l => {
        const pickupDate = new Date(l.pickup_window_start).toDateString();
        return pickupDate === today;
      });
    }
    
    if (request.minQuantity) {
      filtered = filtered.filter(l => l.qty >= parseFloat(request.minQuantity));
    }

    // Calculate distances and filter by radius
    const withDistance = filtered.map(listing => {
      const distance = userLocation && listing.coords ?
        window.calculateDistance(
          userLocation.lat, userLocation.lng,
          listing.coords.lat, listing.coords.lng
        ) : 0;
      
      return {
        donation: listing,
        distance,
        score: calculateRelevanceScore(listing, request.query)
      };
    }).filter(item => item.distance <= request.maxDistance);

    // Sort results
    if (request.sortBy === 'distance') {
      withDistance.sort((a, b) => a.distance - b.distance);
    } else if (request.sortBy === 'relevance') {
      withDistance.sort((a, b) => b.score - a.score);
    } else if (request.sortBy === 'newest') {
      withDistance.sort((a, b) => new Date(b.donation.created_at) - new Date(a.donation.created_at));
    }

    return withDistance.slice(0, 20); // Limit to 20 results
  };

  const calculateRelevanceScore = (listing, query) => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    if (listing.title.toLowerCase().includes(queryLower)) score += 50;
    if (listing.description?.toLowerCase().includes(queryLower)) score += 30;
    if (listing.category.toLowerCase().includes(queryLower)) score += 40;
    
    // Boost score for fresh items
    if (listing.perishability === 'high') score += 10;
    
    return score;
  };

  const handleQuickSearch = (option) => {
    setSearchQuery(option.query);
    setSearchFilters(prev => ({ ...prev, category: option.category }));
    setTimeout(handleSearch, 100);
  };

  const toggleDietaryRestriction = (restriction) => {
    setSearchFilters(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Find Food</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <div className="icon-x text-xl"></div>
              </button>
            </div>

            {/* Search Mode Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setSearchMode('quick')}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition ${
                  searchMode === 'quick' ? 'bg-white text-green-600 shadow' : 'text-gray-600'
                }`}
              >
                Quick Search
              </button>
              <button
                onClick={() => setSearchMode('advanced')}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition ${
                  searchMode === 'advanced' ? 'bg-white text-green-600 shadow' : 'text-gray-600'
                }`}
              >
                Advanced
              </button>
              <button
                onClick={() => setSearchMode('ai')}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition ${
                  searchMode === 'ai' ? 'bg-white text-green-600 shadow' : 'text-gray-600'
                }`}
              >
                AI Agent
              </button>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode === 'ai' ? 
                  "Tell me what you need... 'fresh vegetables for family of 4'" :
                  "Search for food items..."
                }
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSearching ? <div className="icon-loader animate-spin"></div> : <div className="icon-search"></div>}
              </button>
            </div>

            {/* Quick Search Options */}
            {searchMode === 'quick' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickSearchOptions.map(option => (
                  <button
                    key={option.query}
                    onClick={() => handleQuickSearch(option)}
                    className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm">{option.query}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Advanced Filters */}
            {searchMode === 'advanced' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters(prev => ({...prev, category: e.target.value}))}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="all">All Categories</option>
                    <option value="produce">Fresh Produce</option>
                    <option value="prepared">Prepared Meals</option>
                    <option value="packaged">Packaged Foods</option>
                    <option value="bakery">Bakery Items</option>
                    <option value="water">Water</option>
                  </select>

                  <select
                    value={searchFilters.sortBy}
                    onChange={(e) => setSearchFilters(prev => ({...prev, sortBy: e.target.value}))}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="distance">Nearest First</option>
                    <option value="relevance">Most Relevant</option>
                    <option value="newest">Recently Added</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Min quantity"
                    value={searchFilters.minQuantity}
                    onChange={(e) => setSearchFilters(prev => ({...prev, minQuantity: e.target.value}))}
                    className="p-2 border border-gray-300 rounded"
                  />

                  <select
                    value={searchFilters.radius}
                    onChange={(e) => setSearchFilters(prev => ({...prev, radius: parseInt(e.target.value)}))}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value={5}>Within 5km</option>
                    <option value={10}>Within 10km</option>
                    <option value={25}>Within 25km</option>
                    <option value={50}>Within 50km</option>
                  </select>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={searchFilters.dietaryRestrictions.includes(option)}
                          onChange={() => toggleDietaryRestriction(option)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.availableToday}
                      onChange={(e) => setSearchFilters(prev => ({...prev, availableToday: e.target.checked}))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Available for pickup today</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="p-6 overflow-y-auto max-h-96">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Found {searchResults.length} results
                </h3>
                
                {searchResults.map(result => (
                  <div key={result.donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.donation.title}</h4>
                      <div className="flex items-center space-x-2">
                        {searchMode === 'ai' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.score > 80 ? 'bg-green-100 text-green-800' :
                            result.score > 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.score}% match
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {result.distance.toFixed(1)}km away
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {result.donation.qty} {result.donation.unit} • {result.donation.category}
                    </p>
                    
                    {result.donation.description && (
                      <p className="text-xs text-gray-500 mb-2">{result.donation.description}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mb-3">
                      📍 {result.donation.address}
                    </p>
                    
                    <button
                      onClick={() => {
                        onSelectFood(result.donation);
                        onClose();
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      Select This Food
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8">
                <div className="icon-search text-3xl text-gray-400 mb-2"></div>
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-8">
                <div className="icon-utensils text-3xl text-green-500 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Food Near You</h3>
                <p className="text-gray-600 mb-4">Search for available food donations in your area</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>🔍 Use quick search for common items</p>
                  <p>⚙️ Try advanced filters for specific needs</p>
                  <p>🤖 Use AI agent for natural language search</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FoodSearch component error:', error);
    return null;
  }
}
