'use client';

import { useState, useEffect } from 'react';
import { useFeedStore, useKnowledgeStore } from '../lib/store';
import { useSiteSettingsStore } from '../lib/siteSettingsStore';
import FeedCalculator from '../components/FeedCalculator';
import FeedResults from '../components/FeedResults';
import RecommendedFeeds from '../components/RecommendedFeeds';
import KnowledgeSnippets from '../components/KnowledgeSnippets';
import SavedResults from '../components/SavedResults';
import DailyDashboard from '../components/DailyDashboard';
import AutoProgressionNotifications from '../components/AutoProgressionNotifications';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import OfflineIndicator from '../components/OfflineIndicator';
import { Calculator, BookOpen, Package, Lightbulb, Archive } from 'lucide-react';

const tabs = [
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    description: 'Calculate feed requirements'
  },
  {
    id: 'results',
    name: 'Results',
    icon: Package,
    description: 'View calculation results'
  },
  {
    id: 'saved',
    name: 'Saved',
    icon: Archive,
    description: 'View saved calculations'
  },
  {
    id: 'feeds',
    name: 'Recommended Feeds',
    icon: BookOpen,
    description: 'Browse feed brands'
  },
  {
    id: 'knowledge',
    name: 'Best Practices',
    icon: Lightbulb,
    description: 'Weekly tips and advice'
  }
];

export default function HomePage() {
  const { activeTab, setActiveTab, showResults } = useFeedStore();
  const { loadWeeklyKnowledge } = useKnowledgeStore();
  const { getSiteTitle, getFooterDescription, getFooterFeatures, getFooterSupport, getFooterCopyright } = useSiteSettingsStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadWeeklyKnowledge();
  }, [loadWeeklyKnowledge]);

  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <FeedCalculator />;
      case 'results':
        return showResults ? <FeedResults /> : (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
              No Results Yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Calculate feed requirements first to see results here.
            </p>
            <button
              onClick={() => setActiveTab('calculator')}
              className="btn-primary"
            >
              Go to Calculator
            </button>
          </div>
        );
      case 'saved':
        return <SavedResults />;
      case 'feeds':
        return <RecommendedFeeds />;
      case 'knowledge':
        return <KnowledgeSnippets />;
      default:
        return <FeedCalculator />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-neutral-950 dark:via-primary-950 dark:to-secondary-950"></div>
        <div className="absolute inset-0 farm-pattern opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-tertiary-400/30 rounded-full blur-3xl animate-float pulse-rainbow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-400/30 to-accent-400/30 rounded-full blur-3xl animate-float pulse-rainbow" style={{animationDelay: '1s'}}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-primary-400 to-tertiary-400 rounded-full animate-float opacity-70 pulse-rainbow"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-secondary-400 to-accent-400 rounded-full animate-float opacity-60 pulse-rainbow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full animate-float opacity-50 pulse-rainbow" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-tertiary-400 to-secondary-400 rounded-full animate-float opacity-60 pulse-rainbow" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="container-app py-6 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-4 shadow-xl animate-glow">
            <div className="text-white text-2xl">🐔</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            Smart Feed Calculator
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Optimize your poultry feeding with precision calculations tailored for Nigerian farmers
          </p>
        </div>
        
        {/* Auto-Progression Notifications */}
      <AutoProgressionNotifications />
      
      {/* Daily Dashboard */}
      <DailyDashboard />
        
        {/* Mobile-first tab navigation */}
        <div className="mb-8">
          <Navigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-12">
        <div className="container-app py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="/omzo_farmz_logo.png" 
                  alt="Omzo Farmz Logo" 
                  className="w-32 h-32 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-100">
                  {getSiteTitle()}
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                {getFooterDescription()}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {getFooterFeatures().map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                {getFooterSupport().map((support, index) => (
                  <li key={index}>• {support}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 mt-8 pt-6 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {getFooterCopyright()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}