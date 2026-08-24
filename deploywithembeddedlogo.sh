#!/bin/bash
set -e

echo "🚀 FIXING LOGO ANIMATION & DISPLAY"
echo "===================================="
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

# Copy the updated HTML with embedded logo
echo "📋 Copying updated HTML with embedded logo..."
cp /tmp/index.html "$REPO_PATH/index.html"

# Stage changes
echo "✅ Staging files..."
git add index.html

# Create commit
echo "💾 Committing with embedded logo..."
git commit -m "Fix: Embed logo image directly for splash screen and home page

- Logo now embedded as base64 data URI in HTML
- Splash screen: animated zoom and glow effects on load
- Home page: logo displays with proper sizing
- Click text: 'enter the world of predictions'
- No external file dependencies - guaranteed to load

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "   No new changes"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DEPLOYMENT STARTED!"
echo ""
echo "🔄 Vercel will auto-deploy in 1-3 minutes"
echo "📊 Monitor at: https://vercel.com/dashboard"
echo ""
echo "🌐 After deployment, go to:"
echo "   https://apnajotish.vercel.app"
echo ""
echo "⏱️  DO THIS:"
echo "   1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   2. Clear browser storage: F12 → Application → Clear All"
echo "   3. Reload the page"
echo ""
echo "🎨 YOU SHOULD SEE:"
echo "   ✨ Animated red mandala logo zooming in"
echo "   📝 'Click to enter the world of predictions' text"
echo "   ✋ '👆 Tap to continue' footer"
echo "   (Animation lasts ~3 seconds, then tap to enter app)"
echo ""
echo "After animation, home page should show logo at top!"

