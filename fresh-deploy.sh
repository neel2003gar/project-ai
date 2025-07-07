#!/bin/bash

# Fresh Deployment Setup Script
# This script helps you set up a fresh deployment for your AI Data Analysis app

set -e  # Exit on any error

echo "🚀 AI Data Analysis App - Fresh Deployment Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged into Azure
if ! az account show &> /dev/null; then
    print_warning "You are not logged into Azure. Logging in now..."
    az login
fi

print_status "Current Azure subscription:"
az account show --query "name" -o tsv

# Get user inputs
read -p "Enter your Azure resource group name (default: ai-analytics-rg): " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-ai-analytics-rg}

read -p "Enter your Azure app name (default: ai-analytics-backend-new): " APP_NAME
APP_NAME=${APP_NAME:-ai-analytics-backend-new}

read -p "Enter your Azure region (default: East US): " LOCATION
LOCATION=${LOCATION:-"East US"}

read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required"
    exit 1
fi

read -p "Enter your GitHub repository name: " REPO_NAME
if [ -z "$REPO_NAME" ]; then
    print_error "Repository name is required"
    exit 1
fi

# Generate a secure secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

print_status "Creating Azure resources..."

# Create resource group
print_status "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create app service plan
print_status "Creating app service plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group "$RESOURCE_GROUP" \
    --sku B1 \
    --is-linux

# Create web app
print_status "Creating web app: $APP_NAME"
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "${APP_NAME}-plan" \
    --name "$APP_NAME" \
    --runtime "PYTHON:3.11"

# Configure app settings
print_status "Configuring app settings..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --settings \
        DJANGO_SETTINGS_MODULE=data_analysis_api.settings_azure \
        SECRET_KEY="$SECRET_KEY" \
        DEBUG=False \
        WEBSITES_PORT=8000 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
        WEBSITE_RUN_FROM_PACKAGE=1

# Update configuration files
print_status "Updating configuration files..."

# Update next.config.ts
cat > next.config.ts << EOF
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: '/$REPO_NAME',
  assetPrefix: '/$REPO_NAME/'
};

export default nextConfig;
EOF

# Update config.ts
cat > src/lib/config.ts << EOF
// API Configuration
// This file handles the API base URL for different environments
// Updated for Azure backend deployment

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production environment (GitHub Pages)
    if (hostname.includes('github.io')) {
      // Azure backend URL
      return 'https://$APP_NAME.azurewebsites.net';
    }

    // GitHub Codespaces development environment
    if (hostname.includes('github.dev')) {
      const codespace = hostname.split('.')[0];
      return \`https://\${codespace}-8000.app.github.dev\`;
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      // LAN access (mobile devices)
      return 'http://192.168.1.33:8000';
    }
  }

  // Server-side rendering fallback (Azure backend)
  return 'https://$APP_NAME.azurewebsites.net';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
  return \`\${API_BASE_URL}/api\${endpoint.startsWith('/') ? endpoint : \`/\${endpoint}\`}\`;
};

// Export for use in components
const config = {
  API_BASE_URL,
  getApiUrl,
};

export default config;
EOF

# Update Azure backend workflow
sed -i "s/AZURE_WEBAPP_NAME: .*/AZURE_WEBAPP_NAME: $APP_NAME/" .github/workflows/azure-backend.yml

# Update Django settings
cat > backend/data_analysis_api/settings_azure.py << EOF
"""
Azure Production Settings for Data Analysis API
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='$SECRET_KEY')
DEBUG = False

ALLOWED_HOSTS = [
    '$APP_NAME.azurewebsites.net',
    '*.azurewebsites.net',
    'localhost',
    '127.0.0.1',
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'analytics',
    'authentication',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'data_analysis_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'data_analysis_api.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FileUploadParser',
    ]
}

CORS_ALLOWED_ORIGINS = [
    "https://$GITHUB_USERNAME.github.io",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
EOF

print_success "Azure resources created successfully!"
print_success "Configuration files updated!"

echo ""
print_status "Next steps:"
echo "1. Get the publish profile from Azure Portal and add it to GitHub Secrets"
echo "2. Go to: https://portal.azure.com → App Services → $APP_NAME → Get publish profile"
echo "3. Add the content as AZURE_WEBAPP_PUBLISH_PROFILE in GitHub Secrets"
echo "4. Enable GitHub Pages in your repository settings"
echo "5. Push your code to trigger the deployment"

echo ""
print_status "Your URLs will be:"
echo "Frontend: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo "Backend:  https://$APP_NAME.azurewebsites.net"

echo ""
print_success "Setup completed! 🎉"
