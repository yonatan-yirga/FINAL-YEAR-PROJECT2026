# Custom Styled Media Browser

## Overview
Created a beautiful, modern media file browser to replace Django's default directory listing for the `/media/` directory.

## New URL
Access the styled media browser at:
- **Root:** `http://localhost:8000/media-browser/`
- **Reports:** `http://localhost:8000/media-browser/reports/monthly/`

## Features

### Visual Design
- **Modern gradient background** (purple to violet)
- **Glassmorphism cards** with backdrop blur
- **Smooth animations** on hover and load
- **Responsive design** for mobile and desktop
- **File type icons** (emoji-based)
- **Breadcrumb navigation** for easy path tracking

### Functionality
- **Directory browsing** - Navigate through folders
- **File information** - Shows size, modified date
- **Parent directory** - ".." link to go back
- **File download** - Click files to download
- **Sorted listing** - Folders first, then files alphabetically
- **Security** - Only works in DEBUG mode, prevents directory traversal

### File Icons
- 📄 PDF files
- 📝 Documents (DOC, DOCX, TXT)
- 🖼️ Images (JPG, PNG, GIF, SVG)
- 🎥 Videos (MP4, AVI, MOV)
- 🎵 Audio (MP3, WAV)
- 📦 Archives (ZIP, RAR, TAR, GZ)
- 📊 Spreadsheets (CSV, XLSX, XLS)
- 🐍 Python files
- 📜 JavaScript files
- 🌐 HTML files
- 🎨 CSS files
- 📋 JSON/XML files
- 📁 Folders

## Files Created

### 1. Backend View (`Backend/apps/core/views.py`)
- `media_browser()` - Main view function
- `get_file_icon()` - Returns emoji icon for file type
- `get_breadcrumbs()` - Generates navigation breadcrumbs
- Security features:
  - Only works in DEBUG mode
  - Prevents directory traversal attacks
  - Validates all paths

### 2. HTML Template (`Backend/apps/core/templates/core/media_browser.html`)
- Modern, responsive design
- Gradient background
- Glassmorphism effects
- Smooth animations
- Mobile-friendly layout
- File grid with hover effects

### 3. URL Configuration (`Backend/config/urls.py`)
- Added media browser routes
- Regex pattern for path handling
- Only enabled in DEBUG mode

## Usage

### Access the Browser
1. Start Django server: `python manage.py runserver 0.0.0.0:8000`
2. Visit: `http://localhost:8000/media-browser/`
3. Navigate to any folder, e.g., `http://localhost:8000/media-browser/reports/monthly/`

### Navigation
- **Click folders** to open them
- **Click files** to download them
- **Click breadcrumbs** to jump to parent folders
- **Click ".."** to go up one level

## Design Highlights

### Color Scheme
- **Background:** Purple to violet gradient (#667eea → #764ba2)
- **Cards:** White with transparency and blur
- **Accent:** Purple (#667eea)
- **Text:** Dark gray (#1a202c, #2d3748)
- **Muted:** Gray (#718096, #a0aec0)

### Animations
- **Fade in** on page load (staggered)
- **Lift up** on hover
- **Color transition** on link hover
- **Shadow expansion** on card hover

### Responsive Breakpoints
- **Desktop:** Full grid with all columns
- **Mobile (<768px):** Simplified 2-column layout, hides size/date

## Security Notes
- ⚠️ **Only works in DEBUG mode** (development)
- ⚠️ **Automatically disabled in production**
- ✅ **Path validation** prevents directory traversal
- ✅ **Permission checks** for file access

## Benefits Over Default Django Listing
1. **Beautiful UI** - Modern, professional design
2. **Better UX** - Clear icons, hover effects, breadcrumbs
3. **Mobile-friendly** - Responsive layout
4. **File info** - Shows size and modification date
5. **Smooth navigation** - Easy to browse folders
6. **Branded** - Matches your application style

## Status
✅ **COMPLETE** - Custom media browser ready to use
🔗 **Access at:** `http://localhost:8000/media-browser/`
