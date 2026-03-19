# User Feedback System

## Overview
The feedback system allows users to report bugs, submit feature requests, and provide general feedback about the Food Maps application. It includes automatic error reporting capabilities and admin management tools.

## Features

### For Users
- **Multiple Feedback Types**
  - 🐛 Bug Reports
  - ⚠️ Error Reports (with automatic error stack capture)
  - 💡 Feature Requests
  - ✨ Improvement Suggestions
  - 💬 General Feedback

- **Easy Access**
  - Feedback button in main header (always visible)
  - "Report Issue" option in user dropdown menu
  - Automatic error reporting through ErrorBoundary component

- **Rich Feedback**
  - Screenshot capture option
  - Automatic technical information (URL, browser, etc.)
  - Error stack trace capture for crashes
  - Email contact for anonymous users

### For Administrators
- **Feedback Viewer Dashboard**
  - View all feedback submissions
  - Filter by type and status
  - Update feedback status
  - Add admin notes

- **Status Management**
  - New
  - Reviewing
  - In Progress
  - Resolved
  - Closed

## Components

### Frontend Components

#### 1. FeedbackModal.js
Main user-facing feedback submission form.

**Props:**
- `onClose`: Function - Callback when modal is closed
- `initialData`: Object (optional) - Pre-populate form (used for error reports)

**Features:**
- Multiple feedback type selection
- Rich text input for detailed descriptions
- Screenshot capture (if html2canvas is available)
- Automatic technical information collection
- Anonymous submission support

#### 2. ErrorBoundary.js
React error boundary that catches JavaScript errors and provides feedback submission.

**Features:**
- Catches runtime errors in component tree
- Displays user-friendly error message
- Offers "Report This Error" button
- Auto-populates error details in feedback form
- Provides reload and home navigation options

#### 3. FeedbackViewer.js
Admin component for viewing and managing feedback.

**Props:**
- `onClose`: Function - Callback when viewer is closed

**Features:**
- List all feedback submissions
- Filter by type and status
- View detailed feedback information
- Update feedback status
- Color-coded type and status indicators

### Backend API

#### Endpoints

**POST /api/feedback/submit**
Submit new feedback (authentication optional)

Request body:
```json
{
  "type": "bug|error_report|feature_request|improvement|general",
  "subject": "Brief description",
  "message": "Detailed message",
  "email": "optional@email.com",
  "url": "https://app.url/page",
  "userAgent": "Browser info",
  "screenshot": "base64 screenshot data",
  "errorStack": "Error stack trace"
}
```

Response:
```json
{
  "success": true,
  "message": "Thank you for your feedback!",
  "feedback_id": 123
}
```

**GET /api/feedback/list** (Admin only)
List all feedback submissions

Query parameters:
- `status`: Filter by status (optional)
- `type`: Filter by type (optional)
- `limit`: Maximum results (default: 50)

**PUT /api/feedback/{feedback_id}/status** (Admin only)
Update feedback status

Request body:
```json
{
  "status": "reviewing|in_progress|resolved|closed",
  "admin_notes": "Optional notes"
}
```

### Database Schema

**Table: feedback**

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | User ID (NULL for anonymous) |
| type | ENUM | Feedback type |
| subject | VARCHAR(255) | Brief description |
| message | TEXT | Detailed message |
| url | VARCHAR(512) | Page URL |
| user_agent | VARCHAR(512) | Browser info |
| screenshot | TEXT | Base64 or URL |
| error_stack | TEXT | Error stack trace |
| status | ENUM | Current status |
| admin_notes | TEXT | Admin comments |
| email | VARCHAR(255) | Contact email |
| created_at | DATETIME | Submission time |
| updated_at | DATETIME | Last update time |

## Setup Instructions

### 1. Database Migration

Run the migration script to create the feedback table:

```bash
cd /home/ec2-user/project
python3 backend/scripts/migrate_feedback.py
```

### 2. Frontend Integration

The components are already integrated in:
- `index.html` - Component imports
- `app.js` - State management and global functions
- `components/Header.js` - Feedback button
- `components/AdminPanel.js` - Admin viewer

### 3. Access Points

**For Users:**
- Click "Feedback" button in header (visible to all users)
- Click "Report Issue" in user dropdown menu
- Automatic error reporting when app crashes

**For Admins:**
- Navigate to Admin Panel → Feedback tab
- Click "View All Feedback" button

## Usage Examples

### Submit Feedback Programmatically

```javascript
// Open feedback modal
window.openFeedbackModal();

// Open with pre-populated error data
const feedbackModal = <FeedbackModal
  initialData={{
    type: 'error_report',
    subject: 'Application Error',
    message: 'Describe what you were doing...',
    errorStack: error.stack
  }}
  onClose={() => {}}
/>;
```

### Check for Feedback (Admin)

```javascript
// Fetch all new feedback
fetch('/api/feedback/list?status=new', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('New feedback:', data.feedback));
```

## Error Handling

The ErrorBoundary component wraps the entire app and catches errors:

```javascript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

When an error occurs:
1. User sees friendly error message
2. Error details are displayed (expandable)
3. "Report This Error" button opens feedback modal
4. Error stack is automatically included in report

## Best Practices

1. **For Users:**
   - Provide detailed descriptions
   - Include steps to reproduce bugs
   - Attach screenshots when possible
   - Provide contact email for follow-up

2. **For Admins:**
   - Review feedback regularly
   - Update status to keep users informed
   - Add notes for team communication
   - Close resolved issues promptly

3. **For Developers:**
   - Monitor error reports for critical issues
   - Prioritize by feedback type and frequency
   - Use error stacks for debugging
   - Follow up on feature requests

## Security Considerations

- Anonymous feedback allowed (user_id can be NULL)
- Email addresses validated but optional
- Screenshots stored as base64 (consider file size limits)
- Admin authentication required for viewing feedback
- SQL injection protection via SQLAlchemy ORM
- XSS protection via React's built-in escaping

## Future Enhancements

- Email notifications for new feedback
- Feedback voting/priority system
- Attachment file uploads
- Integration with issue tracking (GitHub, Jira)
- Automated error aggregation and reporting
- User notification when feedback is resolved
- Analytics dashboard for feedback trends

## Troubleshooting

**Feedback not submitting:**
- Check browser console for errors
- Verify backend API is running
- Check network tab for failed requests

**Screenshot not capturing:**
- Ensure html2canvas library is loaded
- Check for CORS issues with images
- Verify browser permissions

**Admin can't view feedback:**
- Verify user has admin role in database
- Check authentication token is valid
- Ensure feedback table exists

## Support

For issues with the feedback system itself, please contact the development team or create a manual database entry.
