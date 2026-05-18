# Settings Page - Visual Reference

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Settings                                                │
│  Manage your account settings and preferences                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────────┐
│              │                                                  │
│  SIDEBAR     │  MAIN CONTENT AREA                               │
│              │                                                  │
│  ┌────────┐  │  ┌────────────────────────────────────────────┐ │
│  │Profile │  │  │  PROFILE INFORMATION                       │ │
│  │(Active)│  │  │  ────────────────────────────────────────  │ │
│  └────────┘  │  │                                            │ │
│              │  │  [Full Name]        [Email]                │ │
│  ┌────────┐  │  │  [Phone]            [City]                 │ │
│  │Security│  │  │  [Address]                                 │ │
│  └────────┘  │  │                                            │ │
│              │  │  ──────────────────────────────────────────│ │
│  ┌────────┐  │  │  COMPANY CONTACT INFORMATION               │ │
│  │Notific.│  │  │  ────────────────────────────────────────  │ │
│  └────────┘  │  │                                            │ │
│              │  │  [Email]            [Website]              │ │
│  ┌────────┐  │  │  [Phone]            [Address]              │ │
│  │Appear. │  │  │                                            │ │
│  └────────┘  │  │  ──────────────────────────────────────────│ │
│              │  │  🟣 INTERNSHIP SUPERVISOR INFORMATION ✨   │ │
│              │  │  ────────────────────────────────────────  │ │
│              │  │                                            │ │
│              │  │  ℹ️ Why provide this information?          │ │
│              │  │  • Direct communication with advisor       │ │
│              │  │  • Send monthly reports to advisors        │ │
│              │  │  • Better coordination for oversight       │ │
│              │  │                                            │ │
│              │  │  [Supervisor Name]  [Supervisor Title]     │ │
│              │  │  [Supervisor Email] [Supervisor Phone]     │ │
│              │  │                                            │ │
│              │  │  ──────────────────────────────────────────│ │
│              │  │                                            │ │
│              │  │              [💾 Save Changes]             │ │
│              │  │                                            │ │
│              │  └────────────────────────────────────────────┘ │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

## Detailed Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                            │
│  Manage your account settings and preferences           │
└─────────────────────────────────────────────────────────┘
```

### 2. Sidebar Tabs
```
┌──────────────────┐
│  👤 Profile      │ ← Active (Green highlight)
│  Information     │
├──────────────────┤
│  🛡️ Security     │
├──────────────────┤
│  🔔 Notifications│
├──────────────────┤
│  🎨 Appearance   │
└──────────────────┘
```

### 3. Profile Information Section (All Users)
```
┌────────────────────────────────────────────────────────┐
│  👤 Profile Information                                │
│  Update your personal information                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 Full Name                    ✉️ Email Address     │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ John Doe         │           │ john@company.com │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
│  📞 Phone Number                 📍 City              │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ +251 911 234 567 │           │ Addis Ababa      │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
│  🏢 Address                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ 123 Main Street, Bole                          │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4. Company Contact Information (Company Users Only)
```
┌────────────────────────────────────────────────────────┐
│  🏢 Company Contact Information        [👁️ Hide Profile]│
│  Manage how students and advisors contact your org    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ✉️ Email Address                🌐 Website URL       │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ info@company.com │           │ www.company.com  │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
│  📞 Phone Number                 📍 Office Address    │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ 0987654359       │           │ Bole, Addis      │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 5. Supervisor Information Section (Company Users Only) ⭐ NEW
```
┌────────────────────────────────────────────────────────┐
│  🟣 👤 Internship Supervisor Information          ✨   │
│  Supervisor details for student-advisor communication  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ℹ️ Why provide supervisor information?               │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🛡️ Benefits:                                     │ │
│  │ • Enables direct communication between           │ │
│  │   supervisor and student's academic advisor      │ │
│  │ • Allows supervisor to send monthly progress     │ │
│  │   reports to advisors                            │ │
│  │ • Facilitates better coordination for student    │ │
│  │   internship oversight                           │ │
│  │ • Advisors will be notified when supervisor      │ │
│  │   updates are made                               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  👤 Supervisor Full Name         🏢 Supervisor Title  │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ John Smith       │           │ Senior Developer │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
│  ✉️ Supervisor Email             📞 Supervisor Phone  │
│  ┌──────────────────┐           ┌──────────────────┐ │
│  │ john@company.com │           │ +251 911 234 567 │ │
│  └──────────────────┘           └──────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 6. Save Button
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  ┌──────────────────┐                 │
│                  │ 💾 Save Changes  │                 │
│                  └──────────────────┘                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 7. Success Message (After Save)
```
┌────────────────────────────────────────────────────────┐
│  ✅ Profile updated successfully!                  [×] │
└────────────────────────────────────────────────────────┘
```

### 8. Error Message (If Error Occurs)
```
┌────────────────────────────────────────────────────────┐
│  ⚠️ Failed to update profile. Please try again.   [×] │
└────────────────────────────────────────────────────────┘
```

## Color Scheme

### Supervisor Section Colors:
- **Icon Background:** `rgba(139, 92, 246, 0.1)` (Light purple)
- **Icon Color:** `#8b5cf6` (Purple)
- **Border:** `2px solid var(--border-subtle)`
- **Background:** Glassmorphism white with blur
- **Sparkles:** `#f59e0b` (Gold)

### Info Box Colors:
- **Background:** `rgba(139, 92, 246, 0.05)` (Very light purple)
- **Border:** `#8b5cf6` (Purple)
- **Icon:** `#8b5cf6` (Purple)
- **Text:** Default text color

### Button Colors:
- **Primary (Save):** `#14a800` (Green)
- **Hover:** Darker green with shadow
- **Disabled:** Gray with reduced opacity

## Responsive Behavior

### Desktop (> 768px):
- Two-column layout for form fields
- Sidebar visible on left
- Full-width content area

### Tablet (768px - 1024px):
- Two-column layout maintained
- Sidebar may collapse to icons only
- Slightly reduced padding

### Mobile (< 768px):
- Single-column layout
- Sidebar becomes top tabs
- Full-width form fields
- Stacked layout

## Interaction States

### Input Fields:
```
Normal:   ┌──────────────────┐
          │ Enter text...    │
          └──────────────────┘

Focus:    ┌──────────────────┐  ← Blue border
          │ Typing...        │
          └──────────────────┘

Error:    ┌──────────────────┐  ← Red border
          │ Invalid input    │
          └──────────────────┘
          ⚠️ Error message
```

### Save Button:
```
Normal:   ┌──────────────────┐
          │ 💾 Save Changes  │
          └──────────────────┘

Hover:    ┌──────────────────┐  ← Darker, shadow
          │ 💾 Save Changes  │
          └──────────────────┘

Loading:  ┌──────────────────┐  ← Spinner
          │ 🔄 Saving...     │
          └──────────────────┘

Disabled: ┌──────────────────┐  ← Gray, no hover
          │ 💾 Save Changes  │
          └──────────────────┘
```

## Animation Effects

### On Page Load:
- Fade in from top (0.3s)
- Smooth transition

### On Save:
- Button shows loading spinner
- Success message slides down from top
- Auto-dismiss after 3 seconds

### On Error:
- Error message slides down from top
- Red color with warning icon
- Manual dismiss with × button

## Accessibility Features

### Keyboard Navigation:
- Tab through all form fields
- Enter to submit form
- Escape to close alerts

### Screen Reader Support:
- All labels have proper aria-labels
- Form fields have descriptive labels
- Error messages are announced
- Success messages are announced

### Visual Indicators:
- Clear focus states
- High contrast text
- Icon + text labels
- Color is not the only indicator

## Browser Compatibility

✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)
⚠️ IE11 (limited support)

## Performance

- **Page Load:** < 1 second
- **Save Action:** < 2 seconds
- **Form Validation:** Instant
- **Error Display:** Instant

---

**Last Updated:** May 15, 2026
**Design Version:** 1.0
**Status:** Implemented ✅
