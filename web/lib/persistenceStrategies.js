// Persistence Strategy Pattern for handling local storage vs database operations

/**
 * Base persistence strategy interface
 */
class PersistenceStrategy {
  async save(key, data) {
    throw new Error('save method must be implemented');
  }

  async load(key) {
    throw new Error('load method must be implemented');
  }

  async delete(key, id) {
    throw new Error('delete method must be implemented');
  }

  async list(key) {
    throw new Error('list method must be implemented');
  }

  async update(key, id, updates) {
    throw new Error('update method must be implemented');
  }

  isAvailable() {
    return true;
  }
}

/**
 * Local storage persistence strategy for unauthenticated users
 */
export class LocalStorageStrategy extends PersistenceStrategy {
  constructor() {
    super();
    this.prefix = 'chicken-feed-';
  }

  _getStorageKey(key) {
    return `${this.prefix}${key}`;
  }

  _generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async save(key, data) {
    try {
      const storageKey = this._getStorageKey(key);
      // Ensure we have an array from storage (list is async; await it)
      const existing = await this.list(key);
      const id = data.id || this._generateId();
      
      const item = {
        ...data,
        id,
        savedAt: data.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Guard against corrupted storage (non-array)
      const base = Array.isArray(existing) ? existing : [];
      const items = base.filter(entry => entry && entry.id !== id);
      items.unshift(item);
      
      localStorage.setItem(storageKey, JSON.stringify(items));
      return { id, ...item };
    } catch (error) {
      console.error('LocalStorage save error:', error);
      throw new Error('Failed to save to local storage');
    }
  }

  async load(key, id) {
    try {
      const items = await this.list(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return null;
    }
  }

  async delete(key, id) {
    try {
      const storageKey = this._getStorageKey(key);
      const items = await this.list(key);
      const filtered = (Array.isArray(items) ? items : []).filter(item => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('LocalStorage delete error:', error);
      throw new Error('Failed to delete from local storage');
    }
  }

  async list(key) {
    try {
      const storageKey = this._getStorageKey(key);
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      // Ensure array return even if corrupted
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('LocalStorage list error:', error);
      return [];
    }
  }

  async update(key, id, updates) {
    try {
      const item = await this.load(key, id);
      if (!item) {
        throw new Error('Item not found');
      }
      
      const updatedItem = {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return await this.save(key, updatedItem);
    } catch (error) {
      console.error('LocalStorage update error:', error);
      throw error;
    }
  }

  async clear(key) {
    try {
      const storageKey = this._getStorageKey(key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }

  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all data for migration purposes
  async getAllData() {
    const data = {};
    const keys = ['calculations', 'favorites', 'settings'];
    
    for (const key of keys) {
      data[key] = await this.list(key);
    }
    
    return data;
  }
}

/**
 * Database persistence strategy for authenticated users
 */
export class DatabaseStrategy extends PersistenceStrategy {
  constructor(databaseService, authStore) {
    super();
    this.db = databaseService;
    this.authStore = authStore;
  }

  _requireAuth() {
    const { user } = this.authStore.getState();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  async save(key, data) {
    this._requireAuth();
    
    try {
      switch (key) {
        case 'calculations':
          return await this.db.saveCalculation(data);
        case 'customFeeds':
          return await this.db.addCustomFeed(data);
        case 'localMixes':
          return await this.db.addLocalMix(data);
        case 'settings':
          return await this.db.saveUserPreferences(data);
        default:
          throw new Error(`Unsupported key: ${key}`);
      }
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  }

  async load(key, id) {
    this._requireAuth();
    
    try {
      const items = await this.list(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Database load error:', error);
      return null;
    }
  }

  async delete(key, id) {
    this._requireAuth();
    
    try {
      switch (key) {
        case 'calculations':
          return await this.db.deleteCalculation(id);
        case 'customFeeds':
          return await this.db.deleteCustomFeed(id);
        case 'localMixes':
          return await this.db.deleteLocalMix(id);
        default:
          throw new Error(`Unsupported key: ${key}`);
      }
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  }

  async list(key) {
    this._requireAuth();
    
    try {
      switch (key) {
        case 'calculations':
          return await this.db.getUserCalculations();
        case 'customFeeds':
          return await this.db.getUserCustomFeeds();
        case 'localMixes':
          return await this.db.getUserLocalMixes();
        case 'settings':
          const user = this._requireAuth();
          const profile = await this.db.getUserProfile(user.id);
          return profile ? [profile] : [];
        default:
          return [];
      }
    } catch (error) {
      console.error('Database list error:', error);
      return [];
    }
  }

  async update(key, id, updates) {
    this._requireAuth();
    
    try {
      switch (key) {
        case 'calculations':
          return await this.db.updateCalculation(id, updates);
        case 'customFeeds':
          return await this.db.updateCustomFeed(id, updates);
        case 'localMixes':
          return await this.db.updateLocalMix(id, updates);
        default:
          throw new Error(`Unsupported key: ${key}`);
      }
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  isAvailable() {
    return this.db.isAvailable() && this.authStore.getState().isAuthenticated;
  }
}

/**
 * Factory for creating appropriate persistence strategy
 */
export class PersistenceStrategyFactory {
  static create(isAuthenticated, databaseService, authStore) {
    if (isAuthenticated && databaseService && authStore) {
      return new DatabaseStrategy(databaseService, authStore);
    }
    return new LocalStorageStrategy();
  }
}