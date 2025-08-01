'use client';

import { useState, useEffect } from 'react';
import { useHybridKnowledgeStore } from '../lib/hybridStore';
import { getWeeklyKnowledge, getSeasonalTips, getEmergencyAdvice, EMERGENCY_SIGNS, KNOWLEDGE_SNIPPETS } from '../../shared/data/knowledgeSnippets.js';
import { BookOpen, Calendar, AlertTriangle, Heart, Star, ChevronRight, Search, Filter, Clock, Thermometer, Droplets, Shield } from 'lucide-react';
import { clsx } from 'clsx';

export default function KnowledgeSnippets() {
  const { favorites, addToFavorites, removeFromFavorites } = useHybridKnowledgeStore();
  const [activeTab, setActiveTab] = useState('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Get current week of year
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  // Get tips by category
  function getTipsByCategory(category) {
    const categoryMap = {
      'Feeding': ['Nutrition', 'Feed Quality'],
      'Health': ['Health', 'Disease Prevention'],
      'Environment': ['Housing', 'Management'],
      'Management': ['Management', 'Layer Management'],
      'Biosecurity': ['Disease Prevention', 'Biosecurity'],
      'Records': ['Business', 'Management']
    };
    
    const relevantCategories = categoryMap[category] || [category];
    const tips = [];
    
    Object.entries(KNOWLEDGE_SNIPPETS).forEach(([week, data]) => {
      if (relevantCategories.includes(data.category)) {
        tips.push({ ...data, week: week.replace('week', '') });
      }
    });
    
    return tips;
  }
  
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    setCurrentWeek(week);
  }, []);

  const weeklyKnowledge = getWeeklyKnowledge(currentWeek);
  const seasonalTips = getSeasonalTips(new Date().getMonth() + 1);
  
  const emergencyCategories = [
    { id: 'all', name: 'All Signs', icon: AlertTriangle },
    { id: 'respiratory', name: 'Respiratory', icon: Droplets },
    { id: 'digestive', name: 'Digestive', icon: Heart },
    { id: 'neurological', name: 'Neurological', icon: Shield },
    { id: 'general', name: 'General', icon: Thermometer }
  ];

  const filteredEmergencySigns = Object.entries(EMERGENCY_SIGNS)
    .filter(([category, condition]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) return false;
      if (!searchTerm) return true;
      return condition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.prevention.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.signs.some(sign => sign.toLowerCase().includes(searchTerm.toLowerCase()));
    });

  const getItemId = (item) => {
    return item.id || item.title;
  };

  const isFavorite = (item) => {
    const itemId = getItemId(item);
    return favorites.some(fav => (typeof fav === 'string' ? fav === itemId : fav.id === itemId));
  };

  const toggleFavorite = (item) => {
    const itemId = getItemId(item);
    if (isFavorite(item)) {
      removeFromFavorites(itemId);
    } else {
      // Ensure the item has a consistent ID when adding to favorites
      const itemWithId = { ...item, id: itemId };
      addToFavorites(itemWithId);
    }
  };

  const tabs = [
    { id: 'weekly', name: 'Weekly Tips', icon: Calendar },
    { id: 'seasonal', name: 'Seasonal', icon: Thermometer },
    { id: 'emergency', name: 'Emergency Signs', icon: AlertTriangle },
    { id: 'favorites', name: 'Favorites', icon: Star }
  ];

  return (
    <div className="max-w-6xl mx-auto space-mobile">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-mobile-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Knowledge Center
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          Essential tips, seasonal advice, and emergency guidance for poultry farmers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-1 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                {tab.id === 'favorites' && favorites.length > 0 && (
                  <span className="ml-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Tips Tab */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* Current Week Highlight */}
          <div className="card-gradient p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Week {currentWeek} Focus
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  {weeklyKnowledge.title}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(weeklyKnowledge)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isFavorite(weeklyKnowledge)
                    ? 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400'
                )}
              >
                <Star className={clsx('w-5 h-5', isFavorite(weeklyKnowledge) && 'fill-current')} />
              </button>
            </div>
            
            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {weeklyKnowledge.content}
              </p>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-neutral-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>Updated weekly • Category: {weeklyKnowledge.category}</span>
            </div>
          </div>

          {/* Week Navigator */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Browse Other Weeks</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                  disabled={currentWeek <= 1}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Week {currentWeek}
                </span>
                <button
                  onClick={() => setCurrentWeek(Math.min(52, currentWeek + 1))}
                  disabled={currentWeek >= 52}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tips Grid */}
          {!selectedTopic && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Feeding', 'Health', 'Environment', 'Management', 'Biosecurity', 'Records'].map((topic) => (
                <div key={topic} className="card-hover p-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">{topic} Tips</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Essential {topic.toLowerCase()} practices for this week.
                  </p>
                  <button 
                    onClick={() => setSelectedTopic(topic)}
                    className="text-primary-600 text-sm font-medium flex items-center hover:text-primary-700"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Topic Details View */}
          {selectedTopic && (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  Back to Weekly Tips
                </button>
              </div>

              {/* Topic Header */}
              <div className="card p-6">
                <h3 className="text-xl font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {selectedTopic} Tips & Best Practices
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Comprehensive guidance for {selectedTopic.toLowerCase()} management in poultry farming.
                </p>
              </div>

              {/* Tips List */}
              <div className="space-y-4">
                {getTipsByCategory(selectedTopic).map((tip, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          {tip.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="badge-primary">Week {tip.week}</span>
                          <span className="badge-secondary">{tip.category}</span>
                          {tip.applicableBreeds && (
                            <div className="flex items-center space-x-1">
                              {tip.applicableBreeds.map((breed, breedIndex) => (
                                <span 
                                  key={breedIndex}
                                  className={clsx(
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    tip.primaryBreed === breed 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                  )}
                                >
                                  {breed}
                                  {tip.primaryBreed === breed && ' (Primary)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite({
                          id: `week${tip.week}`,
                          title: tip.title,
                          content: tip.content,
                          category: selectedTopic,
                          applicableBreeds: tip.applicableBreeds,
                          primaryBreed: tip.primaryBreed
                        })}
                        className={clsx(
                          'p-2 rounded-lg transition-colors',
                          isFavorite({
                            id: `week${tip.week}`,
                            title: tip.title
                          })
                            ? 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400'
                        )}
                      >
                        <Star className={clsx('w-5 h-5', isFavorite({
                          id: `week${tip.week}`,
                          title: tip.title
                        }) && 'fill-current')} />
                      </button>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                      {tip.content}
                    </p>

                    {tip.tips && tip.tips.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Key Points:</h5>
                        <div className="space-y-2">
                          {tip.tips.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-start">
                              <ChevronRight className="w-4 h-4 mr-2 text-primary-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tip.warning && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h6 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important Warning</h6>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{tip.warning}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {getTipsByCategory(selectedTopic).length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    No Tips Available
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No tips found for {selectedTopic} category.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seasonal Tips Tab */}
      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          <div className="card-hover p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {seasonalTips.title}
                </h3>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="badge-secondary">Current Season</span>
                  {seasonalTips.applicableBreeds && (
                    <div className="flex items-center space-x-1">
                      {seasonalTips.applicableBreeds.map((breed, breedIndex) => (
                        <span 
                          key={breedIndex}
                          className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            seasonalTips.primaryBreed === breed 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                          )}
                        >
                          {breed}
                          {seasonalTips.primaryBreed === breed && ' (Primary)'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleFavorite({
                  id: `seasonal-${seasonalTips.title}`,
                  title: seasonalTips.title,
                  content: seasonalTips.solutions.join(', '),
                  category: 'seasonal',
                  applicableBreeds: seasonalTips.applicableBreeds,
                  primaryBreed: seasonalTips.primaryBreed
                })}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isFavorite({
                    id: `seasonal-${seasonalTips.title}`,
                    title: seasonalTips.title
                  })
                    ? 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400'
                )}
              >
                <Star className={clsx('w-5 h-5', isFavorite({
                  id: `seasonal-${seasonalTips.title}`,
                  title: seasonalTips.title
                }) && 'fill-current')} />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Key Challenges:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {seasonalTips.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    {challenge}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Recommended Solutions:</h4>
              <div className="space-y-2">
                {seasonalTips.solutions.map((solution, index) => (
                  <div key={index} className="flex items-start text-sm text-neutral-700 dark:text-neutral-300">
                    <ChevronRight className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    {solution}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-neutral-500">
              <Thermometer className="w-4 h-4 mr-1" />
              <span>Seasonal management advice</span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Signs Tab */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search symptoms, causes, or actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {emergencyCategories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={clsx(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      {
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300': isActive,
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600': !isActive,
                      }
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Signs List */}
          <div className="space-y-4">
            {filteredEmergencySigns.map(([category, condition]) => (
              <div key={category} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {condition.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="badge-error capitalize">{category}</span>
                      {condition.applicableBreeds && (
                        <div className="flex items-center space-x-1">
                          {condition.applicableBreeds.map((breed, breedIndex) => (
                            <span 
                              key={breedIndex}
                              className={clsx(
                                'px-2 py-1 text-xs font-medium rounded-full',
                                condition.primaryBreed === breed 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                              )}
                            >
                              {breed}
                              {condition.primaryBreed === breed && ' (Primary)'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite({
                      id: `emergency-${category}`,
                      title: condition.title,
                      content: condition.action,
                      category: 'emergency',
                      applicableBreeds: condition.applicableBreeds,
                      primaryBreed: condition.primaryBreed
                    })}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      isFavorite({
                        id: `emergency-${category}`,
                        title: condition.title
                      })
                        ? 'bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400'
                    )}
                  >
                    <Star className={clsx('w-5 h-5', isFavorite({
                      id: `emergency-${category}`,
                      title: condition.title
                    }) && 'fill-current')} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Warning Signs to Watch For:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {condition.signs.map((sign, index) => (
                        <div key={index} className="flex items-center text-sm text-neutral-700 dark:text-neutral-300">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                          {sign}
                        </div>
                      ))}
                      {condition.layerSigns && condition.layerSigns.map((sign, index) => (
                        <div key={`layer-${index}`} className="flex items-center text-sm text-neutral-700 dark:text-neutral-300">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                          {sign}
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            Layer
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Immediate Action Required:</h4>
                    <p className="text-sm text-red-800 dark:text-red-300">
                      {condition.action}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Prevention Tips:</h4>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {condition.prevention}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmergencySigns.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No Emergency Signs Found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {favorites.map((favorite, index) => {
                // Handle both string and object favorites
                const favoriteItem = typeof favorite === 'string' 
                  ? { id: favorite, title: favorite, content: 'Legacy favorite item', category: 'general' }
                  : favorite;
                
                return (
                  <div key={favoriteItem.id || index} className="card-hover p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          {favoriteItem.title}
                        </h3>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="badge-accent">{favoriteItem.category}</span>
                          {favoriteItem.applicableBreeds && (
                            <div className="flex items-center space-x-1">
                              {favoriteItem.applicableBreeds.map((breed, breedIndex) => (
                                <span 
                                  key={breedIndex}
                                  className={clsx(
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    favoriteItem.primaryBreed === breed 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                  )}
                                >
                                  {breed}
                                  {favoriteItem.primaryBreed === breed && ' (Primary)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromFavorites(favoriteItem.id || favoriteItem.title)}
                        className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 hover:bg-accent-200 dark:hover:bg-accent-900/30"
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                      {favoriteItem.content}
                    </p>
                    
                    <div className="flex items-center text-sm text-neutral-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Saved to favorites</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No Favorites Yet
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Start adding useful tips and advice to your favorites for quick access.
              </p>
              <button
                onClick={() => setActiveTab('weekly')}
                className="btn-primary"
              >
                Browse Knowledge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}