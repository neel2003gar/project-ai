"""
WSGI config for data_analysis_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Use Azure settings for production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'data_analysis_api.settings_azure')

application = get_wsgi_application()
