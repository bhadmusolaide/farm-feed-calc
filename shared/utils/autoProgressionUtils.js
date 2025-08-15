// Auto-progression utility functions

/**
 * Calculate current age in days from auto-progression startDate
 * @param {number} originalAgeInDays - Original age when calculation was saved
 * @param {string} startDate - ISO date string when auto-progression started
 * @returns {number} Current age in days
 */
export function calculateCurrentAge(originalAgeInDays, startDate) {
  if (!startDate) {
    return originalAgeInDays;
  }
  
  const start = new Date(startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  
  return originalAgeInDays + Math.max(0, daysSinceStart);
}

/**
 * Calculate days elapsed since auto-progression started
 * @param {string} startDate - ISO date string when auto-progression started
 * @returns {number} Days elapsed since start (minimum 0)
 */
export function getDaysFromStart(startDate) {
  if (!startDate) {
    return 0;
  }
  
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Check if a saved calculation has auto-progression enabled
 * @param {Object} calculation - Saved calculation object
 * @returns {boolean} True if auto-progression is enabled
 */
export function hasAutoProgression(calculation) {
  return !!(calculation?.autoProgression && calculation?.startDate);
}

/**
 * Get effective age for display purposes (current age if auto-progression, original age otherwise)
 * @param {Object} calculation - Saved calculation object
 * @returns {number} Age in days to use for calculations
 */
export function getEffectiveAge(calculation) {
  if (!calculation) {
    return 0;
  }
  
  if (hasAutoProgression(calculation)) {
    return calculateCurrentAge(calculation.ageInDays, calculation.startDate);
  }
  
  return calculation.ageInDays;
}

/**
 * Calculate current quantity considering mortality logs up to current date
 * @param {Object} calculation - Saved calculation object
 * @param {string} [upToDate] - Calculate up to this date (defaults to today)
 * @returns {number} Current quantity after mortality adjustments
 */
export function calculateCurrentQuantity(calculation, upToDate = null) {
  if (!calculation) {
    return 0;
  }
  
  let currentQuantity = calculation.quantity;
  const targetDate = upToDate ? new Date(upToDate) : new Date();
  
  if (Array.isArray(calculation.mortalityLog) && calculation.mortalityLog.length > 0) {
    calculation.mortalityLog.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate <= targetDate) {
        currentQuantity -= log.deaths || 0;
      }
    });
  }
  
  return Math.max(0, currentQuantity);
}