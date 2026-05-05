"""
Check if advisor students URL is registered
Run with: python manage.py shell < check_urls.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

def list_urls(urlpatterns, prefix=''):
    """Recursively list all URL patterns"""
    urls = []
    for pattern in urlpatterns:
        if isinstance(pattern, URLResolver):
            urls.extend(list_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
        elif isinstance(pattern, URLPattern):
            urls.append(prefix + str(pattern.pattern))
    return urls

print("\n=== Checking Department URLs ===\n")

resolver = get_resolver()
all_urls = list_urls(resolver.url_patterns)

# Filter for department URLs
dept_urls = [url for url in all_urls if 'departments' in url]

print("Department URLs found:")
for url in sorted(dept_urls):
    print(f"  {url}")

# Check specifically for advisor students
advisor_student_urls = [url for url in dept_urls if 'advisors' in url and 'students' in url]

print(f"\n{'='*50}")
if advisor_student_urls:
    print("✓ Advisor students URL is registered:")
    for url in advisor_student_urls:
        print(f"  {url}")
else:
    print("✗ Advisor students URL NOT found!")
    print("\nAdvisor-related URLs:")
    advisor_urls = [url for url in dept_urls if 'advisors' in url]
    for url in advisor_urls:
        print(f"  {url}")

print(f"{'='*50}\n")
