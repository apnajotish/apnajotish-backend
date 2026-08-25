// ============================================================
// KUNDLI API ROUTES
// POST /api/kundli/calculate
// POST /api/kundli/validate
// POST /api/kundli/interpret
// GET /api/kundli/health
// ============================================================

const express = require('express');
const router = express.Router();
const { calculateKundli, validateKundli } = require('../astrology/kundliEngine');
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * POST /api/kundli/calculate
 * Pure deterministic calculation - NO AI
 *
 * Request body:
 * {
 *   "name": "John Doe",
 *   "dob": "1990-05-15",
 *   "time": "14:30:00",
 *   "place": "Mumbai, India",
 *   "latitude": 19.0760,
 *   "longitude": 72.8777,
 *   "timezone": "Asia/Kolkata",
 *   "timeAccuracy": "exact"
 * }
 */
router.post('/calculate', async (req, res) => {
  try {
    const { name, dob, time, place, latitude, longitude, timezone, timeAccuracy } = req.body;

    // Validate inputs
    if (!name || !dob || !time || !place) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: name, dob, time, place'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate time format
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Use HH:MM:SS'
      });
    }

    // Call calculation engine
    const result = await calculateKundli({
      name,
      dob,
      time,
      place,
      latitude: latitude || null,
      longitude: longitude || null,
      timezone: timezone || 'UTC',
      timeAccuracy: timeAccuracy || 'exact'
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return success with Kundli data
    res.json({
      success: true,
      data: result.data,
      engine: 'Swiss Ephemeris',
      profile: 'JHora Compatible',
      calculatedAt: result.calculationTime
    });

  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Kundli calculation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/kundli/validate
 * Validate a calculated Kundli
 */
router.post('/validate', (req, res) => {
  try {
    const { kundli } = req.body;

    if (!kundli) {
      return res.status(400).json({
        success: false,
        error: 'Kundli data required'
      });
    }

    const validation = validateKundli({ data: kundli });

    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
      validatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/kundli/interpret
 * Use Groq for interpretation ONLY
 * Requires pre-calculated Kundli
 *
 * Request body:
 * {
 *   "kundli": { ... },
 *   "question": "When will I get married?",
 *   "aspect": "marriage"
 * }
 */
router.post('/interpret', async (req, res) => {
  try {
    const { kundli, question, aspect } = req.body;

    if (!kundli || !question) {
      return res.status(400).json({
        success: false,
        error: 'Kundli and question required'
      });
    }

    // Build evidence from Kundli
    const evidence = buildEvidence(kundli, aspect);

    // Create interpretation prompt
    const systemPrompt = `You are an expert Vedic astrology interpreter.
Your role is to interpret pre-calculated Kundli data and provide meaningful insights.

IMPORTANT RULES:
1. Never invent planetary positions
2. Never calculate Nakshatra or Rashi
3. Never modify Kundli data
4. Never claim yogas unless present in the data
5. Use only the supplied evidence
6. Be specific and cite planetary placements
7. Do not fabricate certainty

Interpret the following Kundli data based on the evidence provided.`;

    const userPrompt = `User Question: "${question}"

Calculated Kundli Data:
- Name: ${kundli.birth?.name}
- Birth Date: ${kundli.birth?.date}
- Ascendant: ${kundli.ascendant?.rashi}
- Moon: ${kundli.planets?.find(p => p.planet === 'MOON')?.rashi} in ${kundli.planets?.find(p => p.planet === 'MOON')?.nakshatra}
- Current Dasha: ${kundli.dasha?.current?.mahadasha}

Evidence:
${evidence}

Provide a compassionate, insightful interpretation based on this data.`;

    // Call Groq API
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
          content: userPrompt
        }
      ]
    });

    const interpretation = message.choices[0]?.message?.content || 'Unable to generate interpretation';

    res.json({
      success: true,
      question,
      interpretation,
      evidence,
      engine: 'Groq',
      interpretedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Interpretation error:', error);
    res.status(500).json({
      success: false,
      error: 'Interpretation failed',
      details: error.message
    });
  }
});

/**
 * GET /api/kundli/health
 * Astrology engine health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    engine: 'ApnaJotish Vedic Calculation Engine',
    version: '2.0.0',
    calculation: {
      system: 'Vedic / Sidereal',
      zodiac: 'Sidereal',
      ayanamsha: 'Lahiri / Chitra Paksha',
      houseSystem: 'Whole Sign',
      nodeType: 'Mean Rahu/Ketu',
      ephemeris: 'Swiss Ephemeris',
      profile: 'JHora Compatible'
    },
    features: [
      'Deterministic astronomical calculations',
      'Sidereal Lahiri Ayanamsha',
      'Lagna/Ascendant calculation',
      'Planetary positions',
      'Rashi/Nakshatra/Pada',
      'Vimshottari Dasha',
      'Divisional Charts (D1/D9/D10/D12)',
      'Groq-powered interpretation only'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * Helper: Build evidence for Groq interpretation
 */
function buildEvidence(kundli, aspect) {
  const evidence = [];

  // Add planetary positions
  if (kundli.planets && Array.isArray(kundli.planets)) {
    for (const planet of kundli.planets.slice(0, 7)) {  // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
      if (planet.house) {
        evidence.push(`${planet.planet}: ${planet.rashi} in House ${planet.house}`);
      }
    }
  }

  // Add current Dasha
  if (kundli.dasha?.current) {
    evidence.push(`Current Dasha: ${kundli.dasha.current.mahadasha} for ${kundli.dasha.current.balanceYears.toFixed(1)} years`);
  }

  // Add aspect-specific evidence
  if (aspect === 'marriage') {
    const venus = kundli.planets?.find(p => p.planet === 'VENUS');
    const moon = kundli.planets?.find(p => p.planet === 'MOON');
    if (venus) evidence.push(`Venus in House ${venus.house}`);
    if (moon) evidence.push(`Moon in ${moon.rashi}`);
  } else if (aspect === 'career') {
    const saturn = kundli.planets?.find(p => p.planet === 'SATURN');
    const jupiter = kundli.planets?.find(p => p.planet === 'JUPITER');
    if (saturn) evidence.push(`Saturn in House ${saturn.house}`);
    if (jupiter) evidence.push(`Jupiter in ${jupiter.rashi}`);
  }

  return evidence.join('\n');
}

module.exports = router;
