// Disease Guide Data Structure
// Comprehensive breed-specific disease information for broiler weeks 1-6

// Common diseases by week with breed-specific considerations
export const DISEASE_GUIDE = {
  week1: {
    title: "Week 1: Early Chick Health",
    ageRange: "0-7 days",
    criticalPeriod: true,
    commonDiseases: {
      omphalitis: {
        name: "Omphalitis (Navel Infection)",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "More susceptible due to rapid early growth",
          "Cobb 500": "Monitor closely in first 48 hours",
          "Arbor Acres": "Generally more resistant but still requires attention"
        },
        symptoms: [
          "Swollen, infected navel",
          "Lethargy and weakness",
          "Poor appetite",
          "Unhealed or wet navel",
          "Foul smell from navel area"
        ],
        causes: [
          "Poor incubation hygiene",
          "Contaminated hatching environment",
          "Rough handling during transport",
          "High humidity in brooder"
        ],
        treatment: {
          immediate: [
            "Isolate affected chicks immediately",
            "Clean navel with 10% povidone iodine solution",
            "Apply antibiotic ointment (Neomycin) twice daily"
          ],
          medication: {
            primary: "Amoxicillin 15mg/kg body weight orally twice daily for 5 days",
            alternative: "Enrofloxacin 10mg/kg intramuscularly once daily for 3 days",
            supportive: "Vitamin E + Selenium 0.1ml per chick to boost immunity"
          },
          duration: "5-7 days with daily monitoring"
        },
        prevention: [
          "Ensure proper incubation hygiene",
          "Disinfect hatching trays and equipment",
          "Maintain optimal brooder temperature (32-35°C)",
          "Provide clean, dry bedding",
          "Handle chicks gently during transport"
        ],
        prognosis: "Good if treated early, poor if infection spreads"
      },
      aspergillosis: {
        name: "Aspergillosis (Brooder Pneumonia)",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Higher mortality rate due to rapid metabolism",
          "Cobb 500": "Responds well to early intervention",
          "Arbor Acres": "More resilient but still vulnerable in poor conditions"
        },
        symptoms: [
          "Gasping and difficulty breathing",
          "Drowsiness and weakness",
          "Loss of appetite",
          "Increased thirst",
          "High mortality in severe cases"
        ],
        causes: [
          "Moldy feed or bedding",
          "Poor ventilation",
          "High humidity",
          "Contaminated incubation environment"
        ],
        treatment: {
          immediate: [
            "Remove all moldy feed and bedding immediately",
            "Improve ventilation and reduce humidity",
            "Isolate affected birds"
          ],
          medication: {
            primary: "Nystatin 100,000 units per liter of drinking water for 7 days",
            alternative: "Copper sulfate 1:2000 in drinking water for 3 days",
            supportive: "Vitamin A 10,000 IU per bird to support respiratory health"
          },
          duration: "7-10 days with environmental management"
        },
        prevention: [
          "Use only fresh, mold-free feed and bedding",
          "Maintain proper ventilation",
          "Keep humidity below 70%",
          "Regular cleaning and disinfection",
          "Store feed in dry, cool conditions"
        ],
        prognosis: "Poor once symptoms appear, prevention is key"
      }
    },
    vaccinations: {
      required: [
        {
          vaccine: "Marek's Disease",
          timing: "Day 1 (at hatchery)",
          method: "Subcutaneous injection",
          notes: "Essential for all breeds, provides lifelong immunity"
        }
      ],
      optional: [
        {
          vaccine: "Newcastle Disease (B1 strain)",
          timing: "Day 7",
          method: "Eye drop or drinking water",
          notes: "Recommended in high-risk areas"
        }
      ]
    },
    managementTips: [
      "Maintain brooder temperature at 32-35°C",
      "Provide 24-hour lighting for first 3 days",
      "Ensure easy access to feed and water",
      "Monitor chicks every 2 hours during first 48 hours",
      "Remove dead or weak chicks immediately"
    ]
  },

  week2: {
    title: "Week 2: Adaptation Period",
    ageRange: "8-14 days",
    criticalPeriod: false,
    commonDiseases: {
      coccidiosis: {
        name: "Coccidiosis",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Most susceptible due to rapid growth and stress",
          "Cobb 500": "Moderate susceptibility, good response to treatment",
          "Arbor Acres": "More resistant but still requires monitoring"
        },
        symptoms: [
          "Bloody or dark-colored droppings",
          "Lethargy and huddling",
          "Reduced feed intake",
          "Ruffled feathers",
          "Dehydration",
          "Pale comb and wattles"
        ],
        causes: [
          "Wet, contaminated litter",
          "Overcrowding",
          "Poor sanitation",
          "Stress from environmental changes",
          "Contaminated feed or water"
        ],
        treatment: {
          immediate: [
            "Isolate affected birds",
            "Remove wet litter and replace with dry bedding",
            "Provide electrolyte solution"
          ],
          medication: {
            primary: "Amprolium 1g per liter of drinking water for 5-7 days",
            alternative: "Sulfadimethoxine 0.05% in feed for 5 days",
            severe_cases: "Toltrazuril 7mg per bird in drinking water for 2 days",
            supportive: "Vitamin K 2mg per liter water to control bleeding"
          },
          duration: "5-7 days with follow-up monitoring"
        },
        prevention: [
          "Use coccidiostat in feed (Salinomycin 60-70ppm)",
          "Maintain dry, clean litter",
          "Avoid overcrowding (max 10 birds per m²)",
          "Regular cleaning of feeders and waterers",
          "Gradual exposure to build immunity"
        ],
        prognosis: "Excellent if caught early, can be fatal if untreated"
      },
      pullorum: {
        name: "Pullorum Disease",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Higher mortality rate in first 2 weeks",
          "Cobb 500": "Good survival rate with prompt treatment",
          "Arbor Acres": "Generally more resistant to severe forms"
        },
        symptoms: [
          "White, chalky diarrhea",
          "Weakness and drowsiness",
          "Huddling near heat source",
          "Pasted vent (droppings stuck to vent)",
          "High mortality rate"
        ],
        causes: [
          "Infected breeding stock",
          "Contaminated incubation environment",
          "Poor hatchery hygiene",
          "Vertical transmission from parent stock"
        ],
        treatment: {
          immediate: [
            "Isolate entire flock",
            "Implement strict biosecurity",
            "Clean and disinfect all equipment"
          ],
          medication: {
            primary: "Furazolidone 0.04% in feed for 14 days",
            alternative: "Sulfamethazine 0.5% in drinking water for 7 days",
            supportive: "Probiotics to restore gut health after treatment"
          },
          duration: "14 days with extended monitoring"
        },
        prevention: [
          "Source chicks from pullorum-tested breeding stock",
          "Maintain strict hatchery hygiene",
          "Test breeding birds annually",
          "Quarantine new birds for 21 days",
          "Regular flock health monitoring"
        ],
        prognosis: "Poor without treatment, good with early intervention"
      }
    },
    vaccinations: {
      required: [
        {
          vaccine: "Newcastle Disease (B1 strain)",
          timing: "Day 7-10",
          method: "Eye drop or drinking water",
          notes: "First booster, essential for all breeds"
        }
      ],
      optional: [
        {
          vaccine: "Infectious Bronchitis",
          timing: "Day 10-14",
          method: "Spray or drinking water",
          notes: "Recommended in areas with respiratory disease history"
        }
      ]
    },
    managementTips: [
      "Reduce brooder temperature to 29-32°C",
      "Introduce 18-20 hours lighting schedule",
      "Monitor for signs of stress or disease daily",
      "Ensure adequate feeder and waterer space",
      "Begin gradual feed transition if needed"
    ]
  },

  week3: {
    title: "Week 3: Growth Acceleration",
    ageRange: "15-21 days",
    criticalPeriod: false,
    commonDiseases: {
      gumboro: {
        name: "Infectious Bursal Disease (Gumboro)",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Most susceptible between 3-6 weeks of age",
          "Cobb 500": "Moderate susceptibility, vaccination highly effective",
          "Arbor Acres": "Lower incidence but still requires vaccination"
        },
        symptoms: [
          "Sudden onset of depression",
          "Watery, whitish diarrhea",
          "Ruffled feathers and huddling",
          "Reluctance to move",
          "Dehydration",
          "Sudden death in severe cases"
        ],
        causes: [
          "Highly contagious virus",
          "Contaminated environment",
          "Stress factors",
          "Poor biosecurity",
          "Inadequate vaccination"
        ],
        treatment: {
          immediate: [
            "No specific treatment available",
            "Provide supportive care",
            "Isolate affected birds",
            "Implement strict biosecurity"
          ],
          medication: {
            supportive: "Vitamin B-complex 1ml per bird for immune support",
            secondary: "Broad-spectrum antibiotics to prevent secondary infections",
            electrolytes: "Oral rehydration solution for 5-7 days"
          },
          duration: "Supportive care until recovery or death"
        },
        prevention: [
          "Vaccinate at 14-18 days with intermediate strain",
          "Maintain strict biosecurity",
          "Avoid stress factors",
          "Regular disinfection of premises",
          "Control visitor access"
        ],
        prognosis: "Poor once clinical signs appear, prevention through vaccination is essential"
      },
      necrotic_enteritis: {
        name: "Necrotic Enteritis",
        severity: "medium",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Higher incidence due to rapid growth and feed consumption",
          "Cobb 500": "Moderate risk, responds well to dietary management",
          "Arbor Acres": "Lower incidence, good response to treatment"
        },
        symptoms: [
          "Dark, tarry diarrhea",
          "Reduced feed consumption",
          "Depression and lethargy",
          "Sudden death without prior symptoms",
          "Poor growth performance"
        ],
        causes: [
          "Clostridium perfringens bacteria",
          "High-protein diets",
          "Coccidiosis predisposition",
          "Stress and overcrowding",
          "Poor feed quality"
        ],
        treatment: {
          immediate: [
            "Reduce protein content in feed temporarily",
            "Improve ventilation and reduce stress",
            "Remove dead birds immediately"
          ],
          medication: {
            primary: "Bacitracin 200ppm in feed for 5-7 days",
            alternative: "Lincomycin 2-4ppm in drinking water for 7 days",
            supportive: "Probiotics to restore gut microflora"
          },
          duration: "7-10 days with dietary management"
        },
        prevention: [
          "Use anticoccidial programs effectively",
          "Avoid sudden feed changes",
          "Maintain optimal stocking density",
          "Include probiotics in feed",
          "Monitor feed quality regularly"
        ],
        prognosis: "Good with prompt treatment and management changes"
      }
    },
    vaccinations: {
      required: [
        {
          vaccine: "Infectious Bursal Disease (Gumboro)",
          timing: "Day 14-18",
          method: "Drinking water or subcutaneous injection",
          dosage: {
            drinking_water: "1 dose per bird in 1000ml water for 1000 birds",
            injection: "0.5ml per bird subcutaneously in neck region",
            concentration: "Live intermediate strain vaccine"
          },
          administration: {
            route: "Oral (drinking water) or Subcutaneous injection",
            preparation: "Reconstitute freeze-dried vaccine with sterile diluent",
            storage: "Store at 2-8°C, use within 2 hours after reconstitution",
            precautions: "Ensure all birds drink within 2-4 hours, withhold water 2 hours before vaccination"
          },
          notes: "Critical for immune system protection - prevents immunosuppression"
        }
      ],
      optional: [
        {
          vaccine: "Fowl Pox",
          timing: "Day 21",
          method: "Wing web stab (scarification)",
          dosage: {
            volume: "0.01ml per bird",
            concentration: "Live virus vaccine (1000 doses per vial)",
            application: "Single stab through wing web membrane"
          },
          administration: {
            route: "Transcutaneous (through wing web)",
            technique: "Use double-needle applicator, dip in vaccine, stab through wing web",
            site: "Wing web between radius and ulna bones",
            verification: "Check for 'take' reaction (small scab) after 7-10 days"
          },
          notes: "Recommended in areas with mosquito problems - provides lifelong immunity"
        }
      ]
    },
    managementTips: [
      "Reduce brooder temperature to 26-29°C",
      "Transition to grower feed if using starter",
      "Monitor water consumption (should increase with growth)",
      "Check for proper feather development",
      "Implement biosecurity protocols"
    ]
  },

  week4: {
    title: "Week 4: Rapid Development",
    ageRange: "22-28 days",
    criticalPeriod: false,
    commonDiseases: {
      newcastle: {
        name: "Newcastle Disease",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Highly susceptible, requires strict vaccination schedule",
          "Cobb 500": "Good vaccine response, maintain regular boosters",
          "Arbor Acres": "Moderate susceptibility, vaccination essential"
        },
        symptoms: [
          "Respiratory distress (gasping, coughing)",
          "Nervous signs (twisted neck, paralysis)",
          "Greenish diarrhea",
          "Swelling around eyes and neck",
          "Sudden death",
          "Drop in egg production (layers)"
        ],
        causes: [
          "Highly contagious paramyxovirus",
          "Airborne transmission",
          "Contaminated equipment and clothing",
          "Wild birds and rodents",
          "Poor biosecurity"
        ],
        treatment: {
          immediate: [
            "No specific treatment available",
            "Quarantine entire flock immediately",
            "Notify veterinary authorities (notifiable disease)",
            "Implement emergency biosecurity measures"
          ],
          medication: {
            supportive: "Vitamin B-complex and electrolytes for supportive care",
            secondary: "Antibiotics to prevent secondary bacterial infections",
            symptomatic: "Anti-inflammatory drugs for severe respiratory distress"
          },
          duration: "Supportive care only, focus on prevention"
        },
        prevention: [
          "Strict vaccination schedule (B1 strain at 7, 21, and 35 days)",
          "Quarantine new birds for 21 days",
          "Control access to farm premises",
          "Disinfect vehicles and equipment",
          "Rodent and wild bird control"
        ],
        prognosis: "Very poor once clinical signs appear, prevention is critical"
      },
      infectious_bronchitis: {
        name: "Infectious Bronchitis",
        severity: "medium",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "More severe respiratory symptoms due to rapid metabolism",
          "Cobb 500": "Good recovery rate with proper management",
          "Arbor Acres": "Generally milder symptoms, good prognosis"
        },
        symptoms: [
          "Coughing and sneezing",
          "Nasal discharge",
          "Reduced feed intake",
          "Huddling and depression",
          "Reduced growth rate",
          "Watery eyes"
        ],
        causes: [
          "Coronavirus infection",
          "Poor ventilation",
          "Temperature fluctuations",
          "Overcrowding",
          "Stress factors"
        ],
        treatment: {
          immediate: [
            "Improve ventilation and temperature control",
            "Reduce stocking density",
            "Provide warm, comfortable environment"
          ],
          medication: {
            primary: "Tylosin 10mg/kg in drinking water for 5-7 days",
            alternative: "Oxytetracycline 20mg/kg in feed for 7 days",
            supportive: "Vitamin C 100mg/liter water to boost immunity"
          },
          duration: "7-10 days with environmental management"
        },
        prevention: [
          "Vaccination at 10-14 days of age",
          "Maintain optimal environmental conditions",
          "Avoid sudden temperature changes",
          "Ensure adequate ventilation",
          "Reduce stress factors"
        ],
        prognosis: "Good with proper treatment and management"
      }
    },
    vaccinations: {
      required: [
        {
          vaccine: "Newcastle Disease (B1 strain)",
          timing: "Day 21-25",
          method: "Drinking water or coarse spray",
          dosage: {
            drinking_water: "1 dose per bird in 1000ml water for 1000 birds",
            spray: "0.03ml per bird via coarse spray (droplet size 80-120 microns)",
            concentration: "Live B1 strain vaccine (minimum 10^6 EID50 per dose)"
          },
          administration: {
            route: "Oral (drinking water) or Respiratory (coarse spray)",
            preparation: "Reconstitute with chlorine-free water, add stabilizer if provided",
            timing: "Early morning when birds are active and thirsty",
            precautions: "Withhold water 2-3 hours before vaccination, ensure consumption within 2 hours"
          },
          notes: "Second booster - critical for maintaining immunity against Newcastle disease"
        }
      ],
      optional: [
        {
          vaccine: "Infectious Bronchitis booster",
          timing: "Day 28",
          method: "Drinking water or coarse spray",
          dosage: {
            drinking_water: "1 dose per bird in 1000ml water for 1000 birds",
            spray: "0.03ml per bird via coarse spray application",
            concentration: "Live attenuated Massachusetts strain or variant"
          },
          administration: {
            route: "Oral (drinking water) or Respiratory (coarse spray)",
            preparation: "Use chlorine-free water, maintain cold chain until use",
            application: "Spray from 40cm distance, ensure even coverage",
            storage: "Store at 2-8°C, protect from light, use within 1 hour after reconstitution"
          },
          notes: "Recommended in areas with respiratory disease history - boosts local immunity"
        }
      ]
    },
    managementTips: [
      "Maintain temperature at 23-26°C",
      "Ensure adequate ventilation without drafts",
      "Monitor feed conversion ratio",
      "Check for uniform growth across flock",
      "Implement regular health monitoring"
    ]
  },

  week5: {
    title: "Week 5: Pre-Finisher Phase",
    ageRange: "29-35 days",
    criticalPeriod: false,
    commonDiseases: {
      ascites: {
        name: "Ascites (Water Belly)",
        severity: "medium",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Highest risk due to rapid growth and high metabolic rate",
          "Cobb 500": "Moderate risk, good response to management changes",
          "Arbor Acres": "Lower incidence, more resistant to metabolic disorders"
        },
        symptoms: [
          "Distended abdomen with fluid",
          "Difficulty breathing",
          "Reduced activity and appetite",
          "Bluish comb and wattles",
          "Sudden death",
          "Poor growth performance"
        ],
        causes: [
          "Rapid growth rate",
          "High altitude or poor ventilation",
          "Cold stress",
          "High-energy diets",
          "Genetic predisposition"
        ],
        treatment: {
          immediate: [
            "Reduce feed energy density",
            "Improve ventilation and temperature control",
            "Implement feed restriction program"
          ],
          medication: {
            supportive: "Vitamin E + Selenium 0.2ml per bird weekly",
            diuretic: "Furosemide 2-5mg/kg body weight (veterinary prescription)",
            management: "Reduce lighting to 18 hours to slow growth"
          },
          duration: "Ongoing management changes"
        },
        prevention: [
          "Controlled feeding programs",
          "Maintain optimal temperature (avoid cold stress)",
          "Ensure excellent ventilation",
          "Use lower energy density feeds",
          "Implement lighting programs to control growth"
        ],
        prognosis: "Prevention is key, treatment has limited success"
      },
      leg_weakness: {
        name: "Leg Weakness and Lameness",
        severity: "medium",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Highest incidence due to rapid weight gain",
          "Cobb 500": "Moderate incidence, responds to nutritional management",
          "Arbor Acres": "Lower incidence, better leg strength genetics"
        },
        symptoms: [
          "Reluctance to walk or stand",
          "Sitting on hocks",
          "Twisted or deformed legs",
          "Lameness and limping",
          "Reduced feed and water intake",
          "Poor weight gain"
        ],
        causes: [
          "Rapid growth outpacing bone development",
          "Nutritional imbalances (calcium, phosphorus)",
          "Vitamin D deficiency",
          "Poor flooring conditions",
          "Genetic factors"
        ],
        treatment: {
          immediate: [
            "Improve flooring with better traction",
            "Reduce stocking density",
            "Ensure easy access to feed and water"
          ],
          medication: {
            nutritional: "Calcium + Phosphorus + Vitamin D3 supplement",
            anti_inflammatory: "Aspirin 10mg/kg for pain relief (short term)",
            supportive: "Vitamin B-complex for nerve function"
          },
          duration: "Ongoing nutritional and management support"
        },
        prevention: [
          "Balanced calcium:phosphorus ratio (2:1)",
          "Adequate Vitamin D3 supplementation",
          "Controlled growth programs",
          "Good quality flooring with proper drainage",
          "Regular exercise and movement"
        ],
        prognosis: "Good if caught early and managed properly"
      }
    },
    vaccinations: {
      required: [
        {
          vaccine: "Newcastle Disease (B1 strain)",
          timing: "Day 35",
          method: "Drinking water",
          notes: "Third booster for continued protection"
        }
      ],
      optional: [
        {
          vaccine: "Fowl Cholera",
          timing: "Day 30-35",
          method: "Injection",
          notes: "Only in areas with known cholera problems"
        }
      ]
    },
    managementTips: [
      "Maintain temperature at 20-23°C",
      "Transition to finisher feed",
      "Monitor leg health and mobility",
      "Ensure adequate space per bird",
      "Check ventilation system efficiency"
    ]
  },

  week6: {
    title: "Week 6: Finisher Phase",
    ageRange: "36-42 days",
    criticalPeriod: false,
    commonDiseases: {
      sudden_death_syndrome: {
        name: "Sudden Death Syndrome (Flip-over Disease)",
        severity: "high",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Highest risk due to rapid growth and high feed conversion",
          "Cobb 500": "Moderate risk, good response to feeding management",
          "Arbor Acres": "Lower risk but still requires monitoring"
        },
        symptoms: [
          "Sudden death of apparently healthy birds",
          "Birds found on their backs",
          "Usually affects fastest-growing birds",
          "No prior symptoms",
          "Peak occurrence at 4-6 weeks"
        ],
        causes: [
          "Rapid growth and high metabolic rate",
          "High-energy feeds",
          "Overeating",
          "Stress factors",
          "Genetic predisposition"
        ],
        treatment: {
          immediate: [
            "No treatment available once it occurs",
            "Focus on prevention in remaining birds",
            "Implement feed restriction immediately"
          ],
          management: {
            feeding: "Reduce feed energy density by 5-10%",
            schedule: "Implement skip-a-day feeding or restricted feeding",
            lighting: "Reduce lighting to 18 hours to slow growth"
          },
          duration: "Ongoing prevention measures"
        },
        prevention: [
          "Controlled feeding programs",
          "Avoid high-energy feeds",
          "Implement lighting programs",
          "Reduce stress factors",
          "Monitor growth rate closely"
        ],
        prognosis: "Prevention is the only option, no treatment available"
      },
      heat_stress: {
        name: "Heat Stress",
        severity: "medium",
        applicableBreeds: ["Ross 308", "Cobb 500", "Arbor Acres"],
        breedSpecificNotes: {
          "Ross 308": "Most susceptible due to high metabolic rate",
          "Cobb 500": "Moderate susceptibility, good response to cooling",
          "Arbor Acres": "More heat tolerant but still requires management"
        },
        symptoms: [
          "Panting and open-mouth breathing",
          "Reduced feed intake",
          "Increased water consumption",
          "Lethargy and wing spreading",
          "Reduced growth rate",
          "Increased mortality"
        ],
        causes: [
          "High ambient temperature (>30°C)",
          "Poor ventilation",
          "High humidity",
          "Overcrowding",
          "Direct sunlight exposure"
        ],
        treatment: {
          immediate: [
            "Increase ventilation immediately",
            "Provide shade and cooling",
            "Ensure adequate water supply"
          ],
          medication: {
            electrolytes: "Oral rehydration salts in drinking water",
            vitamin_c: "Vitamin C 200mg/liter water for stress relief",
            cooling: "Wet the roof or use evaporative cooling"
          },
          duration: "Until environmental conditions improve"
        },
        prevention: [
          "Adequate ventilation system",
          "Provide shade structures",
          "Maintain optimal stocking density",
          "Ensure continuous water supply",
          "Feed during cooler parts of the day"
        ],
        prognosis: "Excellent with proper environmental management"
      }
    },
    vaccinations: {
      required: [],
      optional: [
        {
          vaccine: "Newcastle Disease (Lasota strain)",
          timing: "Day 42",
          method: "Drinking water",
          notes: "Final booster before processing (if keeping longer)"
        }
      ]
    },
    managementTips: [
      "Maintain temperature at 18-21°C",
      "Monitor for heat stress signs",
      "Prepare for processing or market",
      "Final weight and performance assessment",
      "Ensure optimal finishing conditions"
    ]
  }
};

// Emergency response protocols
export const EMERGENCY_PROTOCOLS = {
  high_mortality: {
    threshold: "More than 2% daily mortality",
    immediate_actions: [
      "Isolate sick birds immediately",
      "Contact veterinarian",
      "Implement strict biosecurity",
      "Document symptoms and timeline",
      "Preserve samples for laboratory testing"
    ],
    notification_required: true
  },
  respiratory_outbreak: {
    threshold: "More than 10% of flock showing respiratory symptoms",
    immediate_actions: [
      "Improve ventilation immediately",
      "Check for Newcastle disease symptoms",
      "Isolate affected birds",
      "Start supportive treatment",
      "Contact veterinary authorities if Newcastle suspected"
    ],
    notification_required: "If Newcastle disease suspected"
  },
  digestive_outbreak: {
    threshold: "More than 15% of flock with diarrhea",
    immediate_actions: [
      "Check feed and water quality",
      "Remove contaminated feed",
      "Provide electrolyte solution",
      "Start appropriate treatment",
      "Improve sanitation"
    ],
    notification_required: false
  }
};

// Breed-specific vaccination schedules
export const VACCINATION_SCHEDULES = {
  "Ross 308": {
    critical_vaccines: [
      { vaccine: "Marek's Disease", day: 1, method: "Injection" },
      { vaccine: "Newcastle B1", day: 7, method: "Eye drop" },
      { vaccine: "Gumboro", day: 14, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 21, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 35, method: "Drinking water" }
    ],
    optional_vaccines: [
      { vaccine: "Infectious Bronchitis", day: 10, method: "Spray" },
      { vaccine: "Fowl Pox", day: 21, method: "Wing web" }
    ]
  },
  "Cobb 500": {
    critical_vaccines: [
      { vaccine: "Marek's Disease", day: 1, method: "Injection" },
      { vaccine: "Newcastle B1", day: 7, method: "Eye drop" },
      { vaccine: "Gumboro", day: 16, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 21, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 35, method: "Drinking water" }
    ],
    optional_vaccines: [
      { vaccine: "Infectious Bronchitis", day: 12, method: "Spray" },
      { vaccine: "Fowl Pox", day: 28, method: "Wing web" }
    ]
  },
  "Arbor Acres": {
    critical_vaccines: [
      { vaccine: "Marek's Disease", day: 1, method: "Injection" },
      { vaccine: "Newcastle B1", day: 7, method: "Eye drop" },
      { vaccine: "Gumboro", day: 18, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 21, method: "Drinking water" },
      { vaccine: "Newcastle B1", day: 35, method: "Drinking water" }
    ],
    optional_vaccines: [
      { vaccine: "Infectious Bronchitis", day: 14, method: "Spray" },
      { vaccine: "Fowl Pox", day: 21, method: "Wing web" }
    ]
  }
};

// Treatment dosage calculator
export const DOSAGE_CALCULATOR = {
  calculateDosage: (medication, birdWeight, dosagePerKg) => {
    return (birdWeight * dosagePerKg / 1000).toFixed(2); // Convert to ml or g
  },
  
  waterMedication: (medication, flockSize, dosagePerLiter) => {
    const dailyWaterConsumption = flockSize * 0.2; // Approximate 200ml per bird per day
    return (dailyWaterConsumption * dosagePerLiter).toFixed(2);
  },
  
  feedMedication: (medication, dailyFeedConsumption, dosagePerKg) => {
    return (dailyFeedConsumption * dosagePerKg / 1000).toFixed(2);
  }
};

// Helper functions
export const getDiseasesByWeek = (week) => {
  const weekKey = `week${week}`;
  if (!DISEASE_GUIDE[weekKey]) return [];
  
  return Object.entries(DISEASE_GUIDE[weekKey].commonDiseases || {}).map(([key, disease]) => ({
    id: key,
    ...disease
  }));
};

export const getDiseasesByBreed = (breed) => {
  const allDiseases = [];
  
  Object.entries(DISEASE_GUIDE).forEach(([weekKey, weekData]) => {
    if (weekData.commonDiseases) {
      Object.entries(weekData.commonDiseases).forEach(([diseaseKey, disease]) => {
        if (disease.applicableBreeds && disease.applicableBreeds.includes(breed)) {
          allDiseases.push({
            id: diseaseKey,
            week: weekKey,
            ...disease
          });
        }
      });
    }
  });
  
  return allDiseases;
};

// Export DISEASE_GUIDE as DISEASE_DATA for compatibility
export const DISEASE_DATA = DISEASE_GUIDE;

// Export all data
export default {
  DISEASE_GUIDE,
  DISEASE_DATA,
  EMERGENCY_PROTOCOLS,
  VACCINATION_SCHEDULES,
  DOSAGE_CALCULATOR,
  getDiseasesByWeek,
  getDiseasesByBreed
};