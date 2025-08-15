'use client';

import { useState } from 'react';
import { useUnifiedStore, getAvailableBreeds, getTargetWeightOptions, getRearingStyleOptions } from '../lib/unifiedStore';
import { getBreedsWithImages } from '../lib/breedImages';
import { Calculator, Clock, Users, Target, Zap, RotateCcw, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from './Toast';
import { LoadingButton } from './LoadingState';
import { validateFormData, formatErrorForUser } from '../../shared/utils/errorHandling';
import ConfirmationModal from './ConfirmationModal';

export default function FeedCalculator() {
  const {
    birdType,
    breed,
    ageInDays,
    quantity,
    rearingStyle,
    targetWeight,
    isCalculating,
    activeTab,
    setBirdType,
    setBreed,
    setAge,
    setQuantity,
    setRearingStyle,
    setTargetWeight,
    setActiveTab,
    calculateFeedRequirements,
    resetForm,
  } = useUnifiedStore();

  const { toast, removeToast } = useToast();
  const [ageInput, setAgeInput] = useState('days');
  const [ageWeeks, setAgeWeeks] = useState(Math.ceil(ageInDays / 7));
  const [hoveredBreed, setHoveredBreed] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const availableBreeds = getAvailableBreeds(birdType);
  const breedsWithImages = getBreedsWithImages(birdType);
  const targetWeightOptions = getTargetWeightOptions(breed);
  const rearingStyleOptions = getRearingStyleOptions();

  const handleAgeChange = (value, unit) => {
    if (unit === 'days') {
      setAge(value === '' ? 0 : parseInt(value) || 0);
    } else {
      const numValue = value === '' ? 0 : parseInt(value) || 0;
      const days = numValue * 7;
      setAge(days);
      setAgeWeeks(numValue);
    }
  };

  const handleCalculate = async () => {
    
    try {
      // Validate form data
      const formData = {
        quantity: parseInt(quantity),
        ageInDays,
        birdType,
        breed,
        rearingStyle,
        targetWeight: birdType === 'broiler' ? targetWeight : undefined
      };

      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0].message);
        return;
      }

      // Show loading toast
      const loadingToastId = toast.loading('Calculating feed requirements...');

      // Calculate feed requirements
      await calculateFeedRequirements();

      // Remove loading toast and show success
      removeToast(loadingToastId);
      toast.success('Feed requirements calculated successfully!');
      
      // Auto-scroll to results section
      setTimeout(() => {
        // First, switch to results tab if not already there
        // activeTab and setActiveTab are already available from the hook
        if (activeTab !== 'results') {
          setActiveTab('results');
        }
        
        // Wait a bit for tab switch to complete, then scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('feed-results');
          
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback: scroll to top if results element not found
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 200);
      }, 100);
      
    } catch (error) {
      const friendlyError = formatErrorForUser(error);
      toast.error(friendlyError.message, {
        title: friendlyError.title,
        duration: 7000
      });
    } finally {
       // Loading state is managed by the store
     }
   };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    // Use centralized reset in the unified store
    resetForm();
    setAgeInput('days');
    setShowResetConfirm(false);
    toast.success('Calculator reset successfully!');
  };

  const handleMouseEnter = (breedName, event) => {
    setHoveredBreed(breedName);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredBreed(null);
  };

  const isFormValid = () => {
    return birdType && breed && ageInDays > 0 && quantity > 0 && rearingStyle;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-mobile backdrop-blur-xl colorful-shadow">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-tertiary-500 to-secondary-500 rounded-2xl mb-4 shadow-xl pulse-rainbow">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-mobile-2xl font-display font-bold gradient-text mb-2">
            Feed Calculator
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Calculate optimal feed requirements for your birds
          </p>
        </div>

        <form className="space-mobile" onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}>
          {/* Bird Type Selection */}
          <div>
            <label className="label-lg">
              <Users className="w-5 h-5 inline mr-2" />
              Bird Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['broiler', 'layer'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBirdType(type)}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all duration-300 touch-target interactive-scale',
                    {
                      'border-tertiary-400 bg-gradient-to-br from-tertiary-50 via-primary-50 to-secondary-50 text-tertiary-900 shadow-lg colorful-shadow': birdType === type,
                      'border-neutral-200 bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:border-tertiary-300 hover:bg-gradient-to-br hover:from-tertiary-50/50 hover:to-primary-50/50 backdrop-blur-sm': birdType !== type,
                    }
                  )}
                >
                  <div className="font-medium capitalize flex items-center">
                    <span className="text-lg mr-2">{type === 'broiler' ? '🍗' : '🥚'}</span>
                    {type}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {type === 'broiler' ? 'Meat production' : 'Egg production'}
                  </div>
                  {birdType === type && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-primary-600 dark:text-primary-400">
                      <Calendar className="w-3 h-3" />
                      <span>Track daily progress</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Breed Selection */}
          <div>
            <label className="label-lg">
              Breed
            </label>
            <div className="grid grid-cols-1 gap-3">
              {breedsWithImages.map((breedOption) => (
                <button
                  key={breedOption.name}
                  type="button"
                  onClick={() => setBreed(breedOption.name)}
                  onMouseEnter={(e) => handleMouseEnter(breedOption.name, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all duration-300 touch-target flex items-center space-x-4 relative interactive-scale',
                    {
                      'border-secondary-400 bg-gradient-to-br from-secondary-50 via-accent-50 to-primary-50 text-secondary-900 shadow-lg colorful-shadow': breed === breedOption.name,
                      'border-neutral-200 bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:border-secondary-300 hover:bg-gradient-to-br hover:from-secondary-50/50 hover:to-accent-50/50 backdrop-blur-sm': breed !== breedOption.name,
                    }
                  )}
                >
                  {/* Breed Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={breedOption.image}
                      alt={breedOption.name}
                      className="w-full h-full rounded-lg object-cover bg-neutral-50 border border-neutral-200 transition-transform duration-200 hover:scale-105"
                    />
                  </div>
                  
                  {/* Breed Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-lg">{breedOption.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {breedOption.description}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {breed === breedOption.name && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Age Input */}
          <div>
            <label className="label-lg">
              <Clock className="w-5 h-5 inline mr-2" />
              Age of Birds
            </label>
            <div className="space-y-3">
              {/* Age Input Type Toggle */}
              <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setAgeInput('days')}
                  className={clsx(
                    'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                    {
                      'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm': ageInput === 'days',
                      'text-neutral-600 dark:text-neutral-400': ageInput !== 'days',
                    }
                  )}
                >
                  Days
                </button>
                <button
                  type="button"
                  onClick={() => setAgeInput('weeks')}
                  className={clsx(
                    'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                    {
                      'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm': ageInput === 'weeks',
                      'text-neutral-600 dark:text-neutral-400': ageInput !== 'weeks',
                    }
                  )}
                >
                  Weeks
                </button>
              </div>

              {/* Age Input Field */}
              {ageInput === 'days' ? (
                <input
                  type="number"
                  value={ageInDays === 0 ? '' : ageInDays}
                  onChange={(e) => handleAgeChange(e.target.value, 'days')}
                  placeholder="Enter age in days"
                  min="1"
                  max="365"
                  className="input-lg"
                />
              ) : (
                <input
                  type="number"
                  value={ageWeeks === 0 ? '' : ageWeeks}
                  onChange={(e) => {
                    const numValue = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                    setAgeWeeks(numValue);
                    handleAgeChange(e.target.value, 'weeks');
                  }}
                  placeholder="Enter age in weeks"
                  min="1"
                  max="52"
                  className="input-lg"
                />
              )}

              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Current: {ageInDays} days ({Math.ceil(ageInDays / 7)} weeks)
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="label-lg" htmlFor="quantity">
              Number of Birds
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity === 0 ? '' : quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
              placeholder="Enter number of birds"
              min="1"
              max="10000"
              className="input-lg"
            />
          </div>

          {/* Rearing Style */}
          <div>
            <label className="label-lg">
              Rearing Style
            </label>
            <div className="space-y-3">
              {rearingStyleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRearingStyle(option.value)}
                  className={clsx(
                    'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 touch-target',
                    {
                      'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100': rearingStyle === option.value,
                      'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600': rearingStyle !== option.value,
                    }
                  )}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Weight (Broilers Only) */}
          {birdType === 'broiler' && (
            <div>
              <label className="label-lg">
                <Target className="w-5 h-5 inline mr-2" />
                Target Weight Plan
              </label>
              <div className="space-y-3">
                {targetWeightOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTargetWeight(option.value)}
                    className={clsx(
                      'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 touch-target',
                      {
                        'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100': targetWeight === option.value,
                        'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600': targetWeight !== option.value,
                      }
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <div className="flex gap-3">
                <LoadingButton
                  onClick={handleCalculate}
                  loading={isCalculating}
                  loadingText="Calculating..."
                  disabled={!isFormValid()}
                  className={clsx(
                    'flex-1 btn-lg font-semibold transition-all duration-200',
                    {
                      'btn-primary': isFormValid() && !isCalculating,
                      'bg-neutral-300 text-neutral-500 cursor-not-allowed': !isFormValid() || isCalculating,
                    }
                  )}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Calculate
                </LoadingButton>
                
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="btn-lg btn-secondary font-semibold transition-all duration-200 flex items-center justify-center px-6"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </div>
              
              {/* Subtle Auto-Progression Hint */}
              {isFormValid() && (
                <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 animate-fade-in">
                  <Calendar className="w-3 h-3" />
                  <span>💡 Tip: Save results to track daily progress automatically</span>
                </div>
              )}
            </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-8 p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl border border-accent-200 dark:border-accent-800">
          <h3 className="font-medium text-accent-900 dark:text-accent-100 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-accent-800 dark:text-accent-200 space-y-1">
            <li>• Feed requirements vary with weather and bird health</li>
            <li>• Always provide fresh, clean water</li>
            <li>• Monitor birds daily for signs of illness</li>
            <li>• Adjust quantities based on actual consumption</li>
            <li className="flex items-center space-x-1">
              <span>•</span>
              <Calendar className="w-3 h-3 opacity-70" />
              <span>Save calculations to get daily feed updates on your dashboard</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Breed Image Tooltip */}
      {hoveredBreed && (
        <div 
          className="fixed z-50 pointer-events-none transition-opacity duration-200"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 100,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 max-w-xs">
            <div className="w-48 h-48 mx-auto mb-3">
              <img 
                src={breedsWithImages.find(b => b.name === hoveredBreed)?.image}
                alt={hoveredBreed}
                className="w-full h-full rounded-lg object-cover bg-neutral-50 border border-neutral-200"
              />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{hoveredBreed}</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {breedsWithImages.find(b => b.name === hoveredBreed)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
       <ConfirmationModal
         isOpen={showResetConfirm}
         onClose={() => setShowResetConfirm(false)}
         onConfirm={confirmReset}
         title="Reset Calculator"
         message="Are you sure you want to reset all fields? This action cannot be undone."
         confirmText="Reset"
         cancelText="Cancel"
         variant="warning"
       />
    </div>
  );
}