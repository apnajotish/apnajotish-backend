// ============================================================
// APNAJOTISH KUNDLI CALCULATION ENGINE
// Main orchestration layer for all calculations
// ============================================================

const { convertToJulianDay } = require('./time');
const { resolveLocation } = require('./location');
const { initEphemeris, calculatePlanetaryPositions, calculateAscendant, getHouseCusps, validatePositions } = require('./ephemeris');
const { calculateRashi, getPlanetData, validateRashiNakshatra } = require('./rashis');
const { calculateDashaBalance, generateDashaPeriods, validateDasha } = require('./dasha');
const { generateAllVargas } = require('./vargas');
const { ASTROLOGY_CONFIG } = require('../config/astrologyConfig');

/**
 * Main Kundli calculation function
 * Orchestrates entire calculation pipeline
 *
 * @param {Object} birthData - {
 *   name, dob (YYYY-MM-DD), time (HH:MM:SS), place,
 *   latitude, longitude, timezone,
 *   timeAccuracy (exact/approximate/unknown)
 * }
 * @returns {Promise<Object>} Complete Kundli JSON
 */
async function calculateKundli(birthData) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔮 CALCULATING KUNDLI: ${birthData.name}`);
    console.log(`${'='.repeat(60)}\n`);

    // STEP 1: Validate and resolve location
    console.log('📍 Resolving location...');
    const location = await resolveLocation(
      birthData.place,
      birthData.latitude,
      birthData.longitude,
      birthData.timezone
    );
    console.log(`✅ Location resolved: ${location.place}`);

    // STEP 2: Parse birth date/time and convert to Julian Day
    console.log('⏰ Converting to Julian Day...');
    const [year, month, day] = birthData.dob.split('-').map(Number);
    const [hour, minute, second = 0] = birthData.time.split(':').map(Number);

    const timeData = convertToJulianDay(
      year, month, day,
      hour, minute, second,
      location.timezone
    );
    console.log(`✅ Julian Day: ${timeData.julianDay}`);

    // STEP 3: Initialize Swiss Ephemeris
    console.log('🔬 Initializing Swiss Ephemeris...');
    const ephemerisInfo = initEphemeris();
    console.log(`✅ ${ephemerisInfo.initialized ? 'Swiss Ephemeris initialized' : 'Error initializing'}`);

    // STEP 4: Calculate planetary positions
    console.log('🌍 Calculating planetary positions...');
    const planetPositions = calculatePlanetaryPositions(
      timeData.julianDay,
      ASTROLOGY_CONFIG
    );
    console.log(`✅ Planets calculated`);

    // STEP 5: Calculate Ascendant
    console.log('🏠 Calculating Ascendant (Lagna)...');
    const ascendant = calculateAscendant(
      timeData.julianDay,
      location.latitude,
      location.longitude,
      ASTROLOGY_CONFIG
    );
    console.log(`✅ Ascendant: ${calculateRashi(ascendant.longitude).name}`);

    // STEP 6: Get house cusps
    console.log('📊 Calculating houses...');
    const houseCusps = getHouseCusps(
      timeData.julianDay,
      location.latitude,
      location.longitude,
      ASTROLOGY_CONFIG
    );
    console.log(`✅ Houses calculated`);

    // STEP 7: Get Rashi/Nakshatra for all planets
    console.log('♈ Calculating Rashi/Nakshatra...');
    const planetData = getPlanetData(planetPositions, houseCusps);
    console.log(`✅ ${planetData.length} planets processed`);

    // STEP 8: Calculate Vimshottari Dasha
    console.log('⏳ Calculating Vimshottari Dasha...');
    const moonLongitude = planetPositions.MOON?.longitude || 0;
    const dashaBalance = calculateDashaBalance(moonLongitude);
    const dashaPeriods = generateDashaPeriods(moonLongitude, new Date(birthData.dob));
    console.log(`✅ Current Mahadasha: ${dashaBalance.mahadasha}`);

    // STEP 9: Calculate divisional charts
    console.log('🔢 Calculating divisional charts...');
    const vargas = generateAllVargas(planetPositions);
    console.log(`✅ Vargas calculated (D1, D9, D10, D12)`);

    // STEP 10: Validate all calculations
    console.log('✔️ Validating calculations...');
    const positionValidation = validatePositions(planetPositions);
    const rashiValidation = validateRashiNakshatra(planetPositions);
    const dashaValidation = validateDasha(dashaPeriods);

    const validationSummary = {
      positions: positionValidation.valid,
      rashi: rashiValidation.valid,
      dasha: dashaValidation.valid,
      errors: [
        ...positionValidation.errors,
        ...rashiValidation.errors,
        ...dashaValidation.errors
      ]
    };

    if (!validationSummary.positions || !validationSummary.rashi || !validationSummary.dasha) {
      console.warn('⚠️ Validation errors found:', validationSummary.errors);
    } else {
      console.log('✅ All validations passed');
    }

    // STEP 11: Build canonical Kundli JSON
    console.log('📝 Building canonical Kundli...');
    const kundli = {
      metadata: {
        version: "1.0",
        engine: "ApnaJotish",
        calculationProfile: ASTROLOGY_CONFIG.calculationProfile,
        calculatedAt: new Date().toISOString()
      },
      birth: {
        name: birthData.name,
        date: birthData.dob,
        time: birthData.time,
        timeAccuracy: birthData.timeAccuracy || "exact",
        place: birthData.place
      },
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        resolved: location.resolved,
        source: location.source
      },
      time: {
        localTime: timeData.localTime,
        utcTime: timeData.utcTime,
        julianDay: timeData.julianDay,
        julianDayUT: timeData.julianDayUT,
        timezoneOffset: timeData.timezoneOffset
      },
      calculation: {
        system: ASTROLOGY_CONFIG.system,
        zodiac: ASTROLOGY_CONFIG.zodiac,
        ayanamsha: ASTROLOGY_CONFIG.ayanamsha,
        ayanamshaName: ASTROLOGY_CONFIG.ayanamshaName,
        houseSystem: ASTROLOGY_CONFIG.houseSystem,
        nodeType: ASTROLOGY_CONFIG.nodeType,
        dashaSystem: ASTROLOGY_CONFIG.dashaSystem,
        ephemerisVersion: ASTROLOGY_CONFIG.ephemerisVersion
      },
      ascendant: {
        longitude: ascendant.longitude,
        rashi: calculateRashi(ascendant.longitude).name,
        nakshatra: calculateRashi(ascendant.longitude).name // simplified for now
      },
      planets: planetData,
      houses: houseCusps,
      dasha: {
        current: {
          mahadasha: dashaBalance.mahadasha,
          balanceYears: dashaBalance.balanceYears,
          balancePercentage: dashaBalance.balancePercentage,
          nakshatra: dashaBalance.nakshatra
        },
        periods: dashaPeriods.slice(0, 3)  // Include first 3 Mahadashas with details
      },
      vargas: vargas,
      validation: validationSummary,
      reference: {
        jhora: null,  // Will be populated by reference validation
        drikPanchang: null  // Will be populated by reference validation
      }
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ KUNDLI CALCULATION COMPLETE`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      data: kundli,
      calculationTime: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ CALCULATION ERROR: ${error.message}`);
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}

/**
 * Validate calculated Kundli
 * @param {Object} kundli - Calculated Kundli
 * @returns {Object} Validation result
 */
function validateKundli(kundli) {
  if (!kundli || !kundli.data) {
    return { valid: false, errors: ['Invalid Kundli structure'] };
  }

  const errors = [];

  // Check required fields
  const required = ['birth', 'location', 'time', 'ascendant', 'planets', 'dasha'];
  for (const field of required) {
    if (!kundli.data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check validation summary
  if (kundli.data.validation && kundli.data.validation.errors.length > 0) {
    errors.push(...kundli.data.validation.errors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateKundli,
  validateKundli
};
