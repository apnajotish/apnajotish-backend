// ============================================================
// RASHI AND NAKSHATRA CALCULATIONS
// Zodiac sign assignment and Nakshatra/Pada determination
// ============================================================

const { RASHIS, NAKSHATRAS } = require('../config/astrologyConfig');

/**
 * Calculate Rashi (Zodiac sign) from longitude
 * @param {number} longitude - Longitude (0-360)
 * @returns {Object} { name, number, element, degreeInRashi }
 */
function calculateRashi(longitude) {
  if (typeof longitude !== 'number' || longitude < 0 || longitude >= 360) {
    throw new Error(`Invalid longitude: ${longitude}`);
  }

  // Find which Rashi the longitude falls into
  const rashi = RASHIS.find(r => longitude >= r.startDegree && longitude < r.endDegree);

  if (!rashi) {
    throw new Error(`Rashi not found for longitude ${longitude}`);
  }

  // Calculate degree within the Rashi (0-30)
  const degreeInRashi = longitude - rashi.startDegree;

  return {
    name: rashi.name,
    number: rashi.number,
    element: rashi.element,
    ruler: rashi.ruler,
    startDegree: rashi.startDegree,
    endDegree: rashi.endDegree,
    longitude: longitude,
    degreeInRashi: degreeInRashi,
    displayDMS: degreesToDMS(degreeInRashi)
  };
}

/**
 * Calculate Nakshatra and Pada from longitude
 * @param {number} longitude - Longitude (0-360)
 * @returns {Object} { name, number, lord, pada, degreeInNakshatra }
 */
function calculateNakshatra(longitude) {
  if (typeof longitude !== 'number' || longitude < 0 || longitude >= 360) {
    throw new Error(`Invalid longitude: ${longitude}`);
  }

  // Find which Nakshatra the longitude falls into
  const nakshatra = NAKSHATRAS.find(
    n => longitude >= n.startDegree && longitude < n.endDegree
  );

  if (!nakshatra) {
    throw new Error(`Nakshatra not found for longitude ${longitude}`);
  }

  // Calculate position within Nakshatra (0-13.333)
  const degreeInNakshatra = longitude - nakshatra.startDegree;

  // Each Nakshatra is divided into 4 Padas (quarters)
  // Each Pada is 13.333 / 4 = 3.333 degrees
  const pada = Math.floor(degreeInNakshatra / (13.333 / 4)) + 1;

  // Validate Pada (should be 1-4)
  if (pada < 1 || pada > 4) {
    console.warn(`Invalid Pada calculated: ${pada} for longitude ${longitude}`);
  }

  return {
    name: nakshatra.name,
    number: nakshatra.number,
    lord: nakshatra.lord,
    startDegree: nakshatra.startDegree,
    endDegree: nakshatra.endDegree,
    longitude: longitude,
    degreeInNakshatra: degreeInNakshatra,
    pada: Math.min(4, Math.max(1, pada)), // Clamp to 1-4
    displayDMS: degreesToDMS(degreeInNakshatra)
  };
}

/**
 * Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
 * @param {number} degrees - Decimal degrees
 * @returns {string} "D°M'S""
 */
function degreesToDMS(degrees) {
  const d = Math.floor(degrees);
  const m = Math.floor((degrees - d) * 60);
  const s = Math.round(((degrees - d) * 60 - m) * 60 * 100) / 100;

  return `${d}° ${m}' ${s}"`;
}

/**
 * Assign houses to planets
 * Uses whole sign house system
 *
 * @param {Object} planetPositions - { SUN: { longitude, ... }, ... }
 * @param {Object} houseCusps - { 1: longitude, 2: longitude, ... }
 * @returns {Object} { planet: house, ... }
 */
function assignPlanetHouses(planetPositions, houseCusps) {
  const planetHouses = {};

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const longitude = position.longitude;
    let house = 1;

    // Find which house the planet is in (whole sign)
    for (let h = 1; h <= 12; h++) {
      const currentCusp = houseCusps[h];
      const nextCusp = houseCusps[h === 12 ? 1 : h + 1];

      // Handle wrap-around at 360°
      if (h === 12) {
        if (longitude >= currentCusp || longitude < nextCusp) {
          house = h;
          break;
        }
      } else {
        if (longitude >= currentCusp && longitude < nextCusp) {
          house = h;
          break;
        }
      }
    }

    planetHouses[planet] = house;
  }

  return planetHouses;
}

/**
 * Get all planet data with Rashi, Nakshatra, Pada, and House
 *
 * @param {Object} planetPositions - Planetary longitudes
 * @param {Object} houseCusps - House cusps
 * @returns {Array} Array of planet data objects
 */
function getPlanetData(planetPositions, houseCusps) {
  const planetHouses = assignPlanetHouses(planetPositions, houseCusps);
  const planetData = [];

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const longitude = position.longitude;
    const rashi = calculateRashi(longitude);
    const nakshatra = calculateNakshatra(longitude);
    const house = planetHouses[planet] || 0;

    planetData.push({
      planet,
      longitude: longitude,
      latitude: position.latitude || 0,
      speed: position.speed || 0,
      retrograde: position.retrograde || false,
      rashi: rashi.name,
      rashiNumber: rashi.number,
      degreeInRashi: rashi.degreeInRashi,
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      pada: nakshatra.pada,
      lord: nakshatra.lord,
      house: house
    });
  }

  return planetData;
}

/**
 * Validate Rashi/Nakshatra assignments
 * @param {Object} planetPositions - Planetary positions
 * @returns {Object} { valid, errors }
 */
function validateRashiNakshatra(planetPositions) {
  const errors = [];

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const longitude = position.longitude;

    try {
      const rashi = calculateRashi(longitude);
      const nakshatra = calculateNakshatra(longitude);

      // Validate Pada
      if (nakshatra.pada < 1 || nakshatra.pada > 4) {
        errors.push(`${planet}: Invalid Pada ${nakshatra.pada}`);
      }

      // Validate degree ranges
      if (rashi.degreeInRashi < 0 || rashi.degreeInRashi >= 30) {
        errors.push(`${planet}: Invalid Rashi degree ${rashi.degreeInRashi}`);
      }
    } catch (e) {
      errors.push(`${planet}: ${e.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateRashi,
  calculateNakshatra,
  degreesToDMS,
  assignPlanetHouses,
  getPlanetData,
  validateRashiNakshatra
};
