# Grade Mapping Reference

## Visual Grade Scale

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRADE SCALE VISUALIZATION                     │
└─────────────────────────────────────────────────────────────────┘

 100 ┤ ╔═══════════════════════════════════════╗
     │ ║            A+ Outstanding             ║  🟢 Green
  90 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║             A Excellent               ║  🟢 Green
  85 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║            A- Very Good               ║  🟢 Light Green
  80 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║              B+ Good                  ║  🔵 Blue
  75 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║              B Good                   ║  🔵 Blue
  70 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║          B- Above Average             ║  🔵 Light Blue
  65 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║          C+ Satisfactory              ║  🟡 Yellow
  60 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║              C Pass                   ║  🟠 Orange
  50 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║           C- Weak Pass                ║  🟠 Orange
  45 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║              D Poor                   ║  ⚪ Gray
  40 ┤ ╚═══════════════════════════════════════╝
     │ ╔═══════════════════════════════════════╗
     │ ║              F Fail                   ║  🔴 Red
   0 ┤ ╚═══════════════════════════════════════╝
```

## Detailed Grade Breakdown

### Excellent Performance (80-100)
```
A+ │ 90-100 │ Outstanding
   │        │ Exceptional performance exceeding all expectations
   │        │ Demonstrates mastery and innovation
   │        │ Ready for advanced responsibilities
   
A  │ 85-89  │ Excellent
   │        │ Consistently high-quality work
   │        │ Strong technical and professional skills
   │        │ Minimal supervision required
   
A- │ 80-84  │ Very Good
   │        │ High-quality work with minor areas for growth
   │        │ Strong foundation in core competencies
   │        │ Reliable and professional
```

### Good Performance (65-79)
```
B+ │ 75-79  │ Good
   │        │ Solid performance meeting expectations
   │        │ Good technical skills and work ethic
   │        │ Occasional guidance needed
   
B  │ 70-74  │ Good
   │        │ Meets job requirements consistently
   │        │ Developing professional competencies
   │        │ Shows steady improvement
   
B- │ 65-69  │ Above Average
   │        │ Generally meets expectations
   │        │ Some areas need development
   │        │ Responds well to feedback
```

### Satisfactory Performance (45-64)
```
C+ │ 60-64  │ Satisfactory
   │        │ Acceptable performance with room for improvement
   │        │ Basic competencies demonstrated
   │        │ Requires regular supervision
   
C  │ 50-59  │ Pass
   │        │ Minimum acceptable performance
   │        │ Meets basic requirements
   │        │ Significant development needed
   
C- │ 45-49  │ Weak Pass
   │        │ Barely meets minimum standards
   │        │ Considerable improvement required
   │        │ Close monitoring necessary
```

### Below Standard (0-44)
```
D  │ 40-44  │ Poor
   │        │ Below acceptable standards
   │        │ Major deficiencies in performance
   │        │ Immediate intervention required
   
F  │ 0-39   │ Fail
   │        │ Unacceptable performance
   │        │ Did not meet minimum requirements
   │        │ Internship objectives not achieved
```

## Color Coding for UI/PDF

### Hex Color Palette

```css
/* A Grades - Green Spectrum */
.grade-a-plus  { background: #065F46; color: #D1FAE5; } /* Dark Green / Light Green */
.grade-a       { background: #047857; color: #D1FAE5; } /* Green / Light Green */
.grade-a-minus { background: #059669; color: #D1FAE5; } /* Medium Green / Light Green */

/* B Grades - Blue Spectrum */
.grade-b-plus  { background: #1E40AF; color: #DBEAFE; } /* Dark Blue / Light Blue */
.grade-b       { background: #2563EB; color: #DBEAFE; } /* Blue / Light Blue */
.grade-b-minus { background: #3B82F6; color: #DBEAFE; } /* Medium Blue / Light Blue */

/* C Grades - Yellow/Orange Spectrum */
.grade-c-plus  { background: #92400E; color: #FEF3C7; } /* Brown / Light Yellow */
.grade-c       { background: #D97706; color: #FEF3C7; } /* Orange / Light Yellow */
.grade-c-minus { background: #F59E0B; color: #FEF3C7; } /* Light Orange / Light Yellow */

/* D Grade - Gray */
.grade-d       { background: #6B7280; color: #F3F4F6; } /* Gray / Light Gray */

/* F Grade - Red */
.grade-f       { background: #991B1B; color: #FEE2E2; } /* Dark Red / Light Red */
```

## Python Implementation Reference

```python
# Grade calculation logic
def calculate_grade(total_score):
    """
    Calculate letter grade based on total score (0-100)
    
    Args:
        total_score (float): Weighted total score
        
    Returns:
        str: Letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
    """
    if total_score >= 90:
        return 'A+'
    elif total_score >= 85:
        return 'A'
    elif total_score >= 80:
        return 'A-'
    elif total_score >= 75:
        return 'B+'
    elif total_score >= 70:
        return 'B'
    elif total_score >= 65:
        return 'B-'
    elif total_score >= 60:
        return 'C+'
    elif total_score >= 50:
        return 'C'
    elif total_score >= 45:
        return 'C-'
    elif total_score >= 40:
        return 'D'
    else:
        return 'F'

# Grade display labels
GRADE_LABELS = {
    'A+': 'Outstanding',
    'A': 'Excellent',
    'A-': 'Very good',
    'B+': 'Good',
    'B': 'Good',
    'B-': 'Above average',
    'C+': 'Satisfactory',
    'C': 'Pass',
    'C-': 'Weak pass',
    'D': 'Poor',
    'F': 'Fail',
}

# Full grade choices for Django model
GRADE_CHOICES = [
    ('A+', 'A+ (90-100) - Outstanding'),
    ('A', 'A (85-89) - Excellent'),
    ('A-', 'A- (80-84) - Very good'),
    ('B+', 'B+ (75-79) - Good'),
    ('B', 'B (70-74) - Good'),
    ('B-', 'B- (65-69) - Above average'),
    ('C+', 'C+ (60-64) - Satisfactory'),
    ('C', 'C (50-59) - Pass'),
    ('C-', 'C- (45-49) - Weak pass'),
    ('D', 'D (40-44) - Poor'),
    ('F', 'F (<40) - Fail'),
]
```

## JavaScript/React Implementation Reference

```javascript
// Grade calculation
const calculateGrade = (totalScore) => {
  if (totalScore >= 90) return 'A+';
  if (totalScore >= 85) return 'A';
  if (totalScore >= 80) return 'A-';
  if (totalScore >= 75) return 'B+';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 65) return 'B-';
  if (totalScore >= 60) return 'C+';
  if (totalScore >= 50) return 'C';
  if (totalScore >= 45) return 'C-';
  if (totalScore >= 40) return 'D';
  return 'F';
};

// Grade labels
const GRADE_LABELS = {
  'A+': 'Outstanding',
  'A': 'Excellent',
  'A-': 'Very good',
  'B+': 'Good',
  'B': 'Good',
  'B-': 'Above average',
  'C+': 'Satisfactory',
  'C': 'Pass',
  'C-': 'Weak pass',
  'D': 'Poor',
  'F': 'Fail',
};

// Grade colors
const GRADE_COLORS = {
  'A+': { bg: '#065F46', text: '#D1FAE5' },
  'A': { bg: '#047857', text: '#D1FAE5' },
  'A-': { bg: '#059669', text: '#D1FAE5' },
  'B+': { bg: '#1E40AF', text: '#DBEAFE' },
  'B': { bg: '#2563EB', text: '#DBEAFE' },
  'B-': { bg: '#3B82F6', text: '#DBEAFE' },
  'C+': { bg: '#92400E', text: '#FEF3C7' },
  'C': { bg: '#D97706', text: '#FEF3C7' },
  'C-': { bg: '#F59E0B', text: '#FEF3C7' },
  'D': { bg: '#6B7280', text: '#F3F4F6' },
  'F': { bg: '#991B1B', text: '#FEE2E2' },
};
```

## Test Cases

```python
# Unit test cases for grade calculation
test_cases = [
    (100, 'A+'),  # Maximum score
    (95, 'A+'),   # Mid A+
    (90, 'A+'),   # Lower bound A+
    (89.9, 'A'),  # Just below A+
    (87, 'A'),    # Mid A
    (85, 'A'),    # Lower bound A
    (84.9, 'A-'), # Just below A
    (82, 'A-'),   # Mid A-
    (80, 'A-'),   # Lower bound A-
    (79.9, 'B+'), # Just below A-
    (77, 'B+'),   # Mid B+
    (75, 'B+'),   # Lower bound B+
    (72, 'B'),    # Mid B
    (70, 'B'),    # Lower bound B
    (67, 'B-'),   # Mid B-
    (65, 'B-'),   # Lower bound B-
    (62, 'C+'),   # Mid C+
    (60, 'C+'),   # Lower bound C+
    (55, 'C'),    # Mid C
    (50, 'C'),    # Lower bound C
    (47, 'C-'),   # Mid C-
    (45, 'C-'),   # Lower bound C-
    (42, 'D'),    # Mid D
    (40, 'D'),    # Lower bound D
    (39.9, 'F'),  # Just below D
    (20, 'F'),    # Mid F
    (0, 'F'),     # Minimum score
]
```

## Migration Considerations

### Database Field Change
```sql
-- Before: VARCHAR(1)
ALTER TABLE final_reports 
MODIFY COLUMN overall_grade VARCHAR(2);

-- Existing data examples:
-- 'A' remains 'A' (valid in new system)
-- 'B' remains 'B' (valid in new system)
-- 'C' remains 'C' (valid in new system)
-- 'D' remains 'D' (valid in new system)
-- 'F' remains 'F' (valid in new system)
```

### Data Preservation
- All existing single-character grades (A, B, C, D, F) remain valid
- New calculations will produce 2-character grades (A+, A-, B+, etc.)
- No automatic conversion of historical data
- Both formats coexist in the database

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-23  
**Purpose**: Technical reference for grade mapping implementation
