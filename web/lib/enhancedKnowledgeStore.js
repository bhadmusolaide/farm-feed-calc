import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KNOWLEDGE_SNIPPETS, getWeeklyKnowledge } from '../../shared/data/knowledgeSnippets.js';
import { db } from './database';
import useFirebaseAuthStore from './firebaseAuthStore';

// Enhanced knowledge store with Firebase integration
export const useEnhancedKnowledgeStore = create(
  persist(
    (set, get) => ({
      // State
      weeklyKnowledge: KNOWLEDGE_SNIPPETS,
      currentWeeklyKnowledge: null,
      favorites: [], // Local favorites
      userFavorites: [], // Favorites from database
      userNotes: [], // User notes from database
      isLoading: false,
      isSyncing: false,
      error: null,
      syncError: null,

      // Initialize store - load user data from database
      initialize: async () => {
        const { user } = useFirebaseAuthStore.getState();
    if (!user) {
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Load user preferences which include favorites and notes
          const preferences = await db.getUserPreferences();
          
          if (preferences) {
            set({ 
              userFavorites: preferences.favorites || [],
              userNotes: preferences.notes || [],
              isLoading: false
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing knowledge store:', error);
          set({ isLoading: false, error: error.message });
        }
      },

      // Actions
      toggleFavorite: async (knowledgeId) => {
        const { favorites, userFavorites } = get();
        const isCurrentlyFavorite = favorites.includes(knowledgeId) || userFavorites.includes(knowledgeId);
        
        if (isCurrentlyFavorite) {
          // Remove from favorites
          set(state => ({
            favorites: state.favorites.filter(id => id !== knowledgeId)
          }));
          
          // Update database if authenticated
          const { user } = useFirebaseAuthStore.getState();
    if (user) {
            try {
              set({ isSyncing: true, syncError: null });
              const updatedFavorites = userFavorites.filter(id => id !== knowledgeId);
              await db.updateUserPreferences({ favorites: updatedFavorites });
              
              set({ 
                userFavorites: updatedFavorites,
                isSyncing: false
              });
            } catch (error) {
              console.error('Error removing favorite:', error);
              set({ isSyncing: false, syncError: error.message });
            }
          }
        } else {
          // Add to favorites
          set(state => ({
            favorites: [...state.favorites, knowledgeId]
          }));
          
          // Update database if authenticated
          const { user } = useFirebaseAuthStore.getState();
    if (user) {
            try {
              set({ isSyncing: true, syncError: null });
              const updatedFavorites = [...userFavorites, knowledgeId];
              await db.updateUserPreferences({ favorites: updatedFavorites });
              
              set({ 
                userFavorites: updatedFavorites,
                isSyncing: false
              });
            } catch (error) {
              console.error('Error adding favorite:', error);
              set({ isSyncing: false, syncError: error.message });
            }
          }
        }
      },

      // Add to favorites (for compatibility with components expecting this method)
      addToFavorites: async (knowledgeId) => {
        const { favorites, userFavorites } = get();
        const isAlreadyFavorite = favorites.includes(knowledgeId) || userFavorites.includes(knowledgeId);
        
        if (!isAlreadyFavorite) {
          await get().toggleFavorite(knowledgeId);
        }
      },

      // Remove from favorites (for compatibility with components expecting this method)
      removeFromFavorites: async (knowledgeId) => {
        const { favorites, userFavorites } = get();
        const isCurrentlyFavorite = favorites.includes(knowledgeId) || userFavorites.includes(knowledgeId);
        
        if (isCurrentlyFavorite) {
          await get().toggleFavorite(knowledgeId);
        }
      },

      addNote: async (knowledgeId, noteText) => {
        const newNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          knowledgeId,
          text: noteText,
          createdAt: new Date().toISOString()
        };
        
        // Add to local state immediately
        set(state => ({
          userNotes: [...state.userNotes, newNote]
        }));
        
        // Save to database if authenticated
        const { user } = useFirebaseAuthStore.getState();
    if (user) {
          try {
            set({ isSyncing: true, syncError: null });
            const updatedNotes = [...get().userNotes];
            await db.updateUserPreferences({ notes: updatedNotes });
            
            set({ isSyncing: false });
            return newNote.id;
          } catch (error) {
            console.error('Error saving note:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
        
        return newNote.id;
      },

      updateNote: async (noteId, noteText) => {
        // Update local state immediately
        set(state => ({
          userNotes: state.userNotes.map(note => 
            note.id === noteId 
              ? { ...note, text: noteText, updatedAt: new Date().toISOString() }
              : note
          )
        }));
        
        // Update database if authenticated
        const { user } = useFirebaseAuthStore.getState();
    if (user) {
          try {
            set({ isSyncing: true, syncError: null });
            const updatedNotes = get().userNotes;
            await db.updateUserPreferences({ notes: updatedNotes });
            
            set({ isSyncing: false });
          } catch (error) {
            console.error('Error updating note:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
      },

      deleteNote: async (noteId) => {
        // Remove from local state immediately
        set(state => ({
          userNotes: state.userNotes.filter(note => note.id !== noteId)
        }));
        
        // Update database if authenticated
        const { user } = useFirebaseAuthStore.getState();
    if (user) {
          try {
            set({ isSyncing: true, syncError: null });
            const updatedNotes = get().userNotes;
            await db.updateUserPreferences({ notes: updatedNotes });
            
            set({ isSyncing: false });
          } catch (error) {
            console.error('Error deleting note:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
      },

      // Getters
      getKnowledgeById: (id) => {
        return get().weeklyKnowledge.find(item => item.id === id);
      },

      getKnowledgeByWeek: (week) => {
        return get().weeklyKnowledge.find(item => item.week === week);
      },

      getFavorites: () => {
        const { favorites, userFavorites, weeklyKnowledge } = get();
        const allFavoriteIds = [...new Set([...favorites, ...userFavorites])];
        return weeklyKnowledge.filter(item => allFavoriteIds.includes(item.id));
      },

      isFavorite: (knowledgeId) => {
        const { favorites, userFavorites } = get();
        return favorites.includes(knowledgeId) || userFavorites.includes(knowledgeId);
      },

      getNotesForKnowledge: (knowledgeId) => {
        return get().userNotes.filter(note => note.knowledgeId === knowledgeId);
      },

      getAllNotes: () => {
        return get().userNotes;
      },

      // Search functionality
      searchKnowledge: (query) => {
        const { weeklyKnowledge } = get();
        const lowercaseQuery = query.toLowerCase();
        
        return weeklyKnowledge.filter(item => 
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.content.toLowerCase().includes(lowercaseQuery) ||
          item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
          item.category?.toLowerCase().includes(lowercaseQuery)
        );
      },

      // Filter by category
      getKnowledgeByCategory: (category) => {
        const { weeklyKnowledge } = get();
        return weeklyKnowledge.filter(item => item.category === category);
      },

      // Get knowledge by age range
      getKnowledgeByAgeRange: (ageInDays) => {
        const { weeklyKnowledge } = get();
        const week = Math.ceil(ageInDays / 7);
        
        return weeklyKnowledge.filter(item => {
          if (item.ageRange) {
            const [minAge, maxAge] = item.ageRange.split('-').map(age => parseInt(age));
            return ageInDays >= minAge && ageInDays <= maxAge;
          }
          return item.week <= week;
        });
      },

      // Get recent knowledge (last 4 weeks)
      getRecentKnowledge: () => {
        const { weeklyKnowledge } = get();
        const currentWeek = Math.ceil(Date.now() / (1000 * 60 * 60 * 24 * 7));
        
        return weeklyKnowledge
          .filter(item => item.week >= currentWeek - 4)
          .sort((a, b) => b.week - a.week);
      },

      // Sync local favorites to database
      syncLocalData: async () => {
        const { user } = useFirebaseAuthStore.getState();
    if (!user) {
          return;
        }
        
        const { favorites } = get();
        
        if (favorites.length > 0) {
          try {
            set({ isSyncing: true, syncError: null });
            
            // Get current user preferences
            const preferences = await db.getUserPreferences() || {};
            const existingFavorites = preferences.favorites || [];
            
            // Merge local favorites with existing ones
            const mergedFavorites = [...new Set([...existingFavorites, ...favorites])];
            
            // Update database
            await db.updateUserPreferences({ 
              ...preferences,
              favorites: mergedFavorites 
            });
            
            // Update state
            set({ 
              userFavorites: mergedFavorites,
              favorites: [], // Clear local favorites as they're now in database
              isSyncing: false
            });
          } catch (error) {
            console.error('Error syncing local data:', error);
            set({ isSyncing: false, syncError: error.message });
          }
        }
      },

      // Load weekly knowledge
      loadWeeklyKnowledge: (weekNumber) => {
        const weeklyKnowledge = getWeeklyKnowledge(weekNumber || 1);
        set({ currentWeeklyKnowledge: weeklyKnowledge });
      },

      // Clear errors
      clearError: () => set({ error: null }),
      clearSyncError: () => set({ syncError: null })
    }),
    {
      name: 'enhanced-knowledge-storage',
      version: 2,
      partialize: (state) => ({
        // Only persist local favorites and notes
        // User data will be loaded from database
        favorites: state.favorites,
        userNotes: [] // Don't persist notes locally
      })
    }
  )
);

// Helper functions for knowledge management
export const getKnowledgeCategories = () => {
  const knowledgeArray = Object.values(KNOWLEDGE_SNIPPETS);
  const categories = [...new Set(knowledgeArray.map(item => item.category).filter(Boolean))];
  return categories.sort();
};

export const getKnowledgeTags = () => {
  const knowledgeArray = Object.values(KNOWLEDGE_SNIPPETS);
  const tags = [...new Set(knowledgeArray.flatMap(item => item.tags || []))];
  return tags.sort();
};

export const formatKnowledgeDate = (week) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (startDate.getDay() + 7 * (week - 1)));
  return startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};