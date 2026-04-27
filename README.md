# 🎓 Internship Management System

A comprehensive web-based platform for managing university internships, connecting students, companies, advisors, and department heads.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🎯 Core Features

- **Multi-Role System**: Students, Companies, Advisors, Department Heads, UIL, Admin
- **Internship Management**: Post, search, apply, and manage internships
- **Application Workflow**: Complete application and approval process
- **Advisor Assignment**: Automatic and manual advisor assignment
- **Progress Tracking**: Monthly reports and final evaluations
- **Certificate Generation**: Automatic certificate generation upon completion
- **Real-time Notifications**: Email and in-app notifications
- **Messaging System**: Built-in chat between users
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Dark Mode**: Full dark mode support

### 👥 Role-Specific Features

#### Students
- Search and filter internships
- Apply to multiple positions
- Track application status
- Submit monthly reports
- View assigned advisor
- Download certificates

#### Companies
- Post internship positions
- Review applications
- Accept/reject candidates
- Submit monthly evaluations
- Track active interns

#### Advisors
- View assigned students
- Monitor student progress
- Review monthly reports
- Submit final evaluations
- Provide feedback

#### Department Heads
- Manage students, advisors, and companies
- Assign advisors to students
- Direct student placement
- Register new advisors
- View department analytics
- Manage cycles and escalations

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (Simple JWT)
- **Real-time**: Django Channels (WebSockets)
- **Email**: Django Email Backend
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: CSS3 (Custom)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/internship-management-system.git
cd internship-management-system

# Navigate to backend
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend (from project root)
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your backend URL

# Run development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🌐 Deployment

### Quick Deploy to Render.com (Recommended)

1. **Prepare for deployment**:
   ```bash
   # Windows:
   deploy-prep.bat
   
   # Mac/Linux:
   ./deploy-prep.sh
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

3. **Deploy on Render**:
   - Follow steps in `QUICK_DEPLOY_STEPS.md`

### Detailed Deployment Guides

- **Quick Deploy**: See `QUICK_DEPLOY_STEPS.md` (15 minutes)
- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md`
- **GitHub Setup**: See `README_DEPLOYMENT.md`

---

## 👥 User Roles

### 1. Student
- Register and create profile
- Search internships
- Apply to positions
- Track applications
- Submit reports
- View certificates

### 2. Company
- Register company profile
- Post internship positions
- Review applications
- Manage interns
- Submit evaluations

### 3. Advisor
- View assigned students
- Monitor progress
- Review reports
- Submit evaluations
- Provide guidance

### 4. Department Head
- Manage department
- Assign advisors
- Direct placement
- View analytics
- Handle escalations

### 5. UIL (University Internship Leadership)
- Approve registrations
- System oversight
- Handle escalations
- View all departments

### 6. Admin
- Full system access
- User management
- System configuration

---

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)

### Company Dashboard
![Company Dashboard](screenshots/company-dashboard.png)

### Advisor Dashboard
![Advisor Dashboard](screenshots/advisor-dashboard.png)

### Department Dashboard
![Department Dashboard](screenshots/department-dashboard.png)

---

## 📚 Documentation

### User Guides
- `QUICK_START_GUIDE.md` - Getting started
- `USER_MANUAL.md` - Complete user manual
- `FAQ.md` - Frequently asked questions

### Developer Guides
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `API_DOCUMENTATION.md` - API reference
- `CONTRIBUTING.md` - Contribution guidelines

### Feature Documentation
- `ADD_ADVISOR_FEATURE_COMPLETE.md` - Add Advisor feature
- `ASSIGN_COMPANY_FEATURE_COMPLETE.md` - Assign Company feature
- `ANIMATION_IMPLEMENTATION_COMPLETE.md` - Animation system
- `AUTH_REDESIGN_DOCUMENTATION.md` - Authentication redesign

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## 👨‍💻 Authors

- **Your Name** - *Initial work*

---

## 🙏 Acknowledgments

- Django and React communities
- All contributors
- University internship coordinators
- Students and companies using the system

---

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

---

## 🔗 Links

- **Live Demo**: https://your-app.onrender.com
- **Documentation**: https://docs.your-app.com
- **GitHub**: https://github.com/YOUR_USERNAME/internship-management-system

---

## 📊 Project Status

- ✅ Core features complete
- ✅ Authentication system
- ✅ Multi-role support
- ✅ Internship management
- ✅ Application workflow
- ✅ Advisor assignment
- ✅ Reports and certificates
- ✅ Notifications
- ✅ Messaging system
- ✅ Dark mode
- ✅ Responsive design
- ✅ Production ready

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered matching
- [ ] Video interviews
- [ ] Document verification
- [ ] Multi-language support

---

**Made with ❤️ for better internship management**
