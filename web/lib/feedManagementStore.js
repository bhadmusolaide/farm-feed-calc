import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FEED_BRANDS, LOCAL_FEED_MIXES } from '../../shared/data/feedBrands.js';

// Create a deep copy of the original feed data
const createDefaultFeeds = () => {
  return {
    starter: [...FEED_BRANDS.starter.map(feed => ({ ...feed, isCustom: false }))],
    grower: [...FEED_BRANDS.grower.map(feed => ({ ...feed, isCustom: false }))],
    finisher: [...FEED_BRANDS.finisher.map(feed => ({ ...feed, isCustom: false }))],
    layer: [...FEED_BRANDS.layer.map(feed => ({ ...feed, isCustom: false }))]
  };
};

const createDefaultLocalMixes = () => {
  return {
    starter: { ...LOCAL_FEED_MIXES.starter, isCustom: false },
    grower: { ...LOCAL_FEED_MIXES.grower, isCustom: false },
    finisher: { ...LOCAL_FEED_MIXES.finisher, isCustom: false },
    layer: { ...LOCAL_FEED_MIXES.layer, isCustom: false }
  };
};

// Feed management store
export const useFeedManagementStore = create(
  persist(
    (set, get) => ({
      // State
      feeds: createDefaultFeeds(),
      localMixes: createDefaultLocalMixes(),
      isLoading: false,
      error: null,

      // Actions
      addFeed: (category, feedData) => {
        const newFeed = {
          ...feedData,
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true
        };
        
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: [...state.feeds[category], newFeed]
          }
        }));
        
        return newFeed.id;
      },

      updateFeed: (category, feedId, updatedData) => {
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: state.feeds[category].map(feed => 
              feed.id === feedId ? { ...feed, ...updatedData } : feed
            )
          }
        }));
      },

      deleteFeed: (category, feedId) => {
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: state.feeds[category].filter(feed => feed.id !== feedId)
          }
        }));
      },

      updateLocalMix: (category, updatedData) => {
        set(state => ({
          localMixes: {
            ...state.localMixes,
            [category]: { ...state.localMixes[category], ...updatedData }
          }
        }));
      },

      resetToDefaults: () => {
        set({
          feeds: createDefaultFeeds(),
          localMixes: createDefaultLocalMixes()
        });
      },

      // Getters
      getFeedsByCategory: (category) => {
        return get().feeds[category] || [];
      },

      getFeedById: (category, feedId) => {
        return get().feeds[category]?.find(feed => feed.id === feedId);
      },

      getLocalMixByCategory: (category) => {
        return get().localMixes[category];
      },

      // Get feeds for the main application (compatible with existing structure)
      getRecommendedFeeds: (birdType, ageInDays) => {
        const { feeds } = get();
        
        if (birdType === 'layer') {
          if (ageInDays < 126) { // Before 18 weeks
            return feeds.starter.concat(feeds.grower);
          } else {
            return feeds.layer;
          }
        } else { // broiler
          if (ageInDays <= 28) { // 0-4 weeks
            return feeds.starter;
          } else if (ageInDays <= 42) { // 4-6 weeks
            return feeds.grower;
          } else { // 6+ weeks
            return feeds.finisher;
          }
        }
      },

      getLocalFeedMix: (birdType, ageInDays) => {
        const { localMixes } = get();
        
        if (birdType === 'layer') {
          if (ageInDays < 126) {
            return ageInDays <= 28 ? localMixes.starter : localMixes.grower;
          } else {
            return localMixes.layer;
          }
        } else {
          if (ageInDays <= 28) {
            return localMixes.starter;
          } else if (ageInDays <= 42) {
            return localMixes.grower;
          } else {
            return localMixes.finisher;
          }
        }
      }
    }),
    {
      name: 'feed-management-storage',
      version: 1
    }
  )
);

// Helper function to create empty feed template
export const createEmptyFeed = () => ({
  brand: '',
  name: '',
  protein: 0,
  calcium: 0,
  ageRange: '',
  description: '',
  availability: '',
  packaging: ['25kg'],
  estimatedPrice: {'25kg': 0},
  currency: 'NGN',
  tags: []
});

// Helper function to create empty local mix template
export const createEmptyLocalMix = () => ({
  name: '',
  protein: 0,
  ingredients: [
    { name: 'Maize', percentage: 50, pricePerKg: 520 }
  ],
  instructions: ['Mix all ingredients thoroughly']
});

// Feed categories
export const FEED_CATEGORIES = [
  { value: 'starter', label: 'Starter (0-4 weeks)' },
  { value: 'grower', label: 'Grower (4-6 weeks)' },
  { value: 'finisher', label: 'Finisher (6+ weeks)' },
  { value: 'layer', label: 'Layer (18+ weeks)' }
];

// Common packaging options
export const PACKAGING_OPTIONS = ['25kg'];

// Common availability regions
export const AVAILABILITY_REGIONS = [
  'Nationwide',
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Ogun',
  'Oyo',
  'Northern Nigeria',
  'Southern Nigeria',
  'Lagos, Ogun, Oyo',
  'Lagos, Abuja, Port Harcourt'
];

// Common feed tags
export const FEED_TAGS = [
  'Premium',
  'Budget-friendly',
  'Organic',
  'High-protein',
  'Fast-growth',
  'Probiotics',
  'Enzymes',
  'Pelleted',
  'Mash',
  'Medicated',
  'Non-medicated'
];