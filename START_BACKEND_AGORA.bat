@echo off
echo ========================================
echo Starting Backend Server with Agora
echo ========================================
cd Backend
python manage.py runserver 0.0.0.0:8000
