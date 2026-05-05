"""
Test Agora Token Generation
"""
from agora_token_builder import RtcTokenBuilder
import time

# Agora credentials
AGORA_APP_ID = '19fa6bc3e79140d596e36afda2045b97'
AGORA_APP_CERTIFICATE = 'cd4f7c56bfd94cf1bf10f386f47d7a3c'

# Test parameters
channel_name = 'test_channel'
uid = 12345
role = 1  # Publisher

# Token expiration (24 hours)
expiration_time_in_seconds = 24 * 3600
current_timestamp = int(time.time())
privilege_expired_ts = current_timestamp + expiration_time_in_seconds

print("=" * 60)
print("Testing Agora Token Generation")
print("=" * 60)
print(f"App ID: {AGORA_APP_ID}")
print(f"App Certificate: {AGORA_APP_CERTIFICATE}")
print(f"Channel: {channel_name}")
print(f"UID: {uid}")
print(f"Role: {role}")
print(f"Expires at: {privilege_expired_ts}")
print("=" * 60)

try:
    token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel_name,
        uid,
        role,
        privilege_expired_ts
    )
    
    print("✅ Token generated successfully!")
    print(f"Token: {token}")
    print(f"Token length: {len(token)}")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Error generating token: {e}")
    import traceback
    traceback.print_exc()
    print("=" * 60)
