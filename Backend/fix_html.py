import os
import re

app_dirs = [
    'apps/accounts/admin.py',
    'apps/advisors/admin.py',
    'apps/departments/admin.py',
    'apps/registrations/admin.py',
]

for filepath in app_dirs:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add mark_safe import if not present
    if 'from django.utils.safestring import mark_safe' not in content:
        content = content.replace('from django.utils.html import format_html', 
                                'from django.utils.html import format_html\nfrom django.utils.safestring import mark_safe')
    
    # Replace format_html(...) targeting static strings only (no {} and no commas separating args)
    def replacer(match):
        inner = match.group(1)
        # If there's no placeholder {} and no string formatting args
        if '{' not in inner and ',' not in inner:
            return f'mark_safe({inner})'
        return match.group(0)

    # First  pass: single line or multiline static strings
    content = re.sub(r'format_html\(\s*([\'"][^{},]*?[\'"])\s*\)', replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed format_html calls.")
