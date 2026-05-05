# Testing Checklist - Company Chat Feature

## 🧪 Complete Testing Guide

Use this checklist to verify the company chat feature works correctly.

---

## ✅ Pre-Testing Setup

### Requirements
- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Database has test data:
  - [ ] At least one company user
  - [ ] At least one student user
  - [ ] At least one advisor user
  - [ ] At least one active internship assignment

### Test Accounts Needed
```
Company Account:
- Email: company@test.com
- Role: COMPANY

Student Account:
- Email: student@test.com
- Role: STUDENT

Advisor Account:
- Email: advisor@test.com
- Role: ADVISOR
```

---

## 1️⃣ Company Dashboard Tests

### Navigation Tests
- [ ] Login as company user
- [ ] Navigate to `/company/dashboard`
- [ ] Dashboard loads without errors
- [ ] All sections visible

### Messages Card Tests
- [ ] "Messages" card visible in Management section
- [ ] Card shows correct icon (MessageSquare)
- [ ] Card shows correct label ("Messages")
- [ ] Card shows correct description
- [ ] Card has hover effect
- [ ] Clicking card navigates to `/company/messages`

### Quick Links Tests
- [ ] "Messages" appears in Quick Links sidebar
- [ ] "Messages" is first item in list
- [ ] Item has correct icon
- [ ] Item has correct label
- [ ] Clicking item navigates to `/company/messages`

### Layout Tests
- [ ] Management section has 3 cards
- [ ] Settings section exists
- [ ] Settings section has 1 card
- [ ] All cards properly aligned
- [ ] Responsive on mobile

---

## 2️⃣ Messages Page Tests

### Page Load Tests
- [ ] Navigate to `/company/messages`
- [ ] Page loads without errors
- [ ] Header shows "Messages"
- [ ] Layout is split (conversations | chat)
- [ ] No console errors

### Conversations List Tests
- [ ] All company internships shown
- [ ] Each conversation shows:
  - [ ] Student name
  - [ ] Advisor name
  - [ ] Internship title
  - [ ] Last message preview
  - [ ] Timestamp
  - [ ] Unread count (if any)
- [ ] Conversations sorted by recent activity
- [ ] Clicking conversation loads chat

### Empty State Tests
- [ ] If no internships, shows empty state
- [ ] Empty state has icon
- [ ] Empty state has message
- [ ] Empty state has action button

---

## 3️⃣ Chat Window Tests

### Display Tests
- [ ] Chat header shows participant names
- [ ] Shows student name
- [ ] Shows advisor name
- [ ] Shows internship title
- [ ] Message history loads
- [ ] Messages display correctly

### Message Display Tests
- [ ] Student messages show correctly
  - [ ] Sender name: "Student Name"
  - [ ] Role badge: "Student"
  - [ ] Message content
  - [ ] Timestamp
- [ ] Advisor messages show correctly
  - [ ] Sender name: "Advisor Name"
  - [ ] Role badge: "Advisor"
  - [ ] Message content
  - [ ] Timestamp
- [ ] Company messages show correctly
  - [ ] Sender name: "Company Name"
  - [ ] Role badge: "Company"
  - [ ] Message content
  - [ ] Timestamp
  - [ ] Edit button visible
  - [ ] Delete button visible

### Scroll Tests
- [ ] Chat scrolls to bottom on load
- [ ] Can scroll up to see history
- [ ] Scroll is smooth
- [ ] New messages auto-scroll

---

## 4️⃣ Sending Messages Tests

### Basic Sending
- [ ] Type message in input box
- [ ] Input box accepts text
- [ ] Character limit works (if any)
- [ ] Press Enter to send
- [ ] Click Send button to send
- [ ] Message appears immediately
- [ ] Message shows "You" as sender
- [ ] Timestamp is current
- [ ] Input box clears after send

### Message Delivery
- [ ] Message saved to database
- [ ] Message appears in conversation
- [ ] Last message preview updates
- [ ] Timestamp updates

### Error Handling
- [ ] Cannot send empty message
- [ ] Shows error for failed send
- [ ] Retry option available
- [ ] Network errors handled

---

## 5️⃣ Editing Messages Tests

### Edit Functionality
- [ ] Click Edit on own message
- [ ] Edit modal/input appears
- [ ] Can modify text
- [ ] Save button works
- [ ] Cancel button works
- [ ] Message updates in chat
- [ ] Timestamp shows "edited"

### Edit Restrictions
- [ ] Cannot edit others' messages
- [ ] Edit button only on own messages
- [ ] Cannot edit after time limit (if any)

---

## 6️⃣ Deleting Messages Tests

### Delete Functionality
- [ ] Click Delete on own message
- [ ] Confirmation dialog appears
- [ ] Confirm deletes message
- [ ] Cancel keeps message
- [ ] Message removed from chat
- [ ] Message removed from database

### Delete Restrictions
- [ ] Cannot delete others' messages
- [ ] Delete button only on own messages
- [ ] Cannot delete after time limit (if any)

---

## 7️⃣ Notification Tests

### Company Sends Message
- [ ] Send message as company
- [ ] Student receives notification
  - [ ] Notification appears in bell icon
  - [ ] Notification shows sender name
  - [ ] Notification shows message preview
  - [ ] Notification links to messages
- [ ] Advisor receives notification
  - [ ] Notification appears in bell icon
  - [ ] Notification shows sender name
  - [ ] Notification shows message preview
  - [ ] Notification links to messages

### Student Sends Message
- [ ] Send message as student
- [ ] Company receives notification
- [ ] Advisor receives notification

### Advisor Sends Message
- [ ] Send message as advisor
- [ ] Company receives notification
- [ ] Student receives notification

### Notification Behavior
- [ ] Unread count updates
- [ ] Badge shows on conversation
- [ ] Badge shows on bell icon
- [ ] Clicking notification marks as read
- [ ] Opening chat marks as read

---

## 8️⃣ Read Receipts Tests

### Mark as Read
- [ ] Open conversation with unread messages
- [ ] Messages automatically marked as read
- [ ] Unread badge disappears
- [ ] Unread count decreases
- [ ] Other users see read status

### Read Status Display
- [ ] Own messages show read status
- [ ] Others' messages show read status
- [ ] Read status updates in real-time

---

## 9️⃣ Permission Tests

### Company Permissions
- [ ] Can see own internship conversations
- [ ] Cannot see other companies' conversations
- [ ] Can send messages to own conversations
- [ ] Cannot send to other conversations
- [ ] Can edit own messages
- [ ] Cannot edit others' messages
- [ ] Can delete own messages
- [ ] Cannot delete others' messages

### Student Permissions
- [ ] Can see own conversations
- [ ] Can see company messages
- [ ] Can reply to company
- [ ] Cannot access other students' chats

### Advisor Permissions
- [ ] Can see assigned students' conversations
- [ ] Can see company messages
- [ ] Can reply to company
- [ ] Cannot access unassigned students' chats

### Security Tests
- [ ] Direct URL access blocked for unauthorized
- [ ] API endpoints check permissions
- [ ] Cannot manipulate assignment_id
- [ ] Cannot impersonate other users

---

## 🔟 Student View Tests

### Student Messages Page
- [ ] Login as student
- [ ] Navigate to `/student/messages`
- [ ] See conversations with advisors
- [ ] See company messages in conversations
- [ ] Company name displays correctly
- [ ] Can reply to company messages
- [ ] Notifications work

---

## 1️⃣1️⃣ Advisor View Tests

### Advisor Messages Page
- [ ] Login as advisor
- [ ] Navigate to `/advisor/messages`
- [ ] See conversations with students
- [ ] See company messages in conversations
- [ ] Company name displays correctly
- [ ] Can reply to company messages
- [ ] Notifications work

---

## 1️⃣2️⃣ API Tests

### GET /api/messages/conversations/
```bash
# As Company
curl -H "Authorization: Bearer <company_token>" \
  http://localhost:8000/api/messages/conversations/
```
- [ ] Returns 200 OK
- [ ] Returns list of conversations
- [ ] Each conversation has:
  - [ ] assignment_id
  - [ ] student_name
  - [ ] advisor_name
  - [ ] internship_title
  - [ ] unread_count
  - [ ] last_message
  - [ ] last_message_at

### GET /api/messages/<assignment_id>/
```bash
# As Company
curl -H "Authorization: Bearer <company_token>" \
  http://localhost:8000/api/messages/1/
```
- [ ] Returns 200 OK
- [ ] Returns conversation details
- [ ] Returns all messages
- [ ] Marks messages as read

### POST /api/messages/send/
```bash
# As Company
curl -X POST \
  -H "Authorization: Bearer <company_token>" \
  -H "Content-Type: application/json" \
  -d '{"assignment_id": 1, "content": "Hello!"}' \
  http://localhost:8000/api/messages/send/
```
- [ ] Returns 201 Created
- [ ] Returns created message
- [ ] Message saved to database
- [ ] Notifications sent

### PUT /api/messages/<message_id>/edit/
```bash
# As Company
curl -X PUT \
  -H "Authorization: Bearer <company_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated message"}' \
  http://localhost:8000/api/messages/1/edit/
```
- [ ] Returns 200 OK
- [ ] Returns updated message
- [ ] Message updated in database

### DELETE /api/messages/<message_id>/delete/
```bash
# As Company
curl -X DELETE \
  -H "Authorization: Bearer <company_token>" \
  http://localhost:8000/api/messages/1/delete/
```
- [ ] Returns 200 OK
- [ ] Message deleted from database

---

## 1️⃣3️⃣ Performance Tests

### Load Time Tests
- [ ] Dashboard loads in < 2 seconds
- [ ] Messages page loads in < 2 seconds
- [ ] Conversation list loads in < 1 second
- [ ] Chat window loads in < 1 second
- [ ] Messages load in < 500ms

### Responsiveness Tests
- [ ] Typing is smooth (no lag)
- [ ] Sending is instant
- [ ] Scrolling is smooth
- [ ] No UI freezing

### Large Data Tests
- [ ] Works with 100+ conversations
- [ ] Works with 1000+ messages
- [ ] Pagination works (if implemented)
- [ ] Infinite scroll works (if implemented)

---

## 1️⃣4️⃣ Browser Compatibility Tests

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 1️⃣5️⃣ Error Handling Tests

### Network Errors
- [ ] Offline mode shows error
- [ ] Retry button works
- [ ] Graceful degradation

### Server Errors
- [ ] 500 error shows message
- [ ] 404 error shows message
- [ ] 403 error shows message

### Validation Errors
- [ ] Empty message rejected
- [ ] Too long message rejected
- [ ] Invalid assignment_id rejected

---

## 1️⃣6️⃣ Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all elements
- [ ] Enter sends message
- [ ] Escape closes modals
- [ ] Arrow keys navigate conversations

### Screen Reader
- [ ] All elements have labels
- [ ] Messages are announced
- [ ] Notifications are announced
- [ ] Buttons have descriptions

### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Meets WCAG AA standards
- [ ] Color blind friendly

---

## 1️⃣7️⃣ Integration Tests

### End-to-End Flow
1. [ ] Company posts internship
2. [ ] Student applies
3. [ ] Company accepts application
4. [ ] Advisor assigned
5. [ ] Company sends welcome message
6. [ ] Student receives notification
7. [ ] Student replies
8. [ ] Company receives notification
9. [ ] Advisor joins conversation
10. [ ] All parties see all messages

---

## 1️⃣8️⃣ Regression Tests

### Existing Features
- [ ] Student-advisor chat still works
- [ ] Notifications still work
- [ ] Dashboard still works
- [ ] Other company features work
- [ ] No broken links
- [ ] No console errors

---

## 📊 Test Results Summary

### Pass/Fail Tracking
```
Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___
Pass Rate: ___%
```

### Critical Issues
```
1. [Issue description]
   Severity: High/Medium/Low
   Status: Open/Fixed

2. [Issue description]
   Severity: High/Medium/Low
   Status: Open/Fixed
```

### Non-Critical Issues
```
1. [Issue description]
   Severity: Low
   Status: Open/Fixed
```

---

## ✅ Sign-Off

### Tested By
- Name: _______________
- Date: _______________
- Role: _______________

### Approved By
- Name: _______________
- Date: _______________
- Role: _______________

### Ready for Production?
- [ ] Yes - All critical tests passed
- [ ] No - Issues need to be fixed

---

## 📝 Notes

### Additional Observations
```
[Add any additional notes, observations, or recommendations here]
```

### Future Improvements
```
[List any potential improvements or enhancements discovered during testing]
```

---

**Testing Complete!** 🎉

Use this checklist to ensure the company chat feature works perfectly before deploying to production.
