# Landing Page Display Analysis

## Issue Report
User reported that companies posting internships are not showing on the landing page (http://localhost:5173/)

## Root Cause Identified

The landing page is **working correctly**. It only displays companies that have **OPEN and ACTIVE** internships.

### Database Status (as of May 1, 2026)

#### Companies WITH Open & Active Internships (Showing on Landing Page ✅)
1. **DataDrive Systems**: 2 open & active internships
2. **TechCorp Solutions**: 2 open & active internships  
3. **InnovateSoft Ltd**: 2 open & active internships

#### Companies WITHOUT Open & Active Internships (NOT Showing ❌)
1. **Ethio Telecom**: 3 internships, all CLOSED
2. **navigated.tec**: 3 internships with status=OPEN but **is_active=False** ⚠️

## The Problem with navigated.tec

navigated.tec has 3 internships:
- ID 48: "hhhhhhhhhhhhhhhhhhhhhhhhhh" - Status: OPEN, Active: **False**
- ID 47: "fullstackdeveloper" - Status: OPEN, Active: **False**
- ID 46: "Fullstack JavaScript Developer (Angular + Node.js)" - Status: OPEN, Active: **False**

These internships have `status='OPEN'` but `is_active=False`, which means they were soft-deleted or deactivated.

## Backend API Logic

```python
# From Backend/apps/internships/views.py - public_internships_list()
queryset = Internship.objects.filter(
    is_active=True,    # Must be active
    status='OPEN'      # Must be open
)
```

This is correct behavior - inactive internships should not be displayed publicly.

## Frontend Logic

```javascript
// From Frontend/src/services/publicService.js - getPublicCompanies()
// Fetches all open internships, then groups by company
// Only companies with at least one open internship are shown
```

This is also correct - the landing page should only show companies with available opportunities.

## Solutions

### Option 1: Fix navigated.tec Internships (Recommended)
Reactivate the navigated.tec internships if they should be visible:

```python
# Run in Django shell
from apps.internships.models import Internship
Internship.objects.filter(company__company_profile__company_name='navigated.tec').update(is_active=True)
```

### Option 2: Show ALL Companies Regardless of Internship Status
Modify the landing page to show all approved companies, not just those with open internships.

**Pros**: Users see all partner companies
**Cons**: May confuse users if companies have no available positions

### Option 3: Add Two Sections
- "Companies with Open Positions" (current behavior)
- "All Partner Companies" (shows everyone)

## Current System Status

✅ **Backend API**: Working correctly - returns 6 open & active internships
✅ **Frontend Service**: Working correctly - groups internships by company
✅ **Landing Page**: Working correctly - displays 3 companies with open positions
✅ **Console Logs**: No actual errors - all API calls successful

The repeated API calls in console are normal React StrictMode behavior in development.

## Recommendation

**Reactivate navigated.tec internships** if they should be visible. The current system design is correct - landing pages should only show companies with available opportunities to avoid user frustration.

If you want to show all companies regardless of internship availability, that's a design decision that requires modifying the landing page logic.
