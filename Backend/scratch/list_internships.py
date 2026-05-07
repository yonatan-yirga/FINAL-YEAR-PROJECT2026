import os
import django
import sys

# Add the current directory to sys.path to find 'config' and 'apps'
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.internships.models import Internship

print("="*80)
print(f"{'ID':<4} | {'Title':<25} | {'Company':<20} | {'Status':<8} | {'Active':<6} | {'Created At':<20}")
print("-"*80)

for i in Internship.objects.all().select_related('company', 'company__company_profile').order_by('-created_at'):
    company_name = i.get_company_name()
    print(f"{i.id:<4} | {i.title[:25]:<25} | {company_name[:20]:<20} | {i.status:<8} | {str(i.is_active):<6} | {str(i.created_at)[:19]}")
print("="*80)
