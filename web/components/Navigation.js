'use client';

import { useFeedStore } from '../lib/store';
import { clsx } from 'clsx';

export default function Navigation({ tabs, activeTab, onTabChange }) {
  const { showResults } = useFeedStore();

  return (
    <div className="glass-card p-1 backdrop-blur-xl border border-white/20 dark:border-neutral-700/20">
      {/* Mobile: Dropdown Navigation */}
      <div className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full select text-base font-medium bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isDisabled = tab.id === 'results' && !showResults;
            
            return (
              <option
                key={tab.id}
                value={tab.id}
                disabled={isDisabled}
              >
                {tab.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Desktop: Tab Navigation */}
      <div className="hidden sm:flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.id === 'results' && !showResults;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'hover:scale-105 active:scale-95',
                {
                  'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg glow-on-hover': isActive,
                  'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60 backdrop-blur-sm': !isActive && !isDisabled,
                  'text-neutral-400 cursor-not-allowed opacity-50': isDisabled,
                }
              )}
              title={isDisabled ? 'Calculate feed requirements first' : tab.description}
            >
              <Icon className={clsx('w-4 h-4 mr-2', {
                'animate-bounce-gentle': isActive
              })} />
              <span className="hidden md:inline">{tab.name}</span>
              <span className="md:hidden">{tab.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Tab Indicators */}
      <div className="sm:hidden mt-3 flex justify-center space-x-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.id === 'results' && !showResults;
          
          return (
            <div
              key={tab.id}
              className={clsx(
                'w-2 h-2 rounded-full transition-all duration-300',
                {
                  'bg-primary-600 animate-pulse-gentle': isActive,
                  'bg-neutral-300': !isActive && !isDisabled,
                  'bg-neutral-200': isDisabled,
                }
              )}
            />
          );
        })}
      </div>

      {/* Active Tab Description */}
      <div className="mt-3 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 animate-fade-in">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}