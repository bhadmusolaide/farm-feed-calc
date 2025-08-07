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
      // Eagerly load persisted custom feeds and local mixes (no-op if unauthenticated)
      // Ensure we also restore hasUserCustoms before UI reads categories to avoid default backfill on boot.
      (async () => {
        try {
          await get()._restoreCustomizationFlags();
          await get().loadCustomFeeds();
          await get().loadLocalMixes();
        } catch (e) {
          // Non-fatal
          console.warn('Initial data hydration skipped:', e?.message || e);
        }
      })();
      
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
        // Custom/commercial feeds grouped by category
        customFeeds: FEED_BRANDS, // Initialize with commercial feed brands (object keyed by category -> array of feeds)
        // Tracks whether user has ever created custom feeds per category (prevents default backfill after deletions)
        hasUserCustoms: Object.keys(FEED_BRANDS || {}).reduce((acc, k) => { acc[k] = false; return acc; }, {}),
        // Locally defined mixes grouped by category
        localMixes: LOCAL_FEED_MIXES, // Initialize with local feed mixes

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
        loadCustomFeeds: async () => {
          try {
            // Purge stale optimistic tombstones
            get()._purgeOldDeleted();
            try {
              const debugNow = new Date().toISOString();
              // Lightweight snapshot to avoid logging large arrays
              const cats = Object.keys(get().customFeeds || {});
              console.debug('[UnifiedStore][loadCustomFeeds] start', { t: debugNow, cats });
            } catch {}

            const strategy = get()._getPersistenceStrategy();
            // If strategy cannot list (unauthenticated), keep bundled defaults
            if (!strategy || typeof strategy.list !== 'function') return get().customFeeds;

            const list = await strategy.list('customFeeds'); // array of feeds
            try {
              console.debug('[UnifiedStore][loadCustomFeeds] strategy.list(customFeeds) size', { size: Array.isArray(list) ? list.length : 'NA' });
            } catch {}
            // Group by normalized category to match UI consumption
            const normalize = get()._normalizeCategory;
            const grouped = {};
            const tombstones = get()._recentlyDeleted || {};
            const now = Date.now();
            try {
              console.debug('[UnifiedStore][loadCustomFeeds] tombstones', { ids: Object.keys(tombstones || {}) });
            } catch {}

            const effectiveList = Array.isArray(list) ? list : [];
            // Load persisted suppression map (from meta) if present
            try {
              const strategyMeta = get()._getPersistenceStrategy();
              if (strategyMeta && typeof strategyMeta.list === 'function') {
                const meta = await strategyMeta.list('meta');
                const entry = Array.isArray(meta) ? meta.find(m => m?.id === 'suppressedDeletes') : null;
                if (entry && entry.value && typeof entry.value === 'object') {
                  set({ _suppressedDeletes: entry.value });
                }
              }
            } catch {}
            
            // Clean up old suppressed entries (TTL 30s)
            const suppressed = { ...(get()._suppressedDeletes || {}) };
            let suppressedChanged = false;
            for (const [id, timestamp] of Object.entries(suppressed)) {
              if (now - timestamp > 30000) {
                delete suppressed[id];
                suppressedChanged = true;
              }
            }
            if (suppressedChanged) {
              set({ _suppressedDeletes: suppressed });
              // Persist cleaned suppression map
              try {
                const strategy = get()._getPersistenceStrategy();
                if (strategy && typeof strategy.save === 'function') {
                  await strategy.save('meta', { id: 'suppressedDeletes', value: suppressed });
                }
              } catch {}
            }
            
            for (const feed of effectiveList) {
              // Optimistic filter: drop items deleted in the last 2s
              if (tombstones[feed.id] && now - tombstones[feed.id] < 2000) {
                continue;
              }
              // Suppress IDs that were flagged due to eventual consistency across reloads (TTL 30s)
              if (suppressed[feed.id] && (now - suppressed[feed.id] < 30000)) {
                try { console.debug('[UnifiedStore][loadCustomFeeds] suppressed stale feed id', { id: feed.id }); } catch {}
                continue;
              }
              const cat = normalize(feed.category) || 'starter';
              if (!Array.isArray(grouped[cat])) grouped[cat] = [];
              grouped[cat].push({ ...feed, category: cat });
            }

            // If nothing from DB, DO NOT fallback to FEED_BRANDS to avoid re-inserting deleted items.
            // Keep existing in-memory state. Explicit resetCustomFeeds() should be used to restore defaults.
            if (Object.keys(grouped).length === 0) {
              try {
                console.debug('[UnifiedStore][loadCustomFeeds] grouped empty -> keep existing customFeeds (no fallback)');
              } catch {}
              return get().customFeeds;
            }
 
            // When grouped has data, mark hasUserCustoms true for those categories
            const nextHas = { ...(get().hasUserCustoms || {}) };
            for (const c of Object.keys(grouped)) {
              nextHas[c] = true;
            }
            set({ customFeeds: grouped, hasUserCustoms: nextHas });
            // Persist flags so a hard reload will not backfill defaults
            try { await get()._persistCustomizationFlags(); } catch {}
            try {
              const cats = Object.keys(grouped || {});
              console.debug('[UnifiedStore][loadCustomFeeds] applied grouped categories', { cats });
            } catch {}
            return grouped;
          } catch (error) {
            console.error('[UnifiedStore][loadCustomFeeds] error:', error);
            // Fail-safe: keep existing state
            return get().customFeeds;
          }
        },

        // Rehydrate local mixes from persistence (authenticated only)
        loadLocalMixes: async () => {
          try {
            const strategy = get()._getPersistenceStrategy();
            if (!strategy || typeof strategy.list !== 'function') return get().localMixes;

            const list = await strategy.list('localMixes'); // array of mixes
            if (!Array.isArray(list) || list.length === 0) {
              set({ localMixes: LOCAL_FEED_MIXES });
              return LOCAL_FEED_MIXES;
            }

            const normalize = get()._normalizeCategory;
            const grouped = {};
            for (const mix of list) {
              const cat = normalize(mix.category) || 'starter';
              if (!Array.isArray(grouped[cat])) grouped[cat] = [];
              grouped[cat].push({ ...mix, category: cat });
            }

            set({ localMixes: grouped });
            return grouped;
          } catch (error) {
            console.error('Error loading local mixes:', error);
            return get().localMixes;
          }
        },

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
        
        // Custom feed management
        addCustomFeed: async (category, feedData) => {
          const state = get();
          const catInput = category || feedData?.category;
          const cat = state._normalizeCategory(catInput);
          if (!cat) throw new Error('Category is required to add a custom feed');

          const strategy = state._getPersistenceStrategy();
          const id = feedData?.id || state._generateId();
          const newFeed = {
            id,
            isCustom: true,
            lastUpdated: new Date().toISOString(),
            ...feedData,
            category: cat
          };
          // Ensure nested estimatedPrice shape remains intact if present
          if (newFeed.estimatedPrice && typeof newFeed.estimatedPrice !== 'object') {
            newFeed.estimatedPrice = { '25kg': Number(newFeed.estimatedPrice) || 0 };
          }

          // Persist if supported
          if (strategy && typeof strategy.save === 'function') {
            try { console.debug('[UnifiedStore][addCustomFeed] persisting new feed', { id, cat }); } catch {}
            await strategy.save('customFeeds', newFeed);
          }

          // Update in-memory state optimistically
          const current = get().customFeeds || {};
          const list = Array.isArray(current[cat]) ? current[cat] : [];
          const nextHas = { ...(get().hasUserCustoms || {}) , [cat]: true };
          set({
            customFeeds: {
              ...current,
              [cat]: [...list.filter(f => f.id !== id), newFeed]
            },
            hasUserCustoms: nextHas
          });

          // Persist customization flags
          try { await state._persistCustomizationFlags(); } catch {}

          // Force immediate rehydration to ensure consistency
          try {
            console.debug('[UnifiedStore][addCustomFeed] immediate rehydrate after add', { id });
            await state.loadCustomFeeds();
          } catch (e) {
            console.debug('[UnifiedStore][addCustomFeed] rehydrate error', e?.message);
          }
          
          // Trigger component updates
          state._triggerUpdate();
          return id;
        },

        updateCustomFeed: async (category, feedId, updates) => {
          const state = get();
          const catInput = category || updates?.category;
          const cat = state._normalizeCategory(catInput);
          if (!cat) throw new Error('Category is required to update a custom feed');
          if (!feedId) throw new Error('Feed ID is required to update a custom feed');

          const current = get().customFeeds || {};
          const list = Array.isArray(current[cat]) ? current[cat] : [];
          const existing = list.find(f => f.id === feedId);
          if (!existing) throw new Error('Feed not found');

          const updated = {
            ...existing,
            ...updates,
            category: cat,
            lastUpdated: new Date().toISOString()
          };
          if (updated.estimatedPrice && typeof updated.estimatedPrice !== 'object') {
            updated.estimatedPrice = { '25kg': Number(updated.estimatedPrice) || 0 };
          }

          // Persist if supported
          const strategy = state._getPersistenceStrategy();
          if (strategy && typeof strategy.update === 'function') {
            try { console.debug('[UnifiedStore][updateCustomFeed] updating feed', { feedId, cat }); } catch {}
            await strategy.update('customFeeds', feedId, updated);
          } else if (strategy && typeof strategy.save === 'function') {
            // fallback to save
            try { console.debug('[UnifiedStore][updateCustomFeed] fallback save', { feedId, cat }); } catch {}
            await strategy.save('customFeeds', updated);
          }

          // Update state optimistically
          const nextHas = { ...(get().hasUserCustoms || {}) , [cat]: true };
          set({
            customFeeds: {
              ...current,
              [cat]: list.map(f => (f.id === feedId ? updated : f))
            },
            hasUserCustoms: nextHas
          });

          // Force immediate rehydration to ensure consistency
          try {
            console.debug('[UnifiedStore][updateCustomFeed] immediate rehydrate after update', { feedId });
            await state.loadCustomFeeds();
          } catch (e) {
            console.debug('[UnifiedStore][updateCustomFeed] rehydrate error', e?.message);
          }
          
          // Trigger component updates
          state._triggerUpdate();
          return true;
        },

        deleteCustomFeed: async (category, feedId) => {
          const state = get();
          const cat = state._normalizeCategory(category);
          if (!cat) throw new Error('Category is required to delete a custom feed');
          if (!feedId) throw new Error('Feed ID is required to delete a custom feed');

          // Mark optimistic tombstone to prevent flicker on eventual consistency
          try { console.debug('[UnifiedStore][deleteCustomFeed] mark tombstone', { feedId, cat }); } catch {}
          state._markDeleted(feedId);

          // Add to suppressed deletes for persistence across reloads
          const suppressed = { ...(get()._suppressedDeletes || {}) };
          suppressed[feedId] = Date.now();
          set({ _suppressedDeletes: suppressed });

          // Persist suppression map
          try {
            const strategy = state._getPersistenceStrategy();
            if (strategy && typeof strategy.save === 'function') {
              await strategy.save('meta', { id: 'suppressedDeletes', value: suppressed });
            }
          } catch (e) {
            console.debug('[UnifiedStore][deleteCustomFeed] failed to persist suppression', e?.message);
          }

          // Persist deletion if supported
          const strategy = state._getPersistenceStrategy();
          if (strategy && typeof strategy.delete === 'function') {
            try { console.debug('[UnifiedStore][deleteCustomFeed] deleting via strategy.delete', { feedId }); } catch {}
            await strategy.delete('customFeeds', feedId);
          } else if (strategy && strategy.db && typeof strategy.db.deleteCustomFeed === 'function') {
            try { console.debug('[UnifiedStore][deleteCustomFeed] deleting via strategy.db.deleteCustomFeed', { feedId }); } catch {}
            await strategy.db.deleteCustomFeed(feedId);
          }

          // Update state optimistically
          const current = get().customFeeds || {};
          const list = Array.isArray(current[cat]) ? current[cat] : [];
          try { console.debug('[UnifiedStore][deleteCustomFeed] optimistic remove from state', { cat, before: list.length, after: list.filter(f => f.id !== feedId).length }); } catch {}
          
          // Also update hasUserCustoms to ensure the category is marked as having user customs
          const nextHas = { ...(get().hasUserCustoms || {}) };
          nextHas[cat] = true; // Keep it true even after deletion
          
          set({
            customFeeds: {
              ...current,
              [cat]: list.filter(f => f.id !== feedId)
            },
            hasUserCustoms: nextHas
          });

          // Force immediate rehydration to ensure consistency
          try {
            console.debug('[UnifiedStore][deleteCustomFeed] immediate rehydrate');
            await state.loadCustomFeeds();
          } catch (e) {
            console.debug('[UnifiedStore][deleteCustomFeed] rehydrate error', e?.message);
          }

          // Trigger component updates
          state._triggerUpdate();
          return true;
        },

        updateLocalMix: async (category, mixData) => {
          const state = get();
          const cat = state._normalizeCategory(category);
          if (!cat) throw new Error('Category is required to update a local mix');

          const strategy = state._getPersistenceStrategy();
          const updated = {
            ...mixData,
            category: cat,
            lastUpdated: new Date().toISOString()
          };

          // Persist if supported
          if (strategy && typeof strategy.update === 'function') {
            try { console.debug('[UnifiedStore][updateLocalMix] updating mix', { cat }); } catch {}
            await strategy.update('localMixes', mixData.id, updated);
          } else if (strategy && typeof strategy.save === 'function') {
            try { console.debug('[UnifiedStore][updateLocalMix] fallback save', { cat }); } catch {}
            await strategy.save('localMixes', updated);
          }

          // Update state optimistically
          const current = get().localMixes || {};
          set({
            localMixes: {
              ...current,
              [cat]: updated
            }
          });

          // Force immediate rehydration to ensure consistency
          try {
            console.debug('[UnifiedStore][updateLocalMix] immediate rehydrate after update', { cat });
            await state.loadLocalMixes();
          } catch (e) {
            console.debug('[UnifiedStore][updateLocalMix] rehydrate error', e?.message);
          }

          // Trigger component updates
          state._triggerUpdate();
          return true;
        },

        resetCustomFeeds: async () => {
          const state = get();
          // Clear from persistence if supported
          const strategy = state._getPersistenceStrategy();
          if (strategy && typeof strategy.clear === 'function') {
            await strategy.clear('customFeeds');
          }
          // Reset to bundled FEED_BRANDS
          set({ customFeeds: FEED_BRANDS });
          // Trigger component updates
          state._triggerUpdate();
          return true;
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