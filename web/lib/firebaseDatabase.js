// Firebase Database Operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Feed Calculations
export const feedCalculationsDB = {
  // Save a feed calculation
  save: async (userId, calculationData) => {
    try {
      const docRef = await addDoc(collection(db, 'feed_calculations'), {
        ...calculationData,
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  },

  // Get all calculations for a user
  getByUser: async (userId) => {
    try {
      console.log('🔍 Querying feed_calculations for user:', userId);
      const q = query(
        collection(db, 'feed_calculations'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      console.log('📊 Query snapshot size:', querySnapshot.size);
      const calculations = [];
      querySnapshot.forEach((doc) => {
        const docData = { id: doc.id, ...doc.data() };
        console.log('📄 Document:', docData);
        calculations.push(docData);
      });
      console.log('📋 Final calculations array:', calculations);
      return { data: calculations, error: null };
    } catch (error) {
      console.error('❌ Firestore query error:', error);
      return { data: [], error };
    }
  },

  // Update a calculation
  update: async (calculationId, updates) => {
    try {
      await updateDoc(doc(db, 'feed_calculations', calculationId), {
        ...updates,
        updated_at: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Delete a calculation
  delete: async (calculationId) => {
    try {
      await deleteDoc(doc(db, 'feed_calculations', calculationId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get a specific calculation
  getById: async (calculationId) => {
    try {
      const docSnap = await getDoc(doc(db, 'feed_calculations', calculationId));
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      } else {
        return { data: null, error: new Error('Calculation not found') };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Custom Feeds
export const customFeedsDB = {
  // Save a custom feed
  save: async (userId, feedData) => {
    try {
      const docRef = await addDoc(collection(db, 'custom_feeds'), {
        ...feedData,
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  },

  // Get all custom feeds for a user
  getByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'custom_feeds'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const feeds = [];
      querySnapshot.forEach((doc) => {
        feeds.push({ id: doc.id, ...doc.data() });
      });
      return { data: feeds, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get custom feeds by category
  getByCategory: async (userId, category) => {
    try {
      const q = query(
        collection(db, 'custom_feeds'),
        where('user_id', '==', userId),
        where('category', '==', category),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const feeds = [];
      querySnapshot.forEach((doc) => {
        feeds.push({ id: doc.id, ...doc.data() });
      });
      return { data: feeds, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Update a custom feed
  update: async (feedId, updates) => {
    try {
      await updateDoc(doc(db, 'custom_feeds', feedId), {
        ...updates,
        updated_at: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Delete a custom feed
  delete: async (feedId) => {
    try {
      await deleteDoc(doc(db, 'custom_feeds', feedId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Custom Local Mixes
export const customLocalMixesDB = {
  // Save a custom local mix
  save: async (userId, mixData) => {
    try {
      const docRef = await addDoc(collection(db, 'custom_local_mixes'), {
        ...mixData,
        user_id: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  },

  // Get all custom local mixes for a user
  getByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'custom_local_mixes'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const mixes = [];
      querySnapshot.forEach((doc) => {
        mixes.push({ id: doc.id, ...doc.data() });
      });
      return { data: mixes, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get custom local mixes by category
  getByCategory: async (userId, category) => {
    try {
      const q = query(
        collection(db, 'custom_local_mixes'),
        where('user_id', '==', userId),
        where('category', '==', category),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const mixes = [];
      querySnapshot.forEach((doc) => {
        mixes.push({ id: doc.id, ...doc.data() });
      });
      return { data: mixes, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Update a custom local mix
  update: async (mixId, updates) => {
    try {
      await updateDoc(doc(db, 'custom_local_mixes', mixId), {
        ...updates,
        updated_at: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Delete a custom local mix
  delete: async (mixId) => {
    try {
      await deleteDoc(doc(db, 'custom_local_mixes', mixId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// User Profiles
export const userProfilesDB = {
  // Get user profile
  get: async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, 'user_profiles', userId));
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      } else {
        return { data: null, error: new Error('Profile not found') };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile
  update: async (userId, updates) => {
    try {
      await updateDoc(doc(db, 'user_profiles', userId), {
        ...updates,
        updated_at: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};