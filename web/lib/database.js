import { 
  feedCalculationsDB,
  customFeedsDB,
  customLocalMixesDB,
  userProfilesDB
} from './firebaseDatabase';
import useFirebaseAuthStore from './firebaseAuthStore';

// Database operations class
export class DatabaseService {
  constructor() {
    this.isConfigured = true; // Firebase is always available
  }

  // Helper method to check if database operations are available
  isAvailable() {
    return this.isConfigured;
  }

  // User operations
  async getUserProfile(userId) {
    if (!this.isAvailable()) return null;
    
    try {
      const result = await userProfilesDB.get(userId);
      return result.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Feed calculation operations
  async saveCalculation(calculationData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      const result = await feedCalculationsDB.save(user.id, calculationData);
      
      if (result.error) {
        throw result.error;
      }
      
      if (!result.id) {
        throw new Error('Failed to save calculation - no ID returned');
      }
      
      return result;
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  }

  async getUserCalculations() {
    if (!this.isAvailable()) {
      console.log('🚫 Database not available');
      return [];
    }
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) {
        console.log('🚫 No user for getUserCalculations');
        return [];
      }
      console.log('🔍 Getting calculations for user:', user.id);
      const result = await feedCalculationsDB.getByUser(user.id);
      console.log('📋 Database result:', result);
      
      // Transform the data to match the expected format
      const transformedData = (result.data || []).map(calculation => {
        const transformed = { ...calculation };
        
        // Map created_at to savedAt for compatibility with SavedResults component
        if (calculation.created_at && !calculation.savedAt) {
          // Handle Firestore Timestamp objects
          if (calculation.created_at.toDate) {
            transformed.savedAt = calculation.created_at.toDate().toISOString();
          } else if (calculation.created_at.seconds) {
            // Handle Firestore timestamp format
            transformed.savedAt = new Date(calculation.created_at.seconds * 1000).toISOString();
          } else {
            // Handle string timestamps
            transformed.savedAt = calculation.created_at;
          }
        }
        
        return transformed;
      });
      
      return transformedData;
    } catch (error) {
      console.error('❌ Error fetching calculations:', error);
      return [];
    }
  }

  async deleteCalculation(calculationId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await feedCalculationsDB.delete(calculationId);
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  }

  async updateCalculation(calculationId, updates) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await feedCalculationsDB.update(calculationId, updates);
    } catch (error) {
      console.error('Error updating calculation:', error);
      throw error;
    }
  }

  // Custom feeds operations
  async addCustomFeed(feedData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      return await customFeedsDB.save(user.id, feedData);
    } catch (error) {
      console.error('Error adding custom feed:', error);
      throw error;
    }
  }

  async getUserCustomFeeds() {
    if (!this.isAvailable()) return [];
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) return [];
      const result = await customFeedsDB.getByUser(user.id);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching custom feeds:', error);
      return [];
    }
  }

  async updateCustomFeed(feedId, changes) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await customFeedsDB.update(feedId, changes);
    } catch (error) {
      console.error('Error updating custom feed:', error);
      throw error;
    }
  }

  async deleteCustomFeed(feedId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await customFeedsDB.delete(feedId);
    } catch (error) {
      console.error('Error deleting custom feed:', error);
      throw error;
    }
  }

  // Custom local mixes operations
  async addLocalMix(mixData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      return await customLocalMixesDB.save(user.id, mixData);
    } catch (error) {
      console.error('Error adding local mix:', error);
      throw error;
    }
  }

  async getUserLocalMixes() {
    if (!this.isAvailable()) return [];
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) return [];
      const result = await customLocalMixesDB.getByUser(user.id);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching local mixes:', error);
      return [];
    }
  }

  async updateLocalMix(mixId, changes) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await customLocalMixesDB.update(mixId, changes);
    } catch (error) {
      console.error('Error updating local mix:', error);
      throw error;
    }
  }

  async deleteLocalMix(mixId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await customLocalMixesDB.delete(mixId);
    } catch (error) {
      console.error('Error deleting local mix:', error);
      throw error;
    }
  }

  // User preferences operations
  async saveUserPreferences(preferences) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      return await userProfilesDB.update(user.id, { preferences });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences() {
    if (!this.isAvailable()) return null;
    
    try {
      const { user } = useFirebaseAuthStore.getState();
      if (!user) return null;
      const profile = await userProfilesDB.get(user.id);
      return profile?.data?.preferences || {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  async updateUserPreferences(preferences) {
    return await this.saveUserPreferences(preferences);
  }

  // Migration-specific method alias
  async saveFeedCalculation(calculationData) {
    return await this.saveCalculation(calculationData);
  }

  // Utility methods
  isAuthenticated() {
    const { user } = useFirebaseAuthStore.getState();
    return !!user;
  }

  getCurrentUser() {
    const { user } = useFirebaseAuthStore.getState();
    return user;
  }

  // Sync localStorage data to database (migration helper)
  async syncLocalStorageToDatabase() {
    try {
      if (!this.isAuthenticated()) {
        console.log('User not authenticated, skipping sync');
        return;
      }

      // Sync feed management data
      const feedManagementData = localStorage.getItem('feed-management-storage');
      if (feedManagementData) {
        const parsed = JSON.parse(feedManagementData);
        const { feeds, localMixes } = parsed.state;

        // Sync custom feeds
        for (const [category, feedList] of Object.entries(feeds)) {
          for (const feed of feedList) {
            if (feed.isCustom) {
              await this.addCustomFeed({
                category,
                ...feed
              });
            }
          }
        }

        // Sync custom local mixes
        for (const [category, mix] of Object.entries(localMixes)) {
          if (mix.isCustom) {
            await this.addLocalMix({
              category,
              ...mix
            });
          }
        }
      }

      console.log('Successfully synced localStorage data to database');
    } catch (error) {
      console.error('Error syncing localStorage to database:', error);
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();