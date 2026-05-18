# Location-Based Filtering Test Guide 🧪

## Quick Start

### Step 1: Run the Test Data Script

Open your terminal in the Backend directory and run:

```bash
cd Backend
python create_location_test_data.py
```

This will create:
- **2 Overloaded Advisors** (at different locations)
- **5 Available Advisors** (distributed across the same locations)
- **38 Students** (assigned to the overloaded advisors)

### Step 2: Login as Department Head

Use any department head account or create one if needed.

### Step 3: Navigate to Advisor Overload Resolution

Go to: **Department Dashboard → Advisor Overload Resolution**

---

## Test Scenarios

### 🧪 Test Case 1: Building A Location Filtering

**Steps:**
1. Click on **"Dr. Sarah Overloaded"** in the Overloaded Advisors table
2. Check the Location column shows: **"Building A, Room 101"**
3. Observe the Students to Reassign panel (should show 20 students)
4. Look at the Available Advisors panel

**Expected Results:**
- ✅ Green banner shows: "Showing advisors from: **Building A, Room 101**"
- ✅ Available Advisors count shows: **(3)** instead of (5)
- ✅ Only these 3 advisors are visible:
  - Dr. John Available (7 slots available)
  - Dr. Mary Helper (5 slots available)
  - Dr. James Ready (10 slots available)
- ✅ Total available capacity: **22 slots** (enough for all 20 students)

---

### 🧪 Test Case 2: Building B Location Filtering

**Steps:**
1. Click on **"Dr. Michael Critical"** in the Overloaded Advisors table
2. Check the Location column shows: **"Building B, Room 205"**
3. Observe the Students to Reassign panel (should show 18 students)
4. Look at the Available Advisors panel

**Expected Results:**
- ✅ Green banner shows: "Showing advisors from: **Building B, Room 205**"
- ✅ Available Advisors count shows: **(2)** instead of (5)
- ✅ Only these 2 advisors are visible:
  - Dr. Lisa Support (8 slots available)
  - Dr. Robert Assist (6 slots available)
- ✅ Total available capacity: **14 slots** (not enough for all 18 students - need multiple reassignments)

---

### 🧪 Test Case 3: Reassignment Workflow

**Steps:**
1. Select **"Dr. Sarah Overloaded"** (Building A)
2. Check **5 students** from the Students to Reassign table
3. Click **"Select"** on **"Dr. John Available"** (Building A)
4. Click **"Confirm Reassignment"** at the bottom

**Expected Results:**
- ✅ Success message appears
- ✅ Dr. Sarah's load decreases: 20 → 15 students
- ✅ Dr. John's load increases: 8 → 13 students
- ✅ Dr. Sarah may no longer appear in Overloaded Advisors (if now at capacity)
- ✅ All reassigned students remain at Building A location

---

### 🧪 Test Case 4: Empty State (No Advisors at Location)

To test this scenario, you would need to:
1. Create an overloaded advisor at a unique location (e.g., "Building C, Room 301")
2. Ensure no available advisors exist at that location

**Expected Results:**
- ✅ Empty state message: "No available advisors at this location"
- ✅ Shows the location being searched
- ✅ No advisors displayed in the table

---

## Test Data Overview

### 📍 Building A, Room 101

| Advisor | Status | Current Load | Available Slots |
|---------|--------|--------------|-----------------|
| Dr. Sarah Overloaded | 🔴 Overloaded | 20/15 | -5 (over limit) |
| Dr. John Available | 🟢 Available | 8/15 | 7 slots |
| Dr. Mary Helper | 🟢 Available | 10/15 | 5 slots |
| Dr. James Ready | 🟢 Available | 5/15 | 10 slots |

**Total Available Capacity:** 22 slots

### 📍 Building B, Room 205

| Advisor | Status | Current Load | Available Slots |
|---------|--------|--------------|-----------------|
| Dr. Michael Critical | 🔴 Overloaded | 18/12 | -6 (over limit) |
| Dr. Lisa Support | 🟢 Available | 7/15 | 8 slots |
| Dr. Robert Assist | 🟢 Available | 9/15 | 6 slots |

**Total Available Capacity:** 14 slots

---

## Login Credentials

All test accounts use the password: **`password123`**

### Overloaded Advisors
- `overloaded.buildingA@test.edu` (Building A, Room 101)
- `overloaded.buildingB@test.edu` (Building B, Room 205)

### Available Advisors (Building A)
- `available1.buildingA@test.edu`
- `available2.buildingA@test.edu`
- `available3.buildingA@test.edu`

### Available Advisors (Building B)
- `available1.buildingB@test.edu`
- `available2.buildingB@test.edu`

### Students
- `student1@test.edu` through `student38@test.edu`

---

## Verification Checklist

### Visual Elements
- [ ] Location column appears in Overloaded Advisors table
- [ ] Location column appears in Available Advisors table
- [ ] Green info banner shows when advisor is selected
- [ ] Banner displays correct location name
- [ ] Available Advisors count updates dynamically

### Filtering Logic
- [ ] Selecting Building A advisor shows only Building A available advisors
- [ ] Selecting Building B advisor shows only Building B available advisors
- [ ] Deselecting advisor shows all available advisors
- [ ] Location matching is case-insensitive
- [ ] Empty state shows when no advisors at location

### Reassignment Workflow
- [ ] Can select students from overloaded advisor
- [ ] Can only select available advisors from same location
- [ ] Reassignment completes successfully
- [ ] Student counts update correctly
- [ ] Students remain at same location after reassignment

---

## Troubleshooting

### Issue: No overloaded advisors showing
**Solution:** Run the test data script again to ensure advisors are created with correct loads

### Issue: All advisors showing (not filtered by location)
**Solution:** 
1. Check that advisors have `advising_location` field populated
2. Verify the filtering logic in `AdvisorOverloadResolution.jsx`
3. Check browser console for any JavaScript errors

### Issue: Location column shows "Not specified"
**Solution:** 
1. Verify the backend API is returning `advising_location` field
2. Check the advisor profile in Django admin
3. Re-run the test data script

### Issue: Empty state always showing
**Solution:**
1. Ensure location strings match exactly (case-insensitive, but exact text)
2. Check for extra spaces or special characters in location strings
3. Verify available advisors exist at the same location

---

## Clean Up

To remove all test data:

```python
# In Django shell or create a cleanup script
from django.contrib.auth import get_user_model
User = get_user_model()

# Delete test users
test_emails = [
    'overloaded.buildingA@test.edu',
    'overloaded.buildingB@test.edu',
    'available1.buildingA@test.edu',
    'available2.buildingA@test.edu',
    'available3.buildingA@test.edu',
    'available1.buildingB@test.edu',
    'available2.buildingB@test.edu',
]

# Add student emails
test_emails.extend([f'student{i}@test.edu' for i in range(1, 39)])

User.objects.filter(email__in=test_emails).delete()
```

---

## Expected Behavior Summary

1. **Before Selection:** All available advisors visible (5 total)
2. **After Selecting Building A Advisor:** Only 3 Building A advisors visible
3. **After Selecting Building B Advisor:** Only 2 Building B advisors visible
4. **Location Banner:** Shows current filtered location
5. **Count Update:** Shows filtered count, not total count
6. **Reassignment:** Only allows selection of same-location advisors

---

**Status:** ✅ Ready for Testing
**Created:** 2026-05-15
**Script:** `Backend/create_location_test_data.py`
