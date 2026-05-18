# 🧪 Test Data Guide for Advisor Overload Resolution

## Quick Start

### Step 1: Create Test Data

Run the enhanced test data creation script:

```bash
cd Backend
python create_overload_test_data.py
```

This will create:
- **7 Advisors** with varying workloads
- **85+ Students** distributed across advisors
- **Realistic assignments** with proper relationships

### Step 2: Start Servers

**Backend:**
```bash
cd Backend
python manage.py runserver 0.0.0.0:8000
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 3: Test the Feature

1. Visit: `http://localhost:5173/department/advisor-overload`
2. Login as Department Head
3. Explore the modern interface!

## 📊 Test Data Overview

### Overloaded Advisors (Red) 🔴
These advisors have MORE students than their maximum capacity:

| Advisor | Email | Max | Assigned | Status |
|---------|-------|-----|----------|--------|
| Dr. Sarah Overloaded | dr.overloaded@university.edu | 15 | 22 | 🔴 +7 over |
| Dr. John Critical | dr.critical@university.edu | 12 | 18 | 🔴 +6 over |
| Dr. Mary Highload | dr.highload@university.edu | 15 | 16 | 🔴 +1 over |

### Available Advisors (Green) 🟢
These advisors have capacity to take more students:

| Advisor | Email | Max | Assigned | Available |
|---------|-------|-----|----------|-----------|
| Dr. Emily Available | dr.available@university.edu | 20 | 8 | 12 slots |
| Dr. Michael Capacity | dr.capacity@university.edu | 18 | 5 | 13 slots |
| Dr. Lisa Ready | dr.ready@university.edu | 15 | 3 | 12 slots |

### Moderate Load Advisors 🟠
| Advisor | Email | Max | Assigned | Available |
|---------|-------|-----|----------|-----------|
| Dr. James Moderate | dr.moderate@university.edu | 15 | 13 | 2 slots |

## 🧪 Test Scenarios

### Scenario 1: Basic Reassignment
1. Select **Dr. Sarah Overloaded** (22/15 students)
2. Select **3-5 students** from her list
3. Choose **Dr. Emily Available** (8/20 students)
4. Click **Confirm Reassignment**
5. ✅ Verify the counts update correctly

### Scenario 2: Maximum Capacity Transfer
1. Select **Dr. John Critical** (18/12 students)
2. Select **12 students** (all available slots)
3. Choose **Dr. Michael Capacity** (5/18 students)
4. Click **Confirm Reassignment**
5. ✅ Verify Dr. Michael now has 17/18 students

### Scenario 3: Multiple Small Transfers
1. Select **Dr. Mary Highload** (16/15 students)
2. Select **1 student**
3. Choose **Dr. Lisa Ready** (3/15 students)
4. Repeat for other overloaded advisors
5. ✅ Verify all advisors are within capacity

### Scenario 4: Capacity Validation
1. Select **Dr. Sarah Overloaded**
2. Select **15 students**
3. Try to assign to **Dr. James Moderate** (only 2 slots)
4. ✅ Verify error message appears
5. ✅ Verify button is disabled

## 🔑 Test Credentials

**All accounts use password:** `password123`

### Advisors
- dr.overloaded@university.edu
- dr.critical@university.edu
- dr.highload@university.edu
- dr.moderate@university.edu
- dr.available@university.edu
- dr.capacity@university.edu
- dr.ready@university.edu

### Students
- student001@university.edu
- student002@university.edu
- student003@university.edu
- ... (up to student085@university.edu)

## 🎯 What to Test

### Visual Elements
- ✅ Statistics cards show correct counts
- ✅ Gradient backgrounds and animations work
- ✅ Progress bars display correctly
- ✅ Color coding (red/green/blue) is clear
- ✅ Table displays all available advisors
- ✅ Hover effects work smoothly

### Functionality
- ✅ Selecting overloaded advisor shows students
- ✅ Checkbox selection works
- ✅ "Select All" button works
- ✅ Available advisors table is sortable
- ✅ Capacity validation prevents over-assignment
- ✅ Reassignment updates counts in real-time
- ✅ Success/error messages display correctly
- ✅ Refresh button reloads data

### Responsive Design
- ✅ Works on desktop (1920px)
- ✅ Works on tablet (768px)
- ✅ Works on mobile (375px)
- ✅ Table scrolls horizontally on small screens
- ✅ Action bar stacks on mobile

## 🔄 Reset Test Data

To reset and recreate test data:

```bash
cd Backend
python create_overload_test_data.py
```

The script is idempotent - it will update existing records or create new ones.

## 🐛 Troubleshooting

### No Overloaded Advisors Showing
- Run the test data script again
- Check Django server is running
- Verify API endpoint: `http://localhost:8000/api/departments/overloaded-advisors/`

### Students Not Appearing
- Ensure you've selected an overloaded advisor first
- Check browser console for errors
- Verify assignments exist in database

### Reassignment Not Working
- Check both advisors are selected
- Verify students are selected
- Check capacity validation
- Look for error messages in UI

### Table Not Displaying
- Verify DataTable component is imported
- Check browser console for errors
- Ensure available advisors exist

## 📝 Database Queries

Check data directly in PostgreSQL:

```sql
-- View all advisors with their loads
SELECT 
    u.email,
    ap.full_name,
    ap.max_students,
    COUNT(aa.id) as current_load
FROM accounts_user u
JOIN accounts_advisorprofile ap ON u.id = ap.user_id
LEFT JOIN advisors_advisorassignment aa ON u.id = aa.advisor_id AND aa.is_active = true
WHERE u.role = 'ADVISOR'
GROUP BY u.id, ap.id
ORDER BY current_load DESC;

-- View overloaded advisors
SELECT 
    u.email,
    ap.full_name,
    ap.max_students,
    COUNT(aa.id) as current_load,
    COUNT(aa.id) - ap.max_students as excess
FROM accounts_user u
JOIN accounts_advisorprofile ap ON u.id = ap.user_id
LEFT JOIN advisors_advisorassignment aa ON u.id = aa.advisor_id AND aa.is_active = true
WHERE u.role = 'ADVISOR'
GROUP BY u.id, ap.id
HAVING COUNT(aa.id) > ap.max_students
ORDER BY excess DESC;
```

## 🎨 Visual Testing Checklist

- [ ] Statistics cards have gradient backgrounds
- [ ] Overloaded panel has red gradient header
- [ ] Students panel has blue gradient header
- [ ] Available advisors panel has green gradient header
- [ ] Avatar circles show initials
- [ ] Progress bars animate smoothly
- [ ] Hover effects work on all cards
- [ ] Selection states are clearly visible
- [ ] Action bar appears when ready
- [ ] Buttons have hover animations
- [ ] Table is clean and professional
- [ ] Alerts display with correct colors
- [ ] Loading spinner appears during operations

## 📊 Expected Results

After running the test data script:

```
🔴 Overloaded Advisors: 3
🟠 High Load Advisors: 1
🟢 Available Advisors: 3
👥 Total Advisors: 7
👨‍🎓 Total Students: 85+
```

## 🚀 Performance Tips

- Test with 100+ students for realistic load
- Try reassigning 10+ students at once
- Test rapid clicking and selections
- Verify no memory leaks during operations
- Check API response times

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console and Django server logs for detailed error messages.
