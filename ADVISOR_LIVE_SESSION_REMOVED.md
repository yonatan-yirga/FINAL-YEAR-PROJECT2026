# Live Session Removed from Advisor Dashboard

## Change Summary
Removed the "Live Session" / "Start Meet" feature from the Advisor Dashboard at `/advisor/dashboard`.

## What Was Removed

### 1. Main Navigation Card (Account & System Section)
- **Card:** "Live Session"
- **Icon:** 🎥
- **Subtitle:** "Start Meet"
- **Action:** Opened Google Meet in new tab

### 2. Sidebar Quick Links
- **Link:** "Start Google Meet"
- **Icon:** 🎥
- **Action:** Opened Google Meet in new tab

## What Remains

### Main Dashboard
✅ **Students Overview Stats** (4 cards)
  - Total Cohort
  - Active Status
  - Graduated/Comp
  - Feedback Given

✅ **Core Responsibilities** (4 cards)
  - Maintain Student Progress
  - Review Student Reports
  - Submit Student Evaluations
  - Active Mentorship

✅ **Account & System** (2 cards - reduced from 3)
  - All Alerts
  - Security

✅ **Assigned Cohort Highlights**
  - Recent students list

### Sidebar
✅ **Notifications**

✅ **Quick Links** (5 links - reduced from 6)
  - Student Roster
  - Messages
  - Audit Reports
  - Evaluation Hub
  - Change Password

## Files Modified
- `Frontend/src/pages/Dashboards.jsx`
  - Removed Live Session card from Account & System section
  - Removed Start Google Meet from sidebar Quick Links
  - Changed grid from 3 columns to 2 columns for Account & System section

## Visual Changes
- **Account & System section:** Now displays 2 cards in a row instead of 3
- **Sidebar Quick Links:** Now shows 5 items instead of 6
- Cleaner interface without video meeting integration

## Status
✅ **COMPLETE** - Live Session feature removed from Advisor Dashboard
