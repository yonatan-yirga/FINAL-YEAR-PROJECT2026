# OAuth Authentication Implementation Plan

## Overview
Add Google and GitHub OAuth authentication to the login and register pages for a better user experience.

## Features to Implement

### 1. Frontend Changes

#### Login Page
- Add "Continue with Google" button
- Add "Continue with GitHub" button
- Add visual separator ("OR" divider)
- Maintain existing email/password login
- Modern, clean button design with brand colors

#### Register Page
- Add "Sign up with Google" button
- Add "Sign up with GitHub" button
- Add visual separator ("OR" divider)
- Maintain existing registration form
- Auto-fill user data from OAuth providers

### 2. Backend Changes

#### New Dependencies
```python
# requirements.txt
django-allauth==0.57.0
dj-rest-auth[with_social]==5.0.2
```

#### Settings Configuration
```python
# settings.py
INSTALLED_APPS = [
    ...
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

SITE_ID = 1

# OAuth Provider Settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'secret': os.getenv('GOOGLE_CLIENT_SECRET'),
        }
    },
    'github': {
        'SCOPE': ['user', 'user:email'],
        'APP': {
            'client_id': os.getenv('GITHUB_CLIENT_ID'),
            'secret': os.getenv('GITHUB_CLIENT_SECRET'),
        }
    }
}
```

#### New API Endpoints
```
POST /api/auth/google/ - Google OAuth login/register
POST /api/auth/github/ - GitHub OAuth login/register
GET /api/auth/google/callback/ - Google OAuth callback
GET /api/auth/github/callback/ - GitHub OAuth callback
```

### 3. OAuth Flow

#### User Flow
1. User clicks "Continue with Google/GitHub"
2. Redirect to OAuth provider (Google/GitHub)
3. User authorizes the application
4. Provider redirects back with authorization code
5. Backend exchanges code for access token
6. Backend retrieves user profile from provider
7. Backend creates/updates user account
8. Backend returns JWT token to frontend
9. Frontend stores token and redirects to dashboard

#### Data Mapping
```javascript
// Google OAuth Response
{
  email: "user@gmail.com",
  name: "John Doe",
  picture: "https://...",
  email_verified: true
}

// GitHub OAuth Response
{
  email: "user@github.com",
  name: "John Doe",
  avatar_url: "https://...",
  login: "johndoe"
}

// Map to User Model
{
  email: email,
  full_name: name,
  avatar: picture/avatar_url,
  is_email_verified: true,
  oauth_provider: "google" | "github",
  oauth_id: provider_user_id
}
```

### 4. UI Design

#### Button Styles
```css
/* Google Button */
- Background: #ffffff
- Border: 1px solid #dadce0
- Text: #3c4043
- Icon: Google logo
- Hover: #f8f9fa background

/* GitHub Button */
- Background: #24292e
- Border: none
- Text: #ffffff
- Icon: GitHub logo
- Hover: #2f363d background

/* OR Divider */
- Horizontal line with "OR" text in center
- Light gray color
- Subtle design
```

### 5. Security Considerations

#### CSRF Protection
- Use state parameter in OAuth flow
- Verify state on callback

#### Token Security
- Store OAuth tokens securely
- Use HTTPS only
- Implement token refresh

#### Email Verification
- Auto-verify emails from OAuth providers
- Skip email verification step

### 6. Error Handling

#### Common Errors
- OAuth provider unavailable
- User cancels authorization
- Email already exists with different provider
- Invalid OAuth credentials
- Network errors

#### Error Messages
- "Unable to connect to Google. Please try again."
- "This email is already registered with a different method."
- "Authorization was cancelled."
- "Invalid OAuth credentials. Please contact support."

### 7. Database Changes

#### User Model Updates
```python
class User(AbstractUser):
    ...
    oauth_provider = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        choices=[('google', 'Google'), ('github', 'GitHub')]
    )
    oauth_id = models.CharField(max_length=255, null=True, blank=True)
    avatar = models.URLField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
```

#### Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Environment Variables

#### Required Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OAuth Redirect URLs
OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
```

### 9. Testing Checklist

- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] New user registration via OAuth
- [ ] Existing user login via OAuth
- [ ] Email conflict handling
- [ ] Error handling for failed OAuth
- [ ] Token refresh works
- [ ] Logout works correctly
- [ ] UI is responsive on mobile
- [ ] Buttons have proper hover states

### 10. Implementation Steps

1. **Backend Setup** (30 minutes)
   - Install django-allauth
   - Configure settings
   - Create OAuth views
   - Add URL routes
   - Update User model

2. **Frontend Setup** (45 minutes)
   - Add OAuth buttons to Login page
   - Add OAuth buttons to Register page
   - Create OAuth service
   - Handle OAuth callbacks
   - Update UI with dividers

3. **Testing** (30 minutes)
   - Test Google OAuth flow
   - Test GitHub OAuth flow
   - Test error scenarios
   - Test mobile responsiveness

4. **Documentation** (15 minutes)
   - Update README
   - Add setup instructions
   - Document OAuth configuration

**Total Estimated Time: 2 hours**

## Benefits

1. **Better UX** - One-click login/register
2. **Higher Conversion** - Easier signup process
3. **Verified Emails** - Auto-verified from providers
4. **Social Proof** - Users trust Google/GitHub
5. **Less Friction** - No password to remember
6. **Modern** - Industry standard authentication

## Alternative: Simple Implementation (Without django-allauth)

If you want a simpler implementation without external packages:

1. Create custom OAuth views
2. Use requests library to call OAuth APIs
3. Manual token exchange
4. Manual user creation/login

This approach gives more control but requires more code and maintenance.

## Recommendation

Use **django-allauth** for production-ready OAuth implementation with:
- Battle-tested security
- Multiple provider support
- Easy configuration
- Active maintenance
- Good documentation

---

**Ready to implement?** Let me know if you want to proceed with this plan!
