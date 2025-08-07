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
        week1: 14, week2: 23, week3: 42, week4: 65, week5: 88, week6: 110
      },
      targetWeights: {
        medium: { weight: 1.8, feedMultiplier: 1.0 },
        aggressive: { weight: 2.2, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      },
      fcrTargets: {
        week1: 1.20, week2: 1.35, week3: 1.50, week4: 1.60, week5: 1.68, week6: 1.72
      },
      growthCurve: {
        maturityDays: 45,
        maxWeight: 2.5,
        growthRate: 'moderate'
      }
    },
    'Ross 308': {
      dailyFeedGrams: {
        week1: 20, week2: 32, week3: 52, week4: 80, week5: 108, week6: 135
      },
      targetWeights: {
        medium: { weight: 1.9, feedMultiplier: 1.0 },
        aggressive: { weight: 2.3, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      },
      fcrTargets: {
        week1: 1.15, week2: 1.30, week3: 1.45, week4: 1.58, week5: 1.65, week6: 1.70
      },
      growthCurve: {
        maturityDays: 42,
        maxWeight: 2.5,
        growthRate: 'very_fast'
      }
    },
    'Cobb 500': {
      dailyFeedGrams: {
        week1: 16, week2: 26, week3: 46, week4: 72, week5: 98, week6: 122
      },
      targetWeights: {
        medium: { weight: 1.8, feedMultiplier: 1.0 },
        aggressive: { weight: 2.2, feedMultiplier: 1.25 },
        premium: { weight: 2.5, feedMultiplier: 1.4 }
      },
      fcrTargets: {
        week1: 1.18, week2: 1.32, week3: 1.48, week4: 1.62, week5: 1.70, week6: 1.75
      },
      growthCurve: {
        maturityDays: 42,
        maxWeight: 2.5,
        growthRate: 'fast'
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
    feedMultiplier: 1.05, // reduced to 5% to avoid compounding with aggressive multipliers
    maxBirds: Infinity
  }
};

// Environmental factor adjustments
const ENVIRONMENTAL_ADJUSTMENTS = {
  temperature: {
    cold: { threshold: 18, multiplier: 1.15, description: 'Cold weather increases energy needs' },
    cool: { threshold: 22, multiplier: 1.05, description: 'Cool weather slightly increases feed needs' },
    optimal: { threshold: 26, multiplier: 1.0, description: 'Optimal temperature range' },
    warm: { threshold: 30, multiplier: 0.95, description: 'Warm weather reduces appetite' },
    hot: { threshold: 35, multiplier: 0.85, description: 'Hot weather significantly reduces feed intake' }
  },
  humidity: {
    low: { threshold: 40, multiplier: 1.02, description: 'Low humidity increases water needs' },
    optimal: { threshold: 70, multiplier: 1.0, description: 'Optimal humidity range' },
    high: { threshold: 80, multiplier: 0.98, description: 'High humidity reduces appetite slightly' }
  },
  season: {
    dry: { multiplier: 1.05, description: 'Dry season increases feed and water needs' },
    wet: { multiplier: 0.98, description: 'Wet season may reduce activity and appetite' },
    harmattan: { multiplier: 1.08, description: 'Harmattan season increases energy requirements' }
  }
};

/**
 * Calculate environmental adjustment factor
 * @param {Object} environmental - Environmental conditions
 * @param {number} environmental.temperature - Temperature in Celsius
 * @param {number} environmental.humidity - Humidity percentage
 * @param {string} environmental.season - 'dry', 'wet', or 'harmattan'
 * @returns {Object} Environmental adjustment data
 */
/**
 * Calculate age-progressive feed multiplier for target weight plans
 * Starts conservative in early weeks and increases over time for better FCR
 * @param {number} ageInDays - Age of birds in days
 * @param {string} targetWeight - Target weight plan (medium, aggressive, premium)
 * @param {number} baseMultiplier - Base multiplier from target weight configuration
 * @returns {number} Age-adjusted multiplier
 */
/**
 * Calculate sigmoid growth curve for more accurate weight predictions
 * @param {number} ageInDays - Current age in days
 * @param {number} maxWeight - Target weight at maturity
 * @param {number} maturityDays - Days to reach target weight
 * @returns {number} Expected weight using sigmoid curve
 */
export function calculateSigmoidGrowth(ageInDays, maxWeight, maturityDays) {
  // Sigmoid parameters for realistic broiler growth
  const k = 0.15; // Growth rate parameter
  const midpoint = maturityDays * 0.6; // Growth inflection point at ~60% of cycle
  
  // Sigmoid formula: weight = maxWeight / (1 + e^(-k * (age - midpoint)))
  const exponent = -k * (ageInDays - midpoint);
  const sigmoidValue = 1 / (1 + Math.exp(exponent));
  
  return Math.min(maxWeight * sigmoidValue, maxWeight);
}

/**
 * Calculate breed-specific feed adjustment based on genetic potential
 * @param {string} breed - Breed name
 * @param {string} targetWeight - Target weight plan
 * @returns {number} Breed-specific adjustment multiplier
 */
/**
 * Calculate dynamic FCR-based feed adjustment for performance optimization
 * @param {number} currentFCR - Current measured FCR
 * @param {number} targetFCR - Target FCR for the age/breed
 * @param {number} ageInDays - Current age in days
 * @returns {Object} FCR adjustment recommendations
 */
export function calculateDynamicFCRAdjustment(currentFCR, targetFCR, ageInDays) {
  const fcrDeviation = currentFCR - targetFCR;
  const week = Math.ceil(ageInDays / 7);
  
  let feedAdjustment = 1.0;
  let recommendations = [];
  
  if (fcrDeviation > 0.3) {
    // FCR significantly worse than target
    feedAdjustment = 0.95; // Reduce feed by 5%
    recommendations.push('Reduce feed quantity - FCR indicates overfeeding');
    recommendations.push('Check for feed wastage and spillage');
    recommendations.push('Verify feed quality and freshness');
  } else if (fcrDeviation > 0.1) {
    // FCR moderately worse than target
    feedAdjustment = 0.98; // Reduce feed by 2%
    recommendations.push('Slight feed reduction recommended');
    recommendations.push('Monitor feeding behavior and environment');
  } else if (fcrDeviation < -0.2) {
    // FCR much better than target (possible underfeeding)
    feedAdjustment = 1.05; // Increase feed by 5%
    recommendations.push('Consider increasing feed - birds may be underfed');
    recommendations.push('Monitor weight gain and body condition');
  } else if (fcrDeviation < -0.1) {
    // FCR better than target
    feedAdjustment = 1.02; // Slight increase
    recommendations.push('FCR excellent - consider slight feed increase for optimal growth');
  } else {
    // FCR within acceptable range
    recommendations.push('FCR within target range - maintain current feeding');
  }
  
  return {
    feedAdjustment,
    fcrDeviation,
    status: fcrDeviation > 0.2 ? 'Poor' : fcrDeviation > 0 ? 'Below Target' : 
            fcrDeviation < -0.15 ? 'Excellent' : 'Good',
    recommendations,
    nextReviewDays: week <= 2 ? 3 : week <= 4 ? 5 : 7
  };
}

export function calculateBreedSpecificAdjustment(breed, targetWeight) {
  // Breed feed consumption factors based on real-world performance data
  // Ross 308: Fastest growth, highest feed consumption
  // Cobb 500: Balanced growth, moderate consumption (baseline)
  // Arbor Acres: Slower growth, lowest feed consumption
  const breedFactors = {
    'Ross 308': {
      medium: 1.05,    // 5% more feed needed - highest consumption breed
      aggressive: 1.08, // 8% more feed needed - rapid growth requires more energy
      premium: 1.12     // 12% more feed needed - intensive feeding for maximum growth
    },
    'Arbor Acres': {
      medium: 0.95,    // 5% less feed needed - most efficient consumption
      aggressive: 0.97, // 3% less feed needed - slower but efficient growth
      premium: 1.0      // Standard at premium weights - balanced efficiency
    },
    'Cobb 500': {
      medium: 1.0,     // Baseline - balanced breed serves as standard
      aggressive: 1.02, // 2% more feed needed - moderate increase for aggressive growth
      premium: 1.05     // 5% more feed needed - reasonable increase for premium weights
    }
  };
  
  return breedFactors[breed]?.[targetWeight] || 1.0;
}

export function calculateAgeProgressiveMultiplier(ageInDays, targetWeight, baseMultiplier) {
  // Updated unified plan multipliers (constant over age):
  // Medium = 0.93×, Aggressive = 1.00×, Premium = 1.07×
  const planBase = {
    medium: 1.05,
    aggressive: 1.25,
    premium: 1.40
  };
  return planBase[targetWeight] ?? (baseMultiplier || 1.0);
}

export function calculateEnvironmentalAdjustment(environmental = {}, targetWeight = 'medium') {
  let totalMultiplier = 1.0;
  const factors = [];
  
  // Target weight sensitivity factors
  const sensitivityFactors = {
    medium: 1.0,     // Standard sensitivity
    aggressive: 1.1, // 10% more sensitive to environmental changes
    premium: 1.2     // 20% more sensitive - intensive feeding requires better control
  };
  
  const sensitivity = sensitivityFactors[targetWeight] || 1.0;
  
  // Temperature adjustment
  if (environmental.temperature !== undefined) {
    const temp = environmental.temperature;
    let tempFactor;
    
    if (temp < ENVIRONMENTAL_ADJUSTMENTS.temperature.cold.threshold) {
      tempFactor = ENVIRONMENTAL_ADJUSTMENTS.temperature.cold;
    } else if (temp < ENVIRONMENTAL_ADJUSTMENTS.temperature.cool.threshold) {
      tempFactor = ENVIRONMENTAL_ADJUSTMENTS.temperature.cool;
    } else if (temp < ENVIRONMENTAL_ADJUSTMENTS.temperature.optimal.threshold) {
      tempFactor = ENVIRONMENTAL_ADJUSTMENTS.temperature.optimal;
    } else if (temp < ENVIRONMENTAL_ADJUSTMENTS.temperature.warm.threshold) {
      tempFactor = ENVIRONMENTAL_ADJUSTMENTS.temperature.warm;
    } else {
      tempFactor = ENVIRONMENTAL_ADJUSTMENTS.temperature.hot;
    }
    
    const adjustedMultiplier = 1 + ((tempFactor.multiplier - 1) * sensitivity);
    totalMultiplier *= adjustedMultiplier;
    factors.push({ type: 'temperature', factor: adjustedMultiplier, description: tempFactor.description + (sensitivity > 1 ? ' (enhanced for target weight)' : '') });
  }
  
  // Humidity adjustment
  if (environmental.humidity !== undefined) {
    const humidity = environmental.humidity;
    let humidityFactor;
    
    if (humidity < ENVIRONMENTAL_ADJUSTMENTS.humidity.low.threshold) {
      humidityFactor = ENVIRONMENTAL_ADJUSTMENTS.humidity.low;
    } else if (humidity < ENVIRONMENTAL_ADJUSTMENTS.humidity.optimal.threshold) {
      humidityFactor = ENVIRONMENTAL_ADJUSTMENTS.humidity.optimal;
    } else {
      humidityFactor = ENVIRONMENTAL_ADJUSTMENTS.humidity.high;
    }
    
    const adjustedHumidityMultiplier = 1 + ((humidityFactor.multiplier - 1) * sensitivity);
    totalMultiplier *= adjustedHumidityMultiplier;
    factors.push({ type: 'humidity', factor: adjustedHumidityMultiplier, description: humidityFactor.description + (sensitivity > 1 ? ' (enhanced for target weight)' : '') });
  }
  
  // Seasonal adjustment
  if (environmental.season) {
    const seasonFactor = ENVIRONMENTAL_ADJUSTMENTS.season[environmental.season];
    if (seasonFactor) {
      const adjustedSeasonMultiplier = 1 + ((seasonFactor.multiplier - 1) * sensitivity);
      totalMultiplier *= adjustedSeasonMultiplier;
      factors.push({ type: 'season', factor: adjustedSeasonMultiplier, description: seasonFactor.description + (sensitivity > 1 ? ' (enhanced for target weight)' : '') });
    }
  }
  
  return {
    totalMultiplier: Math.round(totalMultiplier * 1000) / 1000,
    factors,
    recommendation: totalMultiplier > 1.05 ? 'Increase feed allocation due to environmental stress' :
                   totalMultiplier < 0.95 ? 'Monitor birds closely as appetite may be reduced' :
                   'Environmental conditions are favorable for normal feeding'
  };
}

/**
 * Calculate performance benchmarks against breed standards
 * @param {Object} params - Performance calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed name
 * @param {number} params.ageInDays - Age of birds in days
 * @param {number} params.currentWeight - Current average weight in kg
 * @param {number} params.feedEfficiency - Feed efficiency ratio
 * @returns {Object} Performance benchmark data
 */
export function calculatePerformanceBenchmark(params) {
  const { birdType, breed, ageInDays, currentWeight, feedEfficiency } = params;
  const breedData = BIRD_BREEDS[birdType]?.[breed];
  if (!breedData || !breedData.targetWeights) {
    return null;
  }

  const week = Math.ceil(ageInDays / 7);
  const expectedWeight = breedData.targetWeights.medium?.weight || 1.8; // Default for broilers
  const weightPerformance = currentWeight ? (currentWeight / expectedWeight) * 100 : null;
  
  // Calculate expected feed consumption
  const weekKey = week <= 10 ? `week${week}` : 'adult';
  const expectedDailyFeed = breedData.dailyFeedGrams[weekKey] || breedData.dailyFeedGrams.adult || 125;
  const expectedTotalFeed = (expectedDailyFeed * ageInDays * 1) / 1000; // Convert to kg
  const calculatedFeedEfficiency = feedEfficiency || 80; // Use provided or default value

  let performanceRating, recommendations = [];
  
  if (weightPerformance >= 95 && calculatedFeedEfficiency >= 90) {
    performanceRating = 'Excellent';
    recommendations.push('Outstanding performance! Maintain current management practices.');
  } else if (weightPerformance >= 85 && calculatedFeedEfficiency >= 80) {
    performanceRating = 'Good';
    recommendations.push('Good performance with room for minor improvements.');
  } else if (weightPerformance >= 75 && calculatedFeedEfficiency >= 70) {
    performanceRating = 'Average';
    recommendations.push('Performance is average. Consider reviewing feeding schedule and feed quality.');
  } else {
    performanceRating = 'Below Standard';
    recommendations.push('Performance below breed standards. Immediate attention required.');
    
    if (weightPerformance < 75) {
      recommendations.push('Weight gain is below target. Check for health issues and feed quality.');
    }
    if (calculatedFeedEfficiency < 70) {
      recommendations.push('Feed efficiency is poor. Review feeding practices and environmental conditions.');
    }
  }

  return {
    performanceRating,
    weightPerformance: weightPerformance ? Math.round(weightPerformance) : null,
    feedEfficiency: calculatedFeedEfficiency ? Math.round(calculatedFeedEfficiency) : null,
    expectedWeight,
    expectedTotalFeed: Math.round(expectedTotalFeed * 100) / 100,
    recommendations
  };
}

/**
 * Get feed type/stage using unified phase map (no feedingSystem option)
 * Unified phases:
 *  - Day 1–14: 'pre-starter'
 *  - Day 15–28: 'starter'
 *  - Day 29+:   'finisher'
 * Layers still return 'starter'/'grower'/'layer' based on age bands used elsewhere.
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @returns {string} Feed type
 */
export function getFeedType(birdType, ageInDays) {
  if (birdType === 'layer') {
    // Keep existing layer mapping
    return ageInDays < 126 ? (ageInDays <= 28 ? 'starter' : 'grower') : 'layer';
  }
  // Broiler unified mapping
  if (ageInDays <= 14) return 'pre-starter';
  if (ageInDays <= 28) return 'starter';
  return 'finisher';
}

/**
 * Get protein percentage based on unified feed type and age
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @returns {number} Protein percentage
 */
export function getProtein(birdType, ageInDays) {
  const feedType = getFeedType(birdType, ageInDays);
  
  // Standard protein percentages based on unified feed type
  const proteinLevels = {
    'pre-starter': 23,
    starter: 22,
    grower: 19,
    finisher: 17,
    layer: 16
  };
  
  return proteinLevels[feedType] || 16;
}

/**
 * Calculate daily feed requirements for birds with environmental adjustments
 * @param {Object} params - Calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed name
 * @param {number} params.ageInDays - Age of birds in days
 * @param {number} params.quantity - Number of birds
 * @param {string} params.rearingStyle - 'backyard' or 'commercial'
 * @param {string} params.targetWeight - 'low', 'medium', 'aggressive' (broilers only)
 * @param {Object} params.environmental - Environmental conditions (optional)
 * @returns {Object} Feed calculation results
 */
/**
 * Calculate daily progressive feed amount based on industry standards
 * Day 1-7: Start low (17g), increase +2g/day
 * Day 8-21: +3-5g/day progressive increase
 * Day 22-42: +6-8g/day progressive increase
 */
function calculateDailyProgressiveFeed(ageInDays, birdType, breed) {
  if (birdType === 'layer') {
    // For layers, use existing weekly system as it's more appropriate
    const week = Math.ceil(ageInDays / 7);
    const weekKey = week <= 10 ? `week${week}` : 'adult';
    const breedData = BIRD_BREEDS[birdType][breed];
    return breedData.dailyFeedGrams[weekKey] || breedData.dailyFeedGrams.adult || 125;
  }

  // Unified broiler baseline per-bird curve (applies to all plans; plan multipliers applied later):
  // Days 1–14: 20 → 25 g (linear)
  // Days 15–28: 70 → 90 g (linear)
  // Days 29–42: 100 → 130 g (linear)
  // Days 43–56: 130 → 150 g (linear)
  // After 56: hold at 150 g (flat)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  let dailyFeed;

  if (ageInDays <= 0) {
    dailyFeed = 20; // guard
  } else if (ageInDays <= 14) {
    // 14-day ramp: start 20 at day1, reach 25 at day14
    const t = (ageInDays - 1) / (14 - 1);
    dailyFeed = 20 + t * (25 - 20);
  } else if (ageInDays <= 28) {
    // 14-day ramp: 70 at day15 to 90 at day28
    const t = (ageInDays - 15) / (28 - 15);
    dailyFeed = 70 + t * (90 - 70);
  } else if (ageInDays <= 42) {
    // 14-day ramp: 100 at day29 to 130 at day42
    const t = (ageInDays - 29) / (42 - 29);
    dailyFeed = 100 + t * (130 - 100);
  } else if (ageInDays <= 56) {
    // 14-day ramp: 130 at day43 to 150 at day56
    const t = (ageInDays - 43) / (56 - 43);
    dailyFeed = 130 + t * (150 - 130);
  } else {
    dailyFeed = 150; // hold flat beyond 8 weeks
  }

  return Math.round(clamp(dailyFeed, 0, 1000));
}

export function calculateFeed(params) {
  const {
    birdType,
    breed,
    ageInDays,
    quantity,
    rearingStyle,
    targetWeight = 'medium',
    environmental = {},
    useProgressiveFeeding = true // New parameter to enable/disable progressive feeding
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
  
  // Get base daily feed per bird using progressive feeding or weekly system
  let baseFeedPerBird;
  if (useProgressiveFeeding && birdType === 'broiler') {
    baseFeedPerBird = calculateDailyProgressiveFeed(ageInDays, birdType, breed);
  } else {
    baseFeedPerBird = breedData.dailyFeedGrams[weekKey] || breedData.dailyFeedGrams.adult || 125;
  }
  
  // Apply age-progressive target weight multiplier for broilers
  if (birdType === 'broiler' && breedData.targetWeights && breedData.targetWeights[targetWeight]) {
    const progressiveMultiplier = calculateAgeProgressiveMultiplier(ageInDays, targetWeight, breedData.targetWeights[targetWeight].feedMultiplier);
    const breedAdjustment = calculateBreedSpecificAdjustment(breed, targetWeight);
    baseFeedPerBird *= progressiveMultiplier * breedAdjustment;
  }
  
  // Remove rearing/environment effects as requested; only plan and breed multipliers remain
  let adjustedFeedPerBird = baseFeedPerBird;
  
  // Round to nearest gram
  adjustedFeedPerBird = Math.round(adjustedFeedPerBird);
  
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
    targetWeight: birdType === 'broiler' ? targetWeight : null,
    environmentalAdjustment: null,
    baseFeedPerBird: Math.round(baseFeedPerBird),
    adjustmentFactors: {
      rearing: 1.0,
      environmental: 1.0,
      targetWeight: birdType === 'broiler' && breedData.targetWeights?.[targetWeight] ?
                   calculateAgeProgressiveMultiplier(ageInDays, targetWeight, breedData.targetWeights[targetWeight].feedMultiplier) : 1.0,
      breedSpecific: birdType === 'broiler' ? calculateBreedSpecificAdjustment(breed, targetWeight) : 1.0
    }
  };
}

/**
 * Generate feeding schedule based on bird age and type
 * @param {number} ageInDays - Age of birds in days
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} totalDailyFeedCups - Total daily feed in cups
 * @returns {Object} Feeding schedule
 */
export function generateFeedingSchedule(ageInDays, birdType, totalDailyFeedCups, targetWeight = 'medium') {
  let mealsPerDay, times, feedingType;
  
  // Commercial-optimized feeding frequency based on research best practices
  if (ageInDays <= 14) {
    // Chicks (0-2 weeks): Ad-libitum feeding recommended
    feedingType = 'ad-libitum';
    mealsPerDay = 'continuous';
    times = ['Continuous access - refill as needed'];
  } else if (ageInDays <= 28) {
    // Young birds (3-4 weeks): 4 meals per day
    feedingType = 'scheduled';
    mealsPerDay = 4;
    times = ['6:00 AM', '11:00 AM', '2:00 PM', '6:00 PM'];
  } else if (ageInDays <= 42) {
    // Grower phase (5-6 weeks): 4 meals per day
    feedingType = 'scheduled';
    mealsPerDay = 4;
    times = ['6:00 AM', '11:00 AM', '2:00 PM', '6:00 PM'];
  } else {
    // Finisher phase (7+ weeks): 3 meals per day
    feedingType = 'scheduled';
    mealsPerDay = 3;
    times = ['6:00 AM', '12:00 PM', '6:00 PM'];
  }
  
  // For ad-libitum feeding, return special schedule
  if (feedingType === 'ad-libitum') {
    return {
      mealsPerDay: 'continuous',
      feedingType: 'ad-libitum',
      feedPerMeal: 'as needed',
      feedPerMealGrams: 'as needed',
      times,
      totalDailyFeedCups,
      totalDailyFeedGrams: Math.round(totalDailyFeedCups * FEED_CONSTANTS.GRAMS_PER_CUP),
      schedule: [{
        time: 'Continuous',
        feedCups: 'Keep feeders full',
        feedGrams: 'Monitor consumption',
        meal: 'Ad-libitum',
        note: 'Provide continuous access to feed. Monitor daily consumption and refill as needed.'
      }],
      recommendations: [
        'Ensure feeders are always full during daylight hours',
        'Monitor daily feed consumption closely',
        'Provide 23-24 hours of light to encourage frequent feeding',
        'Check feeders every 2-3 hours during active periods'
      ]
    };
  }
  
  // For scheduled feeding
  const feedPerMeal = Math.round((totalDailyFeedCups / mealsPerDay) * 100) / 100;
  const feedPerMealGrams = Math.round((feedPerMeal * FEED_CONSTANTS.GRAMS_PER_CUP) * 100) / 100;
  
  return {
    mealsPerDay,
    feedingType: 'scheduled',
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
 * Calculate expected bird weight based on breed, age, and feeding
 * @param {Object} params - Weight calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed name
 * @param {number} params.ageInDays - Age of birds in days
 * @param {string} params.targetWeight - 'low', 'medium', 'aggressive' (broilers only)
 * @returns {Object} Expected weight data
 */
export function calculateExpectedWeight(params) {
  const { birdType, breed, ageInDays, targetWeight = 'medium' } = params;
  
  const breedData = BIRD_BREEDS[birdType]?.[breed];
  if (!breedData) {
    return null;
  }
  
  const week = Math.ceil(ageInDays / 7);
  
  if (birdType === 'broiler') {
    // Broiler weight calculation based on target weight
    const targetData = breedData.targetWeights?.[targetWeight];
    if (!targetData) {
      return null;
    }
    
    // Sigmoid growth curve for broilers (more accurate than linear)
    const maxWeight = targetData.weight; // Weight at 6 weeks
    const expectedWeight = calculateSigmoidGrowth(ageInDays, maxWeight, 42);
    
    return {
      expectedWeight: Math.round(expectedWeight * 100) / 100,
      weightRange: {
        min: Math.round((expectedWeight * 0.9) * 100) / 100,
        max: Math.round((expectedWeight * 1.1) * 100) / 100
      },
      targetWeight: maxWeight,
      growthStage: week <= 2 ? 'Starter' : week <= 4 ? 'Grower' : 'Finisher',
      weeklyGain: ageInDays >= 7 ? 
        Math.round((expectedWeight - calculateSigmoidGrowth(ageInDays - 7, maxWeight, 42)) * 100) / 100 : 
        Math.round((expectedWeight * 0.1) * 100) / 100 // Estimated for first week
    };
  } else if (birdType === 'layer') {
    // Layer weight calculation (slower growth, longer cycle)
    let expectedWeight;
    
    if (ageInDays <= 70) {
      // Growing phase (0-10 weeks)
      const growthRate = 1.5 / 70; // Reach 1.5kg at 10 weeks
      expectedWeight = growthRate * ageInDays;
    } else if (ageInDays <= 140) {
      // Pre-lay phase (10-20 weeks)
      const baseWeight = 1.5;
      const additionalGrowth = (ageInDays - 70) * (0.3 / 70); // Add 0.3kg over 10 weeks
      expectedWeight = baseWeight + additionalGrowth;
    } else {
      // Laying phase (20+ weeks)
      expectedWeight = 1.8; // Mature layer weight
    }
    
    return {
      expectedWeight: Math.round(expectedWeight * 100) / 100,
      weightRange: {
        min: Math.round((expectedWeight * 0.85) * 100) / 100,
        max: Math.round((expectedWeight * 1.15) * 100) / 100
      },
      targetWeight: 1.8,
      growthStage: ageInDays <= 70 ? 'Pullet' : ageInDays <= 140 ? 'Pre-lay' : 'Layer',
      weeklyGain: ageInDays <= 140 ? Math.round(((expectedWeight * 1.05 - expectedWeight) / 1) * 100) / 100 : 0
    };
  }
  
  return null;
}

/**
 * Get FCR reference data for educational purposes
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @returns {Object} FCR reference information
 */
export function getFCRReference(birdType, ageInDays) {
  const week = Math.ceil(ageInDays / 7);
  
  if (birdType === 'broiler') {
    return {
      industryStandard: {
        excellent: '1.55 - 1.65',
        good: '1.65 - 1.75',
        average: '1.75 - 1.85',
        poor: '1.85+'
      },
      currentWeekTarget: week <= 2 ? '1.15 - 1.35' : week <= 4 ? '1.45 - 1.65' : '1.65 - 1.75',
      tips: [
        'Monitor feed wastage - spillage increases FCR',
        'Ensure consistent feed quality and freshness',
        'Maintain optimal temperature (20-24°C for adults)',
        'Provide adequate ventilation to reduce stress',
        'Regular health monitoring prevents FCR deterioration',
        'Target FCR of 1.65-1.75 for commercial broilers at market weight'
      ],
      factors: [
        'Feed quality and composition',
        'Environmental temperature',
        'Bird health and genetics',
        'Management practices',
        'Water quality and availability',
        'Breed-specific genetic potential'
      ]
    };
  } else if (birdType === 'layer') {
    return {
      industryStandard: {
        excellent: '2.0 - 2.2',
        good: '2.2 - 2.5',
        average: '2.5 - 2.8',
        poor: '2.8+'
      },
      currentWeekTarget: ageInDays <= 140 ? '2.5 - 3.0' : '2.0 - 2.3',
      tips: [
        'Layer FCR includes egg production efficiency',
        'Peak production period has best FCR (20-40 weeks)',
        'Calcium supplementation improves shell quality',
        'Consistent lighting schedule maintains production',
        'Stress reduction improves both FCR and egg quality'
      ],
      factors: [
        'Egg production rate',
        'Feed protein content',
        'Lighting program',
        'Housing conditions',
        'Genetic potential'
      ]
    };
  }
  
  return null;
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

/**
 * Calculate Feed Conversion Ratio (FCR) and efficiency metrics
 * @param {Object} params - FCR calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {number} params.ageInDays - Age of birds in days
 * @param {number} params.currentWeight - Current weight in kg
 * @param {number} params.totalFeedConsumed - Total feed consumed in kg
 * @returns {Object} FCR analysis with efficiency rating
 */
export function calculateFCR({ birdType, ageInDays, currentWeight, totalFeedConsumed }) {
  if (!totalFeedConsumed || !currentWeight) {
    return null;
  }

  // Calculate weight gain (assuming starting weight based on bird type)
  const startingWeight = birdType === 'broiler' ? 0.045 : 0.040; // kg
  const totalWeightGain = currentWeight - startingWeight;
  
  if (totalWeightGain <= 0) {
    return null;
  }

  const fcr = totalFeedConsumed / totalWeightGain;
  
  // Industry standard FCR targets
  const FCR_TARGETS = {
    broiler: {
      excellent: 1.6,
      good: 1.8,
      average: 2.0,
      poor: 2.5
    },
    layer: {
      // For layers, we use feed per dozen eggs instead of weight gain
      excellent: 1.8,
      good: 2.0,
      average: 2.2,
      poor: 2.5
    }
  };

  const targets = FCR_TARGETS[birdType] || FCR_TARGETS.broiler;
  
  let efficiency, recommendation;
  
  if (fcr <= targets.excellent) {
    efficiency = 'Excellent';
    recommendation = 'Outstanding performance! Maintain current feeding practices.';
  } else if (fcr <= targets.good) {
    efficiency = 'Good';
    recommendation = 'Good efficiency. Consider minor optimizations to reach excellent level.';
  } else if (fcr <= targets.average) {
    efficiency = 'Average';
    recommendation = 'Room for improvement. Review feed quality and feeding schedule.';
  } else if (fcr <= targets.poor) {
    efficiency = 'Below Average';
    recommendation = 'Significant improvement needed. Check feed quality, health status, and environment.';
  } else {
    efficiency = 'Poor';
    recommendation = 'Critical attention required. Consult veterinarian and review all management practices.';
  }

  return {
    fcr: Math.round(fcr * 100) / 100,
    efficiency,
    recommendations: [recommendation],
    targets,
    improvementPotential: fcr > targets.excellent ? Math.round((fcr - targets.excellent) * 100) / 100 : 0
  };
}

/**
 * Calculate feed cost based on bird type, age, and current market prices
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @param {number} weeklyFeedKg - Weekly feed requirement in kg
 * @returns {Object} Cost breakdown with total and per kg rate
 */
export function calculateFeedCost(birdType, ageInDays, weeklyFeedKg) {
  // Use the unified getFeedType function for consistency
  const feedType = getFeedType(birdType, ageInDays);

  // Lazy import to avoid circular dependencies if any consumer imports both modules
  // and to keep pricing centralized in shared/utils/pricingConfig.js
  // Note: dynamic import ensures compatibility in both web and mobile bundlers.
  const { getPricePerKg } = require('./pricingConfig.js');

  const pricePerKg = getPricePerKg(feedType);
  const totalCost = Math.round(weeklyFeedKg * pricePerKg);

  return {
    totalCost,
    pricePerKg: Math.round(pricePerKg),
    feedType,
    weeklyFeedKg
  };
}

/**
 * Feed formulation optimization engine
 * @param {Object} params - Optimization parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {number} params.ageInDays - Age of birds in days
 * @param {number} params.targetProtein - Target protein percentage
 * @param {number} params.budgetPerKg - Budget constraint per kg
 * @param {Array} params.availableIngredients - Available ingredients with prices
 * @returns {Object} Optimized feed formulation
 */
export function optimizeFeedFormulation(params) {
  const { birdType, ageInDays, targetProtein, budgetPerKg, availableIngredients = [] } = params;
  
  // Nutritional requirements by age and type
  const NUTRITIONAL_REQUIREMENTS = {
    broiler: {
      starter: { protein: 22, energy: 3000, calcium: 1.0, phosphorus: 0.7 },
      finisher: { protein: 18, energy: 3200, calcium: 0.9, phosphorus: 0.6 }
    },
    layer: {
      grower: { protein: 16, energy: 2800, calcium: 1.0, phosphorus: 0.6 },
      layer: { protein: 16, energy: 2750, calcium: 3.5, phosphorus: 0.6 }
    }
  };
  
  // Determine feed phase
  let phase;
  if (birdType === 'broiler') {
    phase = ageInDays <= 28 ? 'starter' : 'finisher';
  } else {
    phase = ageInDays < 126 ? 'grower' : 'layer';
  }
  
  const requirements = NUTRITIONAL_REQUIREMENTS[birdType][phase];
  
  // Basic ingredient database with nutritional values
  const INGREDIENT_DATABASE = {
    'Maize': { protein: 8.5, energy: 3350, calcium: 0.02, phosphorus: 0.28, pricePerKg: 520 },
    'Soybean Meal': { protein: 44, energy: 2230, calcium: 0.27, phosphorus: 0.65, pricePerKg: 680 },
    'Fish Meal': { protein: 60, energy: 2800, calcium: 5.0, phosphorus: 2.8, pricePerKg: 1200 },
    'Palm Kernel Cake': { protein: 16, energy: 1540, calcium: 0.4, phosphorus: 0.6, pricePerKg: 300 },
    'Wheat Offal': { protein: 15, energy: 1900, calcium: 0.15, phosphorus: 1.0, pricePerKg: 380 },
    'Bone Meal': { protein: 1, energy: 0, calcium: 24, phosphorus: 12, pricePerKg: 450 },
    'Oyster Shell': { protein: 0, energy: 0, calcium: 38, phosphorus: 0, pricePerKg: 270 }
  };
  
  // Simple optimization algorithm (least-cost formulation)
  const optimizeFormulation = () => {
    const ingredients = Object.keys(INGREDIENT_DATABASE);
    let bestFormulation = null;
    let lowestCost = Infinity;
    
    // Try different combinations (simplified approach)
    for (let maize = 40; maize <= 65; maize += 5) {
      for (let soybean = 15; soybean <= 30; soybean += 5) {
        for (let fishmeal = 0; fishmeal <= 15; fishmeal += 5) {
          const remaining = 100 - maize - soybean - fishmeal;
          if (remaining < 10 || remaining > 40) continue;
          
          const formulation = {
            'Maize': maize,
            'Soybean Meal': soybean,
            'Fish Meal': fishmeal,
            'Palm Kernel Cake': Math.max(0, remaining - 5),
            'Bone Meal': 3,
            'Premix': 2
          };
          
          // Calculate nutritional content
          let totalProtein = 0, totalCost = 0, totalCalcium = 0;
          
          Object.entries(formulation).forEach(([ingredient, percentage]) => {
            const data = INGREDIENT_DATABASE[ingredient];
            if (data) {
              totalProtein += (percentage / 100) * data.protein;
              totalCost += (percentage / 100) * data.pricePerKg;
              totalCalcium += (percentage / 100) * data.calcium;
            }
          });
          
          // Check if formulation meets requirements
          const proteinTarget = targetProtein || requirements.protein;
          if (totalProtein >= proteinTarget - 1 && totalProtein <= proteinTarget + 2 &&
              totalCost <= (budgetPerKg || 800) &&
              totalCost < lowestCost) {
            lowestCost = totalCost;
            bestFormulation = {
              ingredients: formulation,
              nutritionalContent: {
                protein: Math.round(totalProtein * 10) / 10,
                calcium: Math.round(totalCalcium * 100) / 100
              },
              costPerKg: Math.round(totalCost),
              savings: budgetPerKg ? Math.round(budgetPerKg - totalCost) : 0
            };
          }
        }
      }
    }
    
    return bestFormulation;
  };
  
  const optimizedFormulation = optimizeFormulation();
  
  if (!optimizedFormulation) {
    return {
      success: false,
      message: 'Unable to find optimal formulation within constraints',
      recommendations: [
        'Consider increasing budget per kg',
        'Review protein requirements',
        'Check ingredient availability and prices'
      ]
    };
  }
  
  return {
    success: true,
    phase,
    requirements,
    optimizedFormulation,
    recommendations: [
      `Optimized formulation meets ${requirements.protein}% protein requirement`,
      `Cost savings: ₦${optimizedFormulation.savings}/kg compared to budget`,
      'Ensure ingredients are fresh and properly stored',
      'Mix ingredients thoroughly for uniform distribution'
    ]
  };
}

/**
 * Generate comprehensive feed management recommendations
 * @param {Object} feedData - Feed calculation results
 * @param {Object} performanceData - Performance benchmark data
 * @param {Object} environmentalData - Environmental conditions
 * @returns {Array} Comprehensive recommendations
 */
export function generateComprehensiveRecommendations(feedData, performanceData, environmentalData) {
  const recommendations = [];
  
  // Feed efficiency recommendations
  if (feedData.adjustmentFactors?.environmental > 1.05) {
    recommendations.push({
      category: 'Environmental',
      priority: 'High',
      recommendation: 'Environmental stress detected. Increase feed allocation and monitor birds closely.',
      action: 'Adjust feeding schedule and provide environmental controls'
    });
  }
  
  // Performance-based recommendations
  if (performanceData?.performanceRating === 'Below Standard') {
    recommendations.push({
      category: 'Performance',
      priority: 'Critical',
      recommendation: 'Performance below breed standards requires immediate intervention.',
      action: 'Review health status, feed quality, and management practices'
    });
  }
  
  // Cost optimization recommendations
  if (feedData.birdType === 'broiler' && feedData.ageInDays > 35) {
    recommendations.push({
      category: 'Cost Optimization',
      priority: 'Medium',
      recommendation: 'Consider feed restriction for broilers over 5 weeks to improve FCR.',
      action: 'Implement controlled feeding schedule'
    });
  }
  
  // Seasonal recommendations
  if (environmentalData?.season === 'harmattan') {
    recommendations.push({
      category: 'Seasonal',
      priority: 'Medium',
      recommendation: 'Harmattan season increases energy requirements.',
      action: 'Increase feed allocation by 5-8% and ensure adequate water supply'
    });
  }
  
  return recommendations;
}

// Export constants for use in components
export { BIRD_BREEDS, REARING_ADJUSTMENTS, FEED_CONSTANTS, ENVIRONMENTAL_ADJUSTMENTS };