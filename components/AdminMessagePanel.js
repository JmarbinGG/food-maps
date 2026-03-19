function AdminMessagePanel({ user }) {
  const [conversations, setConversations] = React.useState([]);
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    loadConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Refresh conversations to update unread count
        await loadConversations();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          conversation_id: selectedConversation.conversation_id,
          is_from_admin: true
        })
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages(selectedConversation.conversation_id);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Conversations</h3>
          <p className="text-sm text-gray-500">
            {conversations.length} total
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="icon-inbox text-4xl mb-2 text-gray-300"></div>
              <p>No messages yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => selectConversation(conv)}
                className={`p-4 border-b cursor-pointer transition-colors ${selectedConversation?.conversation_id === conv.conversation_id
                  ? 'bg-green-50 border-l-4 border-l-green-600'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-900">
                    {conv.user_name}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {conv.user_email}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {conv.last_message_preview}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {(() => {
                    try {
                      const date = new Date(conv.last_message_time);
                      if (isNaN(date.getTime())) return 'Recently';
                      const now = new Date();
                      const diff = now - date;
                      if (diff < 60000) return 'Just now';
                      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
                      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    } catch (e) {
                      return 'Recently';
                    }
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedConversation.user_name}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.user_email}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages in this conversation
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.is_from_admin
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200'
                      } rounded-lg p-3 shadow-sm`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">
                          {msg.is_from_admin ? '🛡️ You (Admin)' : selectedConversation.user_name}
                        </span>
                        <span className={`text-xs ${msg.is_from_admin ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {(() => {
                            try {
                              const date = new Date(msg.created_at);
                              if (isNaN(date.getTime())) return 'Just now';
                              const now = new Date();
                              const diff = now - date;
                              if (diff < 60000) return 'Just now';
                              if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                              if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            } catch (e) {
                              return 'Just now';
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
            <div className="icon-message-square text-6xl mb-4"></div>
            <p className="text-lg">Select a conversation to view messages</p>
            <p className="text-sm mt-2">Choose from the list on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}

window.AdminMessagePanel = AdminMessagePanel;
