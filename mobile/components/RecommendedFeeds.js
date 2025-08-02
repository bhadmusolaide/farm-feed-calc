import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore } from '../lib/store';
import { FEED_BRANDS, LOCAL_FEED_MIXES, getRecommendedFeeds, getLocalFeedMix, calculateLocalFeedCost } from '../lib/feedBrands.js';
import { useToast } from './Toast';
import { formatErrorForUser, logError } from '../../shared/utils/errorHandling';

export default function RecommendedFeeds() {
  const { birdType, ageInDays } = useFeedStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('commercial');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('brand');
  const [error, setError] = useState(null);

  const recommendedFeeds = useMemo(() => {
    try {
      setError(null);
      return getRecommendedFeeds(birdType, ageInDays);
    } catch (err) {
      logError(err, 'Failed to get recommended feeds', { birdType, ageInDays });
      setError(err);
      const friendly = formatErrorForUser(err);
      addToast({
        type: 'error',
        message: friendly.message
      });
      return [];
    }
  }, [birdType, ageInDays, addToast]);

  const localFeedMix = useMemo(() => {
    try {
      return getLocalFeedMix(birdType, ageInDays);
    } catch (err) {
      logError(err, 'Failed to get local feed mix', { birdType, ageInDays });
      return null;
    }
  }, [birdType, ageInDays]);

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
    { id: 'commercial', name: 'Commercial', icon: 'storefront' },
    { id: 'local', name: 'Local Mix', icon: 'leaf' }
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-6">
        {/* Header */}
        <View className="text-center">
          <View className="w-16 h-16 bg-accent-100 rounded-2xl items-center justify-center mx-auto mb-4">
            <Ionicons name="nutrition" size={32} color="#ca8a04" />
          </View>
          <Text className="text-mobile-2xl font-bold text-neutral-900 mb-2">
            Recommended Feeds
          </Text>
          <Text className="text-neutral-600">
            {birdType} feeds for {getFeedStage()} stage • {ageInDays} days
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="card p-1">
          <View className="flex-row space-x-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-mobile ${
                    isActive ? 'bg-accent-600' : 'bg-transparent'
                  }`}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? 'white' : '#64748b'}
                  />
                  <Text
                    className={`text-mobile-sm font-medium ml-2 ${
                      isActive ? 'text-white' : 'text-neutral-600'
                    }`}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Commercial Feeds Tab */}
        {activeTab === 'commercial' && (
          <View className="space-y-4">
            {/* Search and Sort */}
            <View className="card">
              <View className="space-y-3">
                {/* Search */}
                <View className="relative">
                  <Ionicons
                    name="search"
                    size={20}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
                  />
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search feeds by brand or name..."
                    className="input pl-10"
                  />
                </View>
                
                {/* Sort Options */}
                <View className="flex-row space-x-2">
                  {[
                    { id: 'brand', name: 'Brand' },
                    { id: 'protein', name: 'Protein' },
                    { id: 'price', name: 'Price' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => setSortBy(option.id)}
                      className={`px-3 py-2 rounded-mobile border ${
                        sortBy === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-mobile-sm ${
                          sortBy === option.id ? 'text-primary-700 font-medium' : 'text-neutral-600'
                        }`}
                      >
                        Sort by {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Feed Cards */}
            <View className="space-y-4">
              {filteredFeeds.map((feed) => (
                <View key={feed.id} className="card">
                  {/* Feed Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-mobile-lg font-semibold text-neutral-900">
                        {feed.brand}
                      </Text>
                      <Text className="text-neutral-600 font-medium">{feed.name}</Text>
                    </View>
                    <View className="badge-primary">
                      <Text className="text-mobile-xs font-medium">
                        {feed.protein}% protein
                      </Text>
                    </View>
                  </View>

                  <Text className="text-mobile-sm text-neutral-500 mb-4">
                    {feed.description}
                  </Text>

                  {/* Feed Details Grid */}
                  <View className="space-y-2 mb-4">
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-600">Calcium:</Text>
                      <Text className="font-medium">{feed.calcium}%</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-600">Age Range:</Text>
                      <Text className="font-medium">{feed.ageRange}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-neutral-600">Available:</Text>
                      <Text className="font-medium text-right flex-1 ml-2">
                        {feed.availability}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing */}
                  <View className="border-t border-neutral-200 pt-4">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="pricetag" size={16} color="#64748b" />
                      <Text className="text-mobile-sm font-medium text-neutral-900 ml-2">
                        Estimated Prices
                      </Text>
                    </View>
                    
                    <View className="space-y-1">
                      {Object.entries(feed.estimatedPrice).map(([size, price]) => (
                        <View key={size} className="flex-row justify-between">
                          <Text className="text-mobile-sm text-neutral-600">{size}:</Text>
                          <Text className="text-mobile-sm font-medium">
                            ₦{price.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    <View className="mt-2">
                      <Text className="text-mobile-xs text-neutral-500">
                        ₦{Math.round(feed.estimatedPrice['25kg'] / 25)}/kg
                      </Text>
                    </View>
                  </View>

                  {/* Packaging Options */}
                  <View className="mt-4">
                    <Text className="text-mobile-sm font-medium text-neutral-900 mb-2">
                      Available Sizes:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {feed.packaging.map((size, index) => (
                        <View key={size} className="badge bg-neutral-100 text-neutral-700 mr-2 mb-1">
                          <Text className="text-mobile-xs">{size}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {filteredFeeds.length === 0 && (
              <View className="text-center py-12">
                <Ionicons name="storefront-outline" size={64} color="#94a3b8" />
                <Text className="text-mobile-lg font-medium text-neutral-600 mt-4 mb-2">
                  No Feeds Found
                </Text>
                <Text className="text-neutral-500 text-center">
                  Try adjusting your search criteria.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Local Mix Tab */}
        {activeTab === 'local' && (
          <View className="space-y-6">
            {/* Local Mix Overview */}
            <View className="card">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-mobile-xl font-semibold text-neutral-900 mb-2">
                    {localFeedMix.name}
                  </Text>
                  <Text className="text-neutral-600">
                    {localFeedMix.protein}% protein • Cost-effective alternative
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-mobile-2xl font-bold text-secondary-600">
                    ₦{Math.round(localFeedCost)}
                  </Text>
                  <Text className="text-mobile-sm text-neutral-500">per kg</Text>
                </View>
              </View>

              <View className="bg-secondary-50 rounded-mobile p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="wallet" size={20} color="#475569" />
                  <Text className="font-medium text-secondary-900 ml-2">
                    Cost Comparison
                  </Text>
                </View>
                
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-secondary-700">Local Mix:</Text>
                    <Text className="font-semibold text-secondary-900">
                      ₦{Math.round(localFeedCost)}/kg
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-secondary-700">Commercial Average:</Text>
                    <Text className="font-semibold text-secondary-900">
                      ₦320/kg
                    </Text>
                  </View>
                  <View className="h-px bg-secondary-200 my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-secondary-700">Potential Savings:</Text>
                    <Text className="font-bold text-success-600">
                      ₦{Math.round(320 - localFeedCost)}/kg
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Ingredients List */}
            <View className="card">
              <View className="flex-row items-center mb-4">
                <Ionicons name="list" size={20} color="#64748b" />
                <Text className="text-mobile-lg font-semibold text-neutral-900 ml-2">
                  Ingredients & Proportions
                </Text>
              </View>
              
              <View className="space-y-3">
                {localFeedMix.ingredients.map((ingredient, index) => (
                  <View key={index} className="flex-row items-center justify-between p-3 bg-neutral-50 rounded-mobile">
                    <View className="flex-1">
                      <Text className="font-medium text-neutral-900">
                        {ingredient.name}
                      </Text>
                      <Text className="text-mobile-sm text-neutral-600">
                        {ingredient.percentage}% of total mix
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-semibold text-neutral-900">
                        ₦{ingredient.pricePerKg}/kg
                      </Text>
                      <Text className="text-mobile-xs text-neutral-500">
                        ₦{Math.round(ingredient.percentage * ingredient.pricePerKg / 100)}/kg mix
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total Cost */}
              <View className="mt-4 pt-4 border-t border-neutral-200">
                <View className="flex-row justify-between items-center">
                  <Text className="font-medium text-neutral-900">Total Cost per kg:</Text>
                  <Text className="text-mobile-xl font-bold text-secondary-600">
                    ₦{Math.round(localFeedCost)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Mixing Instructions */}
            <View className="card">
              <View className="flex-row items-center mb-4">
                <Ionicons name="construct" size={20} color="#64748b" />
                <Text className="text-mobile-lg font-semibold text-neutral-900 ml-2">
                  Mixing Instructions
                </Text>
              </View>
              
              <View className="space-y-3">
                {localFeedMix.instructions.map((instruction, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-6 h-6 bg-accent-200 rounded-full items-center justify-center mt-0.5 mr-3">
                      <Text className="text-mobile-xs font-medium text-accent-800">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-mobile-sm text-neutral-700 leading-relaxed">
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Important Notes */}
            <View className="bg-warning-50 rounded-mobile-lg p-4 border border-warning-200">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#d97706" />
                <View className="ml-3 flex-1">
                  <Text className="text-mobile-sm font-medium text-warning-800 mb-2">
                    Important Notes
                  </Text>
                  <View className="space-y-1">
                    {[
                      'Ensure all ingredients are fresh and of good quality',
                      'Mix thoroughly to ensure uniform distribution',
                      'Store in dry, rodent-proof containers',
                      'Use within 4 weeks of mixing for best results',
                      'Adjust proportions based on local ingredient availability'
                    ].map((note, index) => (
                      <View key={index} className="flex-row items-start">
                        <Text className="text-warning-700 mr-2">•</Text>
                        <Text className="flex-1 text-mobile-xs text-warning-700">
                          {note}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Batch Calculator */}
            <View className="card bg-gradient-to-r from-primary-50 to-secondary-50">
              <View className="flex-row items-center mb-4">
                <Ionicons name="calculator" size={20} color="#64748b" />
                <Text className="text-mobile-lg font-semibold text-neutral-900 ml-2">
                  Batch Calculator
                </Text>
              </View>
              
              <View className="space-y-4">
                <View>
                  <Text className="label">Batch Size</Text>
                  <View className="flex-row space-x-2">
                    {['25', '50', '100'].map((size) => (
                      <TouchableOpacity
                        key={size}
                        className="flex-1 p-3 border border-neutral-300 rounded-mobile bg-white items-center"
                      >
                        <Text className="text-mobile-sm font-medium text-neutral-900">
                          {size}kg
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View className="bg-white rounded-mobile p-4">
                  <Text className="text-mobile-sm text-neutral-600 mb-1">
                    For 25kg batch:
                  </Text>
                  <Text className="text-mobile-lg font-semibold text-neutral-900">
                    Total Cost: ₦{Math.round(localFeedCost * 25).toLocaleString()}
                  </Text>
                  <Text className="text-mobile-sm text-success-600">
                    Savings: ₦{Math.round((320 - localFeedCost) * 25).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}