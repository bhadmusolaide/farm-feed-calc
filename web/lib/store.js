import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateFeed, generateFeedingSchedule, generateBestPractices } from '../../shared/utils/feedCalculator.js';
import { getRecommendedFeeds, getLocalFeedMix } from '../../shared/data/feedBrands.js';
import { getWeeklyKnowledge } from '../../shared/data/knowledgeSnippets.js';
import { logError, retryWithBackoff, safeAsync } from '../../shared/utils/errorHandling';

// Main application store
export const useFeedStore = create(
  persist(
    (set, get) => ({
      // Form inputs
      birdType: 'broiler',
      breed: 'Arbor Acres',
      ageInDays: 28,
      quantity: 50,
      rearingStyle: 'commercial',
      targetWeight: 'medium',
      
      // Calculation results
      feedResults: null,
      feedingSchedule: null,
      bestPractices: [],
      recommendedFeeds: [],
      localFeedMix: null,
      
      // UI state
      isCalculating: false,
      showResults: false,
      activeTab: 'calculator',
      
      // Actions
      setBirdType: (birdType) => {
        set({ birdType });
        // Reset breed when bird type changes
        const breeds = {
          broiler: ['Arbor Acres', 'Ross 308', 'Cobb 500'],
          layer: ['ISA Brown', 'Lohmann Brown', 'Hy-Line Brown']
        };
        set({ breed: breeds[birdType][0] });
      },
      
      setBreed: (breed) => set({ breed }),
      
      setAge: (ageInDays) => set({ ageInDays }),
      
      setQuantity: (quantity) => set({ quantity }),
      
      setRearingStyle: (rearingStyle) => set({ rearingStyle }),
      
      setTargetWeight: (targetWeight) => set({ targetWeight }),
      
      setActiveTab: (activeTab) => set({ activeTab }),
      
      // Calculate feed requirements
      calculateFeedRequirements: async () => {
        const state = get();
        set({ isCalculating: true });
        
        try {
          // Add a small delay to show loading state
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Calculate feed requirements
          const feedResults = calculateFeed({
            birdType: state.birdType,
            breed: state.breed,
            ageInDays: state.ageInDays,
            quantity: state.quantity,
            rearingStyle: state.rearingStyle,
            targetWeight: state.targetWeight
          });
          
          // Generate feeding schedule
          const feedingSchedule = generateFeedingSchedule(
            state.ageInDays,
            state.birdType,
            feedResults.total.cups
          );
          
          // Generate best practices
          const bestPractices = generateBestPractices({
            ageInDays: state.ageInDays,
            birdType: state.birdType,
            rearingStyle: state.rearingStyle,
            quantity: state.quantity
          });
          
          // Get recommended feeds
          const recommendedFeeds = getRecommendedFeeds(state.birdType, state.ageInDays);
          
          // Get local feed mix
          const localFeedMix = getLocalFeedMix(state.birdType, state.ageInDays);
          
          const result = {
            feedResults,
            feedingSchedule,
            bestPractices,
            recommendedFeeds,
            localFeedMix
          };
          
          set({
            ...result,
            showResults: true,
            isCalculating: false,
            activeTab: 'results' // Automatically switch to results tab
          });
        } catch (error) {
          logError(error, 'Feed calculation failed', {
            birdType: state.birdType,
            breed: state.breed,
            ageInDays: state.ageInDays,
            quantity: state.quantity,
            rearingStyle: state.rearingStyle,
            targetWeight: state.targetWeight
          });
          set({ isCalculating: false });
          throw error; // Re-throw error to be handled by component
        }
      },
      
      // Reset form
      resetForm: () => set({
        birdType: 'broiler',
        breed: 'Arbor Acres',
        ageInDays: 28,
        quantity: 50,
        rearingStyle: 'commercial',
        targetWeight: 'medium',
        feedResults: null,
        feedingSchedule: null,
        bestPractices: [],
        recommendedFeeds: [],
        localFeedMix: null,
        showResults: false
      }),
      
      // Clear results
      clearResults: () => set({
        feedResults: null,
        feedingSchedule: null,
        bestPractices: [],
        recommendedFeeds: [],
        localFeedMix: null,
        showResults: false
      })
    }),
    {
      name: 'feed-calculator-storage',
      partialize: (state) => ({
        birdType: state.birdType,
        breed: state.breed,
        ageInDays: state.ageInDays,
        quantity: state.quantity,
        rearingStyle: state.rearingStyle,
        targetWeight: state.targetWeight
      })
    }
  )
);

// Knowledge store for tips and best practices
export const useKnowledgeStore = create((set, get) => ({
  currentWeek: Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
  weeklyKnowledge: null,
  favorites: [],
  viewedSnippets: [],
  
  // Load weekly knowledge
  loadWeeklyKnowledge: () => {
    const currentWeek = get().currentWeek;
    const weeklyKnowledge = getWeeklyKnowledge(currentWeek);
    set({ weeklyKnowledge });
  },
  
  // Add to favorites
  addToFavorites: (itemId) => {
    const favorites = get().favorites;
    if (!favorites.includes(itemId)) {
      set({ favorites: [...favorites, itemId] });
    }
  },
  
  // Remove from favorites
  removeFromFavorites: (itemId) => {
    const favorites = get().favorites.filter(id => id !== itemId);
    set({ favorites });
  },
  
  // Mark as viewed
  markAsViewed: (snippetId) => {
    const viewedSnippets = get().viewedSnippets;
    if (!viewedSnippets.includes(snippetId)) {
      set({ viewedSnippets: [...viewedSnippets, snippetId] });
    }
  },
  
  // Clear favorites
  clearFavorites: () => set({ favorites: [] })
}));

// Settings store
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // User preferences
      units: 'metric', // metric or imperial
      currency: 'NGN',
      language: 'en',
      theme: 'light',
      
      // Notification preferences
      notifications: {
        feedingReminders: true,
        healthTips: true,
        marketUpdates: false
      },
      
      // Location for local pricing
      location: {
        state: '',
        city: ''
      },
      
      // Actions
      setUnits: (units) => set({ units }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setLocation: (location) => set({ location }),
      
      // Update notification setting
      updateNotification: (key, value) => {
        const notifications = get().notifications;
        set({ notifications: { ...notifications, [key]: value } });
      }
    }),
    {
      name: 'settings-storage'
    }
  )
);

// Offline store for caching data
export const useOfflineStore = create((set, get) => ({
  isOnline: true,
  cachedData: {
    feedBrands: null,
    knowledgeSnippets: null,
    lastUpdated: null
  },
  
  // Set online status
  setOnlineStatus: (isOnline) => set({ isOnline }),
  
  // Cache data for offline use
  cacheData: (key, data) => {
    const cachedData = get().cachedData;
    set({
      cachedData: {
        ...cachedData,
        [key]: data,
        lastUpdated: new Date().toISOString()
      }
    });
  },
  
  // Get cached data
  getCachedData: (key) => {
    const cachedData = get().cachedData;
    return cachedData[key];
  },
  
  // Clear cache
  clearCache: () => set({
    cachedData: {
      feedBrands: null,
      knowledgeSnippets: null,
      lastUpdated: null
    }
  })
}));

// Saved results store
export const useSavedResultsStore = create(
  persist(
    (set, get) => ({
      savedResults: [],
      
      // Save current calculation
      saveResult: (resultData, name, autoProgression = false) => {
        const savedResults = get().savedResults;
        const newResult = {
          id: Date.now().toString(),
          name: name || `Calculation ${savedResults.length + 1}`,
          savedAt: new Date().toISOString(),
          autoProgression,
          startDate: autoProgression ? new Date().toISOString().split('T')[0] : null,
          currentQuantity: resultData.quantity,
          mortalityLog: [],
          lastCalculated: new Date().toISOString().split('T')[0],
          ...resultData
        };
        
        set({ savedResults: [newResult, ...savedResults] });
        return newResult.id;
      },
      
      // Load a saved result
      loadResult: (resultId) => {
        const savedResults = get().savedResults;
        return savedResults.find(result => result.id === resultId);
      },
      
      // Delete a saved result
      deleteResult: (resultId) => {
        const savedResults = get().savedResults.filter(result => result.id !== resultId);
        set({ savedResults });
      },
      
      // Update result name
      updateResultName: (resultId, newName) => {
        const savedResults = get().savedResults.map(result => 
          result.id === resultId ? { ...result, name: newName } : result
        );
        set({ savedResults });
      },
      
      // Clear all saved results
      clearAllResults: () => set({ savedResults: [] }),
      
      // Update auto-progression setting
      updateAutoProgression: (resultId, enabled) => {
        const savedResults = get().savedResults.map(result => 
          result.id === resultId ? { 
            ...result, 
            autoProgression: enabled,
            startDate: enabled ? (result.startDate || new Date().toISOString().split('T')[0]) : null
          } : result
        );
        set({ savedResults });
      },
      
      // Update mortality for a calculation
      updateMortality: (resultId, deaths, reason = 'unspecified') => {
        const savedResults = get().savedResults.map(result => {
          if (result.id === resultId) {
            const newMortalityEntry = {
              date: new Date().toISOString().split('T')[0],
              deaths,
              reason,
              dayOfCycle: result.ageInDays + Math.floor((new Date() - new Date(result.startDate)) / (1000 * 60 * 60 * 24))
            };
            
            return {
              ...result,
              currentQuantity: Math.max(0, result.currentQuantity - deaths),
              mortalityLog: [...(result.mortalityLog || []), newMortalityEntry],
              lastCalculated: new Date().toISOString().split('T')[0]
            };
          }
          return result;
        });
        set({ savedResults });
      },
      
      // Get auto-progression calculations that need daily updates
      getAutoProgressionCalculations: () => {
        return get().savedResults.filter(result => 
          result.autoProgression && 
          result.startDate
        );
      },
      
      // Calculate next day feed requirements for auto-progression
      calculateNextDay: (resultId) => {
        const result = get().savedResults.find(r => r.id === resultId);
        if (!result || !result.autoProgression) return null;
        
        const daysSinceStart = Math.floor((new Date() - new Date(result.startDate)) / (1000 * 60 * 60 * 24));
        const currentAge = result.ageInDays + daysSinceStart;
        
        try {
          // Calculate feed requirements for current age and quantity
          const feedResults = calculateFeed({
            birdType: result.birdType,
            breed: result.breed,
            ageInDays: currentAge,
            quantity: result.currentQuantity,
            rearingStyle: result.rearingStyle,
            targetWeight: result.targetWeight
          });
          
          return {
            ...feedResults,
            ageInDays: currentAge,
            quantity: result.currentQuantity,
            calculatedFor: new Date().toISOString().split('T')[0],
            totalFeedKg: feedResults.total.grams / 1000, // Convert grams to kg
            feedPerBirdGrams: feedResults.perBird.grams,
            feedType: result.feedType || 'Commercial',
            protein: result.protein || 'Standard'
          };
        } catch (error) {
          logError(error, 'Auto-progression calculation failed', { resultId, currentAge });
          return null;
        }
      }
    }),
    {
      name: 'saved-results-storage'
    }
  )
);

// Export utility functions for components
export const getAvailableBreeds = (birdType) => {
  const breeds = {
    broiler: ['Arbor Acres', 'Ross 308', 'Cobb 500'],
    layer: ['ISA Brown', 'Lohmann Brown', 'Hy-Line Brown']
  };
  return breeds[birdType] || [];
};

export const getTargetWeightOptions = () => [
  { value: 'low', label: '1.6kg @ 6 weeks (Low feed plan)', description: 'Conservative growth target' },
  { value: 'medium', label: '1.8kg @ 6 weeks (Medium feed plan)', description: 'Standard growth target' },
  { value: 'aggressive', label: '2.2kg+ @ 6 weeks (Aggressive feed plan)', description: 'High growth target' },
  { value: 'premium', label: '2.5kg @ 6 weeks (Premium feed plan)', description: 'Maximum growth target' }
];

export const getRearingStyleOptions = () => [
  { value: 'backyard', label: 'Backyard (≤10 birds)', description: 'Small-scale, less controlled environment' },
  { value: 'commercial', label: 'Commercial (>10 birds)', description: 'Larger scale, controlled environment' }
];