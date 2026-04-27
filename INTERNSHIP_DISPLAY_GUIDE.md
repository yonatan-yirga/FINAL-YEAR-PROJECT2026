# Step 3: Select Internship - Display Guide 📋

## How Company Internships Are Displayed

### **Data Flow**

```
User Selects Company (Step 2)
         ↓
fetchCompanyInternships(companyId)
         ↓
API Call: GET /api/internships/?company_id=X&status=OPEN
         ↓
Filter: Only internships with available_slots > 0
         ↓
Display: List of company's open internships
```

---

## 📊 What Gets Displayed

### **Real Data from Database**

When a company is selected, the system fetches and displays:

```javascript
{
  id: 123,
  title: "Software Development Internship",
  duration_months: 6,
  start_date: "2026-06-01",
  available_slots: 3,
  status: "OPEN",
  location: "Boston, MA",
  required_skills: "Python, JavaScript, React",
  description: "Full stack development position..."
}
```

---

## 🎨 Visual Display

### **Example: Tech Corp's Internships**

```
┌────────────────────────────────────────────────────────────┐
│  Step 3: Select Internship                                 │
│  Choose the specific internship position                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 [Search internships...]                                │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  💼  Software Development Internship                       │
│      📅 6 months • Starts 2026-06-01                       │
│      ✅ 3 slots available                                  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  💼  Data Analysis Internship                              │
│      📅 4 months • Starts 2026-07-01                       │
│      ✅ 2 slots available                                  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  💼  UI/UX Design Internship                               │
│      📅 5 months • Starts 2026-06-15                       │
│      ✅ 1 slot available                                   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Internship Card Details

### **Each Internship Shows:**

1. **Icon**: 💼 Briefcase icon
2. **Title**: Full internship title (e.g., "Software Development Internship")
3. **Duration**: Number of months (e.g., "6 months")
4. **Start Date**: When internship begins (e.g., "Starts 2026-06-01")
5. **Available Slots**: How many positions are open (e.g., "3 slots available")
6. **Selection State**: Checkmark when selected

---

## 🔍 Filtering Logic

### **What Internships Are Shown:**

✅ **Included:**
- Internships posted by the selected company
- Status: OPEN
- Available slots > 0
- Active internships only

❌ **Excluded:**
- Internships from other companies
- Status: CLOSED or FILLED
- No available slots (available_slots = 0)
- Inactive internships

---

## 💡 Real-World Examples

### **Example 1: Tech Corp**

```
Company: Tech Corp
Posted Internships: 5 total
Open Internships: 3

Displayed:
┌────────────────────────────────────────────┐
│ 💼 Software Development Internship         │
│    📅 6 months • Starts 2026-06-01        │
│    ✅ 3 slots available                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💼 Mobile App Development                  │
│    📅 5 months • Starts 2026-07-01        │
│    ✅ 2 slots available                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💼 DevOps Engineering                      │
│    📅 4 months • Starts 2026-08-01        │
│    ✅ 1 slot available                    │
└────────────────────────────────────────────┘

Not Displayed:
- Backend Development (FILLED - 0 slots)
- QA Testing (CLOSED)
```

### **Example 2: Design Studio Inc**

```
Company: Design Studio Inc
Posted Internships: 2 total
Open Internships: 2

Displayed:
┌────────────────────────────────────────────┐
│ 💼 UI/UX Design Internship                │
│    📅 6 months • Starts 2026-06-15        │
│    ✅ 2 slots available                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💼 Graphic Design Internship              │
│    📅 4 months • Starts 2026-07-01        │
│    ✅ 1 slot available                    │
└────────────────────────────────────────────┘
```

### **Example 3: Startup XYZ**

```
Company: Startup XYZ
Posted Internships: 1 total
Open Internships: 0

Displayed:
┌────────────────────────────────────────────┐
│  💼  No open internships available         │
│      for this company                      │
└────────────────────────────────────────────┘
```

---

## 🎯 Selection Interaction

### **Before Selection:**

```
┌────────────────────────────────────────────┐
│ 💼  Software Development Internship        │
│     📅 6 months • Starts 2026-06-01       │
│     ✅ 3 slots available                  │
└────────────────────────────────────────────┘
```

### **After Selection (Highlighted):**

```
┌────────────────────────────────────────────┐
│ 💼  Software Development Internship    ✓  │
│     📅 6 months • Starts 2026-06-01       │
│     ✅ 3 slots available                  │
└────────────────────────────────────────────┘
     ↑ Green background + checkmark
```

---

## 📊 Complete Data Structure

### **What the API Returns:**

```json
[
  {
    "id": 123,
    "title": "Software Development Internship",
    "description": "Work on full-stack web applications...",
    "required_skills": "Python, JavaScript, React, Node.js",
    "location": "Boston, MA",
    "duration_months": 6,
    "start_date": "2026-06-01",
    "end_date": "2026-12-01",
    "is_active": true,
    "max_applicants": 5,
    "application_deadline": "2026-05-15",
    "status": "OPEN",
    "available_slots": 3,
    "company": {
      "id": 45,
      "company_name": "Tech Corp",
      "email": "hr@techcorp.com"
    },
    "department": {
      "id": 1,
      "name": "Computer Science"
    }
  },
  {
    "id": 124,
    "title": "Data Analysis Internship",
    "description": "Analyze business data and create reports...",
    "required_skills": "Python, SQL, Tableau, Statistics",
    "location": "Boston, MA",
    "duration_months": 4,
    "start_date": "2026-07-01",
    "end_date": "2026-11-01",
    "is_active": true,
    "max_applicants": 3,
    "application_deadline": "2026-06-15",
    "status": "OPEN",
    "available_slots": 2,
    "company": {
      "id": 45,
      "company_name": "Tech Corp",
      "email": "hr@techcorp.com"
    },
    "department": {
      "id": 1,
      "name": "Computer Science"
    }
  }
]
```

### **What Gets Displayed (Simplified):**

```
Title: "Software Development Internship"
Duration: "6 months"
Start Date: "Starts 2026-06-01"
Slots: "3 slots available"
```

---

## 🔄 Dynamic Updates

### **Scenario 1: Company Has Multiple Internships**

```
User selects: Tech Corp
System fetches: 5 internships
System filters: 3 open with slots
Display shows: 3 internship cards
```

### **Scenario 2: Company Has No Open Internships**

```
User selects: Old Company Inc
System fetches: 2 internships
System filters: 0 open with slots (all filled)
Display shows: "No open internships available"
```

### **Scenario 3: Company Just Posted New Internship**

```
User selects: New Startup
System fetches: 1 internship (just posted today)
System filters: 1 open with slots
Display shows: 1 internship card
```

---

## 🎨 Visual States

### **Loading State:**

```
┌────────────────────────────────────────────┐
│  ⏳ Loading internships...                 │
│                                            │
│  [Spinner animation]                       │
└────────────────────────────────────────────┘
```

### **Empty State:**

```
┌────────────────────────────────────────────┐
│  💼                                        │
│                                            │
│  No open internships available             │
│  for this company                          │
└────────────────────────────────────────────┘
```

### **Error State:**

```
┌────────────────────────────────────────────┐
│  ⚠️  Failed to load internships            │
│                                            │
│  [Retry Button]                            │
└────────────────────────────────────────────┘
```

### **Loaded State (Multiple Internships):**

```
┌────────────────────────────────────────────┐
│ 💼 Software Development Internship         │
│    📅 6 months • Starts 2026-06-01        │
│    ✅ 3 slots available                   │
├────────────────────────────────────────────┤
│ 💼 Data Analysis Internship                │
│    📅 4 months • Starts 2026-07-01        │
│    ✅ 2 slots available                   │
├────────────────────────────────────────────┤
│ 💼 UI/UX Design Internship                 │
│    📅 5 months • Starts 2026-06-15        │
│    ✅ 1 slot available                    │
└────────────────────────────────────────────┘
```

---

## ✅ Summary

### **What Department Head Sees:**

1. **Real Internships**: Actual internships posted by the selected company
2. **Current Data**: Live data from database (not mock/placeholder)
3. **Filtered Results**: Only open internships with available slots
4. **Complete Details**: Title, duration, start date, available slots
5. **Interactive**: Click to select, visual feedback on selection

### **Data Source:**

- **API Endpoint**: `GET /api/internships/?company_id=X&status=OPEN`
- **Real-Time**: Fetched when company is selected
- **Filtered**: Only shows internships with `available_slots > 0`
- **Accurate**: Reflects current database state

### **User Experience:**

- **Fast Loading**: Internships load immediately when company selected
- **Clear Display**: Easy to read and understand
- **Visual Feedback**: Selected internship is highlighted
- **Empty Handling**: Clear message if no internships available

---

**Status**: ✅ **FULLY IMPLEMENTED**  
**Data Source**: ✅ **REAL DATABASE**  
**Display**: ✅ **COMPLETE DETAILS**  
**Filtering**: ✅ **SMART FILTERING**