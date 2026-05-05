# Advisor Performance Graph Removed

## Change Summary
Removed the "Advisor Performance Overview" graph section from the Advisors page, keeping only the statistics cards and the advisor directory table.

## What Was Removed
- **Advisor Performance Overview Section**
  - Title: "Advisor Performance Overview"
  - Subtitle: "Top performing advisors by workload capacity"
  - Capacity status banner
  - Comprehensive performance graph with:
    - Y-axis scale (0-20)
    - Stacked bar charts for each advisor
    - Active students (blue bars)
    - Remaining capacity (gray bars)
    - Status indicators
    - Stats below each bar (Active, Completed, Capacity %)
    - Legend (Active Students, Completed, Capacity)

## What Remains
✅ **Statistics Dashboard** (4 cards at top)
  - Total Advisors
  - Active Students
  - Completed
  - Avg. Workload

✅ **Advisor Directory Table**
  - Search functionality
  - Sort options (Name, Workload, Completed)
  - Clickable advisor names (links to their students)
  - Columns: Name, Staff ID, Email, Phone, Workload, Total Assigned, Completed
  - Add Advisor button
  - Refresh button

## Files Modified
- `Frontend/src/pages/department/Advisors.jsx`
  - Removed entire `adv-performance-section` div
  - Removed unused `Award` icon import

## Visual Result
The page now shows:
1. Header: "Advisor Management"
2. Statistics cards (4 cards in a row)
3. Advisor Directory section with:
   - Search bar
   - Sort dropdown
   - Add Advisor button
   - Refresh button
4. Data table with all advisors

## Benefits
- Cleaner, simpler interface
- Faster page load (less rendering)
- Focus on the table view
- Statistics still visible at the top
- All functionality preserved

## Status
✅ **COMPLETE** - Graph section removed, page simplified
