# Debre Markos University Logo Setup

## Instructions

To display the official Debre Markos University logo in the application header:

1. **Save the logo image** as `dmu-logo.png` in this directory (`Frontend/public/`)

2. **Image specifications:**
   - Format: PNG (with transparent background preferred)
   - Recommended size: 200x200 pixels or higher
   - The image will be automatically scaled to 56x56px in the header

3. **File location:**
   ```
   Frontend/public/dmu-logo.png
   ```

4. **Fallback:**
   - If the image is not found, a fallback logo with "DMU" text will be displayed
   - The fallback maintains the university's color scheme (yellow and red)

## Current Implementation

The logo is displayed in the Header component on all pages with:
- Professional drop shadow effect
- Hover animation (slight scale and enhanced shadow)
- Responsive sizing (56px desktop, 48px mobile)
- Automatic fallback if image fails to load

## Testing

After placing the logo file:
1. Refresh the application
2. Check the header on any page
3. The official DMU logo should appear on the left side
4. Test on mobile devices to ensure proper scaling

---

**Note:** The logo image you provided shows the official Debre Markos University seal with:
- Yellow circular border with Amharic and English text
- Central landscape with mountains, sun, and bridge
- Open book symbolizing knowledge
- "DMU" text at the bottom
