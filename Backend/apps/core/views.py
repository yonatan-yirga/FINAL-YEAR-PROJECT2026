"""
Core views for the application
"""
from django.shortcuts import render
from django.http import Http404, FileResponse
from django.conf import settings
from pathlib import Path
import os
import mimetypes
from datetime import datetime


def media_browser(request, path=''):
    """
    Custom styled media file browser
    """
    # Security: Only allow in DEBUG mode
    if not settings.DEBUG:
        raise Http404("Media browser is only available in development mode")
    
    # Build the full path
    media_root = Path(settings.MEDIA_ROOT)
    requested_path = media_root / path
    
    # Security: Prevent directory traversal
    try:
        requested_path = requested_path.resolve()
        if not str(requested_path).startswith(str(media_root.resolve())):
            raise Http404("Invalid path")
    except:
        raise Http404("Invalid path")
    
    # Check if path exists
    if not requested_path.exists():
        raise Http404("Path does not exist")
    
    # If it's a file, serve it
    if requested_path.is_file():
        return FileResponse(open(requested_path, 'rb'))
    
    # If it's a directory, list contents
    if requested_path.is_dir():
        items = []
        
        # Add parent directory link if not at root
        if path:
            parent_path = str(Path(path).parent)
            if parent_path == '.':
                parent_path = ''
            items.append({
                'name': '..',
                'is_dir': True,
                'url': f'/media-browser/{parent_path}',
                'size': '-',
                'modified': '-',
                'icon': '📁'
            })
        
        # List directory contents
        try:
            for item in sorted(requested_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                item_path = str(item.relative_to(media_root))
                
                # Get file info
                stat = item.stat()
                size = stat.st_size
                modified = datetime.fromtimestamp(stat.st_mtime)
                
                # Format size
                if item.is_dir():
                    size_str = '-'
                    icon = '📁'
                elif size < 1024:
                    size_str = f'{size} B'
                    icon = get_file_icon(item.name)
                elif size < 1024 * 1024:
                    size_str = f'{size / 1024:.1f} KB'
                    icon = get_file_icon(item.name)
                else:
                    size_str = f'{size / (1024 * 1024):.1f} MB'
                    icon = get_file_icon(item.name)
                
                items.append({
                    'name': item.name,
                    'is_dir': item.is_dir(),
                    'url': f'/media-browser/{item_path}',
                    'size': size_str,
                    'modified': modified.strftime('%Y-%m-%d %H:%M'),
                    'icon': icon
                })
        except PermissionError:
            raise Http404("Permission denied")
        
        context = {
            'path': path or '/',
            'items': items,
            'breadcrumbs': get_breadcrumbs(path)
        }
        
        return render(request, 'core/media_browser.html', context)
    
    raise Http404("Invalid path")


def get_file_icon(filename):
    """Get emoji icon based on file extension"""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    icons = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'txt': '📝',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'svg': '🖼️',
        'mp4': '🎥',
        'avi': '🎥',
        'mov': '🎥',
        'mp3': '🎵',
        'wav': '🎵',
        'zip': '📦',
        'rar': '📦',
        'tar': '📦',
        'gz': '📦',
        'py': '🐍',
        'js': '📜',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'xml': '📋',
        'csv': '📊',
        'xlsx': '📊',
        'xls': '📊',
    }
    
    return icons.get(ext, '📄')


def get_breadcrumbs(path):
    """Generate breadcrumb navigation"""
    if not path:
        return [{'name': 'Media Root', 'url': '/media-browser/'}]
    
    breadcrumbs = [{'name': 'Media Root', 'url': '/media-browser/'}]
    parts = path.split('/')
    current_path = ''
    
    for part in parts:
        if part:
            current_path = f'{current_path}/{part}' if current_path else part
            breadcrumbs.append({
                'name': part,
                'url': f'/media-browser/{current_path}'
            })
    
    return breadcrumbs
