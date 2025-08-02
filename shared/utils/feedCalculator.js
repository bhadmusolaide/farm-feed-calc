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
export function calculateEnvironmentalAdjustment(environmental = {}) {
  let totalMultiplier = 1.0;
  const factors = [];
  
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
    
    totalMultiplier *= tempFactor.multiplier;
    factors.push({ type: 'temperature', factor: tempFactor.multiplier, description: tempFactor.description });
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
    
    totalMultiplier *= humidityFactor.multiplier;
    factors.push({ type: 'humidity', factor: humidityFactor.multiplier, description: humidityFactor.description });
  }
  
  // Seasonal adjustment
  if (environmental.season) {
    const seasonFactor = ENVIRONMENTAL_ADJUSTMENTS.season[environmental.season];
    if (seasonFactor) {
      totalMultiplier *= seasonFactor.multiplier;
      factors.push({ type: 'season', factor: seasonFactor.multiplier, description: seasonFactor.description });
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
 * Get feed type/stage based on bird type, age, and feeding system
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @param {string} feedingSystem - '2-phase' (Nigeria-Standard) or '3-phase' (International)
 * @returns {string} Feed type: 'starter', 'grower', 'finisher', or 'layer'
 */
export function getFeedType(birdType, ageInDays, feedingSystem = '2-phase') {
  if (birdType === 'layer') {
    return ageInDays < 126 ? (ageInDays <= 28 ? 'starter' : 'grower') : 'layer';
  } else {
    // Broiler feeding systems
    if (feedingSystem === '2-phase') {
      // Nigeria-Standard: Starter (0-5 weeks) → Finisher (5+ weeks)
      return ageInDays <= 35 ? 'starter' : 'finisher';
    } else {
      // International 3-phase: Starter → Grower → Finisher
      if (ageInDays <= 28) return 'starter';
      else if (ageInDays <= 42) return 'grower';
      else return 'finisher';
    }
  }
}

/**
 * Get protein percentage based on bird type, age, and feeding system
 * @param {string} birdType - 'broiler' or 'layer'
 * @param {number} ageInDays - Age of birds in days
 * @param {string} feedingSystem - '2-phase' (Nigeria-Standard) or '3-phase' (International)
 * @returns {number} Protein percentage
 */
export function getProtein(birdType, ageInDays, feedingSystem = '2-phase') {
  const feedType = getFeedType(birdType, ageInDays, feedingSystem);
  
  // Standard protein percentages based on feed type
  const proteinLevels = {
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
 * @param {string} params.feedingSystem - '2-phase' (Nigeria-Standard) or '3-phase' (International)
 * @param {Object} params.environmental - Environmental conditions (optional)
 * @returns {Object} Feed calculation results
 */
export function calculateFeed(params) {
  const {
    birdType,
    breed,
    ageInDays,
    quantity,
    rearingStyle,
    targetWeight = 'medium',
    feedingSystem = '2-phase',
    environmental = {}
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
  let adjustedFeedPerBird = baseFeedPerBird * rearingData.feedMultiplier;
  
  // Apply environmental adjustments
  const environmentalAdjustment = calculateEnvironmentalAdjustment(environmental);
  adjustedFeedPerBird *= environmentalAdjustment.totalMultiplier;
  
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
    environmentalAdjustment: environmentalAdjustment.factors.length > 0 ? environmentalAdjustment : null,
    baseFeedPerBird: Math.round(baseFeedPerBird),
    adjustmentFactors: {
      rearing: rearingData.feedMultiplier,
      environmental: environmentalAdjustment.totalMultiplier,
      targetWeight: birdType === 'broiler' && breedData.targetWeights?.[targetWeight] ? 
                   breedData.targetWeights[targetWeight].feedMultiplier : 1.0
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
    
    // Linear growth approximation for broilers (6-week cycle)
    const maxWeight = targetData.weight; // Weight at 6 weeks
    const growthRate = maxWeight / 42; // kg per day
    const expectedWeight = Math.min(growthRate * ageInDays, maxWeight);
    
    return {
      expectedWeight: Math.round(expectedWeight * 100) / 100,
      weightRange: {
        min: Math.round((expectedWeight * 0.9) * 100) / 100,
        max: Math.round((expectedWeight * 1.1) * 100) / 100
      },
      targetWeight: maxWeight,
      growthStage: week <= 2 ? 'Starter' : week <= 4 ? 'Grower' : 'Finisher',
      weeklyGain: Math.round((growthRate * 7) * 100) / 100
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
        excellent: '1.4 - 1.6',
        good: '1.6 - 1.8',
        average: '1.8 - 2.0',
        poor: '2.0+'
      },
      currentWeekTarget: week <= 2 ? '1.2 - 1.4' : week <= 4 ? '1.5 - 1.7' : '1.6 - 1.9',
      tips: [
        'Monitor feed wastage - spillage increases FCR',
        'Ensure consistent feed quality and freshness',
        'Maintain optimal temperature (20-24°C for adults)',
        'Provide adequate ventilation to reduce stress',
        'Regular health monitoring prevents FCR deterioration'
      ],
      factors: [
        'Feed quality and composition',
        'Environmental temperature',
        'Bird health and genetics',
        'Management practices',
        'Water quality and availability'
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
  // Current market prices (₦ per 25kg bag)
  const FEED_PRICES = {
    starter: { pricePerBag: 24500, bagSizeKg: 25 }, // ₦24,500 for 25kg
    finisher: { pricePerBag: 24000, bagSizeKg: 25 }, // ₦24,000 for 25kg
    layer: { pricePerBag: 20000, bagSizeKg: 25 }     // ₦20,000 for 25kg
  };

  let feedType, pricePerKg;

  if (birdType === 'layer') {
    feedType = 'layer';
    pricePerKg = FEED_PRICES.layer.pricePerBag / FEED_PRICES.layer.bagSizeKg;
  } else if (birdType === 'broiler') {
    // Broilers: starter feed for first 4 weeks, finisher feed after
    if (ageInDays <= 28) {
      feedType = 'starter';
      pricePerKg = FEED_PRICES.starter.pricePerBag / FEED_PRICES.starter.bagSizeKg;
    } else {
      feedType = 'finisher';
      pricePerKg = FEED_PRICES.finisher.pricePerBag / FEED_PRICES.finisher.bagSizeKg;
    }
  } else {
    // Default fallback
    feedType = 'starter';
    pricePerKg = FEED_PRICES.starter.pricePerBag / FEED_PRICES.starter.bagSizeKg;
  }

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