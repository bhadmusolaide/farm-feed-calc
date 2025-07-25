import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { globalSettingsDB, checkGlobalSettingsExist } from './globalSettingsDB';
import useFirebaseAuthStore from './firebaseAuthStore';

// Default settings
const DEFAULT_SETTINGS = {
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
  // Cache-busting version for logo updates
  logoVersion: Date.now()
};

export const useSiteSettingsStore = create(
  persist(
    (set, get) => ({
      // State
      settings: DEFAULT_SETTINGS,
      globalSettings: null, // Settings from Firebase
      isLoading: false,
      isLoadingGlobal: false,
      error: null,
      useGlobalSettings: true, // Flag to use global vs local settings

      // Actions
      
      // Load global settings from Firebase
      loadGlobalSettings: async () => {
        set({ isLoadingGlobal: true, error: null });
        try {
          const { data, error } = await globalSettingsDB.get();
          if (error) {
            console.warn('Could not load global settings:', error.message);
            set({ isLoadingGlobal: false, useGlobalSettings: false });
            return;
          }
          
          if (data) {
            set({ 
              globalSettings: data,
              isLoadingGlobal: false,
              useGlobalSettings: true
            });
          } else {
            set({ isLoadingGlobal: false, useGlobalSettings: false });
          }
        } catch (error) {
          console.warn('Error loading global settings:', error);
          set({ 
            error: error.message,
            isLoadingGlobal: false,
            useGlobalSettings: false
          });
        }
      },

      // Update settings (saves to Firebase if admin, otherwise local only)
      updateSettings: async (newSettings) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useFirebaseAuthStore.getState();
          const currentSettings = get().useGlobalSettings && get().globalSettings 
            ? get().globalSettings 
            : get().settings;
          
          // Check if logo URLs are being updated to increment cache-busting version
          const logoChanged = newSettings.logoUrl !== undefined && newSettings.logoUrl !== currentSettings.logoUrl;
          const footerLogoChanged = newSettings.footer?.logoUrl !== undefined && newSettings.footer.logoUrl !== currentSettings.footer.logoUrl;
          
          const validatedSettings = {
            ...currentSettings,
            ...newSettings,
            // Handle nested footer object
            footer: {
              ...currentSettings.footer,
              ...(newSettings.footer || {}),
              // Ensure arrays are properly formatted
              features: Array.isArray(newSettings.footer?.features) 
                ? newSettings.footer.features.filter(item => item.trim() !== '')
                : currentSettings.footer.features,
              support: Array.isArray(newSettings.footer?.support)
                ? newSettings.footer.support.filter(item => item.trim() !== '')
                : currentSettings.footer.support
            },
            // Handle nested recommendedFeeds object
            recommendedFeeds: {
              ...currentSettings.recommendedFeeds,
              ...(newSettings.recommendedFeeds || {})
            },
            // Update logo version if any logo URL changed
            logoVersion: (logoChanged || footerLogoChanged) ? Date.now() : currentSettings.logoVersion
          };

          // If user is authenticated, try to save to Firebase (global settings)
          if (user) {
            const { error: dbError } = await globalSettingsDB.update(validatedSettings);
            if (!dbError) {
              // Successfully saved to Firebase, update global settings
              set({ 
                globalSettings: validatedSettings,
                useGlobalSettings: true,
                isLoading: false 
              });
              return validatedSettings;
            } else {
              console.warn('Could not save to global settings:', dbError.message);
              // Fall back to local storage
            }
          }
          
          // Save locally (fallback or when not authenticated)
          set({ 
            settings: validatedSettings,
            isLoading: false 
          });
          
          return validatedSettings;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      resetToDefaults: async () => {
        set({ isLoading: true, error: null });
        try {
          const resetSettings = { 
            ...DEFAULT_SETTINGS,
            logoVersion: Date.now() // Generate new version to force cache refresh
          };
          set({ 
            settings: resetSettings,
            isLoading: false 
          });
          return resetSettings;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          throw error;
        }
      },

      // Initialize store - load global settings if available
      initialize: async () => {
        await get().loadGlobalSettings();
      },

      // Toggle between global and local settings
      toggleGlobalSettings: (useGlobal) => {
        set({ useGlobalSettings: useGlobal });
      },

      // Get current active settings (global or local)
      getActiveSettings: () => {
        const state = get();
        return state.useGlobalSettings && state.globalSettings 
          ? state.globalSettings 
          : state.settings;
      },

      // Getters for specific settings (uses active settings)
      getSiteTitle: () => get().getActiveSettings().siteTitle,
      getSiteDescription: () => get().getActiveSettings().siteDescription,
      getLogoUrl: () => {
        const settings = get().getActiveSettings();
        const logoUrl = settings.logoUrl;
        if (!logoUrl) return logoUrl;
        // Add cache-busting parameter for relative URLs (public folder assets)
        if (logoUrl.startsWith('/') && !logoUrl.includes('?')) {
          return `${logoUrl}?v=${settings.logoVersion}`;
        }
        return logoUrl;
      },
      getFooterLogoUrl: () => {
        const settings = get().getActiveSettings();
        const footerLogoUrl = settings.footer.logoUrl;
        if (!footerLogoUrl) return footerLogoUrl;
        // Add cache-busting parameter for relative URLs (public folder assets)
        if (footerLogoUrl.startsWith('/') && !footerLogoUrl.includes('?')) {
          return `${footerLogoUrl}?v=${settings.logoVersion}`;
        }
        return footerLogoUrl;
      },
      getFooterDescription: () => get().getActiveSettings().footer.description,
      getFooterFeatures: () => get().getActiveSettings().footer.features,
      getFooterSupport: () => get().getActiveSettings().footer.support,
      getFooterCopyright: () => get().getActiveSettings().footer.copyright,
      getRecommendedFeedsTitle: () => get().getActiveSettings().recommendedFeeds.title,
      getRecommendedFeedsDescription: () => get().getActiveSettings().recommendedFeeds.description,

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'site-settings-storage',
      version: 1,
      // Only persist the settings, not loading states
      partialize: (state) => ({ settings: state.settings })
    }
  )
);

// Export default settings for use in components
export { DEFAULT_SETTINGS };