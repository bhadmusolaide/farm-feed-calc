// Centralized feed pricing configuration (₦ per 25kg bag)
// Single source of truth for feed prices used across web and mobile.
export const FEED_PRICES = {
  starter: { pricePerBag: 25500, bagSizeKg: 25 },
  grower: { pricePerBag: 24500, bagSizeKg: 25 },
  finisher: { pricePerBag: 24000, bagSizeKg: 25 },
  layer: { pricePerBag: 22000, bagSizeKg: 25 }
};

// Utility to compute price per kg for a given feed type
export function getPricePerKg(feedType) {
  const cfg = FEED_PRICES[feedType] || FEED_PRICES.starter;
  return cfg.pricePerBag / cfg.bagSizeKg;
}

// Optional helper to update prices at runtime if needed by admin tools
export function updateFeedPrice(feedType, { pricePerBag, bagSizeKg }) {
  if (!FEED_PRICES[feedType]) {
    throw new Error(`Unknown feed type: ${feedType}`);
  }
  if (typeof pricePerBag === 'number') FEED_PRICES[feedType].pricePerBag = pricePerBag;
  if (typeof bagSizeKg === 'number') FEED_PRICES[feedType].bagSizeKg = bagSizeKg;
}