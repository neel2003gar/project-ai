#!/bin/bash

# Azure App Service startup script for Django application

echo "Starting Azure App Service startup script..."

# Navigate to the correct directory
cd /home/site/wwwroot

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Set Django settings module
export DJANGO_SETTINGS_MODULE=data_analysis_api.settings_azure
echo "Using Django settings: $DJANGO_SETTINGS_MODULE"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist (optional)
echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

echo "Starting Gunicorn server..."
# Start Gunicorn server
gunicorn data_analysis_api.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile -
