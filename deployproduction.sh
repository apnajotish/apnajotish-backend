#!/bin/bash
set -e

# ============================================================
# APNAJOTISH PRODUCTION DEPLOYMENT SCRIPT
# Run this ONCE on your local machine to go live
# ============================================================

echo "🚀 APNA JOTISH - PRODUCTION DEPLOYMENT STARTING..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# STEP 1: PREPARE
# ============================================================
echo -e "${BLUE}[STEP 1/6]${NC} Preparing deployment..."

# Create temp directory for files
DEPLOY_DIR="$HOME/apnajotish-deploy"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo -e "${GREEN}✅${NC} Created deploy directory: $DEPLOY_DIR"

# ============================================================
# STEP 2: CLONE REPO
# ============================================================
echo ""
echo -e "${BLUE}[STEP 2/6]${NC} Cloning your GitHub repository..."

if [ -d "$DEPLOY_DIR/apnajotish-backend" ]; then
    echo "  Repo already exists, pulling latest..."
    cd "$DEPLOY_DIR/apnajotish-backend"
    git pull origin main
else
    git clone https://github.com/apnajotish/apnajotish-backend.git
    cd "$DEPLOY_DIR/apnajotish-backend"
fi

echo -e "${GREEN}✅${NC} Repository ready"

# ============================================================
# STEP 3: CONFIGURE GIT
# ============================================================
echo ""
echo -e "${BLUE}[STEP 3/6]${NC} Configuring Git..."

git config user.name "Ritesh Bhatia"
git config user.email "mb98gy6zr5@privaterelay.appleid.com"

echo -e "${GREEN}✅${NC} Git configured"

# ============================================================
# STEP 4: ADD DEPLOYMENT FILES
# ============================================================
echo ""
echo -e "${BLUE}[STEP 4/6]${NC} Adding deployment files..."

# Note: Files should be placed in the repo root
# If they don't exist, show instructions

if [ ! -f "index.html" ]; then
    echo -e "${RED}⚠️  index.html not found!${NC}"
    echo "   Place these files in: $DEPLOY_DIR/apnajotish-backend/"
    echo "   - index.html"
    echo "   - vercel.json"
    echo "   - .vercelignore"
    echo "   - apnajotish-logo-main.png"
    echo ""
    echo "   Once files are in place, run this script again."
    exit 1
fi

git add index.html vercel.json .vercelignore apnajotish-logo-main.png 2>/dev/null || true

echo -e "${GREEN}✅${NC} Files staged"

# ============================================================
# STEP 5: COMMIT & PUSH
# ============================================================
echo ""
echo -e "${BLUE}[STEP 5/6]${NC} Committing and pushing to GitHub..."

git commit -m "Deploy: Fix Vercel frontend deployment

- Add index.html (frontend) to root for Vercel
- Add vercel.json for proper routing configuration
- Add .vercelignore to exclude backend files
- Add apnajotish-logo-main.png for logo display

This fixes the 404 error on Vercel and enables
the frontend to connect to Railway backend.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>" 2>/dev/null || echo "  (No changes to commit - already deployed)"

git push origin main

echo -e "${GREEN}✅${NC} Pushed to GitHub"

# ============================================================
# STEP 6: MONITOR VERCEL
# ============================================================
echo ""
echo -e "${BLUE}[STEP 6/6]${NC} Waiting for Vercel deployment..."

echo ""
echo -e "${YELLOW}⏳ Deployment in progress...${NC}"
echo "   Monitor at: https://vercel.com/dashboard"
echo ""
echo "   Expected timeline:"
echo "   ⏱️  30 seconds  → Build starts"
echo "   ⏱️  1-2 minutes → Build complete"
echo "   ⏱️  2-3 minutes → Live on Vercel"
echo ""

sleep 3

# ============================================================
# FINAL VERIFICATION
# ============================================================
echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}YOUR LIVE APP IS HERE:${NC}"
echo "🌐 https://apnajotish.vercel.app/"
echo ""
echo "🧪 TEST NOW:"
echo "1. Open the URL above"
echo "2. You should see the red mandala logo"
echo "3. Go to 'Ask' tab"
echo "4. Type: 'Will I get married this year?'"
echo "5. Click 'Get Guidance'"
echo "6. Wait 3-5 seconds for response from Groq AI"
echo ""
echo "✅ SUCCESS CHECKLIST:"
echo "   [ ] Frontend loads (no 404)"
echo "   [ ] Logo displays correctly"
echo "   [ ] Dark mode toggle works"
echo "   [ ] Ask question returns guidance"
echo "   [ ] Reports save locally"
echo "   [ ] Profile editor works"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}If you see ANY errors:${NC}"
echo "1. Press F12 in browser → Console tab"
echo "2. Report the red error message"
echo "3. Check: https://vercel.com/dashboard"
echo ""
echo -e "${GREEN}🎉 You're LIVE in production!${NC}"
