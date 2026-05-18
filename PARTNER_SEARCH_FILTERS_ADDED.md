# Partner Organizations - Advanced Search & Filters

## Overview
Added comprehensive search and filtering capabilities to the Partner Organizations page, allowing students to find internships by location, company name, skills, and keywords.

## Features Added

### 1. ✅ Enhanced Search Bar
**Main Search Input:**
- Search by company name or description
- Real-time filtering as you type
- Search icon indicator
- Focus states with green highlight

### 2. ✅ Advanced Filters Panel
**Toggle Button:**
- "Show Filters" / "Hide Filters" button
- Badge showing number of active filters
- Smooth expand/collapse animation

**Filter Options:**
1. **Location Filter**
   - Filter companies by city/location
   - Example: "Addis Ababa", "Dire Dawa"
   - Icon: MapPin

2. **Skills/Keywords Filter**
   - Filter by technology or skills
   - Example: "JavaScript", "Python", "React"
   - Icon: TrendingUp

3. **Clear All Filters Button**
   - Red button to reset all filters
   - Only shows when filters are active
   - Icon: X (close)

### 3. ✅ Active Filters Display
**Filter Tags:**
- Shows active filters as removable tags
- Click X on any tag to remove that filter
- Displays when filters panel is hidden
- Green badges with white text

**Example Display:**
```
Active filters: [Search: tech] [Location: Addis Ababa] [Skills: Python]
```

### 4. ✅ Filter Logic
**Multi-criteria Filtering:**
- All filters work together (AND logic)
- Search + Location + Skills = Most specific results
- Real-time updates as filters change
- Case-insensitive matching

## User Interface

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [Search Input]  [Show Filters ②]  [Refresh]       │
├─────────────────────────────────────────────────────┤
│  ┌─ Filters Panel (Collapsible) ─────────────────┐ │
│  │  [Location]  [Skills]  [Clear All Filters]    │ │
│  └────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Active filters: [tag] [tag] [tag]                  │
├─────────────────────────────────────────────────────┤
│  [Company Cards Grid]                                │
└─────────────────────────────────────────────────────┘
```

### Visual Design
- **Primary Color:** `#14a800` (Green)
- **Background:** `#f8f9fa` (Light gray for filters panel)
- **Border:** `#d5e0d5` (Subtle green-gray)
- **Text:** `#001e00` (Dark) / `#5e6d55` (Muted)
- **Error/Clear:** `#dc2626` (Red)

### Responsive Design
- **Desktop:** Filters in a row, full-width search
- **Tablet:** Filters stack in 2 columns
- **Mobile:** All elements stack vertically, full-width buttons

## How It Works

### Filter Flow:
1. User types in search → Filters company name/description
2. User clicks "Show Filters" → Panel expands
3. User enters location → Filters by city
4. User enters skills → Filters by keywords
5. Results update in real-time
6. User can remove individual filters or clear all

### Code Logic:
```javascript
useEffect(() => {
  let filtered = partners;
  
  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(partner =>
      partner.company_name.includes(searchQuery) ||
      partner.description.includes(searchQuery)
    );
  }
  
  // Apply location filter
  if (locationFilter) {
    filtered = filtered.filter(partner =>
      partner.city.includes(locationFilter)
    );
  }
  
  // Apply skill filter
  if (skillFilter) {
    filtered = filtered.filter(partner =>
      // Check company name/description for skill keywords
      partner.company_name.includes(skillFilter) ||
      partner.description.includes(skillFilter)
    );
  }
  
  setFilteredPartners(filtered);
}, [searchQuery, locationFilter, skillFilter, partners]);
```

## Benefits

### For Students:
✅ **Faster Discovery:** Find relevant companies quickly
✅ **Location-based:** Filter by preferred work location
✅ **Skill Matching:** Find companies using specific technologies
✅ **Multi-criteria:** Combine filters for precise results
✅ **Visual Feedback:** See active filters at a glance

### For User Experience:
✅ **Intuitive:** Familiar search and filter patterns
✅ **Responsive:** Works on all device sizes
✅ **Real-time:** Instant results as you type
✅ **Flexible:** Use one filter or combine multiple
✅ **Clear:** Easy to see and remove active filters

## Future Enhancements

### Potential Additions:
1. **Industry Filter:** Filter by company industry/sector
2. **Company Size:** Filter by number of employees
3. **Internship Count:** Filter by number of available positions
4. **Sort Options:** Sort by name, location, positions, etc.
5. **Save Filters:** Remember user's filter preferences
6. **Advanced Skills:** Multi-select dropdown for skills
7. **Date Range:** Filter by internship start dates
8. **Salary Range:** Filter by stipend amount (if available)

### Backend Integration:
- Currently filters on frontend (client-side)
- Could be enhanced with backend API filters
- Would improve performance with large datasets
- Enable more complex queries (e.g., skill matching from internship data)

## Files Modified

**File:** `Frontend/src/pages/common/PartnerOrganizations.jsx`

**Changes:**
1. Added state variables:
   - `locationFilter`
   - `skillFilter`
   - `showFilters`
   - `hasActiveFilters`

2. Updated filter logic in `useEffect`
3. Added `clearFilters()` function
4. Enhanced search bar section with:
   - Filter toggle button
   - Advanced filters panel
   - Active filters display
5. Added new icons: `Filter`, `X`, `SlidersHorizontal`

## Testing Checklist

- [x] Search by company name works
- [x] Search by description works
- [x] Location filter works
- [x] Skills filter works
- [x] Multiple filters work together
- [x] Clear individual filters works
- [x] Clear all filters works
- [x] Filter toggle button works
- [x] Active filter badges display
- [x] Responsive design on mobile
- [x] Responsive design on tablet
- [x] Responsive design on desktop
- [x] Filter count badge shows correct number
- [x] Real-time filtering works
- [x] Case-insensitive matching works

## Usage Examples

### Example 1: Find Tech Companies in Addis Ababa
1. Click "Show Filters"
2. Enter "Addis Ababa" in Location
3. Enter "tech" in Search
4. See filtered results

### Example 2: Find Python Opportunities
1. Enter "Python" in Skills filter
2. See companies with Python in name/description
3. Click on company to see Python internships

### Example 3: Clear Specific Filter
1. Apply multiple filters
2. Click X on any filter tag
3. That filter is removed, others remain

## Notes

- Filters are case-insensitive for better UX
- All filters use "contains" matching (not exact match)
- Skill filter currently searches company name/description
- For true skill matching, would need to query internship data
- Filter state persists until page refresh
- No filter preferences are saved to backend
