# 🎨 Icon Migration Quick Reference Card

## 📦 Import Icons

```jsx
import { 
  // User & Profile
  User, Users, UserCheck, UserCircle, GraduationCap,
  
  // Documents & Files
  FileText, ClipboardList, FileCheck, Folder,
  
  // Status
  CheckCircle, XCircle, Clock, AlertCircle, AlertTriangle,
  
  // Business
  Briefcase, Building, Building2, Award, Trophy,
  
  // Communication
  MessageSquare, Mail, Bell, Phone, Video,
  
  // Actions
  Search, Send, Edit, Trash2, Download, Upload, Plus,
  
  // Navigation
  Home, Settings, Lock, Eye, Link2, MapPin,
  
  // Charts
  BarChart3, TrendingUp, Calendar
} from 'lucide-react';
```

---

## 📏 Size Guidelines

| Context | Size | Example |
|---------|------|---------|
| **Empty States** | 64px | `<GraduationCap size={64} strokeWidth={1.5} />` |
| **Section Titles** | 20px | `<ClipboardList size={20} />` |
| **Buttons** | 18px | `<Download size={18} />` |
| **Inline Text** | 16px | `<MapPin size={16} />` |
| **Background** | 80px | `<Trophy size={80} strokeWidth={1} />` |

---

## 🎯 Common Patterns

### Section Title
```jsx
<h3 className="section-title">
  <ClipboardList size={20} style={{ 
    display: 'inline-block', 
    verticalAlign: 'middle', 
    marginRight: 8 
  }} />
  Section Title
</h3>
```

### Button with Icon
```jsx
<button className="btn">
  <Download size={18} style={{ marginRight: 8 }} />
  Button Text
</button>
```

### Empty State
```jsx
<div className="empty-state">
  <GraduationCap size={64} strokeWidth={1.5} color="var(--text-muted)" />
  <h2>No Data</h2>
</div>
```

### Stat Card
```jsx
<StatCard 
  label="Total" 
  value={100} 
  accent="#2D3142" 
  icon={ClipboardList}  // Pass component directly
/>
```

### Nav Card
```jsx
<NavCard 
  primary 
  icon={Search}  // Pass component directly
  label="Search" 
  sub="Find items" 
  onClick={handleClick}
/>
```

---

## 🎨 Color Usage

```jsx
// CSS Variables
<Icon size={20} color="var(--accent-navy)" />
<Icon size={20} color="var(--text-muted)" />

// Direct Colors
<Icon size={20} color="#2D3142" />
<Icon size={20} color="#15803D" />

// Theme Colors
<Icon size={20} color={T.navy} />
<Icon size={20} color={T.green} />
```

---

## 🔄 Common Replacements

| Emoji | Icon Component | Usage |
|-------|---------------|-------|
| 🎓 | `GraduationCap` | Student, Education |
| 📋 | `ClipboardList` | Applications, Lists |
| 💼 | `Briefcase` | Internship, Work |
| 💬 | `MessageSquare` | Messages, Chat |
| 🏢 | `Building2` | Company |
| 👨‍🏫 | `UserCheck` | Advisor |
| 🏛️ | `Building` | Department |
| ⏳ | `Clock` | Pending |
| ✅ | `CheckCircle` | Approved |
| ✕ | `XCircle` | Rejected |
| 🏆 | `Trophy` | Achievement |
| 🏅 | `Award` | Certificate |
| 📥 | `Download` | Download |
| 🔗 | `Link2` | Link, Verify |
| 📍 | `MapPin` | Location |
| 🔔 | `Bell` | Notifications |
| 📅 | `Calendar` | Date, Schedule |
| 📊 | `BarChart3` | Analytics |
| 👥 | `Users` | Multiple Users |
| 🔒 | `Lock` | Security |
| ⚠ | `AlertTriangle` | Warning |
| 👁️ | `Eye` | View |

---

## ✅ Checklist for Each File

- [ ] Import required icons from 'lucide-react'
- [ ] Replace emoji strings with icon components
- [ ] Use consistent sizing (16, 18, 20, 64)
- [ ] Add inline styles for alignment
- [ ] Pass components (not strings) to StatCard/NavCard
- [ ] Test for syntax errors with getDiagnostics
- [ ] Verify visual appearance in browser

---

## 🚫 Common Mistakes to Avoid

❌ **Wrong**: `import { search } from 'lucide-react'` (lowercase)
✅ **Right**: `import { Search } from 'lucide-react'` (PascalCase)

❌ **Wrong**: `<search size={20} />` (lowercase)
✅ **Right**: `<Search size={20} />` (PascalCase)

❌ **Wrong**: `icon="Search"` (string)
✅ **Right**: `icon={Search}` (component)

❌ **Wrong**: Mixing emojis and SVG icons
✅ **Right**: Use SVG icons consistently

---

## 📚 Resources

- **Icon Search**: https://lucide.dev/icons
- **Documentation**: https://lucide.dev/guide/packages/lucide-react
- **Project Guide**: `ICON_REPLACEMENT_GUIDE.md`
- **Icon Map**: `Frontend/src/components/icons/IconMap.jsx`

---

**Quick Tip**: When in doubt, check `IconMap.jsx` for the complete list of available icons and their mappings!

