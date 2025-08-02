import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateFeed, generateFeedingSchedule, generateBestPractices, getFeedType, getProtein, BIRD_BREEDS } from '../../shared/utils/feedCalculator.js';
import { getRecommendedFeeds, getLocalFeedMix, FEED_BRANDS, LOCAL_FEED_MIXES } from '../../shared/data/feedBrands.js';
import { getWeeklyKnowledge } from '../../shared/data/knowledgeSnippets.js';
import { logError } from '../../shared/utils/errorHandling';
import { PersistenceStrategyFactory } from './persistenceStrategies';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

// Unified store that handles both authenticated and unauthenticated users
export const useUnifiedStore = create(
  persist(
    (set, get) => {
      // Initialize persistence strategy
      let persistenceStrategy = null;
      
      const updatePersistenceStrategy = () => {
        const { isAuthenticated } = useFirebaseAuthStore.getState();
        persistenceStrategy = PersistenceStrategyFactory.create(
          isAuthenticated,
          db,
          useFirebaseAuthStore
        );
      };
      
      // Initialize strategy
      updatePersistenceStrategy();
      
      return {
        // Form inputs
        birdType: 'broiler',
        breed: BIRD_BREEDS.broiler ? Object.keys(BIRD_BREEDS.broiler)[0] : 'Arbor Acres',
        ageInDays: 28,
        quantity: 50,
        rearingStyle: 'commercial',
        targetWeight: 'medium',
        feedingSystem: '2-phase', // Default to Nigeria-Standard
        
        // Calculation results
        feedResults: null,
        feedingSchedule: null,
        bestPractices: [],
        recommendedFeeds: [],
        localFeedMix: null,
        
        // Saved data
        savedCalculations: [],
        favorites: [],
        customFeeds: FEED_BRANDS, // Initialize with commercial feed brands
        localMixes: LOCAL_FEED_MIXES, // Initialize with local feed mixes
        userSettings: {},
        
        // Site settings
        currency: 'NGN',
        globalSettings: null,
        
        // Offline functionality
        isOnline: true,
        cachedData: {
          feedBrands: null,
          knowledgeSnippets: null,
          lastUpdated: null
        },
        
        // UI state
        isCalculating: false,
        showResults: false,
        activeTab: 'calculator',
        isSyncing: false,
        syncError: null,
        
        // Internal methods
        _updatePersistenceStrategy: () => {
          updatePersistenceStrategy();
        },
        
        _getPersistenceStrategy: () => {
          if (!persistenceStrategy) {
            updatePersistenceStrategy();
          }
          return persistenceStrategy;
        },
        
        // Form input actions
        setBirdType: (birdType) => {
          set({ birdType });
          // Reset breed when bird type changes
          const availableBreeds = BIRD_BREEDS[birdType] ? Object.keys(BIRD_BREEDS[birdType]) : [];
          if (availableBreeds.length > 0) {
            set({ breed: availableBreeds[0] });
          }
        },
        
        setBreed: (breed) => set({ breed }),
        setAge: (ageInDays) => set({ ageInDays }),
        setQuantity: (quantity) => set({ quantity }),
        setRearingStyle: (rearingStyle) => set({ rearingStyle }),
        setTargetWeight: (targetWeight) => set({ targetWeight }),
        setFeedingSystem: (feedingSystem) => set({ feedingSystem }),
        setActiveTab: (activeTab) => set({ activeTab }),

        // Reset form inputs to defaults
        resetForm: () => {
          const defaultBreed = BIRD_BREEDS.broiler ? Object.keys(BIRD_BREEDS.broiler)[0] : 'Arbor Acres';
          set({
            birdType: 'broiler',
            breed: defaultBreed,
            ageInDays: 28,
            quantity: 50,
            rearingStyle: 'commercial',
            targetWeight: 'medium',
            feedingSystem: '2-phase',
            showResults: false,
            activeTab: 'calculator'
          });
        },
        
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
              targetWeight: state.targetWeight,
              feedingSystem: state.feedingSystem
            });
            
            // Generate feeding schedule
            const feedingSchedule = generateFeedingSchedule(
              state.ageInDays,
              state.birdType,
              feedResults.total.cups
            );
            
            // Generate best practices
            const bestPractices = generateBestPractices(
              state.birdType,
              state.ageInDays,
              state.rearingStyle
            );
            
            // Get recommended feeds
            const recommendedFeeds = getRecommendedFeeds(
              state.birdType,
              state.ageInDays
            );
            
            // Get local feed mix
            const localFeedMix = getLocalFeedMix(
              state.birdType,
              state.ageInDays
            );
            
            set({
              feedResults,
              feedingSchedule,
              bestPractices,
              recommendedFeeds,
              localFeedMix,
              isCalculating: false,
              showResults: true
            });
            
          } catch (error) {
            console.error('Error calculating feed requirements:', error);
            set({ isCalculating: false });
            throw error;
          }
        },
        
        // Load calculation data into form
        loadCalculation: (calculationData) => {
          set({
            birdType: calculationData.birdType,
            breed: calculationData.breed,
            ageInDays: calculationData.ageInDays,
            quantity: calculationData.quantity,
            rearingStyle: calculationData.rearingStyle,
            targetWeight: calculationData.targetWeight,
            feedResults: calculationData.feedResults,
            feedingSchedule: calculationData.feedingSchedule,
            bestPractices: calculationData.bestPractices,
            recommendedFeeds: calculationData.recommendedFeeds,
            localFeedMix: calculationData.localFeedMix,
            showResults: true
          });
        },
        
        // Update form data (for backward compatibility)
        updateFeedStore: (data) => {
          if (data.feedResults) {
            get().loadCalculation(data);
          } else {
            // Update individual fields
            Object.keys(data).forEach(key => {
              const setter = get()[`set${key.charAt(0).toUpperCase() + key.slice(1)}`];
              if (setter) {
                setter(data[key]);
              }
            });
          }
        },
        
        // Saved calculations management
        saveResult: async (resultData, name, autoProgression = false) => {
          try {
            set({ isSyncing: true, syncError: null });
            
            const calculationData = {
              ...resultData,
              name: name || `Calculation ${get().savedCalculations.length + 1}`,
              autoProgression,
              startDate: autoProgression ? new Date().toISOString().split('T')[0] : null,
              currentQuantity: resultData.quantity,
              mortalityLog: [],
              lastCalculated: new Date().toISOString().split('T')[0]
            };
            
            const strategy = get()._getPersistenceStrategy();
            const saved = await strategy.save('calculations', calculationData);
            
            // Update local state
            const savedCalculations = get().savedCalculations;
            set({
              savedCalculations: [saved, ...savedCalculations],
              isSyncing: false
            });
            
            return saved.id;
          } catch (error) {
            console.error('Error saving calculation:', error);
            set({ isSyncing: false, syncError: error.message });
            throw error;
          }
        },
        
        loadSavedResults: async () => {
          try {
            set({ isSyncing: true, syncError: null });
            
            const strategy = get()._getPersistenceStrategy();
            const calculations = await strategy.list('calculations');
            
            set({
              savedCalculations: calculations,
              isSyncing: false
            });
          } catch (error) {
            console.error('Error loading calculations:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        },

        // Initialize store-related persisted data on app start
        initialize: async () => {
          try {
            // Ensure the correct strategy is in use (auth may have changed)
            get()._updatePersistenceStrategy();

            // Load saved calculations so UI reflects persisted state
            if (get().loadSavedResults) {
              await get().loadSavedResults();
            }
          } catch (error) {
            console.error('Initialization error:', error);
          }
        },

        // Load global site settings (best-effort; safe no-op if unavailable)
        loadGlobalSettings: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            // Some strategies may not support 'settings'
            if (strategy && typeof strategy.list === 'function') {
              const settingsList = await strategy.list('settings');
              if (Array.isArray(settingsList) && settingsList.length > 0) {
                set({ globalSettings: settingsList[0] });
              }
            }
          } catch (error) {
            // Non-fatal: log and continue
            console.error('Error loading global settings:', error);
          }
        },
        
        deleteResult: async (calculationId) => {
          try {
            set({ isSyncing: true, syncError: null });
            
            const strategy = get()._getPersistenceStrategy();
            await strategy.delete('calculations', calculationId);
            
            // Update local state
            const savedCalculations = get().savedCalculations.filter(
              calc => calc.id !== calculationId
            );
            set({
              savedCalculations,
              isSyncing: false
            });
          } catch (error) {
            console.error('Error deleting calculation:', error);
            set({ isSyncing: false, syncError: error.message });
            throw error;
          }
        },
        
        updateResultName: async (calculationId, newName) => {
          try {
            set({ isSyncing: true, syncError: null });
            
            const strategy = get()._getPersistenceStrategy();
            await strategy.update('calculations', calculationId, { name: newName });
            
            // Update local state
            const savedCalculations = get().savedCalculations.map(calc =>
              calc.id === calculationId ? { ...calc, name: newName } : calc
            );
            set({
              savedCalculations,
              isSyncing: false
            });
          } catch (error) {
            console.error('Error updating calculation name:', error);
            set({ isSyncing: false, syncError: error.message });
            throw error;
          }
        },
        
        clearAllResults: async () => {
          try {
            set({ isSyncing: true, syncError: null });
            
            const strategy = get()._getPersistenceStrategy();
            
            // For local storage, we can clear all at once
            if (strategy.clear) {
              await strategy.clear('calculations');
            } else {
              // For database, delete each calculation individually
              const calculations = get().savedCalculations;
              await Promise.all(
                calculations.map(calc => strategy.delete('calculations', calc.id))
              );
            }
            
            set({
              savedCalculations: [],
              isSyncing: false
            });
          } catch (error) {
            console.error('Error clearing calculations:', error);
            set({ isSyncing: false, syncError: error.message });
            throw error;
          }
        },
        
        // Auto-progression methods
        getAutoProgressionCalculations: () => {
          return get().savedCalculations.filter(
            calc => calc.autoProgression && calc.startDate
          );
        },
        
        calculateNextDay: (calcId) => {
          const calculation = get().savedCalculations.find(calc => calc.id === calcId);
          if (!calculation || !calculation.autoProgression) return null;
          
          const daysSinceStart = Math.floor(
            (new Date() - new Date(calculation.startDate)) / (1000 * 60 * 60 * 24)
          );
          const currentAge = calculation.ageInDays + daysSinceStart;
          
          try {
            const feedResults = calculateFeed({
              birdType: calculation.birdType,
              breed: calculation.breed,
              ageInDays: currentAge,
              quantity: calculation.currentQuantity || calculation.quantity,
              rearingStyle: calculation.rearingStyle,
              targetWeight: calculation.targetWeight,
              feedingSystem: calculation.feedingSystem || '2-phase'
            });
            
            return {
              ...feedResults,
              ageInDays: currentAge,
              quantity: calculation.currentQuantity || calculation.quantity,
              calculatedFor: new Date().toISOString().split('T')[0],
              totalFeedKg: feedResults.total.grams / 1000,
              feedPerBirdGrams: feedResults.perBird.grams,
              feedType: getFeedType(calculation.birdType, currentAge, calculation.feedingSystem || '2-phase'),
              protein: getProtein(calculation.birdType, currentAge, calculation.feedingSystem || '2-phase'),
              mortalityRate: calculation.mortalityLog?.length || 0
            };
          } catch (error) {
            console.error('Error calculating next day:', error);
            return null;
          }
        },
        
        updateAutoProgression: async (calculationId, enabled) => {
          try {
            const updates = {
              autoProgression: enabled,
              startDate: enabled ? (new Date().toISOString().split('T')[0]) : null
            };
            
            const strategy = get()._getPersistenceStrategy();
            await strategy.update('calculations', calculationId, updates);
            
            // Update local state
            const savedCalculations = get().savedCalculations.map(calc =>
              calc.id === calculationId ? { ...calc, ...updates } : calc
            );
            set({ savedCalculations });
          } catch (error) {
            console.error('Error updating auto-progression:', error);
            throw error;
          }
        },
        
        updateMortality: async (calculationId, deaths, reason = 'unspecified') => {
          try {
            const calculation = get().savedCalculations.find(calc => calc.id === calculationId);
            if (!calculation) return;
            
            const newMortalityEntry = {
              date: new Date().toISOString().split('T')[0],
              deaths,
              reason,
              dayOfCycle: calculation.ageInDays + Math.floor(
                (new Date() - new Date(calculation.startDate)) / (1000 * 60 * 60 * 24)
              )
            };
            
            const updates = {
              currentQuantity: Math.max(0, calculation.currentQuantity - deaths),
              mortalityLog: [...(calculation.mortalityLog || []), newMortalityEntry],
              lastCalculated: new Date().toISOString().split('T')[0]
            };
            
            const strategy = get()._getPersistenceStrategy();
            await strategy.update('calculations', calculationId, updates);
            
            // Update local state
            const savedCalculations = get().savedCalculations.map(calc =>
              calc.id === calculationId ? { ...calc, ...updates } : calc
            );
            set({ savedCalculations });
          } catch (error) {
            console.error('Error updating mortality:', error);
            throw error;
          }
        },
        
        // Knowledge management
        addToFavorites: async (snippet) => {
          try {
            const strategy = get()._getPersistenceStrategy();
            const saved = await strategy.save('favorites', snippet);
            
            const favorites = get().favorites;
            set({ favorites: [saved, ...favorites] });
          } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
          }
        },
        
        removeFromFavorites: async (snippetId) => {
          try {
            const strategy = get()._getPersistenceStrategy();
            await strategy.delete('favorites', snippetId);
            
            const favorites = get().favorites.filter(fav => fav.id !== snippetId);
            set({ favorites });
          } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
          }
        },
        
        loadFavorites: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            const favorites = await strategy.list('favorites');
            set({ favorites });
          } catch (error) {
            console.error('Error loading favorites:', error);
          }
        },
        
        // Settings management
        updateSettings: async (newSettings) => {
          try {
            const strategy = get()._getPersistenceStrategy();
            const settings = { ...get().userSettings, ...newSettings };
            await strategy.save('settings', settings);
            set({ userSettings: settings });
          } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
          }
        },
        
        loadSettings: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            const settingsList = await strategy.list('settings');
            const settings = settingsList[0] || {};
            set({ userSettings: settings });
          } catch (error) {
            console.error('Error loading settings:', error);
          }
        },
        
        // Migration and sync utilities
        migrateToDatabase: async () => {
          try {
            const { isAuthenticated } = useFirebaseAuthStore.getState();
            if (!isAuthenticated) {
              throw new Error('User must be authenticated to migrate data');
            }
            
            set({ isSyncing: true, syncError: null });
            
            // Get local storage strategy to extract data
            const localStrategy = PersistenceStrategyFactory.create(false);
            const localData = await localStrategy.getAllData();
            
            // Get database strategy to save data
            const dbStrategy = get()._getPersistenceStrategy();
            
            // Migrate calculations
            if (localData.calculations?.length > 0) {
              for (const calc of localData.calculations) {
                await dbStrategy.save('calculations', calc);
              }
            }
            
            // Migrate favorites
            if (localData.favorites?.length > 0) {
              for (const fav of localData.favorites) {
                await dbStrategy.save('favorites', fav);
              }
            }
            
            // Migrate settings
            if (localData.settings?.length > 0) {
              await dbStrategy.save('settings', localData.settings[0]);
            }
            
            // Reload data from database
            await get().loadSavedResults();
            await get().loadFavorites();
            await get().loadSettings();
            
            set({ isSyncing: false });
            
            return true;
          } catch (error) {
            console.error('Error migrating data:', error);
            set({ isSyncing: false, syncError: error.message });
            throw error;
          }
        },
        
        // Handle authentication state changes
        onAuthStateChange: async (isAuthenticated) => {
          try {
            // Update persistence strategy
            get()._updatePersistenceStrategy();
            
            if (isAuthenticated) {
              // Load data from database
              await get().loadSavedResults();
              await get().loadFavorites();
              await get().loadSettings();
            } else {
              // Load data from local storage
              await get().loadSavedResults();
              await get().loadFavorites();
              await get().loadSettings();
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
          }
        },

        // Initialize store (for backward compatibility)
        initialize: async () => {
          try {
            await get().loadSavedResults();
            await get().loadFavorites();
            await get().loadSettings();
          } catch (error) {
            console.error('Error initializing store:', error);
          }
        },

        // Load weekly knowledge (for backward compatibility)
        loadWeeklyKnowledge: async () => {
          try {
            // This function exists for backward compatibility
            // Knowledge snippets are now loaded on-demand in components
            const weeklyKnowledge = getWeeklyKnowledge();
            return weeklyKnowledge;
          } catch (error) {
            console.error('Error loading weekly knowledge:', error);
            return [];
          }
        },

        // Site settings getters (for backward compatibility)
        getCurrency: () => {
          return get().currency;
        },

        getSiteTitle: () => {
          const state = get();
          const defaultSettings = {
            siteTitle: 'Feed Calculator by Omzo Farmz'
          };
          return (state.globalSettings || defaultSettings).siteTitle;
        },

        getSiteDescription: () => {
          const state = get();
          const defaultSettings = {
            siteDescription: 'For Nigerian Farmers'
          };
          return (state.globalSettings || defaultSettings).siteDescription;
        },

        getFooterDescription: () => {
          const state = get();
          const defaultSettings = {
            footer: {
              description: 'Helping Nigerian and African farmers optimize their poultry feeding with accurate calculations and local expertise.'
            }
          };
          return (state.globalSettings || defaultSettings).footer.description;
        },

        getFooterFeatures: () => {
          const state = get();
          const defaultSettings = {
            footer: {
              features: [
                'Feed requirement calculator',
                'Local feed brand recommendations',
                'Weekly best practices',
                'Offline support'
              ]
            }
          };
          return (state.globalSettings || defaultSettings).footer.features;
        },

        getFooterSupport: () => {
          const state = get();
          const defaultSettings = {
            footer: {
              support: [
                'Works on all devices',
                'Optimized for low-end phones',
                'Nigerian feed brands included',
                'Regular updates'
              ]
            }
          };
          return (state.globalSettings || defaultSettings).footer.support;
        },

        getFooterCopyright: () => {
          const state = get();
          const defaultSettings = {
            footer: {
              copyright: '© 2025 Poultry Feed Calculator by Omzo Farmz. Built for African farmers with ❤️'
            }
          };
          return (state.globalSettings || defaultSettings).footer.copyright;
        },

        getRecommendedFeedsTitle: () => {
          const state = get();
          const defaultSettings = {
            recommendedFeeds: {
              title: 'Recommended Feeds'
            }
          };
          return (state.globalSettings || defaultSettings).recommendedFeeds.title;
        },

        getRecommendedFeedsDescription: () => {
          const state = get();
          const defaultSettings = {
            recommendedFeeds: {
              description: 'Browse our curated selection of quality feed brands'
            }
          };
          return (state.globalSettings || defaultSettings).recommendedFeeds.description;
        },

        getHeroVideoEnabled: () => {
          const state = get();
          const defaultSettings = {
            heroVideo: {
              enabled: false
            }
          };
          return (state.globalSettings || defaultSettings).heroVideo.enabled;
        },

        getHeroVideoUrl: () => {
          const state = get();
          const defaultSettings = {
            heroVideo: {
              url: ''
            }
          };
          return (state.globalSettings || defaultSettings).heroVideo.url;
        },

        getHeroVideoTitle: () => {
          const state = get();
          const defaultSettings = {
            heroVideo: {
              title: 'Watch Our Demo'
            }
          };
          return (state.globalSettings || defaultSettings).heroVideo.title;
        },

        // Global settings management (fetch from Firestore)
        loadGlobalSettings: async () => {
          try {
            // indicate loading state for settings
            set({ isLoadingGlobal: true, error: null });
            
            // Lazy import to avoid SSR issues
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');

            // Attempt to read settings
            const snap = await getDoc(settingsDocRef);

            if (snap.exists()) {
              const data = snap.data();
              set({ globalSettings: data, isLoadingGlobal: false, error: null });
              return data;
            }

            // If not found, seed defaults (first-time bootstrap)
            const defaultSettings = {
              siteTitle: 'Feed Calculator by Omzo Farmz',
              siteDescription: 'For Nigerian Farmers',
              logoUrl: '',
              footer: {
                logoUrl: '',
                description: 'Helping Nigerian and African farmers optimize their poultry feeding with accurate calculations and local expertise.',
                features: [
                  'Feed requirement calculator',
                  'Local feed brand recommendations',
                  'Weekly best practices',
                  'Offline support'
                ],
                support: [
                  'Works on all devices',
                  'Optimized for low-end phones',
                  'Nigerian feed brands included',
                  'Regular updates'
                ],
                copyright: '© 2025 Poultry Feed Calculator by Omzo Farmz. Built for African farmers with ❤️'
              },
              recommendedFeeds: {
                title: 'Recommended Feeds',
                description: 'Browse our curated selection of quality feed brands'
              },
              heroVideo: {
                enabled: false,
                url: '',
                title: 'Watch Our Demo'
              },
              logoVersion: Date.now()
            };

            // Seed Firestore then update state
            await setDoc(settingsDocRef, defaultSettings, { merge: true });
            set({ globalSettings: defaultSettings, isLoadingGlobal: false, error: null });
            return defaultSettings;
          } catch (error) {
            console.error('Error loading global settings:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to load settings' });
            return null;
          }
        },

        updateSettings: async (newSettings) => {
          try {
            set({ isLoadingGlobal: true, error: null });

            // Merge with existing in-memory settings
            const currentSettings = get().globalSettings || {};
            const updatedSettings = { ...currentSettings, ...newSettings };

            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });

            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });

            // Also update user settings in the store (kept for backward compatibility)
            const currentUserSettings = get().settings || {};
            const updatedUserSettings = { ...currentUserSettings, ...newSettings };
            set({ settings: updatedUserSettings });

            return updatedSettings;
          } catch (error) {
            console.error('Error updating settings:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to update settings' });
            throw error;
          }
        },

        resetToDefaults: async () => {
          try {
            // Re-seed defaults into Firestore by calling loadGlobalSettings (will seed if missing)
            const seeded = await get().loadGlobalSettings();
            return seeded || get().globalSettings;
          } catch (error) {
            console.error('Error resetting to defaults:', error);
            throw error;
          }
        },

        // Offline functionality methods
        setOnlineStatus: (isOnline) => set({ isOnline }),
        
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
        
        getCachedData: (key) => {
          const cachedData = get().cachedData;
          return cachedData[key];
        },
        
        clearCache: () => set({
          cachedData: {
            feedBrands: null,
            knowledgeSnippets: null,
            lastUpdated: null
          }
        }),

        // Additional getters for settings page
        isLoadingGlobal: false,
        error: null
      };
    },
    {
      name: 'unified-feed-calculator-storage',
      // Only persist UI state and form inputs, not saved data
      partialize: (state) => ({
        birdType: state.birdType,
        breed: state.breed,
        ageInDays: state.ageInDays,
        quantity: state.quantity,
        rearingStyle: state.rearingStyle,
        targetWeight: state.targetWeight,
        feedingSystem: state.feedingSystem,
        activeTab: state.activeTab
      })
    }
  )
);

// Export helper functions for backward compatibility
export const getAvailableBreeds = (birdType) => {
  if (BIRD_BREEDS[birdType]) {
    return Object.keys(BIRD_BREEDS[birdType]);
  }
  return [];
};

export const getTargetWeightOptions = (breed) => {
  
  const targetWeightLabels = {
    low: '1.6kg @ 6 weeks (Low feed plan)',
    medium: '1.8kg @ 6 weeks (Medium feed plan)',
    aggressive: '2.2kg+ @ 6 weeks (Aggressive feed plan)',
    premium: '2.5kg @ 6 weeks (Premium feed plan)'
  };
  
  // For broiler breeds, return breed-specific target weights
  if (breed && BIRD_BREEDS.broiler && BIRD_BREEDS.broiler[breed]) {
    const breedData = BIRD_BREEDS.broiler[breed];
    if (breedData.targetWeights) {
      return Object.entries(breedData.targetWeights).map(([key, data]) => ({
        value: key,
        label: targetWeightLabels[key] || `${data.weight}kg @ 6 weeks (${key} plan)`,
        weight: data.weight,
        feedMultiplier: data.feedMultiplier,
        description: key === 'low' ? 'Conservative growth target' :
                    key === 'medium' ? 'Standard growth target' :
                    key === 'aggressive' ? 'High growth target' :
                    key === 'premium' ? 'Maximum growth target' : 'Custom plan'
      }));
    }
  }
  
  // Default fallback for layers or when breed not specified
  return [
    { value: 'low', label: '1.6kg @ 6 weeks (Low feed plan)', weight: 1.6, feedMultiplier: 0.85, description: 'Conservative growth target' },
    { value: 'medium', label: '1.8kg @ 6 weeks (Medium feed plan)', weight: 1.8, feedMultiplier: 1.0, description: 'Standard growth target' },
    { value: 'aggressive', label: '2.2kg+ @ 6 weeks (Aggressive feed plan)', weight: 2.2, feedMultiplier: 1.25, description: 'High growth target' },
    { value: 'premium', label: '2.5kg @ 6 weeks (Premium feed plan)', weight: 2.5, feedMultiplier: 1.4, description: 'Maximum growth target' }
  ];
};

export const getRearingStyleOptions = () => [
  { value: 'backyard', label: 'Backyard (≤10 birds)', description: 'Small-scale, less controlled environment' },
  { value: 'commercial', label: 'Commercial (>10 birds)', description: 'Larger scale, controlled environment' }
];