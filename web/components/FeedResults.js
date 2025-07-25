'use client';

import { useFeedStore, useSavedResultsStore } from '../lib/store';
import { Package, Clock, Lightbulb, Calculator, Copy, Check, Save } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useToast } from './Toast';
import { LoadingWrapper } from './LoadingState';
import { formatErrorForUser, logError } from '../../shared/utils/errorHandling';
import { calculateFeedCost, calculateExpectedWeight, getFCRReference } from '../../shared/utils/feedCalculator';

export default function FeedResults() {
  const { feedResults, feedingSchedule, bestPractices, birdType, breed, ageInDays, quantity, rearingStyle, targetWeight } = useFeedStore();
  const { saveResult } = useSavedResultsStore();
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate basic feed efficiency for display (simplified, practical approach)
  const feedEfficiencyRating = feedResults.rearingStyle === 'commercial' ? 'Good' : 
                              feedResults.rearingStyle === 'intensive' ? 'Very Good' : 'Standard';

  // Calculate expected weight data
  const expectedWeightData = calculateExpectedWeight({
    birdType,
    breed,
    ageInDays,
    targetWeight
  });

  // Get FCR reference data
  const fcrReference = getFCRReference(birdType, ageInDays);

  if (!feedResults) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
        <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
          No Results Available
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400">
          Please calculate feed requirements first.
        </p>
      </div>
    );
  }

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      toast.success('Copied to clipboard!');
    } catch (err) {
      logError(err, 'Failed to copy to clipboard', { section });
      toast.error(formatErrorForUser(err).message);
    }
  };

  const handleSaveResult = async () => {
    setIsSaving(true);
    
    const resultData = {
      birdType,
      breed,
      ageInDays,
      quantity,
      rearingStyle,
      targetWeight,
      feedResults,
      feedingSchedule,
      bestPractices
    };
    
    try {
      const savedId = saveResult(resultData);
      
      // Show success feedback
      setCopiedSection('saved');
      setTimeout(() => setCopiedSection(null), 2000);
      
      toast.success('Results saved successfully!');
      
    } catch (error) {
      logError(error, 'Failed to save results', { resultData });
      toast.error(formatErrorForUser(error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatResultsForCopy = () => {
    return `FEED CALCULATION RESULTS

Bird Details:
- Type: ${feedResults.birdType} (${feedResults.breed})
- Age: ${feedResults.ageInDays} days (Week ${feedResults.week})
- Quantity: ${feedResults.quantity} birds
- Rearing: ${feedResults.rearingStyle}
${feedResults.targetWeight ? `- Target Weight: ${feedResults.targetWeight}` : ''}

Daily Feed Requirements:
- Per Bird: ${feedResults.perBird.grams}g (${feedResults.perBird.cups} cups)
- Total Daily: ${feedResults.total.grams}g (${feedResults.total.cups} cups)

Feeding Schedule (${feedingSchedule.mealsPerDay} meals/day):
${feedingSchedule.schedule.map(meal => `- ${meal.time}: ${meal.feedGrams}g (${meal.feedCups} cups)`).join('\n')}

Best Practices:
${bestPractices.map(practice => `- ${practice}`).join('\n')}`;
  };

  const formatScheduleForCopy = () => {
    return `FEEDING SCHEDULE

Daily Schedule (${feedingSchedule.mealsPerDay} meals):
${feedingSchedule.schedule.map(meal => `${meal.time} - ${meal.feedGrams}g (${meal.feedCups} cups) (Meal ${meal.meal})`).join('\n')}

Total Daily Feed: ${feedResults.total.cups} cups (${feedResults.total.grams}g)`;
  };

  return (
    <div className="max-w-4xl mx-auto space-mobile">
      {/* Results Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-2xl mb-4">
          <Calculator className="w-8 h-8 text-secondary-600" />
        </div>
        <h2 className="text-mobile-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Feed Calculation Results
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          {feedResults.birdType} • {feedResults.breed} • {feedResults.quantity} birds
        </p>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feed Quantity Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Feed Quantity
            </h3>
            <button
              onClick={() => copyToClipboard(formatResultsForCopy(), 'results')}
              className="btn-ghost btn-sm"
              title="Copy results"
            >
              {copiedSection === 'results' ? (
                <Check className="w-4 h-4 text-secondary-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Per Bird */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Per Bird Daily</div>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {feedResults.perBird.grams}g
                </span>
                <span className="text-lg text-neutral-600 dark:text-neutral-300">
                  ({feedResults.perBird.cups} cups)
                </span>
              </div>
            </div>
            
            {/* Total Daily */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
              <div className="text-sm text-primary-700 dark:text-primary-300 mb-1">Total Daily Feed</div>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-primary-900 dark:text-primary-100">
                  {feedResults.total.grams}g
                </span>
                <span className="text-xl text-primary-700 dark:text-primary-300">
                  ({feedResults.total.cups} cups)
                </span>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Age</div>
                <div className="text-neutral-600 dark:text-neutral-300">
                  {feedResults.ageInDays} days
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Week {feedResults.week}
                </div>
              </div>
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Style</div>
                <div className="text-neutral-600 dark:text-neutral-300 capitalize">
                  {feedResults.rearingStyle}
                </div>
                {feedResults.targetWeight && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {feedResults.targetWeight} plan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feeding Schedule Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-secondary-600" />
              Feeding Schedule
            </h3>
            <button
              onClick={() => copyToClipboard(formatScheduleForCopy(), 'schedule')}
              className="btn-ghost btn-sm"
              title="Copy schedule"
            >
              {copiedSection === 'schedule' ? (
                <Check className="w-4 h-4 text-secondary-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
              <div className="text-sm text-secondary-700 dark:text-secondary-300">Meals per Day</div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {feedingSchedule.mealsPerDay}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">
                {feedingSchedule.feedPerMealGrams}g per meal
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                ({feedingSchedule.feedPerMeal} cups)
              </div>
            </div>
            
            <div className="space-y-2">
              {feedingSchedule.schedule.map((meal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {meal.time}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                      Meal {meal.meal}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {meal.feedGrams}g
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      ({meal.feedCups} cups)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-accent-600" />
          Best Practices for Your Birds
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bestPractices.map((practice, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-accent-200 dark:bg-accent-700 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-accent-800 dark:text-accent-200">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
                {practice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          📊 Weekly Summary
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Weekly Feed</div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {(feedResults.total.grams * 7 / 1000).toFixed(1)}kg
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {(feedResults.total.cups * 7).toFixed(1)} cups total
            </div>
          </div>
          
          <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Cost Estimate</div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              ₦{(() => {
                const weeklyFeedKg = feedResults.total.grams * 7 / 1000;
                const costData = calculateFeedCost(feedResults.birdType, feedResults.ageInDays, weeklyFeedKg);
                return costData.totalCost.toLocaleString();
              })()}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {(() => {
                const weeklyFeedKg = feedResults.total.grams * 7 / 1000;
                const costData = calculateFeedCost(feedResults.birdType, feedResults.ageInDays, weeklyFeedKg);
                return `@ ₦${costData.pricePerKg}/kg ${costData.feedType}`;
              })()}
            </div>
          </div>
          
          {expectedWeightData && (
            <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Expected Weight</div>
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {expectedWeightData.expectedWeight}kg
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {expectedWeightData.weightRange.min}-{expectedWeightData.weightRange.max}kg range
              </div>
              <div className="text-xs text-accent-600 dark:text-accent-400 mt-1">
                {expectedWeightData.growthStage}
              </div>
            </div>
          )}
          
          <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Feed Efficiency</div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {feedEfficiencyRating}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Based on management system
            </div>
          </div>
        </div>
      </div>

      {/* FCR Reference Card */}
      {fcrReference && (
        <div className="card p-6 bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20">
          <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
            📚 Feed Conversion Ratio (FCR) Reference
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Industry Standards */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Industry Standards for {birdType === 'broiler' ? 'Broilers' : 'Layers'}
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Excellent</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{fcrReference.industryStandard.excellent}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Good</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{fcrReference.industryStandard.good}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Average</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{fcrReference.industryStandard.average}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Poor</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{fcrReference.industryStandard.poor}</span>
                </div>
              </div>
              
              <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <div className="text-sm font-medium text-primary-800 dark:text-primary-200 mb-1">
                  Current Age Target
                </div>
                <div className="text-lg font-bold text-primary-900 dark:text-primary-100">
                  {fcrReference.currentWeekTarget}
                </div>
                <div className="text-xs text-primary-700 dark:text-primary-300">
                  Week {Math.ceil(ageInDays / 7)} target range
                </div>
              </div>
            </div>
            
            {/* Tips and Factors */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  💡 Improvement Tips
                </h4>
                <div className="space-y-2">
                  {fcrReference.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-neutral-800 rounded-lg">
                      <div className="flex-shrink-0 w-5 h-5 bg-accent-200 dark:bg-accent-700 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-accent-800 dark:text-accent-200">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  🎯 Key Factors
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {fcrReference.factors.map((factor, index) => (
                    <div key={index} className="p-2 bg-white dark:bg-neutral-800 rounded-lg">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        • {factor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
              💡 <strong>Note:</strong> FCR = Total Feed Consumed (kg) ÷ Weight Gain (kg). Lower values indicate better efficiency.
              {birdType === 'layer' && ' For layers, FCR includes feed per dozen eggs produced.'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => copyToClipboard(formatResultsForCopy(), 'all')}
          className="flex-1 btn-outline"
        >
          {copiedSection === 'all' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy All Results
            </>
          )}
        </button>
        
        <button
          onClick={handleSaveResult}
          disabled={isSaving}
          className="flex-1 btn-primary"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : copiedSection === 'saved' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Results
            </>
          )}
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex-1 btn-secondary no-print"
        >
          🖨️ Print Results
        </button>
      </div>




    </div>
  );
}