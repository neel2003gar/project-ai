@echo off
REM Fresh Deployment Setup Script for Windows
REM This script helps you set up a fresh deployment for your AI Data Analysis app

echo 🚀 AI Data Analysis App - Fresh Deployment Setup
echo ================================================

REM Check if Azure CLI is installed
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Azure CLI is not installed. Please install it first:
    echo https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
    pause
    exit /b 1
)

REM Check if user is logged into Azure
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] You are not logged into Azure. Logging in now...
    az login
)

echo [INFO] Current Azure subscription:
az account show --query "name" -o tsv

REM Get user inputs
set /p RESOURCE_GROUP="Enter your Azure resource group name (default: ai-analytics-rg): "
if "%RESOURCE_GROUP%"=="" set RESOURCE_GROUP=ai-analytics-rg

set /p APP_NAME="Enter your Azure app name (default: neel-ai-analytics-backend): "
if "%APP_NAME%"=="" set APP_NAME=neel-ai-analytics-backend

set /p LOCATION="Enter your Azure region (default: East US): "
if "%LOCATION%"=="" set LOCATION=East US

set /p GITHUB_USERNAME="Enter your GitHub username: "
if "%GITHUB_USERNAME%"=="" (
    echo [ERROR] GitHub username is required
    pause
    exit /b 1
)

set /p REPO_NAME="Enter your GitHub repository name: "
if "%REPO_NAME%"=="" (
    echo [ERROR] Repository name is required
    pause
    exit /b 1
)

echo [INFO] Creating Azure resources...

REM Create resource group
echo [INFO] Creating resource group: %RESOURCE_GROUP%
az group create --name "%RESOURCE_GROUP%" --location "%LOCATION%"

REM Create app service plan
echo [INFO] Creating app service plan...
az appservice plan create --name "%APP_NAME%-plan" --resource-group "%RESOURCE_GROUP%" --sku B1 --is-linux

REM Create web app
echo [INFO] Creating web app: %APP_NAME%
az webapp create --resource-group "%RESOURCE_GROUP%" --plan "%APP_NAME%-plan" --name "%APP_NAME%" --runtime "PYTHON:3.11"

REM Configure app settings
echo [INFO] Configuring app settings...
az webapp config appsettings set --resource-group "%RESOURCE_GROUP%" --name "%APP_NAME%" --settings DJANGO_SETTINGS_MODULE=data_analysis_api.settings_azure DEBUG=False WEBSITES_PORT=8000 SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITE_RUN_FROM_PACKAGE=1

echo [SUCCESS] Azure resources created successfully!

echo.
echo [INFO] Next steps:
echo 1. Get the publish profile from Azure Portal and add it to GitHub Secrets
echo 2. Go to: https://portal.azure.com → App Services → %APP_NAME% → Get publish profile
echo 3. Add the content as AZURE_WEBAPP_PUBLISH_PROFILE in GitHub Secrets
echo 4. Enable GitHub Pages in your repository settings
echo 5. Push your code to trigger the deployment

echo.
echo [INFO] Your URLs will be:
echo Frontend: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%
echo Backend:  https://%APP_NAME%.azurewebsites.net

echo.
echo [SUCCESS] Setup completed! 🎉
pause
