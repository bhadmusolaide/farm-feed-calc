import React, { useState, useEffect } from 'react';
import { optimizeFeedFormulation, generateComprehensiveRecommendations } from '../shared/utils/feedCalculator';

const FeedOptimization = ({ feedData, performanceData, environmentalData }) => {
  const [optimization, setOptimization] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [optimizationParams, setOptimizationParams] = useState({
    targetProtein: '',
    budgetPerKg: ''
  });
  const [showOptimization, setShowOptimization] = useState(false);

  useEffect(() => {
    if (feedData && performanceData && environmentalData) {
      const comprehensiveRecommendations = generateComprehensiveRecommendations(
        feedData,
        performanceData,
        environmentalData
      );
      setRecommendations(comprehensiveRecommendations);
    }
  }, [feedData, performanceData, environmentalData]);

  const handleOptimization = () => {
    if (!feedData) return;

    const params = {
      birdType: feedData.birdType,
      ageInDays: feedData.ageInDays,
      targetProtein: parseFloat(optimizationParams.targetProtein) || undefined,
      budgetPerKg: parseFloat(optimizationParams.budgetPerKg) || undefined
    };

    const result = optimizeFeedFormulation(params);
    setOptimization(result);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Feed Management Optimization
      </h3>

      {/* Comprehensive Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">
            Management Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{rec.category}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm mb-2">{rec.recommendation}</p>
                <p className="text-xs font-medium">Action: {rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Formulation Optimization */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-700">
            Feed Formulation Optimizer
          </h4>
          <button
            onClick={() => setShowOptimization(!showOptimization)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showOptimization ? 'Hide' : 'Show'} Optimizer
          </button>
        </div>

        {showOptimization && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Protein % (optional)
                </label>
                <input
                  type="number"
                  value={optimizationParams.targetProtein}
                  onChange={(e) => setOptimizationParams(prev => ({
                    ...prev,
                    targetProtein: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget per kg (₦) (optional)
                </label>
                <input
                  type="number"
                  value={optimizationParams.budgetPerKg}
                  onChange={(e) => setOptimizationParams(prev => ({
                    ...prev,
                    budgetPerKg: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 800"
                />
              </div>
            </div>

            <button
              onClick={handleOptimization}
              disabled={!feedData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              Optimize Feed Formulation
            </button>

            {optimization && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {optimization.success ? (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">
                      Optimized Formulation for {optimization.phase} phase
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h6 className="font-medium text-sm text-gray-700 mb-2">Ingredients (%)</h6>
                        <div className="space-y-1">
                          {Object.entries(optimization.optimizedFormulation.ingredients).map(([ingredient, percentage]) => (
                            <div key={ingredient} className="flex justify-between text-sm">
                              <span>{ingredient}:</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-sm text-gray-700 mb-2">Nutritional Content</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-medium">{optimization.optimizedFormulation.nutritionalContent.protein}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Calcium:</span>
                            <span className="font-medium">{optimization.optimizedFormulation.nutritionalContent.calcium}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost per kg:</span>
                            <span className="font-medium">₦{optimization.optimizedFormulation.costPerKg}</span>
                          </div>
                          {optimization.optimizedFormulation.savings > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Savings:</span>
                              <span className="font-medium">₦{optimization.optimizedFormulation.savings}/kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 className="font-medium text-sm text-gray-700 mb-2">Recommendations</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {optimization.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h5 className="font-medium text-red-600 mb-2">
                      Optimization Failed
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">{optimization.message}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {optimization.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedOptimization;