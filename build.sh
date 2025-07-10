#!/bin/bash
# Render build script

echo "Starting Render build process..."

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set Django settings
export DJANGO_SETTINGS_MODULE=data_analysis_api.settings_render

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

echo "Build completed successfully!"
