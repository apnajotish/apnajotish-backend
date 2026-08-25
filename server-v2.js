// ============================================================
// APNAJOTISH BACKEND - V2.0
// DETERMINISTIC VEDIC KUNDLI CALCULATION ENGINE
// ============================================================

const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import new Kundli API routes
const kundliRoutes = require('./src/routes/kundli');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// CORS - Production-ready configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://apnajotish.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ============================================================
// HEALTH CHECKS
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Apna Jotish Backend v2.0',
    version: '2.0.0',
    engine: 'Deterministic Vedic Calculation Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    backend: {
      version: '2.0.0',
      engine: 'Vedic Calculation + Groq AI',
      timestamp: new Date().toISOString()
    },
    groq: {
      configured: !!process.env.GROQ_API_KEY,
      model: 'mixtral-8x7b-32768'
    }
  });
});

// ============================================================
// NEW KUNDLI API - V2
// Deterministic calculations with Groq interpretation
// ============================================================

app.use('/api/kundli', kundliRoutes);

// ============================================================
// LEGACY ASK-JOTISH ENDPOINT
// Kept for backward compatibility
// ============================================================

app.post('/api/ask-jotish', async (req, res) => {
  try {
    const { question, userProfile } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Question is required and cannot be empty'
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found');
      return res.status(500).json({
        error: 'Server configuration error: API key missing'
      });
    }

    let context = `You are Apna Jotish, an expert Vedic astrologer and spiritual guide.
Your role is to provide personalized, compassionate guidance based on traditional Vedic astrology.`;

    if (userProfile && userProfile.name) {
      context += `

User Profile:
- Name: ${userProfile.name}`;
      if (userProfile.dob) context += `\n- Date of Birth: ${userProfile.dob}`;
      if (userProfile.time) context += `\n- Birth Time: ${userProfile.time}`;
      if (userProfile.place) context += `\n- Birth Place: ${userProfile.place}`;
    }

    const systemPrompt = `${context}

When responding to questions, provide guidance through the lens of Vedic astrology.
Format your response with:
[ANALYSIS]: Brief astrological interpretation
[INSIGHT]: Key spiritual insight
[REMEDIES]: 2-3 practical remedies
[TIMING]: When to take action
[GUIDANCE]: Final guidance

Keep responses practical, compassionate, and actionable.`;

    console.log(`📨 Groq request for: "${question.substring(0, 50)}..."`);

    const message = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question: "${question}"` }
      ]
    });

    const guidance = message.choices[0]?.message?.content || 'Unable to generate guidance';

    console.log(`✅ Groq response generated`);

    res.json({
      success: true,
      question,
      guidance,
      timestamp: new Date().toISOString(),
      engine: 'Groq',
      system: 'Apna Jotish v2.0'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);

    let errorMessage = 'Failed to generate guidance';
    if (error.status === 401) {
      errorMessage = 'API Key Error - Invalid or missing key';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded - Try again later';
    }

    res.status(error.status || 500).json({
      success: false,
      error: errorMessage,
      engine: 'Groq'
    });
  }
});

// ============================================================
// AUTHENTICATION ENDPOINTS (Stubs)
// ============================================================

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  res.json({
    success: true,
    message: 'Registration successful',
    user: { email, name: name || 'User' }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  res.json({
    success: true,
    message: 'Login successful',
    token: 'temp-jwt-token-' + Date.now()
  });
});

// ============================================================
// USER PROFILE ENDPOINTS (Stubs)
// ============================================================

app.get('/api/user/profile/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    name: 'User',
    dob: '1990-01-01',
    birthTime: '12:00:00',
    birthPlace: 'India',
    timezone: 'Asia/Kolkata'
  });
});

app.post('/api/user/profile/:userId', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated'
  });
});

// ============================================================
// REPORTS ENDPOINTS (Stubs)
// ============================================================

app.get('/api/reports/:userId', (req, res) => {
  res.json({
    success: true,
    reports: []
  });
});

app.post('/api/reports/:userId', (req, res) => {
  res.json({
    success: true,
    message: 'Report saved'
  });
});

// ============================================================
// 404 ERROR HANDLING
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/health',
      'POST /api/kundli/calculate',
      'POST /api/kundli/validate',
      'POST /api/kundli/interpret',
      'GET /api/kundli/health',
      'POST /api/ask-jotish (legacy)',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('✨ APNAJOTISH BACKEND v2.0 - VEDIC KUNDLI ENGINE');
  console.log('='.repeat(70));
  console.log(`\n📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔮 Kundli Health: http://localhost:${PORT}/api/kundli/health`);
  console.log(`\n🔬 Calculation Engine:`);
  console.log(`   - System: Vedic / Sidereal`);
  console.log(`   - Ayanamsha: Lahiri / Chitra Paksha`);
  console.log(`   - Ephemeris: Swiss Ephemeris`);
  console.log(`   - Profile: JHora Compatible`);
  console.log(`\n🤖 AI Engine:`);
  console.log(`   - Groq: ${process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   - Model: Mixtral 8x7B`);
  console.log(`   - Role: Interpretation Only (NOT calculation)`);
  console.log('\n' + '='.repeat(70) + '\n');

  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  WARNING: GROQ_API_KEY not found in .env file!');
    console.warn('⚠️  Add your Groq API key to .env file and restart.\n');
  }
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
