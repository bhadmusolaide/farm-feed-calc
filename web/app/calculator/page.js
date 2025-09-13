'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUnifiedStore } from '../../lib/unifiedStore';
import FeedCalculator from '../../components/FeedCalculator';
import FeedResults from '../../components/FeedResults';
import RecommendedFeeds from '../../components/RecommendedFeeds';
import KnowledgeSnippets from '../../components/KnowledgeSnippets';
import SavedResults from '../../components/SavedResults';
import DailyDashboard from '../../components/DailyDashboard';
import AutoProgressionNotifications from '../../components/AutoProgressionNotifications';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation';
import OfflineIndicator from '../../components/OfflineIndicator';
import { Calculator, BookOpen, Package, Lightbulb, Archive, ArrowRight } from 'lucide-react';

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
  const { activeTab, setActiveTab, showResults, loadWeeklyKnowledge, getSiteTitle, getFooterDescription, getFooterFeatures, getFooterSupport, getFooterCopyright } = useUnifiedStore();
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

        {/* Poultry Products Promotion */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800/50">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-6">
              <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                From Feed Calculations to Fresh Poultry
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Our precision feed calculations don't just help you save money - they also ensure the highest quality poultry products. 
                Experience the difference with our farm-fresh broilers, chicken parts, and pet food.
              </p>
              <Link href="/poultry-products" className="btn-primary inline-flex items-center">
                View Our Poultry Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-neutral-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center text-neutral-400">
                Poultry Image
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 mt-12">
        <div className="container-app py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <img
                  src="/omzo_farmz_logo.png"
                  alt="Omzo Farmz Logo"
                  className="w-32 h-32 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <h3 className="font-display font-semibold text-neutral-900 dark:text-neutral-100">
                    {getSiteTitle()}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mt-1">
                    {getFooterDescription()}
                  </p>
                </div>
              </div>
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
            {/* Social Media Links */}
            <div className="flex justify-center space-x-4 mb-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
            
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {getFooterCopyright()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}