# Settings Save Button Fix & Supervisor-Advisor Feature Implementation

## Issue Analysis

### Settings Save Button Problem
The Settings page save button may not be working due to:
1. **Email field is read-only** in the backend serializer but being sent in the update request
2. **Field name mismatch** - Frontend sends `full_name` but backend expects `contact_person_name` for companies
3. **Missing error handling** - Errors from backend may not be properly displayed

### Supervisor-Advisor Feature Requirements
User requested: "When company supervisor fills in their information, it should show the student's advisor and enable communication (notifications and chat) between supervisor and advisor, allowing supervisor to send monthly reports to student advisor."

## Solution Implementation

### Part 1: Fix Settings Save Button

#### Frontend Changes (Settings.jsx)
1. Remove `email` from the data being sent to backend (it's read-only)
2. Ensure proper field mapping for company profiles
3. Add better error handling and display

#### Backend Changes
1. Verify the serializer accepts the fields being sent
2. Add proper validation and error messages
3. Ensure the PATCH endpoint handles partial updates correctly

### Part 2: Supervisor-Advisor Feature

This feature requires:

#### Database Changes
1. Add `supervisor_name`, `supervisor_email`, `supervisor_phone` fields to CompanyProfile
2. Create a relationship between company supervisors and student advisors through internship assignments

#### Backend API Changes
1. Add endpoint to get student's advisor information when supervisor is assigned
2. Modify notification system to include advisor in supervisor communications
3. Update monthly report submission to notify advisors

#### Frontend Changes
1. Add supervisor information fields to Settings page
2. Create UI to display assigned student's advisor information
3. Add notification system for supervisor-advisor communication
4. Modify report submission to include advisor as recipient

## Implementation Steps

### Step 1: Fix Settings Save Button (Immediate)
- Remove email from update payload for companies
- Fix field name mapping
- Add console logging for debugging

### Step 2: Add Supervisor Fields to Database
- Add migration for new supervisor fields
- Update CompanyProfile model
- Update serializer

### Step 3: Create Supervisor-Advisor Connection
- When student is assigned to company, link supervisor to student's advisor
- Create API endpoint to fetch advisor information
- Add notification triggers

### Step 4: Update Frontend UI
- Add supervisor fields to Settings
- Create advisor information display
- Add communication features

## Testing Checklist
- [ ] Settings save button works for all user roles
- [ ] Company supervisor can fill in their information
- [ ] Supervisor can see assigned student's advisor
- [ ] Notifications are sent to advisor when supervisor updates
- [ ] Monthly reports are sent to both student and advisor
- [ ] Chat system includes advisor in conversations

## Files to Modify

### Frontend
- `Frontend/src/pages/settings/Settings.jsx` - Fix save button, add supervisor fields
- `Frontend/src/pages/company/CompanyDashboardPremium.jsx` - Display advisor info
- `Frontend/src/pages/company/ReportSubmissionModern.jsx` - Add advisor to recipients
- `Frontend/src/services/authService.js` - Update API calls

### Backend
- `Backend/apps/accounts/models.py` - Add supervisor fields
- `Backend/apps/accounts/serializers.py` - Update CompanyProfileSerializer
- `Backend/apps/accounts/views.py` - Enhance profile update logic
- `Backend/apps/advisors/views.py` - Add endpoint to get advisor for company
- `Backend/apps/reports/views.py` - Update report submission to notify advisor
- `Backend/apps/messaging/views.py` - Include advisor in notifications

## Priority
1. **HIGH**: Fix Settings save button (blocking user from updating profile)
2. **MEDIUM**: Add supervisor information fields
3. **MEDIUM**: Implement supervisor-advisor connection
4. **LOW**: Add advanced communication features
