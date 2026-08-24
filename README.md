# Apna Jotish Backend - Groq Powered

A free, open-source Vedic astrology guidance platform powered by Groq's mixtral-8x7b LLM.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm 6+
- Groq API key (free from https://console.groq.com)

### Installation

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy and edit .env file
   # Add your GROQ_API_KEY=gsk_xxxxx
   ```

3. **Run locally:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

4. **Test health check:**
   ```bash
   curl http://localhost:3000/health
   ```

## 📡 API Endpoints

### Core AI Endpoint
**POST /api/ask-jotish**
- Input: `question` (string), optional `userProfile` (object)
- Response: AI guidance using 12 spiritual systems analysis
- Format: `[ANALYSIS], [INSIGHT], [REMEDIES], [TIMING], [GUIDANCE]`

Example:
```bash
curl -X POST http://localhost:3000/api/ask-jotish \
  -H "Content-Type: application/json" \
  -d '{
    "question": "When will I get married?",
    "userProfile": {
      "name": "Seeker",
      "dob": "1995-03-15",
      "time": "14:30",
      "place": "Mumbai",
      "lagna": "Libra"
    }
  }'
```

### Other Endpoints
- `GET /health` - Health check
- `POST /api/auth/register` - User registration (stub)
- `POST /api/auth/login` - User login (stub)
- `GET /api/user/profile/:userId` - Get profile (stub)
- `POST /api/user/profile/:userId` - Update profile (stub)
- `GET /api/reports/:userId` - Get reports (stub)
- `POST /api/reports/:userId` - Save report (stub)
- `POST /api/payments/create-order` - Create payment order (stub)
- `POST /api/payments/verify` - Verify payment (stub)

## 🤖 AI Engine

**Model:** Mixtral-8x7b-32768 (Groq)
**Free Tier:** 9,000 requests/month (enough for 500+ users)
**Cost:** Always free for reasonable usage

## 🧠 12 Spiritual Systems

The AI analyzes questions through:
1. Astrology (birth chart, transits, Mahadasha)
2. Numerology (life path, destiny number)
3. Tarot (card meanings)
4. Vastu Shastra (spatial harmony)
5. Lal Kitab (planetary remedies)
6. Palmistry (hand analysis)
7. Face Reading
8. Signature Analysis
9. Muhurat (auspicious timing)
10. Remedies (mantras, gemstones, pujas)
11. Compatibility (relationships)
12. Panchang (sacred calendar)

## 🚢 Deployment

### Deploy to Railway

1. **Create Railway account** at https://railway.app

2. **Connect GitHub repository:**
   - Push code to GitHub
   - Connect repository in Railway dashboard
   - Set environment variables:
     ```
     PORT=3000
     NODE_ENV=production
     GROQ_API_KEY=gsk_xxxxx
     ```

3. **Deploy:**
   - Railway automatically deploys on git push
   - Get your production URL from Railway dashboard

### Deploy Frontend to Vercel

1. **Update frontend URL** in `apnajotish.html`:
   ```javascript
   const backendUrl = 'https://your-railway-url.railway.app';
   ```

2. **Deploy to Vercel:**
   - Upload HTML file to Vercel
   - Or push to GitHub and connect to Vercel

## 📊 Testing Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Test AI endpoint
curl -X POST http://localhost:3000/api/ask-jotish \
  -H "Content-Type: application/json" \
  -d '{"question": "What is my destiny?"}'

# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass123", "name": "User"}'
```

## 🔒 Environment Variables

```env
# Required
GROQ_API_KEY=gsk_xxxxx

# Optional (defaults provided)
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://apnajotish.com

# Future integrations
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# BREVO_API_KEY=
# JWT_SECRET=
```

## 📝 Next Steps

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Update frontend backend URL to production
- [ ] Add Supabase database for persistence
- [ ] Implement Razorpay payments
- [ ] Add Brevo email service
- [ ] Register apnajotish.com domain

## 🐛 Troubleshooting

**API Key Error:**
- Check GROQ_API_KEY in .env
- Get key from https://console.groq.com

**Rate Limit:**
- Groq free tier has 9,000 requests/month
- Response takes 1-3 seconds per request

**Port Already in Use:**
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill -9`

## 📄 License

MIT

---

Built with ✨ by Ritesh Kumar Bhatia
