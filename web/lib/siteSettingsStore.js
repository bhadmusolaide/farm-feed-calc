import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      isLoading: false,
      error: null,

      // Actions
      updateSettings: async (newSettings) => {
        set({ isLoading: true, error: null });
        try {
          // Validate settings
          const currentSettings = get().settings;
          
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

      // Getters for specific settings
      getSiteTitle: () => get().settings.siteTitle,
      getSiteDescription: () => get().settings.siteDescription,
      getLogoUrl: () => {
        const settings = get().settings;
        const logoUrl = settings.logoUrl;
        if (!logoUrl) return logoUrl;
        // Add cache-busting parameter for relative URLs (public folder assets)
        if (logoUrl.startsWith('/') && !logoUrl.includes('?')) {
          return `${logoUrl}?v=${settings.logoVersion}`;
        }
        return logoUrl;
      },
      getFooterLogoUrl: () => {
        const settings = get().settings;
        const footerLogoUrl = settings.footer.logoUrl;
        if (!footerLogoUrl) return footerLogoUrl;
        // Add cache-busting parameter for relative URLs (public folder assets)
        if (footerLogoUrl.startsWith('/') && !footerLogoUrl.includes('?')) {
          return `${footerLogoUrl}?v=${settings.logoVersion}`;
        }
        return footerLogoUrl;
      },
      getFooterDescription: () => get().settings.footer.description,
      getFooterFeatures: () => get().settings.footer.features,
      getFooterSupport: () => get().settings.footer.support,
      getFooterCopyright: () => get().settings.footer.copyright,
      getRecommendedFeedsTitle: () => get().settings.recommendedFeeds.title,
      getRecommendedFeedsDescription: () => get().settings.recommendedFeeds.description,

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