#!/bin/bash
# Deployment Preparation Script
# Run this before deploying to Render.com

echo "🚀 Internship Management System - Deployment Preparation"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Preparing Backend..."
cd Backend

# Install production dependencies
echo "   Installing production packages..."
pip install dj-database-url gunicorn whitenoise psycopg2-binary

# Generate requirements.txt
echo "   Generating requirements.txt..."
pip freeze > requirements.txt

# Make build script executable
echo "   Making build.sh executable..."
chmod +x build.sh

echo "✅ Backend prepared!"
echo ""

# Go back to root
cd ..

echo "📦 Step 2: Preparing Frontend..."
cd Frontend

# Install dependencies
echo "   Installing npm packages..."
npm install

echo "✅ Frontend prepared!"
echo ""

# Go back to root
cd ..

echo "📝 Step 3: Checking Git..."
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
else
    echo "   Initializing Git repository..."
    git init
    echo "✅ Git initialized"
fi

echo ""
echo "🎉 Preparation Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo ""
echo "2. Create a GitHub repository at: https://github.com/new"
echo ""
echo "3. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Follow the steps in QUICK_DEPLOY_STEPS.md"
echo ""
echo "🌐 Deployment Guide: See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
