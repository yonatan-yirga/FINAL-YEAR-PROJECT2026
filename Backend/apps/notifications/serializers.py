"""
Notification Serializers
Handles serialization for notification API
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    absolute_url = serializers.CharField(
        source='get_absolute_url',
        read_only=True
    )
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'notification_type_display',
            'link',
            'absolute_url',
            'related_object_id',
            'related_object_type',
            'is_read',
            'created_at',
            'read_at',
            'time_ago',
        ]
        read_only_fields = [
            'id',
            'notification_type',
            'created_at',
            'read_at',
        ]
    
    def get_time_ago(self, obj):
        """Return human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'Just now'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'{minutes} minute{"s" if minutes != 1 else ""} ago'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} hour{"s" if hours != 1 else ""} ago'
        elif diff < timedelta(days=7):
            days = diff.days
            return f'{days} day{"s" if days != 1 else ""} ago'
        elif diff < timedelta(days=30):
            weeks = int(diff.days / 7)
            return f'{weeks} week{"s" if weeks != 1 else ""} ago'
        else:
            return obj.created_at.strftime('%b %d, %Y')


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'recipient',
            'title',
            'message',
            'notification_type',
            'link',
            'related_object_id',
            'related_object_type',
        ]
    
    def validate(self, data):
        """Validate notification data"""
        # Ensure title is not empty
        if not data.get('title', '').strip():
            raise serializers.ValidationError({'title': 'Title cannot be empty'})
        
        # Ensure message is not empty
        if not data.get('message', '').strip():
            raise serializers.ValidationError({'message': 'Message cannot be empty'})
        
        return data


class UnreadCountSerializer(serializers.Serializer):
    """Serializer for unread count response"""
    
    unread_count = serializers.IntegerField()