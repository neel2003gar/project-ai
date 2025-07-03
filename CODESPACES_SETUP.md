# GitHub Codespaces Backend Setup

## Quick Start

1. **Open in Codespaces**:
   - Go to https://github.com/neel2003gar/ai-data-analysis-app
   - Click the green "Code" button
   - Select "Codespaces" tab
   - Click "Create codespace on main"

2. **Start the backend**:
   ```bash
   chmod +x start-codespaces-backend.sh
   ./start-codespaces-backend.sh
   ```

3. **Get your backend URL**:
   - When the server starts, Codespaces will show a popup about port 8000
   - Click "Open in Browser" or "Make Public"
   - Copy the URL (it will look like: `https://scaling-doodle-qj5wx946xqw39pvj-8000.app.github.dev`)

4. **Update the frontend config** (if URL changed):
   - Edit `src/lib/config.ts`
   - Update the Codespaces backend URL on line 12

## Current Configuration

Your backend is configured to:
- ✅ Allow CORS from GitHub Pages (`neel2003gar.github.io`)
- ✅ Allow all GitHub Codespaces domains
- ✅ Use SQLite database (no external database needed)
- ✅ Handle file uploads for datasets

## Troubleshooting

### If the backend URL changes:
1. Get the new URL from Codespaces
2. Update `src/lib/config.ts` line 12
3. Push changes to trigger frontend rebuild

### If CORS errors occur:
1. Make sure the Codespaces port 8000 is set to "Public"
2. Check that the frontend URL matches the CORS settings
3. Verify the backend is running with: `curl https://your-codespace-url.app.github.dev/api/`

## Backend API Endpoints

- `GET /api/` - API root
- `POST /api/datasets/upload/` - Upload datasets
- `GET /api/datasets/` - List datasets
- `POST /api/analytics/analyze/` - Run analysis
- Authentication endpoints under `/api/auth/`
