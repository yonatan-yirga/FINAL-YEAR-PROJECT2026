# Company Chat Architecture

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTERNSHIP ASSIGNMENT                        │
│                                                                  │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐       │
│  │ STUDENT  │◄───────►│ ADVISOR  │◄───────►│ COMPANY  │       │
│  │          │         │          │         │          │       │
│  │  John    │         │ Dr.Smith │         │ TechCorp │       │
│  └──────────┘         └──────────┘         └──────────┘       │
│       │                     │                     │            │
│       │                     │                     │            │
│       └─────────────────────┴─────────────────────┘            │
│                             │                                   │
│                             ▼                                   │
│                    ┌─────────────────┐                         │
│                    │  GROUP CHAT     │                         │
│                    │  (Messages)     │                         │
│                    └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Message Sending Flow

```
┌─────────────┐
│   COMPANY   │
│   (Sender)  │
└──────┬──────┘
       │
       │ 1. POST /api/messages/send/
       │    { assignment_id, content }
       ▼
┌─────────────────────────────────────┐
│     BACKEND API                     │
│  (SendMessageView)                  │
│                                     │
│  1. Validate permissions            │
│  2. Create message record           │
│  3. Send notifications              │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ STUDENT  │   │ ADVISOR  │   │ DATABASE │
│(Notified)│   │(Notified)│   │ (Saved)  │
└──────────┘   └──────────┘   └──────────┘
```

### Message Retrieval Flow

```
┌─────────────┐
│   COMPANY   │
│  (Viewer)   │
└──────┬──────┘
       │
       │ 1. GET /api/messages/<assignment_id>/
       ▼
┌─────────────────────────────────────┐
│     BACKEND API                     │
│  (MessageListView)                  │
│                                     │
│  1. Verify permissions              │
│  2. Fetch all messages              │
│  3. Mark as read                    │
└──────┬──────────────────────────────┘
       │
       │ 2. Return messages + participants
       ▼
┌─────────────────────────────────────┐
│     FRONTEND                        │
│  (MessagesModern Component)         │
│                                     │
│  - Display conversation list        │
│  - Show message history             │
│  - Render participant info          │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Message Model

```
┌─────────────────────────────────────────────────────────┐
│                    MESSAGE                              │
├─────────────────────────────────────────────────────────┤
│ id                    : Integer (PK)                    │
│ advisor_assignment_id : ForeignKey → AdvisorAssignment  │
│ sender_id             : ForeignKey → User               │
│ content               : Text                            │
│ is_read               : Boolean                         │
│ created_at            : DateTime                        │
└─────────────────────────────────────────────────────────┘
         │
         │ belongs to
         ▼
┌─────────────────────────────────────────────────────────┐
│              ADVISOR ASSIGNMENT                         │
├─────────────────────────────────────────────────────────┤
│ id            : Integer (PK)                            │
│ student_id    : ForeignKey → User (STUDENT)             │
│ advisor_id    : ForeignKey → User (ADVISOR)             │
│ internship_id : ForeignKey → Internship                 │
│ is_active     : Boolean                                 │
│ created_at    : DateTime                                │
└─────────────────────────────────────────────────────────┘
         │
         │ has
         ▼
┌─────────────────────────────────────────────────────────┐
│                  INTERNSHIP                             │
├─────────────────────────────────────────────────────────┤
│ id         : Integer (PK)                               │
│ company_id : ForeignKey → User (COMPANY)                │
│ title      : String                                     │
│ ...        : Other fields                               │
└─────────────────────────────────────────────────────────┘
```

### Relationships

```
AdvisorAssignment
    ├── student (User with role=STUDENT)
    ├── advisor (User with role=ADVISOR)
    └── internship
            └── company (User with role=COMPANY)

Message
    ├── advisor_assignment (AdvisorAssignment)
    └── sender (User - can be STUDENT, ADVISOR, or COMPANY)
```

---

## 🔐 Permission Matrix

### Access Control Logic

```
┌─────────────────────────────────────────────────────────────┐
│  Can User Access Conversation?                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  IF user.role == 'STUDENT':                                 │
│      ✅ user == assignment.student                          │
│      ❌ Otherwise                                            │
│                                                              │
│  IF user.role == 'ADVISOR':                                 │
│      ✅ user == assignment.advisor                          │
│      ❌ Otherwise                                            │
│                                                              │
│  IF user.role == 'COMPANY':                                 │
│      ✅ user == assignment.internship.company               │
│      ❌ Otherwise                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Message Sending Logic

```
┌─────────────────────────────────────────────────────────────┐
│  Can User Send Message?                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  is_participant = (                                          │
│      user == assignment.student OR                           │
│      user == assignment.advisor OR                           │
│      user == assignment.internship.company                   │
│  )                                                           │
│                                                              │
│  IF is_participant:                                          │
│      ✅ Allow message sending                                │
│  ELSE:                                                       │
│      ❌ Deny (403 Forbidden)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Component Structure

### Page Hierarchy

```
CompanyDashboard
    │
    ├── WelcomeBanner
    │
    ├── Stats Section
    │   ├── StatCard (Total Postings)
    │   ├── StatCard (Open Positions)
    │   ├── StatCard (Pending Candidates)
    │   └── StatCard (Total Applicants)
    │
    ├── Recruitment Section
    │   ├── NavCard (Post Internship)
    │   ├── NavCard (Applicants)
    │   └── NavCard (My Internships)
    │
    ├── Management Section
    │   ├── NavCard (Messages) ◄── NEW!
    │   ├── NavCard (Monthly Progress)
    │   └── NavCard (Final Evaluations)
    │
    ├── Settings Section
    │   └── NavCard (Account Settings)
    │
    └── Sidebar
        ├── NotifSidebar
        └── Quick Links
            ├── Messages ◄── NEW!
            ├── Candidate Review
            ├── Progress Reports
            ├── Evaluation Center
            ├── Start Google Meet
            └── Change Password
```

### Messages Page Structure

```
MessagesModern Component
    │
    ├── Header
    │   └── Title: "Messages"
    │
    ├── Main Container (Split Layout)
    │   │
    │   ├── Left Panel (Conversations List)
    │   │   │
    │   │   ├── Search Bar
    │   │   │
    │   │   └── Conversation Items
    │   │       ├── Student Name
    │   │       ├── Advisor Name
    │   │       ├── Internship Title
    │   │       ├── Unread Count Badge
    │   │       ├── Last Message Preview
    │   │       └── Timestamp
    │   │
    │   └── Right Panel (Chat Window)
    │       │
    │       ├── Chat Header
    │       │   ├── Participant Names
    │       │   └── Internship Title
    │       │
    │       ├── Message List
    │       │   └── Message Bubbles
    │       │       ├── Sender Name
    │       │       ├── Sender Role Badge
    │       │       ├── Message Content
    │       │       ├── Timestamp
    │       │       └── Actions (Edit/Delete)
    │       │
    │       └── Message Input
    │           ├── Text Area
    │           └── Send Button
    │
    └── Empty State (No Conversations)
```

---

## 🔄 State Management

### Component State

```javascript
// CompanyDashboard State
{
  counts: {
    total: 5,
    open: 3,
    closed: 2,
    pending: 8,
    total_apps: 15
  },
  internships: [...],
  loading: false
}

// MessagesModern State
{
  conversations: [
    {
      assignment_id: 1,
      student_name: "John Doe",
      advisor_name: "Dr. Smith",
      internship_title: "Software Intern",
      unread_count: 2,
      last_message: "How is the project?",
      last_message_at: "2024-01-15T10:30:00Z"
    }
  ],
  selectedConversation: 1,
  messages: [...],
  newMessage: "",
  loading: false
}
```

---

## 🌐 API Integration

### Service Layer

```javascript
// messageService.js

export const messageService = {
  // Get all conversations
  getConversations: async () => {
    return await api.get('/api/messages/conversations/');
  },

  // Get messages for a conversation
  getMessages: async (assignmentId) => {
    return await api.get(`/api/messages/${assignmentId}/`);
  },

  // Send a message
  sendMessage: async (assignmentId, content) => {
    return await api.post('/api/messages/send/', {
      assignment_id: assignmentId,
      content: content
    });
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    return await api.put(`/api/messages/${messageId}/edit/`, {
      content: content
    });
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    return await api.delete(`/api/messages/${messageId}/delete/`);
  }
};
```

---

## 🔔 Notification System

### Notification Flow

```
┌─────────────┐
│   COMPANY   │
│ sends msg   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  NotificationService.create()       │
│                                     │
│  For each recipient:                │
│  - Create notification record       │
│  - Set type: MESSAGE_RECEIVED       │
│  - Set link: /role/messages         │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ STUDENT  │   │ ADVISOR  │   │ DATABASE │
│          │   │          │   │          │
│ Notif:   │   │ Notif:   │   │ Stored   │
│ "Company:│   │ "Company:│   │          │
│  Hello"  │   │  Hello"  │   │          │
└──────────┘   └──────────┘   └──────────┘
       │              │
       │              │
       ▼              ▼
┌──────────────────────────┐
│  Frontend Notification   │
│  Bell Icon Badge         │
│  Toast/Alert             │
└──────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│   FRONTEND    │         │   BACKEND     │
│   (React)     │         │   (Django)    │
│               │         │               │
│ - Dashboard   │◄───────►│ - REST API    │
│ - Messages    │         │ - Auth        │
│ - Routes      │         │ - Messaging   │
└───────────────┘         └───────┬───────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │   DATABASE    │
                          │  (PostgreSQL) │
                          │               │
                          │ - Users       │
                          │ - Messages    │
                          │ - Assignments │
                          └───────────────┘
```

---

## 📊 Performance Considerations

### Optimization Strategies

```
┌─────────────────────────────────────────────────────────────┐
│  BACKEND OPTIMIZATIONS                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Database Queries                                         │
│     - Use select_related() for foreign keys                 │
│     - Use prefetch_related() for reverse relations          │
│     - Add database indexes on frequently queried fields     │
│                                                              │
│  2. Caching                                                  │
│     - Cache conversation lists (5 min TTL)                  │
│     - Cache user profiles (10 min TTL)                      │
│     - Invalidate on message send                            │
│                                                              │
│  3. Pagination                                               │
│     - Limit conversations per page (20)                     │
│     - Limit messages per load (50)                          │
│     - Implement infinite scroll                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND OPTIMIZATIONS                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Component Optimization                                   │
│     - Use React.memo for message items                      │
│     - Virtualize long message lists                         │
│     - Debounce search input                                 │
│                                                              │
│  2. State Management                                         │
│     - Local state for UI interactions                       │
│     - Context for shared data                               │
│     - Avoid unnecessary re-renders                          │
│                                                              │
│  3. Network Optimization                                     │
│     - Batch API requests                                    │
│     - Implement request caching                             │
│     - Use WebSockets for real-time updates (future)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Analytics

### Key Metrics to Track

```
┌─────────────────────────────────────────────────────────────┐
│  USAGE METRICS                                               │
├─────────────────────────────────────────────────────────────┤
│  - Total messages sent (by role)                            │
│  - Active conversations                                      │
│  - Average response time                                     │
│  - Messages per conversation                                 │
│  - Peak usage hours                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PERFORMANCE METRICS                                         │
├─────────────────────────────────────────────────────────────┤
│  - API response times                                        │
│  - Database query performance                                │
│  - Error rates                                               │
│  - Notification delivery success                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  USER ENGAGEMENT                                             │
├─────────────────────────────────────────────────────────────┤
│  - Daily active users (by role)                             │
│  - Message read rates                                        │
│  - Feature adoption rate                                     │
│  - User satisfaction scores                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

### Measurable Goals

```
✅ Technical Success
   - 99.9% uptime
   - < 200ms API response time
   - < 1% error rate
   - 100% message delivery

✅ User Adoption
   - 80% of companies use messaging within first month
   - Average 5+ messages per conversation
   - 90% user satisfaction score

✅ Business Impact
   - Reduced email volume by 50%
   - Faster issue resolution (< 24 hours)
   - Improved intern satisfaction
   - Better company-university collaboration
```

---

## 📚 Summary

The company chat architecture provides:

- ✅ **Scalable** - Handles growing user base
- ✅ **Secure** - Role-based access control
- ✅ **Performant** - Optimized queries and caching
- ✅ **Maintainable** - Clean code structure
- ✅ **Extensible** - Easy to add features
- ✅ **User-friendly** - Intuitive interface

**The system is production-ready and built for growth!** 🚀
