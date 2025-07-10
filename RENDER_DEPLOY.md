# 🚀 Render Deployment Guide

## Quick Deploy Steps

### 1. Create New GitHub Repository
1. Go to GitHub and create a new repository (e.g., `ai-data-analysis-app`)
2. Don't initialize with README (we already have files)

### 2. Push Code to GitHub
```bash
# Run the setup script
bash setup-repo.sh

# Add your GitHub repo URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy on Render
1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Deploy"**

### 4. Update Frontend Configuration (if needed)
If Render assigns a different URL than `ai-analytics-backend.onrender.com`, update:
- `src/lib/config.ts` - Change the Render backend URL
- Commit and push the changes
- Redeploy frontend on GitHub Pages

## 🎯 Expected URLs
- **Backend**: https://ai-analytics-backend.onrender.com
- **Frontend**: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/

## 📝 Configuration Files
- `render.yaml` - Render deployment configuration
- `backend/data_analysis_api/settings_render.py` - Django settings for Render
- `src/lib/config.ts` - Frontend API configuration

## 🔧 Environment Variables
Automatically configured in `render.yaml`:
- `DJANGO_SETTINGS_MODULE=data_analysis_api.settings_render`
- `SECRET_KEY` (auto-generated)
- `DEBUG=False`
- `PYTHON_VERSION=3.11.0`

## ✅ All Set!
Your app is now configured for easy Render deployment!
