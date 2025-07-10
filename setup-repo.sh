#!/bin/bash

echo "🚀 Setting up fresh repository for Render deployment..."

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Data Analysis App ready for Render deployment"

echo "✅ Repository initialized!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new GitHub repository"
echo "2. Add the remote: git remote add origin <your-repo-url>"
echo "3. Push: git push -u origin main"
echo "4. Go to Render.com and connect your GitHub repo"
echo "5. Deploy using the render.yaml configuration"
echo ""
echo "🎯 Your app will be deployed at: https://ai-analytics-backend.onrender.com"
