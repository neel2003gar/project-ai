#!/usr/bin/env python3
import os
import subprocess

# Set Django settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'data_analysis_api.settings_azure'

# Get port from Azure
port = os.environ.get('PORT', '8000')

# Start gunicorn directly
cmd = [
    'gunicorn',
    '--bind', f'0.0.0.0:{port}',
    '--workers', '1',
    '--timeout', '600',
    'data_analysis_api.wsgi:application'
]

print(f"Starting: {' '.join(cmd)}")
subprocess.run(cmd)
