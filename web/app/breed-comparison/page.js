'use client';

import { useState } from 'react';
import { ArrowLeft, Info, Thermometer, Clock, TrendingUp, DollarSign, Award, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const breedData = {
  broilers: {
    'Cobb 500': {
      image: '/Cobb500.jpg',
      description: 'World\'s most efficient broiler with excellent feed conversion and rapid growth',
      marketWeight: '2.0-2.5 kg',
      marketAge: '32-35 days',
      fcr: '1.45-1.55',
      dailyGain: '65-75g',
      advantages: [
        'Excellent feed conversion ratio',
        'Rapid early growth',
        'Heat tolerant for tropical climates',
        'Uniform growth pattern',
        'Lower production costs'
      ],
      disadvantages: [
        'Requires consistent high-quality feed',
        'More susceptible to diseases if not well managed',
        'Higher mortality in poor management conditions'
      ],
      suitability: 'Best for commercial operations with good management and consistent feed supply',
      nigerianAdaptation: 'Excellent adaptation to Nigerian climate, widely used in Southwest Nigeria'
    },
    'Ross 308': {
      image: '/Ross 308.webp',
      description: 'Robust broiler with excellent breast meat yield and consistent performance',
      marketWeight: '2.2-2.8 kg',
      marketAge: '35-38 days',
      fcr: '1.50-1.65',
      dailyGain: '60-70g',
      advantages: [
        'Higher breast meat yield',
        'Better resistance to metabolic disorders',
        'Consistent performance across conditions',
        'Good livability rates',
        'Handles feed quality variations better'
      ],
      disadvantages: [
        'Slightly slower growth than Cobb 500',
        'Higher feed costs due to longer rearing period',
        'More sensitive to high temperatures'
      ],
      suitability: 'Ideal for processors focused on breast meat and farmers with variable feed quality',
      nigerianAdaptation: 'Good adaptation but requires better ventilation in hot seasons'
    },
    'Arbor Acres': {
      image: '/ArborAcres.png',
      description: 'Hardy broiler breed known for disease resistance and adaptability',
      marketWeight: '2.0-2.4 kg',
      marketAge: '35-40 days',
      fcr: '1.55-1.70',
      dailyGain: '55-65g',
      advantages: [
        'Excellent disease resistance',
        'Good adaptability to various climates',
        'Lower mortality rates',
        'Performs well on lower quality feeds',
        'Good for extensive farming systems'
      ],
      disadvantages: [
        'Slower growth rate',
        'Lower feed conversion efficiency',
        'Smaller final weight',
        'Lower breast meat percentage'
      ],
      suitability: 'Perfect for smallholder farmers and areas with limited veterinary services',
      nigerianAdaptation: 'Excellent adaptation to Nigerian conditions, very popular among small-scale farmers'
    }
  },
  layers: {
    'ISA Brown': {
      image: '/Isa brown.jpg',
      description: 'World\'s leading brown egg layer with exceptional production and adaptability',
      eggProduction: '300-320 eggs/year',
      peakProduction: '95% at 24-28 weeks',
      fcr: '2.0-2.2 kg feed/kg eggs',
      eggWeight: '62-65g',
      advantages: [
        'Highest egg production globally',
        'Excellent feed conversion',
        'Adapts to various climates and housing',
        'Strong and reliable performance',
        'Good livability (93%+)'
      ],
      disadvantages: [
        'Requires high-quality layer feed',
        'More expensive to purchase',
        'Sensitive to poor management',
        'Higher feed consumption (110-120g/day)'
      ],
      suitability: 'Best for commercial egg production with proper management and quality feed',
      nigerianAdaptation: 'Excellent performance in Nigerian climate with proper housing and nutrition'
    },
    'Lohmann Brown': {
      image: '/Lohmann-brown.png',
      description: 'Robust layer breed with consistent egg production and good adaptability',
      eggProduction: '280-300 eggs/year',
      peakProduction: '92% at 25-30 weeks',
      fcr: '2.1-2.3 kg feed/kg eggs',
      eggWeight: '60-63g',
      advantages: [
        'Good disease resistance',
        'Consistent egg production',
        'Adapts well to tropical conditions',
        'Lower feed requirements than ISA Brown',
        'Good for semi-intensive systems'
      ],
      disadvantages: [
        'Lower peak production than ISA Brown',
        'Shorter laying period',
        'Smaller egg size',
        'More aggressive behavior'
      ],
      suitability: 'Suitable for medium-scale farmers with moderate management capabilities',
      nigerianAdaptation: 'Very good adaptation to Nigerian conditions, popular in rural areas'
    },
    'Hy-Line Brown': {
      image: '/hy-line-brown.jpg',
      description: 'Versatile layer breed with good production and excellent livability',
      eggProduction: '270-290 eggs/year',
      peakProduction: '90% at 26-32 weeks',
      fcr: '2.2-2.4 kg feed/kg eggs',
      eggWeight: '58-62g',
      advantages: [
        'Excellent livability and hardiness',
        'Good performance on lower quality feeds',
        'Calm temperament',
        'Good for free-range systems',
        'Lower initial cost'
      ],
      disadvantages: [
        'Lower egg production than ISA Brown',
        'Smaller egg size',
        'Shorter production cycle',
        'Lower feed conversion efficiency'
      ],
      suitability: 'Ideal for smallholder farmers and free-range systems',
      nigerianAdaptation: 'Excellent adaptation to Nigerian village conditions and extensive systems'
    }
  }
};

export default function BreedComparisonPage() {
  const [selectedType, setSelectedType] = useState('broilers');
  const [selectedBreed, setSelectedBreed] = useState(null);

  const currentData = breedData[selectedType];
  const breeds = Object.keys(currentData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="glass backdrop-blur-xl border-b border-white/20 dark:border-neutral-700/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="btn-ghost p-2 interactive-scale">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
                  Breed Comparison Guide
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Compare popular poultry breeds for Nigerian farmers
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Choose the Right Breed for Your Farm
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                This comprehensive guide compares the most popular poultry breeds used in Nigeria, 
                especially in the Southwest region. Each breed has unique characteristics that make 
                them suitable for different farming conditions, management levels, and market requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 inline-flex rounded-xl">
            <button
              onClick={() => {
                setSelectedType('broilers');
                setSelectedBreed(null);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedType === 'broilers'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              🐔 Broilers (Meat)
            </button>
            <button
              onClick={() => {
                setSelectedType('layers');
                setSelectedBreed(null);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedType === 'layers'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              🥚 Layers (Eggs)
            </button>
          </div>
        </div>

        {/* Breed Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {breeds.map((breedName) => {
            const breed = currentData[breedName];
            return (
              <div
                key={breedName}
                className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedBreed === breedName ? 'ring-2 ring-primary-500 shadow-xl' : ''
                }`}
                onClick={() => setSelectedBreed(selectedBreed === breedName ? null : breedName)}
              >
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={breed.image}
                      alt={breedName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCAyNEM0MS4zNzI2IDI0IDM2IDI5LjM3MjYgMzYgMzZWNDhDMzYgNTQuNjI3NCA0MS4zNzI2IDYwIDQ4IDYwQzU0LjYyNzQgNjAgNjAgNTQuNjI3NCA2MCA0OFYzNkM2MCAyOS4zNzI2IDU0LjYyNzQgMjQgNDggMjRaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjQyIiBjeT0iNDAiIHI9IjIiIGZpbGw9IiM2QjcyODAiLz4KPGNpcmNsZSBjeD0iNTQiIGN5PSI0MCIgcj0iMiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {breedName}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {breed.description}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2 text-sm">
                  {selectedType === 'broilers' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Market Weight:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.marketWeight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Market Age:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.marketAge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">FCR:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.fcr}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Eggs/Year:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.eggProduction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Peak Production:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.peakProduction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">FCR:</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{breed.fcr}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    {selectedBreed === breedName ? 'Click to collapse' : 'Click for details'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comparison */}
        {selectedBreed && (
          <div className="glass-card p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {selectedBreed} - Detailed Analysis
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">
                {currentData[selectedBreed].description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Advantages */}
              <div>
                <div className="flex items-center mb-4">
                  <Award className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Advantages
                  </h3>
                </div>
                <ul className="space-y-2">
                  {currentData[selectedBreed].advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-neutral-700 dark:text-neutral-300">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disadvantages */}
              <div>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Considerations
                  </h3>
                </div>
                <ul className="space-y-2">
                  {currentData[selectedBreed].disadvantages.map((disadvantage, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-neutral-700 dark:text-neutral-300">{disadvantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suitability and Adaptation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Best Suited For
                </h4>
                <p className="text-blue-800 dark:text-blue-200">
                  {currentData[selectedBreed].suitability}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                  Nigerian Adaptation
                </h4>
                <p className="text-green-800 dark:text-green-200">
                  {currentData[selectedBreed].nigerianAdaptation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="glass-card p-6 mt-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
            Quick Comparison Table - {selectedType === 'broilers' ? 'Broilers' : 'Layers'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Breed</th>
                  {selectedType === 'broilers' ? (
                    <>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Market Weight</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Market Age</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">FCR</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Daily Gain</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Eggs/Year</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Peak Production</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">FCR</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">Egg Weight</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {breeds.map((breedName) => {
                  const breed = currentData[breedName];
                  return (
                    <tr key={breedName} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">{breedName}</td>
                      {selectedType === 'broilers' ? (
                        <>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.marketWeight}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.marketAge}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.fcr}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.dailyGain}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.eggProduction}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.peakProduction}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.fcr}</td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">{breed.eggWeight}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips for Nigerian Farmers */}
        <div className="glass-card p-6 mt-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            🇳🇬 Tips for Nigerian Farmers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Thermometer className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Climate Considerations</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Southwest Nigeria's tropical climate favors heat-tolerant breeds like Cobb 500 and Arbor Acres. 
                    Ensure proper ventilation during hot seasons.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Cost Management</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Consider your budget for feed quality. Arbor Acres and Hy-Line Brown perform well 
                    on moderate quality feeds, reducing costs.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Management Level</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    New farmers should start with hardy breeds like Arbor Acres or Lohmann Brown 
                    before moving to high-performance breeds.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Market Focus</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Choose breeds based on your target market: Ross 308 for premium meat, 
                    ISA Brown for maximum egg production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}