# 🔧 Agora Token Error - "invalid token, authorized failed"

## 🎯 The Problem

Agora is rejecting the token with error:
```
AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: invalid token, authorized failed
```

## 🔍 Possible Causes

### 1. App Certificate Not Enabled
Your Agora project might not have the App Certificate enabled yet.

### 2. Wrong Certificate
You provided two certificates:
- Certificate 1: `cd4f7c56bfd94cf1bf10f386f47d7a3c`
- Primary Certificate: `2dcc1585f5104831aa3f7abb3e4d2e99`

I've updated the code to use the **primary certificate**.

### 3. Certificate Not Activated
The certificate might not be activated in your Agora console yet.

## ✅ Solution Options

### Option 1: Use Primary Certificate (RECOMMENDED)

I've already updated the backend to use the primary certificate. 

**Action Required:**
1. Restart the backend server
2. Hard refresh browser (Ctrl+Shift+R)
3. Try the call again

### Option 2: Disable Certificate (FOR TESTING ONLY)

If the certificate is not enabled in your Agora console, you can test without it:

1. **Check Agora Console:**
   - Go to https://console.agora.io/
   - Open your project
   - Check if "Primary Certificate" is enabled
   - If not enabled, you can join channels without a token

2. **Update Frontend to use null token:**
   
   In `Frontend/src/services/agoraService.js`, change line 105:
   ```javascript
   // Before:
   const assignedUid = await this.client.join(
     this.appId,
     channelName,
     token,  // ← Change this
     uid
   );
   
   // After (for testing without certificate):
   const assignedUid = await this.client.join(
     this.appId,
     channelName,
     null,  // ← Use null when certificate is disabled
     uid
   );
   ```

### Option 3: Verify Agora Console Settings

1. **Go to Agora Console:** https://console.agora.io/
2. **Select your project**
3. **Check these settings:**
   - App ID: Should be `19fa6bc3e79140d596e36afda2045b97`
   - Primary Certificate: Should be enabled
   - Certificate value: Should match what we're using

4. **If Certificate is NOT enabled:**
   - Either enable it (recommended for production)
   - Or use Option 2 above for testing

## 🚀 Quick Test Steps

### Step 1: Verify Agora Console

1. Login to https://console.agora.io/
2. Go to your project
3. Check if "Enable Primary Certificate" is turned ON
4. If OFF, either:
   - Turn it ON and use the certificate
   - Keep it OFF and use null token (Option 2)

### Step 2: Restart Backend

```bash
# Stop current server (Ctrl+C)
cd Backend
python manage.py runserver 0.0.0.0:8000
```

### Step 3: Hard Refresh Frontend

Press `Ctrl + Shift + R`

### Step 4: Test Call

Try making a call again.

## 📝 Expected Behavior

### If Certificate is Enabled:
```
✅ Got Agora token
📞 Joining Agora channel...
✅ Joined channel with UID: 12345
```

### If Certificate is Disabled:
You'll need to use `null` as the token (see Option 2).

## 🔧 Debug Information

### Check Token Generation

Test the token generation:
```bash
cd Backend
python test_agora_token.py
```

Should output:
```
✅ Token generated successfully!
Token: 006...
```

### Check API Endpoint

Test the API:
```bash
curl http://localhost:8000/api/messages/agora/token/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channelName":"test","uid":0}'
```

Should return:
```json
{
  "token": "006...",
  "appId": "19fa6bc3e79140d596e36afda2045b97",
  "channelName": "test",
  "uid": 12345
}
```

## 🎯 Most Likely Solution

**The primary certificate is probably not activated yet in your Agora console.**

**Quick Fix:**
1. Go to Agora Console
2. Enable Primary Certificate
3. Make sure it matches: `2dcc1585f5104831aa3f7abb3e4d2e99`
4. Restart backend
5. Try again

**OR**

If you want to test quickly without certificate:
1. Keep certificate disabled in Agora console
2. Use `null` as token in frontend (see Option 2)
3. Test the call

---

**Status:** Waiting for you to check Agora console
**Action:** Verify certificate status in Agora console
**Next:** Either enable certificate or use null token for testing
