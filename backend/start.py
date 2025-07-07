#!/usr/bin/env python3
import os
import subprocess
import sys

print("=== AZURE STARTUP DEBUG ===")
print(f"Python path: {sys.executable}")
print(f"Working directory: {os.getcwd()}")
print(f"PORT: {os.environ.get('PORT', 'NOT SET')}")
print(f"Files in directory: {os.listdir('.')}")

# Try to start the test app first
try:
    port = os.environ.get('PORT', '8000')
    print(f"Starting test application on port {port}")

    # Set Django settings
    os.environ['DJANGO_SETTINGS_MODULE'] = 'data_analysis_api.settings_azure'

    # Try simple gunicorn command
    cmd = ['gunicorn', '--bind', f'0.0.0.0:{port}', '--workers', '1', '--timeout', '600', 'test_app:application']
    print(f"Command: {' '.join(cmd)}")
    subprocess.run(cmd)

except Exception as e:
    print(f"Error: {e}")
    # Fallback to Django
    try:
        cmd = ['gunicorn', '--bind', f'0.0.0.0:{port}', '--workers', '1', '--timeout', '600', 'data_analysis_api.wsgi:application']
        print(f"Fallback command: {' '.join(cmd)}")
        subprocess.run(cmd)
    except Exception as e2:
        print(f"Fallback error: {e2}")
        sys.exit(1)
