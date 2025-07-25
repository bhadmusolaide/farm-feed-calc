import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FEED_BRANDS, LOCAL_FEED_MIXES } from '../../shared/data/feedBrands.js';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

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

// Enhanced feed management store with Firebase integration
export const useEnhancedFeedManagementStore = create(
  persist(
    (set, get) => ({
      // State
      feeds: createDefaultFeeds(),
      localMixes: createDefaultLocalMixes(),
      customFeeds: [], // Loaded from database
      customLocalMixes: [], // Loaded from database
      isLoading: false,
      isSyncing: false,
      error: null,
      syncError: null,

      // Initialize store - load custom data from database
      initialize: async () => {
        const { user } = useFirebaseAuthStore.getState();
        if (!user) {
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Load custom feeds and mixes from database
          const [customFeeds, customLocalMixes] = await Promise.all([
            db.getUserCustomFeeds(),
            db.getUserLocalMixes()
          ]);
          
          // Merge custom feeds with default feeds
          const mergedFeeds = createDefaultFeeds();
          customFeeds.forEach(feed => {
            if (mergedFeeds[feed.category]) {
              mergedFeeds[feed.category].push({ ...feed, isCustom: true });
            }
          });
          
          // Merge custom local mixes with default mixes
          const mergedLocalMixes = createDefaultLocalMixes();
          customLocalMixes.forEach(mix => {
            if (mergedLocalMixes[mix.category]) {
              mergedLocalMixes[mix.category] = { ...mix, isCustom: true };
            }
          });
          
          set({ 
            feeds: mergedFeeds,
            localMixes: mergedLocalMixes,
            customFeeds,
            customLocalMixes,
            isLoading: false
          });
        } catch (error) {
          console.error('Error initializing feed management store:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      // Actions
      addFeed: async (category, feedData) => {
        const newFeed = {
          ...feedData,
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true
        };
        
        // Add to local state immediately
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: [...state.feeds[category], newFeed]
          }
        }));
        
        // Save to database if authenticated
        const { user } = useFirebaseAuthStore.getState();
        if (user) {
          try {
            set({ isSyncing: true, syncError: null });
            const saved = await db.addCustomFeed({ category, ...feedData });
            
            // Update with database ID
            set(state => ({
              feeds: {
                ...state.feeds,
                [category]: state.feeds[category].map(feed => 
                  feed.id === newFeed.id ? { ...feed, id: saved.id } : feed
                )
              },
              customFeeds: [...state.customFeeds, { ...feedData, id: saved.id, category }],
              isSyncing: false
            }));
            
            return saved.id;
          } catch (error) {
            console.error('Error saving custom feed:', error);
            set({ isSyncing: false, syncError: error.message });
            // Keep local change even if sync fails
          }
        }
        
        return newFeed.id;
      },

      updateFeed: async (category, feedId, updatedData) => {
        // Update local state immediately
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: state.feeds[category].map(feed => 
              feed.id === feedId ? { ...feed, ...updatedData } : feed
            )
          }
        }));
        
        // Update in database if it's a custom feed and user is authenticated
        const feed = get().feeds[category].find(f => f.id === feedId);
        const { user } = useFirebaseAuthStore.getState();
        if (feed?.isCustom && user) {
          try {
            set({ isSyncing: true, syncError: null });
            await db.updateCustomFeed(feedId, updatedData);
            
            // Update custom feeds array
            set(state => ({
              customFeeds: state.customFeeds.map(feed => 
                feed.id === feedId ? { ...feed, ...updatedData } : feed
              ),
              isSyncing: false
            }));
          } catch (error) {
            console.error('Error updating custom feed:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
      },

      deleteFeed: async (category, feedId) => {
        const feed = get().feeds[category].find(f => f.id === feedId);
        
        // Remove from local state immediately
        set(state => ({
          feeds: {
            ...state.feeds,
            [category]: state.feeds[category].filter(feed => feed.id !== feedId)
          }
        }));
        
        // Delete from database if it's a custom feed and user is authenticated
        const { user } = useFirebaseAuthStore.getState();
        if (feed?.isCustom && user) {
          try {
            set({ isSyncing: true, syncError: null });
            await db.deleteCustomFeed(feedId);
            
            // Remove from custom feeds array
            set(state => ({
              customFeeds: state.customFeeds.filter(feed => feed.id !== feedId),
              isSyncing: false
            }));
          } catch (error) {
            console.error('Error deleting custom feed:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
      },

      updateLocalMix: async (category, updatedData) => {
        // Update local state immediately
        set(state => ({
          localMixes: {
            ...state.localMixes,
            [category]: { ...state.localMixes[category], ...updatedData }
          }
        }));
        
        // Save to database if user is authenticated
        const { user } = useFirebaseAuthStore.getState();
        if (user) {
          try {
            set({ isSyncing: true, syncError: null });
            
            const existingMix = get().customLocalMixes.find(mix => mix.category === category);
            
            if (existingMix) {
              // Update existing custom mix
              await db.updateLocalMix(existingMix.id, updatedData);
              set(state => ({
                customLocalMixes: state.customLocalMixes.map(mix => 
                  mix.id === existingMix.id ? { ...mix, ...updatedData } : mix
                ),
                isSyncing: false
              }));
            } else {
              // Create new custom mix
              const saved = await db.addLocalMix({ category, ...updatedData });
              set(state => ({
                customLocalMixes: [...state.customLocalMixes, { 
                  ...updatedData, 
                  id: saved.id, 
                  category 
                }],
                isSyncing: false
              }));
            }
          } catch (error) {
            console.error('Error saving local mix:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
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
      },
      
      // Clear errors
      clearError: () => set({ error: null }),
      clearSyncError: () => set({ syncError: null })
    }),
    {
      name: 'enhanced-feed-management-storage',
      version: 2,
      partialize: (state) => ({
        // Only persist default feeds and mixes locally
        // Custom data will be loaded from database
        feeds: createDefaultFeeds(),
        localMixes: createDefaultLocalMixes()
      })
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