// Shared feed calculation logic for both mobile and web apps

// Feed conversion constants
const FEED_CONSTANTS = {
  GRAMS_PER_CUP: 130, // 1 cup ≈ 130g of feed
  CUP_VOLUME_ML: 500, // 1 cup = 500ml
};

// Bird breed data with growth characteristics
export const BIRD_BREEDS = {
  broiler: {
    'arbor_acres': {
      name: 'Arbor Acres',
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
    'ross_308': {
      name: 'Ross 308',
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
    'cobb_500': {
      name: 'Cobb 500',
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
    'isa_brown': {
      name: 'ISA Brown',
      dailyFeedGrams: {
        week1: 12, week2: 20, week3: 35, week4: 55, week5: 75, week6: 90,
        week7: 100, week8: 110, week9: 115, week10: 120, adult: 125
      }
    },
    'lohmann_brown': {
      name: 'Lohmann Brown',
      dailyFeedGrams: {
        week1: 13, week2: 22, week3: 37, week4: 57, week5: 77, week6: 92,
        week7: 102, week8: 112, week9: 117, week10: 122, adult: 127
      }
    },
    'hy_line_brown': {
      name: 'Hy-Line Brown',
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
 */
export function calculateFeed(birdType, breed, ageInDays, quantity, rearingStyle, targetWeight = 'medium') {
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
    feedPerBirdGrams: adjustedFeedPerBird,
    feedPerBirdCups: Math.round(feedPerBirdCups * 100) / 100,
    totalDailyFeed: totalDailyFeedGrams,
    totalDailyFeedCups: Math.round(totalDailyFeedCups * 100) / 100,
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
 */
export function generateFeedingSchedule(ageInDays, totalDailyFeedCups) {
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
  
  return {
    mealsPerDay,
    feedPerMeal,
    times,
    schedule: times.map((time, index) => ({
      time,
      feedCups: feedPerMeal,
      meal: index + 1
    }))
  };
}

/**
 * Generate best practices based on bird parameters
 */
export function generateBestPractices(birdType, breed, ageInDays, rearingStyle) {
  const practices = [];
  
  // Age-based practices
  if (ageInDays <= 7) {
    practices.push('Provide 24-hour lighting for first week');
    practices.push('Maintain brooder temperature at 32-35°C');
    practices.push('Ensure fresh, clean water is always available');
    practices.push('Use starter feed with 20-24% protein');
  } else if (ageInDays <= 21) {
    practices.push('Reduce lighting to 16-18 hours per day');
    practices.push('Lower temperature gradually to 24-27°C');
    practices.push('Continue with starter feed');
    practices.push('Monitor for signs of coccidiosis');
  } else if (ageInDays <= 42) {
    practices.push('Switch to grower feed (18-20% protein)');
    practices.push('Provide 14-16 hours of light per day');
    practices.push('Ensure adequate ventilation');
    practices.push('Monitor weight gain regularly');
  } else {
    practices.push('Use finisher feed (16-18% protein)');
    practices.push('Maintain consistent feeding schedule');
    practices.push('Prepare for processing (broilers) or laying (layers)');
  }
  
  // Rearing style specific practices
  if (rearingStyle === 'backyard') {
    practices.push('Provide secure outdoor run if possible');
    practices.push('Protect from predators and weather');
    practices.push('Allow for natural foraging behavior');
  } else {
    practices.push('Maintain biosecurity protocols');
    practices.push('Monitor feed conversion ratios');
    practices.push('Implement vaccination schedule');
  }
  
  return practices;
}

/**
 * Convert age between days and weeks
 */
export function convertAge(age, fromUnit, toUnit) {
  if (fromUnit === toUnit) return age;
  
  if (fromUnit === 'days' && toUnit === 'weeks') {
    return Math.round((age / 7) * 10) / 10; // Round to 1 decimal
  }
  
  if (fromUnit === 'weeks' && toUnit === 'days') {
    return age * 7;
  }
  
  return age;
}