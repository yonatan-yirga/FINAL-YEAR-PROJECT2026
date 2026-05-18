# Design System Quick Reference — Modern Premium Blue Theme

## 🎨 Color Palette

### Primary Colors
```css
--primary-blue:      #2563eb  /* Main brand color */
--primary-purple:    #7c3aed  /* Secondary accent */
--primary-green:     #10b981  /* Success state */
```

### Backgrounds & Surfaces
```css
--bg-white:          #ffffff  /* Main background */
--bg-light:          #f9fafb  /* Light surface */
--bg-lighter:        #f3f4f6  /* Lighter surface */
```

### Text Colors
```css
--text-primary:      #111827  /* Main text */
--text-secondary:    #6b7280  /* Secondary text */
--text-muted:        #9ca3af  /* Muted text */
```

### Borders & Dividers
```css
--border-color:      #e5e7eb  /* Standard border */
--border-light:      #f3f4f6  /* Light border */
```

### Status Colors
```css
--error:             #ef4444  /* Error/danger */
--warning:           #f59e0b  /* Warning */
--success:           #10b981  /* Success */
--info:              #2563eb  /* Information */
```

---

## 📏 Spacing System

### Padding
```css
--padding-xs:        8px
--padding-sm:        12px
--padding-md:        16px
--padding-lg:        20px
--padding-xl:        24px
```

### Gaps
```css
--gap-xs:            8px
--gap-sm:            10px
--gap-md:            14px
--gap-lg:            16px
--gap-xl:            20px
```

### Content Padding
```css
--content-padding:   24px    /* Page content */
--card-padding:      16px    /* Card content */
```

---

## 🔲 Border Radius

```css
--radius-sm:         8px     /* Small elements */
--radius-md:         10px    /* Cards, buttons */
--radius-lg:         12px    /* Large cards */
--radius-full:       9999px  /* Fully rounded */
```

---

## 🌑 Shadows

### Subtle (Default)
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
```

### Medium (Hover)
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

### Large (Elevated)
```css
box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
```

### Gradient Accent
```css
box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);  /* Blue */
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); /* Green */
```

---

## 🎯 Typography

### Headers
```css
font-size: 24px;
font-weight: 800;
color: #111827;
letter-spacing: -0.3px;
```

### Subheaders
```css
font-size: 16px;
font-weight: 700;
color: #111827;
letter-spacing: -0.2px;
```

### Body Text
```css
font-size: 14px;
font-weight: 400;
color: #111827;
line-height: 1.6;
```

### Labels
```css
font-size: 12px;
font-weight: 700;
color: #6b7280;
text-transform: uppercase;
letter-spacing: 0.5px;
```

---

## 🔘 Button Styles

### Primary Button
```css
background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
color: #ffffff;
padding: 12px 20px;
border-radius: 12px;
font-weight: 700;
box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
transition: all 0.3s;
```

### Primary Button Hover
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
```

### Secondary Button
```css
background: #f3f4f6;
color: #6b7280;
border: 1.5px solid #e5e7eb;
padding: 12px 20px;
border-radius: 12px;
font-weight: 700;
transition: all 0.3s;
```

### Secondary Button Hover
```css
background: #f0f9ff;
border-color: #2563eb;
color: #2563eb;
```

---

## 🎨 Gradient Combinations

### Blue to Purple (Primary)
```css
background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
```

### Blue to Purple to Green (Progress)
```css
background: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #10b981 100%);
```

### Light Blue to Light Purple (Background)
```css
background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
```

---

## 📱 Card Component

```css
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

---

## 🔄 Transitions & Animations

### Standard Transition
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Quick Transition
```css
transition: all 0.2s ease;
```

### Smooth Transition
```css
transition: all 0.5s ease-out;
```

### Spin Animation
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

animation: spin 0.75s linear infinite;
```

### Pulse Animation
```css
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

animation: pulse 2s infinite;
```

---

## 🎯 Icon System

### Icon Sizes
```css
--icon-xs:           14px   /* Inline, badges */
--icon-sm:           16px   /* Inline, labels */
--icon-md:           20px   /* Buttons, cards */
--icon-lg:           24px   /* Headers, large cards */
--icon-xl:           32px   /* Page headers */
```

### Icon Colors
```css
--icon-primary:      #2563eb  /* Main icons */
--icon-secondary:    #9ca3af  /* Secondary icons */
--icon-success:      #10b981  /* Success icons */
--icon-error:        #ef4444  /* Error icons */
```

### Icon Stroke Width
```css
stroke-width: 2;     /* Standard */
stroke-width: 2.5;   /* Bold */
```

---

## 📊 Layout Grid

### Container
```css
max-width: 1400px;
margin: 0 auto;
padding: 0 24px;
```

### Two Column Layout
```css
display: grid;
grid-template-columns: 1fr 360px;
gap: 20px;
align-items: start;
```

### Three Column Layout
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 16px;
```

### Auto-fill Grid
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 14px;
```

---

## ✅ Form Elements

### Input Field
```css
border: 1px solid #e5e7eb;
border-radius: 10px;
padding: 10px 14px;
font-size: 14px;
transition: all 0.3s;
```

### Input Focus
```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
```

### Checkbox/Radio
```css
accent-color: #2563eb;
```

---

## 🎭 State Styles

### Disabled
```css
opacity: 0.6;
cursor: not-allowed;
```

### Loading
```css
opacity: 0.7;
pointer-events: none;
```

### Active
```css
background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
color: #ffffff;
border-color: transparent;
```

### Hover
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) {
  padding: 12px 16px;
  gap: 8px;
}

/* Tablet */
@media (max-width: 768px) {
  padding: 16px 20px;
  gap: 12px;
  grid-template-columns: 1fr;
}

/* Desktop */
@media (min-width: 1024px) {
  padding: 24px;
  gap: 16px;
}
```

---

## 🚀 Quick Copy-Paste Snippets

### Card with Hover
```css
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  transition: all 0.3s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
```

### Badge
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
}
```

### Alert Box
```css
.alert {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 600;
}
.alert-success {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}
.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
```

---

## 📋 Checklist for New Pages

When redesigning a new page, ensure:

- [ ] Background is `#ffffff`
- [ ] Primary color is `#2563eb`
- [ ] Card padding is `16px`
- [ ] Border radius is `10-12px`
- [ ] Gaps are `14-16px`
- [ ] Shadows are `0 1px 3px rgba(0,0,0,0.05)`
- [ ] All icons are Lucide React
- [ ] Buttons use gradient `#2563eb → #7c3aed`
- [ ] Text colors match palette
- [ ] Hover states include transform
- [ ] Responsive design tested
- [ ] Accessibility checked

---

**Last Updated**: May 17, 2026  
**Version**: 1.0  
**Status**: ACTIVE ✅
