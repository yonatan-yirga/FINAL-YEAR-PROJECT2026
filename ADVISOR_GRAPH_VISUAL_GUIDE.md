# Advisor Performance Graph - Visual Guide

## Graph Overview

The new comprehensive graph shows all advisors' performance in a single stacked bar chart visualization.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Advisor Performance Overview                                    │
│ Top performing advisors by workload capacity                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ All Advisors Performance Metrics                                │
│ Workload, Active Students, and Completion Status               │
│                                                                 │
│ Legend:                                                         │
│ ■ Active Students  ■ Completed  ■ Capacity                    │
│                                                                 │
│ Y-Axis Scale:                                                   │
│ 20 ┤                                                             │
│    ├─ ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐     │
│ 15 ├─ │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│     │
│    ├─ │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│     │
│ 10 ├─ │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│  │█│     │
│    ├─ │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│     │
│  5 ├─ │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│     │
│    ├─ │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│  │░│     │
│  0 └─ └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘  └─┘     │
│       A1   A2   A3   A4   A5   A6   A7   A8   A9   A10        │
│       1    0    1    0    0    2    1    0    1    0          │
│       0    0    0    0    0    1    0    0    0    0          │
│      100%  0%  100%  0%   0%   13%  7%   0%   7%   0%        │
│       🟠   🟢   🟠   🟢   🟢   🟢   🟢   🟢   🟢   🟢        │
└─────────────────────────────────────────────────────────────────┘
```

## Bar Components

### Single Bar Breakdown

```
        Advisor Name
        Staff ID
            ↓
        ┌─────┐
        │  █  │  ← Active Students (Blue)
        │  █  │     Height = Number of active students
        │  █  │
        │  ░  │  ← Remaining Capacity (Gray)
        │  ░  │     Height = Available slots
        │  ░  │
        └─────┘
           ●    ← Status Indicator (Color-coded)
           
        Active: 1
        Completed: 0
        Capacity: 100%
```

## Color Coding

### Status Indicators

```
🟢 GREEN (Optimal)
   Capacity: 0-80%
   Meaning: Advisor has good capacity
   Action: Can assign more students

🟠 ORANGE (Near Capacity)
   Capacity: 81-100%
   Meaning: Advisor is getting full
   Action: Monitor closely, limit new assignments

🔴 RED (Overloaded)
   Capacity: >100%
   Meaning: Advisor has too many students
   Action: Reassign students immediately
```

### Bar Segments

```
BLUE SEGMENT (Active Students)
├─ Represents current workload
├─ Height = Number of active students
└─ Taller = More students assigned

GRAY SEGMENT (Remaining Capacity)
├─ Represents available slots
├─ Height = Remaining capacity
└─ Taller = More available slots
```

## Example Interpretations

### Example 1: Optimal Advisor
```
        ┌─────┐
        │     │  ← No active students
        │     │
        │  ░  │  ← Lots of capacity
        │  ░  │
        │  ░  │
        └─────┘
           🟢    ← Green indicator

Active: 0
Completed: 0
Capacity: 0%

Interpretation: Advisor is available, can assign students
```

### Example 2: Near Capacity Advisor
```
        ┌─────┐
        │  █  │  ← 1 active student
        │  █  │
        │  █  │
        │  ░  │  ← Little capacity left
        │  ░  │
        └─────┘
           🟠    ← Orange indicator

Active: 1
Completed: 0
Capacity: 100%

Interpretation: Advisor is at limit, be careful with new assignments
```

### Example 3: Overloaded Advisor
```
        ┌─────┐
        │  █  │  ← Many active students
        │  █  │
        │  █  │
        │  █  │
        │  █  │
        │  █  │
        └─────┘
           🔴    ← Red indicator

Active: 18
Completed: 2
Capacity: 120%

Interpretation: Advisor is overloaded, needs help immediately
```

## Reading the Graph

### Step 1: Look at the Legend
```
■ Active Students (Blue)
■ Completed (Green)
■ Capacity (Gray)
```

### Step 2: Check the Y-Axis Scale
```
20 ← Maximum capacity
15
10
 5
 0 ← Minimum
```

### Step 3: Compare Bar Heights
- Taller blue = More active students
- Taller gray = More available capacity
- Total height = Total capacity (usually 15)

### Step 4: Check Status Indicator
- 🟢 Green = Good
- 🟠 Orange = Watch
- 🔴 Red = Alert

### Step 5: Read the Stats
```
Active: X      ← Current workload
Completed: Y   ← Finished students
Capacity: Z%   ← Percentage used
```

## Interaction Guide

### Hovering Over a Bar
```
Before Hover:
┌─────┐
│  █  │
│  ░  │
└─────┘

After Hover:
┌─────┐
│  █  │  ← Bar lifts up
│  ░  │  ← Shadow increases
└─────┘  ← Smooth animation
   ●    ← Indicator glows
```

### Scrolling
- If many advisors, scroll horizontally
- All bars remain visible
- Y-axis stays fixed
- Legend stays visible

## Comparison Examples

### Comparing Two Advisors

```
Advisor A          Advisor B
┌─────┐            ┌─────┐
│  █  │            │     │
│  █  │            │     │
│  █  │            │  ░  │
│  ░  │            │  ░  │
│  ░  │            │  ░  │
└─────┘            └─────┘
   🟠                 🟢

A: 1 active, 100% capacity (Near limit)
B: 0 active, 0% capacity (Available)

Conclusion: Assign new students to B, not A
```

### Workload Distribution

```
High Workload:     Medium Workload:    Low Workload:
┌─────┐            ┌─────┐            ┌─────┐
│  █  │            │  █  │            │     │
│  █  │            │  ░  │            │  ░  │
│  █  │            │  ░  │            │  ░  │
│  ░  │            │  ░  │            │  ░  │
│  ░  │            │  ░  │            │  ░  │
└─────┘            └─────┘            └─────┘
   🟠                 🟢                 🟢

Balanced distribution = Good management
```

## Quick Assessment Guide

### At a Glance

```
All Green (🟢)?
└─ Great! All advisors have capacity

Mix of Green and Orange (🟢🟠)?
└─ Normal. Some advisors are busy, others available

Any Red (🔴)?
└─ Alert! Need to reassign students

All Orange/Red (🟠🔴)?
└─ Critical! Need to hire more advisors
```

## Mobile View

### Tablet (768px - 1024px)
```
┌──────────────────────────────┐
│ All Advisors Performance     │
│ Workload, Active Students... │
│                              │
│ Legend: [■] [■] [■]         │
│                              │
│ 20 ┤                          │
│    ├─ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐  │
│ 15 ├─ │█│ │█│ │█│ │█│ │█│  │
│    ├─ │█│ │█│ │█│ │█│ │█│  │
│ 10 ├─ │█│ │█│ │█│ │█│ │█│  │
│    ├─ │░│ │░│ │░│ │░│ │░│  │
│  5 ├─ │░│ │░│ │░│ │░│ │░│  │
│    ├─ │░│ │░│ │░│ │░│ │░│  │
│  0 └─ └─┘ └─┘ └─┘ └─┘ └─┘  │
│      A1  A2  A3  A4  A5     │
│      [Scroll →]              │
└──────────────────────────────┘
```

### Mobile (480px - 768px)
```
┌──────────────────────┐
│ All Advisors         │
│ Performance Metrics  │
│                      │
│ Legend: [■] [■] [■] │
│                      │
│ 20 ┤                  │
│    ├─ ┌─┐ ┌─┐ ┌─┐   │
│ 15 ├─ │█│ │█│ │█│   │
│    ├─ │█│ │█│ │█│   │
│ 10 ├─ │█│ │█│ │█│   │
│    ├─ │░│ │░│ │░│   │
│  5 ├─ │░│ │░│ │░│   │
│    ├─ │░│ │░│ │░│   │
│  0 └─ └─┘ └─┘ └─┘   │
│      A1  A2  A3     │
│      [Scroll →]      │
└──────────────────────┘
```

## Tips for Using the Graph

### For Department Heads
1. **Daily Check**: Look at graph first thing
2. **Identify Issues**: Red indicators need attention
3. **Balance Load**: Assign new students to green advisors
4. **Monitor Trends**: Watch for advisors moving from green to orange

### For Advisors
1. **Know Your Status**: Check your bar color
2. **Plan Ahead**: If orange, prepare for completion
3. **Request Help**: If red, ask for student reassignment
4. **Track Progress**: Watch your bar shrink as students complete

### For Students
1. **Advisor Availability**: Green = available, orange = busy
2. **Assignment Timing**: Better to be assigned to green advisor
3. **Support Quality**: Busy advisors (orange) may have less time

## Troubleshooting

### Graph Not Showing
- Refresh page (Ctrl+Shift+R)
- Check browser console for errors
- Verify advisors exist in system

### Bars Look Wrong
- Check data in backend
- Verify active_students count
- Verify total_assignments value

### Colors Not Matching
- Check capacity calculation
- Verify status color logic
- Clear browser cache

### Scrolling Issues
- Use arrow keys to scroll
- Use mouse wheel
- Use touch swipe on mobile

## Summary

The comprehensive graph provides a quick, visual way to:
- ✅ See all advisors at once
- ✅ Compare workloads instantly
- ✅ Identify capacity issues
- ✅ Make assignment decisions
- ✅ Monitor advisor health
- ✅ Plan resource allocation

**Use it daily for better advisor management!**
