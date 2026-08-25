// ============================================================
// DIVISIONAL CHARTS (VARGAS)
// D1 (Rashi), D9 (Navamsa), D10 (Dashamsa), etc.
// ============================================================

const { calculateRashi, calculateNakshatra } = require('./rashis');

/**
 * Calculate divisional chart longitude
 * Generic formula: Divisional Longitude = (Original Longitude * Division) % 360
 *
 * @param {number} longitude - Original planet longitude
 * @param {number} division - Chart division (9 for D9, 10 for D10, etc.)
 * @returns {number} Divisional longitude (0-360)
 */
function calculateDivisionalLongitude(longitude, division) {
  if (typeof longitude !== 'number' || longitude < 0 || longitude >= 360) {
    throw new Error(`Invalid longitude: ${longitude}`);
  }

  if (typeof division !== 'number' || division < 1) {
    throw new Error(`Invalid division: ${division}`);
  }

  let divisionalLong = (longitude * division) % 360;
  if (divisionalLong < 0) {
    divisionalLong += 360;
  }

  return divisionalLong;
}

/**
 * Generate D9 (Navamsa) chart
 * 9-fold division of zodiac
 *
 * @param {Object} planetPositions - Original planet longitudes
 * @returns {Object} D9 chart with Rashi and Nakshatra
 */
function generateD9Chart(planetPositions) {
  const d9Chart = {};

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const d9Long = calculateDivisionalLongitude(position.longitude, 9);
    const rashi = calculateRashi(d9Long);
    const nakshatra = calculateNakshatra(d9Long);

    d9Chart[planet] = {
      originalLongitude: position.longitude,
      d9Longitude: d9Long,
      rashi: rashi.name,
      rashiNumber: rashi.number,
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      pada: nakshatra.pada
    };
  }

  return d9Chart;
}

/**
 * Generate D10 (Dashamsa) chart
 * 10-fold division of zodiac
 *
 * @param {Object} planetPositions - Original planet longitudes
 * @returns {Object} D10 chart with Rashi and Nakshatra
 */
function generateD10Chart(planetPositions) {
  const d10Chart = {};

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const d10Long = calculateDivisionalLongitude(position.longitude, 10);
    const rashi = calculateRashi(d10Long);
    const nakshatra = calculateNakshatra(d10Long);

    d10Chart[planet] = {
      originalLongitude: position.longitude,
      d10Longitude: d10Long,
      rashi: rashi.name,
      rashiNumber: rashi.number,
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      pada: nakshatra.pada
    };
  }

  return d10Chart;
}

/**
 * Generate D12 (Dwadasamsa) chart
 * 12-fold division of zodiac
 *
 * @param {Object} planetPositions - Original planet longitudes
 * @returns {Object} D12 chart
 */
function generateD12Chart(planetPositions) {
  const d12Chart = {};

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const d12Long = calculateDivisionalLongitude(position.longitude, 12);
    const rashi = calculateRashi(d12Long);

    d12Chart[planet] = {
      originalLongitude: position.longitude,
      d12Longitude: d12Long,
      rashi: rashi.name,
      rashiNumber: rashi.number
    };
  }

  return d12Chart;
}

/**
 * Generic divisional chart generator
 * Can generate D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60
 *
 * @param {number} division - Division number (2, 3, 4, 7, 9, 10, 12, etc.)
 * @param {Object} planetPositions - Original planet longitudes
 * @returns {Object} Divisional chart
 */
function generateVargaChart(division, planetPositions) {
  if (typeof division !== 'number' || division < 1) {
    throw new Error('Invalid division number');
  }

  const vargaChart = {};
  const chartName = `D${division}`;

  for (const [planet, position] of Object.entries(planetPositions)) {
    if (!position || position.longitude === undefined) continue;

    const varLong = calculateDivisionalLongitude(position.longitude, division);
    const rashi = calculateRashi(varLong);
    const nakshatra = calculateNakshatra(varLong);

    vargaChart[planet] = {
      originalLongitude: position.longitude,
      vargaLongitude: varLong,
      division: division,
      rashi: rashi.name,
      rashiNumber: rashi.number,
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      pada: nakshatra.pada,
      displayDMS: rashi.displayDMS
    };
  }

  return {
    chartName,
    division,
    planets: vargaChart
  };
}

/**
 * Generate all major divisional charts
 *
 * @param {Object} planetPositions - Original planet longitudes
 * @returns {Object} All Vargas { D1, D9, D10, D12, ... }
 */
function generateAllVargas(planetPositions) {
  return {
    D1: {
      name: "Rashi",
      description: "Main birth chart",
      planets: planetPositions
    },
    D9: {
      name: "Navamsa",
      description: "Spiritual chart, marriage, fortune",
      planets: generateD9Chart(planetPositions)
    },
    D10: {
      name: "Dashamsa",
      description: "Career and profession chart",
      planets: generateD10Chart(planetPositions)
    },
    D12: {
      name: "Dwadasamsa",
      description: "Parents and inheritance",
      planets: generateD12Chart(planetPositions)
    }
  };
}

/**
 * Validate divisional chart calculations
 *
 * @param {Object} vargaChart - Generated Varga chart
 * @returns {Object} { valid, errors }
 */
function validateVargaChart(vargaChart) {
  const errors = [];

  for (const [planet, data] of Object.entries(vargaChart)) {
    if (!data || data.vargaLongitude === undefined) continue;

    // Validate longitude range
    if (data.vargaLongitude < 0 || data.vargaLongitude >= 360) {
      errors.push(`${planet}: Invalid Varga longitude ${data.vargaLongitude}`);
    }

    // Validate Rashi
    if (!data.rashi) {
      errors.push(`${planet}: Missing Rashi in Varga chart`);
    }

    // Validate Pada (if applicable)
    if (data.pada && (data.pada < 1 || data.pada > 4)) {
      errors.push(`${planet}: Invalid Pada ${data.pada}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateDivisionalLongitude,
  generateD9Chart,
  generateD10Chart,
  generateD12Chart,
  generateVargaChart,
  generateAllVargas,
  validateVargaChart
};
