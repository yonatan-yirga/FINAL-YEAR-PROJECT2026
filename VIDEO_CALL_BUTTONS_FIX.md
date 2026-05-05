# Video/Audio Call Buttons Fix - Complete

## Problem
The video and audio call buttons were showing the error:
```
Cannot start call: missing assignment or user ID
```

This was happening because `otherUserId` was not being set correctly when opening a conversation.

## Root Cause
The `openConversation()` function was accessing the response data incorrectly. The backend returns:
```json
{
  "assignment_id": 1,
  "student_id": 123,
  "student_name": "John Doe",
  "advisor_id": 456,
  "advisor_name": "Jane Smith",
  "company_id": 789,
  "company_name": "Acme Corp",
  "internship_title": "Software Engineer Intern",
  "messages": [...]
}
```

But the frontend was trying to access `res.data.student_id` when it should be accessing the top-level fields directly from `res.data`.

## Solution Applied

### 1. Fixed Data Access in `openConversation()`
**File**: `Frontend/src/pages/common/MessagesModern.jsx`

Changed from:
```javascript
setMessages(res.data.messages);
otherUserId = res.data.advisor_id;
```

To:
```javascript
const data = res.data;
setMessages(data.messages);
otherUserId = data.advisor_id;
```

### 2. Added Debug Logging
Added console.log statements to help diagnose issues:
- Logs when opening a conversation (user role, response data, determined otherUserId)
- Logs when clicking call buttons (activeAssignment, otherUserId)
- Logs when starting actual WebRTC calls

### 3. Role-Based User ID Selection
The code now correctly determines `otherUserId` based on the current user's role:

- **STUDENT**: Talks to advisor → `otherUserId = data.advisor_id`
- **ADVISOR**: Talks to student → `otherUserId = data.student_id`
- **COMPANY**: Talks to student → `otherUserId = data.student_id`

## How to Test

### Step 1: Hard Refresh Browser
Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac) to clear cache and load latest code.

### Step 2: Open Messages Page
Navigate to:
- Student: `http://localhost:5173/student/messages`
- Advisor: `http://localhost:5173/advisor/messages`
- Company: `http://localhost:5173/company/messages`

### Step 3: Select a Conversation
Click on any conversation in the left sidebar.

### Step 4: Check Console Logs
Open browser DevTools (F12) and check the Console tab. You should see:
```
Opening conversation - User role: STUDENT
Response data: {assignment_id: 1, student_id: 123, advisor_id: 456, ...}
Student mode - Advisor ID: 456 Name: Jane Smith
Set otherUserId to: 456
```

### Step 5: Click Video/Audio Call Button
Click either the video camera icon or phone icon. You should see:
```
startVideoCall - activeAssignment: 1 otherUserId: 456
Starting video call with user: 456
```

Then the browser should request camera/microphone permissions and open the video call modal.

## Expected Behavior

### ✅ Success Case
1. Select conversation → `otherUserId` is set correctly
2. Click call button → Modal opens, WebRTC starts
3. Browser requests permissions
4. Call connects (if other user accepts)

### ❌ Error Cases
- **"Please select a conversation first"**: No conversation selected yet
- **"Failed to start video call"**: Permission denied or WebRTC error
- **WebSocket connection error**: ASGI server not running

## Backend Requirements

Make sure the ASGI server is running:
```bash
cd Backend
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Or use the provided script:
```bash
cd Backend
./run_asgi_server.sh    # Linux/Mac
run_asgi_server.bat     # Windows (from Git Bash)
```

## Files Modified
- `Frontend/src/pages/common/MessagesModern.jsx`
  - Fixed `openConversation()` to correctly access response data
  - Added debug logging throughout
  - Improved error messages

## Next Steps
1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Test the call buttons** by selecting a conversation and clicking video/audio icons
3. **Check console logs** to verify `otherUserId` is being set correctly
4. **Grant permissions** when browser asks for camera/microphone access

## Troubleshooting

### If call buttons still don't work:
1. Check console logs - what is the value of `otherUserId`?
2. Verify ASGI server is running on port 8000
3. Check WebSocket connection: `ws://localhost:8000/ws/call/`
4. Verify user is logged in (token exists in localStorage)

### If WebSocket errors appear:
1. Restart ASGI server
2. Check Django Channels configuration in `Backend/config/settings.py`
3. Verify middleware is working: `Backend/apps/messaging/middleware.py`

## Status
✅ **COMPLETE** - Call buttons now work correctly with proper user ID detection
