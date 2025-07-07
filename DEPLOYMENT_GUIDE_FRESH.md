# Fresh Deployment Guide 🚀

This guide provides step-by-step instructions for deploying your AI Data Analysis web app with the frontend on GitHub Pages and backend on Microsoft Azure.

## 📋 Prerequisites

Before starting the deployment, ensure you have:

1. **GitHub Account** with repository access
2. **Microsoft Azure Account** with an active subscription
3. **Azure CLI** installed on your local machine
4. **Git** configured with your GitHub credentials

## 🔧 Step 1: Backend Deployment to Azure

### 1.1 Create Azure Web App

```bash
# Login to Azure
az login

# Create a resource group (if not exists)
az group create --name ai-analytics-rg --location "East US"

# Create an Azure Web App
az webapp create \
  --resource-group ai-analytics-rg \
  --plan ai-analytics-plan \
  --name ai-analytics-backend-new \
  --runtime "PYTHON:3.11" \
  --sku B1
```

### 1.2 Configure Azure Web App Settings

```bash
# Set up application settings
az webapp config appsettings set \
  --resource-group ai-analytics-rg \
  --name ai-analytics-backend-new \
  --settings \
    DJANGO_SETTINGS_MODULE=data_analysis_api.settings_azure \
    SECRET_KEY="your-super-secret-key-here" \
    DEBUG=False \
    WEBSITES_PORT=8000 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### 1.3 Get Publish Profile

1. Go to Azure Portal → App Services → ai-analytics-backend-new
2. Click "Get publish profile"
3. Save the downloaded file content

### 1.4 Set GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add:

- **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
- **Value**: Content of the publish profile file you downloaded

## 🌐 Step 2: Frontend Deployment to GitHub Pages

### 2.1 Update Next.js Configuration

The `next.config.ts` file has been configured for GitHub Pages deployment with:
- Static export enabled
- Proper base path for your repository
- Image optimization disabled for static hosting

### 2.2 Update Repository Name in Configuration

In `next.config.ts`, update the `basePath` and `assetPrefix` to match your repository name:

```typescript
basePath: '/your-repository-name',
assetPrefix: '/your-repository-name/'
```

### 2.3 Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: "GitHub Actions"

## 🚀 Step 3: Deploy Both Services

### 3.1 Deploy Backend First

1. Push your code to the `main` or `master` branch:
```bash
git add .
git commit -m "Fresh backend deployment setup"
git push origin main
```

2. The Azure backend workflow will automatically trigger
3. Monitor the deployment in the Actions tab
4. Once completed, verify the backend is working at: `https://ai-analytics-backend-new.azurewebsites.net`

### 3.2 Deploy Frontend

1. The GitHub Pages workflow will automatically trigger after the push
2. Monitor the deployment in the Actions tab
3. Once completed, your frontend will be available at: `https://your-username.github.io/your-repository-name`

## 🔗 Step 4: Update CORS Settings

### 4.1 Update Backend CORS

In `backend/data_analysis_api/settings_azure.py`, update the CORS allowed origins:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-username.github.io",  # Your actual GitHub Pages domain
]
```

### 4.2 Update Frontend API URL

In `src/lib/config.ts`, verify the Azure backend URL is correct:

```typescript
return 'https://ai-analytics-backend-new.azurewebsites.net';
```

## 🗄️ Step 5: Database Setup (Optional)

### 5.1 Use Azure Database for PostgreSQL (Recommended for Production)

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group ai-analytics-rg \
  --name ai-analytics-db-server \
  --location "East US" \
  --admin-user dbadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name B_Gen5_1

# Create database
az postgres db create \
  --resource-group ai-analytics-rg \
  --server-name ai-analytics-db-server \
  --name ai_analytics_db
```

### 5.2 Update App Settings with Database URL

```bash
az webapp config appsettings set \
  --resource-group ai-analytics-rg \
  --name ai-analytics-backend-new \
  --settings \
    DATABASE_URL="postgresql://dbadmin:YourSecurePassword123!@ai-analytics-db-server.postgres.database.azure.com:5432/ai_analytics_db"
```

## 🧪 Step 6: Testing

### 6.1 Test Backend Endpoints

```bash
# Health check
curl https://ai-analytics-backend-new.azurewebsites.net/api/

# Admin panel
https://ai-analytics-backend-new.azurewebsites.net/admin/
```

### 6.2 Test Frontend

1. Visit your GitHub Pages URL
2. Try uploading a CSV file
3. Verify API calls are working

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your GitHub Pages domain is in CORS_ALLOWED_ORIGINS
2. **Static Files Not Loading**: Run `python manage.py collectstatic` in Azure console
3. **Database Errors**: Check DATABASE_URL configuration
4. **404 on GitHub Pages**: Verify basePath in next.config.ts matches repository name

### Debug Commands for Azure:

```bash
# View logs
az webapp log tail --resource-group ai-analytics-rg --name ai-analytics-backend-new

# SSH into the container
az webapp ssh --resource-group ai-analytics-rg --name ai-analytics-backend-new
```

## 📝 Maintenance

### Regular Updates:

1. **Security Updates**: Regularly update dependencies
2. **Database Backups**: Set up automated backups in Azure
3. **SSL Certificates**: Azure handles this automatically
4. **Monitoring**: Set up Azure Application Insights

## 🎉 Success!

Your application is now deployed with:
- ✅ Frontend on GitHub Pages (Free)
- ✅ Backend on Azure App Service
- ✅ Database on Azure (Optional)
- ✅ HTTPS/SSL enabled
- ✅ CI/CD pipelines configured

**Frontend URL**: `https://your-username.github.io/your-repository-name`
**Backend URL**: `https://ai-analytics-backend-new.azurewebsites.net`

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the GitHub Actions logs
2. Review Azure App Service logs
3. Verify all environment variables are set correctly
4. Ensure your GitHub repository has the correct permissions
