"""
Test ASGI Configuration
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("=" * 60)
print("Testing ASGI Configuration")
print("=" * 60)

try:
    from config.asgi import application
    print("✅ ASGI application imported successfully")
    print(f"   Type: {type(application)}")
    print(f"   Application: {application}")
    
    # Check if it's a ProtocolTypeRouter
    from channels.routing import ProtocolTypeRouter
    if isinstance(application, ProtocolTypeRouter):
        print("✅ Application is a ProtocolTypeRouter")
        print(f"   Protocols: {list(application.application_mapping.keys())}")
    
    # Try to get the websocket routing
    from apps.messaging.routing import websocket_urlpatterns
    print(f"\n✅ WebSocket URL patterns loaded:")
    for pattern in websocket_urlpatterns:
        print(f"   Pattern: {pattern.pattern}")
        print(f"   Callback: {pattern.callback}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("=" * 60)
