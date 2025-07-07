#!/usr/bin/env python3
"""
Azure App Service startup script for Django application
This script ensures that the correct Django settings module is used
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def main():
    print("🚀 Starting Azure App Service Django application...")

    # Set the base directory
    BASE_DIR = Path(__file__).resolve().parent
    os.chdir(BASE_DIR)

    # Set Django settings module for Azure
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'data_analysis_api.settings_azure')
    print(f"✅ Django settings module: {os.environ.get('DJANGO_SETTINGS_MODULE')}")

    # Install dependencies
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements-prod.txt'], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return 1

    # Setup Django
    try:
        django.setup()
        print("✅ Django setup completed")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return 1

    # Collect static files
    print("📁 Collecting static files...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'], check=True)
        print("✅ Static files collected")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to collect static files: {e}")
        return 1

    # Run migrations
    print("🔄 Running database migrations...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'migrate', '--noinput'], check=True)
        print("✅ Migrations completed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return 1

    # Create superuser if needed
    print("👤 Setting up admin user...")
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'shell', '-c',
            """
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✅ Superuser created successfully')
else:
    print('ℹ️ Superuser already exists')
"""
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Superuser setup warning: {e}")

    # Start Gunicorn server
    print("🌐 Starting Gunicorn server...")
    try:
        subprocess.run([
            'gunicorn', 'data_analysis_api.wsgi:application',
            '--bind', '0.0.0.0:8000',
            '--workers', '2',
            '--timeout', '120',
            '--max-requests', '1000',
            '--max-requests-jitter', '100',
            '--access-logfile', '-',
            '--error-logfile', '-'
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Gunicorn failed to start: {e}")
        return 1
    except KeyboardInterrupt:
        print("🛑 Server stopped by user")
        return 0

    return 0

if __name__ == '__main__':
    sys.exit(main())
