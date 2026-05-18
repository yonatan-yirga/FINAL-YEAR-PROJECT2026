# Advisor Overload Resolution - Quick Start Guide

## 🚀 Quick Access

**URL:** `http://localhost:5173/department/advisor-overload`

**Or via Advisors page:**
1. Go to `http://localhost:5173/department/advisors`
2. Click the orange "Resolve Overload" button (top right)

## 📋 Prerequisites

- You must be logged in as a **Department Head**
- At least one advisor must be overloaded (exceeding their `max_students` limit)

## 🎯 5-Step Resolution Process

### Step 1: View Overloaded Advisors
- Left panel shows advisors exceeding their capacity
- Red workload bar indicates overload
- Shows excess count (e.g., "+3 over limit")

### Step 2: Select Advisor
- Click on an overloaded advisor in the left panel
- Their students appear in the middle panel

### Step 3: Select Students
- Check individual students to reassign
- Or click "Select All" to select all excess students
- Selected students are highlighted in green

### Step 4: Choose Target Advisor
- Right panel shows available advisors
- Click an advisor with sufficient capacity
- Advisors without enough capacity are grayed out

### Step 5: Confirm
- Review the summary in the action bar at bottom
- Click "Confirm Reassignment"
- Wait for success message
- Page auto-refreshes with updated data

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────────────────────┐
│  Advisor Overload Resolution                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ OVERLOADED   │  │  STUDENTS    │  │  AVAILABLE   │         │
│  │  ADVISORS    │  │ TO REASSIGN  │  │  ADVISORS    │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │              │  │              │  │              │         │
│  │ Dr. Smith    │  │ ☑ Jane Doe   │  │ Dr. Johnson  │         │
│  │ 18/15 (120%) │  │ ☑ John Smith │  │ 8/15 (53%)   │         │
│  │ +3 over      │  │ ☐ Mary Jones │  │ 7 slots      │         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ From: Dr. Smith → To: Dr. Johnson │ Students: 2       │    │
│  │                          [Confirm Reassignment]        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding

| Color | Percentage | Status |
|-------|------------|--------|
| 🟢 Green | 0-80% | Normal workload |
| 🟠 Orange | 80-99% | High load, near capacity |
| 🔴 Red | 100%+ | **OVERLOADED** - needs action |

## 💡 Tips

### Selecting Students
- Start with most recently assigned students (shown at top)
- Consider internship start dates
- Check company locations if advisor has location preference

### Choosing Target Advisor
- Look for advisors with lowest workload percentage
- Consider department expertise match
- Check advising location compatibility

### Capacity Planning
- Default max is 15 students per advisor
- Can be customized per advisor in their profile
- System prevents over-assignment

## 🔔 What Happens After Reassignment

### Students Receive:
- **Notification:** "Advisor Changed"
- **Message:** "Your advisor has been changed to [New Advisor Name]"
- **Link:** Takes them to their active internship page

### New Advisor Receives:
- **Notification:** "New Student Assigned"
- **Message:** "[Student Name] has been assigned to you"
- **Link:** Takes them to their students list

### Old Advisor:
- Students removed from their list
- Workload count updated automatically

## 🧪 Test the Feature

### Create Test Overload Scenario

1. **Find an advisor:**
   ```sql
   SELECT id, email FROM users WHERE role='ADVISOR' LIMIT 1;
   ```

2. **Check their max_students:**
   ```sql
   SELECT max_students FROM advisor_profiles WHERE user_id = [advisor_id];
   ```

3. **Assign more students than max:**
   - Use the "Assign Advisor" page
   - Assign students until advisor is overloaded
   - Or manually update in database

4. **Test resolution:**
   - Go to `/department/advisor-overload`
   - Follow the 5-step process
   - Verify reassignment works

## 📊 Run Analysis Script

For detailed workload analysis:

```bash
cd Backend
python resolve_overloaded_advisors.py
```

This shows:
- All overloaded advisors
- Available capacity per advisor
- Suggested redistributions
- Actionable recommendations

## ❓ Common Questions

### Q: What if no advisors are overloaded?
**A:** You'll see a green success message: "No overloaded advisors found! All advisors are within their capacity limits."

### Q: Can I reassign students to an advisor in a different department?
**A:** No, students can only be reassigned within the same department.

### Q: What if the target advisor doesn't have enough capacity?
**A:** The system will gray out advisors with insufficient capacity and prevent selection.

### Q: Can I undo a reassignment?
**A:** Yes, just reassign the students back to the original advisor (if they have capacity).

### Q: How do I increase an advisor's capacity?
**A:** Update the `max_students` field in their advisor profile (via Django admin or database).

## 🐛 Troubleshooting

### Issue: Button not showing on Advisors page
- Clear browser cache
- Refresh the page
- Check you're logged in as Department Head

### Issue: "Failed to fetch overloaded advisors"
- Check backend is running on port 8000
- Check network tab for API errors
- Verify authentication token is valid

### Issue: Reassignment fails
- Check target advisor has capacity
- Verify both advisors are in same department
- Check browser console for errors

## 📞 Need Help?

1. Check the full documentation: `ADVISOR_OVERLOAD_RESOLUTION.md`
2. Review implementation details: `ADVISOR_OVERLOAD_RESOLUTION_IMPLEMENTATION.md`
3. Run the analysis script for diagnostics
4. Check backend logs in `Backend/logs/`

## ✅ Success Checklist

- [ ] Can access `/department/advisor-overload` page
- [ ] Can see overloaded advisors in left panel
- [ ] Can select an overloaded advisor
- [ ] Can see their students in middle panel
- [ ] Can check/uncheck students
- [ ] Can select target advisor in right panel
- [ ] Can see action bar with summary
- [ ] Can click "Confirm Reassignment"
- [ ] See success message
- [ ] Page refreshes with updated data
- [ ] Notifications sent to affected parties

---

**That's it!** You now have a fully functional advisor overload resolution system. 🎉
