'use client';

import { useState, useEffect, useRef } from 'react';
import { dataSyncService } from '../lib/dataSync';
import useFirebaseAuthStore from '../lib/firebaseAuthStore';
import { useUnifiedStore } from '../lib/unifiedStore';
import { AlertTriangle, CheckCircle, Upload, Download, X, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

// Cache key for migration check results
const MIGRATION_CACHE_KEY = 'migration-check-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const UnifiedStoreMigration = ({ onComplete }) => {
  const { isAuthenticated } = useFirebaseAuthStore();
  const { onAuthStateChange } = useUnifiedStore();
  const [migrationState, setMigrationState] = useState('idle'); // idle, checking, needed, migrating, completed, error
  const [localDataSummary, setLocalDataSummary] = useState(null);
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 });
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const hasCheckedRef = useRef(false);

  // Check cache and only run migration check if needed
  useEffect(() => {
    const initializeMigration = async () => {
      // Only check once per session unless auth state changes significantly
      if (hasCheckedRef.current) return;
      
      const cached = getCachedMigrationResult();
      if (cached && !cached.expired) {
        if (cached.hasLocalData) {
          setMigrationState('needed');
          setLocalDataSummary(cached.summary);
        } else {
          setMigrationState('completed');
          await onAuthStateChange(isAuthenticated);
        }
        hasCheckedRef.current = true;
        return;
      }
      
      // Only check for migration if user might have local data
      // Skip check for new users or if recently checked
      const shouldCheck = shouldCheckForMigration();
      if (!shouldCheck) {
        setMigrationState('completed');
        await onAuthStateChange(isAuthenticated);
        hasCheckedRef.current = true;
        return;
      }
      
      // Perform lazy check
      await checkMigrationStatus();
      hasCheckedRef.current = true;
    };
    
    initializeMigration();
  }, [isAuthenticated]);

  // Listen for manual migration check triggers
  useEffect(() => {
    const handleTriggerMigrationCheck = () => {
      if (migrationState === 'idle' || migrationState === 'completed') {
        checkMigrationStatus();
      }
    };

    window.addEventListener('triggerMigrationCheck', handleTriggerMigrationCheck);
    return () => {
      window.removeEventListener('triggerMigrationCheck', handleTriggerMigrationCheck);
    };
  }, [migrationState]);

  // Helper function to get cached migration result
  const getCachedMigrationResult = () => {
    try {
      const cached = localStorage.getItem(MIGRATION_CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const now = Date.now();
      const expired = (now - parsed.timestamp) > CACHE_DURATION;
      
      return { ...parsed, expired };
    } catch (error) {
      return null;
    }
  };
  
  // Helper function to cache migration result
  const cacheMigrationResult = (hasLocalData, summary = null) => {
    try {
      const cacheData = {
        hasLocalData,
        summary,
        timestamp: Date.now()
      };
      localStorage.setItem(MIGRATION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      // Ignore cache errors
    }
  };
  
  // Helper function to determine if migration check is needed
  const shouldCheckForMigration = () => {
    // Check if user has ever used the app (has any localStorage keys)
    try {
      const hasAnyAppData = Object.keys(localStorage).some(key => 
        key.startsWith('chicken-feed-') || 
        key.includes('feed') || 
        key.includes('calculation')
      );
      return hasAnyAppData;
    } catch (error) {
      return true; // Default to checking if localStorage access fails
    }
  };

  const checkMigrationStatus = async () => {
    try {
      setMigrationState('checking');
      setError(null);
      
      const hasLocalData = await dataSyncService.hasLocalData();
      
      if (!hasLocalData) {
        setMigrationState('completed');
        cacheMigrationResult(false);
        // Initialize unified store for current auth state
        await onAuthStateChange(isAuthenticated);
        return;
      }
      
      const summary = await dataSyncService.getLocalDataSummary();
      setLocalDataSummary(summary);
      setMigrationState('needed');
      cacheMigrationResult(true, summary);
    } catch (err) {
      console.error('Error checking migration status:', err);
      setError(err.message);
      setMigrationState('error');
    }
  };

  const startMigration = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to migrate your data to the cloud.');
      return;
    }

    try {
      setMigrationState('migrating');
      setError(null);
      setProgress({ processed: 0, total: 0, percentage: 0 });
      
      // Create backup before migration
      await dataSyncService.backupLocalData();
      
      // Migrate data with progress tracking
      const result = await dataSyncService.migrateToDatabase((progressData) => {
        setProgress(progressData);
      });
      
      if (result.success) {
        // Clear local data after successful migration
        await dataSyncService.clearLocalData();
        
        // Initialize unified store with database data
        await onAuthStateChange(true);
        
        setMigrationState('completed');
        
        // Auto-close after a delay
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      } else {
        throw new Error('Migration failed');
      }
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
      setMigrationState('error');
    }
  };

  const skipMigration = async () => {
    try {
      // Initialize unified store without migration
      await onAuthStateChange(isAuthenticated);
      setMigrationState('completed');
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Error skipping migration:', err);
      setError(err.message);
    }
  };

  const retryMigration = () => {
    setError(null);
    checkMigrationStatus();
  };

  // Don't render anything for idle, completed states, or when checking quickly
  if (migrationState === 'idle' || migrationState === 'completed') {
    return null;
  }

  if (migrationState === 'checking') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Checking Data Status</h3>
          </div>
          <p className="text-gray-600 mt-2">
            Checking if you have local data that needs to be migrated...
          </p>
        </div>
      </div>
    );
  }

  if (migrationState === 'needed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Data Migration Available</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            We found local data that can be migrated to your cloud account:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              {localDataSummary?.calculations > 0 && (
                <div className="flex justify-between">
                  <span>Saved Calculations:</span>
                  <span className="font-semibold">{localDataSummary.calculations}</span>
                </div>
              )}
              {localDataSummary?.favorites > 0 && (
                <div className="flex justify-between">
                  <span>Favorite Snippets:</span>
                  <span className="font-semibold">{localDataSummary.favorites}</span>
                </div>
              )}
              {localDataSummary?.hasSettings && (
                <div className="flex justify-between">
                  <span>Settings:</span>
                  <span className="font-semibold">Yes</span>
                </div>
              )}
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Please sign in to migrate your data to the cloud.
                </span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={startMigration}
              disabled={!isAuthenticated}
              className={clsx(
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                isAuthenticated
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              Migrate Data
            </button>
            <button
              onClick={skipMigration}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-3 w-full text-center"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p className="mb-2">
                <strong>What happens during migration:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your local data is backed up automatically</li>
                <li>Data is uploaded to your cloud account</li>
                <li>Local data is cleared after successful migration</li>
                <li>You can access your data from any device</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (migrationState === 'migrating') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Migrating Data</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Uploading your data to the cloud...
          </p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.processed} of {progress.total} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              {progress.percentage}% complete
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            Please don't close this window...
          </div>
        </div>
      </div>
    );
  }

  if (migrationState === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Migration Error</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            There was an error during migration:
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={retryMigration}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={skipMigration}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="mb-1">
              <strong>Don't worry!</strong> Your local data is safe.
            </p>
            <p>
              You can try again later or continue using the app with local storage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UnifiedStoreMigration;