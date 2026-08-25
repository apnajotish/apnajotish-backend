// ============================================================
// LOCATION AND TIMEZONE RESOLUTION ENGINE
// Birthplace → Coordinates → Timezone
// ============================================================

const NodeGeocoder = require('node-geocoder');

// Initialize geocoder with Nominatim (free, no API key required)
const geocoder = NodeGeocoder({
  provider: 'nominatim',
  timeout: 5000
});

// Timezone mapping for major Indian cities (for fallback)
const INDIA_TIMEZONE_MAP = {
  "Asia/Kolkata": "Asia/Kolkata",
  "Asia/Kathmandu": "Asia/Kathmandu",
  "Asia/Dhaka": "Asia/Dhaka",
  "Asia/Bangkok": "Asia/Bangkok",
  "Asia/Yangon": "Asia/Yangon",
  "Asia/Singapore": "Asia/Singapore",
  "Asia/Hong_Kong": "Asia/Hong_Kong",
  "Asia/Shanghai": "Asia/Shanghai",
  "Asia/Tokyo": "Asia/Tokyo",
  "Australia/Sydney": "Australia/Sydney",
  "Europe/London": "Europe/London",
  "America/New_York": "America/New_York",
  "America/Los_Angeles": "America/Los_Angeles"
};

// Major cities with pre-defined coordinates for fallback
const MAJOR_CITIES = {
  "mumbai": { latitude: 19.0760, longitude: 72.8777, timezone: "Asia/Kolkata" },
  "delhi": { latitude: 28.7041, longitude: 77.1025, timezone: "Asia/Kolkata" },
  "bangalore": { latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  "hyderabad": { latitude: 17.3850, longitude: 78.4867, timezone: "Asia/Kolkata" },
  "kolkata": { latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  "chennai": { latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  "pune": { latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
  "jaipur": { latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata" },
  "lucknow": { latitude: 26.8467, longitude: 80.9462, timezone: "Asia/Kolkata" },
  "ahmedabad": { latitude: 23.0225, longitude: 72.5714, timezone: "Asia/Kolkata" },
  "new york": { latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York" },
  "london": { latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  "los angeles": { latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  "sydney": { latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" }
};

/**
 * Resolve birthplace to coordinates and timezone
 * Priority: User-provided coords > Geocoding > Fallback
 *
 * @param {string} place - Place name (e.g., "Mumbai, Maharashtra, India")
 * @param {number} latitude - Optional user-provided latitude
 * @param {number} longitude - Optional user-provided longitude
 * @param {string} timezone - Optional user-provided timezone
 * @returns {Promise<Object>} { latitude, longitude, timezone, place, source }
 */
async function resolveLocation(place, latitude = null, longitude = null, timezone = null) {
  try {
    // Step 1: If user provided coordinates, use them
    if (latitude !== null && longitude !== null) {
      if (!isValidCoordinate(latitude, longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      // If timezone provided, validate and use it
      if (timezone) {
        const validTimezone = validateTimezone(timezone);
        if (!validTimezone) {
          throw new Error(`Invalid timezone: ${timezone}`);
        }
        return {
          latitude,
          longitude,
          timezone,
          place,
          source: "user-provided",
          resolved: true
        };
      }

      // Otherwise, try to reverse geocode for timezone
      try {
        const tzResult = await findTimezoneForCoordinates(latitude, longitude);
        return {
          latitude,
          longitude,
          timezone: tzResult.timezone || "UTC",
          place,
          source: "user-coords-reverse-geocoded",
          resolved: true
        };
      } catch (e) {
        // If reverse geocoding fails, default to UTC
        return {
          latitude,
          longitude,
          timezone: "UTC",
          place,
          source: "user-coords-no-tz",
          resolved: true,
          warning: "Unable to determine timezone; defaulting to UTC"
        };
      }
    }

    // Step 2: Try to geocode the place name
    if (!place || place.trim().length === 0) {
      throw new Error("Place name is required");
    }

    // Check fallback first (faster)
    const fallback = checkFallback(place);
    if (fallback) {
      return {
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        timezone: fallback.timezone || timezone || "Asia/Kolkata",
        place,
        source: "fallback",
        resolved: true
      };
    }

    // Attempt geocoding
    let results;
    try {
      results = await geocoder.geocode(place);
    } catch (geocodeError) {
      console.warn(`Geocoding failed for "${place}": ${geocodeError.message}`);
      throw new Error(`Unable to geocode place: ${place}`);
    }

    if (!results || results.length === 0) {
      throw new Error(`No results found for place: ${place}`);
    }

    // Use first result
    const result = results[0];
    const resolvedLatitude = result.latitude;
    const resolvedLongitude = result.longitude;

    // Get timezone for this coordinate
    let resolvedTimezone = timezone;
    if (!resolvedTimezone) {
      try {
        const tzResult = await findTimezoneForCoordinates(resolvedLatitude, resolvedLongitude);
        resolvedTimezone = tzResult.timezone || "UTC";
      } catch (e) {
        resolvedTimezone = "UTC";
        console.warn(`Could not determine timezone for ${place}, defaulting to UTC`);
      }
    }

    return {
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      timezone: resolvedTimezone,
      place: result.formattedAddress || place,
      source: "geocoded",
      resolved: true
    };

  } catch (error) {
    throw new Error(`Location resolution failed: ${error.message}`);
  }
}

/**
 * Validate if coordinates are valid
 * @param {number} latitude - Latitude (-90 to 90)
 * @param {number} longitude - Longitude (-180 to 180)
 * @returns {boolean}
 */
function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Validate timezone string (basic check)
 * @param {string} timezone - IANA timezone
 * @returns {boolean}
 */
function validateTimezone(timezone) {
  // Basic validation - IANA timezones typically have format like "Continent/City"
  if (!timezone || typeof timezone !== 'string') return false;
  if (timezone === 'UTC') return true;
  return /^[A-Z][a-z]+\/[A-Z][a-z_]+$/.test(timezone) || timezone === 'UTC';
}

/**
 * Check fallback cities database
 * @param {string} place - Place name
 * @returns {Object|null} Coordinates and timezone if found
 */
function checkFallback(place) {
  const normalized = place.toLowerCase().trim();

  // Exact match
  if (MAJOR_CITIES[normalized]) {
    return MAJOR_CITIES[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(MAJOR_CITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Find timezone for given coordinates (stub for future implementation)
 * Currently returns UTC as fallback
 *
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} { timezone }
 */
async function findTimezoneForCoordinates(latitude, longitude) {
  // Note: A proper implementation would use a timezone database service
  // For now, return UTC as fallback
  // Future: Integrate with Mapbox, Google Maps, or similar API

  // Approximate timezone based on longitude (simplified)
  const approximateLongitude = longitude;
  let timezone = "UTC";

  if (approximateLongitude >= 40 && approximateLongitude <= 100) {
    timezone = "Asia/Kolkata"; // India region
  } else if (approximateLongitude >= 100 && approximateLongitude <= 150) {
    timezone = "Asia/Singapore"; // SE Asia
  } else if (approximateLongitude >= 120 && approximateLongitude <= 135) {
    timezone = "Asia/Tokyo"; // East Asia
  } else if (approximateLongitude > -180 && approximateLongitude < -60) {
    timezone = "America/New_York"; // US East
  } else if (approximateLongitude > -130 && approximateLongitude < -100) {
    timezone = "America/Los_Angeles"; // US West
  } else if (approximateLongitude > -20 && approximateLongitude < 30) {
    timezone = "Europe/London"; // Europe/Africa
  }

  return { timezone };
}

module.exports = {
  resolveLocation,
  isValidCoordinate,
  validateTimezone,
  checkFallback,
  findTimezoneForCoordinates,
  MAJOR_CITIES
};
