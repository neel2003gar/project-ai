#!/bin/bash
# Script to start the Django backend in GitHub Codespaces

echo "🚀 Starting Django backend in GitHub Codespaces..."

# Navigate to backend directory
cd backend

# Install Python dependencies if needed
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Start the Django development server
echo "🌐 Starting Django server..."
echo "The server will be accessible at the Codespaces URL on port 8000"
python manage.py runserver 0.0.0.0:8000
