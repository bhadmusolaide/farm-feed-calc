import { create } from 'zustand';
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

export const useSiteSettingsStore = create((set, get) => ({
      // State
      globalSettings: DEFAULT_SETTINGS, // Settings from Firebase (now the only source)
      isLoading: false,
      isLoadingGlobal: false,
      error: null,
      requiresAuth: true, // Always require authentication for settings

      // Actions
      
      // Load global settings from Firebase
      loadGlobalSettings: async () => {
        set({ isLoadingGlobal: true, error: null });
        try {
          const { user } = useFirebaseAuthStore.getState();
          if (!user) {
            throw new Error('Authentication required for global settings');
          }

          const { data, error } = await globalSettingsDB.get();
          if (error) {
            throw new Error(`Failed to load global settings: ${error.message}`);
          }
          
          if (data) {
            set({ 
              globalSettings: data,
              isLoadingGlobal: false
            });
          } else {
            // Initialize with default settings if none exist
            const { error: initError } = await globalSettingsDB.update(DEFAULT_SETTINGS);
            if (initError) {
              throw new Error(`Failed to initialize global settings: ${initError.message}`);
            }
            set({ 
              globalSettings: DEFAULT_SETTINGS,
              isLoadingGlobal: false
            });
          }
        } catch (error) {
          console.error('Error loading global settings:', error);
          set({ 
            error: error.message,
            isLoadingGlobal: false
          });
          throw error;
        }
      },

      // Update settings (requires authentication, saves to Firebase only)
      updateSettings: async (newSettings) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useFirebaseAuthStore.getState();
          if (!user) {
            throw new Error('Authentication required to update settings');
          }

          const currentSettings = get().globalSettings;
          
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

          // Save to Firebase (global settings only)
          const { error: dbError } = await globalSettingsDB.update(validatedSettings);
          if (dbError) {
            throw new Error(`Failed to save settings: ${dbError.message}`);
          }

          // Successfully saved to Firebase, update state
          set({ 
            globalSettings: validatedSettings,
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
          const { user } = useFirebaseAuthStore.getState();
          if (!user) {
            throw new Error('Authentication required to reset settings');
          }

          const resetSettings = { 
            ...DEFAULT_SETTINGS,
            logoVersion: Date.now() // Generate new version to force cache refresh
          };

          // Save to Firebase
          const { error: dbError } = await globalSettingsDB.update(resetSettings);
          if (dbError) {
            throw new Error(`Failed to reset settings: ${dbError.message}`);
          }

          set({ 
            globalSettings: resetSettings,
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

      // Get current settings (always global)
      getActiveSettings: () => {
        return get().globalSettings;
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
}));

// Export default settings for use in components
export { DEFAULT_SETTINGS };