// Firebase Authentication Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const useFirebaseAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      userProfile: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Actions
      signUp: async (email, password, displayName) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create user account
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update display name
          if (displayName) {
            await updateProfile(user, { displayName });
          }
          
          // Create user profile in Firestore
          const userProfileData = {
            id: user.uid,
            user_id: user.uid,
            display_name: displayName || user.displayName || '',
            avatar_url: user.photoURL || '',
            preferences: {},
            favorites: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'user_profiles', user.uid), userProfileData);
          
          set({ 
            user: {
              id: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            },
            userProfile: userProfileData,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return { user, error: null };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { user: null, error };
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Get user profile from Firestore
          const userProfileDoc = await getDoc(doc(db, 'user_profiles', user.uid));
          let userProfile = null;
          
          if (userProfileDoc.exists()) {
            userProfile = userProfileDoc.data();
          } else {
            // Create profile if it doesn't exist
            userProfile = {
              id: user.uid,
              user_id: user.uid,
              display_name: user.displayName || '',
              avatar_url: user.photoURL || '',
              preferences: {},
              favorites: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            await setDoc(doc(db, 'user_profiles', user.uid), userProfile);
          }
          
          set({ 
            user: {
              id: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            },
            userProfile,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return { user, error: null };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { user: null, error };
        }
      },

      signOut: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null, 
            userProfile: null,
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          return { error: null };
        } catch (error) {
          set({ error: error.message });
          return { error };
        }
      },

      resetPassword: async (email) => {
        try {
          await sendPasswordResetEmail(auth, email);
          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      updateUserProfile: async (updates) => {
        try {
          const { user, userProfile } = get();
          if (!user || !userProfile) return { error: new Error('No user logged in') };
          
          const updatedProfile = {
            ...userProfile,
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          await updateDoc(doc(db, 'user_profiles', user.id), updatedProfile);
          
          set({ userProfile: updatedProfile });
          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      // Initialize auth state listener
      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Get user profile from Firestore
            const userProfileDoc = await getDoc(doc(db, 'user_profiles', user.uid));
            let userProfile = null;
            
            if (userProfileDoc.exists()) {
              userProfile = userProfileDoc.data();
            }
            
            set({ 
              user: {
                id: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
              },
              userProfile,
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              userProfile: null,
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        });
        
        return unsubscribe;
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'firebase-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useFirebaseAuthStore;