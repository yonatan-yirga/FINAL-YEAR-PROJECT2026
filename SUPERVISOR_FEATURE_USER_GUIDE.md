# Supervisor-Advisor Feature - User Guide

## Overview
This feature enables company supervisors to provide their contact information, which facilitates communication between the company supervisor and the student's academic advisor.

## For Company Users

### Step 1: Access Settings
1. Login to your company account
2. Click on your profile icon or navigate to Settings
3. URL: `http://localhost:5173/settings`

### Step 2: Navigate to Profile Tab
- The Profile tab should be selected by default
- You'll see your basic profile information at the top

### Step 3: Fill Supervisor Information
Scroll down to find the **"Internship Supervisor Information"** section (purple icon).

#### Why Provide This Information?
- ✅ Enables direct communication between supervisor and student's academic advisor
- ✅ Allows supervisor to send monthly progress reports to advisors
- ✅ Facilitates better coordination for student internship oversight
- ✅ Advisors will be notified when supervisor updates are made

#### Fields to Fill:
1. **Supervisor Full Name**
   - Enter the full name of the person who will supervise interns
   - Example: "John Smith"

2. **Supervisor Title/Position**
   - Enter the job title or position
   - Example: "Senior Developer", "HR Manager", "Project Lead"

3. **Supervisor Email**
   - Enter the supervisor's work email
   - Example: "john.smith@company.com"
   - This email will be used for advisor communication

4. **Supervisor Phone**
   - Enter the supervisor's contact phone number
   - Example: "+251 911 234 567"
   - Include country code for international numbers

### Step 4: Save Changes
1. Click the **"Save Changes"** button at the bottom
2. Wait for the success message: "Profile updated successfully!"
3. Your supervisor information is now saved

### Step 5: Verify
1. Refresh the page (F5)
2. Check that all supervisor fields still contain your data
3. If data persists, you're all set!

## What Happens Next?

### When a Student is Assigned:
1. **Student applies** to your internship posting
2. **You accept** the student's application
3. **Advisor is assigned** to the student by the department
4. **Connection is established** between you (supervisor) and the student's advisor

### Communication Flow:
```
Company Supervisor ←→ Student ←→ Academic Advisor
         ↓                           ↑
         └───────────────────────────┘
              Direct Communication
```

### Benefits:
- **Monthly Reports:** Send progress reports that both student and advisor receive
- **Direct Contact:** Advisor can reach out to you for student updates
- **Coordination:** Better oversight of student internship experience
- **Notifications:** Receive updates about student progress and advisor feedback

## For Academic Advisors

### Viewing Supervisor Information:
1. When a student is assigned to you
2. The student's company supervisor information will be visible
3. You can contact the supervisor directly for:
   - Student progress updates
   - Internship coordination
   - Monthly report discussions
   - Any concerns or questions

### Accessing Student-Supervisor Details:
- Navigate to your advisor dashboard
- View "My Students" section
- Click on a student to see their internship details
- Supervisor contact information will be displayed

## For Students

### What You Need to Know:
1. Your company supervisor's information is shared with your academic advisor
2. This enables better coordination of your internship
3. Both your supervisor and advisor can communicate about your progress
4. Monthly reports you submit may be shared with your advisor
5. This is for your benefit - better oversight means better support!

## Privacy & Security

### Data Protection:
- ✅ Supervisor information is only shared with assigned student's advisor
- ✅ Not publicly visible
- ✅ Only accessible to authorized users (company, student, advisor)
- ✅ Secure API endpoints with authentication

### Who Can See Supervisor Information?
- ✅ The company user who entered it
- ✅ Students assigned to that company's internships
- ✅ Academic advisors of those students
- ❌ Other companies
- ❌ Unassigned students
- ❌ Public users

## Frequently Asked Questions

### Q: Is supervisor information required?
**A:** No, it's optional. However, providing it enables better communication and coordination.

### Q: Can I update supervisor information later?
**A:** Yes! You can update it anytime from the Settings page.

### Q: What if the supervisor changes?
**A:** Simply update the information in Settings with the new supervisor's details.

### Q: Will the advisor contact me directly?
**A:** Yes, advisors may reach out via email or phone for student-related matters.

### Q: Can I have multiple supervisors?
**A:** Currently, the system supports one primary supervisor per company. If you need multiple supervisors, use a shared email or contact support.

### Q: What if I don't have a dedicated supervisor yet?
**A:** You can leave the fields empty and fill them in later when a supervisor is assigned.

### Q: Is this information visible to students?
**A:** Yes, students assigned to your company can see their supervisor's contact information.

## Troubleshooting

### Problem: Save button doesn't work
**Solution:**
1. Check your internet connection
2. Refresh the page and try again
3. Check browser console for errors (F12)
4. Contact support if issue persists

### Problem: Data doesn't persist after refresh
**Solution:**
1. Verify you clicked "Save Changes"
2. Wait for success message before leaving page
3. Check if you're still logged in
4. Try logging out and back in

### Problem: Can't see supervisor section
**Solution:**
1. Verify you're logged in as a company user
2. Make sure you're on the Profile tab in Settings
3. Scroll down - it's below the company contact information
4. Try refreshing the page

## Support

If you encounter any issues or have questions:
- 📧 Email: support@internship-system.edu
- 📞 Phone: +251 XXX XXX XXX
- 💬 In-app support: Click the help icon
- 📚 Documentation: Check the help center

## Summary

✅ **Easy to Use:** Simple form with 4 fields
✅ **Secure:** Only shared with relevant parties
✅ **Flexible:** Update anytime
✅ **Beneficial:** Better coordination and communication
✅ **Optional:** Not required but recommended

---

**Last Updated:** May 15, 2026
**Version:** 1.0
**Feature Status:** Active ✅
