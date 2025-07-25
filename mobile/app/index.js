import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore, useOfflineStore } from '../lib/store';
import { router } from 'expo-router';

// Import components
import FeedCalculator from '../components/FeedCalculator';
import FeedResults from '../components/FeedResults';
import RecommendedFeeds from '../components/RecommendedFeeds';
import KnowledgeSnippets from '../components/KnowledgeSnippets';
import OfflineIndicator from '../components/OfflineIndicator';

const tabs = [
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'calculator-outline',
    activeIcon: 'calculator',
  },
  {
    id: 'results',
    name: 'Results',
    icon: 'analytics-outline',
    activeIcon: 'analytics',
  },
  {
    id: 'feeds',
    name: 'Feeds',
    icon: 'nutrition-outline',
    activeIcon: 'nutrition',
  },
  {
    id: 'knowledge',
    name: 'Tips',
    icon: 'book-outline',
    activeIcon: 'book',
  },
];

export default function HomePage() {
  const { activeTab, setActiveTab, hasCalculated, resetForm } = useFeedStore();
  const { isOnline } = useOfflineStore();

  const handleTabPress = (tabId) => {
    if (tabId === 'results' && !hasCalculated) {
      Alert.alert(
        'No Results Yet',
        'Please calculate feed requirements first.',
        [{ text: 'OK' }]
      );
      return;
    }
    setActiveTab(tabId);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Calculator',
      'This will clear all inputs and results. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: resetForm
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <FeedCalculator />;
      case 'results':
        return <FeedResults />;
      case 'feeds':
        return <RecommendedFeeds />;
      case 'knowledge':
        return <KnowledgeSnippets />;
      default:
        return <FeedCalculator />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="bg-white px-mobile py-3 border-b border-neutral-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="nutrition" size={20} color="#0284c7" />
            </View>
            <View>
              <Text className="text-mobile-lg font-semibold text-neutral-900">
                Feed Calculator
              </Text>
              <Text className="text-mobile-sm text-neutral-600">
                Poultry nutrition made simple
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={handleReset}
              className="p-2 rounded-lg bg-neutral-100"
            >
              <Ionicons name="refresh-outline" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/about')}
              className="p-2 rounded-lg bg-neutral-100"
            >
              <Ionicons name="information-circle-outline" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/disclaimer')}
              className="p-2 rounded-lg bg-neutral-100"
            >
              <Ionicons name="document-text-outline" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              className="p-2 rounded-lg bg-neutral-100"
            >
              <Ionicons name="settings-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Offline Indicator */}
      {!isOnline && <OfflineIndicator />}

      {/* Tab Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-mobile py-mobile">
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View className="bg-white border-t border-neutral-200 safe-area-bottom">
        <View className="flex-row">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.id === 'results' && !hasCalculated;
            
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                disabled={isDisabled}
                className={`flex-1 items-center py-3 ${
                  isDisabled ? 'opacity-50' : ''
                }`}
              >
                <View className="items-center">
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={24}
                    color={isActive ? '#0284c7' : '#94a3b8'}
                  />
                  <Text
                    className={`text-mobile-xs mt-1 ${
                      isActive ? 'text-primary-600 font-medium' : 'text-neutral-400'
                    }`}
                  >
                    {tab.name}
                  </Text>
                  {tab.id === 'results' && hasCalculated && (
                    <View className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}