# Company Chat Feature - Complete Guide

## Overview

The messaging system has been **extended** to allow companies to communicate directly with their assigned students and their advisors. This creates a **three-way communication channel** for each internship assignment.

---

## 🎯 What's New

### Before
- ✅ Students could chat with their advisors
- ✅ Advisors could chat with their students
- ❌ Companies had no direct communication channel

### After
- ✅ Students can chat with their advisors
- ✅ Advisors can chat with their students
- ✅ **Companies can now chat with BOTH students AND advisors**
- ✅ **Three-way group chat** for each internship assignment

---

## 💬 How It Works

### Communication Structure

Each **Advisor Assignment** (internship placement) now has a **group chat** with three participants:

1. **Student** - The intern
2. **Advisor** - The university supervisor
3. **Company** - The employer

All three parties can:
- Send messages to the group
- See all messages in the conversation
- Receive notifications when new messages arrive

---

## 🏢 Company Dashboard Updates

### New Features Added

#### 1. **Messages Navigation Card**
- Located in the "Management" section
- Icon: MessageSquare
- Label: "Messages"
- Description: "Chat with students and their advisors"
- Click to navigate to `/company/messages`

#### 2. **Messages Quick Link**
- Added to the sidebar "Quick Links" section
- First item in the list for easy access
- Direct link to the messages page

#### 3. **New Route**
- Path: `/company/messages`
- Uses the existing `MessagesModern` component
- Role-protected (COMPANY role only)

---

## 📱 Using the Chat Feature

### For Companies

#### Accessing Messages
1. **From Dashboard:**
   - Click the "Messages" card in the Management section
   - OR click "Messages" in the Quick Links sidebar

2. **Direct URL:**
   - Navigate to `http://localhost:5173/company/messages`

#### Viewing Conversations
The messages page shows:
- **List of all active internships** (left sidebar)
- Each conversation shows:
  - Student name
  - Advisor name
  - Internship title
  - Unread message count
  - Last message preview
  - Last message timestamp

#### Sending Messages
1. Select a conversation from the list
2. Type your message in the input box
3. Press Enter or click Send
4. Message is delivered to both student and advisor
5. Both parties receive notifications

#### Message Features
- ✅ Real-time messaging
- ✅ Read receipts (messages marked as read when viewed)
- ✅ Message history (all past messages visible)
- ✅ Edit your own messages
- ✅ Delete your own messages
- ✅ Notifications for new messages

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. **Message Model Updated** (`Backend/apps/messaging/models.py`)
```python
# Before: Only student and advisor could send messages
# After: Student, advisor, OR company can send messages

def clean(self):
    # Allow student, advisor, or company to send messages
    is_company = (self.advisor_assignment.internship and 
                  self.sender == self.advisor_assignment.internship.company)
    is_participant = (
        self.sender == self.advisor_assignment.student or
        self.sender == self.advisor_assignment.advisor or
        is_company
    )
    if not is_participant:
        raise ValidationError('Only participants can send messages.')
```

#### 2. **ConversationListView Updated** (`Backend/apps/messaging/views.py`)
```python
# Now supports three user roles:
# - STUDENT: sees advisor and company info
# - ADVISOR: sees student and company info  
# - COMPANY: sees student and advisor info

if user.role == 'COMPANY':
    # Company sees assignments for their internships
    assignments = AdvisorAssignment.objects.filter(
        internship__company=user
    )
```

#### 3. **MessageListView Updated**
```python
# Verify user is part of assignment (including company)
is_company = (assignment.internship and user == assignment.internship.company)
is_participant = (
    user == assignment.student or 
    user == assignment.advisor or 
    is_company
)

# Returns all participant info:
# - student_name, student_id
# - advisor_name, advisor_id
# - company_name, company_id
```

#### 4. **SendMessageView Updated**
```python
# Sends notifications to ALL other participants
recipients = []
if user != assignment.student:
    recipients.append((assignment.student, '/student/messages'))
if user != assignment.advisor:
    recipients.append((assignment.advisor, '/advisor/messages'))
if assignment.internship.company and user != assignment.internship.company:
    recipients.append((assignment.internship.company, '/company/messages'))
```

#### 5. **MessageSerializer Updated**
```python
def get_sender_name(self, obj):
    if obj.sender.role == 'STUDENT':
        return obj.sender.student_profile.full_name
    elif obj.sender.role == 'ADVISOR':
        return obj.sender.advisor_profile.full_name
    elif obj.sender.role == 'COMPANY':
        return obj.sender.company_profile.company_name  # NEW
```

### Frontend Changes

#### 1. **New Route Added** (`Frontend/src/routes/AppRoutes.jsx`)
```jsx
<Route
  path="/company/messages"
  element={
    <PrivateRoute>
      <RoleRoute allowedRoles="COMPANY">
        <Messages />
      </RoleRoute>
    </PrivateRoute>
  }
/>
```

#### 2. **Company Dashboard Updated** (`Frontend/src/pages/Dashboards.jsx`)
```jsx
// Added Messages card to Management section
<NavCard 
  icon={MessageSquare} 
  label="Messages" 
  sub="Chat with students and their advisors" 
  onClick={() => navigate('/company/messages')} 
/>

// Added Messages to Quick Links sidebar
{ icon: MessageSquare, label: 'Messages', path: '/company/messages' }
```

#### 3. **Messages Component** (`Frontend/src/pages/common/MessagesModern.jsx`)
- Already supports multiple roles
- Automatically adapts UI based on user role
- Shows appropriate participant names
- No changes needed (already flexible!)

---

## 🔐 Security & Permissions

### Access Control
- ✅ Companies can ONLY see conversations for their own internships
- ✅ Students can ONLY see their own conversations
- ✅ Advisors can ONLY see their assigned students' conversations
- ✅ All message operations are permission-checked on the backend

### Data Privacy
- ✅ Messages are tied to specific advisor assignments
- ✅ No cross-company data leakage
- ✅ Read receipts are per-user
- ✅ Notifications only go to relevant participants

---

## 📊 Use Cases

### 1. **Onboarding Communication**
**Scenario:** New intern starts at company
- Company sends welcome message
- Introduces team and expectations
- Student and advisor both see the message
- Advisor can add guidance if needed

### 2. **Progress Updates**
**Scenario:** Mid-internship check-in
- Company shares project updates
- Student asks questions
- Advisor provides academic perspective
- All parties stay informed

### 3. **Issue Resolution**
**Scenario:** Student faces a challenge
- Student reports issue in chat
- Company responds with solution
- Advisor monitors and provides support
- Transparent communication for all

### 4. **Performance Feedback**
**Scenario:** Monthly evaluation time
- Company shares performance observations
- Student can respond and clarify
- Advisor can provide mentorship
- Collaborative feedback process

### 5. **Final Report Coordination**
**Scenario:** Internship ending
- Company confirms completion details
- Student asks about final requirements
- Advisor coordinates final report submission
- Smooth conclusion process

---

## 🎨 User Experience

### Company View
```
┌─────────────────────────────────────────────────────────────┐
│ Messages                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Conversations                    Chat with John & Dr. Smith│
│  ┌──────────────────┐            ┌────────────────────────┐│
│  │ John Doe         │            │ John Doe (Student)     ││
│  │ Dr. Smith        │            │ Dr. Smith (Advisor)    ││
│  │ Software Intern  │            │ Software Intern        ││
│  │ 2 unread         │            ├────────────────────────┤│
│  └──────────────────┘            │                        ││
│                                   │ [Message history...]   ││
│  ┌──────────────────┐            │                        ││
│  │ Jane Smith       │            │ You: How is the        ││
│  │ Prof. Johnson    │            │ project going?         ││
│  │ Marketing Intern │            │                        ││
│  │ No new messages  │            │ John: Great! I just    ││
│  └──────────────────┘            │ finished the feature   ││
│                                   │                        ││
│                                   └────────────────────────┘│
│                                   [Type a message...]       │
└─────────────────────────────────────────────────────────────┘
```

### Student View
```
┌─────────────────────────────────────────────────────────────┐
│ Messages                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Conversations                    Chat with Advisor & Company│
│  ┌──────────────────┐            ┌────────────────────────┐│
│  │ Dr. Smith        │            │ Dr. Smith (Advisor)    ││
│  │ TechCorp Inc.    │            │ TechCorp Inc. (Company)││
│  │ Software Intern  │            │ Software Intern        ││
│  │ 1 unread         │            ├────────────────────────┤│
│  └──────────────────┘            │                        ││
│                                   │ [Message history...]   ││
│                                   │                        ││
│                                   │ TechCorp: How is the   ││
│                                   │ project going?         ││
│                                   │                        ││
│                                   │ You: Great! I just     ││
│                                   │ finished the feature   ││
│                                   │                        ││
│                                   └────────────────────────┘│
│                                   [Type a message...]       │
└─────────────────────────────────────────────────────────────┘
```

### Advisor View
```
┌─────────────────────────────────────────────────────────────┐
│ Messages                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Conversations                    Chat with Student & Company│
│  ┌──────────────────┐            ┌────────────────────────┐│
│  │ John Doe         │            │ John Doe (Student)     ││
│  │ TechCorp Inc.    │            │ TechCorp Inc. (Company)││
│  │ Software Intern  │            │ Software Intern        ││
│  │ 1 unread         │            ├────────────────────────┤│
│  └──────────────────┘            │                        ││
│                                   │ [Message history...]   ││
│                                   │                        ││
│                                   │ TechCorp: How is the   ││
│                                   │ project going?         ││
│                                   │                        ││
│                                   │ John: Great! I just    ││
│                                   │ finished the feature   ││
│                                   │                        ││
│                                   └────────────────────────┘│
│                                   [Type a message...]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### For Companies

1. **Login to your company account**
   - Navigate to `http://localhost:5173`
   - Login with your company credentials

2. **Go to Dashboard**
   - You'll see the new "Messages" card

3. **Click Messages**
   - View all your active internship conversations
   - Each conversation includes the student and their advisor

4. **Start Chatting**
   - Select a conversation
   - Type and send messages
   - Both student and advisor will receive your messages

### For Students & Advisors

- **No changes needed!**
- Your existing messages page now includes company messages
- You'll see company messages in your conversations
- You can reply to companies just like before

---

## 📝 API Endpoints

### Get Conversations
```
GET /api/messages/conversations/
Authorization: Bearer <token>

Response (for COMPANY):
[
  {
    "assignment_id": 1,
    "student_name": "John Doe",
    "student_id": 5,
    "advisor_name": "Dr. Smith",
    "advisor_id": 3,
    "internship_title": "Software Engineering Intern",
    "is_active": true,
    "unread_count": 2,
    "last_message": "How is the project going?",
    "last_message_at": "2024-01-15T10:30:00Z",
    "user_role": "COMPANY"
  }
]
```

### Get Messages
```
GET /api/messages/<assignment_id>/
Authorization: Bearer <token>

Response:
{
  "assignment_id": 1,
  "student_name": "John Doe",
  "student_id": 5,
  "advisor_name": "Dr. Smith",
  "advisor_id": 3,
  "company_name": "TechCorp Inc.",
  "company_id": 2,
  "internship_title": "Software Engineering Intern",
  "messages": [
    {
      "id": 1,
      "sender": 2,
      "sender_name": "TechCorp Inc.",
      "sender_role": "COMPANY",
      "content": "Welcome to the team!",
      "is_read": true,
      "is_mine": true,
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### Send Message
```
POST /api/messages/send/
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "assignment_id": 1,
  "content": "How is the project going?"
}

Response:
{
  "id": 2,
  "sender": 2,
  "sender_name": "TechCorp Inc.",
  "sender_role": "COMPANY",
  "content": "How is the project going?",
  "is_read": false,
  "is_mine": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## ✅ Testing Checklist

### Company User
- [ ] Can access `/company/messages`
- [ ] Sees all internship conversations
- [ ] Can send messages
- [ ] Can edit own messages
- [ ] Can delete own messages
- [ ] Receives notifications for new messages
- [ ] Messages appear in student and advisor chats

### Student User
- [ ] Sees company messages in conversations
- [ ] Can reply to company messages
- [ ] Receives notifications from company
- [ ] Company name displays correctly

### Advisor User
- [ ] Sees company messages in conversations
- [ ] Can reply to company messages
- [ ] Receives notifications from company
- [ ] Company name displays correctly

### Permissions
- [ ] Company can only see their own internships
- [ ] Cannot access other companies' conversations
- [ ] Cannot send messages to unrelated assignments

---

## 🎉 Benefits

### For Companies
- ✅ Direct communication with interns
- ✅ Coordinate with university advisors
- ✅ Transparent progress tracking
- ✅ Quick issue resolution
- ✅ Better intern experience

### For Students
- ✅ Easy access to company mentors
- ✅ Advisor can see company communication
- ✅ No need for external communication tools
- ✅ All internship communication in one place

### For Advisors
- ✅ Monitor company-student interactions
- ✅ Provide guidance when needed
- ✅ Early detection of issues
- ✅ Better oversight of internships

### For the System
- ✅ Centralized communication
- ✅ Audit trail of all interactions
- ✅ Reduced email clutter
- ✅ Better data for analytics

---

## 🔮 Future Enhancements

Potential improvements for the messaging system:

1. **File Attachments**
   - Share documents, images, code snippets
   - Useful for project deliverables

2. **Message Reactions**
   - Quick emoji responses
   - Acknowledge messages without typing

3. **Message Search**
   - Find specific conversations or messages
   - Filter by date, sender, or content

4. **Video/Voice Calls**
   - Integrated calling within the chat
   - Screen sharing for technical discussions

5. **Message Templates**
   - Pre-written messages for common scenarios
   - Onboarding, check-ins, evaluations

6. **Group Announcements**
   - Broadcast messages to all interns
   - Company-wide updates

7. **Read Receipts Enhancement**
   - Show who has read each message
   - Typing indicators

8. **Message Scheduling**
   - Schedule messages for later delivery
   - Automated reminders

---

## 📞 Support

If you encounter any issues with the messaging feature:

1. **Check Permissions**
   - Ensure you're logged in as a company user
   - Verify you have active internships

2. **Refresh the Page**
   - Sometimes a simple refresh resolves issues

3. **Check Browser Console**
   - Look for error messages
   - Report any errors to the development team

4. **Contact Support**
   - Email: support@internship-system.com
   - Include: User role, error message, steps to reproduce

---

## 📚 Summary

The company chat feature creates a **collaborative communication environment** where companies, students, and advisors can work together effectively. By centralizing all internship-related communication in one platform, we:

- ✅ Improve transparency
- ✅ Reduce miscommunication
- ✅ Speed up issue resolution
- ✅ Enhance the internship experience
- ✅ Provide better oversight and support

**The feature is now live and ready to use!** 🎉

Companies can start chatting with their interns and advisors immediately from the dashboard.
