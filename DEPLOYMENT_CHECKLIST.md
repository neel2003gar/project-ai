# 🚀 Fresh Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Azure CLI installed and configured
- [ ] Git repository is up to date
- [ ] All changes committed and pushed
- [ ] Azure subscription is active

## 🔧 Backend Deployment (Azure)

### Step 1: Create Azure Resources
- [ ] Run the deployment script: `./fresh-deploy.sh` (Linux/Mac) or `fresh-deploy.bat` (Windows)
- [ ] Note down the Azure app name: `ai-analytics-backend-new`
- [ ] Resource group created: `ai-analytics-rg`

### Step 2: Configure GitHub Secrets
- [ ] Go to Azure Portal → App Services → `ai-analytics-backend-new`
- [ ] Click "Get publish profile" and download the file
- [ ] Copy the entire content of the downloaded file
- [ ] Go to GitHub repository → Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
- [ ] Value: Paste the publish profile content
- [ ] Click "Add secret"

### Step 3: Update Workflow File
- [ ] Verify `.github/workflows/azure-backend.yml` has correct app name
- [ ] Ensure it's using `requirements-prod.txt`
- [ ] Check the Python version is set to 3.11

### Step 4: Deploy Backend
- [ ] Push code to `main` branch
- [ ] Go to GitHub → Actions tab
- [ ] Wait for "Deploy Backend to Azure App Service" workflow to complete
- [ ] Verify backend is working: `https://ai-analytics-backend-new.azurewebsites.net`

## 🌐 Frontend Deployment (GitHub Pages)

### Step 1: Update Configuration
- [ ] Update `next.config.ts` with correct repository name
- [ ] Update `src/lib/config.ts` with Azure backend URL
- [ ] Verify basePath matches your repository name

### Step 2: Enable GitHub Pages
- [ ] Go to GitHub repository → Settings → Pages
- [ ] Source: Select "GitHub Actions"
- [ ] Save the settings

### Step 3: Deploy Frontend
- [ ] Push code to `main` branch (if not already done)
- [ ] Go to GitHub → Actions tab
- [ ] Wait for "Deploy Frontend to GitHub Pages" workflow to complete
- [ ] Verify frontend is working: `https://your-username.github.io/your-repository-name`

## 🔗 Post-Deployment Configuration

### Step 1: Update CORS Settings
- [ ] Verify `settings_azure.py` has correct GitHub Pages URL in CORS_ALLOWED_ORIGINS
- [ ] Push any CORS updates to trigger backend redeployment

### Step 2: Test Integration
- [ ] Open frontend URL
- [ ] Try uploading a CSV file
- [ ] Verify data analysis works
- [ ] Check all API endpoints are functioning

### Step 3: Security Configuration
- [ ] Verify HTTPS is working on both frontend and backend
- [ ] Check that sensitive data is not exposed
- [ ] Ensure secret keys are properly configured

## 🗄️ Database Setup (Optional but Recommended)

### Option 1: Keep SQLite (Simpler)
- [ ] Current setup uses SQLite (already configured)
- [ ] Data will be reset on each deployment
- [ ] Good for testing and demos

### Option 2: Use Azure PostgreSQL (Production)
- [ ] Create Azure Database for PostgreSQL
- [ ] Update Azure app settings with DATABASE_URL
- [ ] Run migrations after database setup

## 🧪 Final Testing

### Frontend Tests
- [ ] Page loads correctly
- [ ] Navigation works
- [ ] File upload interface is responsive
- [ ] Charts and visualizations display

### Backend Tests
- [ ] API endpoints respond correctly
- [ ] File uploads work
- [ ] Data processing completes
- [ ] Admin panel is accessible

### Integration Tests
- [ ] Frontend can communicate with backend
- [ ] CORS is properly configured
- [ ] Authentication works (if implemented)
- [ ] Error handling works properly

## 🎉 Deployment Complete!

### Your URLs:
- **Frontend**: `https://your-username.github.io/your-repository-name`
- **Backend**: `https://ai-analytics-backend-new.azurewebsites.net`
- **Admin Panel**: `https://ai-analytics-backend-new.azurewebsites.net/admin/`

### Monitoring:
- [ ] Set up Azure Application Insights (recommended)
- [ ] Monitor GitHub Actions for deployment status
- [ ] Check Azure logs for any errors

## 🔧 Troubleshooting

### Common Issues:
1. **CORS errors**: Check CORS_ALLOWED_ORIGINS in settings_azure.py
2. **404 on frontend**: Verify basePath in next.config.ts
3. **Backend not responding**: Check Azure logs and app settings
4. **GitHub Actions failing**: Check secrets and workflow files

### Quick Fixes:
- Restart Azure app service if needed
- Clear browser cache for frontend issues
- Check GitHub Actions logs for specific errors
- Verify all environment variables are set

---

## 📞 Support

If you encounter issues:
1. Check the deployment logs in GitHub Actions
2. Review Azure App Service logs
3. Verify all configuration files are correct
4. Ensure GitHub secrets are properly set

**Congratulations! Your AI Data Analysis app is now live! 🚀**
