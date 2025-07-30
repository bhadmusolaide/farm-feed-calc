// Temperature calculation utility for poultry management
// Provides breed and age-specific optimal temperature ranges

export const TEMPERATURE_RANGES = {
  broiler: {
    brooding: {
      week1: { min: 32, max: 35, description: 'First week brooding' },
      week2: { min: 29, max: 32, description: 'Second week brooding' },
      week3: { min: 26, max: 29, description: 'Third week brooding' }
    },
    growing: {
      week4: { min: 23, max: 26, description: 'Early growing' },
      week5: { min: 20, max: 23, description: 'Mid growing' },
      week6: { min: 18, max: 22, description: 'Late growing' }
    },
    adult: { min: 18, max: 24, description: 'Adult birds' }
  },
  layer: {
    brooding: {
      week1: { min: 32, max: 35, description: 'First week brooding' },
      week2: { min: 29, max: 32, description: 'Second week brooding' },
      week3: { min: 26, max: 29, description: 'Third week brooding' },
      week4: { min: 23, max: 26, description: 'Fourth week brooding' }
    },
    growing: {
      week5: { min: 20, max: 23, description: 'Early growing' },
      week6: { min: 18, max: 22, description: 'Mid growing' },
      week7: { min: 18, max: 22, description: 'Late growing' },
      week8: { min: 18, max: 22, description: 'Pre-lay' }
    },
    adult: { min: 18, max: 22, description: 'Laying hens' }
  }
};

/**
 * Calculate optimal temperature range based on bird type, breed, and age
 * @param {Object} params - Calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed name
 * @param {number} params.ageInDays - Age of birds in days
 * @returns {Object} Temperature range data
 */
export function calculateOptimalTemperature({ birdType, breed, ageInDays }) {
  const week = Math.ceil(ageInDays / 7);
  
  // Validate bird type
  if (!TEMPERATURE_RANGES[birdType]) {
    return {
      min: 20,
      max: 25,
      description: 'Standard range',
      stage: 'general',
      week: week
    };
  }
  
  const ranges = TEMPERATURE_RANGES[birdType];
  
  // Determine stage based on age and bird type
  let stage, temperatureData;
  
  if (birdType === 'broiler') {
    if (week <= 3) {
      stage = 'brooding';
      temperatureData = ranges.brooding[`week${week}`] || ranges.brooding.week3;
    } else if (week <= 6) {
      stage = 'growing';
      temperatureData = ranges.growing[`week${week}`] || ranges.growing.week6;
    } else {
      stage = 'adult';
      temperatureData = ranges.adult;
    }
  } else if (birdType === 'layer') {
    if (week <= 4) {
      stage = 'brooding';
      temperatureData = ranges.brooding[`week${week}`] || ranges.brooding.week4;
    } else if (week <= 8) {
      stage = 'growing';
      temperatureData = ranges.growing[`week${week}`] || ranges.growing.week8;
    } else {
      stage = 'adult';
      temperatureData = ranges.adult;
    }
  }
  
  return {
    ...temperatureData,
    stage,
    week,
    ageInDays,
    birdType,
    breed
  };
}

/**
 * Get temperature management tips based on current conditions
 * @param {Object} params - Tips parameters
 * @param {number} params.currentTemp - Current temperature in Celsius
 * @param {Object} params.optimalRange - Optimal temperature range
 * @returns {Array} Array of management tips
 */
export function getTemperatureTips({ currentTemp, optimalRange }) {
  const tips = [];
  
  if (!currentTemp || !optimalRange) {
    return ['Monitor temperature regularly using a reliable thermometer'];
  }
  
  if (currentTemp < optimalRange.min) {
    const diff = optimalRange.min - currentTemp;
    tips.push(`Temperature is ${diff}°C below optimal. Provide additional heat sources.`);
    tips.push('Watch for huddling behavior - birds are too cold');
    tips.push('Ensure even heat distribution throughout the housing');
  } else if (currentTemp > optimalRange.max) {
    const diff = currentTemp - optimalRange.max;
    tips.push(`Temperature is ${diff}°C above optimal. Increase ventilation and provide shade.`);
    tips.push('Watch for panting and wing spreading - signs of heat stress');
    tips.push('Ensure adequate fresh water supply');
  } else {
    tips.push('Temperature is within optimal range');
    tips.push('Continue monitoring for any behavioral changes');
  }
  
  return tips;
}

/**
 * Get brooding temperature schedule for display
 * @param {string} birdType - 'broiler' or 'layer'
 * @returns {Array} Schedule of temperature reductions
 */
export function getBroodingSchedule(birdType) {
  const ranges = TEMPERATURE_RANGES[birdType];
  if (!ranges || !ranges.brooding) return [];
  
  return Object.entries(ranges.brooding).map(([weekKey, data]) => ({
    week: parseInt(weekKey.replace('week', '')),
    ...data
  }));
}