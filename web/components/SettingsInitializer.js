'use client';

import { useEffect } from 'react';
import { useHybridSiteSettingsStore } from '../lib/hybridStore';

export default function SettingsInitializer() {
  const { initialize } = useHybridSiteSettingsStore();

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