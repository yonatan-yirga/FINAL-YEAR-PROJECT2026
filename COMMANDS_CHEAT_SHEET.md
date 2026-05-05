# 📋 Commands Cheat Sheet

## 🚀 Start Servers

### Backend
```bash
cd Backend
python manage.py runserver
```
**URL**: http://localhost:8000

### Frontend
```bash
cd Frontend
npm run dev
```
**URL**: http://localhost:5173

---

## 🛑 Stop Servers

Press `Ctrl + C` in the terminal

---

## 🔧 Backend Commands

### First Time Setup
```bash
cd Backend
python -m venv venv                    # Create virtual environment
venv\Scripts\activate                  # Activate (Windows)
pip install -r requirements.txt        # Install dependencies
python manage.py migrate               # Setup database
python manage.py createsuperuser       # Create admin account
```

### Daily Use
```bash
python manage.py runserver             # Start server
python manage.py migrate               # Run migrations
python manage.py makemigrations        # Create migrations
python manage.py shell                 # Open Python shell
python manage.py test                  # Run tests
```

### Database
```bash
python manage.py dbshell               # Open database shell
python manage.py flush                 # Clear database
python manage.py dumpdata > data.json  # Backup data
python manage.py loaddata data.json    # Restore data
```

### User Management
```bash
python manage.py createsuperuser       # Create admin
python manage.py changepassword <user> # Change password
```

---

## 🎨 Frontend Commands

### First Time Setup
```bash
cd Frontend
npm install                            # Install dependencies
```

### Daily Use
```bash
npm run dev                            # Start dev server
npm run build                          # Build for production
npm run preview                        # Preview production build
npm run lint                           # Check code quality
```

### Dependencies
```bash
npm install <package>                  # Add package
npm uninstall <package>                # Remove package
npm update                             # Update packages
npm outdated                           # Check outdated packages
```

---

## 🐛 Troubleshooting Commands

### Check if Port is in Use

**Windows:**
```bash
netstat -ano | findstr :8000           # Check port 8000
netstat -ano | findstr :5173           # Check port 5173
taskkill /PID <PID> /F                 # Kill process
```

**Mac/Linux:**
```bash
lsof -ti:8000                          # Check port 8000
lsof -ti:5173                          # Check port 5173
kill -9 <PID>                          # Kill process
```

### Clear Cache

**Backend:**
```bash
find . -type d -name __pycache__ -exec rm -r {} +  # Remove cache
python manage.py migrate --run-syncdb              # Sync database
```

**Frontend:**
```bash
rm -rf node_modules                    # Remove modules
npm install                            # Reinstall
npm cache clean --force                # Clear cache
```

---

## 📦 Package Management

### Backend (Python)
```bash
pip list                               # List installed packages
pip freeze > requirements.txt          # Save dependencies
pip install -r requirements.txt        # Install from file
pip install --upgrade <package>        # Upgrade package
```

### Frontend (Node)
```bash
npm list                               # List installed packages
npm list --depth=0                     # List top-level only
npm outdated                           # Check for updates
npm update                             # Update packages
```

---

## 🔍 Testing & Debugging

### Backend
```bash
python manage.py test                  # Run all tests
python manage.py test apps.accounts    # Test specific app
python manage.py check                 # Check for issues
python manage.py validate              # Validate models
```

### Frontend
```bash
npm run test                           # Run tests (if configured)
npm run lint                           # Check code style
```

---

## 📊 Database Commands

### Migrations
```bash
python manage.py makemigrations        # Create migrations
python manage.py migrate               # Apply migrations
python manage.py showmigrations        # Show migration status
python manage.py migrate --fake        # Fake migration
python manage.py migrate <app> zero    # Rollback app migrations
```

### Data Management
```bash
python manage.py shell                 # Interactive shell
python manage.py dbshell               # Database shell
python manage.py dumpdata              # Export data
python manage.py loaddata              # Import data
python manage.py flush                 # Clear all data
```

---

## 🌐 Network & URLs

### Check Backend API
```bash
curl http://localhost:8000/api/                           # Test API
curl http://localhost:8000/api/auth/partner-organizations/ # Test endpoint
```

### View All URLs
```bash
python manage.py show_urls             # List all routes (if installed)
```

---

## 🔐 Security

### Generate Secret Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Change Password
```bash
python manage.py changepassword <username>
```

---

## 📝 Logs & Monitoring

### View Logs
```bash
tail -f logs/django.log                # Follow Django logs
tail -f logs/error.log                 # Follow error logs
```

### Check Server Status
```bash
ps aux | grep python                   # Check Python processes
ps aux | grep node                     # Check Node processes
```

---

## 🚀 Production Commands

### Backend
```bash
python manage.py collectstatic         # Collect static files
python manage.py check --deploy        # Check deployment readiness
gunicorn config.wsgi:application       # Run with Gunicorn
```

### Frontend
```bash
npm run build                          # Build for production
npm run preview                        # Preview build
```

---

## 🎯 Quick Actions

### Restart Everything
```bash
# Stop both servers (Ctrl+C in each terminal)
# Then restart:
cd Backend && python manage.py runserver
cd Frontend && npm run dev
```

### Fresh Start
```bash
# Backend
cd Backend
python manage.py flush                 # Clear database
python manage.py migrate               # Recreate tables
python seed_sample_data.py             # Add sample data

# Frontend
cd Frontend
rm -rf node_modules                    # Remove modules
npm install                            # Reinstall
npm run dev                            # Start
```

---

## 📱 Test Accounts

### Login Credentials
```
Company: company1@test.com / Test@123
Student: student1@test.com / Test@123
Advisor: advisor1@test.com / Test@123
Admin: admin@test.com / Test@123
```

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |
| Partner Organizations | http://localhost:5173/partner-organizations |
| Network Stats | http://localhost:5173/company/network-stats |
| Company Dashboard | http://localhost:5173/company/dashboard |

---

## 💡 Pro Tips

1. **Keep terminals open** - Don't close them while developing
2. **Check logs first** - Terminal shows errors immediately
3. **Use Ctrl+C** - Always stop servers cleanly
4. **Virtual environment** - Activate before running backend commands
5. **Port conflicts** - Kill processes if ports are in use

---

## 🆘 Emergency Commands

### Backend Not Working
```bash
cd Backend
pip install -r requirements.txt        # Reinstall dependencies
python manage.py migrate               # Fix database
python manage.py runserver             # Try again
```

### Frontend Not Working
```bash
cd Frontend
rm -rf node_modules                    # Remove modules
npm install                            # Reinstall
npm run dev                            # Try again
```

### Database Issues
```bash
python manage.py migrate --run-syncdb  # Sync database
python manage.py flush                 # Clear and reset
python manage.py migrate               # Recreate
```

---

**Keep this cheat sheet handy for quick reference!** 📌
