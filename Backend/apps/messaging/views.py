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
    Supports students, advisors, and companies.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Build query based on user role
        if user.role == 'COMPANY':
            # Company sees assignments for their internships
            assignments = AdvisorAssignment.objects.filter(
                internship__company=user
            ).select_related(
                'student', 'student__student_profile',
                'advisor', 'advisor__advisor_profile',
                'internship', 'internship__company__company_profile',
            ).order_by('-updated_at')
        else:
            # Student or Advisor
            assignments = AdvisorAssignment.objects.filter(
                Q(student=user) | Q(advisor=user)
            ).select_related(
                'student', 'student__student_profile',
                'advisor', 'advisor__advisor_profile',
                'internship', 'internship__company__company_profile',
            ).order_by('-updated_at')

        conversations = []
        for a in assignments:
            last_msg = a.messages.order_by('-created_at').first()
            unread = a.messages.filter(is_read=False).exclude(sender=user).count()

            # Determine display info based on current user role
            if user.role == 'COMPANY':
                # Company sees student and advisor info
                student_name = getattr(a.student, 'student_profile', None)
                student_name = student_name.full_name if student_name else a.student.email
                advisor_name = getattr(a.advisor, 'advisor_profile', None)
                advisor_name = advisor_name.full_name if advisor_name else a.advisor.email
                
                conversations.append({
                    'assignment_id': a.id,
                    'student_name': student_name,
                    'student_id': a.student.id,
                    'advisor_name': advisor_name,
                    'advisor_id': a.advisor.id,
                    'internship_title': a.internship.title if a.internship else '',
                    'is_active': a.is_active,
                    'unread_count': unread,
                    'last_message': last_msg.content[:80] if last_msg else None,
                    'last_message_at': last_msg.created_at if last_msg else a.created_at,
                    'user_role': 'COMPANY',
                })
            elif user == a.student:
                # Student sees advisor and company
                advisor_name = getattr(a.advisor, 'advisor_profile', None)
                advisor_name = advisor_name.full_name if advisor_name else a.advisor.email
                company_name = ''
                if a.internship and a.internship.company:
                    try:
                        company_name = a.internship.company.company_profile.company_name
                    except:
                        company_name = a.internship.company.email
                
                conversations.append({
                    'assignment_id': a.id,
                    'other_name': advisor_name,
                    'other_role': 'ADVISOR',
                    'company_name': company_name,
                    'internship_title': a.internship.title if a.internship else '',
                    'is_active': a.is_active,
                    'unread_count': unread,
                    'last_message': last_msg.content[:80] if last_msg else None,
                    'last_message_at': last_msg.created_at if last_msg else a.created_at,
                    'user_role': 'STUDENT',
                })
            else:
                # Advisor sees student and company
                student_name = getattr(a.student, 'student_profile', None)
                student_name = student_name.full_name if student_name else a.student.email
                company_name = ''
                if a.internship and a.internship.company:
                    try:
                        company_name = a.internship.company.company_profile.company_name
                    except:
                        company_name = a.internship.company.email
                
                conversations.append({
                    'assignment_id': a.id,
                    'other_name': student_name,
                    'other_role': 'STUDENT',
                    'company_name': company_name,
                    'internship_title': a.internship.title if a.internship else '',
                    'is_active': a.is_active,
                    'unread_count': unread,
                    'last_message': last_msg.content[:80] if last_msg else None,
                    'last_message_at': last_msg.created_at if last_msg else a.created_at,
                    'user_role': 'ADVISOR',
                })

        # Sort by last message time
        conversations.sort(key=lambda c: c['last_message_at'], reverse=True)
        return Response(conversations)


class MessageListView(APIView):
    """
    GET /api/messages/<assignment_id>/
    Returns all messages for a specific advisor assignment.
    Also marks all unread messages from the other parties as read.
    Supports students, advisors, and companies.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        user = request.user

        try:
            assignment = AdvisorAssignment.objects.select_related(
                'student', 'student__student_profile',
                'advisor', 'advisor__advisor_profile',
                'internship', 'internship__company__company_profile',
            ).get(pk=assignment_id)
        except AdvisorAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify user is part of this assignment
        is_company = (assignment.internship and user == assignment.internship.company)
        is_participant = (user == assignment.student or user == assignment.advisor or is_company)
        
        if not is_participant:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Mark unread messages from OTHER parties as read
        Message.objects.filter(
            advisor_assignment=assignment, is_read=False
        ).exclude(sender=user).update(is_read=True)

        # Return all messages
        messages = Message.objects.filter(
            advisor_assignment=assignment
        ).select_related('sender', 'sender__student_profile', 'sender__advisor_profile', 'sender__company_profile').order_by('created_at')

        serializer = MessageSerializer(messages, many=True, context={'request': request})

        # Build conversation header info with all participants
        student_name = getattr(assignment.student, 'student_profile', None)
        student_name = student_name.full_name if student_name else assignment.student.email
        
        advisor_name = getattr(assignment.advisor, 'advisor_profile', None)
        advisor_name = advisor_name.full_name if advisor_name else assignment.advisor.email
        
        company_name = ''
        company_id = None
        if assignment.internship and assignment.internship.company:
            try:
                company_name = assignment.internship.company.company_profile.company_name
                company_id = assignment.internship.company.id
            except:
                company_name = assignment.internship.company.email
                company_id = assignment.internship.company.id

        return Response({
            'assignment_id': assignment.id,
            'student_name': student_name,
            'student_id': assignment.student.id,
            'advisor_name': advisor_name,
            'advisor_id': assignment.advisor.id,
            'company_name': company_name,
            'company_id': company_id,
            'internship_title': assignment.internship.title if assignment.internship else '',
            'messages': serializer.data,
        })


class SendMessageView(APIView):
    """
    POST /api/messages/send/
    Body: { "assignment_id": 1, "content": "Hello!" }
    Supports students, advisors, and companies.
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
            assignment = AdvisorAssignment.objects.select_related(
                'student', 'advisor', 'internship__company'
            ).get(pk=assignment_id)
        except AdvisorAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify sender is part of this assignment
        is_company = (assignment.internship and user == assignment.internship.company)
        is_participant = (user == assignment.student or user == assignment.advisor or is_company)
        
        if not is_participant:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        msg = Message.objects.create(
            advisor_assignment=assignment,
            sender=user,
            content=content,
        )

        # Send notifications to all OTHER participants
        try:
            from apps.notifications.services import NotificationService
            
            # Get sender name
            sender_name = ''
            if user.role == 'STUDENT':
                sender_name = getattr(user, 'student_profile', None)
                sender_name = sender_name.full_name if sender_name else user.email
            elif user.role == 'ADVISOR':
                sender_name = getattr(user, 'advisor_profile', None)
                sender_name = sender_name.full_name if sender_name else user.email
            elif user.role == 'COMPANY':
                sender_name = getattr(user, 'company_profile', None)
                sender_name = sender_name.company_name if sender_name else user.email
            
            # Notify all participants except sender
            recipients = []
            if user != assignment.student:
                recipients.append((assignment.student, '/student/messages'))
            if user != assignment.advisor:
                recipients.append((assignment.advisor, '/advisor/messages'))
            if assignment.internship and assignment.internship.company and user != assignment.internship.company:
                recipients.append((assignment.internship.company, '/company/messages'))
            
            for recipient, link in recipients:
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


class EditMessageView(APIView):
    """
    PUT /api/messages/<message_id>/edit/
    Body: { "content": "Updated message" }
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, message_id):
        user = request.user

        try:
            message = Message.objects.get(pk=message_id)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the sender can edit their own message
        if message.sender != user:
            return Response({'error': 'You can only edit your own messages.'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        message.content = content
        message.save()

        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data)


class DeleteMessageView(APIView):
    """
    DELETE /api/messages/<message_id>/delete/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        user = request.user

        try:
            message = Message.objects.get(pk=message_id)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the sender can delete their own message
        if message.sender != user:
            return Response({'error': 'You can only delete your own messages.'}, status=status.HTTP_403_FORBIDDEN)

        message.delete()
        return Response({'success': True, 'message': 'Message deleted successfully.'}, status=status.HTTP_200_OK)
