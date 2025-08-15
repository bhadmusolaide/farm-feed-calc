'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Settings, LogOut, UserPlus, X, Mail } from 'lucide-react';
import useFirebaseAuthStore from '../lib/firebaseAuthStore';

// Random names for unauthenticated users
const RANDOM_NAMES = [
  'Hyena Cat', 'Swift Fox', 'Clever Owl', 'Brave Lion', 'Wise Eagle',
  'Quick Rabbit', 'Strong Bear', 'Gentle Deer', 'Bold Wolf', 'Free Bird',
  'Wild Horse', 'Smart Dolphin', 'Proud Tiger', 'Fast Cheetah', 'You'
];

export default function UserProfile() {
  const { user, isAuthenticated, signOut } = useFirebaseAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [randomName, setRandomName] = useState('');
  const [waitlistForm, setWaitlistForm] = useState({ email: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Generate random name for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedName = localStorage.getItem('temp-user-name');
      if (savedName) {
        setRandomName(savedName);
      } else {
        const newName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
        setRandomName(newName);
        localStorage.setItem('temp-user-name', newName);
      }
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleJoinWaitlist = () => {
    setShowWaitlistModal(true);
    setShowDropdown(false);
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waitlistForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage(`Success! You're #${data.position} on the waitlist. We'll notify you when registration opens.`);
        setWaitlistForm({ email: '', name: '' });
        setTimeout(() => {
          setShowWaitlistModal(false);
          setSubmitMessage('');
        }, 3000);
      } else {
        setSubmitMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayName = () => {
    if (isAuthenticated) {
      return user?.displayName || 'Admin';
    }
    return randomName;
  };

  const getInitials = () => {
    const name = getDisplayName();
    if (isAuthenticated && name === 'Admin') {
      return 'AM';
    }
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors interactive-scale"
        title={isAuthenticated ? 'User Profile' : 'Temporary User'}
      >
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
          {getInitials()}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {getDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 animate-slide-up">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {getInitials()}
                </div>
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getDisplayName()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {isAuthenticated ? 'Authenticated User' : 'Temporary User'}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    {/* Authenticated User Menu */}
                    <a
                      href="/settings"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                      <span className="text-neutral-700 dark:text-neutral-300">Settings</span>
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated User Info */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3">
                      <div className="flex items-start space-x-2">
                        <User className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                            You're browsing as a temporary user
                          </div>
                          <div className="text-amber-700 dark:text-amber-300 leading-relaxed">
                            Your calculations and data are saved in your browser and won't transfer to other devices. 
                            Data will be cleared when you clear your browser cache.
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Join Waitlist Button */}
                    <button
                      onClick={handleJoinWaitlist}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <span className="text-primary-700 dark:text-primary-300 font-medium">Join the Waitlist</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 max-w-md w-full animate-slide-up">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-neutral-900 dark:text-neutral-100">
                  Join the Waitlist
                </h2>
                <button
                  onClick={() => setShowWaitlistModal(false)}
                  className="btn-ghost p-2"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={waitlistForm.email}
                      onChange={(e) => setWaitlistForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={waitlistForm.name}
                      onChange={(e) => setWaitlistForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.includes('Success') 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !waitlistForm.email}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We'll notify you via email when user registration becomes available. 
                  Your email will only be used for this purpose.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}