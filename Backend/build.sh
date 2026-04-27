#!/usr/bin/env bash
# Render.com build script
set -o errexit

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py migrate --no-input

echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

echo "✅ Build complete!"
