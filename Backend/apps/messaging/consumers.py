"""
WebSocket Consumer for Real-Time Calling
Handles WebRTC signaling for video/audio calls
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class CallConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling call signaling
    """
    
    async def connect(self):
        """Accept WebSocket connection"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create a unique room for this user
        self.room_name = f"user_{self.user.id}"
        self.room_group_name = f"call_{self.room_name}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify user is online
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'user_id': self.user.id
        }))
    
    async def disconnect(self, close_code):
        """Leave room group"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'call_invite':
                await self.handle_call_invite(data)
            elif message_type == 'call_accept':
                await self.handle_call_accept(data)
            elif message_type == 'call_reject':
                await self.handle_call_reject(data)
            elif message_type == 'call_end':
                await self.handle_call_end(data)
            elif message_type == 'webrtc_offer':
                await self.handle_webrtc_offer(data)
            elif message_type == 'webrtc_answer':
                await self.handle_webrtc_answer(data)
            elif message_type == 'ice_candidate':
                await self.handle_ice_candidate(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_call_invite(self, data):
        """Handle incoming call invitation"""
        target_user_id = data.get('target_user_id')
        call_type = data.get('call_type', 'video')  # video or audio
        
        # Send invitation to target user
        await self.channel_layer.group_send(
            f"call_user_{target_user_id}",
            {
                'type': 'call_invitation',
                'caller_id': self.user.id,
                'caller_name': self.user.get_full_name() or self.user.username,
                'call_type': call_type,
                'timestamp': data.get('timestamp')
            }
        )
    
    async def handle_call_accept(self, data):
        """Handle call acceptance"""
        caller_id = data.get('caller_id')
        
        # Notify caller that call was accepted
        await self.channel_layer.group_send(
            f"call_user_{caller_id}",
            {
                'type': 'call_accepted',
                'accepter_id': self.user.id,
                'accepter_name': self.user.get_full_name() or self.user.username
            }
        )
    
    async def handle_call_reject(self, data):
        """Handle call rejection"""
        caller_id = data.get('caller_id')
        
        # Notify caller that call was rejected
        await self.channel_layer.group_send(
            f"call_user_{caller_id}",
            {
                'type': 'call_rejected',
                'rejecter_id': self.user.id
            }
        )
    
    async def handle_call_end(self, data):
        """Handle call end"""
        target_user_id = data.get('target_user_id')
        
        # Notify other user that call ended
        await self.channel_layer.group_send(
            f"call_user_{target_user_id}",
            {
                'type': 'call_ended',
                'ender_id': self.user.id
            }
        )
    
    async def handle_webrtc_offer(self, data):
        """Handle WebRTC offer (SDP)"""
        target_user_id = data.get('target_user_id')
        offer = data.get('offer')
        
        # Forward offer to target user
        await self.channel_layer.group_send(
            f"call_user_{target_user_id}",
            {
                'type': 'webrtc_offer_received',
                'sender_id': self.user.id,
                'offer': offer
            }
        )
    
    async def handle_webrtc_answer(self, data):
        """Handle WebRTC answer (SDP)"""
        target_user_id = data.get('target_user_id')
        answer = data.get('answer')
        
        # Forward answer to target user
        await self.channel_layer.group_send(
            f"call_user_{target_user_id}",
            {
                'type': 'webrtc_answer_received',
                'sender_id': self.user.id,
                'answer': answer
            }
        )
    
    async def handle_ice_candidate(self, data):
        """Handle ICE candidate"""
        target_user_id = data.get('target_user_id')
        candidate = data.get('candidate')
        
        # Forward ICE candidate to target user
        await self.channel_layer.group_send(
            f"call_user_{target_user_id}",
            {
                'type': 'ice_candidate_received',
                'sender_id': self.user.id,
                'candidate': candidate
            }
        )
    
    # Channel layer event handlers
    async def call_invitation(self, event):
        """Send call invitation to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'call_invite',
            'caller_id': event['caller_id'],
            'caller_name': event['caller_name'],
            'call_type': event['call_type'],
            'timestamp': event['timestamp']
        }))
    
    async def call_accepted(self, event):
        """Send call accepted notification"""
        await self.send(text_data=json.dumps({
            'type': 'call_accept',
            'accepter_id': event['accepter_id'],
            'accepter_name': event['accepter_name']
        }))
    
    async def call_rejected(self, event):
        """Send call rejected notification"""
        await self.send(text_data=json.dumps({
            'type': 'call_reject',
            'rejecter_id': event['rejecter_id']
        }))
    
    async def call_ended(self, event):
        """Send call ended notification"""
        await self.send(text_data=json.dumps({
            'type': 'call_end',
            'ender_id': event['ender_id']
        }))
    
    async def webrtc_offer_received(self, event):
        """Forward WebRTC offer"""
        await self.send(text_data=json.dumps({
            'type': 'webrtc_offer',
            'sender_id': event['sender_id'],
            'offer': event['offer']
        }))
    
    async def webrtc_answer_received(self, event):
        """Forward WebRTC answer"""
        await self.send(text_data=json.dumps({
            'type': 'webrtc_answer',
            'sender_id': event['sender_id'],
            'answer': event['answer']
        }))
    
    async def ice_candidate_received(self, event):
        """Forward ICE candidate"""
        await self.send(text_data=json.dumps({
            'type': 'ice_candidate',
            'sender_id': event['sender_id'],
            'candidate': event['candidate']
        }))
