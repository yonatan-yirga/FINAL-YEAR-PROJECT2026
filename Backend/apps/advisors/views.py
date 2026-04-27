"""
Advisor Views
API endpoints for advisor functionality
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from apps.accounts.permissions import IsAdvisor
from apps.advisors.models import AdvisorAssignment, Feedback
from apps.advisors.serializers import (
    MyStudentSerializer,
    AdvisorAssignmentDetailSerializer,
    FeedbackSerializer,
    CreateFeedbackSerializer,
)
import logging

logger = logging.getLogger(__name__)


class AdvisorPagination(PageNumberPagination):
    """Custom pagination for advisor views"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class MyStudentsView(ListAPIView):
    """
    Get list of students assigned to current advisor
    GET /api/advisors/my-students/?active=true/false
    
    Permission: IsAdvisor
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    serializer_class = MyStudentSerializer
    pagination_class = AdvisorPagination
    
    def get_queryset(self):
        """Get students for current advisor"""
        # Get active filter from query params
        active_filter = self.request.query_params.get('active')
        
        # Start with all assignments for this advisor
        queryset = AdvisorAssignment.objects.get_advisor_students(
            advisor=self.request.user,
            active_only=False  # We'll filter manually
        )
        
        # Apply active filter if provided
        if active_filter is not None:
            if active_filter.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif active_filter.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        return queryset.order_by('-is_active', '-assigned_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to inject statistics into paginated response"""
        queryset = self.get_queryset()

        # Compute statistics on the FULL queryset before pagination
        stats = {
            'total_students': queryset.count(),
            'active_students': queryset.filter(is_active=True).count(),
            'completed_students': queryset.filter(is_active=False).count(),
        }

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['statistics'] = stats
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'statistics': stats,
        })


class StudentDetailView(RetrieveAPIView):
    """
    Get detailed information about a specific student
    GET /api/advisors/students/<id>/
    
    Permission: IsAdvisor (only for their own students)
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    serializer_class = AdvisorAssignmentDetailSerializer
    
    def get_object(self):
        """Get assignment for this advisor and student"""
        assignment_id = self.kwargs.get('pk')
        
        # Get assignment and verify advisor owns it
        assignment = get_object_or_404(
            AdvisorAssignment,
            id=assignment_id,
            advisor=self.request.user
        )
        
        return assignment
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to handle errors"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        except Exception as e:
            logger.error(f'Error fetching student detail: {str(e)}')
            return Response(
                {'error': 'Failed to fetch student details'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentFeedbackListView(ListAPIView):
    """
    Get all feedback for a specific student
    GET /api/advisors/students/<id>/feedback/
    
    Permission: IsAdvisor (only for their own students)
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    serializer_class = FeedbackSerializer
    
    def get_queryset(self):
        """Get feedback for this assignment"""
        assignment_id = self.kwargs.get('pk')
        
        # Verify advisor owns this assignment
        assignment = get_object_or_404(
            AdvisorAssignment,
            id=assignment_id,
            advisor=self.request.user
        )
        
        return Feedback.objects.filter(
            advisor_assignment=assignment
        ).order_by('-created_at')


class CreateFeedbackView(APIView):
    """
    Create feedback for a student
    POST /api/advisors/students/<id>/feedback/
    
    Body:
    {
        "feedback_text": "Your feedback here..."
    }
    
    Permission: IsAdvisor (only for their own students)
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    
    def post(self, request, pk):
        """Create new feedback"""
        try:
            # Verify advisor owns this assignment
            assignment = get_object_or_404(
                AdvisorAssignment,
                id=pk,
                advisor=request.user
            )
            
            # Validate assignment is active
            if not assignment.is_active:
                return Response(
                    {'error': 'Cannot add feedback to a completed assignment.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create feedback
            data = {
                'advisor_assignment': assignment.id,
                'feedback_text': request.data.get('feedback_text'),
            }
            
            serializer = CreateFeedbackSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                feedback = serializer.save()
                
                # Return created feedback
                response_serializer = FeedbackSerializer(feedback)
                
                return Response(
                    {
                        'message': 'Feedback created successfully',
                        'feedback': response_serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            logger.error(f'Error creating feedback: {str(e)}')
            return Response(
                {'error': 'Failed to create feedback'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkStudentCompletedView(APIView):
    """
    Mark a student's internship as completed
    POST /api/advisors/students/<id>/complete/
    
    Permission: IsAdvisor (only for their own students)
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    
    def post(self, request, pk):
        """Mark assignment as completed"""
        try:
            # Verify advisor owns this assignment
            assignment = get_object_or_404(
                AdvisorAssignment,
                id=pk,
                advisor=request.user,
                is_active=True
            )
            
            # Mark as completed
            assignment.complete()
            
            return Response(
                {
                    'message': 'Student internship marked as completed',
                    'assignment_id': assignment.id,
                    'completed_at': assignment.completed_at
                },
                status=status.HTTP_200_OK
            )
        
        except AdvisorAssignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found or already completed'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        except Exception as e:
            logger.error(f'Error completing assignment: {str(e)}')
            return Response(
                {'error': 'Failed to mark as completed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdvisorStatisticsView(APIView):
    """
    Get statistics for current advisor
    GET /api/advisors/statistics/
    
    Permission: IsAdvisor
    """
    permission_classes = [IsAuthenticated, IsAdvisor]
    
    def get(self, request):
        """Get advisor statistics"""
        try:
            advisor = request.user
            
            # Get all assignments
            all_assignments = AdvisorAssignment.objects.filter(advisor=advisor)
            active_assignments = all_assignments.filter(is_active=True)
            completed_assignments = all_assignments.filter(is_active=False)
            
            # Get feedback count
            total_feedback = Feedback.objects.filter(created_by=advisor).count()
            
            # Calculate average feedback per student
            avg_feedback = 0
            if all_assignments.count() > 0:
                avg_feedback = round(total_feedback / all_assignments.count(), 1)
            
            statistics = {
                'total_students': all_assignments.count(),
                'active_students': active_assignments.count(),
                'completed_students': completed_assignments.count(),
                'total_feedback_given': total_feedback,
                'average_feedback_per_student': avg_feedback,
                'current_workload': active_assignments.count(),
            }
            
            return Response(statistics, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f'Error fetching advisor statistics: {str(e)}')
            return Response(
                {'error': 'Failed to fetch statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )