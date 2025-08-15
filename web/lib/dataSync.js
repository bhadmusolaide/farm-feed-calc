// Data synchronization utilities for handling local-to-database migration

import { LocalStorageStrategy, DatabaseStrategy } from './persistenceStrategies';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

/**
 * Data synchronization service for migrating local data to database
 */
export class DataSyncService {
  constructor() {
    this.localStrategy = new LocalStorageStrategy();
  }

  /**
   * Check if user has local data that needs migration (optimized)
   */
  async hasLocalData() {
    try {
      // Use optimized method that doesn't load full data
      return await this.localStrategy.hasAnyData();
    } catch (error) {
      console.error('Error checking local data:', error);
      return false;
    }
  }

  /**
   * Get summary of local data for migration preview
   */
  async getLocalDataSummary() {
    try {
      const localData = await this.localStrategy.getAllData();
      return {
        calculations: localData.calculations?.length || 0,
        favorites: localData.favorites?.length || 0,
        hasSettings: localData.settings?.length > 0
      };
    } catch (error) {
      console.error('Error getting local data summary:', error);
      return { calculations: 0, favorites: 0, hasSettings: false };
    }
  }

  /**
   * Migrate all local data to database
   */
  async migrateToDatabase(onProgress = null) {
    const { user, isAuthenticated } = useFirebaseAuthStore.getState();
    
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to migrate data');
    }

    try {
      const dbStrategy = new DatabaseStrategy(db, useFirebaseAuthStore);
      const localData = await this.localStrategy.getAllData();
      
      let totalItems = 0;
      let processedItems = 0;
      
      // Count total items
      totalItems += localData.calculations?.length || 0;
      totalItems += localData.favorites?.length || 0;
      totalItems += localData.settings?.length || 0;
      
      if (totalItems === 0) {
        return { success: true, migrated: 0 };
      }

      const updateProgress = () => {
        if (onProgress) {
          onProgress({
            processed: processedItems,
            total: totalItems,
            percentage: Math.round((processedItems / totalItems) * 100)
          });
        }
      };

      // Migrate calculations
      if (localData.calculations?.length > 0) {
        for (const calc of localData.calculations) {
          try {
            // Remove local ID to let database generate new one
            const { id, ...calcData } = calc;
            await dbStrategy.save('calculations', calcData);
            processedItems++;
            updateProgress();
          } catch (error) {
            console.error('Error migrating calculation:', error);
            // Continue with other items even if one fails
          }
        }
      }

      // Migrate favorites
      if (localData.favorites?.length > 0) {
        for (const fav of localData.favorites) {
          try {
            const { id, ...favData } = fav;
            await dbStrategy.save('favorites', favData);
            processedItems++;
            updateProgress();
          } catch (error) {
            console.error('Error migrating favorite:', error);
          }
        }
      }

      // Migrate settings
      if (localData.settings?.length > 0) {
        try {
          const settings = localData.settings[0];
          const { id, ...settingsData } = settings;
          await dbStrategy.save('settings', settingsData);
          processedItems++;
          updateProgress();
        } catch (error) {
          console.error('Error migrating settings:', error);
        }
      }

      return {
        success: true,
        migrated: processedItems,
        total: totalItems
      };
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  /**
   * Clear local data after successful migration
   */
  async clearLocalData() {
    try {
      await this.localStrategy.clear('calculations');
      await this.localStrategy.clear('favorites');
      await this.localStrategy.clear('settings');
      return true;
    } catch (error) {
      console.error('Error clearing local data:', error);
      return false;
    }
  }

  /**
   * Backup local data before migration
   */
  async backupLocalData() {
    try {
      const localData = await this.localStrategy.getAllData();
      const backup = {
        timestamp: new Date().toISOString(),
        data: localData
      };
      
      // Store backup in a separate local storage key
      localStorage.setItem('chicken-feed-backup', JSON.stringify(backup));
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup() {
    try {
      const backupStr = localStorage.getItem('chicken-feed-backup');
      if (!backupStr) {
        throw new Error('No backup found');
      }
      
      const backup = JSON.parse(backupStr);
      const { data } = backup;
      
      // Restore each data type
      if (data.calculations?.length > 0) {
        localStorage.setItem('chicken-feed-calculations', JSON.stringify(data.calculations));
      }
      
      if (data.favorites?.length > 0) {
        localStorage.setItem('chicken-feed-favorites', JSON.stringify(data.favorites));
      }
      
      if (data.settings?.length > 0) {
        localStorage.setItem('chicken-feed-settings', JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Sync data from database to local cache for offline access
   */
  async syncFromDatabase() {
    const { isAuthenticated } = useFirebaseAuthStore.getState();
    
    if (!isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const dbStrategy = new DatabaseStrategy(db, useFirebaseAuthStore);
      
      // Fetch all data from database
      const [calculations, favorites, settings] = await Promise.all([
        dbStrategy.list('calculations'),
        dbStrategy.list('favorites'),
        dbStrategy.list('settings')
      ]);
      
      // Cache in local storage for offline access
      const cacheKey = 'chicken-feed-cache';
      const cacheData = {
        timestamp: new Date().toISOString(),
        calculations,
        favorites,
        settings
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return {
        success: true,
        cached: {
          calculations: calculations.length,
          favorites: favorites.length,
          settings: settings.length
        }
      };
    } catch (error) {
      console.error('Error syncing from database:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load cached data for offline access
   */
  async loadCachedData() {
    try {
      const cacheStr = localStorage.getItem('chicken-feed-cache');
      if (!cacheStr) {
        return null;
      }
      
      const cache = JSON.parse(cacheStr);
      
      // Check if cache is not too old (24 hours)
      const cacheAge = new Date() - new Date(cache.timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (cacheAge > maxAge) {
        localStorage.removeItem('chicken-feed-cache');
        return null;
      }
      
      return {
        calculations: cache.calculations || [],
        favorites: cache.favorites || [],
        settings: cache.settings || []
      };
    } catch (error) {
      console.error('Error loading cached data:', error);
      return null;
    }
  }

  /**
   * Handle conflict resolution when data exists in both local and database
   */
  async resolveConflicts(strategy = 'merge') {
    const { isAuthenticated } = useFirebaseAuthStore.getState();
    
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to resolve conflicts');
    }

    try {
      const localData = await this.localStrategy.getAllData();
      const dbStrategy = new DatabaseStrategy(db, useFirebaseAuthStore);
      
      const [dbCalculations, dbFavorites, dbSettings] = await Promise.all([
        dbStrategy.list('calculations'),
        dbStrategy.list('favorites'),
        dbStrategy.list('settings')
      ]);
      
      const conflicts = {
        calculations: [],
        favorites: [],
        settings: []
      };
      
      // Find conflicting calculations (same name or similar data)
      if (localData.calculations?.length > 0) {
        for (const localCalc of localData.calculations) {
          const conflict = dbCalculations.find(dbCalc => 
            dbCalc.name === localCalc.name ||
            (dbCalc.birdType === localCalc.birdType && 
             dbCalc.breed === localCalc.breed &&
             dbCalc.ageInDays === localCalc.ageInDays &&
             dbCalc.quantity === localCalc.quantity)
          );
          
          if (conflict) {
            conflicts.calculations.push({ local: localCalc, database: conflict });
          }
        }
      }
      
      // Apply resolution strategy
      switch (strategy) {
        case 'merge':
          return await this._mergeConflicts(conflicts, dbStrategy);
        case 'local_wins':
          return await this._localWinsConflicts(conflicts, dbStrategy);
        case 'database_wins':
          return await this._databaseWinsConflicts(conflicts);
        default:
          throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      throw error;
    }
  }

  async _mergeConflicts(conflicts, dbStrategy) {
    // Merge strategy: keep both, rename duplicates
    let resolved = 0;
    
    for (const conflict of conflicts.calculations) {
      const { local } = conflict;
      const renamedLocal = {
        ...local,
        name: `${local.name} (Local Copy)`,
        id: undefined // Let database generate new ID
      };
      
      await dbStrategy.save('calculations', renamedLocal);
      resolved++;
    }
    
    return { strategy: 'merge', resolved };
  }

  async _localWinsConflicts(conflicts, dbStrategy) {
    // Local wins: update database with local data
    let resolved = 0;
    
    for (const conflict of conflicts.calculations) {
      const { local, database } = conflict;
      await dbStrategy.update('calculations', database.id, local);
      resolved++;
    }
    
    return { strategy: 'local_wins', resolved };
  }

  async _databaseWinsConflicts(conflicts) {
    // Database wins: keep database data, ignore local conflicts
    return { strategy: 'database_wins', resolved: conflicts.calculations.length };
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Export utility functions
export const checkMigrationNeeded = async () => {
  return await dataSyncService.hasLocalData();
};

export const getLocalDataSummary = async () => {
  return await dataSyncService.getLocalDataSummary();
};

export const migrateLocalData = async (onProgress) => {
  return await dataSyncService.migrateToDatabase(onProgress);
};