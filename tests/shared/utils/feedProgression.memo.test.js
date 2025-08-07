// Tests for memoization behavior in shared/utils/feedProgression.js
const { calculateFeed } = require('../../../shared/utils/feedCalculator.js');
const { calculateFeedProgression } = require('../../../shared/utils/feedProgression.js');

// We'll spy on calculateFeed to ensure it's not called redundantly
jest.mock('../../../shared/utils/feedCalculator.js', () => {
  const actual = jest.requireActual('../../../shared/utils/feedCalculator.js');
  return {
    ...actual,
    calculateFeed: jest.fn(actual.calculateFeed),
  };
});

describe('calculateFeedProgression memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reuses per-day results across loops and avoids redundant calculateFeed calls', () => {
    const params = {
      birdType: 'broiler',
      breed: 'Arbor Acres',
      ageInDays: 20, // Under 6 weeks to trigger targets 6,7,8
      quantity: 50,
      rearingStyle: 'commercial',
      targetWeight: 'medium',
      environmental: { temperature: 26, humidity: 60, season: 'dry' },
    };

    // The function internally loops days multiple times.
    // With memoization, the number of calculateFeed calls should be approximately:
    // - For consumed days: ageInDays times
    // - For remaining to target 6w (42d): (42 - ageInDays)
    // - For remaining to target 7w (49d): (49 - ageInDays)
    // - For remaining to target 8w (56d): (56 - ageInDays)
    // But because of memoization and reuse between targets, days 1..56 should be computed at most once each.
    // That upper bound is 56 unique days.
    calculateFeedProgression(params);

    // Strict upper bound: 56 unique days max, but often less due to using consumed+remaining derivation.
    expect(calculateFeed).toHaveBeenCalled();
    const calls = calculateFeed.mock.calls.length;
    expect(calls).toBeLessThanOrEqual(56);
  });

  test('progression output remains logically consistent', () => {
    const params = {
      birdType: 'broiler',
      breed: 'Arbor Acres',
      ageInDays: 20,
      quantity: 10,
      rearingStyle: 'commercial',
      targetWeight: 'medium',
      environmental: {},
    };

    const data = calculateFeedProgression(params);
    expect(data).toBeTruthy();
    expect(Array.isArray(data.progressions)).toBe(true);
    // Only targets ahead of current day should be present
    expect(data.progressions.every(p => p.targetDays > params.ageInDays || p.isCompleted)).toBe(true);

    // Derived relationship: totalRequiredKg ≈ totalConsumedKg + remainingFeedKg
    // Allow a small tolerance (0.2kg) to account for floating precision and rounding boundaries
    data.progressions.forEach(p => {
      if (!p.isCompleted) {
        const lhs = Math.round(p.totalRequiredKg * 10) / 10;
        const rhs = Math.round((p.totalConsumedKg + p.remainingFeedKg) * 10) / 10;
        expect(Math.abs(lhs - rhs)).toBeLessThanOrEqual(0.2);
      }
    });
  });
});