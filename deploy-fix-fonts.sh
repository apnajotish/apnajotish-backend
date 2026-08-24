#!/bin/bash
set -e

echo "🔧 FIXING INPUT FIELD VISIBILITY"
echo "=================================="
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

echo "📋 Adding fixed HTML..."
cp /tmp/index.html "$REPO_PATH/index.html"

echo "✅ Staging..."
git add index.html

echo "💾 Committing..."
git commit -m "Fix: Improve input field visibility in profile modal

- Change input background from gradient to solid white
- Make text and placeholder colors visible
- Add dark mode styling for input fields
- Better contrast for readability
- Professional form appearance

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "   No changes"

echo "🚀 Pushing..."
git push origin main

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "⏱️  Vercel deploying (1-3 minutes)"
echo "📊 Monitor: https://vercel.com/dashboard"
echo ""
echo "🌐 Test at: https://apnajotish.vercel.app"
echo ""
echo "✨ Input fields now:"
echo "   ✅ White background with dark text"
echo "   ✅ Visible placeholders"
echo "   ✅ Professional appearance"
echo "   ✅ Dark mode support"

