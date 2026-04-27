"""
Message Serializers
"""
from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source='sender.role', read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'advisor_assignment', 'sender', 'sender_name',
            'sender_role', 'content', 'is_read', 'is_mine', 'created_at',
        ]
        read_only_fields = ['id', 'sender', 'sender_name', 'sender_role', 'is_read', 'is_mine', 'created_at']

    def get_sender_name(self, obj):
        try:
            if obj.sender.role == 'STUDENT':
                return obj.sender.student_profile.full_name
            elif obj.sender.role == 'ADVISOR':
                return obj.sender.advisor_profile.full_name
        except Exception:
            pass
        return obj.sender.email

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender_id == request.user.id
        return False


class SendMessageSerializer(serializers.Serializer):
    assignment_id = serializers.IntegerField()
    content = serializers.CharField(max_length=5000, min_length=1)
