'use client';

import { TrendingUp, Target, Clock, DollarSign } from 'lucide-react';
import { calculateFeedProgression, getFeedProgressionSummary } from '../../shared/utils/feedProgression';
import { getEffectiveAge, calculateCurrentQuantity, hasAutoProgression } from '../../shared/utils/autoProgressionUtils';

export default function FeedProgressionCard({ 
  birdType, 
  breed, 
  ageInDays, 
  quantity, 
  rearingStyle, 
  targetWeight, 
  environmental,
  calculation // Optional: saved calculation object for auto-progression
}) {
  // Use dynamic age and quantity if calculation has auto-progression
  const effectiveAge = calculation ? getEffectiveAge(calculation) : ageInDays;
  const effectiveQuantity = calculation ? calculateCurrentQuantity(calculation) : quantity;
  const isAutoProgression = calculation ? hasAutoProgression(calculation) : false;
  
  // Calculate progression data with effective values
  const progressionData = calculateFeedProgression({
    birdType,
    breed,
    ageInDays: effectiveAge,
    quantity: effectiveQuantity,
    rearingStyle,
    targetWeight,
    environmental
  });

  // Don't show if no progression data or bird is already 8+ weeks
  if (!progressionData || effectiveAge >= 56) {
    return null;
  }

  const summary = getFeedProgressionSummary(progressionData);

  return (
    <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Track your feed consumption and plan ahead for key growth milestones
        </div>
        {isAutoProgression && (
          <div className="flex items-center space-x-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            <span>📅</span>
            <span>Live Updates</span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Next Target</div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Week {summary.nextTargetWeek || 'N/A'}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {summary.daysToNextTarget ? `${summary.daysToNextTarget} days` : 'Completed'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Feed to Next Target</div>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">
              {summary.totalRemainingFeed}kg
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              ({Math.round((summary.totalRemainingFeed / 25) * 10) / 10} bags)
            </div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Est. Cost</div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
              ₦{summary.totalRemainingCost.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              To Next Target
            </div>
          </div>
          
          <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Progress</div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {summary.completedTargets}/{summary.completedTargets + summary.remainingTargets}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Milestones
            </div>
          </div>
        </div>
      )}

      {/* Progression Details */}
      <div className="space-y-4">
        {progressionData.progressions.map((progression, index) => (
          <div
            key={progression.targetWeek}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              progression.isCompleted
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-t-xl w-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progression.isCompleted
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progression.progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  progression.isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {progression.isCompleted ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  ) : (
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Week {progression.targetWeek} Target
                    {progression.isCompleted && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {progression.isCompleted
                      ? `Consumed ${progression.totalConsumedKg}kg (${progression.totalConsumedBags} bags) total`
                      : `${progression.daysRemaining} days remaining`
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {progression.progressPercentage}%
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Progress
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-neutral-600 dark:text-neutral-400">Consumed:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {progression.totalConsumedKg}kg ({progression.totalConsumedBags} bags)
                </span>
              </div>
              
              {!progression.isCompleted && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">Remaining:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {progression.remainingFeedKg}kg ({progression.remainingFeedBags} bags)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-neutral-600 dark:text-neutral-400">Cost:</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      ₦{progression.remainingCost.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-purple-600" />
                <span className="text-neutral-600 dark:text-neutral-400">Total:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {progression.totalRequiredKg}kg ({progression.totalRequiredBags} bags)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
          💡 <strong>Planning Tip:</strong> These projections help you budget and purchase feed in advance. 
          Actual consumption may vary based on environmental conditions and bird health.
        </p>
      </div>
    </div>
  );
}