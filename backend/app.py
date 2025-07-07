#!/usr/bin/env python3
"""
Simple application entry point for Azure App Service
"""
import os
import sys
import django
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'data_analysis_api.settings_azure')

# Setup Django
django.setup()

# Import the WSGI application
from data_analysis_api.wsgi import application

if __name__ == "__main__":
    # For development server
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
