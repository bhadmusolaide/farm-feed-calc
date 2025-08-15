'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, Upload, Trash2 } from 'lucide-react';
import { 
  hasLocalDataToMigrate, 
  getMigrationSummary, 
  migrateAllData, 
  clearLocalStorageAfterMigration 
} from '../lib/migrationUtils';

const MigrationDialog = ({ isOpen, onClose, onComplete }) => {
  const [migrationState, setMigrationState] = useState('idle'); // idle, migrating, completed, error
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [migrationResults, setMigrationResults] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const migrationSummary = getMigrationSummary();
  
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setMigrationState('idle');
      setMigrationProgress(0);
      setCurrentStep('');
      setMigrationResults(null);
      setError(null);
      setShowDetails(false);
    }
  }, [isOpen]);
  
  const handleStartMigration = async () => {
    setMigrationState('migrating');
    setError(null);
    
    try {
      const results = await migrateAllData((progress) => {
        setCurrentStep(progress.step);
        setMigrationProgress((progress.current / progress.total) * 100);
      });
      
      setMigrationResults(results);
      setMigrationState('completed');
      setMigrationProgress(100);
    } catch (err) {
      setError(err.message);
      setMigrationState('error');
    }
  };
  
  const handleClearLocalData = () => {
    const success = clearLocalStorageAfterMigration();
    if (success) {
      onComplete?.();
      onClose();
    } else {
      setError('Failed to clear local storage. Please try again.');
    }
  };
  
  const handleSkipMigration = () => {
    onComplete?.();
    onClose();
  };
  
  if (!migrationSummary.hasData) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration
          </DialogTitle>
          <DialogDescription>
            We found local data that can be synced to your cloud account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {migrationState === 'idle' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found: {migrationSummary.summary}
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p>Your local data will be safely migrated to your cloud account, allowing you to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your data from any device</li>
                  <li>Never lose your calculations and preferences</li>
                  <li>Share data across multiple devices</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleStartMigration} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Migrate Data
                </Button>
                <Button variant="outline" onClick={handleSkipMigration}>
                  Skip
                </Button>
              </div>
            </>
          )}
          
          {migrationState === 'migrating' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Migrating: {currentStep}</span>
                  <span>{Math.round(migrationProgress)}%</span>
                </div>
                <Progress value={migrationProgress} className="w-full" />
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Please don't close this dialog while migration is in progress...
              </div>
            </>
          )}
          
          {migrationState === 'completed' && migrationResults && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Migration completed! {migrationResults.totalSuccessful} of {migrationResults.totalItems} items migrated successfully.
                </AlertDescription>
              </Alert>
              
              {migrationResults.totalFailed > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {migrationResults.totalFailed} items failed to migrate.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Hide' : 'Show'} details
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {showDetails && migrationResults.allErrors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-xs bg-muted p-2 rounded">
                  {migrationResults.allErrors.map((error, index) => (
                    <div key={index} className="mb-1">
                      <strong>{error.calculation || error.feed || error.mix || error.step}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2">
                <Button onClick={handleClearLocalData} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Local Data & Continue
                </Button>
                <Button variant="outline" onClick={handleSkipMigration} className="w-full">
                  Keep Local Data & Continue
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p><strong>Clear Local Data:</strong> Removes migrated data from local storage to avoid duplicates.</p>
                <p><strong>Keep Local Data:</strong> Keeps local data as backup (may cause duplicates).</p>
              </div>
            </>
          )}
          
          {migrationState === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Migration failed: {error}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button onClick={handleStartMigration} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleSkipMigration}>
                  Skip
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;