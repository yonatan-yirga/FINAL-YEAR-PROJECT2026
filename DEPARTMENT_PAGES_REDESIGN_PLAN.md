# Department Pages Redesign - Upwork Style

## Pages to Redesign:
1. `/department/dashboard` - DepartmentDashboard.jsx
2. `/department/students` - Students.jsx  
3. `/department/advisors` - Advisors.jsx

## Design Changes Required:

### 1. **Color Scheme - Upwork Green**
Replace current colors with:
- Primary: `#14a800` (Upwork green)
- Hover: `#108a00`
- Light background: `#e8f5e9` (light mode) / `rgba(20, 168, 0, 0.15)` (dark mode)
- Use global theme variables from `index.css`

### 2. **Reduce Card Sizes**
Current → New:
- Padding: `24px` → `16px`
- Card border-radius: `16px` → `12px`
- Metric cards padding: `24px` → `16px`

### 3. **Reduce Icon Sizes**
Current → New:
- Large icons: `56px` → `40px`
- Medium icons: `48px` → `36px`
- Small icons: `24px` → `18px`
- Icon stroke-width: maintain at `2`

### 4. **Reduce Font Sizes**
Current → New:
- Welcome title: `32px` → `24px`
- Metric values: `32px` → `24px`
- Card titles: `16px` → `15px`
- Body text: `14px` → `13px`
- Labels: `12px` → `11px`

### 5. **Update Gradients**
Replace gunmetal gradients with:
- Upwork green for primary actions
- Solid colors for cards (no gradients)
- Clean, flat design

### 6. **Spacing Adjustments**
- Grid gaps: `24px` → `20px`
- Section margins: `32px` → `24px`
- Element gaps: `16px` → `12px`

## Implementation Steps:

1. Update CSS variables to use global theme
2. Replace all color references
3. Reduce all padding/margin values
4. Reduce icon sizes in JSX
5. Update font sizes
6. Remove complex gradients
7. Simplify shadows
8. Test dark mode compatibility

## Files to Modify:
- `Frontend/src/pages/department/DepartmentDashboard.jsx`
- `Frontend/src/pages/department/DepartmentDashboard.css`
- `Frontend/src/pages/department/Students.jsx`
- `Frontend/src/pages/department/Students.css`
- `Frontend/src/pages/department/Advisors.jsx` (needs CSS file created)
