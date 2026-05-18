"""
Add Location Preferences to Students
Adds sample location preferences to existing students for testing
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, StudentProfile

# Ethiopian cities for location preferences
ETHIOPIAN_CITIES = [
    'Addis Ababa',
    'Dire Dawa',
    'Bahir Dar',
    'Hawassa',
    'Mekelle',
    'Gondar',
    'Adama',
    'Jimma',
    'Dessie',
    'Harar'
]

def add_location_preferences():
    """Add location preferences to all students"""
    print("🔍 Finding students...")
    
    students = User.objects.filter(role='STUDENT').select_related('student_profile')
    
    if not students.exists():
        print("❌ No students found!")
        return
    
    print(f"✅ Found {students.count()} students")
    print("\n📍 Adding location preferences...")
    
    updated_count = 0
    
    for i, student in enumerate(students):
        try:
            profile = student.student_profile
            
            # Assign 3 different cities as preferences
            # Rotate through cities based on student index
            city_index = i % len(ETHIOPIAN_CITIES)
            
            profile.preferred_location_1 = ETHIOPIAN_CITIES[city_index]
            profile.preferred_location_2 = ETHIOPIAN_CITIES[(city_index + 1) % len(ETHIOPIAN_CITIES)]
            profile.preferred_location_3 = ETHIOPIAN_CITIES[(city_index + 2) % len(ETHIOPIAN_CITIES)]
            
            profile.save()
            
            print(f"✅ {profile.full_name}:")
            print(f"   1st: {profile.preferred_location_1}")
            print(f"   2nd: {profile.preferred_location_2}")
            print(f"   3rd: {profile.preferred_location_3}")
            
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Error updating {student.email}: {e}")
    
    print(f"\n✅ Successfully updated {updated_count} students with location preferences!")
    print("\n📋 Summary:")
    print(f"   - Total students: {students.count()}")
    print(f"   - Updated: {updated_count}")
    print(f"   - Available cities: {', '.join(ETHIOPIAN_CITIES)}")

if __name__ == '__main__':
    print("=" * 60)
    print("ADD STUDENT LOCATION PREFERENCES")
    print("=" * 60)
    add_location_preferences()
    print("=" * 60)
