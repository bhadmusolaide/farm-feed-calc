'use client';

import { useUnifiedStore } from '../lib/unifiedStore';
import { Package, Clock, Lightbulb, Calculator, Copy, Check, Save, Thermometer, Calendar, Zap, ChevronRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useToast } from './Toast';
import { LoadingWrapper } from './LoadingState';
import { formatErrorForUser, logError } from '../../shared/utils/errorHandling';
import { calculateFeedCost, calculateExpectedWeight, getFCRReference } from '../../shared/utils/feedCalculator';
import { calculateOptimalTemperature } from '../../shared/utils/temperatureCalculator';
import { getEffectiveAge, hasAutoProgression } from '../../shared/utils/autoProgressionUtils';
import FeedProgressionCard from './FeedProgressionCard';

export default function FeedResults() {
  const { feedResults, feedingSchedule, bestPractices, birdType, breed, ageInDays, quantity, rearingStyle, targetWeight, saveCalculation, savedCalculations } = useUnifiedStore();
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoProgression, setAutoProgression] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [calculationName, setCalculationName] = useState('');
  const [showFeedProgression, setShowFeedProgression] = useState(true);
  const [showFCRReference, setShowFCRReference] = useState(true);

  // Compute effective visibility: defaults true -> local user -> global override last
  const state = useUnifiedStore.getState();
  const globalFRV = state.globalSettings?.feedResultsVisibility || {};
  const localFRV = state.userSettings?.featureVisibility?.feedResults || {};
  const defaultsFRV = {
    showFeedQuantity: true,
    showFeedingSchedule: true,
    showWeeklySummary: true,
    showProgressionTracker: true,
    showFCRReference: true,
    // Standalone flags default true
    showBestPractices: true,
  };
  // Merge with precedence: defaults -> local -> global (global wins)
  const mergedFRV = { ...defaultsFRV, ...localFRV, ...globalFRV };
  // Normalize to strict booleans for all known keys
  const visibility = {
    showFeedQuantity: !!mergedFRV.showFeedQuantity,
    showFeedingSchedule: !!mergedFRV.showFeedingSchedule,
    showWeeklySummary: !!mergedFRV.showWeeklySummary,
    showProgressionTracker: !!mergedFRV.showProgressionTracker,
    showFCRReference: !!mergedFRV.showFCRReference,
    showBestPractices: !!mergedFRV.showBestPractices,
  };

  // Calculate basic feed efficiency for display (simplified, practical approach)
  // Only 'commercial' and 'backyard' are valid rearing styles now.
  const feedEfficiencyRating =
    feedResults.rearingStyle === 'commercial' ? 'Good' :
    feedResults.rearingStyle === 'backyard' ? 'Standard' : 'Standard';

  // Calculate expected weight data
  const expectedWeightData = calculateExpectedWeight({
    birdType,
    breed,
    ageInDays,
    targetWeight
  });

  // Derive current feed phase label using unified system
  const currentFeedPhase = (() => {
    if (birdType === 'layer') {
      return ageInDays <= 28 ? 'Starter' : ageInDays < 126 ? 'Grower' : 'Layer';
    }
    // Broilers - unified system: Pre-starter ≤14d, Starter 15-28d, Finisher >28d
    if (ageInDays <= 14) return 'Pre-starter';
    if (ageInDays <= 28) return 'Starter';
    return 'Finisher';
  })();

  // Get FCR reference data - use current age if this is an auto-progression calculation
  // Check if current calculation matches any saved auto-progression calculation
  const currentCalculation = savedCalculations.find(calc => 
    calc.birdType === birdType && 
    calc.breed === breed && 
    calc.quantity === quantity && 
    calc.rearingStyle === rearingStyle &&
    hasAutoProgression(calc)
  );
  
  const effectiveAgeForFCR = currentCalculation ? getEffectiveAge(currentCalculation) : ageInDays;
  const fcrReference = getFCRReference(birdType, effectiveAgeForFCR);
  const isAutoProgressionActive = !!currentCalculation;

  // Calculate optimal temperature range
  const optimalTemperature = calculateOptimalTemperature({
    birdType,
    breed,
    ageInDays
  });

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
      logError(err, { message: 'Failed to copy to clipboard', section });
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
      // Use the store API signature: saveResult(resultData, name, autoProgression)
      const savedId = await useUnifiedStore.getState().saveResult(
        resultData,
        calculationName || `${birdType} - ${breed} (Day ${ageInDays})`,
        autoProgression
      );
      
      // Only show success if we actually got a saved ID
      if (savedId) {
        // Show success feedback
        setCopiedSection('saved');
        setTimeout(() => setCopiedSection(null), 2000);
        
        if (autoProgression) {
          toast.success('Results saved with auto-progression enabled!');
        } else {
          toast.success('Results saved successfully!');
        }
      } else {
        toast.error('Failed to save results. Please try again.');
        return; // Don't reset dialog state if save failed
      }
      
      // Reset dialog state
      setShowSaveDialog(false);
      setCalculationName('');
      setAutoProgression(false);
      
      // Scroll to top to show notifications (with small delay to ensure DOM updates)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      logError(error, { message: 'Failed to save results', resultData });
      toast.error(formatErrorForUser(error).message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const openSaveDialog = () => {
    setShowSaveDialog(true);
    setCalculationName(`${birdType} - ${breed} (Day ${ageInDays})`);
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
    <div id="feed-results" className="max-w-4xl mx-auto space-mobile">
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
        {visibility.showFeedQuantity && (
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

              {/* Temperature Range */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Thermometer className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                  <div className="font-medium text-orange-900 dark:text-orange-100">
                    Optimal Temperature
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {optimalTemperature.min}°-{optimalTemperature.max}°C
                  </span>
                  <span className="text-sm text-orange-700 dark:text-orange-300">
                    ({optimalTemperature.description})
                  </span>
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {optimalTemperature.stage === 'brooding'
                    ? `Week ${optimalTemperature.week}: Reduce brooder temp by 3°C weekly`
                    : optimalTemperature.stage === 'growing'
                    ? 'Monitor for temperature stress signs'
                    : 'Maintain consistent environmental conditions'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feeding Schedule Card */}
        {visibility.showFeedingSchedule && (
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
            
            {feedingSchedule.feedingType === 'out-of-age' ? (
              <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex justify-center mb-3">
                  <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Birds Beyond Recommended Age
                </h4>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  {feedingSchedule.message}
                </p>
                <div className="text-left bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg">
                  <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Recommendations:</h5>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    {feedingSchedule.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                  <div className="text-sm text-secondary-700 dark:text-secondary-300">Meals per Day</div>
                  <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                    {feedingSchedule.mealsPerDay}
                  </div>
                  {feedingSchedule.feedingType !== 'ad-libitum' && (
                    <>
                      <div className="text-sm text-secondary-600 dark:text-secondary-300">
                        {feedingSchedule.feedPerMealGrams}g per meal
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        ({feedingSchedule.feedPerMeal} cups)
                      </div>
                    </>
                  )}
                </div>
                
                {feedingSchedule.feedingType === 'ad-libitum' ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                      Ad-Libitum Feeding
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {feedingSchedule.schedule[0]?.note}
                    </p>
                    <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                      <div className="font-medium mb-1">Recommendations:</div>
                      <ul className="space-y-1">
                        {feedingSchedule.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      {visibility.showWeeklySummary && (
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
      )}


      {/* Feed Progression Tracker */}
      {visibility.showProgressionTracker && (
      <div className="card p-6">
        <h3 
          onClick={() => setShowFeedProgression(!showFeedProgression)}
          className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 p-2 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-5 h-5 mr-2 text-blue-600 dark:text-blue-400">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          Feed Progression Tracker
          <ChevronRight className={clsx(
            "w-5 h-5 text-neutral-500 dark:text-neutral-400 transition-transform ml-auto",
            showFeedProgression && "rotate-90"
          )} />
        </h3>
        
        {showFeedProgression && (
          <div className="-m-6 mt-0">
            <FeedProgressionCard
              birdType={birdType}
              breed={breed}
              ageInDays={ageInDays}
              quantity={quantity}
              rearingStyle={rearingStyle}
              targetWeight={targetWeight}
              environmental={{}}
              calculation={currentCalculation}
            />
          </div>
        )}
      </div>
      )}

      {/* Best Practices */}
      {visibility.showBestPractices && (
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
      )}

      {/* FCR Reference Card */}
      {fcrReference && visibility.showFCRReference && (
        <div className="card p-6 bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20">
          <button
            onClick={() => setShowFCRReference(!showFCRReference)}
            className="w-full flex items-center justify-between text-left mb-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-accent-600" />
              <span className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100">
                FCR Reference
              </span>
              {isAutoProgressionActive && (
                <div className="flex items-center space-x-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  <span>📅</span>
                  <span>Live Updates</span>
                </div>
              )}
            </div>
            <ChevronRight className={clsx(
              "w-5 h-5 text-neutral-400 transition-transform duration-200",
              showFCRReference && "rotate-90"
            )} />
          </button>
          
          {showFCRReference && (
            <>
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
            </>
          )}
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
          onClick={openSaveDialog}
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
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Save Calculation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Calculation Name
                </label>
                <input
                  type="text"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter a name for this calculation"
                />
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="autoProgression"
                  checked={autoProgression}
                  onChange={(e) => setAutoProgression(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <div>
                  <label htmlFor="autoProgression" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    📅 Enable Auto-Progression
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Automatically calculate tomorrow's feed requirements. You'll see daily updates when you open the app.
                  </p>
                </div>
              </div>
              
              {autoProgression && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Auto-progression will:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Calculate daily feed requirements automatically</li>
                        <li>Show updates on your dashboard</li>
                        <li>Allow quick mortality adjustments</li>
                        <li>Track your flock's progress over time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setCalculationName('');
                  setAutoProgression(false);
                }}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResult}
                disabled={isSaving || !calculationName.trim()}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors duration-200"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Calculation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}