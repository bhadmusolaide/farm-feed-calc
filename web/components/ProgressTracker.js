'use client';

import { useState, useEffect } from 'react';
import { useUnifiedStore } from '../lib/unifiedStore';
import { TrendingUp, TrendingDown, BarChart3, Target, Award } from 'lucide-react';
import { clsx } from 'clsx';
import { calculateFeed, getFeedType, getProtein } from '../../shared/utils/feedCalculator';

const ProgressTracker = ({ calculationId }) => {
  const { savedCalculations, calculateNextDay } = useUnifiedStore();
  const [progressData, setProgressData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('feed_efficiency');

  useEffect(() => {
    const calculation = savedCalculations.find(calc => calc.id === calculationId);
    if (!calculation || !calculation.autoProgression) return;

    const generateProgressData = () => {
      const startDate = new Date(calculation.startDate);
      const today = new Date();
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

      const progressPoints = [];

      for (let day = 0; day <= daysSinceStart; day++) {
        const currentAge = calculation.ageInDays + day;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);

        // Calculate quantity considering mortality up to currentDate
        let currentQuantity = calculation.quantity;
        if (Array.isArray(calculation.mortalityLog) && calculation.mortalityLog.length > 0) {
          calculation.mortalityLog.forEach(log => {
            const logDate = new Date(log.date);
            if (logDate <= currentDate) {
              currentQuantity -= log.deaths || 0;
            }
          });
        }
        currentQuantity = Math.max(0, currentQuantity);

        // Compute feed metrics for the specific historical day using shared utils
        let perDayFeed = null;
        try {
          const feedResults = calculateFeed({
            birdType: calculation.birdType,
            breed: calculation.breed,
            ageInDays: currentAge,
            quantity: currentQuantity,
            rearingStyle: calculation.rearingStyle,
            targetWeight: calculation.targetWeight
          });

          perDayFeed = {
            feedPerBirdGrams: feedResults?.perBird?.grams ?? 0,
            totalFeedKg: (feedResults?.total?.grams ?? 0) / 1000
          };
        } catch (e) {
          // Fallback to zeros for this day if calculation fails
          perDayFeed = { feedPerBirdGrams: 0, totalFeedKg: 0 };
        }

        const feedType = getFeedType(
          calculation.birdType,
          currentAge
        );
        const protein = getProtein(
          calculation.birdType,
          currentAge
        );

        progressPoints.push({
          day,
          date: currentDate.toISOString().split('T')[0],
          age: currentAge,
          quantity: currentQuantity,
          feedPerBird: perDayFeed.feedPerBirdGrams,
          totalFeed: perDayFeed.totalFeedKg,
          feedType,
          protein,
          feedEfficiency: currentQuantity > 0 ? ((perDayFeed.totalFeedKg * 1000) / currentQuantity) : 0,
          survivalRate: calculation.quantity > 0 ? ((currentQuantity / calculation.quantity) * 100) : 0
        });
      }

      setProgressData({
        calculation,
        points: progressPoints,
        summary: {
          totalDays: daysSinceStart + 1,
          currentAge: calculation.ageInDays + daysSinceStart,
          currentQuantity: progressPoints[progressPoints.length - 1]?.quantity || 0,
          totalMortality: calculation.quantity - (progressPoints[progressPoints.length - 1]?.quantity || 0),
          survivalRate: progressPoints[progressPoints.length - 1]?.survivalRate || 0,
          totalFeedConsumed: progressPoints.reduce((sum, point) => sum + (point.totalFeed || 0), 0),
          avgFeedEfficiency: progressPoints.length > 0
            ? progressPoints.reduce((sum, point) => sum + (point.feedEfficiency || 0), 0) / progressPoints.length
            : 0
        }
      });
    };
    
    generateProgressData();
  }, [calculationId, savedCalculations, calculateNextDay]);

  // Loading skeleton (non-interactive; no header/chevron)
  if (!progressData) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-4 py-4 bg-white dark:bg-neutral-800">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { points, summary } = progressData;

  const getMetricData = (metric) => {
    switch (metric) {
      case 'feed_efficiency':
        return points.map(p => ({ x: p.day, y: p.feedEfficiency, label: `${p.feedEfficiency.toFixed(1)}g/bird` }));
      case 'survival_rate':
        return points.map(p => ({ x: p.day, y: p.survivalRate, label: `${p.survivalRate.toFixed(1)}%` }));
      case 'feed_consumption':
        return points.map(p => ({ x: p.day, y: p.totalFeed, label: `${p.totalFeed.toFixed(1)}kg` }));
      case 'flock_size':
        return points.map(p => ({ x: p.day, y: p.quantity, label: `${p.quantity} birds` }));
      default:
        return [];
    }
  };

  const metricData = getMetricData(selectedMetric);
  const validData = metricData.filter(d => d.y != null && !isNaN(d.y));
  const maxValue = validData.length > 0 ? Math.max(...validData.map(d => d.y)) : 0;
  const minValue = validData.length > 0 ? Math.min(...validData.map(d => d.y)) : 0;
  
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'feed_efficiency': return 'text-blue-600 dark:text-blue-400';
      case 'survival_rate': return 'text-green-600 dark:text-green-400';
      case 'feed_consumption': return 'text-purple-600 dark:text-purple-400';
      case 'flock_size': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'feed_efficiency': return <BarChart3 className="h-4 w-4" />;
      case 'survival_rate': return <TrendingUp className="h-4 w-4" />;
      case 'feed_consumption': return <Target className="h-4 w-4" />;
      case 'flock_size': return <Award className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrend = (data) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const avg = recent.reduce((sum, d) => sum + d.y, 0) / recent.length;
    const earlier = data.slice(-6, -3);
    if (earlier.length === 0) return 'stable';
    const earlierAvg = earlier.reduce((sum, d) => sum + d.y, 0) / earlier.length;
    
    if (avg > earlierAvg * 1.05) return 'up';
    if (avg < earlierAvg * 0.95) return 'down';
    return 'stable';
  };

  const trend = getTrend(metricData);

  // Plain content container (no internal collapse; controlled by parent)
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="px-4 py-4 bg-white dark:bg-neutral-800">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Current Age</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{summary.currentAge} days</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Survival Rate</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{summary.survivalRate.toFixed(1)}%</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Feed</div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{summary.totalFeedConsumed.toFixed(1)}kg</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Current Flock</div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{summary.currentQuantity} birds</div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'feed_efficiency', label: 'Feed Efficiency' },
            { key: 'survival_rate', label: 'Survival Rate' },
            { key: 'feed_consumption', label: 'Feed Consumption' },
            { key: 'flock_size', label: 'Flock Size' }
          ].map(metric => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={clsx(
                "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedMetric === metric.key
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              )}
            >
              {getMetricIcon(metric.key)}
              <span>{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <h4 className={clsx("text-sm font-medium flex items-center space-x-2", getMetricColor(selectedMetric))}>
              {getMetricIcon(selectedMetric)}
              <span>{selectedMetric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </h4>
            <div className="flex items-center space-x-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              <span
                className={clsx(
                  "text-xs font-medium",
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-500'
                )}
              >
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
          
          <div className="h-32 relative bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-2">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="300"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-neutral-300 dark:text-neutral-600"
                />
              ))}
              
              {/* Data line */}
              {validData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={getMetricColor(selectedMetric)}
                  points={validData.map((d, i) => {
                    const x = validData.length > 1 ? (i / (validData.length - 1)) * 300 : 150;
                    const range = maxValue - minValue;
                    const y = range > 0 ? 100 - ((d.y - minValue) / range) * 100 : 50;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              )}
              
              {/* Data points */}
              {validData.map((d, i) => {
                const x = validData.length > 1 ? (i / (validData.length - 1)) * 300 : 150;
                const range = maxValue - minValue;
                const y = range > 0 ? 100 - ((d.y - minValue) / range) * 100 : 50;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="currentColor"
                    className={getMetricColor(selectedMetric)}
                  >
                    <title>{`Day ${d.x}: ${d.label}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
          
          {/* Chart labels */}
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>Day 0</span>
            <span>Day {summary.totalDays - 1}</span>
          </div>
        </div>

        {/* Recent Changes */}
        {points.length > 1 && (
          <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recent Changes</h5>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              {points.slice(-3).reverse().map((point, i) => (
                <div key={i} className="flex justify-between">
                  <span>Day {point.day} (Age {point.age}):</span>
                  <span>{point.feedType}, {point.quantity} birds, {point.totalFeed.toFixed(1)}kg feed</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;