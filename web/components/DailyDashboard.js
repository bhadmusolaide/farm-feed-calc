'use client';

import { useState, useEffect } from 'react';
import { useUnifiedStore } from '../lib/unifiedStore';
import { Calendar, TrendingUp, AlertTriangle, ChevronRight, X, Minus, Plus, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import ProgressTracker from './ProgressTracker';

const DailyDashboard = () => {
  const { 
    savedCalculations, 
    getAutoProgressionCalculations, 
    calculateNextDay, 
    updateMortality 
  } = useUnifiedStore();
  
  const [autoProgressionCalcs, setAutoProgressionCalcs] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [mortalityInput, setMortalityInput] = useState({});
  const [showMortalityDialog, setShowMortalityDialog] = useState(null);
  const [expandedProgress, setExpandedProgress] = useState({});

  useEffect(() => {
    const calculations = getAutoProgressionCalculations();
    setAutoProgressionCalcs(calculations);
  }, [savedCalculations]);

  const handleMortalityUpdate = (calcId, deaths) => {
    if (deaths > 0) {
      updateMortality(calcId, deaths);
      setAutoProgressionCalcs(getAutoProgressionCalculations());
    }
    setShowMortalityDialog(null);
    setMortalityInput({});
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysFromStart = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (autoProgressionCalcs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Daily Feed Dashboard
          </h2>
        </div>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {autoProgressionCalcs.length} active calculation{autoProgressionCalcs.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {autoProgressionCalcs.map((calc) => {
          const nextDay = calculateNextDay(calc.id);
          const daysFromStart = getDaysFromStart(calc.startDate);
          const currentAge = calc.ageInDays + daysFromStart;
          const isExpanded = expandedCard === calc.id;
          
          return (
            <div key={calc.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                onClick={() => setExpandedCard(isExpanded ? null : calc.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {calc.name || `${calc.birdType} - ${calc.breed}`}
                      </h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        Day {currentAge}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>🐔 {calc.currentQuantity} birds</span>
                      <span>📅 Started {formatDate(calc.startDate)}</span>
                      {nextDay && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          📊 {nextDay.totalFeedKg.toFixed(1)}kg needed today
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={clsx(
                    "h-5 w-5 text-neutral-400 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </div>
              
              {isExpanded && nextDay && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900 dark:text-white flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Today's Requirements
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Total Feed:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{nextDay.totalFeedKg.toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Per Bird:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{nextDay.feedPerBirdGrams.toFixed(0)} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Feed Type:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{nextDay.feedType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Protein:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{nextDay.protein}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Phase:</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {(() => {
                              // Use unified feed type system
                              const age = currentAge;
                              if (calc.birdType === 'layer') {
                                return age <= 28 ? 'Starter' : age < 126 ? 'Grower' : 'Layer';
                              }
                              // Broilers - unified system: Pre-starter ≤14d, Starter 15-28d, Finisher >28d
                              if (age <= 14) return 'Pre-starter';
                              if (age <= 28) return 'Starter';
                              return 'Finisher';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900 dark:text-white flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                        Flock Management
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMortalityDialog(calc.id);
                            setMortalityInput({ [calc.id]: '' });
                          }}
                          className="w-full text-left px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm"
                        >
                          📝 Report Mortality
                        </button>
                        
                        {calc.mortalityLog && calc.mortalityLog.length > 0 && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Recent: {calc.mortalityLog.slice(-3).map(log => 
                              `${log.deaths} on ${formatDate(log.date)}`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Tracker Toggle */}
                  <button
                    onClick={() => setExpandedProgress(prev => ({
                      ...prev,
                      [calc.id]: !prev[calc.id]
                    }))}
                    className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>{expandedProgress[calc.id] ? 'Hide' : 'Show'} Progress Tracker</span>
                  </button>
                  
                  {/* Progress Tracker */}
                  {expandedProgress[calc.id] && (
                    <div className="mt-4">
                      <ProgressTracker calculationId={calc.id} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mortality Dialog */}
      {showMortalityDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Report Mortality
              </h3>
              <button
                onClick={() => {
                  setShowMortalityDialog(null);
                  setMortalityInput({});
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Number of birds that died today
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const current = parseInt(mortalityInput[showMortalityDialog] || '0');
                      if (current > 0) {
                        setMortalityInput({
                          ...mortalityInput,
                          [showMortalityDialog]: (current - 1).toString()
                        });
                      }
                    }}
                    className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={mortalityInput[showMortalityDialog] || ''}
                    onChange={(e) => setMortalityInput({
                      ...mortalityInput,
                      [showMortalityDialog]: e.target.value
                    })}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <button
                    onClick={() => {
                      const current = parseInt(mortalityInput[showMortalityDialog] || '0');
                      setMortalityInput({
                        ...mortalityInput,
                        [showMortalityDialog]: (current + 1).toString()
                      });
                    }}
                    className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMortalityDialog(null);
                  setMortalityInput({});
                }}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const deaths = parseInt(mortalityInput[showMortalityDialog] || '0');
                  handleMortalityUpdate(showMortalityDialog, deaths);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Update Flock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyDashboard;