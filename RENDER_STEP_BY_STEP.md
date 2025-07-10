# Render.com Deployment - Step by Step Guide

## Prerequisites

- ✅ GitHub repository: `https://github.com/neel2003gar/project-ai.git`
- ✅ Project cleaned and configured for Render
- ✅ `render.yaml` file ready

---

## Step 1: Create Render Account

1. **Go to Render.com**
   - Visit: <https://render.com>
   - Click "Get Started for Free"

2. **Sign Up Options**
   - **Recommended**: Sign up with GitHub (easier integration)
   - Alternative: Sign up with email
   - Complete account verification if required

---

## Step 2: Connect GitHub Repository

1. **Access Dashboard**
   - After login, you'll see the Render dashboard
   - Click the "New +" button (top right)

2. **Select Service Type**
   - Click "Web Service"
   - You'll see "Connect a repository" section

3. **Connect GitHub**
   - If not already connected, click "Connect GitHub"
   - Authorize Render to access your repositories
   - You may need to install the Render GitHub app

4. **Select Repository**
   - Find and select: `neel2003gar/project-ai`
   - Click "Connect"

---

## Step 3: Configure Web Service

### 3.1 Basic Configuration

Render will auto-detect your `render.yaml` file and show:

```
✅ Blueprint Detected: render.yaml found
✅ Service: ai-analytics-backend (Web Service)
```

### 3.2 Verify Settings

Check that these settings match your `render.yaml`:

- **Name**: `ai-analytics-backend`
- **Environment**: `Python`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Build Command**:

  ```
  cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
  ```

- **Start Command**:

  ```
  cd backend && gunicorn --bind=0.0.0.0:$PORT data_analysis_api.wsgi:application
  ```

### 3.3 Environment Variables

Verify these environment variables are set:

- `DJANGO_SETTINGS_MODULE`: `data_analysis_api.settings_render`
- `SECRET_KEY`: (Auto-generated)
- `DEBUG`: `False`
- `PORT`: `10000` (Render's standard port)
- `PYTHON_VERSION`: `3.11.0`

**Note**: Render automatically provides the `PORT` environment variable set to `10000`. The start command uses `$PORT` to bind to this port correctly.

---

## Step 4: Deploy the Service

1. **Review Configuration**
   - Scroll down to review all settings
   - Ensure "Auto-Deploy" is enabled (deploys on git push)

2. **Create Web Service**
   - Click "Create Web Service"
   - Render will start the deployment process

3. **Monitor Deployment**
   - You'll see the build logs in real-time
   - Initial deployment takes 5-15 minutes

---

## Step 5: Monitor Build Process

### 5.1 Build Logs

Watch for these key steps:

```
✅ Cloning repository
✅ Installing Python dependencies
✅ Collecting static files
✅ Running database migrations
✅ Starting gunicorn server
```

### 5.2 Common Build Issues

If you see errors:

- **Dependencies**: Check `backend/requirements.txt`
- **Static files**: Ensure `STATIC_ROOT` is set in settings
- **Database**: Migration errors (usually auto-resolve)
- **Port binding**: Should bind to `$PORT` (already configured)

---

## Step 6: Access Your Deployed Backend

### 6.1 Get Service URL

Once deployed successfully:

- Your service URL will be: `https://ai-analytics-backend.onrender.com`
- Click the URL to test your backend

### 6.2 Test Backend Endpoints

Test these endpoints:

- **Health Check**: `https://ai-analytics-backend.onrender.com/api/`
- **Authentication**: `https://ai-analytics-backend.onrender.com/auth/`
- **Analytics**: `https://ai-analytics-backend.onrender.com/analytics/`

---

## Step 7: Update Frontend Configuration (If Needed)

If Render assigns a different URL than expected:

1. **Check Actual URL**
   - Note the exact URL from Render dashboard

2. **Update Frontend Config**
   - Edit `src/lib/config.ts`
   - Update the Render backend URL:

   ```typescript
   if (hostname.includes('github.io')) {
     return 'https://YOUR-ACTUAL-RENDER-URL.onrender.com';
   }
   ```

3. **Commit and Push**

   ```bash
   git add src/lib/config.ts
   git commit -m "Update backend URL for Render deployment"
   git push origin main
   ```

---

## Step 8: Deploy Frontend

### Option A: Vercel (Recommended)

1. Go to <https://vercel.com>
2. Import your GitHub repository
3. Deploy the Next.js frontend

### Option B: Netlify

1. Go to <https://netlify.com>
2. Connect GitHub repository
3. Deploy frontend

### Option C: GitHub Pages (Already configured)

1. Your frontend workflow is in `.github/workflows/github-pages.yml`
2. Should auto-deploy to: `https://neel2003gar.github.io/project-ai/`

---

## Step 9: Test Full Application

1. **Backend Testing**
   - API endpoints respond correctly
   - Authentication works
   - File uploads function

2. **Frontend Testing**
   - Can connect to backend
   - All features work end-to-end
   - CORS issues resolved

3. **Integration Testing**
   - Upload datasets
   - Generate analysis
   - View visualizations

---

## Step 10: Set Up Monitoring (Optional)

1. **Render Dashboard**
   - Monitor service health
   - View logs and metrics
   - Set up alerts

2. **Auto-Deploy**
   - Every push to `main` branch will auto-deploy
   - Monitor deployments in Render dashboard

---

## Troubleshooting

### Common Issues

1. **Build Fails**

   ```text
   Solution: Check requirements.txt, ensure all dependencies are listed
   ```

2. **Server Won't Start**

   ```text
   Solution: Verify WSGI configuration, check start command
   ```

3. **Port Binding Issues**

   ```text
   Problem: Server fails to start due to port binding
   Solution: Ensure start command uses $PORT variable (Render sets PORT=10000)
   Verify: cd backend && gunicorn --bind=0.0.0.0:$PORT data_analysis_api.wsgi:application
   ```

4. **Static Files Missing**

   ```text
   Solution: Ensure collectstatic runs in build command
   ```

5. **Database Errors**

   ```text
   Solution: Check migration files, ensure PostgreSQL compatibility
   ```

6. **CORS Errors**

   ```text
   Solution: Verify CORS settings in Django settings_render.py
   ```

---

## Expected Results

After successful deployment:

- ✅ Backend API running on Render
- ✅ Database migrations completed
- ✅ Static files served
- ✅ Authentication endpoints working
- ✅ Analytics API functional
- ✅ Frontend can connect to backend

---

## Support

- **Render Documentation**: <https://render.com/docs>
- **Django on Render**: <https://render.com/docs/deploy-django>
- **Your Repository**: <https://github.com/neel2003gar/project-ai.git>

---

**Ready to deploy? Start with Step 1!** 🚀
