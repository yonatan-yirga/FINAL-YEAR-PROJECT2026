# 🎓 Student Certificate View Feature

## Overview

Students can now view and download their internship completion certificate directly from their Active Internship dashboard after the certificate has been issued by the Department Head.

---

## ✨ Features

### Certificate Card Display
- ✅ Shows certificate information on Active Internship page
- ✅ Displays certificate ID, issue date, and grade
- ✅ Download button for PDF certificate
- ✅ Online verification link
- ✅ Real-time status (Ready or Generating)
- ✅ Beautiful gradient design with green theme
- ✅ Mobile responsive

### User Flow
```
1. Student logs in
2. Navigates to Active Internship page
3. Sees certificate card (if certificate issued)
4. Clicks "Download Certificate" button
5. PDF downloads automatically
6. Can also verify certificate online
```

---

## 📁 Files Modified

### Frontend
1. **`Frontend/src/pages/student/ActiveInternship.jsx`**
   - Added certificate state management
   - Added `fetchCertificate()` function
   - Added `handleDownloadCertificate()` function
   - Added certificate card UI component

2. **`Frontend/src/pages/student/ActiveInternship.css`**
   - Added certificate card styles
   - Added download button styles
   - Added responsive styles

---

## 🎯 Certificate Card Features

### Information Displayed
- **Certificate ID**: Unique identifier (e.g., CERT-2026-CS-001)
- **Issue Date**: When certificate was issued
- **Grade**: Performance grade (A+, A, A-, B+, etc.)
- **Status**: Ready or Generating

### Actions Available
1. **Download Certificate** - Downloads PDF to device
2. **Verify Certificate Online** - Opens verification page in new tab

---

## 🎨 UI Design

### Certificate Card Layout
```
┌─────────────────────────────────────────┐
│  🎓  Your Certificate                   │
│      Internship completion certificate  │
├─────────────────────────────────────────┤
│  Certificate ID    CERT-2026-CS-001     │
│  Issue Date        April 23, 2026       │
│  Grade             A+ (Outstanding)     │
│  Status            ✓ Ready              │
├─────────────────────────────────────────┤
│  [📥 Download Certificate]              │
│  [🔗 Verify Certificate Online]         │
└─────────────────────────────────────────┘
```

### Color Scheme
- **Background**: Light green gradient
- **Border**: Green with glow effect
- **Icon**: Green gradient circle
- **Download Button**: Green gradient with shadow
- **Verify Button**: White with border

---

## 🔧 Implementation Details

### Certificate Loading
```javascript
// Fetches certificate on page load
const fetchCertificate = async () => {
  const result = await certificateService.getMyCertificate();
  if (result.success && result.data) {
    setCertificate(result.data);
  }
};
```

### Certificate Download
```javascript
// Downloads PDF when button clicked
const handleDownloadCertificate = async () => {
  await certificateService.downloadCertificate(certificate.id);
};
```

### Conditional Rendering
```javascript
// Only shows if certificate exists
{certificate && (
  <div className="ai-certificate-card">
    {/* Certificate content */}
  </div>
)}
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Certificate card appears when certificate exists
- [ ] Certificate card hidden when no certificate
- [ ] Download button works
- [ ] PDF downloads correctly
- [ ] Verify link opens in new tab
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Mobile responsive layout

### Visual Tests
- [ ] Card styling matches design
- [ ] Icons display correctly
- [ ] Buttons have hover effects
- [ ] Colors are consistent
- [ ] Text is readable
- [ ] Spacing is appropriate

### Edge Cases
- [ ] Certificate generating (not ready yet)
- [ ] No certificate available
- [ ] Download fails
- [ ] Slow network
- [ ] Multiple certificates (should show latest)

---

## 📊 API Integration

### Get My Certificate
```http
GET /api/certificates/my-certificate/
Authorization: Token {auth_token}

Response: 200 OK
{
  "id": 1,
  "certificate_id": "CERT-2026-CS-001",
  "verification_code": "ABC123XYZ789",
  "issue_date": "2026-04-23",
  "student_name": "John Doe",
  "company_name": "Tech Corp",
  "performance_grade": "A+",
  "is_generated": true,
  "pdf_file": "/media/certificates/certificate_1.pdf"
}
```

### Download Certificate
```http
GET /api/certificates/{id}/download/
Authorization: Token {auth_token}

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="certificate_1.pdf"

[Binary PDF data]
```

---

## 🎨 Styling Details

### Certificate Card
```css
.ai-certificate-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(13, 43, 94, 0.05) 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
}
```

### Download Button
```css
.ai-certificate-download-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

### Certificate Icon
```css
.ai-certificate-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

---

## 🔄 User Experience Flow

### Scenario 1: Certificate Ready
```
1. Student opens Active Internship page
2. Certificate card appears with green theme
3. Shows "✓ Ready" status
4. Download button is enabled
5. Student clicks download
6. PDF downloads immediately
7. Success!
```

### Scenario 2: Certificate Generating
```
1. Student opens Active Internship page
2. Certificate card appears
3. Shows "⏳ Generating..." status
4. Download button replaced with generating message
5. Student waits or refreshes later
6. Once ready, download button appears
```

### Scenario 3: No Certificate
```
1. Student opens Active Internship page
2. No certificate card appears
3. Only Quick Actions card visible
4. Student continues internship
5. Certificate appears after department head issues it
```

---

## 📱 Mobile Responsive

### Breakpoints
- **Desktop**: Full layout with side-by-side info
- **Tablet (768px)**: Stacked layout
- **Mobile (480px)**: Compact layout with centered content

### Mobile Optimizations
- Smaller icon size (48px vs 56px)
- Centered certificate header
- Full-width buttons
- Reduced padding
- Optimized font sizes

---

## 🐛 Troubleshooting

### Issue: Certificate not showing
**Solution**: Check if certificate has been issued by department head
```javascript
// Check backend
GET /api/certificates/my-certificate/
// Should return certificate data, not 404
```

### Issue: Download not working
**Solution**: Check authentication and file permissions
```javascript
// Ensure auth token is valid
const token = localStorage.getItem('authToken');
console.log('Token:', token);
```

### Issue: PDF not generated
**Solution**: Check backend certificate generation
```python
# In Django shell
from apps.certificates.models import Certificate
cert = Certificate.objects.get(id=1)
print(cert.is_generated)  # Should be True
print(cert.pdf_file)  # Should have path
```

---

## 🚀 Future Enhancements

### Potential Improvements
- [ ] Certificate preview modal (view before download)
- [ ] Share certificate on social media
- [ ] Email certificate to self
- [ ] Print certificate directly
- [ ] Certificate history (if multiple internships)
- [ ] Certificate analytics (views, downloads)
- [ ] QR code on certificate card
- [ ] Certificate expiry date
- [ ] Certificate renewal option
- [ ] Certificate templates selection

---

## 📚 Related Documentation

- [Certificate Generation](./CERTIFICATE_GENERATION_FIX.md)
- [Active Internship Page](./Frontend/src/pages/student/ActiveInternship.jsx)
- [Certificate Service](./Frontend/src/services/certificateService.js)
- [Congratulations Page](./Frontend/src/pages/student/Congratulations.jsx)

---

## 📝 Changelog

### Version 1.0.0 (2026-04-23)
- ✅ Initial release
- ✅ Certificate card on Active Internship page
- ✅ Download functionality
- ✅ Online verification link
- ✅ Mobile responsive design
- ✅ Loading and error states
- ✅ Beautiful green gradient theme

---

## 🤝 Support

For questions or issues:
- Check troubleshooting section
- Review API documentation
- Test with provided examples
- Contact development team

---

**Created**: 2026-04-23  
**Version**: 1.0.0  
**Status**: Production Ready ✅
