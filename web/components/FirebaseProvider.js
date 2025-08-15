'use client';

import { useEffect } from 'react';
import useFirebaseAuthStore from '../lib/firebaseAuthStore';

export default function FirebaseProvider({ children }) {
  const initializeAuth = useFirebaseAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize Firebase auth state listener
    const unsubscribe = initializeAuth();
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  return <>{children}</>;
}