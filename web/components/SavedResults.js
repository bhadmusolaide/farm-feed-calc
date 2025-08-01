'use client';

import { useHybridSavedResultsStore, useHybridFeedStore } from '../lib/hybridStore';
import { Package, Calendar, Trash2, Eye, Edit2, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

export default function SavedResults() {
  const { savedResults, deleteResult, updateResultName, clearAllResults, loadSavedResults } = useHybridSavedResultsStore();
  const { setActiveTab, updateFeedStore } = useHybridFeedStore();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Load saved results when component mounts
  useEffect(() => {
    if (loadSavedResults) {
      loadSavedResults();
    }
  }, [loadSavedResults]);

  const handleLoadResult = (result) => {
    // Load the saved result into the main store using the hybrid store method
    updateFeedStore(result);
    
    // Navigate to results tab
    setActiveTab('results');
  };

  const handleStartEdit = (result) => {
    setEditingId(result.id);
    setEditName(result.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateResultName(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedResults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-mobile">
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
          No Saved Results
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Save your feed calculations to access them quickly later.
          </p>
          <button
            onClick={() => setActiveTab('calculator')}
            className="btn-primary"
          >
            Start Calculating
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-mobile">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-2xl mb-4">
          <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-mobile-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Saved Results
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          {savedResults.length} saved calculation{savedResults.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Saved Results List */}
      <div className="space-y-4">
        {savedResults.filter(result => result && result.id).map((result) => (
          <div key={result.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {editingId === result.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input flex-1"
                      placeholder="Enter calculation name"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="btn-ghost btn-sm text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-ghost btn-sm text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100">
                      {result.name}
                    </h3>
                    <button
                      onClick={() => handleStartEdit(result)}
                      className="btn-ghost btn-sm text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(result.savedAt)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLoadResult(result)}
                  className="btn-primary btn-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => deleteResult(result.id)}
                  className="btn-ghost btn-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Result Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Bird Type</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                  {result.birdType}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {result.breed}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Age</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {result.ageInDays} days
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Week {Math.ceil(result.ageInDays / 7)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Quantity</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {result.quantity} birds
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                  {result.rearingStyle}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Daily Feed</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {result.feedResults?.total?.grams}g
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {result.feedResults?.total?.cups} cups
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Clear All Button */}
      {savedResults.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all saved results? This action cannot be undone.')) {
                clearAllResults();
              }
            }}
            className="btn-outline text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Saved Results
          </button>
        </div>
      )}
    </div>
  );
}