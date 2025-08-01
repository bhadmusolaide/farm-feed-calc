'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Eye, EyeOff, Plus, Edit, Trash2, RotateCcw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHybridSiteSettingsStore } from '../../lib/hybridStore';
import { useFeedManagementStore } from '../../lib/feedManagementStore';
import useFirebaseAuthStore from '../../lib/firebaseAuthStore';
import { useToast } from '../../components/Toast';
import FeedForm from '../../components/FeedForm';
import LocalMixForm from '../../components/LocalMixForm';
import LoginForm from '../../components/LoginForm';
import WaitlistAdmin from '../../components/WaitlistAdmin';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useFirebaseAuthStore();
  const { 
    globalSettings, 
    isLoadingGlobal, 
    error,
    updateSettings, 
    resetToDefaults, 
    loadGlobalSettings,
    initialize 
  } = useHybridSiteSettingsStore();
  const { 
    feeds, 
    localMixes, 
    addFeed, 
    updateFeed, 
    deleteFeed, 
    updateLocalMix, 
    resetToDefaults: resetFeedsToDefaults,
    FEED_CATEGORIES,
    PACKAGING_OPTIONS,
    AVAILABILITY_REGIONS,
    FEED_TAGS,
    createEmptyFeed,
    createEmptyLocalMix
  } = useFeedManagementStore();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('site');
  const [editingFeed, setEditingFeed] = useState(null);
  const [editingLocalMix, setEditingLocalMix] = useState(null);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showLocalMixForm, setShowLocalMixForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    siteTitle: '',
    siteDescription: '',
    logoUrl: '',
    footerLogoUrl: '',
    footerDescription: '',
    footerFeatures: [],
    footerSupport: [],
    footerCopyright: '',
    recommendedFeedsTitle: '',
    recommendedFeedsDescription: '',
  });

  // Initialize global settings on component mount
  useEffect(() => {
    const initializeSettings = async () => {
      await initialize();
    };
    initializeSettings();
  }, [initialize]);

  useEffect(() => {
    if (globalSettings && globalSettings.footer && globalSettings.recommendedFeeds) {
      setFormData({
        siteTitle: globalSettings.siteTitle || '',
        siteDescription: globalSettings.siteDescription || '',
        logoUrl: globalSettings.logoUrl || '',
        footerLogoUrl: globalSettings.footer.logoUrl || '',
        footerDescription: globalSettings.footer.description || '',
        footerFeatures: [...(globalSettings.footer.features || [])],
        footerSupport: [...(globalSettings.footer.support || [])],
        footerCopyright: globalSettings.footer.copyright || '',
        recommendedFeedsTitle: globalSettings.recommendedFeeds.title || '',
        recommendedFeedsDescription: globalSettings.recommendedFeeds.description || '',
      });
      setIsLoading(false);
    }
  }, [globalSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        siteTitle: formData.siteTitle,
        siteDescription: formData.siteDescription,
        logoUrl: formData.logoUrl,
        footer: {
          logoUrl: formData.footerLogoUrl,
          description: formData.footerDescription,
          features: formData.footerFeatures.filter(f => f.trim()),
          support: formData.footerSupport.filter(s => s.trim()),
          copyright: formData.footerCopyright,
        },
        recommendedFeeds: {
          title: formData.recommendedFeedsTitle,
          description: formData.recommendedFeedsDescription,
        },
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    if (globalSettings && globalSettings.footer && globalSettings.recommendedFeeds) {
      setFormData({
        siteTitle: globalSettings.siteTitle || '',
        siteDescription: globalSettings.siteDescription || '',
        logoUrl: globalSettings.logoUrl || '',
        footerLogoUrl: globalSettings.footer.logoUrl || '',
        footerDescription: globalSettings.footer.description || '',
        footerFeatures: [...(globalSettings.footer.features || [])],
        footerSupport: [...(globalSettings.footer.support || [])],
        footerCopyright: globalSettings.footer.copyright || '',
        recommendedFeedsTitle: globalSettings.recommendedFeeds.title || '',
        recommendedFeedsDescription: globalSettings.recommendedFeeds.description || '',
      });
    }
    toast.success('Settings reset to defaults successfully!');
  };

  const handleFeedSave = (feedData) => {
    try {
      if (editingFeed) {
        updateFeed(feedData.category, editingFeed.id, feedData);
        toast.success('Feed updated successfully!');
      } else {
        addFeed(feedData.category, feedData);
        toast.success('Feed added successfully!');
      }
      setEditingFeed(null);
      setShowFeedForm(false);
    } catch (error) {
      console.error('Error saving feed:', error);
      toast.error('Failed to save feed');
    }
  };

  const handleLocalMixSave = (mixData) => {
    try {
      if (editingLocalMix) {
        updateLocalMix(editingLocalMix.category, mixData);
        toast.success('Local mix updated successfully!');
      }
      setEditingLocalMix(null);
      setShowLocalMixForm(false);
    } catch (error) {
      toast.error('Failed to save local mix');
    }
  };

  const handleFeedDelete = (feedId) => {
    try {
      // Find which category the feed belongs to
      let feedCategory = null;
      for (const [category, categoryFeeds] of Object.entries(feeds)) {
        if (categoryFeeds.find(feed => feed.id === feedId)) {
          feedCategory = category;
          break;
        }
      }
      
      if (feedCategory) {
        deleteFeed(feedCategory, feedId);
        toast.success('Feed deleted successfully!');
      } else {
        toast.error('Feed not found');
      }
    } catch (error) {
      console.error('Error deleting feed:', error);
      toast.error('Failed to delete feed');
    }
  };

  const handleResetFeeds = () => {
    resetFeedsToDefaults();
    toast.success('Feed data reset to defaults successfully!');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Firebase handles session management automatically
  
  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => {}} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 mb-6">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Settings
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Manage your application configuration
                  </p>
                </div>
              </div>
              
              {/* Context-aware Action Bar */}
              <div className="flex items-center space-x-2">
                {activeTab === 'site' && (
                  <>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Preview'}</span>
                    </button>
                    
                    <button
                      onClick={handleReset}
                      className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                    
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                )}
                
                {activeTab === 'feeds' && (
                  <button
                    onClick={handleResetFeeds}
                    className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Feeds</span>
                  </button>
                )}
                
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-600"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
            
            {/* Enhanced Tab Navigation */}
            <div className="border-t border-neutral-200 dark:border-neutral-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('site')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 ${
                    activeTab === 'site'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Site Settings</span>
                    {activeTab === 'site' && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('feeds')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 ${
                    activeTab === 'feeds'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Feed Management</span>
                    {activeTab === 'feeds' && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 ${
                    activeTab === 'admin'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Waitlist Admin</span>
                    {activeTab === 'admin' && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Site Settings Tab */}
          {activeTab === 'site' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Settings Status - Compact */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        globalSettings ? 'bg-green-500' : isLoadingGlobal ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {globalSettings ? 'Connected to Firebase' : isLoadingGlobal ? 'Connecting...' : 'Connection Failed'}
                        </h3>
                        {user && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {!globalSettings && (
                      <button
                        onClick={loadGlobalSettings}
                        disabled={isLoadingGlobal}
                        className="text-xs px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        {isLoadingGlobal ? 'Loading...' : 'Retry'}
                      </button>
                    )}
                  </div>
                </div>
                {/* Header Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    Header Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Site Title
                      </label>
                      <input
                        type="text"
                        value={formData.siteTitle}
                        onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors"
                        placeholder="Enter site title"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={formData.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors resize-none"
                        placeholder="Enter site description"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Logo URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors"
                        placeholder="/omzo_farmz_logo.png or https://example.com/logo.png"
                      />
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Use relative paths (e.g., /omzo_farmz_logo.png) or full URLs. Leave empty to use the default chicken icon.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          ⚠️ Note: Logo is currently hardcoded to /omzo_farmz_logo.png for production consistency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    Footer Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Footer Logo URL (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.footerLogoUrl}
                        onChange={(e) => handleInputChange('footerLogoUrl', e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors"
                        placeholder="/omzo_farmz_logo.png or https://example.com/logo.png"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Footer logo will be 3x larger than the header logo. Use relative paths or full URLs.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠️ Note: Footer logo is currently hardcoded to /omzo_farmz_logo.png for production consistency.
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Footer Description
                      </label>
                      <textarea
                        value={formData.footerDescription}
                        onChange={(e) => handleInputChange('footerDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 transition-colors resize-none"
                        placeholder="Enter footer description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Features List
                      </label>
                      {formData.footerFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleArrayChange('footerFeatures', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                            placeholder="Enter feature"
                          />
                          <button
                            onClick={() => removeArrayItem('footerFeatures', index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('footerFeatures')}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        + Add Feature
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Support List
                      </label>
                      {formData.footerSupport.map((support, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={support}
                            onChange={(e) => handleArrayChange('footerSupport', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                            placeholder="Enter support item"
                          />
                          <button
                            onClick={() => removeArrayItem('footerSupport', index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('footerSupport')}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        + Add Support Item
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Copyright Text
                      </label>
                      <input
                        type="text"
                        value={formData.footerCopyright}
                        onChange={(e) => handleInputChange('footerCopyright', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="Enter copyright text"
                      />
                    </div>
                  </div>
                </div>

                {/* Recommended Feeds Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Recommended Feeds Section
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={formData.recommendedFeedsTitle}
                        onChange={(e) => handleInputChange('recommendedFeedsTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="Enter section title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Section Description
                      </label>
                      <input
                        type="text"
                        value={formData.recommendedFeedsDescription}
                        onChange={(e) => handleInputChange('recommendedFeedsDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="Enter section description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Sidebar */}
              {showPreview && (
                <div className="xl:col-span-1">
                  <div className="sticky top-6">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Live Preview
                        </h2>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4 text-xs">
                        {/* Header Preview */}
                        <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-3">
                          <h3 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Header</h3>
                          <div className="flex items-center space-x-2">
                            {formData.logoUrl && (
                              <img 
                                src={formData.logoUrl} 
                                alt="Logo" 
                                className="w-6 h-6 object-contain rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {formData.siteTitle || 'Site Title'}
                              </h1>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                                {formData.siteDescription || 'Site description...'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer Preview */}
                        <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-3">
                          <h3 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Footer</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {formData.footerLogoUrl && (
                                <img 
                                  src={formData.footerLogoUrl} 
                                  alt="Footer Logo" 
                                  className="w-8 h-8 object-contain rounded"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                {formData.siteTitle || 'Site Title'}
                              </h4>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                              {formData.footerDescription || 'Footer description...'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Recommended Feeds Preview */}
                        <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-3">
                          <h3 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recommended Feeds</h3>
                          <div className="text-center">
                            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1 truncate">
                              {formData.recommendedFeedsTitle || 'Recommended Feeds'}
                            </h2>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                              {formData.recommendedFeedsDescription || 'Description...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feed Management Tab */}
          {activeTab === 'feeds' && (
            <div className="space-y-6">
              {/* Feed Management Header */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      Feed Management
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Manage commercial feeds and local mixes
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setEditingLocalMix(null);
                        setShowLocalMixForm(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Local Mix</span>
                      <span className="sm:hidden">Mix</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingFeed(null);
                        setShowFeedForm(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Commercial Feed</span>
                      <span className="sm:hidden">Feed</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Commercial Feeds */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Commercial Feeds
                  <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                    ({Object.values(feeds).reduce((total, categoryFeeds) => total + categoryFeeds.length, 0)} total)
                  </span>
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(feeds).map(([category, categoryFeeds]) => (
                    <div key={category}>
                      <h3 className="text-md font-medium text-neutral-800 dark:text-neutral-200 mb-3 capitalize">
                        {category} Feeds ({categoryFeeds.length})
                      </h3>
                      <div className="grid gap-3">
                        {categoryFeeds.map((feed) => (
                          <div key={feed.id} className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{feed.name}</h4>
                                  <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full capitalize">
                                    {category}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                  <span className="truncate">{feed.brand}</span>
                                  <span>Protein: {feed.protein}%</span>
                                  <span>Calcium: {feed.calcium}%</span>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2 mb-2">
                                  {feed.description}
                                </p>
                                {feed.estimatedPrice && (
                                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                    From {feed.currency} {Object.values(feed.estimatedPrice)[0]}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingFeed(feed);
                                    setShowFeedForm(true);
                                  }}
                                  className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleFeedDelete(feed.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Mixes */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Local Feed Mixes
                  <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                    ({Object.keys(localMixes).length} total)
                  </span>
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(localMixes).map(([category, mix]) => (
                    <div key={category} className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 capitalize truncate">{category} Mix</h4>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                              Local
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            <span className="truncate">{mix.name}</span>
                            <span>Protein: {mix.protein}%</span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2 mb-2">
                            {mix.description || 'Local feed mix'}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {mix.ingredients?.length || 0} ingredients
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingLocalMix({ category, ...mix });
                              setShowLocalMixForm(true);
                            }}
                            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Waitlist Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Waitlist Management
                </h2>
                <WaitlistAdmin />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feed Form Modal */}
      <FeedForm
        isOpen={showFeedForm}
        onClose={() => {
          setShowFeedForm(false);
          setEditingFeed(null);
        }}
        onSave={handleFeedSave}
        editingFeed={editingFeed}
        categories={FEED_CATEGORIES}
        packagingOptions={PACKAGING_OPTIONS}
        availabilityRegions={AVAILABILITY_REGIONS}
        feedTags={FEED_TAGS}
      />

      {/* Local Mix Form Modal */}
      <LocalMixForm
        isOpen={showLocalMixForm}
        onClose={() => {
          setShowLocalMixForm(false);
          setEditingLocalMix(null);
        }}
        onSave={handleLocalMixSave}
        editingLocalMix={editingLocalMix}
      />
    </div>
  );
}