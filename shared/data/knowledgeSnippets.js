// Weekly rotating knowledge snippets for poultry farmers

export const KNOWLEDGE_SNIPPETS = {
  week1: {
    title: "Brooding Essentials",
    category: "Management",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Proper brooding is crucial for chick survival. Maintain temperature at 32-35°C for the first week, then reduce by 3°C weekly. Provide 24-hour lighting initially, then gradually reduce to 18 hours by week 3.",
    tips: [
      "Use a reliable thermometer to monitor temperature",
      "Ensure even heat distribution in the brooder",
      "Watch chick behavior - huddling means too cold, panting means too hot",
      "Provide adequate space: 0.1 sq meter per chick initially"
    ],
    warning: "Never use kerosene lamps in enclosed spaces - risk of carbon monoxide poisoning"
  },
  week2: {
    title: "Vaccination Schedule",
    category: "Health",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Follow a proper vaccination schedule to prevent common diseases. Start with Marek's disease vaccine at day-old, followed by Newcastle disease and Infectious Bronchitis vaccines.",
    tips: [
      "Day 1: Marek's disease (at hatchery)",
      "Day 7-10: Newcastle Disease + Infectious Bronchitis (eye drop)",
      "Day 14-18: Gumboro disease (drinking water)",
      "Day 21-28: Newcastle Disease booster (drinking water)",
      "Keep vaccines cold and use immediately after mixing"
    ],
    warning: "Store vaccines at 2-8°C. Use within 2 hours of reconstitution. If birds show vaccine reactions (lethargy, reduced appetite), administer Vitamin E+Selenium (0.1ml per bird) and monitor closely."
  },
  week3: {
    title: "Coccidiosis Prevention",
    category: "Disease Prevention",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Coccidiosis is a common parasitic disease affecting young chickens. It thrives in wet, warm conditions and can cause bloody diarrhea and death if untreated.",
    tips: [
      "Keep litter dry and well-ventilated",
      "Use coccidiostat in feed for prevention",
      "Watch for bloody droppings, lethargy, and poor growth",
      "Maintain proper stocking density",
      "Clean and disinfect equipment regularly"
    ],
    warning: "Treatment: Use Amprolium (1g per liter of water for 5-7 days) or Sulfadimethoxine (0.05% in feed for 5 days). Isolate affected birds immediately. For prevention, use Toltrazuril (7mg per bird) in drinking water."
  },
  week4: {
    title: "Nutrition and Feed Quality",
    category: "Nutrition",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Good nutrition is the foundation of successful poultry farming. Feed accounts for 60-70% of production costs, so quality matters more than price alone.",
    tips: [
      "Check feed for mold, unusual smell, or pest infestation",
      "Store feed in dry, rodent-proof containers",
      "Use feed within 4-6 weeks of manufacture",
      "Provide fresh, clean water at all times",
      "Adjust feed quantity based on weather and bird condition"
    ],
    warning: "Moldy feed can cause aflatoxin poisoning - never feed moldy or spoiled feed to birds"
  },
  week5: {
    title: "Water Management",
    category: "Management",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Water is the most important nutrient. Birds can survive longer without feed than without water. Poor water quality can reduce performance and increase disease risk.",
    tips: [
      "Provide 2-3 times more water than feed consumption",
      "Clean waterers daily and disinfect weekly",
      "Check water temperature - should be cool but not cold",
      "Ensure adequate water space: 2cm per bird",
      "Test water quality periodically for bacteria and pH"
    ],
    warning: "Contaminated water can spread diseases rapidly through the flock"
  },
  week6: {
    title: "Ventilation and Air Quality",
    category: "Housing",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Proper ventilation removes moisture, ammonia, and carbon dioxide while providing fresh oxygen. Poor air quality leads to respiratory problems and reduced performance.",
    tips: [
      "Ensure cross-ventilation without creating drafts",
      "Monitor ammonia levels - should not smell strong",
      "Adjust ventilation based on weather and bird age",
      "Use fans during hot weather to improve air circulation",
      "Keep litter dry to reduce ammonia production"
    ],
    warning: "If ammonia levels exceed 25ppm: Increase ventilation immediately, change litter, and treat affected birds with Tylosin (5-10mg/kg) in water for respiratory support. Monitor for secondary bacterial infections."
  },
  week7: {
    title: "Biosecurity Measures",
    category: "Disease Prevention",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Biosecurity prevents disease introduction and spread. Simple measures can save your flock from devastating losses.",
    tips: [
      "Limit farm visitors and require foot baths",
      "Quarantine new birds for 2-3 weeks",
      "Disinfect equipment between flocks",
      "Control rodents and wild birds",
      "Dispose of dead birds properly (burning or deep burial)"
    ],
    warning: "For disease outbreaks: Implement immediate quarantine, disinfect with 2% formaldehyde or 0.5% glutaraldehyde solution. Use broad-spectrum antibiotics (Oxytetracycline 20mg/kg) preventively for 3-5 days in unaffected birds."
  },
  week8: {
    title: "Heat Stress Management",
    category: "Management",
    applicableBreeds: ["Broiler", "Layer"],
    primaryBreed: "Broiler",
    content: "Heat stress reduces feed intake, growth rate, and egg production. It's particularly dangerous for broilers and can cause sudden death.",
    tips: [
      "Provide shade and adequate ventilation",
      "Increase water availability during hot weather",
      "Feed during cooler parts of the day",
      "Use electrolytes in drinking water",
      "Consider wet cooling systems for severe heat"
    ],
    warning: "For heat stress: Immediately provide cool water with electrolytes (1g sodium chloride + 0.5g potassium chloride per liter). Administer Vitamin C (200mg/liter water) and reduce feed to prevent metabolic heat. Use fans and wet cooling systems."
  },
  week9: {
    title: "Egg Production Optimization",
    category: "Layer Management",
    applicableBreeds: ["Layer"],
    content: "Maximizing egg production requires proper nutrition, lighting, and management. Peak production should reach 90-95% in good laying hens.",
    tips: [
      "Provide 14-16 hours of light daily",
      "Maintain consistent feeding schedule",
      "Ensure adequate calcium (3.5-4% in feed)",
      "Provide comfortable nesting boxes (1 per 4-5 hens)",
      "Collect eggs frequently to prevent broodiness"
    ],
    warning: "Sudden changes in lighting or feeding can cause egg production drops"
  },
  week10: {
    title: "Record Keeping",
    category: "Management",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Good records help track performance, identify problems early, and make informed decisions. Keep records simple but consistent.",
    tips: [
      "Track daily feed consumption and water intake",
      "Record mortality with probable causes",
      "Monitor body weight weekly",
      "Keep vaccination and medication records",
      "Calculate feed conversion ratio regularly"
    ],
    warning: "Poor record keeping makes it impossible to identify and solve recurring problems"
  },
  week11: {
    title: "Parasite Control",
    category: "Health",
    applicableBreeds: ["Layer"],
    content: "Internal and external parasites can significantly impact bird health and performance. Regular monitoring and treatment are essential for long-term layer management.",
    tips: [
      "Deworm birds every 3-4 months or as needed",
      "Check for lice and mites regularly",
      "Rotate deworming medications to prevent resistance",
      "Keep surroundings clean and dry",
      "Quarantine and treat new birds before mixing"
    ],
    warning: "For internal parasites: Use Levamisole (20-40mg/kg body weight) or Fenbendazole (5-10mg/kg) in feed for 3 days. For external parasites: Apply Permethrin dust (0.25%) or spray Cypermethrin (0.1%) on affected areas. Repeat treatment after 10-14 days."
  },
  week12: {
    title: "Broiler Growth Monitoring",
    category: "Management",
    applicableBreeds: ["Broiler"],
    content: "Broilers have rapid growth phases requiring careful monitoring. Track weight gain and feed conversion to optimize performance during their short 6-8 week lifecycle.",
    tips: [
      "Weigh sample birds weekly to track growth rate",
      "Target 35-45g daily weight gain after week 2",
      "Monitor feed conversion ratio (should be 1.6-2.0)",
      "Adjust feed formulation based on growth phase",
      "Plan processing at optimal weight (1.8-2.5kg)"
    ],
    warning: "Poor growth monitoring can lead to inefficient feed conversion and reduced profitability"
  },
  week13: {
    title: "Marketing and Profitability",
    category: "Business",
    applicableBreeds: ["Broiler", "Layer"],
    content: "Successful poultry farming requires good marketing strategies and cost control. Know your market and plan production accordingly.",
    tips: [
      "Identify reliable buyers before starting production",
      "Calculate all costs including labor and overhead",
      "Time production for peak demand periods",
      "Maintain consistent quality and supply",
      "Consider value-addition like processing or packaging"
    ],
    warning: "Poor market planning can lead to losses even with good production performance"
  }
};

// Emergency health signs to watch for
export const EMERGENCY_SIGNS = {
  respiratory: {
    title: "Respiratory Problems",
    applicableBreeds: ["Broiler", "Layer"],
    signs: ["Gasping", "Coughing", "Sneezing", "Nasal discharge", "Swollen face"],
    action: "Isolate affected birds immediately. Administer Tylosin (10mg/kg body weight) or Oxytetracycline (20mg/kg) in drinking water for 5-7 days. For severe cases, inject Enrofloxacin (10mg/kg) intramuscularly once daily for 3 days.",
    prevention: "Ensure good ventilation and avoid overcrowding"
  },
  digestive: {
    title: "Digestive Issues",
    applicableBreeds: ["Broiler", "Layer"],
    signs: ["Bloody diarrhea", "Green/yellow droppings", "Loss of appetite", "Crop impaction"],
    action: "Remove contaminated feed immediately. For bloody diarrhea, use Metronidazole (10-20mg/kg) in water for 5 days. For bacterial infections, administer Neomycin (10-15mg/kg) orally twice daily for 3-5 days. Provide electrolyte solution.",
    prevention: "Use quality feed, maintain clean feeders and waterers"
  },
  neurological: {
    title: "Neurological Symptoms",
    applicableBreeds: ["Broiler", "Layer"],
    signs: ["Twisted neck", "Paralysis", "Tremors", "Inability to stand", "Circling"],
    action: "Isolate immediately - likely Newcastle disease. No specific treatment available. Provide supportive care with Vitamin B-complex (1ml per bird) and electrolytes. Implement strict biosecurity. Notify veterinary authorities as this is a notifiable disease.",
    prevention: "Follow proper vaccination schedule and biosecurity measures"
  },
  general: {
    title: "General Illness",
    applicableBreeds: ["Broiler", "Layer"],
    signs: ["Lethargy", "Ruffled feathers", "Pale comb", "Sudden death"],
    layerSigns: ["Reduced egg production"],
    action: "For bacterial infections: Use broad-spectrum antibiotics like Amoxicillin (15-20mg/kg) twice daily for 5-7 days. For stress-related issues: Administer Vitamin C (100mg/liter water) and electrolytes. Monitor temperature and provide supportive care.",
    prevention: "Maintain good hygiene, proper nutrition, and regular health monitoring"
  }
};

// Seasonal management tips
export const SEASONAL_TIPS = {
  dry_season: {
    title: "Dry Season Management",
    applicableBreeds: ["Broiler", "Layer"],
    primaryBreed: "Broiler",
    challenges: ["Heat stress", "Dust", "Water scarcity", "Feed storage issues"],
    solutions: [
      "Increase ventilation and provide shade",
      "Wet feeding areas to reduce dust",
      "Store extra water and check quality",
      "Protect feed from heat and pests"
    ]
  },
  rainy_season: {
    title: "Rainy Season Management",
    applicableBreeds: ["Broiler", "Layer"],
    challenges: ["High humidity", "Wet litter", "Mold growth", "Disease outbreaks"],
    solutions: [
      "Improve drainage around houses",
      "Change litter more frequently",
      "Check feed for mold regularly",
      "Increase biosecurity measures"
    ]
  },
  harmattan: {
    title: "Harmattan Season Management",
    applicableBreeds: ["Broiler", "Layer"],
    challenges: ["Cold stress", "Dust storms", "Respiratory issues", "Reduced visibility"],
    solutions: [
      "Provide windbreaks and extra bedding",
      "Cover water and feed during dust storms",
      "Monitor for respiratory problems",
      "Ensure adequate lighting during dark periods"
    ]
  }
};

/**
 * Get knowledge snippet for current week
 * @param {number} weekNumber - Week number (1-52)
 * @returns {Object} Knowledge snippet for the week
 */
export function getWeeklyKnowledge(weekNumber) {
  const snippetWeek = ((weekNumber - 1) % 12) + 1;
  return KNOWLEDGE_SNIPPETS[`week${snippetWeek}`];
}

/**
 * Get seasonal tips based on current month
 * @param {number} month - Month number (1-12)
 * @returns {Object} Seasonal management tips
 */
export function getSeasonalTips(month) {
  if (month >= 11 || month <= 2) {
    return SEASONAL_TIPS.harmattan; // November to February
  } else if (month >= 3 && month <= 6) {
    return SEASONAL_TIPS.dry_season; // March to June
  } else {
    return SEASONAL_TIPS.rainy_season; // July to October
  }
}

/**
 * Get emergency signs based on symptoms
 * @param {Array} symptoms - Array of observed symptoms
 * @returns {Array} Matching emergency conditions
 */
export function getEmergencyAdvice(symptoms) {
  const matches = [];
  
  Object.entries(EMERGENCY_SIGNS).forEach(([key, condition]) => {
    const matchingSymptoms = symptoms.filter(symptom => 
      condition.signs.some(sign => 
        sign.toLowerCase().includes(symptom.toLowerCase()) ||
        symptom.toLowerCase().includes(sign.toLowerCase())
      )
    );
    
    if (matchingSymptoms.length > 0) {
      matches.push({
        ...condition,
        matchingSymptoms,
        urgency: key === 'neurological' ? 'critical' : 'high'
      });
    }
  });
  
  return matches;
}