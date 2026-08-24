#!/bin/bash
set -e

echo "🎨 DEPLOYING GOLDEN GRADIENT BACKGROUND"
echo "========================================"
echo ""

REPO_PATH="$HOME/apnajotish-backend"
GITHUB_URL="https://github.com/apnajotish/apnajotish-backend.git"
GIT_USER="Ritesh Bhatia"
GIT_EMAIL="mb98gy6zr5@privaterelay.appleid.com"

# Check if repo exists
if [ ! -d "$REPO_PATH" ]; then
    echo "📥 Cloning repository..."
    git clone "$GITHUB_URL" "$REPO_PATH"
fi

cd "$REPO_PATH"

# Configure git
git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"

# Pull latest
echo "📤 Pulling latest changes..."
git pull origin main || true

# Copy updated HTML
echo "🎨 Adding gradient background update..."
cp /tmp/index.html "$REPO_PATH/index.html"

# Stage and commit
echo "✅ Staging changes..."
git add index.html

echo "💾 Committing..."
git commit -m "Design: Add golden gradient background matching logo

- Website now has orange-to-yellow gradient (E89068 → FDD789)
- Matches the beautiful gradient in the logo
- Creates unified, cohesive visual design
- Dark mode has complementary brown/orange gradient
- Smooth transitions between light and dark modes

Design Update:
  Light Mode: #E89068 (orange) → #FDD789 (gold)
  Dark Mode:  #2D2419 → #4A3820 (dark brown/orange)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "   No new changes"

# Push
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DEPLOYMENT STARTED!"
echo ""
echo "⏱️  Vercel will deploy in 1-3 minutes"
echo "📊 Monitor: https://vercel.com/dashboard"
echo ""
echo "🌐 After deployment:"
echo "   1. Go to: https://apnajotish.vercel.app"
echo "   2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "   3. Clear cache: F12 → Application → Clear All"
echo ""
echo "✨ You should see:"
echo "   🌅 Beautiful orange-to-yellow gradient background"
echo "   🔴 Logo perfectly integrated with website colors"
echo "   😍 Unified, cohesive design!"

