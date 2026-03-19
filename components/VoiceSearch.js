// VoiceSearch.js - Voice-activated search and conversational help
// Especially powerful for seniors, low-literacy users, and hands-free operation

const VoiceSearch = () => {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [conversationHistory, setConversationHistory] = React.useState([]);
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  const [textInput, setTextInput] = React.useState('');
  const [useTextInput, setUseTextInput] = React.useState(false);
  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Voice search not supported, enabling text input fallback');
      setVoiceEnabled(false);
      setUseTextInput(true);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processVoiceCommand(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setResponse("I didn't hear anything. Please try again.");
      } else if (event.error === 'not-allowed') {
        setResponse('Microphone access denied. Please enable microphone permissions.');
      } else {
        setResponse('Sorry, I had trouble understanding. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase().trim();

    // Add to conversation history
    const newHistory = [...conversationHistory, { type: 'user', text: command }];
    setConversationHistory(newHistory);

    let responseText = '';
    let action = null;

    // Parse natural language queries
    try {
      // Location-based queries
      if (lowerCommand.match(/where can i (get|find)|near me|close to me|nearby/i)) {
        const foodType = extractFoodType(lowerCommand);
        action = { type: 'search', query: foodType || 'food', useLocation: true };
        responseText = `Looking for ${foodType || 'food'} near you...`;
      }

      // Time-based queries
      else if (lowerCommand.match(/open (after|before|at|now)|available (after|before|at|now)|hours|when.*open/i)) {
        const time = extractTime(lowerCommand);
        action = { type: 'filter', filterType: 'time', value: time };
        responseText = time ? `Searching for locations open ${time}...` : 'Searching for locations open now...';
      }

      // Food category queries
      else if (lowerCommand.match(/do you have|any.*available|looking for|need/i)) {
        const foodType = extractFoodType(lowerCommand);
        action = { type: 'search', query: foodType || 'food' };
        responseText = `Searching for ${foodType || 'available food'}...`;
      }

      // Dietary queries
      else if (lowerCommand.match(/vegetarian|vegan|halal|kosher|gluten[- ]free|dairy[- ]free|nut[- ]free/i)) {
        const dietary = extractDietary(lowerCommand);
        action = { type: 'filter', filterType: 'dietary', value: dietary };
        responseText = `Looking for ${dietary} options...`;
      }

      // Allergen queries
      else if (lowerCommand.match(/without|no.*allergen|allerg(y|ic)|can't eat|avoid/i)) {
        const allergen = extractAllergen(lowerCommand);
        action = { type: 'filter', filterType: 'allergen', value: allergen };
        responseText = `Finding food without ${allergen}...`;
      }

      // Distance queries
      else if (lowerCommand.match(/within.*mile|less than.*mile|close.*mile/i)) {
        const distance = extractDistance(lowerCommand);
        action = { type: 'filter', filterType: 'distance', value: distance };
        responseText = `Searching within ${distance} miles...`;
      }

      // Help queries
      else if (lowerCommand.match(/help|how do|what can|show me how|tutorial/i)) {
        setShowHelp(true);
        responseText = "I can help you find food! Try saying things like 'Where can I get produce near me?' or 'Is anything open after 6?'";
      }

      // Navigation
      else if (lowerCommand.match(/go to|show me|navigate|take me to/i)) {
        const destination = extractDestination(lowerCommand);
        action = { type: 'navigate', destination };
        responseText = `Going to ${destination}...`;
      }

      // Claiming/booking
      else if (lowerCommand.match(/claim|book|reserve|pick up/i)) {
        responseText = "To claim food, browse available listings and tap the 'Claim' button. Would you like me to show you available food?";
        action = { type: 'search', query: 'available' };
      }

      // Default: treat as general search
      else {
        action = { type: 'search', query: lowerCommand };
        responseText = `Searching for "${lowerCommand}"...`;
      }

      setResponse(responseText);
      speak(responseText);

      // Execute the action
      if (action) {
        executeAction(action);
      }

      // Add response to history
      setConversationHistory([...newHistory, { type: 'assistant', text: responseText }]);

    } catch (error) {
      console.error('Error processing command:', error);
      const errorMsg = "Sorry, I had trouble understanding that. Could you try again?";
      setResponse(errorMsg);
      speak(errorMsg);
    }

    setIsProcessing(false);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Use a clear, friendly voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const executeAction = (action) => {
    switch (action.type) {
      case 'search':
        if (action.useLocation) {
          // Trigger location-based search
          if (window.Dashboard && window.Dashboard.searchNearMe) {
            window.Dashboard.searchNearMe(action.query);
          }
        } else {
          // Regular search
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.value = action.query;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
        break;

      case 'filter':
        // Apply filters based on type
        if (window.Dashboard && window.Dashboard.applyFilter) {
          window.Dashboard.applyFilter(action.filterType, action.value);
        }
        break;

      case 'navigate':
        // Navigate to different pages
        if (action.destination) {
          window.location.href = action.destination;
        }
        break;
    }
  };

  // Helper functions to extract information from natural language
  const extractFoodType = (text) => {
    const foodTypes = {
      'produce': ['produce', 'vegetables', 'veggies', 'fruits', 'fresh food'],
      'prepared': ['prepared food', 'cooked food', 'ready to eat', 'meals'],
      'packaged': ['packaged food', 'canned', 'boxed', 'non-perishable'],
      'bakery': ['bread', 'bakery', 'baked goods', 'pastries'],
      'dairy': ['dairy', 'milk', 'cheese', 'yogurt'],
      'meat': ['meat', 'protein', 'chicken', 'beef'],
      'snacks': ['snacks', 'chips', 'crackers']
    };

    for (const [category, keywords] of Object.entries(foodTypes)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return null;
  };

  const extractTime = (text) => {
    const timeMatch = text.match(/(\d{1,2})\s*(am|pm|o'?clock)?/i);
    if (timeMatch) {
      return timeMatch[0];
    }

    if (text.includes('now') || text.includes('currently')) {
      return 'now';
    }

    if (text.includes('tonight') || text.includes('evening')) {
      return 'after 6';
    }

    if (text.includes('morning')) {
      return 'before 12';
    }

    return null;
  };

  const extractDietary = (text) => {
    const dietary = [
      'vegetarian', 'vegan', 'halal', 'kosher',
      'gluten-free', 'gluten free', 'dairy-free', 'dairy free',
      'nut-free', 'nut free'
    ];

    for (const tag of dietary) {
      if (text.includes(tag.replace('-', ' ')) || text.includes(tag.replace(' ', '-'))) {
        return tag;
      }
    }

    return null;
  };

  const extractAllergen = (text) => {
    const allergens = {
      'nuts': ['nuts', 'peanuts', 'tree nuts'],
      'dairy': ['dairy', 'milk', 'lactose'],
      'gluten': ['gluten', 'wheat'],
      'shellfish': ['shellfish', 'shrimp', 'crab'],
      'soy': ['soy', 'soya'],
      'eggs': ['eggs', 'egg'],
      'fish': ['fish'],
      'sesame': ['sesame']
    };

    for (const [allergen, keywords] of Object.entries(allergens)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return allergen;
      }
    }

    return null;
  };

  const extractDistance = (text) => {
    const distanceMatch = text.match(/(\d+)\s*miles?/i);
    return distanceMatch ? parseInt(distanceMatch[1]) : 5;
  };

  const extractDestination = (text) => {
    if (text.includes('home') || text.includes('main')) return '/';
    if (text.includes('profile') || text.includes('account')) return '/profile.html';
    if (text.includes('meal') || text.includes('recipe')) return '/meal-builder.html';
    if (text.includes('favorites') || text.includes('bookmarks')) return '/favorites.html';
    return null;
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      processVoiceCommand(textInput);
      setTextInput('');
    }
  };

  // Text input fallback for browsers without voice support
  if (!voiceEnabled) {
    return (
      <div className="voice-search-container">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">💬 Text Search Available</h3>
          <p className="text-blue-800 mb-3">
            Voice recognition isn't available in your browser, but you can still use our conversational search by typing!
          </p>
          <p className="text-sm text-blue-700">
            ✅ Works in all browsers • 🔍 Same smart search • 📝 Type instead of speak
          </p>
        </div>

        <form onSubmit={handleTextSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='Try: "Where can I get produce near me?" or "Is anything open after 6?"'
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {isProcessing ? '⏳' : '🔍'}
            </button>
          </div>
        </form>

        {/* Response Display */}
        {response && (
          <div className="voice-feedback p-4 bg-white rounded-lg shadow-lg mb-4">
            <div className="text-xs text-gray-500 mb-1">Response:</div>
            <div className="text-base text-blue-600">{response}</div>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="conversation-history p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Conversation</h4>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>

            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded ${msg.type === 'user'
                  ? 'bg-blue-100 text-blue-900 ml-4'
                  : 'bg-white text-gray-800 mr-4'
                  }`}
              >
                <div className="text-xs font-semibold mb-1">
                  {msg.type === 'user' ? '👤 You' : '🤖 Assistant'}
                </div>
                <div className="text-sm">{msg.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Help Examples */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 mb-4"
        >
          {showHelp ? 'Hide' : 'Show'} Example Questions
        </button>

        {showHelp && (
          <div className="voice-help p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Example Questions</h3>

            <div className="space-y-3">
              <div>
                <div className="font-medium text-blue-800 mb-1">🗺️ Location-based:</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>"Where can I get produce near me?"</div>
                  <div>"Find food close to me"</div>
                </div>
              </div>

              <div>
                <div className="font-medium text-blue-800 mb-1">🕐 Time-based:</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>"Is anything open after 6?"</div>
                  <div>"What's available now?"</div>
                </div>
              </div>

              <div>
                <div className="font-medium text-blue-800 mb-1">🥗 Dietary preferences:</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>"Do you have vegetarian food?"</div>
                  <div>"Find vegan options"</div>
                </div>
              </div>

              <div>
                <div className="font-medium text-blue-800 mb-1">⚠️ Allergens:</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>"Food without nuts"</div>
                  <div>"No dairy please"</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .voice-feedback {
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .conversation-history::-webkit-scrollbar {
            width: 6px;
          }

          .conversation-history::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 3px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="voice-search-container">
      {/* Main Voice Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`voice-search-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? (
          <>
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            🎤
          </>
        ) : isProcessing ? (
          '⏳'
        ) : (
          '🎤'
        )}
      </button>

      {/* Transcript Display */}
      {(transcript || response) && (
        <div className="voice-feedback mt-4 p-4 bg-white rounded-lg shadow-lg">
          {transcript && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">You said:</div>
              <div className="text-lg font-medium text-gray-800">{transcript}</div>
            </div>
          )}

          {response && (
            <div className={transcript ? 'mt-3 pt-3 border-t' : ''}>
              <div className="text-xs text-gray-500 mb-1">Response:</div>
              <div className="text-base text-blue-600">{response}</div>
            </div>
          )}
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="conversation-history mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Conversation</h4>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>

          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded ${msg.type === 'user'
                ? 'bg-blue-100 text-blue-900 ml-4'
                : 'bg-white text-gray-800 mr-4'
                }`}
            >
              <div className="text-xs font-semibold mb-1">
                {msg.type === 'user' ? '👤 You' : '🤖 Assistant'}
              </div>
              <div className="text-sm">{msg.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="voice-help mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-blue-900">Voice Search Examples</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-medium text-blue-800 mb-1">🗺️ Location-based:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Where can I get produce near me?"</div>
                <div>"Find food close to me"</div>
                <div>"Any bakery items nearby?"</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-blue-800 mb-1">🕐 Time-based:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Is anything open after 6?"</div>
                <div>"What's available now?"</div>
                <div>"Show me locations open tonight"</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-blue-800 mb-1">🥗 Dietary preferences:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Do you have vegetarian food?"</div>
                <div>"Find vegan options"</div>
                <div>"Any halal food available?"</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-blue-800 mb-1">⚠️ Allergens:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Food without nuts"</div>
                <div>"No dairy please"</div>
                <div>"Avoid gluten"</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-blue-800 mb-1">📍 Distance:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Within 2 miles"</div>
                <div>"Less than 5 miles away"</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-blue-800 mb-1">🧭 Navigation:</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Go to my profile"</div>
                <div>"Show me the meal builder"</div>
                <div>"Take me home"</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <div className="text-sm text-blue-800">
              💡 <strong>Tip for seniors & hands-free users:</strong> Just tap the microphone and speak naturally.
              I'll understand and help you find what you need!
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="voice-quick-actions mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
        >
          {showHelp ? 'Hide' : 'Show'} Examples
        </button>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
        >
          {voiceEnabled ? '🔊' : '🔇'} Voice Response
        </button>
      </div>

      <style jsx>{`
        .voice-search-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-search-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .voice-search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .voice-search-button.listening {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-search-button.processing {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid white;
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-out infinite;
          opacity: 0;
        }

        .pulse-ring.delay-1 {
          animation-delay: 0.5s;
        }

        .pulse-ring.delay-2 {
          animation-delay: 1s;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .voice-feedback {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .conversation-history::-webkit-scrollbar {
          width: 6px;
        }

        .conversation-history::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

// Compact floating voice button for integration into any page
const VoiceSearchButton = ({ onTranscript, className = '' }) => {
  const [showFullInterface, setShowFullInterface] = React.useState(false);
  const hasVoiceSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setShowFullInterface(true)}
        className={`voice-search-fab ${className}`}
        aria-label={hasVoiceSupport ? "Voice search" : "Smart search"}
        title={hasVoiceSupport ? "Voice search - Tap to speak" : "Smart search - Type your question"}
      >
        {hasVoiceSupport ? '🎤' : '💬'}
      </button>

      {/* Full interface modal */}
      {showFullInterface && (
        <div className="voice-search-modal">
          <div className="voice-search-modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {hasVoiceSupport ? '🎤 Voice Search' : '💬 Smart Search'}
              </h2>
              <button
                onClick={() => setShowFullInterface(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <VoiceSearch onTranscript={onTranscript} />
          </div>
        </div>
      )}

      <style jsx>{`
        .voice-search-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .voice-search-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.7);
        }

        .voice-search-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .voice-search-modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 640px) {
          .voice-search-fab {
            bottom: 16px;
            right: 16px;
            width: 56px;
            height: 56px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
};

// Export both components
window.VoiceSearch = VoiceSearch;
window.VoiceSearchButton = VoiceSearchButton;
