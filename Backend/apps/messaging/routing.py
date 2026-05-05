"""
WebSocket URL routing for messaging app
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'.*', consumers.CallConsumer.as_asgi()),  # Catch all for testing
]
