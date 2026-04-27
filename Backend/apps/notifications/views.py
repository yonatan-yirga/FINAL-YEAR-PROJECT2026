"""
Notification Views
API endpoints for notification management
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Notification
from .serializers import NotificationSerializer, UnreadCountSerializer
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)


class NotificationPagination(PageNumberPagination):
    """Custom pagination for notifications"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationListView(ListAPIView):
    """
    List all notifications for current user
    GET /api/notifications/?read=true/false
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        """Get notifications for current user with optional read filter"""
        queryset = Notification.objects.filter(recipient=self.request.user)
        
        # Filter by read status if provided
        read_filter = self.request.query_params.get('read')
        if read_filter is not None:
            if read_filter.lower() == 'true':
                queryset = queryset.filter(is_read=True)
            elif read_filter.lower() == 'false':
                queryset = queryset.filter(is_read=False)
        
        return queryset.order_by('-created_at')


class UnreadCountView(APIView):
    """
    Get count of unread notifications
    GET /api/notifications/unread-count/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return unread notification count"""
        try:
            count = NotificationService.get_unread_count(request.user)
            
            serializer = UnreadCountSerializer({'unread_count': count})
            
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            logger.error(f'Failed to get unread count: {str(e)}')
            return Response(
                {'error': 'Failed to fetch unread count'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkAsReadView(APIView):
    """
    Mark single notification as read
    POST /api/notifications/<id>/mark-read/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        """Mark notification as read"""
        try:
            success, error = NotificationService.mark_notification_as_read(
                notification_id=pk,
                user=request.user
            )
            
            if success:
                return Response(
                    {'message': 'Notification marked as read'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': error},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        except Exception as e:
            logger.error(f'Failed to mark notification as read: {str(e)}')
            return Response(
                {'error': 'An error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkAllReadView(APIView):
    """
    Mark all notifications as read
    POST /api/notifications/mark-all-read/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Mark all user notifications as read"""
        try:
            updated_count, error = NotificationService.mark_all_as_read(request.user)
            
            if error:
                return Response(
                    {'error': error},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(
                {
                    'message': 'All notifications marked as read',
                    'count': updated_count
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            logger.error(f'Failed to mark all as read: {str(e)}')
            return Response(
                {'error': 'An error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeleteNotificationView(DestroyAPIView):
    """
    Delete single notification
    DELETE /api/notifications/<id>/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Only allow users to delete their own notifications"""
        return Notification.objects.filter(recipient=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Delete notification"""
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            
            return Response(
                {'message': 'Notification deleted successfully'},
                status=status.HTTP_200_OK
            )
        
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        except Exception as e:
            logger.error(f'Failed to delete notification: {str(e)}')
            return Response(
                {'error': 'An error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecentNotificationsView(APIView):
    """
    Get recent notifications (for notification bell dropdown)
    GET /api/notifications/recent/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return last 5 notifications"""
        try:
            notifications = Notification.objects.filter(
                recipient=request.user
            ).order_by('-created_at')[:5]
            
            serializer = NotificationSerializer(notifications, many=True)
            
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            logger.error(f'Failed to fetch recent notifications: {str(e)}')
            return Response(
                {'error': 'Failed to fetch notifications'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )