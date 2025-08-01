'use client';

import { useState, useMemo } from 'react';
import { useHybridFeedStore } from '../lib/hybridStore';
import { useHybridSiteSettingsStore } from '../lib/hybridStore';
import { useFeedManagementStore } from '../lib/feedManagementStore';
import { getLocalFeedMix, calculateLocalFeedCost } from '../../shared/data/feedBrands.js';
import { BookOpen, Package, MapPin, DollarSign, Info, Star, Filter, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from './Toast';
import { LoadingWrapper } from './LoadingState';
import { formatErrorForUser, logError } from '../../shared/utils/errorHandling';

export default function RecommendedFeeds() {
  const { birdType, ageInDays } = useHybridFeedStore();
  const { getCurrency, getRecommendedFeedsTitle, getRecommendedFeedsDescription } = useHybridSiteSettingsStore();
  const { feeds, localMixes } = useFeedManagementStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('commercial');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('brand');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const recommendedFeeds = useMemo(() => {
    try {
      setError(null);
      
      // Determine feed stage based on bird type and age
      let feedStage;
      if (birdType === 'layer') {
        feedStage = ageInDays < 126 ? (ageInDays <= 28 ? 'starter' : 'grower') : 'layer';
      } else {
        if (ageInDays <= 28) feedStage = 'starter';
        else if (ageInDays <= 42) feedStage = 'grower';
        else feedStage = 'finisher';
      }
      
      // Get feeds from the management store for the appropriate stage
      return feeds[feedStage] || [];
    } catch (err) {
      logError(err, 'Failed to get recommended feeds', { birdType, ageInDays });
      setError(err);
      addToast({
        type: 'error',
        message: formatErrorForUser(err).message
      });
      return [];
    }
  }, [birdType, ageInDays, feeds, addToast]);

  const localFeedMix = useMemo(() => {
    try {
      // Determine feed stage based on bird type and age
      let feedStage;
      if (birdType === 'layer') {
        feedStage = ageInDays < 126 ? (ageInDays <= 28 ? 'starter' : 'grower') : 'layer';
      } else {
        if (ageInDays <= 28) feedStage = 'starter';
        else if (ageInDays <= 42) feedStage = 'grower';
        else feedStage = 'finisher';
      }
      
      // Get local mix from the management store for the appropriate stage
      return localMixes[feedStage] || null;
    } catch (err) {
      logError(err, 'Failed to get local feed mix', { birdType, ageInDays });
      return null;
    }
  }, [birdType, ageInDays, localMixes]);

  const localFeedCost = useMemo(() => {
    try {
      return localFeedMix ? calculateLocalFeedCost(localFeedMix) : null;
    } catch (err) {
      logError(err, 'Failed to calculate local feed cost', { localFeedMix });
      return null;
    }
  }, [localFeedMix]);

  const filteredFeeds = useMemo(() => {
    let feeds = [...recommendedFeeds];
    
    // Filter by search term
    if (searchTerm) {
      feeds = feeds.filter(feed => 
        feed.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feed.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort feeds
    feeds.sort((a, b) => {
      switch (sortBy) {
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'protein':
          return b.protein - a.protein;
        case 'price':
          const priceA = a.estimatedPrice['25kg'] || 0;
          const priceB = b.estimatedPrice['25kg'] || 0;
          return priceA - priceB;
        default:
          return 0;
      }
    });
    
    return feeds;
  }, [recommendedFeeds, searchTerm, sortBy]);

  const getFeedStage = () => {
    if (birdType === 'layer') {
      return ageInDays < 126 ? (ageInDays <= 28 ? 'starter' : 'grower') : 'layer';
    } else {
      if (ageInDays <= 28) return 'starter';
      if (ageInDays <= 42) return 'grower';
      return 'finisher';
    }
  };

  const tabs = [
    { id: 'commercial', name: 'Commercial Feeds', icon: Package },
    { id: 'local', name: 'Local Mix Recipe', icon: Star }
  ];

  return (
    <div className="max-w-6xl mx-auto space-mobile">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/20 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-accent-600 dark:text-accent-400" />
        </div>
        <h2 className="text-mobile-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {getRecommendedFeedsTitle()}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          {getRecommendedFeedsDescription()} • {birdType} feeds for {getFeedStage()} stage • Age: {ageInDays} days
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-1 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  {
                    'bg-accent-600 text-white shadow-md': isActive,
                    'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700': !isActive,
                  }
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Commercial Feeds Tab */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search feeds by brand or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select w-auto flex-shrink-0"
              >
                <option value="brand">Sort by Brand</option>
                <option value="protein">Sort by Protein</option>
                <option value="price">Sort by Price</option>
              </select>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline btn-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label dark:text-neutral-300">Protein Range</label>
                    <select className="select">
                      <option>All Protein Levels</option>
                      <option>15-18%</option>
                      <option>19-22%</option>
                      <option>23%+</option>
                    </select>
                  </div>
                  <div>
                    <label className="label dark:text-neutral-300">Availability</label>
                    <select className="select">
                      <option>All Locations</option>
                      <option>Nationwide</option>
                      <option>Lagos</option>
                      <option>Northern Nigeria</option>
                    </select>
                  </div>
                  <div>
                    <label className="label dark:text-neutral-300">Package Size</label>
                    <select className="select">
                      <option>All Sizes</option>
                      <option>25kg</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feed Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeeds.map((feed) => (
              <div key={feed.id} className="card-hover p-6">
                {/* Feed Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-100">
                      {feed.brand}
                    </h3>
                    <span className="badge-primary">
                      {feed.protein}% protein
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 font-medium">{feed.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{feed.description}</p>
                </div>

                {/* Feed Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Calcium:</span>
                    <span className="font-medium dark:text-neutral-300">{feed.calcium}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Age Range:</span>
                    <span className="font-medium dark:text-neutral-300">{feed.ageRange}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Available:</span>
                    <span className="font-medium dark:text-neutral-300 text-right">{feed.availability}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Estimated Prices
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(feed.estimatedPrice).map(([size, price]) => (
                      <div key={size} className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">{size}:</span>
                        <span className="font-medium dark:text-neutral-300">₦{price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(feed.estimatedPrice).length > 0 && (
                    <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      ₦{Math.round(feed.estimatedPrice['25kg'] / 25)}/kg
                    </div>
                  )}
                </div>

                {/* Packaging Options */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {feed.packaging.map((size) => (
                      <span key={size} className="badge bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFeeds.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No Feeds Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Local Mix Tab */}
      {activeTab === 'local' && (
        <div className="space-y-6">
          {/* Local Mix Overview */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {localFeedMix.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {localFeedMix.protein}% protein • Cost-effective alternative
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-secondary-600">
                  ₦{Math.round(localFeedCost)}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">per kg</div>
              </div>
            </div>

            <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-xl p-4">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">💰 Cost Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-700 dark:text-secondary-300">Local Mix:</span>
                  <span className="font-semibold text-secondary-900 dark:text-secondary-100 ml-2">
                    ₦{Math.round(localFeedCost)}/kg
                  </span>
                </div>
                <div>
                  <span className="text-secondary-700 dark:text-secondary-300">Commercial Average:</span>
                  <span className="font-semibold text-secondary-900 dark:text-secondary-100 ml-2">
                    ₦320/kg
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-secondary-600 dark:text-secondary-400">
                Potential savings: ₦{Math.round(320 - localFeedCost)}/kg
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              📋 Ingredients & Proportions
            </h3>
            
            <div className="space-y-3">
              {localFeedMix.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {ingredient.name}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {ingredient.percentage}% of total mix
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      ₦{ingredient.pricePerKg}/kg
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      ₦{Math.round(ingredient.percentage * ingredient.pricePerKg / 100)}/kg mix
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Cost Breakdown */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">Total Cost per kg:</span>
                <span className="text-xl font-bold text-secondary-600">
                  ₦{Math.round(localFeedCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Mixing Instructions */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              🔧 Mixing Instructions
            </h3>
            
            <div className="space-y-3">
              {localFeedMix.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-accent-200 dark:bg-accent-800 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-accent-800 dark:text-accent-200">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="alert-warning">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-900 dark:text-accent-100 mb-2">Important Notes</h4>
                <ul className="text-sm text-accent-800 dark:text-accent-200 space-y-1 list-disc list-inside">
                  <li>Ensure all ingredients are fresh and of good quality</li>
                  <li>Mix thoroughly to ensure uniform distribution</li>
                  <li>Store in dry, rodent-proof containers</li>
                  <li>Use within 4 weeks of mixing for best results</li>
                  <li>Adjust proportions based on local ingredient availability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculation Helper */}
          <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              🧮 Batch Calculator
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label dark:text-neutral-300">Batch Size (kg)</label>
                <select className="select">
                  <option value="25">25 kg batch</option>
                  <option value="50">50 kg batch</option>
                  <option value="100">100 kg batch</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">For 25kg batch:</div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Total Cost: ₦{Math.round(localFeedCost * 25).toLocaleString()}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Savings vs Commercial: ₦{Math.round((320 - localFeedCost) * 25).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}