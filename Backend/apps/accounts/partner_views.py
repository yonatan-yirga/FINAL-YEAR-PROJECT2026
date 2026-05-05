"""
Partner Organizations Views
Endpoints for viewing partner companies/organizations
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .models import User
from .serializers import CompanyProfileSerializer


class PartnerOrganizationsView(APIView):
    """
    GET /api/accounts/partner-organizations/
    Returns list of all approved partner companies
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all partner organizations with statistics"""
        try:
            # Get all approved companies
            companies = User.objects.filter(
                role='COMPANY',
                is_approved=True,
                is_active=True
            ).select_related('company_profile').annotate(
                total_internships=Count('posted_internships'),
                active_internships=Count(
                    'posted_internships',
                    filter=Q(posted_internships__status='OPEN')
                ),
                total_applications=Count('posted_internships__applications')
            ).order_by('-created_at')
            
            # Build response data
            partners = []
            for company in companies:
                try:
                    profile = company.company_profile
                    partners.append({
                        'id': company.id,
                        'company_name': profile.company_name,
                        'email': company.email,
                        'phone_number': profile.phone_number,
                        'city': profile.city,
                        'address': profile.address,
                        'description': profile.description,
                        'contact_person_name': profile.contact_person_name,
                        'contact_person_title': profile.contact_person_title,
                        'company_logo': request.build_absolute_uri(profile.company_logo.url) if profile.company_logo else None,
                        'total_internships': company.total_internships,
                        'active_internships': company.active_internships,
                        'total_applications': company.total_applications,
                        'joined_date': company.created_at.strftime('%B %Y'),
                        'is_active': company.is_active,
                    })
                except Exception as e:
                    # Skip companies without profiles
                    continue
            
            return Response({
                'success': True,
                'count': len(partners),
                'data': partners
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to fetch partner organizations',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PartnerOrganizationDetailView(APIView):
    """
    GET /api/accounts/partner-organizations/<id>/
    Returns detailed information about a specific partner organization
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """Get detailed information about a partner organization"""
        try:
            company = User.objects.filter(
                id=pk,
                role='COMPANY',
                is_approved=True,
                is_active=True
            ).select_related('company_profile').annotate(
                total_internships=Count('posted_internships'),
                active_internships=Count(
                    'posted_internships',
                    filter=Q(posted_internships__status='OPEN')
                ),
                closed_internships=Count(
                    'posted_internships',
                    filter=Q(posted_internships__status='CLOSED')
                ),
                total_applications=Count('posted_internships__applications'),
                accepted_applications=Count(
                    'posted_internships__applications',
                    filter=Q(posted_internships__applications__status='ACCEPTED')
                )
            ).first()
            
            if not company:
                return Response({
                    'success': False,
                    'error': 'Partner organization not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            try:
                profile = company.company_profile
                
                # Get recent internships
                recent_internships = company.posted_internships.all().order_by('-created_at')[:5]
                internships_data = [{
                    'id': internship.id,
                    'title': internship.title,
                    'status': internship.status,
                    'duration_months': internship.duration_months,
                    'created_at': internship.created_at.strftime('%B %d, %Y'),
                } for internship in recent_internships]
                
                data = {
                    'id': company.id,
                    'company_name': profile.company_name,
                    'email': company.email,
                    'phone_number': profile.phone_number,
                    'city': profile.city,
                    'address': profile.address,
                    'description': profile.description,
                    'contact_person_name': profile.contact_person_name,
                    'contact_person_title': profile.contact_person_title,
                    'company_logo': request.build_absolute_uri(profile.company_logo.url) if profile.company_logo else None,
                    'total_internships': company.total_internships,
                    'active_internships': company.active_internships,
                    'closed_internships': company.closed_internships,
                    'total_applications': company.total_applications,
                    'accepted_applications': company.accepted_applications,
                    'joined_date': company.created_at.strftime('%B %Y'),
                    'is_active': company.is_active,
                    'recent_internships': internships_data,
                }
                
                return Response({
                    'success': True,
                    'data': data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'error': 'Failed to fetch company profile',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to fetch partner organization details',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PartnerOrganizationsStatsView(APIView):
    """
    GET /api/accounts/partner-organizations/stats/
    Returns statistics about partner organizations
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get partner organizations statistics"""
        try:
            total_partners = User.objects.filter(
                role='COMPANY',
                is_approved=True,
                is_active=True
            ).count()
            
            total_internships = 0
            active_internships = 0
            total_applications = 0
            
            companies = User.objects.filter(
                role='COMPANY',
                is_approved=True,
                is_active=True
            ).annotate(
                internship_count=Count('posted_internships'),
                active_count=Count(
                    'posted_internships',
                    filter=Q(posted_internships__status='OPEN')
                ),
                application_count=Count('posted_internships__applications')
            )
            
            for company in companies:
                total_internships += company.internship_count
                active_internships += company.active_count
                total_applications += company.application_count
            
            return Response({
                'success': True,
                'data': {
                    'total_partners': total_partners,
                    'total_internships': total_internships,
                    'active_internships': active_internships,
                    'total_applications': total_applications,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to fetch statistics',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
