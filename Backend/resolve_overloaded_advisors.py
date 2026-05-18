"""
Script to detect and resolve overloaded advisor situations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.advisors.models import AdvisorAssignment
from django.db.models import Count, Q
from collections import defaultdict

# Configuration
MAX_STUDENTS_DEFAULT = 15
WARNING_THRESHOLD = 12
OPTIMAL_LOAD = 10

print("=" * 70)
print("ADVISOR OVERLOAD RESOLUTION TOOL")
print("=" * 70)

def get_advisor_workload():
    """Get all advisors with their current workload"""
    advisors = User.objects.filter(
        role='ADVISOR',
        is_approved=True
    ).annotate(
        active_students=Count(
            'supervised_students',
            filter=Q(supervised_students__is_active=True)
        )
    ).select_related('advisor_profile', 'department')
    
    return advisors

def analyze_workload():
    """Analyze current workload distribution"""
    advisors = get_advisor_workload()
    
    overloaded = []
    high_load = []
    normal = []
    underutilized = []
    
    for advisor in advisors:
        profile = getattr(advisor, 'advisor_profile', None)
        max_students = profile.max_students if profile and profile.max_students else MAX_STUDENTS_DEFAULT
        load = advisor.active_students
        
        advisor_data = {
            'id': advisor.id,
            'name': profile.full_name if profile else advisor.email,
            'email': advisor.email,
            'department': advisor.department.name if advisor.department else 'None',
            'current_load': load,
            'max_students': max_students,
            'percentage': (load / max_students * 100) if max_students > 0 else 0
        }
        
        if load >= max_students:
            overloaded.append(advisor_data)
        elif load >= WARNING_THRESHOLD:
            high_load.append(advisor_data)
        elif load >= 5:
            normal.append(advisor_data)
        else:
            underutilized.append(advisor_data)
    
    return {
        'overloaded': overloaded,
        'high_load': high_load,
        'normal': normal,
        'underutilized': underutilized,
        'total': advisors.count()
    }

def print_analysis(analysis):
    """Print workload analysis"""
    print(f"\n📊 WORKLOAD ANALYSIS")
    print(f"   Total Advisors: {analysis['total']}")
    print(f"   🔴 Overloaded: {len(analysis['overloaded'])}")
    print(f"   🟠 High Load: {len(analysis['high_load'])}")
    print(f"   🟢 Normal: {len(analysis['normal'])}")
    print(f"   🔵 Underutilized: {len(analysis['underutilized'])}")
    
    if analysis['overloaded']:
        print(f"\n🚨 OVERLOADED ADVISORS:")
        for adv in analysis['overloaded']:
            print(f"\n   {adv['name']}")
            print(f"   Email: {adv['email']}")
            print(f"   Department: {adv['department']}")
            print(f"   Load: {adv['current_load']}/{adv['max_students']} ({adv['percentage']:.1f}%)")
            print(f"   Excess: {adv['current_load'] - adv['max_students']} students")
    
    if analysis['underutilized']:
        print(f"\n✅ UNDERUTILIZED ADVISORS (Can take more students):")
        for adv in analysis['underutilized']:
            capacity = adv['max_students'] - adv['current_load']
            print(f"\n   {adv['name']}")
            print(f"   Department: {adv['department']}")
            print(f"   Load: {adv['current_load']}/{adv['max_students']}")
            print(f"   Available capacity: {capacity} students")

def suggest_redistribution(analysis):
    """Suggest optimal redistribution"""
    overloaded = analysis['overloaded']
    underutilized = analysis['underutilized'] + analysis['normal']
    
    if not overloaded:
        print(f"\n✅ No overloaded advisors found!")
        return
    
    if not underutilized:
        print(f"\n⚠️  All advisors are at or near capacity!")
        print(f"   Recommendation: Add new advisors to the department")
        return
    
    print(f"\n💡 REDISTRIBUTION SUGGESTIONS:")
    print(f"=" * 70)
    
    # Group by department
    by_dept = defaultdict(lambda: {'overloaded': [], 'available': []})
    
    for adv in overloaded:
        by_dept[adv['department']]['overloaded'].append(adv)
    
    for adv in underutilized:
        capacity = adv['max_students'] - adv['current_load']
        if capacity > 0:
            by_dept[adv['department']]['available'].append({
                **adv,
                'capacity': capacity
            })
    
    # Suggest redistribution per department
    for dept, data in by_dept.items():
        if not data['overloaded']:
            continue
        
        print(f"\n📁 {dept} Department:")
        
        for overloaded_adv in data['overloaded']:
            excess = overloaded_adv['current_load'] - overloaded_adv['max_students']
            print(f"\n   From: {overloaded_adv['name']}")
            print(f"   Needs to reassign: {excess} students")
            
            if data['available']:
                print(f"   Suggested recipients:")
                remaining = excess
                
                for available_adv in sorted(data['available'], key=lambda x: x['current_load']):
                    if remaining <= 0:
                        break
                    
                    can_take = min(available_adv['capacity'], remaining)
                    if can_take > 0:
                        print(f"      → {available_adv['name']}: {can_take} students")
                        print(f"         (Current: {available_adv['current_load']}, After: {available_adv['current_load'] + can_take})")
                        remaining -= can_take
                        available_adv['capacity'] -= can_take
                        available_adv['current_load'] += can_take
                
                if remaining > 0:
                    print(f"      ⚠️  Still need to place {remaining} students")
                    print(f"         Recommendation: Add new advisor or increase max_students")
            else:
                print(f"   ⚠️  No available advisors in this department!")
                print(f"      Recommendation: Add new advisor")

def get_students_to_reassign(advisor_id, count):
    """Get list of students that can be reassigned from an advisor"""
    assignments = AdvisorAssignment.objects.filter(
        advisor_id=advisor_id,
        is_active=True
    ).select_related(
        'student__student_profile',
        'internship'
    ).order_by('-assigned_at')[:count]
    
    students = []
    for assignment in assignments:
        student = assignment.student
        profile = getattr(student, 'student_profile', None)
        students.append({
            'assignment_id': assignment.id,
            'student_id': student.id,
            'student_name': profile.full_name if profile else student.email,
            'student_email': student.email,
            'internship': assignment.internship.title if assignment.internship else 'N/A',
            'assigned_date': assignment.assigned_at.strftime('%Y-%m-%d')
        })
    
    return students

def main():
    """Main function"""
    # Analyze current workload
    analysis = analyze_workload()
    print_analysis(analysis)
    
    # Suggest redistribution
    suggest_redistribution(analysis)
    
    # Show detailed reassignment options
    if analysis['overloaded']:
        print(f"\n" + "=" * 70)
        print(f"DETAILED REASSIGNMENT OPTIONS")
        print(f"=" * 70)
        
        for adv in analysis['overloaded']:
            excess = adv['current_load'] - adv['max_students']
            print(f"\n📋 {adv['name']} - Students to consider reassigning:")
            
            students = get_students_to_reassign(adv['id'], excess)
            for i, student in enumerate(students, 1):
                print(f"\n   {i}. {student['student_name']}")
                print(f"      Email: {student['student_email']}")
                print(f"      Internship: {student['internship']}")
                print(f"      Assigned: {student['assigned_date']}")
                print(f"      Assignment ID: {student['assignment_id']}")
    
    # Summary and recommendations
    print(f"\n" + "=" * 70)
    print(f"RECOMMENDATIONS")
    print(f"=" * 70)
    
    if not analysis['overloaded']:
        print(f"\n✅ System is healthy! No action needed.")
    else:
        print(f"\n🔧 ACTION ITEMS:")
        print(f"\n1. Review suggested redistributions above")
        print(f"2. Contact affected advisors to discuss reassignment")
        print(f"3. Use the Department Head dashboard to reassign students")
        print(f"4. Consider adding new advisors if capacity is insufficient")
        print(f"\n📝 To reassign a student:")
        print(f"   - Go to /department/advisors")
        print(f"   - Click on the overloaded advisor")
        print(f"   - Select students to reassign")
        print(f"   - Choose new advisor")
        print(f"   - Confirm reassignment")
    
    print()

if __name__ == '__main__':
    main()
