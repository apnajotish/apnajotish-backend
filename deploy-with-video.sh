#!/bin/bash
set -e

echo "🎬 DEPLOYING VIDEO + MOBILE OPTIMIZATION"
echo "========================================="
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
git pull origin main || true

echo "📋 Adding video and updated HTML..."
cp /tmp/apnajotish-intro.mp4 "$REPO_PATH/apnajotish-intro.mp4"
cp /tmp/index.html "$REPO_PATH/index.html"

echo "✅ Staging files..."
git add index.html apnajotish-intro.mp4

echo "💾 Committing..."
git commit -m "Feature: Add intro video and mobile optimization

- Add video player on first page load
- Auto-play with skip option
- Mobile-friendly responsive design
- Proper viewport settings for all devices
- Video: apnajotish-intro.mp4 (2.6MB)
- Optimized for phones, tablets, desktops

Mobile improvements:
  ✅ Responsive layout
  ✅ Touch-friendly buttons
  ✅ Proper viewport scaling
  ✅ Playsinline video support
  ✅ Mobile-optimized spacing

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "   No changes"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DEPLOYMENT STARTED!"
echo ""
echo "⏱️  Vercel deploying (1-3 minutes)"
echo "📊 Monitor: https://vercel.com/dashboard"
echo ""
echo "🌐 Test at: https://apnajotish.vercel.app"
echo ""
echo "✨ What's new:"
echo "   🎬 Intro video plays on first load"
echo "   📱 Fully mobile-optimized"
echo "   👆 Click/tap to skip video"
echo "   ✨ Responsive design for all devices"
echo ""
echo "📱 Mobile features:"
echo "   ✅ Auto-scaling for all screen sizes"
echo "   ✅ Touch-friendly interface"
echo "   ✅ Fast loading on mobile networks"
echo "   ✅ Proper video playback on iOS/Android"

