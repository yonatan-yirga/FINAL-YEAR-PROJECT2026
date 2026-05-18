# Student Location Preferences - Quick Start Guide 🚀

## What's New?

Students can now register their **3 preferred internship locations**, and Department Heads will see these preferences when assigning students to companies, with **visual indicators** for matching locations!

---

## For Students 👨‍🎓

### Option 1: Set During Registration (Recommended)

1. Go to **Register** page
2. Select **"STUDENT"** role
3. Fill in your basic information
4. Scroll down to **"📍 Internship Location Preferences"** section
5. Enter your preferred cities:
   - **1st Choice:** Your most preferred location (e.g., "Addis Ababa")
   - **2nd Choice:** Your second preference (e.g., "Dire Dawa") - Optional
   - **3rd Choice:** Your third preference (e.g., "Bahir Dar") - Optional
6. Complete registration
7. Your preferences are saved automatically!

### Option 2: Set After Registration

1. **Login** to your student account
2. Go to **Profile** page (from sidebar)
3. Scroll down to **"Internship Location Preferences"** section
4. Enter your preferred cities:
   - **1st Choice:** Your most preferred location (e.g., "Addis Ababa")
   - **2nd Choice:** Your second preference (e.g., "Dire Dawa") - Optional
   - **3rd Choice:** Your third preference (e.g., "Bahir Dar") - Optional
5. Click **"Save Profile"** at the bottom

### Why Set Preferences?
- ✅ Department Heads see your preferences when assigning internships
- ✅ Higher chance of getting placed in your preferred city
- ✅ Better work-life balance
- ✅ You can update them anytime

---

## For Department Heads 👔

### How to Use Location Preferences:

1. Go to **"Assign Company to Student"** page
2. **Step 1 - Select Student:**
   - You'll see each student's location preferences listed below their name
   - Format: "📍 Preferred locations: Addis Ababa, Dire Dawa, Bahir Dar"

3. **Step 2 - Select Company:**
   - When you select a student first, companies matching their preferences show a **green badge**
   - Badge says: "✓ Matches preference 1" (or 2, or 3)
   - This helps you make informed placement decisions

4. **Assignment Summary:**
   - The summary card at the top shows the student's preferences
   - Easy reference while selecting company

### Benefits:
- ✅ See student preferences at a glance
- ✅ Visual indicators for matching companies
- ✅ Make better placement decisions
- ✅ Improve student satisfaction

---

## Sample Data Already Added ✅

We've added sample location preferences to **56 existing students** using these Ethiopian cities:
- Addis Ababa
- Dire Dawa
- Bahir Dar
- Hawassa
- Mekelle
- Gondar
- Adama
- Jimma
- Dessie
- Harar

**You can test the feature immediately!**

---

## Quick Test

### Test as New Student (Registration):
1. Go to Register page
2. Select "STUDENT" role
3. Fill in required fields
4. Scroll to "📍 Internship Location Preferences"
5. Enter 3 location preferences
6. Complete registration
7. After approval, login and verify preferences are saved

### Test as Existing Student (Profile):
1. Login as any student (password: `password123`)
2. Go to Profile
3. Check "Internship Location Preferences" section
4. Update preferences and save

### Test as Department Head:
1. Login as Department Head (password: `password123`)
2. Go to "Assign Company to Student"
3. Select a student - see their preferences
4. Select a company in Addis Ababa (if student prefers it)
5. See the green "✓ Matches preference 1" badge!

---

## Screenshots Guide

### Student Profile Page:
```
┌─────────────────────────────────────────┐
│ 📍 Internship Location Preferences      │
├─────────────────────────────────────────┤
│ First Choice Location ★                 │
│ [Addis Ababa                        ]   │
│                                         │
│ Second Choice Location (Optional)       │
│ [Dire Dawa                          ]   │
│                                         │
│ Third Choice Location (Optional)        │
│ [Bahir Dar                          ]   │
│                                         │
│ ℹ️ These preferences help Department    │
│   Heads assign you to companies in      │
│   locations you prefer.                 │
└─────────────────────────────────────────┘
```

### Assign Company Page:
```
┌─────────────────────────────────────────┐
│ 👤 John Doe                             │
│ UGR/12345/14 • john@example.com         │
│ 📍 Preferred locations: Addis Ababa,    │
│    Dire Dawa, Bahir Dar                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🏢 Tech Company Ethiopia                │
│    ✓ Matches preference 1               │
│ 📍 Addis Ababa • 5 internships          │
│ 👤 2 students currently interning       │
└─────────────────────────────────────────┘
```

---

## Technical Notes

### Database:
- 3 new fields added to `student_profiles` table
- Migration applied successfully
- All fields are optional (nullable)

### API:
- Location preferences included in student API response
- Available to Department Heads via `/api/departments/students/`

### Frontend:
- Student Profile page updated with new section
- Assign Company page shows preferences and matching badges
- Real-time matching logic

---

## Need Help?

### Common Questions:

**Q: Can students change their preferences later?**
A: Yes! Students can update preferences anytime from their Profile page.

**Q: What if a student doesn't set preferences?**
A: No problem! The system works fine without preferences. They're optional.

**Q: Does the system auto-assign based on preferences?**
A: No, preferences are just visual indicators. Department Heads still make the final decision.

**Q: Can I add more than 3 preferences?**
A: Currently limited to 3 choices. This keeps the UI clean and focused.

**Q: What if company location doesn't match exactly?**
A: Matching is case-sensitive and exact. Make sure location names are consistent.

---

## What's Next?

Future enhancements could include:
- Dropdown with predefined cities (instead of text input)
- Auto-suggestions based on preferences
- Analytics dashboard showing preference distribution
- Email notifications for matching opportunities

---

**Status:** ✅ Live and Ready to Use
**Last Updated:** May 15, 2026

Enjoy the new feature! 🎉
