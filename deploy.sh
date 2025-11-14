#!/bin/bash

echo "🎮 Bouvet Values Arcade - Quick Deploy Script"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Bouvet Values Arcade"
    echo "✅ Git repository initialized!"
    echo ""
fi

# Get GitHub username and repo name
echo "Enter your GitHub username:"
read username

echo "Enter your repository name (e.g., bouvet-arcade):"
read reponame

# Update vite.config.js with correct base path
echo "📝 Updating vite.config.js..."
sed -i.bak "s|base: '/cursor/'|base: '/$reponame/'|g" vite.config.js
rm vite.config.js.bak

echo "✅ Configuration updated!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "   - Name it: $reponame"
echo "   - Make it public"
echo "   - Don't initialize with README"
echo ""
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/$username/$reponame.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to Settings → Pages"
echo "   - Source: GitHub Actions"
echo ""
echo "4. Your game will be live at:"
echo "   https://$username.github.io/$reponame/"
echo ""
echo "🎉 Happy gaming!"

