import { 
  saveCalculation, 
  getUserCalculations, 
  deleteCalculation,
  addCustomFeed,
  getUserCustomFeeds,
  updateCustomFeed,
  deleteCustomFeed,
  addLocalMix,
  getUserLocalMixes,
  updateLocalMix,
  deleteLocalMix,
  getUserProfile,
  updateUserProfile,
  saveUserProfile
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
      return await getUserProfile(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Feed calculation operations
  async saveCalculation(calculationData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await saveCalculation(calculationData);
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error;
    }
  }

  async getUserCalculations() {
    if (!this.isAvailable()) return [];
    
    try {
      return await getUserCalculations();
    } catch (error) {
      console.error('Error fetching calculations:', error);
      return [];
    }
  }

  async deleteCalculation(calculationId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await deleteCalculation(calculationId);
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw error;
    }
  }

  // Custom feeds operations
  async addCustomFeed(feedData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await addCustomFeed(feedData);
    } catch (error) {
      console.error('Error adding custom feed:', error);
      throw error;
    }
  }

  async getUserCustomFeeds() {
    if (!this.isAvailable()) return [];
    
    try {
      return await getUserCustomFeeds();
    } catch (error) {
      console.error('Error fetching custom feeds:', error);
      return [];
    }
  }

  async updateCustomFeed(feedId, changes) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await updateCustomFeed(feedId, changes);
    } catch (error) {
      console.error('Error updating custom feed:', error);
      throw error;
    }
  }

  async deleteCustomFeed(feedId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await deleteCustomFeed(feedId);
    } catch (error) {
      console.error('Error deleting custom feed:', error);
      throw error;
    }
  }

  // Custom local mixes operations
  async addLocalMix(mixData) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await addLocalMix(mixData);
    } catch (error) {
      console.error('Error adding local mix:', error);
      throw error;
    }
  }

  async getUserLocalMixes() {
    if (!this.isAvailable()) return [];
    
    try {
      return await getUserLocalMixes();
    } catch (error) {
      console.error('Error fetching local mixes:', error);
      return [];
    }
  }

  async updateLocalMix(mixId, changes) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await updateLocalMix(mixId, changes);
    } catch (error) {
      console.error('Error updating local mix:', error);
      throw error;
    }
  }

  async deleteLocalMix(mixId) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await deleteLocalMix(mixId);
    } catch (error) {
      console.error('Error deleting local mix:', error);
      throw error;
    }
  }

  // User preferences operations
  async saveUserPreferences(preferences) {
    if (!this.isAvailable()) throw new Error('Database not available');
    
    try {
      return await saveUserProfile({ preferences });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
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