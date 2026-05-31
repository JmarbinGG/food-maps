function AIFoodSearch({ onClose, onSelectFood }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState(null);
  const [searchFilters, setSearchFilters] = React.useState({
    radius: 10,
    urgency: 'any',
    category: 'any'
  });
  // ---- Inline ghost-text autocomplete state ----
  // Mirrors the chatbot's autocomplete model: shortest matching phrase
  // from a static pool, accepted with Tab or ArrowRight-at-end,
  // dismissed with Escape, ignored mid-IME-composition.
  const dismissedQuerySuggestionsRef = React.useRef(new Set());
  const [querySuggestionTick, setQuerySuggestionTick] = React.useState(0);
  const [queryInputScrollLeft, setQueryInputScrollLeft] = React.useState(0);
  const queryInputRef = React.useRef(null);

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
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // Default NYC
        }
      );
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchRequest = {
        query: searchQuery,
        location: userLocation,
        category: searchFilters.category,
        radius_km: searchFilters.radius,
        urgency: searchFilters.urgency,
        household_size: 1
      };

      const matches = await window.agentAPI.findBestMatches(searchRequest);
      setSearchResults(matches);
    } catch (error) {
      console.error('AI search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    handleAISearch();
  };

  const quickSearchOptions = [
    'Fresh vegetables near me',
    'Ready meals for pickup today',
    'Water bottles urgently needed',
    'Bread and bakery items',
    'Fruit for large family'
  ];

  // Larger pool used only by the inline ghost-text autocomplete. The
  // quickSearchOptions above are also chips below the input, so we
  // include them here so a user who starts typing the chip text gets
  // the rest auto-completed too. Kept English-only for now; matches
  // are case-insensitive so capitalization in user typing doesn't
  // matter.
  const autocompletePool = [
    ...quickSearchOptions,
    'Fresh vegetables for family of 4',
    'Urgent water bottles for emergency',
    'Hot prepared meals for tonight',
    'Baby food and infant formula',
    'Bread, rolls, and pastries',
    'Canned goods for the pantry',
    'Dairy products near me',
    'Eggs and milk',
    'Fruits in season',
    'Frozen meals and entrees',
    'Gluten-free options',
    'Halal food options',
    'Kosher food options',
    'Pet food and supplies',
    'Rice, pasta, and grains',
    'Vegan or vegetarian meals',
    'Snacks for school lunches',
    'Soup and broth',
    'Emergency food assistance',
    'Holiday meal ingredients',
  ];

  function findQuerySuggestion(value) {
    if (!value) return '';
    const visible = value.replace(/^\s+/, '');
    // Require 2+ visible chars so the ghost doesn't flicker on every
    // single keystroke.
    if (visible.length < 2) return '';
    const needle = value.toLowerCase();
    const dismissed = dismissedQuerySuggestionsRef.current;
    let best = '';
    for (const phrase of autocompletePool) {
      if (phrase.length <= value.length) continue;
      const lower = phrase.toLowerCase();
      if (!lower.startsWith(needle)) continue;
      if (dismissed.has(lower)) continue;
      // Shortest match = least intrusive completion.
      if (!best || phrase.length < best.length) best = phrase;
    }
    return best;
  }

  const querySuggestion = React.useMemo(
    () => findQuerySuggestion(searchQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, querySuggestionTick],
  );

  // Wipe the dismissed set whenever the input goes empty so the next
  // sentence starts fresh.
  React.useEffect(() => {
    if (!searchQuery && dismissedQuerySuggestionsRef.current.size) {
      dismissedQuerySuggestionsRef.current = new Set();
      setQuerySuggestionTick((t) => t + 1);
    }
  }, [searchQuery]);

  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="icon-brain text-white text-sm"></div>
                </div>
                <h2 className="text-xl font-bold">AI Food Agent</h2>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <div className="icon-x text-xl"></div>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <div
                  className="relative flex-1"
                  style={{ display: 'flex' }}
                >
                  {/* Ghost-text overlay — absolutely positioned behind
                      the input. Padding/border/font-size match the
                      input exactly so the suffix lines up with the
                      user's typed text. */}
                  {querySuggestion && !isSearching && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        padding: '0.75rem', // p-3
                        border: '1px solid transparent',
                        borderRadius: '0.5rem', // rounded-lg
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                        fontFamily: 'inherit',
                        whiteSpace: 'pre',
                        overflow: 'hidden',
                        textOverflow: 'clip',
                        color: '#9ca3af',
                      }}
                    >
                      <span style={{ display: 'inline-block', transform: `translateX(${-queryInputScrollLeft}px)` }}>
                        <span style={{ color: 'transparent' }}>{searchQuery}</span>
                        <span>{querySuggestion.slice(searchQuery.length)}</span>
                      </span>
                    </div>
                  )}
                  <input
                    ref={queryInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onScroll={(e) => setQueryInputScrollLeft(e.target.scrollLeft)}
                    placeholder="Hi! I'm your AI Food Agent. Tell me what you need... 'fresh vegetables for family of 4' or 'urgent water bottles'"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    style={{ background: 'transparent', position: 'relative', zIndex: 1, minWidth: 0 }}
                    autoComplete="off"
                    aria-autocomplete="inline"
                    onKeyDown={(e) => {
                      // Let IME compositions (CJK, dead-key accents)
                      // build their character without us hijacking
                      // Tab/ArrowRight/Esc.
                      if (e.nativeEvent && e.nativeEvent.isComposing) return;
                      if (querySuggestion && !isSearching) {
                        const liveLen = e.target.value.length;
                        const atEnd = e.target.selectionStart === liveLen
                          && e.target.selectionEnd === liveLen;
                        if (e.key === 'Tab' || (e.key === 'ArrowRight' && atEnd)) {
                          e.preventDefault();
                          setSearchQuery(querySuggestion);
                          return;
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          dismissedQuerySuggestionsRef.current.add(querySuggestion.toLowerCase());
                          setQuerySuggestionTick((t) => t + 1);
                          return;
                        }
                      }
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isSearching) handleAISearch();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleAISearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="icon-loader animate-spin"></div>
                  ) : (
                    <div className="icon-search"></div>
                  )}
                </button>
              </div>

              <div className="flex space-x-4 text-sm">
                <select
                  value={searchFilters.radius}
                  onChange={(e) => setSearchFilters(prev => ({...prev, radius: parseInt(e.target.value)}))}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value={3}>Within 3 miles</option>
                  <option value={6}>Within 6 miles</option>
                  <option value={15}>Within 15 miles</option>
                </select>
                
                <select
                  value={searchFilters.category}
                  onChange={(e) => setSearchFilters(prev => ({...prev, category: e.target.value}))}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="any">Any Category</option>
                  <option value="produce">Fresh Produce</option>
                  <option value="prepared">Prepared Meals</option>
                  <option value="water">Water</option>
                  <option value="bakery">Bakery Items</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickSearchOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => handleQuickSearch(option)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Found {searchResults.length} matches
                </h3>
                
                {searchResults.map(match => (
                  <div key={match.donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{match.donation.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.score > 80 ? 'bg-green-100 text-green-800' :
                          match.score > 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {match.score}% match
                        </span>
                        <span className="text-sm text-gray-500">
                          {match.distance.toFixed(1)} mi away
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {match.donation.qty} {match.donation.unit} • {match.donation.category}
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-3">
                       {match.donation.address}
                    </p>
                    
                    <button
                      onClick={() => {
                        onSelectFood(match.donation);
                        onClose();
                      }}
                      className="btn-primary text-sm"
                    >
                      Select This Food
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8">
                <div className="icon-search text-3xl text-gray-400 mb-2"></div>
                <p className="text-gray-500">No matches found for your search</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or expanding the radius</p>
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="icon-brain text-2xl text-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your AI Food Agent is Ready</h3>
                <p className="text-gray-600 mb-4">I can help you find exactly what you need using natural language</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p> Just tell me what you're looking for</p>
                  <p> I'll find the best matches nearby</p>
                  <p> I consider distance, freshness, and your preferences</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AIFoodSearch component error:', error);
    return null;
  }
}