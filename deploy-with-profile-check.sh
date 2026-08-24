#!/bin/bash
set -e

echo "🚀 DEPLOYING PROFILE REQUIREMENT FEATURE"
echo "=========================================="
echo ""

REPO_PATH="$HOME/apnajotish-backend"
GITHUB_URL="https://github.com/apnajotish/apnajotish-backend.git"
GIT_USER="Ritesh Bhatia"
GIT_EMAIL="mb98gy6zr5@privaterelay.appleid.com"

if [ ! -d "$REPO_PATH" ]; then
    echo "📥 Cloning repository..."
    git clone "$GITHUB_URL" "$REPO_PATH"
fi

cd "$REPO_PATH"

git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"

echo "📤 Pulling latest changes..."
git pull origin main || true

echo "📋 Adding updated HTML with profile requirement..."
cp /tmp/index.html "$REPO_PATH/index.html"

echo "✅ Staging changes..."
git add index.html

echo "💾 Committing..."
git commit -m "Feature: Require profile completion before accessing services

- Show popup when user tries to access any astrology service
- Collect: Name, Email, Date of Birth, Birth Time, Birth Place
- Only allow access after profile is completed
- Save to browser storage (no re-entry needed)
- Better data collection and user personalization

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "   No new changes"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "⏱️  Vercel deploying now (1-3 minutes)"
echo "📊 Monitor: https://vercel.com/dashboard"
echo ""
echo "🌐 Test at: https://apnajotish.vercel.app"
echo ""
echo "✨ What's new:"
echo "   1. User visits home page"
echo "   2. Clicks 'Ask My Problem' or any service"
echo "   3. Popup asks for profile details"
echo "   4. User fills and continues"
echo "   5. Details saved - no more popups!"
echo ""
echo "🎯 After 3 min: Hard refresh (Ctrl+Shift+R) and test!"

