"""
Recommendation Views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.internships.models import Internship
from apps.internships.serializers import InternshipListSerializer
from core.permissions import IsStudentOrUIL
from .engine import get_recommendation_engine


class RecommendedInternshipsView(APIView):
    """
    GET /api/recommendations/internships/
    
    Get personalized internship recommendations for current student
    Uses TF-IDF + Cosine Similarity to match student skills with internship requirements
    
    Permissions: Students only
    
    Query Parameters:
    - limit: Maximum number of recommendations (default: 20, max: 50)
    - min_match: Minimum match percentage to include (default: 0, range: 0-100)
    
    Returns:
        List of internships ranked by match percentage (highest first)
        Each internship includes 'match_percentage' field
    
    Example Response:
    [
        {
            "id": 1,
            "title": "Backend Developer Intern",
            "company_name": "Tech Corp",
            "location": "Addis Ababa",
            "match_percentage": 85.5,
            ...
        },
        ...
    ]
    """
    
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    
    def get(self, request):
        """Get personalized recommendations for current student"""
        try:
            # Get current user
            user = request.user
            
            # UIL/Admin can't use this endpoint (it's for students)
            if user.role in ['UIL', 'ADMIN'] or user.is_staff:
                return Response(
                    {'error': 'This endpoint is for students only.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get student profile and skills
            try:
                student_profile = user.student_profile
                student_skills = student_profile.skills
            except Exception:
                return Response(
                    {'error': 'Student profile not found or skills not set.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate student has skills
            if not student_skills or not student_skills.strip():
                return Response(
                    {
                        'message': 'You have not set your skills yet. Please update your profile.',
                        'recommendations': []
                    },
                    status=status.HTTP_200_OK
                )
            
            # Get query parameters
            limit = int(request.query_params.get('limit', 20))
            min_match = float(request.query_params.get('min_match', 0))
            
            # Validate parameters
            if limit < 1 or limit > 50:
                limit = 20
            if min_match < 0 or min_match > 100:
                min_match = 0
            
            # Get available internships in student's department
            internships = Internship.objects.filter(
                department=user.department,
                status='OPEN',
                is_active=True
            ).select_related(
                'company',
                'company__company_profile',
                'department'
            ).prefetch_related('applications')
            
            # Check if any internships available
            if not internships.exists():
                return Response(
                    {
                        'message': 'No internships available in your department at the moment.',
                        'recommendations': []
                    },
                    status=status.HTTP_200_OK
                )
            
            # Get recommendation engine
            engine = get_recommendation_engine()
            
            # Get recommendations
            recommendations = engine.get_recommendations(student_skills, internships)
            
            # Filter by minimum match percentage
            if min_match > 0:
                recommendations = [
                    (internship, match) for internship, match in recommendations
                    if match >= min_match
                ]
            
            # Apply limit
            recommendations = recommendations[:limit]
            
            # Serialize results
            results = []
            for internship, match_percentage in recommendations:
                # Serialize internship
                data = InternshipListSerializer(internship).data
                
                # Add match percentage
                data['match_percentage'] = match_percentage
                
                # Add explanation (for transparency)
                data['can_apply'] = internship.can_apply(user)[0]
                
                results.append(data)
            
            return Response({
                'count': len(results),
                'student_skills': student_skills,
                'recommendations': results
            }, status=status.HTTP_200_OK)
        
        except ValueError as e:
            return Response(
                {'error': f'Invalid query parameter: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate recommendations: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExplainRecommendationView(APIView):
    """
    GET /api/recommendations/explain/<internship_id>/
    
    Explain why an internship matches the student's profile
    Shows common skills, missing skills, and match details
    
    Permissions: Students only
    
    Returns:
        Detailed explanation of the match
    """
    
    permission_classes = [IsAuthenticated, IsStudentOrUIL]
    
    def get(self, request, internship_id):
        """Explain match for specific internship"""
        try:
            user = request.user
            
            # Get student skills
            try:
                student_skills = user.student_profile.skills
            except Exception:
                return Response(
                    {'error': 'Student profile not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get internship
            try:
                internship = Internship.objects.get(id=internship_id)
            except Internship.DoesNotExist:
                return Response(
                    {'error': 'Internship not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate same department
            if internship.department != user.department:
                return Response(
                    {'error': 'This internship is not in your department.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get explanation
            engine = get_recommendation_engine()
            explanation = engine.explain_match(student_skills, internship.required_skills)
            
            # Add internship info
            explanation['internship'] = {
                'id': internship.id,
                'title': internship.title,
                'company_name': internship.get_company_name(),
                'required_skills': internship.required_skills,
            }
            explanation['student_skills'] = student_skills
            
            return Response(explanation, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to explain recommendation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )