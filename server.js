// ============================================================
// APNA JOTISH BACKEND - GROQ API (FREE VERSION)
// ============================================================

const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());

// CORS - Allow all origins (for development)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Apna Jotish Backend',
        version: '1.0.0',
        ai: 'Groq (Free)',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// GROQ AI ENGINE - Ask My Problem
// ============================================================

app.post('/api/ask-jotish', async (req, res) => {
    try {
        const { question, userProfile } = req.body;

        // Validate input
        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                error: 'Question is required and cannot be empty'
            });
        }

        // Check API key
        if (!process.env.GROQ_API_KEY) {
            console.error('❌ GROQ_API_KEY not found in .env');
            return res.status(500).json({
                error: 'Server configuration error: API key missing',
                hint: 'Add GROQ_API_KEY to .env file'
            });
        }

        // Build context from user profile
        let context = `You are Apna Jotish, an expert Vedic astrologer and spiritual guide.
Your role is to provide personalized, compassionate guidance based on traditional Vedic astrology.`;

        if (userProfile && userProfile.name) {
            context += `

User Profile:
- Name: ${userProfile.name}`;
            if (userProfile.dob) context += `\n- Date of Birth: ${userProfile.dob}`;
            if (userProfile.time) context += `\n- Birth Time: ${userProfile.time}`;
            if (userProfile.place) context += `\n- Birth Place: ${userProfile.place}`;
            if (userProfile.lagna) context += `\n- Lagna/Ascendant: ${userProfile.lagna}`;
        }

        // Build the prompt
        const systemPrompt = `${context}

When responding to questions, analyze through ALL 12 spiritual systems:
1. Astrology (birth chart, transits, Mahadasha)
2. Numerology (life path, destiny number, name number)
3. Tarot (relevant card meanings)
4. Vastu Shastra (spatial harmony and balance)
5. Lal Kitab (quick planetary remedies)
6. Palmistry (hand analysis insights)
7. Face Reading (facial traits)
8. Signature Analysis
9. Muhurat (auspicious timing)
10. Remedies (mantras, gemstones, pujas)
11. Compatibility (if relationship question)
12. Panchang (sacred calendar)

Format your response as:
[ANALYSIS]: Brief astrological interpretation
[INSIGHT]: Key spiritual insight
[REMEDIES]: 2-3 practical remedies
[TIMING]: When to take action
[GUIDANCE]: Final guidance

Keep responses practical, compassionate, and actionable.`;

        // Call Groq API
        console.log(`📨 Calling Groq API for: "${question.substring(0, 50)}..."`);

        const message = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            max_tokens: 1024,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `User Question: "${question}"`
                }
            ]
        });

        // Extract guidance from response
        const guidance = message.choices[0]?.message?.content
            || 'Unable to generate guidance at this time. Please try again.';

        console.log(`✅ Groq responded successfully`);

        // Return success response
        res.json({
            success: true,
            question,
            guidance,
            timestamp: new Date().toISOString(),
            engine: 'Groq',
            system: 'Apna Jotish v1.0'
        });

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Provide helpful error messages
        let errorMessage = 'Failed to generate guidance';
        let errorDetails = error.message;

        if (error.status === 400) {
            errorMessage = 'Invalid request format';
            errorDetails = 'Check your question format';
        } else if (error.status === 401) {
            errorMessage = 'API Key Error';
            errorDetails = 'Invalid or missing API key. Check .env file.';
        } else if (error.status === 429) {
            errorMessage = 'Rate limit exceeded';
            errorDetails = 'Too many requests. Try again later.';
        }

        res.status(error.status || 500).json({
            success: false,
            error: errorMessage,
            details: errorDetails,
            engine: 'Groq'
        });
    }
});

// ============================================================
// AUTHENTICATION STUBS (Placeholder endpoints)
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
// USER PROFILE ENDPOINTS (Placeholder)
// ============================================================

app.get('/api/user/profile/:userId', (req, res) => {
    res.json({
        userId: req.params.userId,
        name: 'Seeker',
        dob: '1982-02-09',
        birthTime: '14:30',
        birthPlace: 'Mumbai',
        lagna: 'Leo'
    });
});

app.post('/api/user/profile/:userId', (req, res) => {
    const { name, dob, birthTime, birthPlace, lagna } = req.body;

    res.json({
        success: true,
        message: 'Profile updated',
        profile: { name, dob, birthTime, birthPlace, lagna }
    });
});

// ============================================================
// REPORTS ENDPOINTS (Placeholder)
// ============================================================

app.get('/api/reports/:userId', (req, res) => {
    res.json({
        success: true,
        reports: [
            {
                id: '1',
                question: 'When will I get married?',
                guidance: '[ANALYSIS]: Jupiter in 7th house indicates...',
                timestamp: new Date().toISOString()
            }
        ]
    });
});

app.post('/api/reports/:userId', (req, res) => {
    const { question, guidance } = req.body;

    if (!question || !guidance) {
        return res.status(400).json({ error: 'Question and guidance required' });
    }

    res.json({
        success: true,
        message: 'Report saved',
        report: {
            id: 'report-' + Date.now(),
            question,
            guidance,
            timestamp: new Date().toISOString()
        }
    });
});

// ============================================================
// ANALYSIS ENDPOINTS (Placeholder)
// ============================================================

app.post('/api/astrology/analyze', (req, res) => {
    const { dob, birthTime, birthPlace } = req.body;

    res.json({
        success: true,
        analysis: 'Astrology analysis would be calculated here',
        birthChart: {
            lagna: 'Leo',
            rashi: 'Taurus',
            nakshatra: 'Rohini'
        }
    });
});

app.post('/api/numerology/analyze', (req, res) => {
    const { name, dob } = req.body;

    res.json({
        success: true,
        analysis: 'Numerology analysis would be calculated here',
        numbers: {
            lifePath: 5,
            destiny: 8,
            nameNumber: 3
        }
    });
});

// ============================================================
// PAYMENT ENDPOINTS (Placeholder - Razorpay ready)
// ============================================================

app.post('/api/payments/create-order', (req, res) => {
    const { userId, plan } = req.body;

    const plans = {
        premium: { amount: 9900, description: '₹99/month - Unlimited questions' },
        vip: { amount: 49900, description: '₹499/month - VIP support' }
    };

    if (!plans[plan]) {
        return res.status(400).json({ error: 'Invalid plan' });
    }

    res.json({
        success: true,
        order: {
            id: 'order-' + Date.now(),
            amount: plans[plan].amount,
            description: plans[plan].description
        }
    });
});

app.post('/api/payments/verify', (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    res.json({
        success: true,
        message: 'Payment verified',
        verification: {
            orderId,
            paymentId,
            status: 'success'
        }
    });
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        available: [
            'GET /health',
            'POST /api/ask-jotish',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/user/profile/:userId',
            'POST /api/user/profile/:userId',
            'GET /api/reports/:userId',
            'POST /api/reports/:userId',
            'POST /api/astrology/analyze',
            'POST /api/numerology/analyze',
            'POST /api/payments/create-order',
            'POST /api/payments/verify'
        ]
    });
});

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('✨ Apna Jotish Backend - GROQ (FREE)');
    console.log('='.repeat(60));
    console.log(`📍 API: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`🤖 AI Engine: Groq (FREE tier)`);
    console.log(`📝 API Key: ${process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log('='.repeat(60) + '\n');

    if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️  WARNING: GROQ_API_KEY not found in .env file!');
        console.warn('Add your Groq API key to .env file and restart.\n');
    }
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
