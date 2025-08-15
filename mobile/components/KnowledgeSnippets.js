import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowledgeStore } from '../lib/store';
import { getWeeklyKnowledge, getSeasonalTips, getEmergencyAdvice, getAllKnowledgeSnippets } from '../lib/knowledgeSnippets.js';
import DiseaseGuide from './DiseaseGuide';

export default function KnowledgeSnippets() {
  const { favorites, addToFavorites, removeFromFavorites } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState('diseases');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const weeklyTip = useMemo(() => {
    return getWeeklyKnowledge();
  }, [currentWeek]);

  const seasonalAdvice = useMemo(() => {
    return getSeasonalTips();
  }, []);

  const emergencySigns = useMemo(() => {
    return getEmergencyAdvice();
  }, []);

  const filteredEmergencySigns = useMemo(() => {
    let signs = [...emergencySigns];
    
    if (searchTerm) {
      signs = signs.filter(sign => 
        sign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      signs = signs.filter(sign => sign.category === selectedCategory);
    }
    
    return signs;
  }, [emergencySigns, searchTerm, selectedCategory]);

  const favoriteSnippets = useMemo(() => {
    const allSnippets = getAllKnowledgeSnippets();
    const flatSnippets = [
      ...allSnippets.weeklyTips.map(tip => ({ ...tip, type: 'weekly' })),
      ...allSnippets.seasonalAdvice.map(advice => ({ ...advice, type: 'seasonal' })),
      ...allSnippets.emergencyTips.map(tip => ({ ...tip, type: 'emergency' })),
      ...allSnippets.zodiacSigns.map(sign => ({ ...sign, type: 'zodiac' }))
    ];
    
    return flatSnippets.filter(snippet => favorites.includes(snippet.id));
  }, [favorites]);

  const isFavorite = (id) => favorites.includes(id);

  const toggleFavorite = (id) => {
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(id);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-error-600';
      case 'medium':
        return 'text-warning-600';
      case 'low':
        return 'text-success-600';
      default:
        return 'text-neutral-600';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-error-100 border-error-200';
      case 'medium':
        return 'bg-warning-100 border-warning-200';
      case 'low':
        return 'bg-success-100 border-success-200';
      default:
        return 'bg-neutral-100 border-neutral-200';
    }
  };

  const tabs = [
    { id: 'diseases', name: 'Disease Guide', icon: 'shield' },
    { id: 'seasonal', name: 'Seasonal', icon: 'leaf' },
    { id: 'emergency', name: 'Emergency', icon: 'medical' },
    { id: 'weekly', name: 'Weekly Tips', icon: 'calendar' },
    { id: 'favorites', name: 'Favorites', icon: 'heart' }
  ];

  const emergencyCategories = [
    { id: 'all', name: 'All' },
    { id: 'health', name: 'Health' },
    { id: 'management', name: 'Management' },
    { id: 'traditional', name: 'Traditional' }
  ];

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-6">
        {/* Header */}
        <View className="text-center">
          <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mx-auto mb-4">
            <Ionicons name="library" size={32} color="#2563eb" />
          </View>
          <Text className="text-mobile-2xl font-bold text-neutral-900 mb-2">
            Knowledge Center
          </Text>
          <Text className="text-neutral-600">
            Expert tips and guidance for better poultry management
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="card p-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className={`flex-row items-center justify-center px-4 py-3 rounded-mobile ${
                      isActive ? 'bg-primary-600' : 'bg-transparent'
                    }`}
                    style={{ minWidth: 100 }}
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
                    {tab.id === 'favorites' && favorites.length > 0 && (
                      <View className="ml-1 w-5 h-5 bg-error-500 rounded-full items-center justify-center">
                        <Text className="text-white text-mobile-xs font-bold">
                          {favorites.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Weekly Tips Tab */}
        {activeTab === 'weekly' && (
          <View className="space-y-4">
            {/* Week Navigator */}
            <View className="card">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                  disabled={currentWeek === 1}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    currentWeek === 1 ? 'bg-neutral-100' : 'bg-primary-100'
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentWeek === 1 ? '#94a3b8' : '#2563eb'}
                  />
                </TouchableOpacity>
                
                <View className="items-center">
                  <Text className="text-mobile-lg font-semibold text-neutral-900">
                    Week {currentWeek}
                  </Text>
                  <Text className="text-mobile-sm text-neutral-600">
                    of 52 weeks
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setCurrentWeek(Math.min(52, currentWeek + 1))}
                  disabled={currentWeek === 52}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    currentWeek === 52 ? 'bg-neutral-100' : 'bg-primary-100'
                  }`}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentWeek === 52 ? '#94a3b8' : '#2563eb'}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Week Progress */}
              <View className="bg-neutral-200 rounded-full h-2">
                <View
                  className="bg-primary-600 rounded-full h-2"
                  style={{ width: `${(currentWeek / 52) * 100}%` }}
                />
              </View>
            </View>

            {/* Weekly Tip Card */}
            <View className="card">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-mobile-xl font-semibold text-neutral-900 mb-2">
                    {weeklyTip.title}
                  </Text>
                  <View className="badge-primary">
                    <Text className="text-mobile-xs font-medium">
                      {weeklyTip.category}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleFavorite(weeklyTip.id)}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Ionicons
                    name={isFavorite(weeklyTip.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite(weeklyTip.id) ? '#ef4444' : '#94a3b8'}
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-mobile-sm text-neutral-700 leading-relaxed mb-4">
                {weeklyTip.content}
              </Text>

              {weeklyTip.tips && weeklyTip.tips.length > 0 && (
                <View className="space-y-2">
                  <Text className="text-mobile-sm font-medium text-neutral-900">
                    Key Points:
                  </Text>
                  {weeklyTip.tips.map((tip, index) => (
                    <View key={index} className="flex-row items-start">
                      <View className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-3" />
                      <Text className="flex-1 text-mobile-sm text-neutral-700">
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {weeklyTip.actionItems && weeklyTip.actionItems.length > 0 && (
                <View className="mt-4 p-4 bg-accent-50 rounded-mobile">
                  <Text className="text-mobile-sm font-medium text-accent-900 mb-2">
                    Action Items:
                  </Text>
                  {weeklyTip.actionItems.map((item, index) => (
                    <View key={index} className="flex-row items-start mb-1">
                      <Ionicons name="checkmark-circle" size={16} color="#ca8a04" />
                      <Text className="flex-1 text-mobile-sm text-accent-800 ml-2">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Seasonal Tab */}
        {activeTab === 'seasonal' && (
          <View className="space-y-4">
            {seasonalAdvice.map((advice) => (
              <View key={advice.id} className="card">
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-mobile-xl font-semibold text-neutral-900 mb-2">
                      {advice.title}
                    </Text>
                    <View className="flex-row space-x-2">
                      <View className="badge-secondary">
                        <Text className="text-mobile-xs font-medium">
                          {advice.season}
                        </Text>
                      </View>
                      <View className="badge bg-neutral-100 text-neutral-700">
                        <Text className="text-mobile-xs font-medium">
                          {advice.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                  onPress={() => toggleFavorite(advice.id)}
                  className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons
                      name={isFavorite(advice.id) ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isFavorite(advice.id) ? '#ef4444' : '#94a3b8'}
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-mobile-sm text-neutral-700 leading-relaxed mb-4">
                  {advice.content}
                </Text>

                {advice.recommendations && advice.recommendations.length > 0 && (
                  <View className="space-y-2">
                    <Text className="text-mobile-sm font-medium text-neutral-900">
                      Recommendations:
                    </Text>
                    {advice.recommendations.map((rec, index) => (
                      <View key={index} className="flex-row items-start">
                        <View className="w-1.5 h-1.5 bg-secondary-600 rounded-full mt-2 mr-3" />
                        <Text className="flex-1 text-mobile-sm text-neutral-700">
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Emergency Signs Tab */}
        {activeTab === 'emergency' && (
          <View className="space-y-4">
            {/* Search and Filter */}
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
                    placeholder="Search emergency signs..."
                    className="input pl-10"
                  />
                </View>
                
                {/* Category Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2">
                    {emergencyCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        className={`px-3 py-2 rounded-mobile border ${
                          selectedCategory === category.id
                            ? 'border-error-500 bg-error-50'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-mobile-sm ${
                            selectedCategory === category.id
                              ? 'text-error-700 font-medium'
                              : 'text-neutral-600'
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Emergency Signs List */}
            <View className="space-y-4">
              {filteredEmergencySigns.map((sign) => (
                <View key={sign.id} className={`card border-l-4 ${getSeverityBg(sign.severity)}`}>
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <Text className="text-mobile-xl font-semibold text-neutral-900 mb-2">
                        {sign.title}
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        <View className={`badge ${getSeverityBg(sign.severity)}`}>
                          <Text className={`text-mobile-xs font-medium ${getSeverityColor(sign.severity)}`}>
                            {sign.severity.toUpperCase()} PRIORITY
                          </Text>
                        </View>
                        <View className="badge bg-neutral-100 text-neutral-700">
                          <Text className="text-mobile-xs font-medium">
                            {sign.category}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                  onPress={() => toggleFavorite(sign.id)}
                  className="w-10 h-10 items-center justify-center"
                >
                      <Ionicons
                        name={isFavorite(sign.id) ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite(sign.id) ? '#ef4444' : '#94a3b8'}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-mobile-sm text-neutral-700 leading-relaxed mb-4">
                    {sign.description}
                  </Text>

                  {/* Symptoms */}
                  <View className="mb-4">
                    <Text className="text-mobile-sm font-medium text-neutral-900 mb-2">
                      Symptoms to Watch For:
                    </Text>
                    <View className="space-y-1">
                      {sign.symptoms.map((symptom, index) => (
                        <View key={index} className="flex-row items-start">
                          <Ionicons name="alert-circle" size={16} color="#ef4444" />
                          <Text className="flex-1 text-mobile-sm text-neutral-700 ml-2">
                            {symptom}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Immediate Actions */}
                  <View className={`p-4 rounded-mobile ${getSeverityBg(sign.severity)}`}>
                    <Text className={`text-mobile-sm font-medium mb-2 ${getSeverityColor(sign.severity)}`}>
                      Immediate Actions:
                    </Text>
                    <View className="space-y-1">
                      {sign.immediateActions.map((action, index) => (
                        <View key={index} className="flex-row items-start">
                          <Text className={getSeverityColor(sign.severity)}>•</Text>
                          <Text className={`flex-1 text-mobile-sm ml-2 ${getSeverityColor(sign.severity)}`}>
                            {action}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Prevention */}
                  {sign.prevention && sign.prevention.length > 0 && (
                    <View className="mt-4">
                      <Text className="text-mobile-sm font-medium text-neutral-900 mb-2">
                        Prevention Tips:
                      </Text>
                      <View className="space-y-1">
                        {sign.prevention.map((tip, index) => (
                          <View key={index} className="flex-row items-start">
                            <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
                            <Text className="flex-1 text-mobile-sm text-neutral-700 ml-2">
                              {tip}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {filteredEmergencySigns.length === 0 && (
              <View className="text-center py-12">
                <Ionicons name="medical-outline" size={64} color="#94a3b8" />
                <Text className="text-mobile-lg font-medium text-neutral-600 mt-4 mb-2">
                  No Emergency Signs Found
                </Text>
                <Text className="text-neutral-500 text-center">
                  Try adjusting your search or filter criteria.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Disease Guide Tab */}
        {activeTab === 'diseases' && (
          <DiseaseGuide />
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <View className="space-y-4">
            {favoriteSnippets.length > 0 ? (
              favoriteSnippets.map((snippet) => (
                <View key={`${snippet.type}-${snippet.id}`} className="card">
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <Text className="text-mobile-xl font-semibold text-neutral-900 mb-2">
                        {snippet.title}
                      </Text>
                      <View className="flex-row space-x-2">
                        <View className="badge-primary">
                          <Text className="text-mobile-xs font-medium">
                            {snippet.type === 'weekly' ? `Week ${snippet.week}` : snippet.type}
                          </Text>
                        </View>
                        {snippet.category && (
                          <View className="badge bg-neutral-100 text-neutral-700">
                            <Text className="text-mobile-xs font-medium">
                              {snippet.category}
                            </Text>
                          </View>
                        )}
                        {snippet.severity && (
                          <View className={`badge ${getSeverityBg(snippet.severity)}`}>
                            <Text className={`text-mobile-xs font-medium ${getSeverityColor(snippet.severity)}`}>
                              {snippet.severity.toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                  onPress={() => toggleFavorite(snippet.id)}
                  className="w-10 h-10 items-center justify-center"
                >
                      <Ionicons
                        name="heart"
                        size={24}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-mobile-sm text-neutral-700 leading-relaxed">
                    {snippet.content || snippet.description}
                  </Text>
                </View>
              ))
            ) : (
              <View className="text-center py-12">
                <Ionicons name="heart-outline" size={64} color="#94a3b8" />
                <Text className="text-mobile-lg font-medium text-neutral-600 mt-4 mb-2">
                  No Favorites Yet
                </Text>
                <Text className="text-neutral-500 text-center">
                  Tap the heart icon on any tip to save it here.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}