'use client';

import { useEffect } from 'react';
import { useSiteSettingsStore } from '../lib/siteSettingsStore';

export default function SettingsInitializer() {
  const { initialize } = useSiteSettingsStore();

  useEffect(() => {
    // Initialize global settings when the app loads
    const initializeSettings = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Failed to initialize global settings:', error);
      }
    };

    initializeSettings();
  }, [initialize]);

  // This component doesn't render anything visible
  return null;
}