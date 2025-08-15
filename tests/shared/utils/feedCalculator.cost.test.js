// Tests for pricing usage in calculateFeedCost using centralized pricingConfig
const { calculateFeedCost, getFeedType } = require('../../../shared/utils/feedCalculator.js');
const { FEED_PRICES, getPricePerKg, updateFeedPrice } = require('../../../shared/utils/pricingConfig.js');

// Helper to reset any runtime price mutations between tests
const resetPrices = () => {
  FEED_PRICES.starter.pricePerBag = 25500;
  FEED_PRICES.grower.pricePerBag = 24500;
  FEED_PRICES.finisher.pricePerBag = 24000;
  FEED_PRICES.layer.pricePerBag = 22000;
};

describe('calculateFeedCost uses centralized pricingConfig', () => {
  beforeEach(() => {
    resetPrices();
  });

  test('uses getFeedType to pick feed band and computes pricePerKg accordingly', () => {
    // For broiler at 21 days in 2-phase, feed type should be 'starter'
    const birdType = 'broiler';
    const ageInDays = 21;
    const weeklyFeedKg = 10;

    const { feedType, pricePerKg, totalCost } = calculateFeedCost(birdType, ageInDays, weeklyFeedKg);
    expect(feedType).toBe('starter');

    const expectedPricePerKg = Math.round(getPricePerKg('starter'));
    expect(pricePerKg).toBe(expectedPricePerKg);
    expect(totalCost).toBe(Math.round(weeklyFeedKg * getPricePerKg('starter')));
  });

  test('reflects runtime updates via updateFeedPrice', () => {
    const birdType = 'layer';
    const ageInDays = 150; // layer band
    const weeklyFeedKg = 5;

    // Sanity with baseline
    const baseline = calculateFeedCost(birdType, ageInDays, weeklyFeedKg);

    // Update price and expect new cost
    updateFeedPrice('layer', { pricePerBag: 30000 });
    const updated = calculateFeedCost(birdType, ageInDays, weeklyFeedKg);

    expect(updated.feedType).toBe('layer');
    expect(updated.pricePerKg).toBe(Math.round(30000 / FEED_PRICES.layer.bagSizeKg));
    expect(updated.totalCost).toBe(Math.round(weeklyFeedKg * (30000 / FEED_PRICES.layer.bagSizeKg)));

    // Ensure cost changed from baseline
    expect(updated.totalCost).not.toBe(baseline.totalCost);
  });

  test('falls back to starter price if unknown feedType is returned (defensive)', () => {
    // If getFeedType returned an unknown band, cost should still compute using starter as fallback.
    // We simulate unknown by calling getPricePerKg directly to ensure fallback logic exists,
    // though calculateFeedCost itself calls getFeedType with supported values.
    const unknownType = 'unknown-type';
    const pricePerKg = getPricePerKg(unknownType);
    expect(pricePerKg).toBeCloseTo(FEED_PRICES.starter.pricePerBag / FEED_PRICES.starter.bagSizeKg, 5);
  });
});