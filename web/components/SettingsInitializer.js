'use client';

import { useEffect } from 'react';
import { useUnifiedStore } from '../lib/unifiedStore';

export default function SettingsInitializer() {
  const { initialize, loadGlobalSettings } = useUnifiedStore();

  useEffect(() => {
    // Initialize user-related data and then ensure global site settings are loaded
    const initializeSettings = async () => {
      try {
        await initialize();
        await loadGlobalSettings();
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
    };

    initializeSettings();
  }, [initialize, loadGlobalSettings]);

  // This component doesn't render anything visible
  return null;
}