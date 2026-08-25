// ============================================================
// TIME CONVERSION ENGINE
// Local Birth Time → UTC → Julian Day UT
// ============================================================

const { DateTime } = require('luxon');

/**
 * Convert local birth time to Julian Day UT (Universal Time)
 *
 * @param {number} year - Birth year
 * @param {number} month - Birth month (1-12)
 * @param {number} day - Birth day (1-31)
 * @param {number} hour - Birth hour (0-23)
 * @param {number} minute - Birth minute (0-59)
 * @param {number} second - Birth second (0-59, optional)
 * @param {string} timezone - IANA timezone (e.g., "Asia/Kolkata")
 * @returns {Object} { julianDay, utcTime, localTime, timezoneOffset }
 */
function convertToJulianDay(year, month, day, hour, minute, second = 0, timezone) {
  try {
    // Validate inputs
    if (!timezone || typeof timezone !== 'string') {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    // Create local time in the specified timezone
    const localTime = DateTime.fromObject(
      {
        year,
        month,
        day,
        hour,
        minute,
        second
      },
      { zone: timezone }
    );

    if (!localTime.isValid) {
      throw new Error(`Invalid date/time: ${localTime.invalidReason}`);
    }

    // Convert to UTC
    const utcTime = localTime.toUTC();

    // Calculate Julian Day Number (astronomical)
    // Using standard astronomical formula
    const jd = calculateJulianDay(
      utcTime.year,
      utcTime.month,
      utcTime.day,
      utcTime.hour + (utcTime.minute / 60) + (utcTime.second / 3600)
    );

    // Get timezone offset in hours
    const offsetMs = localTime.offset;
    const timezoneOffset = offsetMs / 60; // Convert to minutes, then to hours

    return {
      julianDay: jd,
      julianDayUT: jd,  // Julian Day UT (same as above)
      utcTime: utcTime.toISO(),
      localTime: localTime.toISO(),
      timezoneOffset: offsetMs / 60,  // in minutes
      timezoneOffsetHours: (offsetMs / 1000) / 3600,  // in hours
      timezone,
      year: utcTime.year,
      month: utcTime.month,
      day: utcTime.day,
      hour: utcTime.hour,
      minute: utcTime.minute,
      second: utcTime.second
    };
  } catch (error) {
    throw new Error(`Time conversion failed: ${error.message}`);
  }
}

/**
 * Calculate Julian Day Number (astronomical)
 * Based on astronomical calculation algorithm
 *
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month (1-31)
 * @param {number} timeDecimal - Time as decimal (e.g., 14.5 = 14:30)
 * @returns {number} Julian Day Number
 */
function calculateJulianDay(year, month, day, timeDecimal = 0.5) {
  // Adjust month and year for Jan/Feb (they're counted as months 13/14 of previous year)
  let y = year;
  let m = month;

  if (month <= 2) {
    y -= 1;
    m += 12;
  }

  // Gregorian calendar correction factor
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  // Calculate Julian Day Number
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    timeDecimal / 24 +
    b -
    1524.5;

  return jd;
}

/**
 * Convert Julian Day back to calendar date/time
 * For verification purposes
 *
 * @param {number} jd - Julian Day Number
 * @returns {Object} { year, month, day, hour, minute, second }
 */
function julianDayToDate(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let a = z;
  if (z < 2299161) {
    a = z; // Julian calendar
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayFloat = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayFloat);
  const timeDecimal = dayFloat - day;

  let month = e - 1;
  let year = c - 4716;

  if (e > 13) {
    month = e - 13;
    year = c - 4715;
  }

  // Convert decimal time to hours/minutes/seconds
  const totalSeconds = timeDecimal * 24 * 3600;
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = Math.floor(totalSeconds % 60);

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeDecimal
  };
}

/**
 * Get timezone offset for a given location and date
 * Uses Luxon's built-in timezone support
 *
 * @param {string} timezone - IANA timezone (e.g., "Asia/Kolkata")
 * @param {string} isoDate - ISO date string
 * @returns {number} Offset in minutes
 */
function getTimezoneOffset(timezone, isoDate) {
  try {
    const dt = DateTime.fromISO(isoDate, { zone: timezone });
    return dt.offset; // in minutes
  } catch (error) {
    throw new Error(`Failed to get timezone offset: ${error.message}`);
  }
}

/**
 * Validate birth time accuracy
 * @param {string} timeAccuracy - "exact", "approximate", or "unknown"
 * @returns {Object} Validation result
 */
function validateTimeAccuracy(timeAccuracy) {
  const valid = ["exact", "approximate", "unknown"];
  if (!valid.includes(timeAccuracy)) {
    return {
      valid: false,
      error: `Invalid time accuracy. Must be one of: ${valid.join(", ")}`
    };
  }
  return { valid: true, timeAccuracy };
}

module.exports = {
  convertToJulianDay,
  calculateJulianDay,
  julianDayToDate,
  getTimezoneOffset,
  validateTimeAccuracy
};
