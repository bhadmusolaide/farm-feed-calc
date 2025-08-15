'use client';

import { useState, useEffect } from 'react';
import { useUnifiedStore } from '../lib/unifiedStore';
import { DISEASE_DATA, VACCINATION_SCHEDULES, EMERGENCY_PROTOCOLS, getDiseasesByWeek, getDiseasesByBreed, DOSAGE_CALCULATOR } from '../../shared/data/diseaseGuide.js';
import { Shield, Calendar, AlertTriangle, Search, Filter, Clock, Thermometer, Heart, Star, Calculator } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function DiseaseGuide() {
  const router = useRouter();
  const { breed, favorites, addToFavorites, removeFromFavorites } = useUnifiedStore();
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

  if (!breed) {
    return (
      <div className="max-w-6xl mx-auto space-mobile">
        <div className="text-center py-12">
          <Calculator className="mx-auto h-16 w-16 text-primary-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            No Breed Selected
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Please select a breed in the calculator to access breed-specific disease information.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go to Calculator
          </button>
        </div>
      </div>
    );
  }

  const weeklyDiseases = getDiseasesByWeek(selectedWeek, breed);
  const breedDiseases = getDiseasesByBreed(breed);
  const vaccinationSchedule = VACCINATION_SCHEDULES[breed] || VACCINATION_SCHEDULES['default'];

  // Get all diseases from all weeks for search functionality
  const getAllDiseases = () => {
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
  };

  // Use all diseases for search, weekly diseases for display when no search
  const diseasesToFilter = searchTerm ? getAllDiseases() : weeklyDiseases;
  
  const filteredDiseases = diseasesToFilter.filter(disease => {
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

  const diseaseCategories = [
    { id: 'all', name: 'All Diseases', icon: Shield },
    { id: 'respiratory', name: 'Respiratory', icon: Thermometer },
    { id: 'digestive', name: 'Digestive', icon: Heart },
    { id: 'metabolic', name: 'Metabolic', icon: Calculator },
    { id: 'infectious', name: 'Infectious', icon: AlertTriangle }
  ];

  const weeks = [1, 2, 3, 4, 5, 6];

  const isFavorite = (disease) => {
    return favorites.some(fav => fav.id === `disease-${disease.id}`);
  };

  const toggleFavorite = (disease) => {
    const diseaseItem = {
      id: `disease-${disease.id}`,
      title: disease.name,
      content: disease.description,
      category: disease.category,
      type: 'disease',
      breed: breed,
      week: selectedWeek
    };

    if (isFavorite(disease)) {
      removeFromFavorites(diseaseItem.id);
    } else {
      addToFavorites(diseaseItem);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-mobile">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-mobile-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Disease Guide - {breed}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          Comprehensive disease management for broiler chickens (Week 1-6)
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-1 mb-6">
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: 'diseases', name: 'Diseases', icon: AlertTriangle },
            { id: 'emergency', name: 'Emergency', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={clsx(
                  'flex items-center justify-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  {
                    'bg-primary-600 text-white shadow-md': isActive,
                    'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700': !isActive,
                  }
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>



      {/* Diseases Tab */}
      {activeView === 'diseases' && (
        <div className="space-y-6">
          {/* Week Selection */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Select Week
            </h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
              {weeks.map((week) => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    {
                      'bg-primary-600 text-white shadow-md': selectedWeek === week,
                      'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600': selectedWeek !== week,
                    }
                  )}
                >
                  Week {week}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search diseases, symptoms, treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 appearance-none"
                >
                  {diseaseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Disease List */}
          <div className="grid grid-cols-1 gap-6">
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
                <div key={disease.id} className="card-hover p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {disease.name}
                        {searchTerm && disease.weekNumber && (
                          <span className="ml-2 text-sm font-normal text-primary-600 dark:text-primary-400">
                            (Week {disease.weekNumber})
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={clsx('px-2 py-1 text-xs font-medium rounded-full border', getSeverityColor(disease.severity))}>
                          {disease.severity.toUpperCase()}
                        </span>
                        <span className="badge-accent">{disease.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(disease)}
                      className={clsx(
                        'p-2 rounded-lg transition-colors',
                        isFavorite(disease)
                          ? 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400'
                      )}
                    >
                      <Star className={clsx('w-5 h-5', isFavorite(disease) && 'fill-current')} />
                    </button>
                  </div>
                  
                  <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                    {disease.description}
                  </p>
                  
                  <div className="space-y-4">
                    {/* Symptoms */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        Symptoms
                      </h4>
                      <ul className="space-y-1">
                        {disease.symptoms.map((symptom, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-neutral-600 dark:text-neutral-300">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Treatment */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                        <Heart className="w-4 h-4 text-green-500 mr-2" />
                        Treatment
                      </h4>
                      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 text-sm">
                        {disease.treatment.medication && typeof disease.treatment.medication === 'object' ? (
                          <div className="space-y-2">
                            {disease.treatment.medication.primary && (
                              <p className="text-neutral-600 dark:text-neutral-300">
                                <strong>Primary:</strong> {disease.treatment.medication.primary}
                              </p>
                            )}
                            {disease.treatment.medication.alternative && (
                              <p className="text-neutral-600 dark:text-neutral-300">
                                <strong>Alternative:</strong> {disease.treatment.medication.alternative}
                              </p>
                            )}
                            {disease.treatment.medication.supportive && (
                              <p className="text-neutral-600 dark:text-neutral-300">
                                <strong>Supportive:</strong> {disease.treatment.medication.supportive}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-neutral-600 dark:text-neutral-300 mb-1">
                            <strong>Medication:</strong> {disease.treatment.medication}
                          </p>
                        )}
                        <p className="text-neutral-600 dark:text-neutral-300 mb-1">
                          <strong>Dosage:</strong> {disease.treatment.dosage}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-300">
                          <strong>Duration:</strong> {disease.treatment.duration}
                        </p>
                      </div>
                    </div>
                    
                    {/* Vaccination (if relevant) */}
                    {relevantVaccinations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                          <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                          Vaccination
                        </h4>
                        <div className="space-y-2">
                          {relevantVaccinations.map((vaccination, index) => (
                            <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {vaccination.vaccine}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400">
                                  {vaccination.timing || `Day ${vaccination.day}`}
                                </span>
                              </div>
                              <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                                <strong>Method:</strong> {vaccination.method}
                              </p>
                              
                              {/* Enhanced dosage information */}
                              {vaccination.dosage && typeof vaccination.dosage === 'object' ? (
                                <div className="mb-2">
                                  <p className="text-neutral-700 dark:text-neutral-200 font-medium mb-1">Dosage:</p>
                                  <div className="space-y-1 text-xs">
                                    {vaccination.dosage.drinking_water && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Drinking Water:</strong> {vaccination.dosage.drinking_water}
                                      </p>
                                    )}
                                    {vaccination.dosage.injection && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Injection:</strong> {vaccination.dosage.injection}
                                      </p>
                                    )}
                                    {vaccination.dosage.spray && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Spray:</strong> {vaccination.dosage.spray}
                                      </p>
                                    )}
                                    {vaccination.dosage.volume && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Volume:</strong> {vaccination.dosage.volume}
                                      </p>
                                    )}
                                    {vaccination.dosage.concentration && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Concentration:</strong> {vaccination.dosage.concentration}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : vaccination.dosage ? (
                                <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                                  <strong>Dosage:</strong> {vaccination.dosage}
                                </p>
                              ) : null}
                              
                              {/* Administration details */}
                              {vaccination.administration && (
                                <div className="mb-2">
                                  <p className="text-neutral-700 dark:text-neutral-200 font-medium mb-1">Administration:</p>
                                  <div className="space-y-1 text-xs">
                                    <p className="text-neutral-600 dark:text-neutral-300">
                                      <strong>Route:</strong> {vaccination.administration.route}
                                    </p>
                                    {vaccination.administration.preparation && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Preparation:</strong> {vaccination.administration.preparation}
                                      </p>
                                    )}
                                    {vaccination.administration.precautions && (
                                      <p className="text-neutral-600 dark:text-neutral-300">
                                        <strong>Precautions:</strong> {vaccination.administration.precautions}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Fallback for old structure */}
                              {!vaccination.dosage && !vaccination.administration && (
                                <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                                  <span>Route: {vaccination.route || 'Not specified'}</span>
                                  <span>Dosage: {vaccination.dosage || 'See instructions'}</span>
                                </div>
                              )}
                              
                              {vaccination.notes && (
                                <p className="text-neutral-600 dark:text-neutral-300 text-xs mt-2 italic">
                                  {vaccination.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Prevention */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                        <Shield className="w-4 h-4 text-green-500 mr-2" />
                        Prevention
                      </h4>
                      <ul className="space-y-1">
                        {disease.prevention.map((measure, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-neutral-600 dark:text-neutral-300">{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Prognosis */}
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                        Prognosis
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {disease.prognosis}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDiseases.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No Diseases Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      )}



      {/* Emergency Tab */}
      {activeView === 'emergency' && (
        <div className="space-y-6">
          {Object.entries(EMERGENCY_PROTOCOLS).map(([protocolName, protocol]) => (
            <div key={protocolName} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {protocol.name}
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                {protocol.description}
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Immediate Actions:
                  </h4>
                  <ul className="space-y-1">
                    {protocol.immediateActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-neutral-600 dark:text-neutral-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Follow-up Actions:
                  </h4>
                  <ul className="space-y-1">
                    {protocol.followUpActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-neutral-600 dark:text-neutral-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}