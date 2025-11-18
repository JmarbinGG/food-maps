# Profile Settings Debugging Guide

## ✅ What Was Fixed

### 1. **Enhanced Error Handling**
- Added authentication token validation
- Added console logging for debugging
- Added error messages for network issues

### 2. **Auto-close on Success**
- Profile modal now auto-closes 2 seconds after successful update
- Password modal now auto-closes 2 seconds after successful change

### 3. **User State Synchronization**
- Added React.useEffect to sync form data when user prop changes
- Ensures form always displays current user data

### 4. **Improved Modal Behavior**
- Increased z-index to 9999 to ensure it appears above all content
- Added click-outside-to-close functionality
- Added event.stopPropagation() to prevent accidental closes

### 5. **Better User Feedback**
- Enhanced loading states
- Clear success/error messages
- Form validation messages

---

## 🔍 How to Test Profile Settings

### Method 1: Via User Dropdown
1. Make sure you're logged in
2. Click on your name in the top-right corner
3. Click "Profile Settings" in the dropdown menu
4. The profile modal should appear

### Method 2: Via Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `window.openUserProfile()`
4. Press Enter
5. The profile modal should appear

### Method 3: Check if Function Exists
```javascript
// In browser console:
console.log('openUserProfile exists:', typeof window.openUserProfile === 'function');
console.log('Current user:', JSON.parse(localStorage.getItem('current_user') || 'null'));
console.log('Auth token:', localStorage.getItem('auth_token') ? 'EXISTS' : 'NOT FOUND');
```

---

## 🐛 Debugging Steps

### If Profile Modal Doesn't Open:

1. **Check Console for Errors**
   ```javascript
   // Open DevTools → Console tab
   // Look for red error messages
   ```

2. **Verify User is Logged In**
   ```javascript
   const user = JSON.parse(localStorage.getItem('current_user') || 'null');
   console.log('User:', user);
   // Should show user object with name, email, etc.
   ```

3. **Verify Auth Token Exists**
   ```javascript
   const token = localStorage.getItem('auth_token');
   console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
   ```

4. **Check if openUserProfile Function is Defined**
   ```javascript
   console.log('Function defined:', typeof window.openUserProfile);
   // Should output: "function"
   ```

5. **Manually Trigger Profile Modal**
   ```javascript
   window.openUserProfile();
   // Should open the modal immediately
   ```

### If Profile Update Fails:

1. **Check Network Tab**
   - Open DevTools → Network tab
   - Submit profile update
   - Look for `/api/user/profile` request
   - Check status code (should be 200)
   - Check response body

2. **Check Backend Logs**
   ```bash
   cd /home/ec2-user/project/backend
   # Check if backend is running
   curl http://localhost:8000/health
   ```

3. **Verify API Endpoint**
   ```javascript
   // Test the API endpoint directly
   const token = localStorage.getItem('auth_token');
   fetch('/api/user/profile', {
     method: 'PUT',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       name: 'Test Name',
       email: 'test@example.com'
     })
   }).then(r => r.json()).then(console.log);
   ```

### If Password Change Fails:

1. **Check Password Requirements**
   - Minimum 8 characters
   - New password and confirm password must match
   - Current password must be correct

2. **Check Console for Specific Error**
   - Look for "Password change error:" in console
   - Error message will indicate the specific problem

3. **Test Password Change API**
   ```javascript
   const token = localStorage.getItem('auth_token');
   fetch('/api/user/change-password', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       current_password: 'your_current_password',
       new_password: 'your_new_password_8chars'
     })
   }).then(r => r.json()).then(console.log);
   ```

---

## 📝 API Endpoints

### Update Profile
- **URL:** `PUT /api/user/profile`
- **Auth:** Bearer token required
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St"
  }
  ```
- **Success Response:** `{ "success": true, "message": "Profile updated successfully" }`

### Change Password
- **URL:** `POST /api/user/change-password`
- **Auth:** Bearer token required
- **Body:**
  ```json
  {
    "current_password": "oldpassword",
    "new_password": "newpassword123"
  }
  ```
- **Success Response:** `{ "success": true, "message": "Password changed successfully" }`

---

## 🎯 Expected Behavior

### Profile Tab:
1. Shows current user name, email, phone, address
2. All fields are editable
3. Click "Update Profile" to save changes
4. Shows success message and auto-closes after 2 seconds
5. User dropdown shows updated name immediately

### Password Tab:
1. Three fields: Current Password, New Password, Confirm New Password
2. Validates passwords match and minimum length
3. Click "Change Password" to update
4. Shows success message and auto-closes after 2 seconds
5. Form clears on success

---

## 🔧 Component Files

- **Frontend:** `/home/ec2-user/project/components/UserProfile.js`
- **Backend:** `/home/ec2-user/project/backend/app.py`
- **Main App:** `/home/ec2-user/project/app.js`
- **Header:** `/home/ec2-user/project/components/Header.js`

---

## 💡 Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** Log out and log back in to refresh the auth token

### Issue: Modal appears behind other content
**Solution:** Already fixed with z-index: 9999

### Issue: Form doesn't show current user data
**Solution:** Already fixed with useEffect sync

### Issue: Changes don't persist after page refresh
**Solution:** Check if localStorage is being updated (it should be)

### Issue: Backend returns 401 Unauthorized
**Solution:** Token expired, log out and log back in

---

## 📞 Need More Help?

If you're still having issues, provide:
1. Browser console errors (screenshot)
2. Network tab showing API request/response
3. Exact steps you're taking when it fails
4. Whether you're logged in or not
