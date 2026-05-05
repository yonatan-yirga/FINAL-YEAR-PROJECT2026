"""
Agora Token Generation Views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from agora_token_builder import RtcTokenBuilder
import time
import random

# Agora credentials
AGORA_APP_ID = '19fa6bc3e79140d596e36afda2045b97'
AGORA_APP_CERTIFICATE = '2dcc1585f5104831aa3f7abb3e4d2e99'  # Primary certificate


class GenerateAgoraTokenView(APIView):
    """
    Generate Agora RTC token for video/audio calls
    
    POST /api/messages/agora/token/
    
    Request:
        {
            "channelName": "assignment_123",
            "uid": 0  // Optional, 0 for auto-assign
        }
    
    Response:
        {
            "token": "007eJxTYJgX...",
            "appId": "19fa6bc3e79140d596e36afda2045b97",
            "channelName": "assignment_123",
            "uid": 12345,
            "expiresAt": 1735689600
        }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get parameters
            channel_name = request.data.get('channelName')
            uid = request.data.get('uid', 0)
            
            if not channel_name:
                return Response(
                    {'error': 'channelName is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate UID if not provided
            if uid == 0:
                uid = random.randint(1, 999999)
            
            # Token expiration time (24 hours from now)
            expiration_time_in_seconds = 3600 * 24
            current_timestamp = int(time.time())
            privilege_expired_ts = current_timestamp + expiration_time_in_seconds
            
            # Generate token with certificate
            # Role: 1 = Publisher (can send and receive streams)
            token = RtcTokenBuilder.buildTokenWithUid(
                AGORA_APP_ID,
                AGORA_APP_CERTIFICATE,
                channel_name,
                uid,
                1,  # Role: Publisher
                privilege_expired_ts
            )
            
            print(f"✅ Token generated successfully!")
            print(f"   Channel: {channel_name}")
            print(f"   UID: {uid}")
            print(f"   Token: {token[:20]}...")
            print(f"   Expires: {privilege_expired_ts}")
            
            return Response({
                'token': token,
                'appId': AGORA_APP_ID,
                'channelName': channel_name,
                'uid': uid,
                'expiresAt': privilege_expired_ts
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CallNotificationView(APIView):
    """
    Send call notification to another user
    
    POST /api/messages/agora/notify/
    
    Request:
        {
            "targetUserId": 94,
            "channelName": "assignment_123",
            "callType": "video"  // or "audio"
        }
    
    Response:
        {
            "success": true,
            "message": "Notification sent"
        }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            target_user_id = request.data.get('targetUserId')
            channel_name = request.data.get('channelName')
            call_type = request.data.get('callType', 'video')
            
            if not target_user_id or not channel_name:
                return Response(
                    {'error': 'targetUserId and channelName are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # TODO: Implement notification system
            # For now, just return success
            # In production, you would:
            # 1. Send push notification
            # 2. Send email notification
            # 3. Store notification in database
            
            return Response({
                'success': True,
                'message': 'Notification sent',
                'targetUserId': target_user_id,
                'channelName': channel_name,
                'callType': call_type,
                'callerName': request.user.email
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
