"""
Internship Views
"""
from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Internship
from .serializers import (
    InternshipSerializer,
    InternshipListSerializer,
    InternshipDetailSerializer,
)
from core.permissions import (
    IsSameDepartmentOrUIL,
    IsCompanyOrUIL,
    IsOwnerOrUIL,
)


class InternshipListView(generics.ListAPIView):
    """
    GET /api/internships/

    List all active internships in user's department

    Query Parameters:
    - search: Search by title or skills
    - status: Filter by status (OPEN, CLOSED, FILLED)
    - location: Filter by location (contains)
    - start_date_from: Filter internships starting from this date
    - start_date_to: Filter internships starting before this date
    - duration_months: Filter by duration
    - ordering: Sort by field (created_at, start_date, title)

    Permissions: Authenticated users
    Department Filtering: Automatic
    Pagination: 20 per page
    """

    serializer_class = InternshipListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get internships based on user's department"""
        user = self.request.user

        # UIL and Admin can see all internships
        if user.is_staff or user.role == 'UIL':
            queryset = Internship.objects.filter(is_active=True)
        else:
            # Others see only their department's internships
            queryset = Internship.objects.filter(
                department=user.department,
                is_active=True
            )

        # Select related to optimize queries
        queryset = queryset.select_related(
            'company',
            'company__company_profile',
            'department'
        ).prefetch_related('applications')

        # Apply filters
        queryset = self._apply_filters(queryset)

        return queryset

    def _apply_filters(self, queryset):
        """Apply query parameter filters"""
        # Search by title or skills
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(required_skills__icontains=search)
            )

        # Filter by company ID (for department head assignment)
        company_id = self.request.query_params.get('company_id', None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Filter by start date range
        start_date_from = self.request.query_params.get('start_date_from', None)
        if start_date_from:
            queryset = queryset.filter(start_date__gte=start_date_from)

        start_date_to = self.request.query_params.get('start_date_to', None)
        if start_date_to:
            queryset = queryset.filter(start_date__lte=start_date_to)

        # Filter by duration
        duration = self.request.query_params.get('duration_months', None)
        if duration:
            queryset = queryset.filter(duration_months=duration)

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = [
            'created_at', '-created_at',
            'start_date', '-start_date',
            'title', '-title',
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        return queryset


class InternshipDetailView(generics.RetrieveAPIView):
    """
    GET /api/internships/<id>/

    Get detailed information about a specific internship

    Permissions: Authenticated, same department
    """

    serializer_class = InternshipDetailSerializer
    permission_classes = [IsAuthenticated, IsSameDepartmentOrUIL]
    queryset = Internship.objects.select_related(
        'company',
        'company__company_profile',
        'department'
    ).prefetch_related('applications')


class CreateInternshipView(generics.CreateAPIView):
    """
    POST /api/internships/create/

    Create a new internship posting

    Request Body:
    {
        "title": "Software Developer Intern",
        "description": "...",
        "required_skills": "Python, Django, React",
        "location": "Addis Ababa",
        "duration_months": 6,
        "start_date": "2026-06-01",
        "end_date": "2026-11-30",
        "max_applicants": 5,
        "application_deadline": "2026-05-15"
    }

    Permissions: Company users only
    Auto-sets: company = request.user, department = request.user.department
    """

    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrUIL]

    def perform_create(self, serializer):
        """Auto-set company and department from request user"""
        user = self.request.user

        if not user.department:
            raise serializers.ValidationError({
                'error': (
                    'Your account does not have a department assigned. '
                    'Please contact the department head or UIL.'
                )
            })

        try:
            serializer.save(
                company=user,
                department=user.department,
            )
        except Exception as e:
            raise serializers.ValidationError({
                'error': f'Failed to create internship: {str(e)}'
            })


class UpdateInternshipView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/internships/<id>/update/

    Update an existing internship

    Permissions: Company owner or UIL
    Validation: Cannot change company or department
    """

    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrUIL, IsOwnerOrUIL]
    queryset = Internship.objects.all()

    def get_queryset(self):
        """Filter to user's own internships (except UIL/Admin)"""
        user = self.request.user

        if user.is_staff or user.role == 'UIL':
            return Internship.objects.all()

        # Companies can only update their own internships
        return Internship.objects.filter(company=user)

    def perform_update(self, serializer):
        """Ensure company and department cannot be changed"""
        serializer.save(
            company=serializer.instance.company,
            department=serializer.instance.department,
        )


class DeleteInternshipView(generics.DestroyAPIView):
    """
    DELETE /api/internships/<id>/delete/

    Soft delete an internship (sets is_active=False)

    Permissions: Company owner or UIL
    Note: Does not delete from DB, just marks as inactive
    """

    permission_classes = [IsAuthenticated, IsCompanyOrUIL, IsOwnerOrUIL]
    queryset = Internship.objects.all()

    def get_queryset(self):
        """Filter to user's own internships (except UIL/Admin)"""
        user = self.request.user

        if user.is_staff or user.role == 'UIL':
            return Internship.objects.all()

        return Internship.objects.filter(company=user)

    def perform_destroy(self, instance):
        """Soft delete — set is_active=False instead of hard delete"""
        instance.is_active = False
        instance.save()


class MyInternshipsView(generics.ListAPIView):
    """
    GET /api/internships/my-internships/

    List all internships posted by the current company user
    Includes open, closed, and filled internships

    Permissions: Company users only
    """

    serializer_class = InternshipListSerializer
    permission_classes = [IsAuthenticated, IsCompanyOrUIL]

    def get_queryset(self):
        """Get current user's posted internships"""
        user = self.request.user

        # UIL has no "my internships" — return empty
        if user.role == 'UIL' or user.is_staff:
            return Internship.objects.none()

        # Only company's own internships (including inactive/closed)
        return Internship.objects.filter(
            company=user
        ).select_related(
            'company',
            'company__company_profile',
            'department'
        ).prefetch_related(
            'applications'
        ).order_by('-created_at')


# ─── Utility function-based views ────────────────────────────────────────────

@api_view(['POST'])
def close_internship(request, pk):
    """
    POST /api/internships/<id>/close/

    Close an internship (no new applications accepted)

    Permissions: Company owner or UIL/Admin
    """
    user = request.user

    if user.role not in ['COMPANY', 'UIL', 'ADMIN'] and not user.is_staff:
        return Response(
            {'error': 'Only companies can close internships.'},
            status=status.HTTP_403_FORBIDDEN
        )

    internship = get_object_or_404(Internship, pk=pk)

    # Companies can only close their own internships
    if user.role == 'COMPANY' and internship.company != user:
        return Response(
            {'error': 'You can only close your own internships.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        internship.close()
        return Response({
            'message': 'Internship closed successfully.',
            'internship': InternshipDetailSerializer(internship).data,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to close internship: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def reopen_internship(request, pk):
    """
    POST /api/internships/<id>/reopen/

    Reopen a previously closed internship

    Permissions: Company owner or UIL/Admin
    """
    user = request.user

    if user.role not in ['COMPANY', 'UIL', 'ADMIN'] and not user.is_staff:
        return Response(
            {'error': 'Only companies can reopen internships.'},
            status=status.HTTP_403_FORBIDDEN
        )

    internship = get_object_or_404(Internship, pk=pk)

    # Companies can only reopen their own internships
    if user.role == 'COMPANY' and internship.company != user:
        return Response(
            {'error': 'You can only reopen your own internships.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        internship.reopen()
        return Response({
            'message': 'Internship reopened successfully.',
            'internship': InternshipDetailSerializer(internship).data,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to reopen internship: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ─── Public Views (No Authentication Required) ───────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def public_internships_list(request):
    """
    GET /api/internships/public/

    List all open internships for public viewing (landing page, etc.)
    No authentication required

    Query Parameters:
    - search: Search by title or skills
    - location: Filter by location
    - ordering: Sort by field (default: -created_at)

    Returns: List of open internships with basic information
    """
    try:
        # Get all open and active internships
        queryset = Internship.objects.filter(
            is_active=True,
            status='OPEN'
        ).select_related(
            'company',
            'company__company_profile',
            'department'
        ).prefetch_related('applications')

        # Apply filters
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(required_skills__icontains=search)
            )

        location = request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'start_date', '-start_date', 'title', '-title']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        # Serialize and return
        serializer = InternshipListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to fetch internships: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )