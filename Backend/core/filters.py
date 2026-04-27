"""
Department Filtering Utilities
Provides mixins and helper functions for department-based data isolation
"""
from django.db.models import Q


class DepartmentFilterMixin:
    """
    Mixin to filter queryset by department
    
    Usage:
        class MyViewSet(DepartmentFilterMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer
    
    Filtering Logic:
    - Admin and UIL: See ALL data
    - Department Head: See only their department
    - Other roles (Student, Company, Advisor): See only their department
    - No department assigned: See nothing
    """
    
    def get_queryset(self):
        """
        Filter queryset based on user's department
        
        Returns:
            Filtered queryset based on user's role and department
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admin and UIL see all data (bypass filter)
        if user.is_staff or user.role == 'UIL':
            return queryset
        
        # Department Head sees only their department
        if user.role == 'DEPARTMENT_HEAD':
            if user.department:
                return queryset.filter(department=user.department)
            return queryset.none()
        
        # All other roles see only their department
        if user.department:
            return queryset.filter(department=user.department)
        
        # No department assigned = no data
        return queryset.none()


class UserDepartmentFilterMixin:
    """
    Mixin for filtering User model by department
    Since User model has department directly, use simpler filtering
    
    Usage:
        class StudentViewSet(UserDepartmentFilterMixin, viewsets.ModelViewSet):
            queryset = User.objects.filter(role='STUDENT')
    """
    
    def get_queryset(self):
        """Filter users by department"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admin and UIL see all
        if user.is_staff or user.role == 'UIL':
            return queryset
        
        # Everyone else sees only their department
        if user.department:
            return queryset.filter(department=user.department)
        
        return queryset.none()


# Helper Functions

def filter_by_department(queryset, user):
    """
    Filter any queryset by user's department
    
    Args:
        queryset: Django queryset to filter
        user: User object
    
    Returns:
        Filtered queryset
    
    Example:
        internships = Internship.objects.all()
        filtered = filter_by_department(internships, request.user)
    """
    # Admin and UIL see all
    if user.is_staff or user.role == 'UIL':
        return queryset
    
    # Others see only their department
    if user.department:
        return queryset.filter(department=user.department)
    
    return queryset.none()


def can_view_all_departments(user):
    """
    Check if user can view data from all departments
    
    Args:
        user: User object
    
    Returns:
        Boolean: True if user can see all departments
    
    Example:
        if can_view_all_departments(request.user):
            # Show department selector
        else:
            # Only show user's department
    """
    return user.is_staff or user.role == 'UIL'


def get_user_departments(user):
    """
    Get list of departments user can access
    
    Args:
        user: User object
    
    Returns:
        QuerySet of Department objects user can access
    
    Example:
        departments = get_user_departments(request.user)
        dept_choices = [(d.id, d.name) for d in departments]
    """
    from apps.departments.models import Department
    
    # Admin and UIL can access all departments
    if user.is_staff or user.role == 'UIL':
        return Department.objects.all()
    
    # Others can only access their own department
    if user.department:
        return Department.objects.filter(id=user.department.id)
    
    # No department = no access
    return Department.objects.none()


def validate_same_department(user, obj):
    """
    Validate that object belongs to user's department
    
    Args:
        user: User object
        obj: Model instance with department field
    
    Returns:
        Boolean: True if valid, False otherwise
    
    Raises:
        ValueError: If validation fails (optional - can just return False)
    
    Example:
        if not validate_same_department(request.user, internship):
            return Response({'error': 'Access denied'}, status=403)
    """
    # Admin and UIL can access any department
    if user.is_staff or user.role == 'UIL':
        return True
    
    # Check if object has department field
    if hasattr(obj, 'department'):
        return obj.department == user.department
    
    # Check if object has user with department
    if hasattr(obj, 'user'):
        return obj.user.department == user.department
    
    return False


def validate_department_access(user, department_id):
    """
    Validate that user can access a specific department
    
    Args:
        user: User object
        department_id: Department ID to check
    
    Returns:
        Boolean: True if user can access this department
    
    Example:
        if not validate_department_access(request.user, dept_id):
            raise PermissionDenied("Cannot access this department")
    """
    # Admin and UIL can access any department
    if user.is_staff or user.role == 'UIL':
        return True
    
    # Others can only access their own department
    if user.department:
        return user.department.id == department_id
    
    return False