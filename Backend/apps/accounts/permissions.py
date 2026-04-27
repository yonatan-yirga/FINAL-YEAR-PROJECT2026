"""
Custom Permission Classes for Internship Management System

These permissions check user roles and department access.
All permissions work with Token Authentication.
"""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """
    Permission to check if user has STUDENT role
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsStudent]
    """
    message = 'This action is restricted to students only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has STUDENT role"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['STUDENT', 'ADMIN', 'UIL']
        )


class IsCompany(permissions.BasePermission):
    """
    Permission to check if user has COMPANY role
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsCompany]
    """
    message = 'This action is restricted to companies only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has COMPANY role"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['COMPANY', 'ADMIN', 'UIL']
        )


class IsAdvisor(permissions.BasePermission):
    """
    Permission to check if user has ADVISOR role
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsAdvisor]
    """
    message = 'This action is restricted to advisors only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has ADVISOR or higher role"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['ADVISOR', 'DEPARTMENT_HEAD', 'UIL', 'ADMIN']
        )


class IsDepartmentHead(permissions.BasePermission):
    """
    Permission to check if user has DEPARTMENT_HEAD role
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsDepartmentHead]
    """
    message = 'This action is restricted to department heads only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has DEPARTMENT_HEAD role"""
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', '') == 'DEPARTMENT_HEAD'
        )


class IsUIL(permissions.BasePermission):
    """
    Permission to check if user has UIL role
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsUIL]
    """
    message = 'This action is restricted to UIL only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has UIL role"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'UIL'
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission to check if user is an Admin (staff)
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsAdmin]
    """
    message = 'This action is restricted to administrators only.'
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is staff/admin"""
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff)
        )


class IsSameDepartment(permissions.BasePermission):
    """
    Permission to check if user belongs to the same department as the object
    
    This is an OBJECT-LEVEL permission.
    Admin and UIL bypass this check (they can access all departments).
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsSameDepartment]
        
    Important:
        - The object must have a 'department' attribute
        - OR the object must have a 'user' attribute with a 'department' attribute
        - Admin and UIL roles bypass this check
    """
    message = 'You can only access objects from your own department.'
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user belongs to the same department as the object
        
        Args:
            request: HTTP request
            view: View being accessed
            obj: Object being accessed
            
        Returns:
            Boolean indicating if user has permission
        """
        # Admin and UIL can access all departments
        if request.user.role in ['ADMIN', 'UIL']:
            return True
        
        # User must have a department
        if not request.user.department:
            return False
        
        # Try to get department from object
        obj_department = None
        
        # Case 1: Object has direct department attribute
        if hasattr(obj, 'department'):
            obj_department = obj.department
        
        # Case 2: Object has user with department
        elif hasattr(obj, 'user') and hasattr(obj.user, 'department'):
            obj_department = obj.user.department
        
        # Case 3: Object IS a user (check user's department)
        elif hasattr(obj, 'email') and hasattr(obj, 'role'):
            # This is likely a User object
            obj_department = obj.department
        
        # If no department found on object, deny access
        if not obj_department:
            return False
        
        # Check if departments match
        return request.user.department.id == obj_department.id


class IsOwner(permissions.BasePermission):
    """
    Permission to check if user owns the object
    
    This is an OBJECT-LEVEL permission.
    
    Usage:
        class MyView(UpdateAPIView):
            permission_classes = [IsAuthenticated, IsOwner]
    
    Important:
        - The object must have a 'user' attribute
        - Compares object.user with request.user
    """
    message = 'You can only access your own objects.'
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the object
        
        Args:
            request: HTTP request
            view: View being accessed
            obj: Object being accessed
            
        Returns:
            Boolean indicating if user owns the object
        """
        # Object must have user attribute
        if not hasattr(obj, 'user'):
            return False
        
        # Check if object belongs to requesting user
        return obj.user == request.user


class IsApprovedUser(permissions.BasePermission):
    """
    Permission to check if user is approved by UIL
    
    Admin and UIL bypass this check.
    
    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, IsApprovedUser]
    """
    message = 'Your account is pending approval. Please wait for UIL to review your registration.'
    
    def has_permission(self, request, view):
        """Check if user is approved"""
        # Admin and UIL don't need approval
        if request.user.role in ['ADMIN', 'UIL']:
            return True
        
        # Check if user is approved
        return request.user.is_approved


class CanManageDepartment(permissions.BasePermission):
    """
    Permission for department management actions
    
    Allowed roles: ADMIN, UIL, DEPARTMENT_HEAD (for own department only)
    
    Usage:
        class DepartmentManagementView(APIView):
            permission_classes = [IsAuthenticated, CanManageDepartment]
    """
    message = 'You do not have permission to manage departments.'
    
    def has_permission(self, request, view):
        """Check if user can manage departments"""
        return request.user.role in ['ADMIN', 'UIL', 'DEPARTMENT_HEAD']
    
    def has_object_permission(self, request, view, obj):
        """Check if user can manage this specific department"""
        # Admin and UIL can manage all departments
        if request.user.role in ['ADMIN', 'UIL']:
            return True
        
        # Department head can only manage their own department
        if request.user.role == 'DEPARTMENT_HEAD':
            return request.user.department == obj
        
        return False
