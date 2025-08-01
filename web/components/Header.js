'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Info, FileText } from 'lucide-react';
import { useHybridSiteSettingsStore } from '../lib/hybridStore';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';

const ChickenIcon = () => (
  <svg
    className="w-8 h-8 text-primary-600"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 7.6 11.4 8 12 8S13 7.6 13 7V5.7C13.6 5.4 14 4.7 14 4C14 2.9 13.1 2 12 2ZM8 6C6.9 6 6 6.9 6 8V10C6 11.1 6.9 12 8 12H9V14C9 15.1 9.9 16 11 16H13C14.1 16 15 15.1 15 14V12H16C17.1 12 18 11.1 18 10V8C18 6.9 17.1 6 16 6H8ZM7 18C6.4 18 6 18.4 6 19S6.4 20 7 20S8 19.6 8 19S7.6 18 7 18ZM17 18C16.4 18 16 18.4 16 19S16.4 20 17 20S18 19.6 18 19S17.6 18 17 18ZM12 18C11.4 18 11 18.4 11 19S11.4 20 12 20S13 19.6 13 19S12.6 18 12 18Z" />
  </svg>
);

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { getSiteTitle, getSiteDescription } = useHybridSiteSettingsStore();

  return (
    <>
      <header className="glass backdrop-blur-xl border-b border-white/20 dark:border-neutral-700/20 sticky top-0 z-50">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div 
                className="flex-shrink-0 interactive-scale cursor-pointer"
                onClick={() => window.location.reload()}
                title="Home"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg animate-glow">
                  <img 
                    src="/omzo_farmz_logo.png" 
                    alt="Omzo Farmz Logo" 
                    className="w-10 h-10 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }}>
                    <ChickenIcon />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
                  {getSiteTitle()}
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 hidden sm:block">
                  {getSiteDescription()}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setShowInfo(true)}
                className="btn-ghost btn-sm interactive-scale glow-on-hover"
                title="App Information"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </button>
              <a
                href="/breed-comparison"
                className="btn-ghost btn-sm interactive-scale glow-on-hover"
                title="Breed Comparison"
              >
                <FileText className="w-4 h-4 mr-2" />
                Breed Comparison
              </a>
              <a
                href="/disclaimer"
                className="btn-ghost btn-sm interactive-scale glow-on-hover"
                title="Disclaimer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Disclaimer
              </a>
              <UserProfile />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <UserProfile />
              <ThemeToggle />
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="btn-ghost p-2"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-white/20 dark:border-neutral-700/20 py-4 animate-slide-up">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowInfo(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full btn-ghost justify-start interactive-scale"
                >
                  <Info className="w-4 h-4 mr-3" />
                  About This App
                </button>
                <a
                  href="/breed-comparison"
                  className="w-full btn-ghost justify-start interactive-scale"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Breed Comparison
                </a>
                <a
                  href="/disclaimer"
                  className="w-full btn-ghost justify-start interactive-scale"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Disclaimer
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-neutral-900 dark:text-neutral-100">
                  About Feed Calculator
                </h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="btn-ghost p-2"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Purpose</h3>
                  <p>
                    This calculator helps Nigerian and African poultry farmers determine 
                    optimal feed requirements for their birds, reducing waste and 
                    maximizing profitability.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Features</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Accurate feed calculations for broilers and layers</li>
                    <li>Support for popular Nigerian breeds</li>
                    <li>Local feed brand recommendations</li>
                    <li>Weekly best practices and tips</li>
                    <li>Offline functionality</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">How to Use</h3>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Select your bird type and breed</li>
                    <li>Enter the age and quantity of birds</li>
                    <li>Choose your rearing style</li>
                    <li>For broilers, select target weight</li>
                    <li>Click calculate to get results</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Important Notes</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Results are estimates based on standard requirements</li>
                    <li>Adjust for local conditions and bird performance</li>
                    <li>Consult veterinarians for health-related decisions</li>
                    <li>Feed quality affects actual consumption</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full btn-primary"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}