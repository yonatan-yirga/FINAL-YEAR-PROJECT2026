# Quick Reference - Advisor Performance Graph

## What's New

A comprehensive stacked bar chart showing **all advisors' performance in one graph** on the Advisor Performance Overview section.

## Where to Find It

**URL**: `http://localhost:5173/department/advisors`

**Section**: "Advisor Performance Overview" → "All Advisors Performance Metrics"

## What It Shows

```
┌─────────────────────────────────────────┐
│ All Advisors Performance Metrics        │
│                                         │
│ ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐   │
│ │█│  │█│  │█│  │█│  │█│  │█│  │█│   │
│ │█│  │█│  │█│  │█│  │█│  │█│  │█│   │
│ │░│  │░│  │░│  │░│  │░│  │░│  │░│   │
│ │░│  │░│  │░│  │░│  │░│  │░│  │░│   │
│ └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘   │
│  A1   A2   A3   A4   A5   A6   A7    │
│  1    0    1    0    0    2    1     │
│  0    0    0    0    0    1    0     │
│ 100%  0%  100%  0%   0%  13%  7%    │
│  🟠   🟢   🟠   🟢   🟢   🟢   🟢    │
└─────────────────────────────────────────┘
```

## Color Meanings

| Color | Status | Capacity | Action |
|-------|--------|----------|--------|
| 🟢 Green | Optimal | 0-80% | Can assign more |
| 🟠 Orange | Near Capacity | 81-100% | Monitor closely |
| 🔴 Red | Overloaded | >100% | Reassign students |

## Bar Components

- **Blue segment**: Active students (current workload)
- **Gray segment**: Remaining capacity (available slots)
- **Status dot**: Color-coded capacity status
- **Stats**: Active count, completed count, capacity %

## How to Use

### 1. View All Advisors
- Go to `/department/advisors`
- Scroll to "Advisor Performance Overview"
- See all advisors in one graph

### 2. Compare Workloads
- Taller blue = More students
- Taller gray = More available
- Compare bar heights side-by-side

### 3. Identify Issues
- Look for 🟠 Orange indicators
- Look for 🔴 Red indicators
- These need attention

### 4. Make Decisions
- Assign new students to 🟢 Green advisors
- Monitor 🟠 Orange advisors
- Reassign from 🔴 Red advisors

### 5. Interact
- Hover over bars for animations
- Scroll horizontally for more advisors
- Check stats below each bar

## Quick Stats

For each advisor, you see:
- **Active**: Number of active students
- **Completed**: Number of completed students
- **Capacity**: Percentage of capacity used

## Example Scenarios

### Scenario 1: Assign New Student
```
Looking for advisor to assign student to:
- Check graph for 🟢 Green indicators
- Choose advisor with tallest gray segment
- That advisor has most available capacity
```

### Scenario 2: Monitor Workload
```
Checking advisor workload:
- 🟢 Green = Good, no action needed
- 🟠 Orange = Watch, may need help soon
- 🔴 Red = Alert, needs help now
```

### Scenario 3: Balance Load
```
Balancing advisor workload:
- Identify 🔴 Red advisors
- Identify 🟢 Green advisors
- Reassign students from red to green
```

## Mobile View

On mobile devices:
- Graph is scrollable horizontally
- All bars still visible
- Tap to see details
- Responsive layout

## Tips

✅ **Check daily** - See advisor status at a glance
✅ **Use colors** - Green/Orange/Red for quick assessment
✅ **Compare bars** - See workload distribution
✅ **Read stats** - Get exact numbers
✅ **Hover for details** - See animations and info

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Graph not showing | Refresh page (Ctrl+Shift+R) |
| Bars look wrong | Check backend data |
| Colors incorrect | Clear browser cache |
| Can't scroll | Use arrow keys or mouse wheel |

## Data Shown

```
For Each Advisor:
├─ Name and Staff ID
├─ Active students count
├─ Completed students count
├─ Capacity percentage
├─ Status indicator (color)
└─ Visual bar representation
```

## Performance Indicators

### Green (Optimal)
- Capacity: 0-80%
- Meaning: Advisor is fine
- Action: Can assign more

### Orange (Near Capacity)
- Capacity: 81-100%
- Meaning: Advisor is getting full
- Action: Monitor, limit new assignments

### Red (Overloaded)
- Capacity: >100%
- Meaning: Advisor has too many
- Action: Reassign students

## Key Features

✅ All advisors visible at once
✅ Easy comparison
✅ Color-coded status
✅ Interactive hover effects
✅ Responsive design
✅ Smooth animations
✅ Clear legend
✅ Detailed stats

## Files Modified

- `Frontend/src/pages/department/Advisors.jsx` - Added graph component
- `Frontend/src/pages/department/Advisors.css` - Added graph styles

## Status

✅ **COMPLETE AND READY TO USE**

## Documentation

- **Full Docs**: ADVISOR_COMPREHENSIVE_GRAPH_ADDED.md
- **Visual Guide**: ADVISOR_GRAPH_VISUAL_GUIDE.md
- **Implementation**: ADVISOR_GRAPH_IMPLEMENTATION_SUMMARY.md

---

**Quick Start**: Go to `/department/advisors` and look for "All Advisors Performance Metrics" section!
