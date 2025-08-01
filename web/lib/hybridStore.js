import { useFeedStore, useSavedResultsStore, useKnowledgeStore } from './store';
import { useEnhancedFeedStore } from './enhancedFeedStore';
import { useEnhancedKnowledgeStore } from './enhancedKnowledgeStore';
import useFirebaseAuthStore from './firebaseAuthStore';
import { useEffect, useState } from 'react';
import { create } from 'zustand';

// Hybrid store hook that switches between regular and enhanced stores based on authentication
export const useHybridFeedStore = () => {
  const { isAuthenticated } = useFirebaseAuthStore();
  const regularStore = useFeedStore();
  const enhancedStore = useEnhancedFeedStore();
  
  if (isAuthenticated) {
    return {
      ...enhancedStore,
      // Add any missing methods that components expect
      updateFeedStore: (data) => {
        // For backward compatibility, map to loadCalculation if it's a full calculation
        if (data.feedResults) {
          enhancedStore.loadCalculation(data);
        } else {
          // Otherwise, update individual fields
          Object.keys(data).forEach(key => {
            if (enhancedStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`]) {
              enhancedStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](data[key]);
            }
          });
        }
      }
    };
  }
  
  return regularStore;
};

export const useHybridSavedResultsStore = () => {
  const { isAuthenticated } = useFirebaseAuthStore();
  const regularStore = useSavedResultsStore();
  
  if (isAuthenticated) {
    // For authenticated users, use enhanced feed store's saved calculations
    const enhancedStore = useEnhancedFeedStore();
    return {
      savedResults: enhancedStore.savedCalculations,
      saveResult: enhancedStore.saveCalculation,
      deleteResult: enhancedStore.deleteCalculation,
      updateResultName: async (id, name) => {
        // Enhanced store doesn't have updateResultName, so we'll implement a workaround
        const calculation = enhancedStore.savedCalculations.find(calc => calc.id === id);
        if (calculation) {
          const updatedCalculation = { ...calculation, name };
          await enhancedStore.saveCalculation(updatedCalculation);
        }
      },
      loadSavedResults: enhancedStore.loadSavedCalculations,
      // Add methods that some components expect
      getAutoProgressionCalculations: () => {
        return enhancedStore.savedCalculations.filter(calc => calc.autoProgression && calc.startDate);
      },
      calculateNextDay: (calcId) => {
        const calculation = enhancedStore.savedCalculations.find(calc => calc.id === calcId);
        if (!calculation || !calculation.autoProgression) return null;
        
        const daysSinceStart = Math.floor((new Date() - new Date(calculation.startDate)) / (1000 * 60 * 60 * 24));
        const currentAge = calculation.ageInDays + daysSinceStart;
        
        try {
          // Import calculateFeed function
          const { calculateFeed } = require('../../shared/utils/feedCalculator.js');
          
          // Calculate feed requirements for current age and quantity
          const feedResults = calculateFeed({
            birdType: calculation.birdType,
            breed: calculation.breed,
            ageInDays: currentAge,
            quantity: calculation.currentQuantity || calculation.quantity,
            rearingStyle: calculation.rearingStyle,
            targetWeight: calculation.targetWeight
          });
          
          return {
            ...feedResults,
            ageInDays: currentAge,
            quantity: calculation.currentQuantity || calculation.quantity,
            calculatedFor: new Date().toISOString().split('T')[0],
            totalFeedKg: feedResults.total.grams / 1000,
            feedPerBirdGrams: feedResults.perBird.grams,
            feedType: calculation.feedType || 'Commercial',
            protein: calculation.protein || 'Standard'
          };
        } catch (error) {
          console.error('Auto-progression calculation failed:', error);
          return null;
        }
      },
      updateMortality: async (calcId, deaths) => {
        const calculation = enhancedStore.savedCalculations.find(calc => calc.id === calcId);
        if (!calculation) return;
        
        const newMortalityEntry = {
          date: new Date().toISOString().split('T')[0],
          deaths,
          reason: 'unspecified',
          dayOfCycle: calculation.ageInDays + Math.floor((new Date() - new Date(calculation.startDate)) / (1000 * 60 * 60 * 24))
        };
        
        const updatedCalculation = {
          ...calculation,
          currentQuantity: Math.max(0, (calculation.currentQuantity || calculation.quantity) - deaths),
          mortalityLog: [...(calculation.mortalityLog || []), newMortalityEntry],
          lastCalculated: new Date().toISOString().split('T')[0]
        };
        
        try {
          await enhancedStore.saveCalculation(updatedCalculation);
          // Update local state
          const savedCalculations = enhancedStore.savedCalculations.map(calc => 
            calc.id === calcId ? updatedCalculation : calc
          );
          enhancedStore.setState({ savedCalculations });
        } catch (error) {
          console.error('Error updating mortality:', error);
        }
      }
    };
  }
  
  return regularStore;
};

export const useHybridKnowledgeStore = () => {
  const { isAuthenticated } = useFirebaseAuthStore();
  const regularStore = useKnowledgeStore();
  const enhancedStore = useEnhancedKnowledgeStore();
  
  return isAuthenticated ? enhancedStore : regularStore;
};

// Hybrid site settings store that handles auth/unauth users differently
export const useHybridSiteSettingsStore = () => {
  const { isAuthenticated } = useFirebaseAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const { useSiteSettingsStore } = require('../lib/siteSettingsStore');
  const siteStore = useSiteSettingsStore();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // For SSR and initial hydration, always return default values
  if (!isHydrated) {
    return {
      ...siteStore,
      getSiteTitle: () => 'Feed Calculator by Omzo Farmz',
      getSiteDescription: () => 'For Nigerian Farmers'
    };
  }
  
  // After hydration, use the regular site settings store
  return siteStore;
};

// Migration utility to sync localStorage data to database when user logs in
export const useMigrationHelper = () => {
  const { isAuthenticated, user } = useFirebaseAuthStore();
  const [hasMigrated, setHasMigrated] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user && !hasMigrated) {
      migrateLocalDataToDatabase();
      setHasMigrated(true);
    }
  }, [isAuthenticated, user, hasMigrated]);
  
  const migrateLocalDataToDatabase = async () => {
    try {
      // Get data from localStorage stores
      const feedData = localStorage.getItem('feed-calculator-storage');
      const savedResultsData = localStorage.getItem('saved-results-storage');
      const knowledgeData = localStorage.getItem('knowledge-storage');
      
      if (savedResultsData) {
        const parsedResults = JSON.parse(savedResultsData);
        if (parsedResults.state?.savedResults?.length > 0) {
          const enhancedStore = useEnhancedFeedStore.getState();
          
          // Migrate saved results to database
          for (const result of parsedResults.state.savedResults) {
            try {
              await enhancedStore.saveCalculation({
                name: result.name,
                birdType: result.birdType,
                breed: result.breed,
                ageInDays: result.ageInDays,
                quantity: result.quantity,
                rearingStyle: result.rearingStyle,
                targetWeight: result.targetWeight,
                results: {
                  feedResults: result.feedResults,
                  feedingSchedule: result.feedingSchedule,
                  bestPractices: result.bestPractices
                }
              });
            } catch (error) {
              console.error('Error migrating result:', error);
            }
          }
          
          console.log('Successfully migrated saved results to database');
        }
      }
      
      if (knowledgeData) {
        const parsedKnowledge = JSON.parse(knowledgeData);
        if (parsedKnowledge.state?.favorites?.length > 0) {
          const enhancedKnowledgeStore = useEnhancedKnowledgeStore.getState();
          
          // Migrate favorites
          for (const favoriteId of parsedKnowledge.state.favorites) {
            try {
              await enhancedKnowledgeStore.toggleFavorite(favoriteId);
            } catch (error) {
              console.error('Error migrating favorite:', error);
            }
          }
          
          console.log('Successfully migrated knowledge favorites to database');
        }
      }
      
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  };
  
  return { migrateLocalDataToDatabase };
};

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