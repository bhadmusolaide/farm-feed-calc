import { useUnifiedStore } from './unifiedStore';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

// Get store instance for non-React usage
const getUnifiedStoreState = () => useUnifiedStore.getState();

/**
 * Migration utilities to help users migrate from local storage to Firebase database
 */

// Check if user has local data that needs migration
export const hasLocalDataToMigrate = () => {
  try {
    // Check for feed calculations
    const feedData = localStorage.getItem('feed-storage');
    const feedState = feedData ? JSON.parse(feedData) : null;
    const hasFeedCalculations = feedState?.state?.savedCalculations?.length > 0;
    
    // Check for custom feeds
    const feedMgmtData = localStorage.getItem('feed-management-storage');
    const feedMgmtState = feedMgmtData ? JSON.parse(feedMgmtData) : null;
    const hasCustomFeeds = feedMgmtState?.state?.feeds && 
      Object.values(feedMgmtState.state.feeds).some(category => 
        category.some(feed => feed.isCustom)
      );
    
    // Check for modified local mixes
    const hasModifiedMixes = feedMgmtState?.state?.localMixes && 
      Object.values(feedMgmtState.state.localMixes).some(mix => mix.isCustom);
    
    // Check for knowledge favorites
    const knowledgeData = localStorage.getItem('knowledge-storage');
    const knowledgeState = knowledgeData ? JSON.parse(knowledgeData) : null;
    const hasFavorites = knowledgeState?.state?.favorites?.length > 0;
    
    return {
      hasFeedCalculations,
      hasCustomFeeds,
      hasModifiedMixes,
      hasFavorites,
      hasAnyData: hasFeedCalculations || hasCustomFeeds || hasModifiedMixes || hasFavorites
    };
  } catch (error) {
    console.error('Error checking local data:', error);
    return {
      hasFeedCalculations: false,
      hasCustomFeeds: false,
      hasModifiedMixes: false,
      hasFavorites: false,
      hasAnyData: false
    };
  }
};

// Migrate feed calculations
export const migrateFeedCalculations = async () => {
  const { user } = useFirebaseAuthStore.getState();
  if (!user) {
    throw new Error('User must be authenticated to migrate data');
  }
  
  const unifiedStore = getUnifiedStoreState();
  const savedCalculations = unifiedStore.savedCalculations || [];
  
  const migrationResults = {
    total: savedCalculations.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const calculation of savedCalculations) {
    try {
      await db.saveFeedCalculation({
        birdType: calculation.birdType,
        ageInDays: calculation.ageInDays,
        quantity: calculation.quantity,
        results: calculation.results,
        timestamp: calculation.timestamp || new Date().toISOString(),
        name: calculation.name || `Calculation ${new Date(calculation.timestamp).toLocaleDateString()}`
      });
      migrationResults.successful++;
    } catch (error) {
      migrationResults.failed++;
      migrationResults.errors.push({
        calculation: calculation.name || 'Unnamed calculation',
        error: error.message
      });
    }
  }
  
  return migrationResults;
};

// Migrate custom feeds
export const migrateCustomFeeds = async () => {
  const { user } = useFirebaseAuthStore.getState();
  if (!user) {
    throw new Error('User must be authenticated to migrate data');
  }
  
  const unifiedStore = getUnifiedStoreState();
  const feeds = unifiedStore.customFeeds || {};
  
  const migrationResults = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  // Extract custom feeds from all categories
  for (const [category, categoryFeeds] of Object.entries(feeds)) {
    const customFeeds = categoryFeeds.filter(feed => feed.isCustom);
    migrationResults.total += customFeeds.length;
    
    for (const feed of customFeeds) {
      try {
        const { isCustom, ...feedData } = feed; // Remove isCustom flag
        await db.addCustomFeed({
          category,
          ...feedData
        });
        migrationResults.successful++;
      } catch (error) {
        migrationResults.failed++;
        migrationResults.errors.push({
          feed: `${feed.brand} ${feed.name}`,
          category,
          error: error.message
        });
      }
    }
  }
  
  return migrationResults;
};

// Migrate local mixes
export const migrateLocalMixes = async () => {
  const { user } = useFirebaseAuthStore.getState();
  if (!user) {
    throw new Error('User must be authenticated to migrate data');
  }
  
  const unifiedStore = getUnifiedStoreState();
  const localMixes = unifiedStore.localMixes || {};
  
  const migrationResults = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  // Extract modified local mixes
  for (const [category, mix] of Object.entries(localMixes)) {
    if (mix.isCustom) {
      migrationResults.total++;
      
      try {
        const { isCustom, ...mixData } = mix; // Remove isCustom flag
        await db.addLocalMix({
          category,
          ...mixData
        });
        migrationResults.successful++;
      } catch (error) {
        migrationResults.failed++;
        migrationResults.errors.push({
          mix: `${category} mix`,
          error: error.message
        });
      }
    }
  }
  
  return migrationResults;
};

// Migrate knowledge favorites
export const migrateFavorites = async () => {
  const { user } = useFirebaseAuthStore.getState();
  if (!user) {
    throw new Error('User must be authenticated to migrate data');
  }
  
  const unifiedStore = getUnifiedStoreState();
  const favorites = unifiedStore.favorites || [];
  
  if (favorites.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }
  
  try {
    // Get existing preferences or create new ones
    const existingPreferences = await db.getUserPreferences() || {};
    const existingFavorites = existingPreferences.favorites || [];
    
    // Merge favorites (avoid duplicates)
    const mergedFavorites = [...new Set([...existingFavorites, ...favorites])];
    
    // Update preferences
    await db.updateUserPreferences({
      ...existingPreferences,
      favorites: mergedFavorites
    });
    
    return {
      total: favorites.length,
      successful: favorites.length,
      failed: 0,
      errors: []
    };
  } catch (error) {
    return {
      total: favorites.length,
      successful: 0,
      failed: favorites.length,
      errors: [{ favorites: 'All favorites', error: error.message }]
    };
  }
};

// Complete migration process
export const migrateAllData = async (onProgress) => {
  if (!db.isAuthenticated()) {
    throw new Error('User must be authenticated to migrate data');
  }
  
  const migrationSteps = [
    { name: 'Feed Calculations', fn: migrateFeedCalculations },
    { name: 'Custom Feeds', fn: migrateCustomFeeds },
    { name: 'Local Mixes', fn: migrateLocalMixes },
    { name: 'Favorites', fn: migrateFavorites }
  ];
  
  const overallResults = {
    steps: {},
    totalItems: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    allErrors: []
  };
  
  for (let i = 0; i < migrationSteps.length; i++) {
    const step = migrationSteps[i];
    
    try {
      if (onProgress) {
        onProgress({
          step: step.name,
          current: i + 1,
          total: migrationSteps.length,
          status: 'running'
        });
      }
      
      const result = await step.fn();
      overallResults.steps[step.name] = result;
      overallResults.totalItems += result.total;
      overallResults.totalSuccessful += result.successful;
      overallResults.totalFailed += result.failed;
      overallResults.allErrors.push(...result.errors);
      
      if (onProgress) {
        onProgress({
          step: step.name,
          current: i + 1,
          total: migrationSteps.length,
          status: 'completed',
          result
        });
      }
    } catch (error) {
      const errorResult = {
        total: 0,
        successful: 0,
        failed: 1,
        errors: [{ step: step.name, error: error.message }]
      };
      
      overallResults.steps[step.name] = errorResult;
      overallResults.totalFailed += 1;
      overallResults.allErrors.push(...errorResult.errors);
      
      if (onProgress) {
        onProgress({
          step: step.name,
          current: i + 1,
          total: migrationSteps.length,
          status: 'failed',
          error: error.message
        });
      }
    }
  }
  
  return overallResults;
};

// Clear local storage after successful migration
export const clearLocalStorageAfterMigration = () => {
  try {
    // Clear feed calculations
    const feedData = localStorage.getItem('feed-storage');
    if (feedData) {
      const feedState = JSON.parse(feedData);
      if (feedState.state) {
        feedState.state.savedCalculations = [];
        localStorage.setItem('feed-storage', JSON.stringify(feedState));
      }
    }
    
    // Clear custom feeds and mixes
    const feedMgmtData = localStorage.getItem('feed-management-storage');
    if (feedMgmtData) {
      const feedMgmtState = JSON.parse(feedMgmtData);
      if (feedMgmtState.state) {
        // Reset to default feeds and mixes
        feedMgmtState.state.feeds = {};
        feedMgmtState.state.localMixes = {};
        localStorage.setItem('feed-management-storage', JSON.stringify(feedMgmtState));
      }
    }
    
    // Clear knowledge favorites
    const knowledgeData = localStorage.getItem('knowledge-storage');
    if (knowledgeData) {
      const knowledgeState = JSON.parse(knowledgeData);
      if (knowledgeState.state) {
        knowledgeState.state.favorites = [];
        localStorage.setItem('knowledge-storage', JSON.stringify(knowledgeState));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return false;
  }
};

// Get migration summary for display
export const getMigrationSummary = () => {
  const localData = hasLocalDataToMigrate();
  
  const summary = [];
  
  if (localData.hasFeedCalculations) {
    const unifiedStore = getUnifiedStoreState();
    const count = unifiedStore.savedCalculations?.length || 0;
    summary.push(`${count} saved feed calculation${count !== 1 ? 's' : ''}`);
  }
  
  if (localData.hasCustomFeeds) {
    const unifiedStore = getUnifiedStoreState();
    const feeds = unifiedStore.customFeeds || {};
    const customFeedCount = Object.values(feeds)
      .flat()
      .filter(feed => feed.isCustom).length;
    summary.push(`${customFeedCount} custom feed${customFeedCount !== 1 ? 's' : ''}`);
  }
  
  if (localData.hasModifiedMixes) {
    const unifiedStore = getUnifiedStoreState();
    const localMixes = unifiedStore.localMixes || {};
    const modifiedMixCount = Object.values(localMixes)
      .filter(mix => mix.isCustom).length;
    summary.push(`${modifiedMixCount} modified local mix${modifiedMixCount !== 1 ? 'es' : ''}`);
  }
  
  if (localData.hasFavorites) {
    const unifiedStore = getUnifiedStoreState();
    const count = unifiedStore.favorites?.length || 0;
    summary.push(`${count} favorite knowledge item${count !== 1 ? 's' : ''}`);
  }
  
  return {
    hasData: localData.hasAnyData,
    summary: summary.join(', '),
    details: localData
  };
};