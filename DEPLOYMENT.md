# Deployment Guide - Railway + Vercel

## 🚂 Deploy Backend to Railway

Railway provides free tier hosting perfect for our Groq-powered backend.

### Step 1: Prepare GitHub Repository

```bash
cd /tmp/apnajotish/groq-build

# Initialize git
git init
git add .
git commit -m "Initial Groq backend setup"

# Create new repo on GitHub (https://github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/apnajotish-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Railway to GitHub

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `apnajotish-backend` repository
5. Railway will auto-detect Node.js

### Step 3: Add Environment Variables

In Railway dashboard:
1. Go to project settings
2. Click "Variables"
3. Add these environment variables:
   ```
   GROQ_API_KEY = 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
   PORT = 3000
   NODE_ENV = production
   FRONTEND_URL = https://your-vercel-domain.vercel.app
   PRODUCTION_URL = https://apnajotish.com
   ```

### Step 4: Deploy

Railway automatically deploys when you push to `main` branch:
```bash
# Make changes and push
git add .
git commit -m "Update backend"
git push origin main

# Railway deploys automatically! Monitor in dashboard
```

### Step 5: Get Your Production URL

In Railway dashboard:
1. Click on "Deployments"
2. Copy the "Public URL" (format: `https://your-app-xxxxx.railway.app`)
3. Save this - you'll need it for the frontend!

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Update Backend URL in HTML

Edit your `apnajotish.html` file:
```javascript
// Change this line:
const backendUrl = 'http://localhost:3000';

// To this:
const backendUrl = 'https://your-app-xxxxx.railway.app';
```

### Step 2: Upload to Vercel

**Option A: Direct Upload**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Upload" button
4. Select `apnajotish.html`
5. Deploy!

**Option B: GitHub + Vercel**
1. Create `apnajotish-frontend` repo on GitHub
2. Push the HTML file
3. Connect to Vercel via GitHub integration

### Step 3: Get Your Frontend URL

Vercel gives you a URL like:
```
https://apnajotish.vercel.app
```

---

## ✅ Testing Production

### Test Backend
```bash
curl https://your-app-xxxxx.railway.app/health

# Should return:
# {
#   "status": "OK",
#   "service": "Apna Jotish Backend",
#   "ai": "Groq (Free)",
#   "timestamp": "..."
# }
```

### Test Frontend
1. Open https://apnajotish.vercel.app in browser
2. Click "Ask Apna Jotish"
3. Enter a question
4. Should connect to Railway backend and get Groq AI response

---

## 🔄 Update Process

### Update Backend Code
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys! Monitor at https://railway.app
```

### Update Frontend
1. Edit `apnajotish.html`
2. Push changes to GitHub
3. Vercel auto-deploys

---

## 💡 Pro Tips

1. **Monitor Logs:**
   - Railway: Click "Deployments" → View logs
   - Vercel: Click "Deployments" → View logs

2. **Environment Variables:**
   - Never commit `.env` to GitHub
   - Always set variables in Railway/Vercel dashboard

3. **Custom Domain:**
   - Railway: Add domain in "Settings" → "Domains"
   - Vercel: Add domain in "Settings" → "Domains"

4. **Groq API Quota:**
   - Monitor at https://console.groq.com
   - Free tier: 9,000 requests/month
   - ~300 requests/day

---

## 🆘 Troubleshooting

### Backend Not Responding
```bash
# Check Railway logs:
# 1. Go to Railway dashboard
# 2. Click Deployments
# 3. Check "Build logs" and "Deployment logs"

# Common issues:
# - GROQ_API_KEY not set in Railway variables
# - PORT not set to 3000
# - Node version mismatch
```

### Frontend Not Connecting
```javascript
// Check browser console (F12):
// 1. Network tab - check API requests
// 2. Console tab - check for errors
// 3. Ensure backendUrl points to correct Railway URL
```

### CORS Errors
- Backend is configured to allow all origins (for MVP)
- If issues, check server.js CORS middleware

---

## 📊 Cost Estimate (First Year)

- Railway Backend: **Free** (up to 500 hours/month)
- Vercel Frontend: **Free** (including custom domain)
- Groq AI: **Free** (9,000 requests/month)
- Domain (optional): ₹299/year

**Total Cost: Free to ₹299/year** ✨

---

## 🚀 You're Live!

Once deployed:
1. Backend running on Railway
2. Frontend running on Vercel
3. Connected to free Groq AI
4. Ready for users!

Next steps:
- [ ] Test with real users
- [ ] Add Supabase for data storage
- [ ] Implement Razorpay payments
- [ ] Monitor Groq API usage
- [ ] Optimize based on feedback
