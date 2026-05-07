# Company Visibility Guide - Where Companies Appear

## Two Different Pages

Your system has TWO pages that show companies:

### 1. Landing Page (Public - No Login Required)
**URL**: http://localhost:5173/
**Section**: "Partner Organizations"
**Who can see**: Everyone (no login needed)
**Shows**: Only companies with at least ONE OPEN internship

### 2. Partner Organizations Page (Requires Login)
**URL**: http://localhost:5173/partner-organizations
**Who can see**: Logged-in users only
**Shows**: ALL registered companies (even without internships)

## Why Your New Company Doesn't Show on Landing Page

The landing page is designed for **students looking for internship opportunities**. It only shows companies that currently have open positions available.

**Current Status** (from database check):

✅ **Companies showing on landing page** (have open internships):
- navigated.tec (2 open internships)
- DataDrive Systems (2 open internships)
- InnovateSoft Ltd (2 open internships)
- TechCorp Solutions (2 open internships)

❌ **Companies NOT showing on landing page** (no open internships):
- navey company (1 closed internship)
- Tech Corp (0 internships)
- Ethio Telecom (3 closed internships)

## Solution: Make Your Company Appear on Landing Page

### Step 1: Login as the Company

Use the company email and password you registered with.

### Step 2: Create an Internship Post

1. Go to company dashboard
2. Click "Post Internship" or "Create Internship"
3. Fill in the form:

**Required Fields**:
```
Title: e.g., "Software Developer Intern"
Description: Brief job description (at least 50 characters)
Required Skills: At least 2 skills, comma-separated
  Example: "Python, Django" or "React, JavaScript, HTML"
Location: City or address
Duration: 1-12 months (e.g., 3 or 6)
Start Date: Any future date
Max Applicants: 1-50 (e.g., 5)
```

**IMPORTANT**:
- ✅ Status must be "OPEN"
- ✅ "Is Active" must be checked/enabled
- ✅ Start date must be in the future

### Step 3: Submit and Verify

1. Click "Create" or "Submit"
2. Go to landing page: http://localhost:5173/
3. Scroll to "Partner Organizations"
4. Click the green "Refresh" button
5. Your company should now appear!

## Alternative: View All Companies (Including Yours)

If you want to see ALL registered companies (including those without internships):

1. **Login** to the system (any user account)
2. **Navigate to**: http://localhost:5173/partner-organizations
3. You'll see ALL companies, including:
   - Companies with internships
   - Companies without internships
   - Companies with closed internships

This page shows:
- Company name and logo
- Contact information
- Statistics (total internships, active, applications)
- List of all their internship posts (open and closed)

## Quick Test: Check Your Company Status

Run this command to see all companies and their status:

```bash
cd Backend
python check_companies.py
```

This will show:
- All registered companies
- How many internships each has
- Which ones will show on landing page (✅) and which won't (❌)

## Example: Making "navey company" Appear

Based on the database check, "navey company" has 1 internship but it's CLOSED.

**Option 1: Reopen the existing internship**
1. Login as navey company (bin504121@gmail.com)
2. Go to "My Internships"
3. Find the closed internship
4. Click "Reopen" or change status to "OPEN"
5. Refresh landing page - company will appear!

**Option 2: Create a new internship**
1. Login as navey company
2. Click "Post Internship"
3. Fill in the form (see Step 2 above)
4. Make sure status is "OPEN"
5. Submit
6. Refresh landing page - company will appear!

## Summary Table

| Page | URL | Login Required | Shows |
|------|-----|----------------|-------|
| **Landing Page** | http://localhost:5173/ | ❌ No | Only companies with OPEN internships |
| **Partner Organizations** | http://localhost:5173/partner-organizations | ✅ Yes | ALL registered companies |

## Why This Design?

**Landing Page (Public)**:
- Purpose: Help students find internship opportunities
- Audience: Prospective students, visitors
- Logic: Only show companies with available positions
- Benefit: Students see only relevant, actionable opportunities

**Partner Organizations (Authenticated)**:
- Purpose: Show all university partners
- Audience: Logged-in users (students, staff, companies)
- Logic: Show all registered companies
- Benefit: Complete directory of all partners

## Verification Steps

### 1. Check if Company Has Open Internships

```bash
cd Backend
python check_companies.py
```

Look for your company in the output. It will show:
- ✅ WILL SHOW on landing page (if has open internships)
- ❌ WILL NOT SHOW on landing page (if no open internships)

### 2. Test Landing Page

1. Open: http://localhost:5173/
2. Scroll to "Partner Organizations"
3. Look for counter: "X companies loaded"
4. Check if your company appears

### 3. Test Partner Organizations Page

1. Login to the system
2. Go to: http://localhost:5173/partner-organizations
3. Your company SHOULD appear here (even without internships)
4. Use search to find your company name

## Need Help?

If your company still doesn't appear after creating an OPEN internship:

1. **Clear browser cache**: Ctrl + Shift + Delete
2. **Hard refresh**: Ctrl + Shift + R
3. **Click "Refresh" button** on landing page
4. **Check console** (F12) for errors
5. **Run check_companies.py** to verify database
6. **Check internship status**: Must be "OPEN" and "is_active=True"

## Quick Reference

**To appear on landing page, company must have**:
- ✅ At least 1 internship post
- ✅ Internship status = "OPEN"
- ✅ Internship is_active = True
- ✅ Valid company profile with name

**To appear on Partner Organizations page**:
- ✅ Just be registered (no internship needed)
- ✅ User must be logged in to view

## Files for Reference

- `WHY_COMPANIES_NOT_SHOWING.md` - Detailed explanation
- `check_companies.py` - Script to check company status
- `DEBUG_LANDING_PAGE.md` - Troubleshooting guide
- `test_api.html` - Test API directly
