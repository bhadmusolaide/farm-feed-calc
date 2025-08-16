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
        
        // Calculation results
        feedResults: null,
        feedingSchedule: null,
        bestPractices: [],
        recommendedFeeds: [],
        localFeedMix: null,
        
        // Saved data
        savedCalculations: [],
        favorites: [],
        currentCalculation: null,
        // Custom/commercial feeds grouped by category - now sourced from global settings
        customFeeds: {}, // Will be populated from globalSettings.globalFeeds
        // Tracks whether user has ever created custom feeds per category (no longer needed for global feeds)
        hasUserCustoms: {},
        // Locally defined mixes grouped by category - now sourced from global settings
        localMixes: {}, // Will be populated from globalSettings.globalLocalMixes

        // Per-user settings persisted locally
        userSettings: {
          featureVisibility: {
            feedResults: {
              showFeedQuantity: true,
              showFeedingSchedule: true,
              showWeeklySummary: true,
              showProgressionTracker: true,
              showFCRReference: true,
            }
          }
        },
        
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
        
        // Force re-render trigger for components
        _updateTrigger: 0,
        
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
 
        // Internal cache for IDs just deleted to avoid flicker on eventual consistency backends
        _recentlyDeleted: {},
        // Suppression cache persisted to prevent reinsert on next boot while backend reaches consistency
        _suppressedDeletes: {}, // shape: { [id]: timestampMs }

        _markDeleted: (id) => {
          if (!id) return;
          const cache = get()._recentlyDeleted || {};
          cache[id] = Date.now();
          set({ _recentlyDeleted: cache });
        },

        _purgeOldDeleted: (ttlMs = 10000) => {
          const cache = { ...(get()._recentlyDeleted || {}) };
          const now = Date.now();
          let changed = false;
          for (const [k, t] of Object.entries(cache)) {
            if (now - t > ttlMs) {
              delete cache[k];
              changed = true;
            }
          }
          if (changed) set({ _recentlyDeleted: cache });
        },
 
        // Persist and restore customization flags to avoid default backfill on boot
        _persistCustomizationFlags: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            if (!strategy || typeof strategy.save !== 'function') return;
            await strategy.save('meta', { id: 'hasUserCustoms', value: get().hasUserCustoms || {} });
          } catch (e) {
            console.debug('[UnifiedStore][_persistCustomizationFlags] skip', e?.message);
          }
        },
        _restoreCustomizationFlags: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            if (!strategy || typeof strategy.list !== 'function') return;
            const meta = await strategy.list('meta');
            const entry = Array.isArray(meta) ? meta.find(m => m?.id === 'hasUserCustoms') : null;
            if (entry && entry.value && typeof entry.value === 'object') {
              set({ hasUserCustoms: { ...(get().hasUserCustoms || {}), ...entry.value } });
            }
          } catch (e) {
            console.debug('[UnifiedStore][_restoreCustomizationFlags] skip', e?.message);
          }
        },
 
        // Rehydrate custom feeds from persistence (authenticated only)
        // loadCustomFeeds removed - feeds are now loaded from global settings

        // loadLocalMixes removed - local mixes are now loaded from global settings

        // Helpers for IDs
        _generateId: () => Math.random().toString(36).slice(2),

        // Canonicalize category keys used across the app
        _normalizeCategory: (cat) => {
          if (!cat || typeof cat !== 'string') return '';
          let c = cat.trim().toLowerCase().replace(/\s+/g, '-');
          // Alias used by UI/logic
          if (c === 'pre-starter' || c === 'prestarter' || c === 'pre_starter') c = 'starter';
          return c;
        },

        // Feed categories enum (derived from initial FEED_BRANDS keys)
        FEED_CATEGORIES: Object.freeze(Object.keys(FEED_BRANDS || {})),
        PACKAGING_OPTIONS: Object.freeze(['25kg', '50kg']),
        AVAILABILITY_REGIONS: Object.freeze(['nationwide', 'south-west', 'south-east', 'north']),
        FEED_TAGS: Object.freeze(['starter', 'grower', 'finisher', 'layer', 'premium', 'economy']),

        // Factory helpers
        createEmptyFeed: (category) => {
          const normalized = get()._normalizeCategory(category || (get().FEED_CATEGORIES[0] || 'starter'));
          return {
            id: get()._generateId(),
            name: '',
            brand: '',
            category: normalized,
            protein: 0,
            pricePerKg: 0,
            packaging: '25kg',
            availableIn: ['nationwide'],
            tags: [],
            estimatedPrice: { '25kg': 0 },
            isCustom: true,
            lastUpdated: new Date().toISOString()
          };
        },

        createEmptyLocalMix: (category) => {
          const normalized = get()._normalizeCategory(category || (get().FEED_CATEGORIES[0] || 'starter'));
          return {
            id: get()._generateId(),
            name: '',
            category: normalized,
            ingredients: [],
            protein: 0,
            pricePerKg: 0,
            notes: '',
            isCustom: true,
            lastUpdated: new Date().toISOString()
          };
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
        setActiveTab: (activeTab) => set({ activeTab }),

        // Settings: update per-user Feed Results feature visibility (admin UI will call this)
        setFeedResultsVisibility: (partial) => {
          const current = get().userSettings?.featureVisibility?.feedResults || {};
          set({
            userSettings: {
              ...(get().userSettings || {}),
              featureVisibility: {
                ...(get().userSettings?.featureVisibility || {}),
                feedResults: {
                  ...current,
                  ...partial
                }
              }
            }
          });
        },

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
              targetWeight: state.targetWeight
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
            
            // Get recommended feeds using store's customFeeds
            const recommendedFeeds = getRecommendedFeeds(
              state.birdType,
              state.ageInDays,
              state.customFeeds
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
              currentCalculation: null,
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
            currentCalculation: calculationData,
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
        
        // Custom feed management
        // Feed management methods removed - feeds are now global and managed through admin settings









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
              targetWeight: calculation.targetWeight
            });
            
            return {
              ...feedResults,
              ageInDays: currentAge,
              quantity: calculation.currentQuantity || calculation.quantity,
              calculatedFor: new Date().toISOString().split('T')[0],
              totalFeedKg: feedResults.total.grams / 1000,
              feedPerBirdGrams: feedResults.perBird.grams,
              feedType: getFeedType(calculation.birdType, currentAge),
              protein: getProtein(calculation.birdType, currentAge),
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

        // Trigger migration check when user interacts with data
        triggerMigrationCheck: () => {
          // This will be used by components to trigger migration check
          // when user tries to save/load data
          const event = new CustomEvent('triggerMigrationCheck');
          window.dispatchEvent(event);
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
            siteTitle: 'FeedMate by Omzo Farmz'
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
            
            // Check if user is authenticated before attempting Firebase access
            const { auth } = await import('./firebase');
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
              // User not authenticated, use default settings
              const defaultSettings = {
                siteTitle: 'FeedMate by Omzo Farmz',
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
                feedResultsVisibility: {
                  showFeedQuantity: true,
                  showFeedingSchedule: true,
                  showWeeklySummary: true,
                  showProgressionTracker: true,
                  showFCRReference: true,
                  showOptimizationInsights: true,
                  showBestPractices: true
                },
                // Global feed data - moved from local storage to global settings
                globalFeeds: FEED_BRANDS,
                globalLocalMixes: LOCAL_FEED_MIXES,
                logoVersion: Date.now()
              };
              set({ globalSettings: defaultSettings, isLoadingGlobal: false, error: null });
              // Populate feed data from global settings
              get().populateFeedDataFromGlobal(defaultSettings);
              return defaultSettings;
            }
            
            // Lazy import to avoid SSR issues
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');

            // Attempt to read settings
            const snap = await getDoc(settingsDocRef);

            if (snap.exists()) {
              const data = snap.data();
              set({ globalSettings: data, isLoadingGlobal: false, error: null });
              // Populate feed data from global settings
              get().populateFeedDataFromGlobal(data);
              return data;
            }

            // If not found, seed defaults (first-time bootstrap)
            const defaultSettings = {
              siteTitle: 'FeedMate by Omzo Farmz',
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
              // New global visibility toggles for Feed Results sections (default all true)
              feedResultsVisibility: {
                showFeedQuantity: true,
                showFeedingSchedule: true,
                showWeeklySummary: true,
                showProgressionTracker: true,
                showFCRReference: true,
                // New standalone flags
                showOptimizationInsights: true,
                showBestPractices: true
              },
              // Global feed data - moved from local storage to global settings
              globalFeeds: FEED_BRANDS,
              globalLocalMixes: LOCAL_FEED_MIXES,
              logoVersion: Date.now()
            };

            // Seed Firestore then update state
            await setDoc(settingsDocRef, defaultSettings, { merge: true });
            set({ globalSettings: defaultSettings, isLoadingGlobal: false, error: null });
            // Populate feed data from global settings
            get().populateFeedDataFromGlobal(defaultSettings);
            return defaultSettings;
          } catch (error) {
            // Check if this is a permission error for unauthenticated users
            const isPermissionError = error?.code === 'permission-denied' || 
                                    error?.message?.includes('Missing or insufficient permissions');
            
            if (isPermissionError) {
              // Use default settings for permission errors (likely unauthenticated)
              const defaultSettings = {
                siteTitle: 'FeedMate by Omzo Farmz',
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
                feedResultsVisibility: {
                  showFeedQuantity: true,
                  showFeedingSchedule: true,
                  showWeeklySummary: true,
                  showProgressionTracker: true,
                  showFCRReference: true,
                  showOptimizationInsights: true,
                  showBestPractices: true
                },
                logoVersion: Date.now()
              };
              set({ globalSettings: defaultSettings, isLoadingGlobal: false, error: null });
              return defaultSettings;
            } else {
              // Log actual errors that aren't permission-related
              console.error('Error loading global settings:', error);
              set({ isLoadingGlobal: false, error: error?.message || 'Failed to load settings' });
              return null;
            }
          }
        },

        updateSettings: async (newSettings) => {
          try {
            set({ isLoadingGlobal: true, error: null });

            // Merge with existing in-memory settings
            const currentSettings = get().globalSettings || {};

            // If caller passes nested feedResultsVisibility, merge deeply for that object to avoid clobbering missing keys
            const nextFRV = {
              ...(currentSettings.feedResultsVisibility || {}),
              ...(newSettings.feedResultsVisibility || {})
            };

            const updatedSettings = {
              ...currentSettings,
              ...newSettings,
              ...(Object.keys(nextFRV).length > 0 ? { feedResultsVisibility: nextFRV } : {})
            };

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

        // Restore commercial feeds to original FEED_BRANDS data
        restoreCommercialFeeds: async () => {
          try {
            const currentSettings = get().globalSettings;
            if (!currentSettings) {
              throw new Error('Global settings not loaded');
            }

            // Reset globalFeeds to original FEED_BRANDS data
            const updatedSettings = {
              ...currentSettings,
              globalFeeds: { ...FEED_BRANDS }
            };
            
            await get().updateSettings(updatedSettings);
            
            // Update local state immediately
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            
            return true;
          } catch (error) {
            console.error('Error restoring commercial feeds:', error);
            throw error;
          }
        },

        // Populate feed data from global settings
        populateFeedDataFromGlobal: (globalSettings) => {
          const feedData = globalSettings?.globalFeeds || FEED_BRANDS;
          const rawLocalMixData = globalSettings?.globalLocalMixes || LOCAL_FEED_MIXES;
          
          // Ensure localMixes structure is consistent (arrays for each category)
          const localMixData = {};
          Object.keys(rawLocalMixData).forEach(category => {
            const categoryData = rawLocalMixData[category];
            if (Array.isArray(categoryData)) {
              localMixData[category] = categoryData;
            } else if (categoryData && typeof categoryData === 'object') {
              // Convert single object to array
              localMixData[category] = [categoryData];
            } else {
              // Fallback to default if available
              const defaultMix = LOCAL_FEED_MIXES[category];
              localMixData[category] = defaultMix ? [defaultMix] : [];
            }
          });
          
          set({
            customFeeds: feedData,
            localMixes: localMixData,
            hasUserCustoms: Object.keys(feedData || {}).reduce((acc, k) => { acc[k] = true; return acc; }, {})
          });
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
        error: null,

        // Force component re-renders after CRUD operations
        _triggerUpdate: () => {
          set(state => ({ _updateTrigger: state._updateTrigger + 1 }));
        },

        // Admin feed management functions
        addGlobalFeed: async (category, feedData) => {
          try {
            const currentSettings = get().globalSettings;
            const currentCategoryFeeds = currentSettings.globalFeeds[category] || [];
            const updatedFeeds = {
              ...currentSettings.globalFeeds,
              [category]: [...currentCategoryFeeds, feedData]
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalFeeds: updatedFeeds
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            return true;
          } catch (error) {
            console.error('Error adding global feed:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to add global feed' });
            throw error;
          }
        },

        editGlobalFeed: async (category, feedId, feedData) => {
          try {
            const currentSettings = get().globalSettings;
            const currentCategoryFeeds = currentSettings.globalFeeds[category] || [];
            const updatedCategoryFeeds = currentCategoryFeeds.map(feed => 
              feed.id === feedId ? feedData : feed
            );
            const updatedFeeds = {
              ...currentSettings.globalFeeds,
              [category]: updatedCategoryFeeds
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalFeeds: updatedFeeds
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            return true;
          } catch (error) {
            console.error('Error editing global feed:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to edit global feed' });
            throw error;
          }
        },

        deleteGlobalFeed: async (category, feedId) => {
          try {
            const currentSettings = get().globalSettings;
            const currentCategoryFeeds = currentSettings.globalFeeds[category] || [];
            const updatedCategoryFeeds = currentCategoryFeeds.filter(feed => feed.id !== feedId);
            const updatedFeeds = {
              ...currentSettings.globalFeeds,
              [category]: updatedCategoryFeeds
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalFeeds: updatedFeeds
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            return true;
          } catch (error) {
            console.error('Error deleting global feed:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to delete global feed' });
            throw error;
          }
        },

        addGlobalLocalMix: async (category, mixData) => {
          try {
            const currentSettings = get().globalSettings;
            const currentCategoryMixes = currentSettings.globalLocalMixes[category];
            
            // Generate unique ID for the new mix
            const mixId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newMix = { ...mixData, id: mixId };
            
            let updatedCategoryMixes;
            if (Array.isArray(currentCategoryMixes)) {
              // Already an array, add to it
              updatedCategoryMixes = [...currentCategoryMixes, newMix];
            } else if (currentCategoryMixes && typeof currentCategoryMixes === 'object') {
              // Convert single object to array and add new mix
              updatedCategoryMixes = [currentCategoryMixes, newMix];
            } else {
              // No existing mixes, just create array with new mix
              updatedCategoryMixes = [newMix];
            }
            
            const updatedMixes = {
              ...currentSettings.globalLocalMixes,
              [category]: updatedCategoryMixes
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalLocalMixes: updatedMixes
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            return true;
          } catch (error) {
            console.error('Error adding global local mix:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to add local mix' });
            throw error;
          }
        },

        editGlobalLocalMix: async (category, mixId, mixData) => {
          try {
            const currentSettings = get().globalSettings;
            const currentCategoryMixes = currentSettings.globalLocalMixes[category];
            
            let updatedCategoryMixes;
            if (Array.isArray(currentCategoryMixes)) {
              // Find and update the specific mix
              updatedCategoryMixes = currentCategoryMixes.map(mix => 
                mix.id === mixId ? { ...mixData, id: mixId } : mix
              );
            } else if (currentCategoryMixes && typeof currentCategoryMixes === 'object') {
              // Single object case - if editing the default mix, just update it
              if (mixId === category || !mixId) {
                updatedCategoryMixes = { ...mixData, id: mixId };
              } else {
                // Convert to array and update
                updatedCategoryMixes = [{ ...mixData, id: mixId }];
              }
            } else {
              // No existing mixes, create new one
              updatedCategoryMixes = [{ ...mixData, id: mixId }];
            }
            
            const updatedMixes = {
              ...currentSettings.globalLocalMixes,
              [category]: updatedCategoryMixes
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalLocalMixes: updatedMixes
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            return true;
          } catch (error) {
            console.error('Error editing global local mix:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to edit local mix' });
            throw error;
          }
        },

        deleteGlobalLocalMix: async (category, mixId) => {
          try {
            console.log('🔥 DEBUG: Starting deleteGlobalLocalMix', { category, mixId });
            const currentSettings = get().globalSettings;
            console.log('🔥 DEBUG: Current settings:', currentSettings);
            const currentCategoryMixes = currentSettings.globalLocalMixes[category];
            console.log('🔥 DEBUG: Current category mixes:', currentCategoryMixes);
            
            let updatedCategoryMixes;
            if (Array.isArray(currentCategoryMixes)) {
              // Remove the specific mix from the array
              // Note: Mix objects don't have 'id' property, so we need to match by name or create IDs
              // The mixId appears to be the category name, so we need a different approach
              // Let's check if the mix name contains the category or use index-based deletion
              updatedCategoryMixes = currentCategoryMixes.filter((mix, index) => {
                const mixSlug = mix.name ? mix.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';
                const nameContainsCategory = mix.name && mix.name.toLowerCase().includes(mixId.toLowerCase());
                const shouldDelete = nameContainsCategory || mixSlug.includes(mixId) || index === 0; // Assume first item if category match
                return !shouldDelete; // Keep items that should NOT be deleted
              });
              
              // Allow empty arrays - don't force default mix back
            } else if (currentCategoryMixes && typeof currentCategoryMixes === 'object') {
              // Single object case - if deleting it, make array empty
              updatedCategoryMixes = [];
            } else {
              // No existing mixes, keep empty
              updatedCategoryMixes = [];
            }
            
            const updatedMixes = {
              ...currentSettings.globalLocalMixes,
              [category]: updatedCategoryMixes
            };
            
            const updatedSettings = {
              ...currentSettings,
              globalLocalMixes: updatedMixes
            };
            
            // Use the global settings update function directly instead of get().updateSettings()
            set({ isLoadingGlobal: true, error: null });
            console.log('🔥 DEBUG: Set loading state');
            
            // Persist to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('./firebase');
            const settingsDocRef = doc(db, 'global_settings', 'site');
            console.log('🔥 DEBUG: About to save to Firestore');
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            console.log('🔥 DEBUG: Successfully saved to Firestore');
            
            // Reflect in store
            set({ globalSettings: updatedSettings, isLoadingGlobal: false });
            console.log('🔥 DEBUG: Updated store state');
            
            get().populateFeedDataFromGlobal(updatedSettings);
            get()._triggerUpdate();
            console.log('🔥 DEBUG: Triggered updates, deletion complete');
            return true;
          } catch (error) {
            console.error('🔥 DEBUG: Error in deleteGlobalLocalMix:', error);
            set({ isLoadingGlobal: false, error: error?.message || 'Failed to delete local mix' });
            throw error;
          }
        }
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
        activeTab: state.activeTab
      })
    }
  )
);

// Initialize async data after store creation
(async () => {
  try {
    await useUnifiedStore.getState()._restoreCustomizationFlags();
  } catch (e) {
    // Non-fatal
    console.warn('Initial data hydration skipped:', e?.message || e);
  }
})();

// Export helper functions for backward compatibility
export const getAvailableBreeds = (birdType) => {
  if (BIRD_BREEDS[birdType]) {
    return Object.keys(BIRD_BREEDS[birdType]);
  }
  return [];
};

export const getTargetWeightOptions = (breed) => {
  
  const targetWeightLabels = {
    medium: '1.8kg @ 6 weeks (Standard feed plan)',
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
        description: key === 'medium' ? 'Standard growth target' :
                    key === 'aggressive' ? 'High growth target' :
                    key === 'premium' ? 'Maximum growth target' : 'Custom plan'
      }));
    }
  }
  
  // Default fallback for layers or when breed not specified
  return [
    { value: 'medium', label: '1.8kg @ 6 weeks (Standard feed plan)', weight: 1.8, feedMultiplier: 1.0, description: 'Standard growth target' },
    { value: 'aggressive', label: '2.2kg+ @ 6 weeks (Aggressive feed plan)', weight: 2.2, feedMultiplier: 1.25, description: 'High growth target' },
    { value: 'premium', label: '2.5kg @ 6 weeks (Premium feed plan)', weight: 2.5, feedMultiplier: 1.4, description: 'Maximum growth target' }
  ];
};

export const getRearingStyleOptions = () => [
  { value: 'backyard', label: 'Backyard (≤10 birds)', description: 'Small-scale, less controlled environment' },
  { value: 'commercial', label: 'Commercial (>10 birds)', description: 'Larger scale, controlled environment' }
];