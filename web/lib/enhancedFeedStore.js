import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateFeed, generateFeedingSchedule, generateBestPractices } from '../../shared/utils/feedCalculator.js';
import { getRecommendedFeeds, getLocalFeedMix } from '../../shared/data/feedBrands.js';
import { getWeeklyKnowledge } from '../../shared/data/knowledgeSnippets.js';
import { logError, retryWithBackoff, safeAsync } from '../../shared/utils/errorHandling';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

// Enhanced feed store with Firebase integration
export const useEnhancedFeedStore = create(
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
      
      // Saved calculations
      savedCalculations: [],
      
      // UI state
      isCalculating: false,
      showResults: false,
      activeTab: 'calculator',
      isSyncing: false,
      syncError: null,
      
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
          
          // Auto-save calculation if user is authenticated
          const { user } = useFirebaseAuthStore.getState();
    if (user) {
            get().saveCalculation({
              birdType: state.birdType,
              breed: state.breed,
              ageInDays: state.ageInDays,
              quantity: state.quantity,
              rearingStyle: state.rearingStyle,
              targetWeight: state.targetWeight,
              results: result
            });
          }
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
      
      // Save calculation to database
      saveCalculation: async (calculationData) => {
        const { user } = useFirebaseAuthStore.getState();
    if (!user) {
      console.log('Cannot save calculation: user not authenticated');
          return;
        }
        
        try {
          set({ isSyncing: true, syncError: null });
          const saved = await db.saveCalculation(calculationData);
          
          // Add to local saved calculations
          const savedCalculations = get().savedCalculations;
          set({ 
            savedCalculations: [{
              id: saved.id,
              ...calculationData,
              createdAt: saved.createdAt
            }, ...savedCalculations],
            isSyncing: false
          });
          
          return saved;
        } catch (error) {
          console.error('Error saving calculation:', error);
          set({ isSyncing: false, syncError: error.message });
          throw error;
        }
      },
      
      // Load saved calculations
      loadSavedCalculations: async () => {
        const { user } = useFirebaseAuthStore.getState();
    if (!user) {
          return;
        }
        
        try {
          set({ isSyncing: true, syncError: null });
          const calculations = await db.getUserCalculations();
          set({ 
            savedCalculations: calculations,
            isSyncing: false
          });
        } catch (error) {
          console.error('Error loading calculations:', error);
          set({ isSyncing: false, syncError: error.message });
        }
      },
      
      // Delete saved calculation
      deleteCalculation: async (calculationId) => {
        const { user } = useFirebaseAuthStore.getState();
    if (!user) {
          return;
        }
        
        try {
          await db.deleteCalculation(calculationId);
          
          // Remove from local state
          const savedCalculations = get().savedCalculations.filter(
            calc => calc.id !== calculationId
          );
          set({ savedCalculations });
        } catch (error) {
          console.error('Error deleting calculation:', error);
          throw error;
        }
      },
      
      // Load calculation from saved data
      loadCalculation: (calculation) => {
        set({
          birdType: calculation.birdType,
          breed: calculation.breed,
          ageInDays: calculation.ageInDays,
          quantity: calculation.quantity,
          rearingStyle: calculation.rearingStyle,
          targetWeight: calculation.targetWeight,
          ...calculation.results,
          showResults: true,
          activeTab: 'results'
        });
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
      }),
      
      // Clear sync error
      clearSyncError: () => set({ syncError: null })
    }),
    {
      name: 'enhanced-feed-calculator-storage',
      partialize: (state) => ({
        birdType: state.birdType,
        breed: state.breed,
        ageInDays: state.ageInDays,
        quantity: state.quantity,
        rearingStyle: state.rearingStyle,
        targetWeight: state.targetWeight,
        // Don't persist savedCalculations - load from database
      })
    }
  )
);

// Enhanced knowledge store with potential future database integration
export const useEnhancedKnowledgeStore = create((set, get) => ({
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