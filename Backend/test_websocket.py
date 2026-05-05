"""
Test WebSocket Connection
Run this to verify WebSocket authentication works
"""
import asyncio
import websockets
import json

async def test_websocket():
    # Get a valid token first
    import requests
    
    # Login to get token
    login_url = "http://localhost:8000/api/auth/login/"
    login_data = {
        "email": "student@test.com",
        "password": "test123"
    }
    
    print("🔐 Logging in to get token...")
    response = requests.post(login_url, json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return
    
    data = response.json()
    token = data.get('token')
    user = data.get('user')
    
    print(f"✅ Login successful!")
    print(f"   User: {user.get('email')} (ID: {user.get('id')})")
    print(f"   Token: {token[:20]}...")
    
    # Connect to WebSocket
    ws_url = f"ws://localhost:8000/ws/call/?token={token}"
    print(f"\n🔌 Connecting to WebSocket...")
    print(f"   Full URL: {ws_url}")
    
    try:
        print(f"   Attempting connection...")
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Wait for connection_established message
            message = await websocket.recv()
            data = json.loads(message)
            print(f"📨 Received message: {data}")
            
            if data.get('type') == 'connection_established':
                print(f"✅ Connection established for user ID: {data.get('user_id')}")
                print("\n🎉 WebSocket authentication is working!")
            else:
                print(f"⚠️ Unexpected message type: {data.get('type')}")
            
            # Close connection
            await websocket.close()
            print("🔌 WebSocket closed")
            
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        print(f"   Error type: {type(e).__name__}")

if __name__ == "__main__":
    print("=" * 60)
    print("WebSocket Connection Test")
    print("=" * 60)
    asyncio.run(test_websocket())
    print("=" * 60)
