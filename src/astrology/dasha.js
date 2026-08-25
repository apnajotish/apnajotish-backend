// ============================================================
// VIMSHOTTARI DASHA CALCULATIONS
// Major period, sub-period, and sub-sub-period calculations
// ============================================================

const { VIMSHOTTARI_DASHA_PERIODS, VIMSHOTTARI_LORDS } = require('../config/astrologyConfig');
const { calculateNakshatra } = require('./rashis');

/**
 * Calculate Vimshottari Dasha balance at birth
 * Based on Moon's Nakshatra and position within that Nakshatra
 *
 * @param {number} moonLongitude - Moon's longitude (0-360)
 * @returns {Object} { mahadasha, lord, balanceYears, balancePercentage }
 */
function calculateDashaBalance(moonLongitude) {
  try {
    // Get Moon's Nakshatra
    const nakshatra = calculateNakshatra(moonLongitude);
    const nakshatraNumber = nakshatra.number;

    // Find nakshatra lord index (0-8, cycling through Vimshottari lords)
    const lordIndex = (nakshatraNumber - 1) % 9;
    const dashaLord = VIMSHOTTARI_LORDS[lordIndex];

    // Get total Mahadasha period for this lord
    const totalPeriod = VIMSHOTTARI_DASHA_PERIODS[dashaLord];

    // Calculate position within nakshatra (0-13.333 degrees)
    const degreeInNakshatra = nakshatra.degreeInNakshatra;
    const percentageInNakshatra = degreeInNakshatra / 13.333;

    // Calculate balance of this Mahadasha
    const balanceInYears = totalPeriod * (1 - percentageInNakshatra);

    return {
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatraNumber,
      mahadasha: dashaLord,
      lord: dashaLord,
      totalPeriod: totalPeriod,
      balanceYears: balanceInYears,
      balancePercentage: (1 - percentageInNakshatra) * 100,
      calculatedFrom: 'Moon Nakshatra'
    };
  } catch (error) {
    throw new Error(`Dasha balance calculation failed: ${error.message}`);
  }
}

/**
 * Generate Vimshottari Dasha periods for a given birth date
 *
 * @param {number} moonLongitude - Moon's longitude
 * @param {Date} birthDate - Birth date
 * @returns {Array} Array of Dasha periods { mahadasha, antardasha, startDate, endDate }
 */
function generateDashaPeriods(moonLongitude, birthDate) {
  try {
    const balance = calculateDashaBalance(moonLongitude);

    // Start with balance period
    const dashaSequence = [];

    // Current Mahadasha starting from birth
    let currentMahadasha = balance.mahadasha;
    let currentMahadashIndex = VIMSHOTTARI_LORDS.indexOf(currentMahadasha);
    let currentDate = new Date(birthDate);

    // Generate next 8 full Mahadashas + current partial
    for (let i = 0; i < 9; i++) {
      // If first iteration, use balance period
      const periodYears =
        i === 0 ? balance.balanceYears : VIMSHOTTARI_DASHA_PERIODS[currentMahadasha];

      // Add Mahadasha period
      const mahadashStart = new Date(currentDate);
      const mahadashEnd = new Date(currentDate);
      mahadashEnd.setFullYear(mahadashEnd.getFullYear() + Math.floor(periodYears));
      mahadashEnd.setMonth(
        mahadashEnd.getMonth() + Math.round((periodYears % 1) * 12)
      );

      // Generate Antardashas for this Mahadasha
      const antardashas = generateAntardashas(currentMahadasha, mahadashStart);

      dashaSequence.push({
        sequence: i,
        mahadasha: currentMahadasha,
        startDate: mahadashStart.toISOString().split('T')[0],
        endDate: mahadashEnd.toISOString().split('T')[0],
        periodYears: periodYears,
        antardashas: antardashas
      });

      // Move to next Mahadasha
      currentDate = mahadashEnd;
      currentMahadashIndex = (currentMahadashIndex + 1) % 9;
      currentMahadasha = VIMSHOTTARI_LORDS[currentMahadashIndex];
    }

    return dashaSequence;
  } catch (error) {
    throw new Error(`Dasha period generation failed: ${error.message}`);
  }
}

/**
 * Generate Antardasha (sub-periods) for a Mahadasha
 *
 * @param {string} mahadasha - Mahadasha lord name
 * @param {Date} startDate - Start date of Mahadasha
 * @returns {Array} Array of Antardasha periods
 */
function generateAntardashas(mahadasha, startDate) {
  const antardashas = [];
  const mahadashaPeriodYears = VIMSHOTTARI_DASHA_PERIODS[mahadasha];
  const mahadashaPeriodDays = mahadashaPeriodYears * 365.25; // Approximate

  // Total period to distribute among 9 Antardashas
  let currentDate = new Date(startDate);

  for (const antardasha of VIMSHOTTARI_LORDS) {
    const antardashaPeriodYears = VIMSHOTTARI_DASHA_PERIODS[antardasha];
    // Antardasha duration = (Antardasha period / total Mahadasha period) * Mahadasha duration
    const antardashaDuration = (antardashaPeriodYears / 120) * mahadashaPeriodYears; // 120 = sum of all periods

    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(antardashaDuration));
    endDate.setMonth(endDate.getMonth() + Math.round((antardashaDuration % 1) * 12));

    antardashas.push({
      antardasha: antardasha,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      periodYears: antardashaDuration
    });

    currentDate = endDate;
  }

  return antardashas;
}

/**
 * Get current Dasha and Antardasha for a given date
 *
 * @param {Array} dashaSequence - Generated Dasha sequence
 * @param {Date} queryDate - Date to query for current Dasha
 * @returns {Object} { mahadasha, antardasha, daysRemaining, startDate, endDate }
 */
function getCurrentDasha(dashaSequence, queryDate) {
  try {
    const queryTime = queryDate.getTime();

    for (const dasha of dashaSequence) {
      const startTime = new Date(dasha.startDate).getTime();
      const endTime = new Date(dasha.endDate).getTime();

      if (queryTime >= startTime && queryTime < endTime) {
        // Found the current Mahadasha, now find Antardasha
        for (const antardasha of dasha.antardashas) {
          const antarStartTime = new Date(antardasha.startDate).getTime();
          const antarEndTime = new Date(antardasha.endDate).getTime();

          if (queryTime >= antarStartTime && queryTime < antarEndTime) {
            const daysRemaining = Math.ceil((antarEndTime - queryTime) / (1000 * 60 * 60 * 24));

            return {
              mahadasha: dasha.mahadasha,
              antardasha: antardasha.antardasha,
              currentStartDate: antardasha.startDate,
              currentEndDate: antardasha.endDate,
              daysRemaining: daysRemaining,
              mahadashaDaysRemaining: Math.ceil((endTime - queryTime) / (1000 * 60 * 60 * 24))
            };
          }
        }

        // If no Antardasha found, return just Mahadasha
        return {
          mahadasha: dasha.mahadasha,
          antardasha: null,
          startDate: dasha.startDate,
          endDate: dasha.endDate,
          daysRemaining: Math.ceil((endTime - queryTime) / (1000 * 60 * 60 * 24))
        };
      }
    }

    return null; // Date outside Dasha sequence
  } catch (error) {
    throw new Error(`Failed to get current Dasha: ${error.message}`);
  }
}

/**
 * Validate Dasha calculations
 *
 * @param {Array} dashaSequence - Generated Dasha sequence
 * @returns {Object} { valid, errors }
 */
function validateDasha(dashaSequence) {
  const errors = [];

  if (!Array.isArray(dashaSequence) || dashaSequence.length === 0) {
    return { valid: false, errors: ['Empty Dasha sequence'] };
  }

  for (let i = 0; i < dashaSequence.length; i++) {
    const dasha = dashaSequence[i];

    // Validate dates
    if (!dasha.startDate || !dasha.endDate) {
      errors.push(`Dasha ${i}: Missing start or end date`);
    }

    const startTime = new Date(dasha.startDate).getTime();
    const endTime = new Date(dasha.endDate).getTime();

    if (endTime <= startTime) {
      errors.push(`Dasha ${i}: End date before start date`);
    }

    // Validate Mahadasha lord
    if (!VIMSHOTTARI_LORDS.includes(dasha.mahadasha)) {
      errors.push(`Dasha ${i}: Invalid Mahadasha lord ${dasha.mahadasha}`);
    }

    // Validate Antardashas
    if (dasha.antardashas && Array.isArray(dasha.antardashas)) {
      for (let j = 0; j < dasha.antardashas.length; j++) {
        const antardasha = dasha.antardashas[j];
        if (!VIMSHOTTARI_LORDS.includes(antardasha.antardasha)) {
          errors.push(`Dasha ${i}, Antardasha ${j}: Invalid lord`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateDashaBalance,
  generateDashaPeriods,
  generateAntardashas,
  getCurrentDasha,
  validateDasha
};
