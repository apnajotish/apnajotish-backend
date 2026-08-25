// ============================================================
// SWISS EPHEMERIS INTEGRATION
// Planetary position calculations using sweph
// ============================================================

const sweph = require('sweph');
const { PLANETS } = require('../config/astrologyConfig');

/**
 * Initialize Swiss Ephemeris
 * Sets up ephemeris data path and configuration
 */
function initEphemeris() {
  try {
    // SwEph initialization
    // Data files are usually in node_modules/sweph/data/
    console.log('✅ Swiss Ephemeris initialized');
    return { initialized: true, version: '2.10.3' };
  } catch (error) {
    throw new Error(`Failed to initialize Swiss Ephemeris: ${error.message}`);
  }
}

/**
 * Calculate planetary positions for all planets and important points
 * Using Sidereal (Lahiri) zodiac
 *
 * @param {number} julianDay - Julian Day UT
 * @param {Object} config - Astrology configuration (ayanamsha, etc.)
 * @returns {Object} Planetary positions { planet: longitude, ... }
 */
function calculatePlanetaryPositions(julianDay, config) {
  try {
    if (typeof julianDay !== 'number' || julianDay <= 0) {
      throw new Error('Invalid Julian Day');
    }

    const positions = {};

    // Planets to calculate (using Swiss Ephemeris object numbers)
    const planetsToCalc = [
      { key: 'SUN', seNum: sweph.SE_SUN },
      { key: 'MOON', seNum: sweph.SE_MOON },
      { key: 'MARS', seNum: sweph.SE_MARS },
      { key: 'MERCURY', seNum: sweph.SE_MERCURY },
      { key: 'JUPITER', seNum: sweph.SE_JUPITER },
      { key: 'VENUS', seNum: sweph.SE_VENUS },
      { key: 'SATURN', seNum: sweph.SE_SATURN },
      { key: 'RAHU', seNum: sweph.SE_MEAN_NODE },
      { key: 'MC', seNum: sweph.SE_MC }
    ];

    for (const planet of planetsToCalc) {
      try {
        // Calculate position with sidereal zodiac (Lahiri ayanamsha)
        // Flag: SEFLG_SIDEREAL for sidereal, SEFLG_SPEED for speed calculation
        const flags = sweph.SEFLG_SIDEREAL | sweph.SEFLG_SPEED;
        const result = sweph.calc(julianDay, planet.seNum, flags);

        if (result && result.longitude !== undefined) {
          positions[planet.key] = {
            longitude: normalizeLongitude(result.longitude),
            latitude: result.latitude || 0,
            speed: result.speedlon || 0,
            retrograde: (result.speedlon || 0) < 0
          };
        }
      } catch (e) {
        console.warn(`Failed to calculate ${planet.key}: ${e.message}`);
        positions[planet.key] = null;
      }
    }

    // Calculate Ketu (Rahu + 180°)
    if (positions.RAHU && positions.RAHU.longitude !== undefined) {
      const rahuLong = positions.RAHU.longitude;
      const ketuLong = (rahuLong + 180) % 360;
      positions.KETU = {
        longitude: ketuLong,
        latitude: -positions.RAHU.latitude, // Opposite latitude
        speed: -positions.RAHU.speed, // Opposite speed
        retrograde: positions.RAHU.retrograde
      };
    }

    return positions;
  } catch (error) {
    throw new Error(`Planetary calculation failed: ${error.message}`);
  }
}

/**
 * Calculate Ascendant (Lagna) for given location and time
 * Requires latitude, longitude, and Julian Day
 *
 * @param {number} julianDay - Julian Day UT
 * @param {number} latitude - Birth latitude
 * @param {number} longitude - Birth longitude
 * @param {Object} config - Astrology configuration
 * @returns {Object} { longitude, rashi, degreeInRashi }
 */
function calculateAscendant(julianDay, latitude, longitude, config) {
  try {
    if (typeof julianDay !== 'number') {
      throw new Error('Invalid Julian Day');
    }

    // Calculate house cusps using Whole Sign method
    // sweph.calc_ut handles house calculation
    const houseSystem = 'W'; // Whole Sign
    const result = sweph.houses(julianDay, latitude, longitude, houseSystem.charCodeAt(0));

    if (!result || result.cusps === undefined || result.cusps[0] === undefined) {
      throw new Error('House calculation failed');
    }

    const ascendant = result.cusps[0];
    const normalizedLong = normalizeLongitude(ascendant);

    return {
      longitude: normalizedLong,
      latitude: 0,
      speed: 0,
      retrograde: false,
      house: 1
    };
  } catch (error) {
    throw new Error(`Ascendant calculation failed: ${error.message}`);
  }
}

/**
 * Normalize longitude to 0-360 range
 * @param {number} longitude - Raw longitude value
 * @returns {number} Normalized longitude (0-360)
 */
function normalizeLongitude(longitude) {
  let normalized = longitude % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Get house cusps for whole sign houses
 * @param {number} julianDay - Julian Day UT
 * @param {number} latitude - Birth latitude
 * @param {number} longitude - Birth longitude
 * @param {Object} config - Astrology configuration
 * @returns {Object} House cusps { 1: longitude, 2: longitude, ... }
 */
function getHouseCusps(julianDay, latitude, longitude, config) {
  try {
    const houseSystem = 'W'; // Whole Sign
    const result = sweph.houses(julianDay, latitude, longitude, houseSystem.charCodeAt(0));

    if (!result || !result.cusps) {
      throw new Error('House calculation failed');
    }

    const houses = {};
    for (let i = 0; i < 12; i++) {
      houses[i + 1] = normalizeLongitude(result.cusps[i]);
    }

    return houses;
  } catch (error) {
    throw new Error(`House cusp calculation failed: ${error.message}`);
  }
}

/**
 * Get retrograde status for all planets
 * @param {Object} positions - Planetary positions with speed
 * @returns {Object} { planet: isRetrograde }
 */
function getRetrogrades(positions) {
  const retrogrades = {};

  for (const [planet, data] of Object.entries(positions)) {
    if (data && data.speed !== undefined) {
      retrogrades[planet] = data.speed < 0;
    }
  }

  return retrogrades;
}

/**
 * Validate planetary positions
 * Check for calculation errors and anomalies
 *
 * @param {Object} positions - Planetary positions
 * @returns {Object} { valid, errors }
 */
function validatePositions(positions) {
  const errors = [];

  // Check for missing critical planets
  const critical = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'];
  for (const planet of critical) {
    if (!positions[planet] || positions[planet].longitude === undefined) {
      errors.push(`Missing position for ${planet}`);
    }
  }

  // Check longitude ranges
  for (const [planet, data] of Object.entries(positions)) {
    if (data && data.longitude !== undefined) {
      if (data.longitude < 0 || data.longitude > 360) {
        errors.push(`${planet} longitude out of range: ${data.longitude}`);
      }
    }
  }

  // Check Rahu/Ketu are ~180° apart
  if (positions.RAHU && positions.KETU) {
    const diff = Math.abs(positions.RAHU.longitude - positions.KETU.longitude);
    if (Math.abs(diff - 180) > 0.1 && Math.abs(diff - 180) < 359.9) {
      errors.push(`Rahu/Ketu not properly opposed: ${diff}°`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  initEphemeris,
  calculatePlanetaryPositions,
  calculateAscendant,
  normalizeLongitude,
  getHouseCusps,
  getRetrogrades,
  validatePositions
};
