import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

// Import local utilities
import { calculateFeed, generateFeedingSchedule, generateBestPractices, convertAge, BIRD_BREEDS } from '../../shared/utils/feedCalculator.js';
import { getRecommendedFeeds, getLocalFeedMix, calculateLocalFeedCost } from './feedBrands.js';
import { getWeeklyKnowledge, getSeasonalTips, getEmergencyAdvice } from './knowledgeSnippets.js';
import { logError, retryWithBackoff, safeAsync } from '../../shared/utils/errorHandling';

// Feed Calculator Store
export const useFeedStore = create(
  persist(
    (set, get) => ({
      // Form inputs
      birdType: 'broiler',
      breed: 'Arbor Acres',
      ageInDays: 28,
      ageUnit: 'days',
      quantity: 50,
      rearingStyle: 'commercial',
      targetWeight: 'medium',
      
      // Calculation results
      results: null,
      feedingSchedule: [],
      bestPractices: [],
      recommendedFeeds: [],
      localFeedMix: null,
      
      // UI state
      isCalculating: false,
      hasCalculated: false,
      activeTab: 'calculator',
      
      // Actions
      setBirdType: (birdType) => {
        set({ birdType });
        // Reset breed when bird type changes
        const availableBreeds = getAvailableBreeds(birdType);
        if (availableBreeds.length > 0) {
          set({ breed: availableBreeds[0].id });
        }
      },
      
      setBreed: (breed) => set({ breed }),
      
      setAge: (age, unit = 'days') => {
        const ageInDays = unit === 'weeks' ? age * 7 : age;
        set({ ageInDays, ageUnit: unit });
      },
      
      setQuantity: (quantity) => set({ quantity }),
      
      setRearingStyle: (rearingStyle) => set({ rearingStyle }),
      
      setTargetWeight: (targetWeight) => set({ targetWeight }),
      
      setActiveTab: (activeTab) => set({ activeTab }),
      
      calculateFeedRequirements: async () => {
        const state = get();
        set({ isCalculating: true });
        
        const [result, error] = await safeAsync(async () => {
          // Simulate brief loading for better UX
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const results = calculateFeed({
            birdType: state.birdType,
            breed: state.breed,
            ageInDays: state.ageInDays,
            quantity: state.quantity,
            rearingStyle: state.rearingStyle,
            targetWeight: state.targetWeight,
            useProgressiveFeeding: true // Enable progressive feeding by default
          });
          
          const feedingSchedule = generateFeedingSchedule(
            state.ageInDays,
            state.birdType,
            results.total.cups
          );
          
          const bestPractices = generateBestPractices({
            birdType: state.birdType,
            breed: state.breed,
            ageInDays: state.ageInDays,
            rearingStyle: state.rearingStyle,
            quantity: state.quantity
          });
          
          const recommendedFeeds = getRecommendedFeeds(
            state.birdType,
            state.ageInDays
          );
          
          const localFeedMix = getLocalFeedMix(
            state.birdType,
            state.ageInDays
          );
          
          return {
            results,
            feedingSchedule,
            bestPractices,
            recommendedFeeds,
            localFeedMix
          };
        });
        
        if (error) {
          logError(error, 'Feed calculation failed', {
            birdType: state.birdType,
            breed: state.breed,
            ageInDays: state.ageInDays,
            quantity: state.quantity,
            rearingStyle: state.rearingStyle,
            targetWeight: state.targetWeight
          });
          alert('Error calculating feed requirements. Please check your inputs and try again.');
          set({ isCalculating: false });
          return;
        }
        
        set({
          ...result,
          hasCalculated: true,
          isCalculating: false,
          activeTab: 'results'
        });
      },
      
      resetForm: () => set({
        birdType: 'broiler',
        breed: 'arbor_acres',
        ageInDays: 28,
        ageUnit: 'days',
        quantity: 50,
        rearingStyle: 'commercial',
        targetWeight: 'medium',
        results: null,
        feedingSchedule: [],
        bestPractices: [],
        recommendedFeeds: [],
        localFeedMix: null,
        hasCalculated: false,
        activeTab: 'calculator'
      }),
    }),
    {
      name: 'feed-calculator-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        birdType: state.birdType,
        breed: state.breed,
        ageInDays: state.ageInDays,
        ageUnit: state.ageUnit,
        quantity: state.quantity,
        rearingStyle: state.rearingStyle,
        targetWeight: state.targetWeight,
      }),
    }
  )
);

// Knowledge Store
export const useKnowledgeStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      viewedSnippets: [],
      
      addToFavorites: (itemId) => {
        const favorites = get().favorites;
        if (!favorites.includes(itemId)) {
          set({ favorites: [...favorites, itemId] });
        }
      },
      
      removeFromFavorites: (itemId) => {
        const favorites = get().favorites.filter(id => id !== itemId);
        set({ favorites });
      },
      
      markAsViewed: (snippetId) => {
        const viewedSnippets = get().viewedSnippets;
        if (!viewedSnippets.includes(snippetId)) {
          set({ viewedSnippets: [...viewedSnippets, snippetId] });
        }
      },
      
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'knowledge-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Settings Store
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // User preferences
      units: 'metric', // metric, imperial
      currency: 'NGN',
      language: 'en',
      theme: 'light',
      
      // Notifications
      notifications: {
        enabled: true,
        feedingReminders: true,
        healthTips: true,
        weeklyKnowledge: true,
      },
      
      // Location
      location: {
        country: 'Nigeria',
        state: '',
        city: '',
      },
      
      // App preferences
      showOnboarding: true,
      autoCalculate: false,
      saveHistory: true,
      
      // Actions
      setUnits: (units) => set({ units }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      
      updateNotifications: (notifications) => set({ 
        notifications: { ...get().notifications, ...notifications }
      }),
      
      updateLocation: (location) => set({ 
        location: { ...get().location, ...location }
      }),
      
      setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
      setAutoCalculate: (autoCalculate) => set({ autoCalculate }),
      setSaveHistory: (saveHistory) => set({ saveHistory }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Offline Store
export const useOfflineStore = create((set, get) => ({
  isOnline: true,
  cachedData: {},
  pendingActions: [],
  lastSyncTime: null,
  
  setOnlineStatus: (isOnline) => set({ isOnline }),
  
  cacheData: (key, data) => {
    const cachedData = get().cachedData;
    set({ cachedData: { ...cachedData, [key]: data } });
  },
  
  getCachedData: (key) => {
    return get().cachedData[key];
  },
  
  addPendingAction: (action) => {
    const pendingActions = get().pendingActions;
    set({ pendingActions: [...pendingActions, action] });
  },
  
  clearPendingActions: () => set({ pendingActions: [] }),
  
  updateLastSyncTime: () => set({ lastSyncTime: new Date().toISOString() }),
  
  checkNetworkStatus: async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      set({ isOnline: networkState.isConnected });
      return networkState.isConnected;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  },
}));

// Utility functions
export const getAvailableBreeds = (birdType) => {
  const birdTypeData = BIRD_BREEDS[birdType];
  if (!birdTypeData) return [];
  
  return Object.entries(birdTypeData).map(([breedName, breedData]) => ({
    id: breedName,
    name: breedName,
    ...breedData
  }));
};

export const getTargetWeightOptions = (breed) => {
  const breedData = BIRD_BREEDS[breed];
  if (!breedData || !breedData.targetWeights) return [];
  
  const targetWeightLabels = {
    low: 'Low feed plan',
    medium: 'Medium feed plan',
    aggressive: 'Aggressive feed plan',
    premium: 'Premium feed plan'
  };
  
  return Object.entries(breedData.targetWeights).map(([key, data]) => ({
    id: key,
    weight: data.weight,
    feedMultiplier: data.feedMultiplier,
    plan: targetWeightLabels[key] || 'Custom plan'
  }));
};

export const getRearingStyleOptions = () => {
  return [
    { id: 'backyard', name: 'Backyard (≤10 birds)', description: 'Small-scale farming' },
    { id: 'commercial', name: 'Commercial (>10 birds)', description: 'Large-scale farming' }
  ];
};