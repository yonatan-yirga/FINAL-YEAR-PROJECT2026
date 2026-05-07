# Why New Companies Don't Show on Landing Page

## The Issue

You registered a new company, but it doesn't appear in the **Partner Organizations** section on the landing page.

## Why This Happens

The landing page **only shows companies that have at least one OPEN internship post**. This is intentional because:

1. **Purpose**: The landing page is for students to find internship opportunities
2. **Relevance**: Only companies with available positions should be shown
3. **User Experience**: Empty companies would confuse students

## Current Status

Based on the database check, here are all registered companies:

### ✅ Companies Showing on Landing Page (4)

1. **navigated.tec** - 2 open internships
2. **DataDrive Systems** - 2 open internships  
3. **InnovateSoft Ltd** - 2 open internships
4. **TechCorp Solutions** - 2 open internships

### ❌ Companies NOT Showing (3)

1. **navey company** (bin504121@gmail.com)
   - Has 1 internship but it's CLOSED
   - **Solution**: Reopen the internship or create a new one

2. **Tech Corp** (company@test.com)
   - Has 0 internships
   - **Solution**: Create at least one internship post

3. **Ethio Telecom** (ethio@telecom.com)
   - Has 3 internships but all are CLOSED
   - **Solution**: Reopen an internship or create a new one

## How to Make a Company Appear

### Option 1: Create a New Internship Post

1. **Login as the company**
2. **Go to company dashboard**
3. **Click "Post Internship" or "Create Internship"**
4. **Fill in the form**:
   - Title: e.g., "Software Developer Intern"
   - Description: Job description
   - Required Skills: At least 2 skills
   - Location: City/address
   - Duration: 1-12 months
   - Start Date: Future date
   - Max Applicants: 1-50
5. **Make sure**:
   - Status is set to **"OPEN"**
   - Is Active is **checked/true**
6. **Submit the form**
7. **Refresh landing page** - company should now appear!

### Option 2: Reopen a Closed Internship

If the company has closed internships:

1. **Login as the company**
2. **Go to "My Internships"**
3. **Find the closed internship**
4. **Click "Reopen" or change status to "OPEN"**
5. **Refresh landing page** - company should now appear!

## Verification Steps

### Step 1: Check if Company Has Open Internships

Run this command:
```bash
cd Backend
python check_companies.py
```

This will show:
- All registered companies
- How many internships each has
- Which ones will show on landing page

### Step 2: Test the Landing Page

1. Open: http://localhost:5173/
2. Scroll to "Partner Organizations"
3. Click the green "Refresh" button
4. Check the counter: "X companies loaded"
5. Look for your company card

### Step 3: Check Browser Console

1. Press F12 to open DevTools
2. Go to Console tab
3. Click "Refresh" button
4. Look for logs showing your company being processed

## Alternative: Show All Companies Page

If you want to show ALL registered companies (even without internships), I can create a separate page for that. This would be useful for:

- Showcasing all partner companies
- Company directory
- Networking purposes

Would you like me to create an "All Companies" or "Company Directory" page that shows every registered company regardless of internship posts?

## Quick Fix for Your New Company

To make your newly registered company appear on the landing page:

1. **Login with the company account**
2. **Create one internship post** with these minimum requirements:
   ```
   Title: Any job title
   Description: Brief description
   Required Skills: At least 2 skills (comma-separated)
   Location: City name
   Duration: 3-6 months
   Start Date: Any future date
   Max Applicants: 5
   Status: OPEN ✓
   Is Active: Yes ✓
   ```
3. **Save/Submit**
4. **Go to landing page** (http://localhost:5173/)
5. **Click "Refresh" button**
6. **Your company should now appear!**

## Technical Details

### Backend Logic

The public API endpoint filters internships:
```python
# Backend/apps/internships/views.py
queryset = Internship.objects.filter(
    is_active=True,
    status='OPEN'  # Only OPEN internships
)
```

### Frontend Logic

The landing page groups internships by company:
```javascript
// Frontend/src/services/publicService.js
// Only companies with internships in the response will appear
data.forEach(internship => {
    const companyName = internship.company_name;
    // Group by company...
});
```

## Summary

**Why companies don't show**: Landing page only shows companies with OPEN internships

**Solution**: Create at least one OPEN internship post for the company

**Verification**: Run `python check_companies.py` to see which companies will show

**Alternative**: I can create a separate "All Companies" directory page if needed
