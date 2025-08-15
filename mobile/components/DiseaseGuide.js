import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useKnowledgeStore, useFeedStore } from '../lib/store';
import { DISEASE_DATA, VACCINATION_SCHEDULES, EMERGENCY_PROTOCOLS, getDiseasesByWeek, getDiseasesByBreed } from '../../shared/data/diseaseGuide.js';
import { useRouter } from 'expo-router';

export default function DiseaseGuide() {
  const router = useRouter();
  const { breed } = useFeedStore();
  const { favorites, addToFavorites, removeFromFavorites } = useKnowledgeStore();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeView, setActiveView] = useState('diseases'); // diseases, emergency

  // Redirect to calculator if no breed is selected
  useEffect(() => {
    if (!breed) {
      router.push('/');
    }
  }, [breed, router]);

  const weeklyDiseases = useMemo(() => {
    return breed ? getDiseasesByWeek(selectedWeek, breed) : [];
  }, [selectedWeek, breed]);

  const breedDiseases = useMemo(() => {
    return breed ? getDiseasesByBreed(breed) : [];
  }, [breed]);

  const vaccinationSchedule = useMemo(() => {
    return VACCINATION_SCHEDULES[breed] || VACCINATION_SCHEDULES['default'];
  }, [breed]);

  // Get all diseases from all weeks for search functionality
  const getAllDiseases = useMemo(() => {
    const allDiseases = [];
    Object.entries(DISEASE_DATA).forEach(([weekKey, weekData]) => {
      if (weekData.commonDiseases) {
        Object.entries(weekData.commonDiseases).forEach(([diseaseKey, disease]) => {
          allDiseases.push({
            id: diseaseKey,
            week: weekKey,
            weekNumber: parseInt(weekKey.replace('week', '')),
            ...disease
          });
        });
      }
    });
    return allDiseases;
  }, []);

  const filteredDiseases = useMemo(() => {
    // Use all diseases for search, weekly diseases for display when no search
    const diseasesToFilter = searchTerm ? getAllDiseases : weeklyDiseases;
    
    return diseasesToFilter.filter(disease => {
      if (selectedCategory !== 'all' && disease.category !== selectedCategory) return false;
      if (!searchTerm) return true;
      
      // Search in disease name
      if (disease.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      
      // Search in symptoms
      if (disease.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))) return true;
      
      // Search in treatment medication (handle object structure)
      if (disease.treatment && disease.treatment.medication) {
        const medication = disease.treatment.medication;
        if (typeof medication === 'string') {
          return medication.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (typeof medication === 'object') {
          // Search in all medication fields (primary, alternative, supportive, etc.)
          return Object.values(medication).some(med => 
            typeof med === 'string' && med.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      }
      
      return false;
    });
  }, [weeklyDiseases, selectedCategory, searchTerm, getAllDiseases]);

  const diseaseCategories = [
    { id: 'all', name: 'All Diseases' },
    { id: 'respiratory', name: 'Respiratory' },
    { id: 'digestive', name: 'Digestive' },
    { id: 'metabolic', name: 'Metabolic' },
    { id: 'infectious', name: 'Infectious' }
  ];

  const weeks = [1, 2, 3, 4, 5, 6];

  const isFavorite = (disease) => {
    return favorites.includes(`disease-${disease.id}`);
  };

  const toggleFavorite = (disease) => {
    const diseaseId = `disease-${disease.id}`;
    if (isFavorite(disease)) {
      removeFromFavorites(diseaseId);
    } else {
      addToFavorites(diseaseId);
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



  if (!breed) {
    return (
      <ScrollView className="flex-1 bg-neutral-50">
        <View className="p-6">
          <View className="text-center py-12">
            <Ionicons name="calculator" size={64} color="#3b82f6" />
            <Text className="text-mobile-lg font-medium text-neutral-600 mt-4 mb-2">
              No Breed Selected
            </Text>
            <Text className="text-neutral-500 text-center mb-4">
              Please select a breed in the calculator to access breed-specific disease information.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              className="btn-primary"
            >
              <Text className="text-white font-medium">Go to Calculator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="p-6">
        {/* Header */}
        <View className="text-center mb-8">
          <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mx-auto mb-4">
            <Ionicons name="shield" size={32} color="#3b82f6" />
          </View>
          <Text className="text-mobile-2xl font-bold text-neutral-900 mb-2">
            Disease Guide - {breed}
          </Text>
          <Text className="text-neutral-600 text-center">
            Comprehensive disease management for broiler chickens (Week 1-6)
          </Text>
        </View>

        {/* Navigation Tabs */}
        <View className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-1 mb-6">
          <View className="flex-row">
            {[
              { id: 'diseases', name: 'Diseases', icon: 'medical' },
              { id: 'emergency', name: 'Emergency', icon: 'warning' }
            ].map((tab) => {
              const isActive = activeView === tab.id;
              
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveView(tab.id)}
                  className={`flex-1 flex-row items-center justify-center px-3 py-3 rounded-xl ${
                    isActive
                      ? 'bg-primary-600'
                      : 'bg-transparent'
                  }`}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={16} 
                    color={isActive ? '#ffffff' : '#6b7280'} 
                  />
                  <Text className={`ml-2 text-mobile-xs font-medium ${
                    isActive ? 'text-white' : 'text-neutral-600'
                  }`}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>



        {/* Diseases Tab */}
        {activeView === 'diseases' && (
          <View className="space-y-4">
            {/* Week Selection */}
            <View className="card p-6">
              <Text className="text-mobile-lg font-semibold text-neutral-900 mb-4">
                Select Week
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {weeks.map((week) => (
                  <TouchableOpacity
                    key={week}
                    onPress={() => setSelectedWeek(week)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedWeek === week
                        ? 'bg-primary-600'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <Text className={`text-mobile-sm font-medium ${
                      selectedWeek === week ? 'text-white' : 'text-neutral-600'
                    }`}>
                      Week {week}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search and Filter */}
            <View className="card p-6">
              <View className="space-y-4">
                <View className="relative">
                  <TextInput
                    placeholder="Search diseases, symptoms, treatments..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    className="w-full pl-4 pr-4 py-3 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                  />
                </View>
                <View className="relative">
                  <Text className="text-mobile-sm font-medium text-neutral-700 mb-2">
                    Category Filter
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {diseaseCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        className={`px-3 py-2 rounded-lg border ${
                          selectedCategory === category.id
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-white border-neutral-200'
                        }`}
                      >
                        <Text className={`text-mobile-xs font-medium ${
                          selectedCategory === category.id ? 'text-white' : 'text-neutral-600'
                        }`}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Disease List */}
            <View className="space-y-4">
              {filteredDiseases.map((disease) => {
                // Get vaccinations from weekly data structure
                const weekData = DISEASE_DATA[`week${selectedWeek}`];
                const weekVaccinations = weekData?.vaccinations ? [
                  ...(weekData.vaccinations.required || []),
                  ...(weekData.vaccinations.optional || [])
                ] : [];
                
                // Also get breed-specific vaccinations
                const allVaccinations = [
                  ...(vaccinationSchedule.critical_vaccines || []),
                  ...(vaccinationSchedule.optional_vaccines || []),
                  ...weekVaccinations
                ];
                const relevantVaccinations = allVaccinations.filter(v => 
                  v.vaccine.toLowerCase().includes(disease.name.toLowerCase()) ||
                  disease.name.toLowerCase().includes(v.vaccine.toLowerCase())
                );
                
                return (
                  <View key={disease.id} className="card p-6">
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="flex-1">
                        <Text className="text-mobile-lg font-semibold text-neutral-900 mb-2">
                          {disease.name}
                          {searchTerm && disease.weekNumber && (
                            <Text className="text-mobile-sm font-normal text-primary-600">
                              {' '}(Week {disease.weekNumber})
                            </Text>
                          )}
                        </Text>
                        <View className="flex-row space-x-2">
                          <View className={`badge ${getSeverityBg(disease.severity)}`}>
                            <Text className={`text-mobile-xs font-medium ${getSeverityColor(disease.severity)}`}>
                              {disease.severity.toUpperCase()}
                            </Text>
                          </View>
                          <View className="badge bg-primary-100 border-primary-200">
                            <Text className="text-mobile-xs font-medium text-primary-600">
                              {disease.category}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(disease)}
                        className="w-10 h-10 items-center justify-center"
                      >
                        <Ionicons
                          name={isFavorite(disease) ? 'heart' : 'heart-outline'}
                          size={24}
                          color={isFavorite(disease) ? '#ef4444' : '#94a3b8'}
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <Text className="text-neutral-600 mb-4">
                      {disease.description}
                    </Text>
                    
                    {/* Symptoms */}
                    <View className="mb-4">
                      <Text className="text-mobile-sm font-semibold text-neutral-900 mb-2">
                        Symptoms
                      </Text>
                      <View className="space-y-1">
                        {disease.symptoms.map((symptom, index) => (
                          <View key={index} className="flex-row items-start">
                            <Text className="text-red-500 mr-2">•</Text>
                            <Text className="text-mobile-sm text-neutral-600 flex-1">{symptom}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    {/* Treatment */}
                    <View className="mb-4">
                      <Text className="text-mobile-sm font-semibold text-neutral-900 mb-2">
                        Treatment
                      </Text>
                      <View className="bg-neutral-50 rounded-lg p-3">
                        {disease.treatment.medication && typeof disease.treatment.medication === 'object' ? (
                          <View className="space-y-2">
                            {disease.treatment.medication.primary && (
                              <Text className="text-mobile-sm text-neutral-600">
                                <Text className="font-medium">Primary:</Text> {disease.treatment.medication.primary}
                              </Text>
                            )}
                            {disease.treatment.medication.alternative && (
                              <Text className="text-mobile-sm text-neutral-600">
                                <Text className="font-medium">Alternative:</Text> {disease.treatment.medication.alternative}
                              </Text>
                            )}
                            {disease.treatment.medication.supportive && (
                              <Text className="text-mobile-sm text-neutral-600">
                                <Text className="font-medium">Supportive:</Text> {disease.treatment.medication.supportive}
                              </Text>
                            )}
                          </View>
                        ) : (
                          <Text className="text-mobile-sm text-neutral-600 mb-1">
                            <Text className="font-medium">Medication:</Text> {disease.treatment.medication}
                          </Text>
                        )}
                        <Text className="text-mobile-sm text-neutral-600 mb-1">
                          <Text className="font-medium">Dosage:</Text> {disease.treatment.dosage}
                        </Text>
                        <Text className="text-mobile-sm text-neutral-600">
                          <Text className="font-medium">Duration:</Text> {disease.treatment.duration}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Relevant Vaccinations */}
                    {relevantVaccinations.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-mobile-sm font-semibold text-neutral-900 mb-2">
                          Related Vaccinations
                        </Text>
                        <View className="space-y-2">
                          {relevantVaccinations.slice(0, 2).map((vaccination, index) => (
                            <View key={index} className="bg-blue-50 rounded-lg p-3">
                              <Text className="text-mobile-sm font-medium text-blue-900 mb-1">
                                {vaccination.vaccine} - {vaccination.timing || `Day ${vaccination.day}`}
                              </Text>
                              <Text className="text-mobile-xs text-blue-700 mb-2">
                                Method: {vaccination.method}
                              </Text>
                              
                              {/* Enhanced dosage information */}
                              {vaccination.dosage && typeof vaccination.dosage === 'object' ? (
                                <View className="mb-2">
                                  <Text className="text-mobile-xs font-medium text-blue-800 mb-1">Dosage:</Text>
                                  {vaccination.dosage.drinking_water && (
                                    <Text className="text-mobile-xs text-blue-700">
                                      Drinking Water: {vaccination.dosage.drinking_water}
                                    </Text>
                                  )}
                                  {vaccination.dosage.injection && (
                                    <Text className="text-mobile-xs text-blue-700">
                                      Injection: {vaccination.dosage.injection}
                                    </Text>
                                  )}
                                  {vaccination.dosage.spray && (
                                    <Text className="text-mobile-xs text-blue-700">
                                      Spray: {vaccination.dosage.spray}
                                    </Text>
                                  )}
                                  {vaccination.dosage.volume && (
                                    <Text className="text-mobile-xs text-blue-700">
                                      Volume: {vaccination.dosage.volume}
                                    </Text>
                                  )}
                                  {vaccination.dosage.concentration && (
                                    <Text className="text-mobile-xs text-blue-700">
                                      Concentration: {vaccination.dosage.concentration}
                                    </Text>
                                  )}
                                </View>
                              ) : vaccination.dosage ? (
                                <Text className="text-mobile-xs text-blue-700 mb-1">
                                  Dosage: {vaccination.dosage}
                                </Text>
                              ) : null}
                              
                              {/* Administration details */}
                              {vaccination.administration && (
                                <View className="mb-1">
                                  <Text className="text-mobile-xs font-medium text-blue-800">Route:</Text>
                                  <Text className="text-mobile-xs text-blue-700">
                                    {vaccination.administration.route}
                                  </Text>
                                </View>
                              )}
                              
                              {/* Fallback for old structure */}
                              {!vaccination.dosage && !vaccination.administration && (
                                <Text className="text-mobile-xs text-blue-700">
                                  {vaccination.route || 'See instructions'} | {vaccination.dosage || 'Standard dose'}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {/* Prevention */}
                    <View className="mb-4">
                      <Text className="text-mobile-sm font-semibold text-neutral-900 mb-2">
                        Prevention
                      </Text>
                      <View className="space-y-1">
                        {disease.prevention.slice(0, 3).map((measure, index) => (
                          <View key={index} className="flex-row items-start">
                            <Text className="text-green-500 mr-2">•</Text>
                            <Text className="text-mobile-sm text-neutral-600 flex-1">{measure}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    {/* Prognosis */}
                    <View>
                      <Text className="text-mobile-sm font-semibold text-neutral-900 mb-2">
                        Prognosis
                      </Text>
                      <Text className="text-mobile-sm text-neutral-600">
                        {disease.prognosis}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {filteredDiseases.length === 0 && (
              <View className="text-center py-12">
                <Ionicons name="medical-outline" size={64} color="#94a3b8" />
                <Text className="text-mobile-lg font-medium text-neutral-600 mt-4 mb-2">
                  No Diseases Found
                </Text>
                <Text className="text-neutral-500 text-center">
                  Try adjusting your search or filter criteria.
                </Text>
              </View>
            )}
          </View>
        )}



        {/* Emergency Tab */}
        {activeView === 'emergency' && (
          <View className="space-y-4">
            {Object.entries(EMERGENCY_PROTOCOLS).map(([protocolName, protocol]) => (
              <View key={protocolName} className="card p-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="warning" size={24} color="#ef4444" />
                  <Text className="text-mobile-lg font-semibold text-neutral-900 ml-3">
                    {protocol.name}
                  </Text>
                </View>
                <Text className="text-neutral-600 mb-4">
                  {protocol.description}
                </Text>
                <View className="space-y-4">
                  <View>
                    <Text className="font-medium text-neutral-900 mb-2">
                      Immediate Actions:
                    </Text>
                    <View className="space-y-1">
                      {protocol.immediateActions.map((action, index) => (
                        <View key={index} className="flex-row items-start">
                          <Text className="text-error-500 mr-2">•</Text>
                          <Text className="flex-1 text-neutral-600">{action}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View>
                    <Text className="font-medium text-neutral-900 mb-2">
                      Follow-up Actions:
                    </Text>
                    <View className="space-y-1">
                      {protocol.followUpActions.map((action, index) => (
                        <View key={index} className="flex-row items-start">
                          <Text className="text-primary-500 mr-2">•</Text>
                          <Text className="flex-1 text-neutral-600">{action}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>


    </ScrollView>
  );
}