# Messaging System Documentation

## Overview
The messaging system enables two-way communication between users and administrators. Users can send support messages, and admins can view all conversations and reply to users.

## Features

### For Users
- **Message Support Button**: Available in the user dropdown menu (top-right corner)
- **Conversation View**: Opens a chat interface to send messages to the admin team
- **Real-time Updates**: Messages refresh every 5 seconds
- **Message History**: View entire conversation history with support
- **Read Receipts**: Messages are marked as read when viewed

### For Admins
- **Messages Tab**: New tab in the Admin Panel showing all user conversations
- **Conversation List**: Left sidebar displays all users who have sent messages
- **Unread Indicators**: Red badges show unread message counts per conversation
- **Reply Interface**: Click a conversation to view messages and send replies
- **Multi-User Support**: Handle multiple conversations simultaneously
- **Auto-Read Marking**: Messages automatically marked as read when admin views conversation

## Components

### Frontend Components

#### `MessageSupport.js`
User-facing chat interface for sending messages to support.

**Props:**
- `user` - Current logged-in user object
- `onClose` - Callback to close the modal

**Features:**
- Message input with send button
- Auto-scroll to latest message
- User/Admin message differentiation (green vs gray bubbles)
- 5-second polling for new messages

#### `AdminMessagePanel.js`
Admin interface for managing all user conversations.

**Features:**
- Conversation list with user details
- Unread message counts
- Message preview
- Timestamp display
- Click to select conversation
- Reply functionality

### Backend API

#### Endpoints

**POST `/api/messages/send`**
Send a new message to create or continue a conversation.

Request body:
```json
{
  "content": "Message text",
  "conversation_id": "user_123",
  "is_from_admin": false  // Optional, defaults to false
}
```

Response: Created message object

**GET `/api/messages/conversations`**
Get all conversations. Returns all for admins, only user's own for regular users.

Response:
```json
[
  {
    "conversation_id": "user_123",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "unread_count": 3,
    "last_message_time": "2025-12-26T10:30:00",
    "last_message_preview": "I need help with..."
  }
]
```

**GET `/api/messages/{conversation_id}`**
Get all messages in a conversation. Auto-marks messages as read based on viewer role.

Response: Array of message objects

### Database Model

**Message Table:**
- `id` - Primary key
- `sender_id` - Foreign key to User
- `conversation_id` - Grouping identifier (format: "user_{id}")
- `content` - Message text
- `is_from_admin` - Boolean flag
- `is_read` - Read status
- `created_at` - Timestamp

## Usage Guide

### For Users
1. Log in to your account
2. Click your name in the top-right corner
3. Select "💬 Message Support"
4. Type your message and click "Send"
5. Wait for admin response (messages auto-refresh)

### For Admins
1. Log in with admin account
2. Open Admin Panel (⚙️ icon in dropdown)
3. Click "Messages" tab
4. Select a conversation from the left sidebar
5. View messages and type replies in the input field
6. Click "Send" to reply

## Technical Details

### Conversation Grouping
- Each user has one conversation with admins
- Conversation ID format: `user_{user_id}`
- Messages grouped by conversation_id for organization

### Real-time Updates
- Client-side polling every 5 seconds
- No WebSocket required (future enhancement)
- Messages auto-marked as read on view

### Security
- JWT authentication required for all endpoints
- Users can only access their own conversations
- Admins can access all conversations
- Sender verification on message creation

### Message Ordering
- Messages sorted by `created_at` timestamp
- Newest messages at the bottom (chat-style)
- Auto-scroll to latest message on load

## Database Migration

The Message model is automatically created when the backend starts. If you have an existing database:

1. Stop the backend server
2. Restart it - SQLAlchemy will create the new `messages` table automatically
3. No manual migration needed (using `create_all()`)

## Future Enhancements

- WebSocket support for instant message delivery
- File attachments
- Message search/filter
- Typing indicators
- Email notifications for new messages
- Message deletion/editing
- Conversation archiving
- Custom admin roles (support agent vs super admin)
- Canned responses for admins
- Message templates
