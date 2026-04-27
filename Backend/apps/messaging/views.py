"""
Messaging Views
Endpoints for student-advisor communication.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer, SendMessageSerializer
from apps.advisors.models import AdvisorAssignment


class ConversationListView(APIView):
    """
    GET /api/messages/conversations/
    Returns all advisor assignments the current user is part of,
    with the latest message preview.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        assignments = AdvisorAssignment.objects.filter(
            Q(student=user) | Q(advisor=user)
        ).select_related(
            'student', 'student__student_profile',
            'advisor', 'advisor__advisor_profile',
            'internship',
        ).order_by('-updated_at')

        conversations = []
        for a in assignments:
            last_msg = a.messages.order_by('-created_at').first()
            unread = a.messages.filter(is_read=False).exclude(sender=user).count()

            # Determine the other party
            if user == a.student:
                other_name = getattr(a.advisor, 'advisor_profile', None)
                other_name = other_name.full_name if other_name else a.advisor.email
                other_role = 'ADVISOR'
            else:
                other_name = getattr(a.student, 'student_profile', None)
                other_name = other_name.full_name if other_name else a.student.email
                other_role = 'STUDENT'

            conversations.append({
                'assignment_id': a.id,
                'other_name': other_name,
                'other_role': other_role,
                'internship_title': a.internship.title if a.internship else '',
                'is_active': a.is_active,
                'unread_count': unread,
                'last_message': last_msg.content[:80] if last_msg else None,
                'last_message_at': last_msg.created_at if last_msg else a.created_at,
            })

        # Sort by last message time
        conversations.sort(key=lambda c: c['last_message_at'], reverse=True)
        return Response(conversations)


class MessageListView(APIView):
    """
    GET /api/messages/<assignment_id>/
    Returns all messages for a specific advisor assignment.
    Also marks all unread messages from the other party as read.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        user = request.user

        try:
            assignment = AdvisorAssignment.objects.get(pk=assignment_id)
        except AdvisorAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify user is part of this assignment
        if user != assignment.student and user != assignment.advisor:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Mark unread messages from the OTHER party as read
        Message.objects.filter(
            advisor_assignment=assignment, is_read=False
        ).exclude(sender=user).update(is_read=True)

        # Return all messages
        messages = Message.objects.filter(
            advisor_assignment=assignment
        ).select_related('sender').order_by('created_at')

        serializer = MessageSerializer(messages, many=True, context={'request': request})

        # Build conversation header info
        if user == assignment.student:
            other_user = assignment.advisor
            other_name = getattr(assignment.advisor, 'advisor_profile', None)
            other_name = other_name.full_name if other_name else assignment.advisor.email
        else:
            other_user = assignment.student
            other_name = getattr(assignment.student, 'student_profile', None)
            other_name = other_name.full_name if other_name else assignment.student.email

        return Response({
            'assignment_id': assignment.id,
            'other_name': other_name,
            'other_user_id': other_user.id,  # Add user ID for WebRTC calling
            'internship_title': assignment.internship.title if assignment.internship else '',
            'messages': serializer.data,
        })


class SendMessageView(APIView):
    """
    POST /api/messages/send/
    Body: { "assignment_id": 1, "content": "Hello!" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        assignment_id = serializer.validated_data['assignment_id']
        content = serializer.validated_data['content']
        user = request.user

        try:
            assignment = AdvisorAssignment.objects.get(pk=assignment_id)
        except AdvisorAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify sender is part of this assignment
        if user != assignment.student and user != assignment.advisor:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        msg = Message.objects.create(
            advisor_assignment=assignment,
            sender=user,
            content=content,
        )

        # Send notification to the other party
        try:
            from apps.notifications.services import NotificationService
            recipient = assignment.advisor if user == assignment.student else assignment.student
            sender_name = ''
            if user.role == 'STUDENT':
                sender_name = getattr(user, 'student_profile', None)
                sender_name = sender_name.full_name if sender_name else user.email
            else:
                sender_name = getattr(user, 'advisor_profile', None)
                sender_name = sender_name.full_name if sender_name else user.email

            link = '/advisor/messages' if recipient.role == 'ADVISOR' else '/student/messages'
            NotificationService.create_notification(
                recipient=recipient,
                title='New Message',
                message=f'{sender_name}: {content[:100]}',
                notification_type='MESSAGE_RECEIVED',
                link=link,
            )
        except Exception:
            pass  # Notification failure is non-fatal

        result = MessageSerializer(msg, context={'request': request})
        return Response(result.data, status=status.HTTP_201_CREATED)
