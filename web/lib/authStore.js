import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple authentication store with enhanced security features
export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      loginAttempts: 0,
      lastLoginAttempt: null,
      sessionExpiry: null,
      
      // Enhanced login function with rate limiting
      login: (password) => {
        const state = get();
        const now = Date.now();
        
        // Rate limiting: max 5 attempts per 15 minutes
        if (state.loginAttempts >= 5) {
          const timeSinceLastAttempt = now - (state.lastLoginAttempt || 0);
          const lockoutDuration = 15 * 60 * 1000; // 15 minutes
          
          if (timeSinceLastAttempt < lockoutDuration) {
            const remainingTime = Math.ceil((lockoutDuration - timeSinceLastAttempt) / 60000);
            return { 
              success: false, 
              error: `Too many failed attempts. Try again in ${remainingTime} minutes.` 
            };
          } else {
            // Reset attempts after lockout period
            set({ loginAttempts: 0, lastLoginAttempt: null });
          }
        }
        
        // Environment-based password with fallback
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
        
        if (password === correctPassword) {
          // Set session expiry to 2 hours from now
          const sessionExpiry = now + (2 * 60 * 60 * 1000);
          
          set({ 
            isAuthenticated: true, 
            loginAttempts: 0, 
            lastLoginAttempt: null,
            sessionExpiry 
          });
          return { success: true };
        } else {
          set({ 
            loginAttempts: state.loginAttempts + 1, 
            lastLoginAttempt: now 
          });
          return { success: false, error: 'Invalid password' };
        }
      },
      
      // Check if session is still valid
      checkSession: () => {
        const state = get();
        if (state.isAuthenticated && state.sessionExpiry) {
          if (Date.now() > state.sessionExpiry) {
            // Session expired, logout
            set({ isAuthenticated: false, sessionExpiry: null });
            return false;
          }
        }
        return state.isAuthenticated;
      },
      
      // Extend session (call on user activity)
      extendSession: () => {
        const state = get();
        if (state.isAuthenticated) {
          const newExpiry = Date.now() + (2 * 60 * 60 * 1000); // Extend by 2 hours
          set({ sessionExpiry: newExpiry });
        }
      },
      
      // Logout function
      logout: () => {
        set({ 
          isAuthenticated: false, 
          sessionExpiry: null 
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt,
        sessionExpiry: state.sessionExpiry
      })
    }
  )
);