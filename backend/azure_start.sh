#!/bin/bash

# Azure App Service startup script
echo "Starting Django application on Azure..."

# Set environment variables
export DJANGO_SETTINGS_MODULE=data_analysis_api.settings_azure
export PYTHONPATH=/home/site/wwwroot

# Navigate to the app directory
cd /home/site/wwwroot

# Install any missing dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput --settings=data_analysis_api.settings_azure

# Start the application with gunicorn
gunicorn --bind=0.0.0.0:$PORT --timeout 600 --workers 2 --access-logfile=- --error-logfile=- data_analysis_api.wsgi:application
