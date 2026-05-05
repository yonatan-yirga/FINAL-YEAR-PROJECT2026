# OAuth Authentication - Complete Implementation Guide

## ✅ What Has Been Implemented

### Backend (Django)
1. ✅ Installed required packages:
   - django-allauth==0.57.0
   - dj-rest-auth==5.0.2
   - djangorestframework-simplejwt==5.3.1
   - requests==2.31.0
   - PyJWT==2.8.0

2. ✅ Created OAuth app (`Backend/apps/oauth/`)
   - views.py - OAuth login/callback handlers
   - urls.py - OAuth endpoints
   - apps.py - App configuration

3. ✅ Updated Django settings (`Backend/config/settings.py`)
   - Added OAuth apps to INSTALLED_APPS
   - Configured allauth settings
   - Added JWT configuration
   - Set up OAuth providers (Google, GitHub)

4. ✅ Created API endpoints:
   - POST `/api/oauth/google/` - Google login
   - POST `/api/oauth/github/` - GitHub login
   - GET `/api/oauth/callback/` - OAuth callback handler
   - POST `/api/oauth/exchange-token/` - Token exchange

5. ✅ Run migrations for OAuth tables

### Frontend (React)
1. ✅ Created OAuth service (`Frontend/src/services/oauthService.js`)
   - Google OAuth URL generation
   - GitHub OAuth URL generation
   - Token exchange
   - Login handlers
   - Callback processing

2. ✅ Created OAuth callback page (`Frontend/src/pages/auth/OAuthCallback.jsx`)
   - Handles OAuth redirects
   - Processes authentication
   - Redirects to dashboard

3. ✅ Created environment configuration
   - `.env.example` with OAuth client IDs

## 🔧 Setup Instructions

### Step 1: Get OAuth Credentials

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:8000/api/oauth/callback/`
7. Copy Client ID and Client Secret

#### GitHub OAuth Setup
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Application name: "DMU Internship Portal"
4. Homepage URL: `http://localhost:5173`
5. Authorization callback URL: `http://localhost:5173/auth/callback`
6. Click "Register application"
7. Copy Client ID and generate Client Secret

### Step 2: Configure Environment Variables

#### Backend (.env)
```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Step 3: Update Routes

Add OAuth callback route to `Frontend/src/routes/AppRoutes.jsx`:

```javascript
import OAuthCallback from '../pages/auth/OAuthCallback';

// Add this route
<Route path="/auth/callback" element={<OAuthCallback />} />
```

### Step 4: Add OAuth Buttons to Login Page

Update `Frontend/src/pages/auth/Login.jsx` (or your login component):

```javascript
import oauthService from '../../services/oauthService';

// Add these functions
const handleGoogleLogin = () => {
  sessionStorage.setItem('oauth_provider', 'google');
  window.location.href = oauthService.getGoogleAuthUrl();
};

const handleGitHubLogin = () => {
  sessionStorage.setItem('oauth_provider', 'github');
  window.location.href = oauthService.getGitHubAuthUrl();
};

// Add these buttons in your JSX (before the email/password form)
<button onClick={handleGoogleLogin} className="oauth-button google">
  <img src="/google-icon.svg" alt="Google" />
  Continue with Google
</button>

<button onClick={handleGitHubLogin} className="oauth-button github">
  <img src="/github-icon.svg" alt="GitHub" />
  Continue with GitHub
</button>

<div className="divider">
  <span>OR</span>
</div>
```

### Step 5: Add OAuth Buttons to Register Page

Same as login page - add the OAuth buttons before the registration form.

### Step 6: Add Button Styles

```css
.oauth-button {
  width: 100%;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.oauth-button img {
  width: 20px;
  height: 20px;
}

.oauth-button.google {
  background: #ffffff;
  border: 1px solid #dadce0;
  color: #3c4043;
}

.oauth-button.google:hover {
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.oauth-button.github {
  background: #24292e;
  border: none;
  color: #ffffff;
}

.oauth-button.github:hover {
  background: #2f363d;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider span {
  padding: 0 16px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}
```

## 🚀 Testing

### Test Google OAuth
1. Start backend: `cd Backend && python manage.py runserver`
2. Start frontend: `cd Frontend && npm run dev`
3. Go to login page
4. Click "Continue with Google"
5. Authorize the application
6. Should redirect to dashboard

### Test GitHub OAuth
1. Same as Google but click "Continue with GitHub"

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that redirect URIs in OAuth provider match exactly
- Include both frontend and backend URLs

### Error: "Invalid client"
- Verify Client ID and Secret are correct
- Check environment variables are loaded

### Error: "User has no field named 'username'"
- Already fixed with `ACCOUNT_USER_MODEL_USERNAME_FIELD = None`

### OAuth button doesn't work
- Check browser console for errors
- Verify environment variables are set
- Check that OAuth service is imported correctly

## 📝 Next Steps

1. Add OAuth buttons to Login page
2. Add OAuth buttons to Register page
3. Test with real Google/GitHub accounts
4. Add error handling UI
5. Add loading states
6. Style buttons to match design

## 🎨 UI Components Needed

You still need to:
1. Update Login.jsx with OAuth buttons
2. Update Register.jsx with OAuth buttons
3. Add Google/GitHub icon SVGs
4. Style the OAuth buttons
5. Add "OR" divider

Would you like me to update the Login and Register pages with the OAuth buttons now?
