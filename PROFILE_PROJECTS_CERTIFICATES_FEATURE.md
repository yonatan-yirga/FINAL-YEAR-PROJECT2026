# Profile Projects & Certificates Feature ✅

## Overview
Added optional fields for **Projects** and **Certificates** to student profiles. When students apply for internships, their profile information (including projects and certificates) is automatically included in the application.

## New Features

### 1. Profile Page Updates
Students can now add:
- **Projects** (Optional) - Personal or academic projects with descriptions
- **Certificates & Achievements** (Optional) - Certifications, awards, and achievements

### 2. Auto-Population on Application
When a student applies for an internship, the system automatically includes:
- About Me (from profile)
- Experience (from profile)
- Projects (from profile)
- Certificates (from profile)

Students can still override these fields in the application form if they want to customize for a specific internship.

## Changes Made

### Backend Changes

#### 1. Database Model (`Backend/apps/accounts/models.py`)
Added two new fields to `StudentProfile`:
```python
projects = models.TextField(
    blank=True,
    help_text='Personal or academic projects with descriptions'
)
certificates = models.TextField(
    blank=True,
    help_text='Certifications, awards, and achievements'
)
```

#### 2. Migration
Created migration: `0008_studentprofile_certificates_studentprofile_projects.py`
- Adds `projects` field to student_profiles table
- Adds `certificates` field to student_profiles table

#### 3. Serializer (`Backend/apps/accounts/serializers.py`)
Updated `StudentProfileSerializer` to include new fields:
```python
fields = [
    ...,
    'projects', 'certificates',
    ...
]
```

#### 4. Application Auto-Population (`Backend/apps/applications/serializers.py`)
Updated `ApplicationCreateSerializer.create()` method to automatically populate application fields from student profile:
```python
def create(self, validated_data):
    request = self.context.get('request')
    validated_data['student'] = request.user
    
    # Auto-populate from profile if not provided
    profile = request.user.student_profile
    if not validated_data.get('about_me'):
        validated_data['about_me'] = profile.about
    if not validated_data.get('experience'):
        validated_data['experience'] = profile.experience
    if not validated_data.get('projects'):
        validated_data['projects'] = profile.projects
    if not validated_data.get('certificate'):
        validated_data['certificate'] = profile.certificates
    
    return super().create(validated_data)
```

### Frontend Changes

#### 1. Profile Component (`Frontend/src/pages/student/Profile.jsx`)
Added two new sections:

**Projects Section:**
```jsx
<div className="profile-card">
  <div className="profile-card-header">
    <h2 className="profile-card-title">
      <Briefcase size={20} />
      Projects
      <span className="profile-optional-badge">Optional</span>
    </h2>
  </div>
  <textarea
    name="projects"
    placeholder="Describe your projects..."
    rows={5}
  />
</div>
```

**Certificates Section:**
```jsx
<div className="profile-card">
  <div className="profile-card-header">
    <h2 className="profile-card-title">
      <Award size={20} />
      Certificates & Achievements
      <span className="profile-optional-badge">Optional</span>
    </h2>
  </div>
  <textarea
    name="certificates"
    placeholder="List your certifications..."
    rows={4}
  />
</div>
```

#### 2. Profile CSS (`Frontend/src/pages/student/Profile.css`)
Added styling for optional badge:
```css
.profile-optional-badge {
  display: inline-flex;
  padding: 4px 10px;
  margin-left: 12px;
  font-size: 12px;
  color: #6b7177;
  background: #f2f4f5;
  border-radius: 12px;
}
```

## How It Works

### Student Workflow

1. **Update Profile**
   - Student goes to Profile page
   - Fills in optional Projects and Certificates sections
   - Saves profile

2. **Apply for Internship**
   - Student clicks "Apply Now" on an internship
   - Application modal opens
   - Profile information is **automatically pre-filled**:
     - About Me → from profile.about
     - Experience → from profile.experience
     - Projects → from profile.projects
     - Certificates → from profile.certificates
   - Student can edit these fields if needed for this specific application
   - Submits application

3. **Company Receives Application**
   - Company sees complete application with:
     - Student's basic info (name, email, skills)
     - About Me
     - Experience
     - Projects
     - Certificates
   - All information is automatically included from the student's profile

## Field Details

### Projects Field
- **Type**: Text area (multi-line)
- **Optional**: Yes
- **Purpose**: Describe personal or academic projects
- **Example**:
  ```
  E-commerce Website
  - Built with React and Node.js
  - Implemented payment integration with Stripe
  - User authentication with JWT
  - Deployed on AWS
  
  Mobile App for Task Management
  - React Native application
  - Firebase backend
  - Push notifications
  - 1000+ downloads on Play Store
  ```

### Certificates Field
- **Type**: Text area (multi-line)
- **Optional**: Yes
- **Purpose**: List certifications, awards, and achievements
- **Example**:
  ```
  AWS Certified Developer - Associate
  Amazon Web Services, January 2025
  
  React Developer Certification
  Meta (Facebook), December 2024
  
  Dean's List Award
  Debre Markos University, 2023-2024
  ```

## Benefits

### For Students
✅ **One-time entry** - Fill profile once, use for all applications
✅ **Consistency** - Same information across all applications
✅ **Time-saving** - No need to re-type for each application
✅ **Flexibility** - Can still customize per application if needed

### For Companies
✅ **Complete information** - Get full student profile automatically
✅ **Better decisions** - More context about student's background
✅ **Standardized format** - All applications have same structure

## Database Schema

```sql
-- New fields in student_profiles table
ALTER TABLE student_profiles 
ADD COLUMN projects TEXT DEFAULT '',
ADD COLUMN certificates TEXT DEFAULT '';
```

## API Endpoints

### Get Profile
```
GET /api/auth/profile/
Response includes: projects, certificates
```

### Update Profile
```
PUT /api/auth/profile/update/
Body: {
  "projects": "Project descriptions...",
  "certificates": "Certificate list..."
}
```

### Create Application
```
POST /api/applications/apply/
Body: {
  "internship": 123,
  "cover_letter": "...",
  // Optional - auto-populated from profile if not provided:
  "about_me": "...",
  "experience": "...",
  "projects": "...",
  "certificate": "..."
}
```

## Testing

### Test Profile Update
1. Log in as a student
2. Go to Profile page
3. Scroll to "Projects" section
4. Add project descriptions
5. Scroll to "Certificates & Achievements" section
6. Add certificates
7. Click "Save Profile"
8. ✅ Should see success message
9. Refresh page
10. ✅ Projects and certificates should be saved

### Test Auto-Population
1. Ensure profile has projects and certificates filled
2. Go to any internship detail page
3. Click "Apply Now"
4. ✅ Application modal should show profile information pre-filled
5. Submit application
6. Log in as company
7. View the application
8. ✅ Should see all profile information including projects and certificates

## Notes

- Projects and certificates are **optional** - students can leave them blank
- If a student doesn't fill these fields in their profile, they can still fill them in the application form
- If a student fills them in the profile, they are automatically included in applications
- Students can override the auto-populated values for specific applications
- The auto-population only happens if the application fields are empty

## Migration Commands

```bash
# Create migration
cd Backend
python manage.py makemigrations accounts

# Apply migration
python manage.py migrate accounts
```

## Files Modified

### Backend
- ✅ `Backend/apps/accounts/models.py` - Added fields to StudentProfile
- ✅ `Backend/apps/accounts/serializers.py` - Updated StudentProfileSerializer
- ✅ `Backend/apps/applications/serializers.py` - Added auto-population logic
- ✅ `Backend/apps/accounts/migrations/0008_studentprofile_certificates_studentprofile_projects.py` - New migration

### Frontend
- ✅ `Frontend/src/pages/student/Profile.jsx` - Added Projects and Certificates sections
- ✅ `Frontend/src/pages/student/Profile.css` - Added optional badge styling

## Future Enhancements

Potential improvements:
- Add file upload for project screenshots
- Add file upload for certificate PDFs
- Add structured format (JSON) for projects with fields like: title, description, technologies, link, date
- Add certificate verification links
- Add project gallery view
- Add certificate badges/icons
