// ============================================================
// CENTRAL ASTROLOGY CONFIGURATION
// ApnaJotish Vedic Calculation System
// ============================================================

const ASTROLOGY_CONFIG = {
  // System type
  system: "vedic",
  zodiac: "sidereal",

  // Ayanamsha configuration
  ayanamsha: "lahiri",
  ayanamshaName: "Lahiri / Chitra Paksha",

  // House system
  houseSystem: "whole_sign",

  // Node configuration
  nodeType: "mean",  // "mean" or "true"

  // Dasha system
  dashaSystem: "vimshottari",

  // Calculation profile
  calculationProfile: "jhora-compatible",

  // Ephemeris
  ephemerisVersion: "sweph-2.10.3",

  // Swiss Ephemeris configuration
  swissEphemeris: {
    ayanamsha: 15,  // 15 = Lahiri in SE
    houseMethod: 'W',  // W = Whole Sign
    equinox: 0,  // 0 = Mean Node, 1 = True Node
    flagSpeed: false,
    flagEquinox: false
  }
};

// Nakshatras (27 total)
const NAKSHATRAS = [
  { number: 1, name: "Ashwini", lord: "Ketu", startDegree: 0, endDegree: 13.333 },
  { number: 2, name: "Bharani", lord: "Venus", startDegree: 13.333, endDegree: 26.666 },
  { number: 3, name: "Krittika", lord: "Sun", startDegree: 26.666, endDegree: 40 },
  { number: 4, name: "Rohini", lord: "Moon", startDegree: 40, endDegree: 53.333 },
  { number: 5, name: "Mrigashirsha", lord: "Mars", startDegree: 53.333, endDegree: 66.666 },
  { number: 6, name: "Ardra", lord: "Rahu", startDegree: 66.666, endDegree: 80 },
  { number: 7, name: "Punarvasu", lord: "Jupiter", startDegree: 80, endDegree: 93.333 },
  { number: 8, name: "Pushya", lord: "Saturn", startDegree: 93.333, endDegree: 106.666 },
  { number: 9, name: "Ashlesha", lord: "Mercury", startDegree: 106.666, endDegree: 120 },
  { number: 10, name: "Magha", lord: "Ketu", startDegree: 120, endDegree: 133.333 },
  { number: 11, name: "Purva Phalguni", lord: "Venus", startDegree: 133.333, endDegree: 146.666 },
  { number: 12, name: "Uttara Phalguni", lord: "Sun", startDegree: 146.666, endDegree: 160 },
  { number: 13, name: "Hasta", lord: "Moon", startDegree: 160, endDegree: 173.333 },
  { number: 14, name: "Chitra", lord: "Mars", startDegree: 173.333, endDegree: 186.666 },
  { number: 15, name: "Swati", lord: "Rahu", startDegree: 186.666, endDegree: 200 },
  { number: 16, name: "Vishakha", lord: "Jupiter", startDegree: 200, endDegree: 213.333 },
  { number: 17, name: "Anuradha", lord: "Saturn", startDegree: 213.333, endDegree: 226.666 },
  { number: 18, name: "Jyeshtha", lord: "Mercury", startDegree: 226.666, endDegree: 240 },
  { number: 19, name: "Mula", lord: "Ketu", startDegree: 240, endDegree: 253.333 },
  { number: 20, name: "Purva Ashadha", lord: "Venus", startDegree: 253.333, endDegree: 266.666 },
  { number: 21, name: "Uttara Ashadha", lord: "Sun", startDegree: 266.666, endDegree: 280 },
  { number: 22, name: "Shravana", lord: "Moon", startDegree: 280, endDegree: 293.333 },
  { number: 23, name: "Dhanishtha", lord: "Mars", startDegree: 293.333, endDegree: 306.666 },
  { number: 24, name: "Shatabhisha", lord: "Rahu", startDegree: 306.666, endDegree: 320 },
  { number: 25, name: "Purva Bhadrapada", lord: "Jupiter", startDegree: 320, endDegree: 333.333 },
  { number: 26, name: "Uttara Bhadrapada", lord: "Saturn", startDegree: 333.333, endDegree: 346.666 },
  { number: 27, name: "Revati", lord: "Mercury", startDegree: 346.666, endDegree: 360 }
];

// Rashis (12 total)
const RASHIS = [
  { number: 1, name: "Aries", element: "Fire", ruler: "Mars", startDegree: 0, endDegree: 30 },
  { number: 2, name: "Taurus", element: "Earth", ruler: "Venus", startDegree: 30, endDegree: 60 },
  { number: 3, name: "Gemini", element: "Air", ruler: "Mercury", startDegree: 60, endDegree: 90 },
  { number: 4, name: "Cancer", element: "Water", ruler: "Moon", startDegree: 90, endDegree: 120 },
  { number: 5, name: "Leo", element: "Fire", ruler: "Sun", startDegree: 120, endDegree: 150 },
  { number: 6, name: "Virgo", element: "Earth", ruler: "Mercury", startDegree: 150, endDegree: 180 },
  { number: 7, name: "Libra", element: "Air", ruler: "Venus", startDegree: 180, endDegree: 210 },
  { number: 8, name: "Scorpio", element: "Water", ruler: "Mars", startDegree: 210, endDegree: 240 },
  { number: 9, name: "Sagittarius", element: "Fire", ruler: "Jupiter", startDegree: 240, endDegree: 270 },
  { number: 10, name: "Capricorn", element: "Earth", ruler: "Saturn", startDegree: 270, endDegree: 300 },
  { number: 11, name: "Aquarius", element: "Air", ruler: "Saturn", startDegree: 300, endDegree: 330 },
  { number: 12, name: "Pisces", element: "Water", ruler: "Jupiter", startDegree: 330, endDegree: 360 }
];

// Planets
const PLANETS = {
  SUN: { number: 0, name: "Sun", lord: "Sun", isLuminaire: true, isNode: false },
  MOON: { number: 1, name: "Moon", lord: "Moon", isLuminaire: true, isNode: false },
  MARS: { number: 2, name: "Mars", lord: "Mars", isLuminaire: false, isNode: false },
  MERCURY: { number: 3, name: "Mercury", lord: "Mercury", isLuminaire: false, isNode: false },
  JUPITER: { number: 4, name: "Jupiter", lord: "Jupiter", isLuminaire: false, isNode: false },
  VENUS: { number: 5, name: "Venus", lord: "Venus", isLuminaire: false, isNode: false },
  SATURN: { number: 6, name: "Saturn", lord: "Saturn", isLuminaire: false, isNode: false },
  RAHU: { number: 8, name: "Rahu", lord: "Rahu", isLuminaire: false, isNode: true },
  KETU: { number: 9, name: "Ketu", lord: "Ketu", isLuminaire: false, isNode: true },
  ASCENDANT: { number: -1, name: "Ascendant", lord: null, isLuminaire: false, isNode: false },
  MC: { number: -2, name: "MC", lord: null, isLuminaire: false, isNode: false }
};

// Vimshottari Dasha periods (in years)
const VIMSHOTTARI_DASHA_PERIODS = {
  "Ketu": 7,
  "Venus": 20,
  "Sun": 6,
  "Moon": 10,
  "Mars": 7,
  "Rahu": 18,
  "Jupiter": 16,
  "Saturn": 19,
  "Mercury": 17
};

// Nakshatra lords in Vimshottari order
const VIMSHOTTARI_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

module.exports = {
  ASTROLOGY_CONFIG,
  NAKSHATRAS,
  RASHIS,
  PLANETS,
  VIMSHOTTARI_DASHA_PERIODS,
  VIMSHOTTARI_LORDS
};
