// Knowledge snippets and tips for poultry farming

export const KNOWLEDGE_SNIPPETS = {
  weeklyTips: [
    {
      id: 'tip-1',
      title: 'Proper Brooding Temperature',
      content: 'Maintain 32-35°C for day-old chicks, reducing by 2-3°C weekly until 21°C is reached.',
      category: 'brooding',
      difficulty: 'beginner',
      estimatedTime: '5 min read'
    },
    {
      id: 'tip-2',
      title: 'Water Quality Management',
      content: 'Provide clean, fresh water daily. Use water sanitizers to prevent bacterial growth.',
      category: 'health',
      difficulty: 'beginner',
      estimatedTime: '3 min read'
    },
    {
      id: 'tip-3',
      title: 'Feed Conversion Ratio',
      content: 'Monitor FCR weekly. Good broilers should achieve 1.6-1.8 FCR by 6 weeks.',
      category: 'nutrition',
      difficulty: 'intermediate',
      estimatedTime: '7 min read'
    }
  ],
  seasonalAdvice: [
    {
      id: 'seasonal-1',
      title: 'Rainy Season Management',
      content: 'Increase ventilation, use dry litter, and monitor for respiratory issues during wet weather.',
      season: 'rainy',
      category: 'management',
      difficulty: 'intermediate',
      estimatedTime: '6 min read'
    },
    {
      id: 'seasonal-2',
      title: 'Dry Season Care',
      content: 'Provide extra water, ensure adequate shade, and increase feeding frequency.',
      season: 'dry',
      category: 'management',
      difficulty: 'beginner',
      estimatedTime: '4 min read'
    }
  ],
  emergencyTips: [
    {
      id: 'emergency-1',
      title: 'Heat Stress Signs',
      content: 'Watch for panting, reduced feed intake, and increased water consumption. Provide immediate cooling.',
      urgency: 'high',
      category: 'health',
      difficulty: 'beginner',
      estimatedTime: '3 min read'
    },
    {
      id: 'emergency-2',
      title: 'Disease Outbreak Response',
      content: 'Isolate affected birds immediately, contact veterinarian, and implement biosecurity measures.',
      urgency: 'critical',
      category: 'health',
      difficulty: 'advanced',
      estimatedTime: '10 min read'
    }
  ],
  zodiacSigns: [
    {
      id: 'zodiac-1',
      title: 'Optimal Hatching Times',
      content: 'Traditional farmers believe certain moon phases favor better hatch rates and chick vitality.',
      category: 'traditional',
      difficulty: 'beginner',
      estimatedTime: '5 min read'
    },
    {
      id: 'zodiac-2',
      title: 'Seasonal Breeding Patterns',
      content: 'Align breeding cycles with natural seasonal changes for better productivity.',
      category: 'traditional',
      difficulty: 'intermediate',
      estimatedTime: '8 min read'
    }
  ]
};

/**
 * Get weekly knowledge tip
 */
export function getWeeklyKnowledge() {
  const tips = KNOWLEDGE_SNIPPETS.weeklyTips;
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
}

/**
 * Get seasonal tips based on current month
 */
export function getSeasonalTips() {
  const currentMonth = new Date().getMonth();
  const isRainySeason = currentMonth >= 3 && currentMonth <= 9; // April to October
  
  return KNOWLEDGE_SNIPPETS.seasonalAdvice.filter(tip => 
    tip.season === (isRainySeason ? 'rainy' : 'dry')
  );
}

/**
 * Get emergency advice
 */
export function getEmergencyAdvice() {
  return KNOWLEDGE_SNIPPETS.emergencyTips;
}

/**
 * Get zodiac/traditional farming signs
 */
export function getZodiacSigns() {
  return KNOWLEDGE_SNIPPETS.zodiacSigns;
}

/**
 * Get all knowledge snippets
 */
export function getAllKnowledgeSnippets() {
  return {
    weeklyTips: KNOWLEDGE_SNIPPETS.weeklyTips,
    seasonalAdvice: KNOWLEDGE_SNIPPETS.seasonalAdvice,
    emergencyTips: KNOWLEDGE_SNIPPETS.emergencyTips,
    zodiacSigns: KNOWLEDGE_SNIPPETS.zodiacSigns
  };
}