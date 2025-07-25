// Shared feed calculation logic for both mobile and web apps

// Feed conversion constants
const FEED_CONSTANTS = {
  GRAMS_PER_CUP: 130, // 1 cup ≈ 130g of feed
  CUP_VOLUME_ML: 500, // 1 cup = 500ml
};

// Bird breed data with growth characteristics
const BIRD_BREEDS = {
  broiler: {
    'Arbor Acres': {
      dailyFeedGrams: {
        week1: 15, week2: 25, week3: 45, week4: 70, week5: 95, week6: 120
      },
      targetWeights: {
        low: { weight: 1.6, feedMultiplier: 0.85 },
        medium: { weight: 1.8, feedMultiplier: 1.0 },
        aggressive: { weight: 2.2, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      }
    },
    'Ross 308': {
      dailyFeedGrams: {
        week1: 18, week2: 28, week3: 48, week4: 75, week5: 100, week6: 125
      },
      targetWeights: {
        low: { weight: 1.7, feedMultiplier: 0.85 },
        medium: { weight: 1.9, feedMultiplier: 1.0 },
        aggressive: { weight: 2.3, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      }
    },
    'Cobb 500': {
      dailyFeedGrams: {
        week1: 16, week2: 26, week3: 46, week4: 72, week5: 98, week6: 122
      },
      targetWeights: {
        low: { weight: 1.6, feedMultiplier: 0.85 },
        medium: { weight: 1.8, feedMultiplier: 1.0 },
        aggressive: { weight: 2.2, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      }
    }
  },
  layer: {
    'ISA Brown': {
      dailyFeedGrams: {
        week1: 12, week2: 20, week3: 35, week4: 55, week5: 75, week6: 90,
        week7: 100, week8: 110, week9: 115, week10: 120, adult: 125
      }
    },
    'Lohmann Brown': {
      dailyFeedGrams: {
        week1: 13, week2: 22, week3: 37, week4: 57, week5: 77, week6: 92,
        week7: 102, week8: 112, week9: 117, week10: 122, adult: 127
      }
    },
    'Hy-Line Brown': {
      dailyFeedGrams: {
        week1: 11, week2: 19, week3: 34, week4: 54, week5: 74, week6: 89,
        week7: 99, week8: 109, week9: 114, week10: 119, adult: 124
      }
    }
  }
};

// Rearing style adjustments
const REARING_ADJUSTMENTS = {
  backyard: {
    feedMultiplier: 1.1, // 10% more due to less controlled environment
    maxBirds: 10
  },
  commercial: {
    feedMultiplier: 1.0, // Standard feeding
    maxBirds: Infinity
  }
};

/**
 * Calculate daily feed requirements for birds
 * @param {Object} params - Calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed name
 * @param {number} params.ageInDays - Age of birds in days
 * @param {number} params.quantity - Number of birds
 * @param {string} params.rearingStyle - 'backyard' or 'commercial'
 * @param {string} params.targetWeight - 'low', 'medium', 'aggressive' (broilers only)
 * @returns {Object} Feed calculation results
 */
export function calculateFeed(params) {
  const {
    birdType,
    breed,
    ageInDays,
    quantity,
    rearingStyle,
    targetWeight = 'medium'
  } = params;

  // Validate inputs
  if (!BIRD_BREEDS[birdType] || !BIRD_BREEDS[birdType][breed]) {
    throw new Error(`Invalid bird type or breed: ${birdType} - ${breed}`);
  }

  if (!REARING_ADJUSTMENTS[rearingStyle]) {
    throw new Error(`Invalid rearing style: ${rearingStyle}`);
  }

  // Calculate week from age
  const week = Math.ceil(ageInDays / 7);
  const weekKey = week <= 10 ? `week${week}` : 'adult';
  
  const breedData = BIRD_BREEDS[birdType][breed];
  const rearingData = REARING_ADJUSTMENTS[rearingStyle];
  
  // Get base daily feed per bird
  let baseFeedPerBird = breedData.dailyFeedGrams[weekKey] || breedData.dailyFeedGrams.adult || 125;
  
  // Apply target weight multiplier for broilers
  if (birdType === 'broiler' && breedData.targetWeights && breedData.targetWeights[targetWeight]) {
    baseFeedPerBird *= breedData.targetWeights[targetWeight].feedMultiplier;
  }
  
  // Apply rearing style adjustment
  const adjustedFeedPerBird = Math.round(baseFeedPerBird * rearingData.feedMultiplier);
  
  // Calculate totals
  const totalDailyFeedGrams = adjustedFeedPerBird * quantity;
  const feedPerBirdCups = adjustedFeedPerBird / FEED_CONSTANTS.GRAMS_PER_CUP;
  const totalDailyFeedCups = totalDailyFeedGrams / FEED_CONSTANTS.GRAMS_PER_CUP;
  
  return {
    perBird: {
      grams: adjustedFeedPerBird,
      cups: Math.round(feedPerBirdCups * 100) / 100 // Round to 2 decimal places
    },
    total: {
      grams: totalDailyFeedGrams,
      cups: Math.round(totalDailyFeedCups * 100) / 100
    },
    week,
    ageInDays,
    quantity,
    birdType,
    breed,
    rearingStyle,
    targetWeight: birdType === 'broiler' ? targetWeight : null
  };
}

/**
 * Generate feeding schedule based on bird age and type
 * @param {number} ageInDays - Age of birds in days
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} totalDailyFeedCups - Total daily feed in cups
 * @returns {Object} Feeding schedule
 */
export function generateFeedingSchedule(ageInDays, birdType, totalDailyFeedCups) {
  let mealsPerDay, times;
  
  if (ageInDays <= 14) {
    // Chicks: 4-5 meals per day
    mealsPerDay = 5;
    times = ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];
  } else if (ageInDays <= 28) {
    // Young birds: 3-4 meals per day
    mealsPerDay = 4;
    times = ['6:00 AM', '11:00 AM', '2:00 PM', '6:00 PM'];
  } else {
    // Adult birds: 2-3 meals per day
    mealsPerDay = 3;
    times = ['6:00 AM', '12:00 PM', '6:00 PM'];
  }
  
  const feedPerMeal = Math.round((totalDailyFeedCups / mealsPerDay) * 100) / 100;
  const feedPerMealGrams = Math.round((feedPerMeal * FEED_CONSTANTS.GRAMS_PER_CUP) * 100) / 100;
  
  return {
    mealsPerDay,
    feedPerMeal,
    feedPerMealGrams,
    times,
    schedule: times.map((time, index) => ({
      time,
      feedCups: feedPerMeal,
      feedGrams: feedPerMealGrams,
      meal: index + 1
    }))
  };
}

/**
 * Generate best practices based on bird parameters
 * @param {Object} params - Bird parameters
 * @returns {Array} Array of best practice recommendations
 */
export function generateBestPractices(params) {
  const { ageInDays, birdType, rearingStyle, quantity } = params;
  const practices = [];
  
  // Age-based practices
  if (ageInDays <= 7) {
    practices.push('Provide 24-hour lighting for first week');
    practices.push('Maintain brooder temperature at 32-35°C');
    practices.push('Ensure fresh, clean water is always available');
  } else if (ageInDays <= 14) {
    practices.push('Reduce brooder temperature by 3°C per week');
    practices.push('Start vaccination schedule as recommended');
  } else if (ageInDays <= 28) {
    practices.push('Monitor for signs of coccidiosis');
    practices.push('Ensure adequate ventilation');
  }
  
  // Bird type specific practices
  if (birdType === 'broiler') {
    if (ageInDays >= 21) {
      practices.push('Consider feed restriction to prevent leg problems');
    }
    if (ageInDays >= 35) {
      practices.push('Monitor for heat stress in hot weather');
    }
  } else if (birdType === 'layer') {
    if (ageInDays >= 140) {
      practices.push('Switch to layer feed with higher calcium');
      practices.push('Provide oyster shell for extra calcium');
    }
  }
  
  // Rearing style practices
  if (rearingStyle === 'backyard') {
    practices.push('Protect from predators with secure housing');
    practices.push('Allow supervised free-range time for exercise');
  } else {
    practices.push('Maintain proper stocking density');
    practices.push('Implement biosecurity measures');
  }
  
  return practices;
}

/**
 * Convert age between days and weeks
 * @param {number} value - Age value
 * @param {string} from - 'days' or 'weeks'
 * @returns {number} Converted age
 */
export function convertAge(value, from) {
  if (from === 'days') {
    return Math.ceil(value / 7); // Convert days to weeks
  } else {
    return value * 7; // Convert weeks to days
  }
}

// Export constants for use in components
export { BIRD_BREEDS, REARING_ADJUSTMENTS, FEED_CONSTANTS };