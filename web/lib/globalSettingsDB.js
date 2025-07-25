// Global Site Settings Database Operations
import { 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Global settings collection - shared across all users
const GLOBAL_SETTINGS_DOC_ID = 'site_settings';

export const globalSettingsDB = {
  // Get global site settings
  get: async () => {
    try {
      const docSnap = await getDoc(doc(db, 'global_settings', GLOBAL_SETTINGS_DOC_ID));
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null };
      } else {
        return { data: null, error: new Error('Global settings not found') };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update global site settings (admin only)
  update: async (settings) => {
    try {
      await setDoc(doc(db, 'global_settings', GLOBAL_SETTINGS_DOC_ID), {
        ...settings,
        updated_at: serverTimestamp(),
        // Add version for cache busting
        version: Date.now()
      }, { merge: true });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Initialize global settings with defaults (admin only)
  initialize: async (defaultSettings) => {
    try {
      await setDoc(doc(db, 'global_settings', GLOBAL_SETTINGS_DOC_ID), {
        ...defaultSettings,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        version: Date.now()
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Helper function to check if global settings exist
export const checkGlobalSettingsExist = async () => {
  const { data, error } = await globalSettingsDB.get();
  return !error && data !== null;
};