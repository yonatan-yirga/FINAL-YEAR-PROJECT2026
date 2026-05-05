"""
Agora Token Generation Views - No Certificate Version
For testing when App Certificate is not enabled
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import random

# Agora credentials
AGORA_APP_ID = '19fa6bc3e79140d596e36afda2045b97'


class GenerateAgoraTokenView(APIView):
    """
    Generate Agora RTC token (No Certificate Mode)
    
    When App Certificate is not enabled in Agora console,
    you can join channels without a token (use null)
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
            
            # When certificate is not enabled, return null token
            return Response({
                'token': None,  # No token needed when certificate is disabled
                'appId': AGORA_APP_ID,
                'channelName': channel_name,
                'uid': uid,
                'message': 'No certificate mode - join without token'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
