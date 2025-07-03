#!/bin/bash
# Railway build script

echo "Starting Railway deployment..."

# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run Django commands
python manage.py collectstatic --noinput --settings=data_analysis_api.settings_railway
python manage.py migrate --settings=data_analysis_api.settings_railway

echo "Build completed successfully!"
