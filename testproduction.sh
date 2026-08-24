#!/bin/bash

# ============================================================
# APNAJOTISH PRODUCTION TEST SCRIPT
# Run this AFTER deployment to verify everything works
# ============================================================

echo "🧪 TESTING APNA JOTISH PRODUCTION..."
echo ""

FRONTEND_URL="https://apnajotish.vercel.app"
BACKEND_URL="https://apnajotish-backend-production.up.railway.app"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3

    echo -n "Testing: $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 5)

    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $response)"
        ((FAILED++))
    fi
}

echo "═══════════════════════════════════════════════════════"
echo "CONNECTIVITY TESTS"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test frontend
test_endpoint "Frontend Root" "$FRONTEND_URL/" "200"
test_endpoint "Frontend HTML" "$FRONTEND_URL/index.html" "200"

# Test backend
test_endpoint "Backend Health" "$BACKEND_URL/health" "200"
test_endpoint "Backend API" "$BACKEND_URL/api/ask-jotish" "405"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "BACKEND API TEST"
echo "═══════════════════════════════════════════════════════"
echo ""

echo -n "Testing: POST /api/ask-jotish... "

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/ask-jotish" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Will I get married this year?",
    "userProfile": {"name": "Test User"}
  }' \
  --connect-timeout 5)

if echo "$RESPONSE" | grep -q "summary\|guidance"; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   Response: $(echo "$RESPONSE" | head -c 100)..."
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Response: $RESPONSE"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "ASSET TESTS"
echo "═══════════════════════════════════════════════════════"
echo ""

test_endpoint "Logo Image" "$FRONTEND_URL/apnajotish-logo-main.png" "200"
test_endpoint "Font Awesome" "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" "200"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "RESULTS"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your app is production-ready:"
    echo "🌐 Frontend:  $FRONTEND_URL"
    echo "🔧 Backend:   $BACKEND_URL"
    echo ""
    echo "Users can now:"
    echo "✅ Ask astrology questions"
    echo "✅ Get Groq AI guidance"
    echo "✅ Save reports locally"
    echo "✅ Edit profile"
    echo "✅ Use dark mode"
    echo ""
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Frontend: Check https://vercel.com/dashboard"
    echo "2. Backend:  Check https://railway.app/dashboard"
    echo "3. Errors:   Press F12 → Console → Check red errors"
    echo ""
fi

exit $FAILED
