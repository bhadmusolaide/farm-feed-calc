// Feed progression calculation utility
import { calculateFeed, calculateFeedCost, BIRD_BREEDS } from './feedCalculator.js';

/**
 * Calculate feed progression to target weeks (6, 7, 8 weeks)
 * @param {Object} params - Calculation parameters
 * @param {string} params.birdType - 'broiler' or 'layer'
 * @param {string} params.breed - Bird breed
 * @param {number} params.ageInDays - Current age in days
 * @param {number} params.quantity - Number of birds
 * @param {string} params.rearingStyle - 'commercial' or 'backyard'
 * @param {string} params.targetWeight - Target weight plan for broilers
 * @param {Object} params.environmental - Environmental conditions
 * @returns {Object} Feed progression data
 */
export function calculateFeedProgression(params) {
  const {
    birdType,
    breed,
    ageInDays,
    quantity,
    rearingStyle,
    targetWeight = 'medium',
    environmental = {}
  } = params;

  // Only calculate for birds under 8 weeks (56 days)
  if (ageInDays >= 56) {
    return null;
  }

  const targetWeeks = [6, 7, 8]; // Target weeks to show progression for
  const progressions = [];

  for (const targetWeek of targetWeeks) {
    const targetDays = targetWeek * 7;
    
    // Skip if already past this target
    if (ageInDays >= targetDays) {
      continue;
    }

    // Calculate total feed consumed from day 1 to current age
    let totalConsumedKg = 0;
    for (let day = 1; day <= ageInDays; day++) {
      const dayFeed = calculateFeed({
        ...params,
        ageInDays: day
      });
      totalConsumedKg += dayFeed.total.grams / 1000; // total.grams already includes quantity
    }

    // Calculate total feed needed from current age to target week
    let remainingFeedKg = 0;
    for (let day = ageInDays + 1; day <= targetDays; day++) {
      const dayFeed = calculateFeed({
        ...params,
        ageInDays: day
      });
      remainingFeedKg += dayFeed.total.grams / 1000; // total.grams already includes quantity
    }

    // Calculate total feed needed from day 1 to target week
    let totalRequiredKg = 0;
    for (let day = 1; day <= targetDays; day++) {
      const dayFeed = calculateFeed({
        ...params,
        ageInDays: day
      });
      totalRequiredKg += dayFeed.total.grams / 1000; // total.grams already includes quantity
    }

    // Calculate progress percentage
    const progressPercentage = (totalConsumedKg / totalRequiredKg) * 100;

    // Calculate days remaining
    const daysRemaining = targetDays - ageInDays;

    // Calculate cost for remaining feed using feed-type-specific pricing
    // Calculate average weekly feed consumption for the remaining period
    const remainingWeeks = Math.max(1, Math.ceil(daysRemaining / 7));
    const avgWeeklyFeedKg = remainingFeedKg / remainingWeeks;
    
    // Use middle age of remaining period for pricing calculation
    const midRemainingAge = Math.floor((ageInDays + targetDays) / 2);
    const costData = calculateFeedCost(birdType, midRemainingAge, avgWeeklyFeedKg);
    const remainingCost = costData.totalCost * remainingWeeks;
    
    // Calculate bag equivalents
    const totalConsumedBags = totalConsumedKg / 25;
    const remainingFeedBags = remainingFeedKg / 25;
    const totalRequiredBags = totalRequiredKg / 25;

    progressions.push({
      targetWeek,
      targetDays,
      daysRemaining,
      totalConsumedKg: Math.round(totalConsumedKg * 10) / 10,
      remainingFeedKg: Math.round(remainingFeedKg * 10) / 10,
      totalRequiredKg: Math.round(totalRequiredKg * 10) / 10,
      totalConsumedBags: Math.round(totalConsumedBags * 10) / 10,
      remainingFeedBags: Math.round(remainingFeedBags * 10) / 10,
      totalRequiredBags: Math.round(totalRequiredBags * 10) / 10,
      progressPercentage: Math.round(progressPercentage),
      remainingCost: Math.round(remainingCost),
      isCompleted: false
    });
  }

  // Add completed weeks for context
  const currentWeek = Math.ceil(ageInDays / 7);
  for (let week = 6; week < currentWeek && week <= 8; week++) {
    const weekDays = week * 7;
    let totalConsumedKg = 0;
    
    for (let day = 1; day <= weekDays; day++) {
      const dayFeed = calculateFeed({
        ...params,
        ageInDays: day
      });
      totalConsumedKg += dayFeed.total.grams / 1000; // total.grams already includes quantity
    }

    const totalConsumedBags = totalConsumedKg / 25;
    
    progressions.unshift({
      targetWeek: week,
      targetDays: weekDays,
      daysRemaining: 0,
      totalConsumedKg: Math.round(totalConsumedKg * 10) / 10,
      remainingFeedKg: 0,
      totalRequiredKg: Math.round(totalConsumedKg * 10) / 10,
      totalConsumedBags: Math.round(totalConsumedBags * 10) / 10,
      remainingFeedBags: 0,
      totalRequiredBags: Math.round(totalConsumedBags * 10) / 10,
      progressPercentage: 100,
      remainingCost: 0,
      isCompleted: true
    });
  }

  return {
    currentAge: ageInDays,
    currentWeek: Math.ceil(ageInDays / 7),
    progressions: progressions.sort((a, b) => a.targetWeek - b.targetWeek),
    birdType,
    breed,
    quantity
  };
}

/**
 * Get feed progression summary for quick overview
 * @param {Object} progressionData - Data from calculateFeedProgression
 * @returns {Object} Summary data
 */
export function getFeedProgressionSummary(progressionData) {
  if (!progressionData || !progressionData.progressions.length) {
    return null;
  }

  const nextTarget = progressionData.progressions.find(p => !p.isCompleted);
  
  // Show only the feed and cost needed to reach the NEXT target, not all remaining targets
  const nextTargetFeed = nextTarget?.remainingFeedKg || 0;
  const nextTargetCost = nextTarget?.remainingCost || 0;

  return {
    nextTargetWeek: nextTarget?.targetWeek,
    daysToNextTarget: nextTarget?.daysRemaining,
    totalRemainingFeed: Math.round(nextTargetFeed * 10) / 10,
    totalRemainingCost: Math.round(nextTargetCost),
    completedTargets: progressionData.progressions.filter(p => p.isCompleted).length,
    remainingTargets: progressionData.progressions.filter(p => !p.isCompleted).length
  };
}