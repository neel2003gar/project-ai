# GitHub Pages Frontend Deployment Guide

## 📋 Prerequisites
- ✅ Backend deployed on Render: `https://ai-analytics-backend-099v.onrender.com`
- ✅ Repository: `https://github.com/neel2003gar/project-ai.git`
- ✅ GitHub Pages workflow configured
- ✅ Next.js configuration updated for static export

---

## 🚀 Steps to Deploy Frontend on GitHub Pages

### Step 1: Enable GitHub Pages

1. **Go to your GitHub repository**
   - Visit: https://github.com/neel2003gar/project-ai

2. **Access Repository Settings**
   - Click on **"Settings"** tab (top right of repository)

3. **Navigate to Pages Section**
   - Scroll down in left sidebar and click **"Pages"**

4. **Configure GitHub Pages**
   - **Source**: Select **"GitHub Actions"** (not Deploy from branch)
   - This allows the workflow to deploy automatically

### Step 2: Trigger Deployment

The deployment will trigger automatically when you push changes, but you can also trigger it manually:

1. **Go to Actions Tab**
   - Click **"Actions"** tab in your repository

2. **Find the Workflow**
   - Look for **"Deploy Frontend to GitHub Pages"**

3. **Manual Trigger (if needed)**
   - Click on the workflow
   - Click **"Run workflow"** button
   - Select **"main"** branch
   - Click **"Run workflow"**

### Step 3: Monitor Deployment

1. **Watch the Build Process**
   - Click on the running workflow to see live logs
   - Build process takes 3-7 minutes

2. **Build Steps to Watch For**:
   ```
   ✅ Checkout repository
   ✅ Setup Node.js
   ✅ Install dependencies
   ✅ Build Next.js application
   ✅ Upload Pages artifact
   ✅ Deploy to GitHub Pages
   ```

### Step 4: Access Your Deployed Frontend

Once deployment is successful:

**Your Frontend URL**: https://neel2003gar.github.io/project-ai/

---

## 🔧 Configuration Details

### Next.js Configuration (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  output: 'export',           // Static export for GitHub Pages
  trailingSlash: true,        // Required for GitHub Pages
  images: {
    unoptimized: true         // GitHub Pages doesn't support image optimization
  },
  basePath: '/project-ai',    // Repository name
  assetPrefix: '/project-ai/' // Asset path prefix
};
```

### Frontend API Configuration (`src/lib/config.ts`)
```typescript
// Production environment (GitHub Pages)
if (hostname.includes('github.io')) {
  // Render backend URL
  return 'https://ai-analytics-backend-099v.onrender.com';
}
```

---

## 🧪 Testing Your Deployed Application

### Frontend Testing
1. **Access**: https://neel2003gar.github.io/project-ai/
2. **Check**: Navigation, UI components, styling
3. **Verify**: No 404 errors for assets

### Backend Integration Testing
1. **API Connection**: Frontend should connect to Render backend
2. **Authentication**: Login/signup should work
3. **File Upload**: Test dataset upload functionality
4. **Analysis**: Test data analysis features

### Full Integration Testing
1. **Upload Dataset**: Use sample CSV file
2. **Run Analysis**: Generate charts and insights
3. **Download Results**: Export analysis results
4. **User Authentication**: Test login flow

---

## 🔍 Troubleshooting

### Common Issues

1. **404 Errors on Refresh**
   ```
   Solution: GitHub Pages + Next.js static export limitation
   Workaround: Use client-side routing only
   ```

2. **Assets Not Loading**
   ```
   Problem: Incorrect basePath configuration
   Solution: Ensure basePath matches repository name
   ```

3. **API Connection Fails**
   ```
   Problem: CORS or incorrect backend URL
   Solution: Verify backend URL in config.ts
   ```

4. **Build Fails**
   ```
   Problem: Node.js dependencies or build errors
   Solution: Check GitHub Actions logs for specific errors
   ```

### Check Build Logs
1. Go to **Actions** tab in GitHub
2. Click on failed/running deployment
3. Expand log sections to see detailed errors

---

## 📊 Expected Results

After successful deployment:

### ✅ Frontend Deployed
- **URL**: https://neel2003gar.github.io/project-ai/
- **Status**: Live and accessible
- **Assets**: All CSS, JS, images loading correctly

### ✅ Backend Integration
- **API**: Connected to Render backend
- **CORS**: Properly configured
- **Authentication**: Working end-to-end

### ✅ Full Application
- **Upload**: Dataset upload functional
- **Analysis**: Data processing working
- **Visualization**: Charts and graphs displaying
- **Export**: Results downloadable

---

## 🔄 Auto-Deployment

Your workflow is configured for auto-deployment:

**Triggers**:
- Push to `main` branch
- Changes to frontend files (`src/`, `public/`, `package.json`, etc.)
- Manual workflow dispatch

**No manual deployment needed** - just push your changes!

---

## 📝 Quick Commands

### Force Deployment
```bash
# Make a small change and push to trigger deployment
git commit --allow-empty -m "Trigger GitHub Pages deployment"
git push origin main
```

### Check Deployment Status
1. Visit: https://github.com/neel2003gar/project-ai/actions
2. Look for "Deploy Frontend to GitHub Pages" workflow

---

**Your frontend will be live at: https://neel2003gar.github.io/project-ai/** 🎉
