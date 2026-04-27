"""
Custom Permission Classes for Department-Based Access Control
Ensures users can only access data within their department
"""
from rest_framework import permissions


class IsSameDepartmentOrUIL(permissions.BasePermission):
    """
    Allow access if:
    - User is UIL or Admin (staff)
    - User is in same department as object

    Checks:
    - For detail views (retrieve, update, delete)
    - Compares user's department with object's department
    - UIL and Admin always have access
    """

    message = 'You do not have permission to access this resource. Department mismatch.'

    def has_object_permission(self, request, view, obj):
        user = request.user

        # UIL and Admin can access all objects
        if user.is_staff or user.role == 'UIL':
            return True

        # Check if object has department field directly
        if hasattr(obj, 'department'):
            if user.department:
                return obj.department == user.department
            return False

        # Check if object has user field with department
        if hasattr(obj, 'user'):
            if user.department:
                return obj.user.department == user.department
            return False

        # Check if object IS a user with department
        if hasattr(obj, 'role'):
            if user.department:
                return obj.department == user.department
            return False

        # Object linked through student
        if hasattr(obj, 'student'):
            if user.department:
                return obj.student.department == user.department
            return False

        # Object linked through internship
        if hasattr(obj, 'internship'):
            if user.department:
                return obj.internship.department == user.department
            return False

        # Default: deny
        return False


class IsDepartmentRole(permissions.BasePermission):
    """
    Allow access only if user is Department Head, UIL, or Admin
    """

    message = 'Only Department Heads, UIL, and Admins can access this resource.'

    def has_permission(self, request, view):
        user = request.user
        return user.role in ['DEPARTMENT_HEAD', 'UIL', 'ADMIN'] or user.is_staff


class IsOwnerOrUIL(permissions.BasePermission):
    """
    Allow access if:
    - User is UIL or Admin
    - User owns the object
    """

    message = 'You can only access your own resources.'

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_staff or user.role == 'UIL':
            return True

        if hasattr(obj, 'user'):
            return obj.user == user

        if hasattr(obj, 'role'):
            return obj == user

        if hasattr(obj, 'student'):
            return obj.student == user

        if hasattr(obj, 'company'):
            return obj.company == user

        if hasattr(obj, 'advisor'):
            return obj.advisor == user

        return False


class IsCompanyOrUIL(permissions.BasePermission):
    """
    Allow access if:
    - User is UIL or Admin (all methods)
    - User is COMPANY role (all methods — object-level ownership checked separately)

    FIXED: Previously only blocked POST for non-companies but allowed
    PUT/PATCH/DELETE through, relying solely on has_object_permission.
    Now explicitly requires COMPANY role for any write operation.
    GET/HEAD/OPTIONS (safe methods) are allowed for all authenticated users
    so students can browse internships.
    """

    message = 'Only companies can perform this action.'

    def has_permission(self, request, view):
        user = request.user

        # UIL and Admin always allowed
        if user.is_staff or user.role in ['UIL', 'ADMIN']:
            return True

        # Safe (read-only) methods allowed for all authenticated roles
        # (students need to GET internship lists, etc.)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write methods (POST, PUT, PATCH, DELETE) — company only
        return user.role == 'COMPANY'


class IsStudentOrUIL(permissions.BasePermission):
    """
    Allow access if:
    - User is UIL or Admin
    - User is STUDENT role

    Safe methods (GET) allowed for all authenticated users.
    Write methods (POST, etc.) restricted to STUDENT role.
    """

    message = 'Only students can perform this action.'

    def has_permission(self, request, view):
        user = request.user

        if user.is_staff or user.role in ['UIL', 'ADMIN']:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return user.role == 'STUDENT'


class IsAdvisorOrUIL(permissions.BasePermission):
    """
    Allow access if:
    - User is UIL or Admin
    - User is ADVISOR role

    Safe methods allowed for all authenticated users.
    Write methods restricted to ADVISOR role.
    """

    message = 'Only advisors can perform this action.'

    def has_permission(self, request, view):
        user = request.user

        if user.is_staff or user.role in ['UIL', 'ADMIN']:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return user.role == 'ADVISOR'