from apps.internships.models import Internship
from apps.accounts.models import User

print(f"Total Internships: {Internship.objects.count()}")
print(f"Open & Active Internships: {Internship.objects.filter(is_active=True, status='OPEN').count()}")

open_internships = Internship.objects.filter(is_active=True, status='OPEN')
for i in open_internships:
    print(f"- {i.title} at {i.get_company_name()}")

companies = User.objects.filter(role='COMPANY')
print(f"Total Companies: {companies.count()}")
