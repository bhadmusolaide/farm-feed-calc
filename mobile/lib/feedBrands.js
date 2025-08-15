// This file imports from the shared data to avoid duplication
export { FEED_BRANDS, LOCAL_FEED_MIXES, calculateLocalFeedCost } from '../../shared/data/feedBrands.js';

// Centrally alias 'pre-starter' -> 'starter' for Recommended Feeds and Local Mix retrieval
import { getRecommendedFeeds as sharedGetRecommendedFeeds, getLocalFeedMix as sharedGetLocalFeedMix } from '../../shared/data/feedBrands.js';
import { getFeedType } from '../../shared/utils/feedCalculator.js';

export function getRecommendedFeeds(birdType, ageInDays) {
  // Use unified stage, but alias 'pre-starter' to 'starter' for recommendations
  const stage = getFeedType(birdType, ageInDays);
  const aliasedStage = stage === 'pre-starter' ? 'starter' : stage;
  // Delegate to shared implementation with aliased stage by faking age bands where needed:
  // The shared function signature is (birdType, ageInDays); it internally maps to stage.
  // We cannot pass a stage directly, so we short-circuit by retrieving and filtering from FEED_BRANDS.
  // However, the shared function already reads by stage; to keep compatibility, call it and, if empty for pre-starter, fallback to starter.
  const feeds = sharedGetRecommendedFeeds(birdType, ageInDays);
  if (feeds && feeds.length > 0) return feeds;
  if (stage === 'pre-starter') {
    // Fallback: try starter by simulating age 15 (starter band) to reuse shared logic
    return sharedGetRecommendedFeeds(birdType, 15) || [];
  }
  return feeds || [];
}

export function getLocalFeedMix(birdType, ageInDays) {
  const stage = getFeedType(birdType, ageInDays);
  const mix = sharedGetLocalFeedMix(birdType, ageInDays);
  if (mix) return mix;
  if (stage === 'pre-starter') {
    // Fallback to starter mix by simulating age 15 (starter band)
    return sharedGetLocalFeedMix(birdType, 15) || null;
  }
  return null;
}