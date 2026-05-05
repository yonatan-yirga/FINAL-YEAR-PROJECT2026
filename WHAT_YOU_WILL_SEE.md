# What You Will See - New Design

## Page Location
**URL**: http://localhost:5173/department/advisors

## Section Title
You will see this exact text at the top of the performance section:

```
🏆 Advisor Performance Overview
```

With subtitle below:
```
Top performing advisors by workload capacity
```

And a button on the right:
```
[View All]
```

## Capacity Banner
Right below the header, you'll see a green banner:

```
✓ All advisors are within capacity limits
```

## Card Grid
Below the banner, you'll see **6 cards** arranged in a grid (3 columns on desktop).

### Example Card Layout

```
┌─────────────────────────────────────┐
│ [TOP PERFORMER 🏆]                  │ ← Only on first card
│                                     │
│   (J)    John Smith                 │ ← Avatar + Name
│          Staff-001                  │ ← Staff ID
│                                     │
│            ⭕                       │ ← Circular Progress
│           15/15                     │ ← Center Value
│                                     │
│         [Optimal]                   │ ← Status Badge
│                                     │
│  ─────────────────────────────     │
│  Active  Completed  Capacity        │ ← Stats Labels
│    15        8         100%         │ ← Stats Values
└─────────────────────────────────────┘
```

## What Each Element Looks Like

### 1. Avatar Circle
- **Shape**: Perfect circle
- **Color**: Green gradient
- **Content**: First letter of name (e.g., "J" for John)
- **Size**: 48px diameter
- **Position**: Top left of card

### 2. Circular Progress Ring
- **Shape**: Donut/ring shape
- **Size**: 120px diameter
- **Colors**:
  - Background: Light gray
  - Progress: Green/Orange/Red (based on status)
- **Animation**: Draws clockwise from top
- **Center**: Shows "12 / 15" (active / max)

### 3. Status Badge
- **Shape**: Rounded pill
- **Text**: "Optimal" or "Near Capacity" or "Overloaded"
- **Colors**:
  - Green background + green text = Optimal
  - Orange background + orange text = Near Capacity
  - Red background + red text = Overloaded

### 4. Top Performer Badge
- **Position**: Top-right corner of card
- **Color**: Green gradient
- **Text**: "TOP PERFORMER"
- **Icon**: Award/trophy icon
- **Only on**: The advisor with most active students

### 5. Stats Row
Three columns showing:
- **Active**: Number of active students
- **Completed**: Number of completed students
- **Capacity**: Percentage (e.g., "80%")

## Color Meanings

### Green (Optimal)
- **When**: Active students ≤ 80% of max capacity
- **Example**: 8 out of 15 = 53%
- **Meaning**: Healthy workload, can take more students

### Orange (Near Capacity)
- **When**: Active students 81-100% of max capacity
- **Example**: 14 out of 15 = 93%
- **Meaning**: Almost at limit, be cautious

### Red (Overloaded)
- **When**: Active students > max capacity
- **Example**: 18 out of 15 = 120%
- **Meaning**: Exceeds capacity, needs attention

## Animations You'll See

### On Page Load
1. **Cards fade in** from bottom, one after another (0.1s delay each)
2. **Progress rings draw** clockwise from 0% to their actual percentage
3. **Total animation time**: About 1.5 seconds

### On Hover
1. **Card lifts up** slightly (4px)
2. **Shadow increases** for depth
3. **Border turns green** to highlight
4. **Smooth transition** (0.3s)

## Example with Real Data

If you have these advisors:
1. John Smith - 15/15 students (100%)
2. Sarah Johnson - 12/15 students (80%)
3. Mike Davis - 10/15 students (67%)
4. Lisa Anderson - 8/15 students (53%)
5. Tom Brown - 7/15 students (47%)
6. Amy Chen - 6/15 students (40%)

You will see:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Advisor Performance Overview              [View All]     │
├─────────────────────────────────────────────────────────────┤
│ ✓ All advisors are within capacity limits                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ TOP PERF 🏆  │  │              │  │              │     │
│  │ (J) John S.  │  │ (S) Sarah J. │  │ (M) Mike D.  │     │
│  │  Staff-001   │  │  Staff-004   │  │  Staff-007   │     │
│  │     ⭕       │  │     ⭕       │  │     ⭕       │     │
│  │    15/15     │  │    12/15     │  │    10/15     │     │
│  │  [Optimal]   │  │  [Optimal]   │  │  [Optimal]   │     │
│  │ 15  8  100%  │  │ 12  6   80%  │  │ 10  5   67%  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ (L) Lisa A.  │  │ (T) Tom B.   │  │ (A) Amy C.   │     │
│  │  Staff-012   │  │  Staff-015   │  │  Staff-018   │     │
│  │     ⭕       │  │     ⭕       │  │     ⭕       │     │
│  │     8/15     │  │     7/15     │  │     6/15     │     │
│  │  [Optimal]   │  │  [Optimal]   │  │  [Optimal]   │     │
│  │  8  4   53%  │  │  7  3   47%  │  │  6  2   40%  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## On Different Screen Sizes

### Desktop (Large Screen)
- **3 cards per row** (2 rows total)
- **Wide spacing** between cards
- **Full-size progress** rings (120px)

### Tablet (Medium Screen)
- **2-3 cards per row**
- **Medium spacing**
- **Full-size progress** rings (120px)

### Mobile (Small Screen)
- **1-2 cards per row**
- **Compact spacing**
- **Smaller progress** rings (100px)

### Small Mobile (Very Small Screen)
- **1 card per row** (stacked vertically)
- **Minimal spacing**
- **Smaller progress** rings (100px)

## What to Look For

### ✅ Good Signs
- Cards appear in a grid (not a list)
- Circular progress rings (not horizontal bars)
- "TOP PERFORMER" badge on first card
- Green capacity banner at top
- Smooth animations when page loads
- Cards lift when you hover

### ❌ Problems (If You See These)
- Horizontal bars instead of circles → Old design still cached
- No animations → Browser cache issue
- Broken layout → CSS not loaded
- No cards showing → No advisor data

### 🔧 Quick Fixes
1. **Hard refresh**: `Ctrl + Shift + R`
2. **Clear cache**: Browser settings → Clear cache
3. **Try incognito**: Open in private/incognito window
4. **Check console**: F12 → Console tab for errors

## Exact Text You'll See

### Header
```
Advisor Performance Overview
```

### Subtitle
```
Top performing advisors by workload capacity
```

### Banner
```
All advisors are within capacity limits
```

### Button
```
View All
```

### Top Badge
```
TOP PERFORMER
```

### Status Options
```
Optimal
Near Capacity
Overloaded
```

### Stats Labels
```
Active
Completed
Capacity
```

## Summary

You will see a **modern, card-based dashboard** with:
- 6 advisor cards in a grid
- Circular progress indicators
- Color-coded status badges
- Top performer highlighting
- Smooth animations
- Professional, clean design

**It will look completely different from the old horizontal bar chart!**

---

**Ready to see it? Hard refresh and navigate to the Advisors page!** 🎉
