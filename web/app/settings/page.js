'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Eye, EyeOff, Plus, Edit, Trash2, RotateCcw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSiteSettingsStore } from '../../lib/siteSettingsStore';
import { useFeedManagementStore } from '../../lib/feedManagementStore';
import useFirebaseAuthStore from '../../lib/firebaseAuthStore';
import { useToast } from '../../components/Toast';
import FeedForm from '../../components/FeedForm';
import LocalMixForm from '../../components/LocalMixForm';
import LoginForm from '../../components/LoginForm';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useFirebaseAuthStore();
  const { 
    settings, 
    globalSettings, 
    isLoadingGlobal, 
    useGlobalSettings, 
    error,
    updateSettings, 
    resetToDefaults, 
    loadGlobalSettings, 
    getActiveSettings 
  } = useSiteSettingsStore();
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
    const activeSettings = getActiveSettings();
    if (activeSettings && activeSettings.footer && activeSettings.recommendedFeeds) {
      setFormData({
        siteTitle: activeSettings.siteTitle || '',
        siteDescription: activeSettings.siteDescription || '',
        logoUrl: activeSettings.logoUrl || '',
        footerLogoUrl: activeSettings.footer.logoUrl || '',
        footerDescription: activeSettings.footer.description || '',
        footerFeatures: [...(activeSettings.footer.features || [])],
        footerSupport: [...(activeSettings.footer.support || [])],
        footerCopyright: activeSettings.footer.copyright || '',
        recommendedFeedsTitle: activeSettings.recommendedFeeds.title || '',
        recommendedFeedsDescription: activeSettings.recommendedFeeds.description || '',
      });
      setIsLoading(false);
    }
  }, [settings, globalSettings, useGlobalSettings, getActiveSettings]);

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
    if (settings && settings.footer && settings.recommendedFeeds) {
      setFormData({
        siteTitle: settings.siteTitle || '',
        siteDescription: settings.siteDescription || '',
        logoUrl: settings.logoUrl || '',
        footerLogoUrl: settings.footer.logoUrl || '',
        footerDescription: settings.footer.description || '',
        footerFeatures: [...(settings.footer.features || [])],
        footerSupport: [...(settings.footer.support || [])],
        footerCopyright: settings.footer.copyright || '',
        recommendedFeedsTitle: settings.recommendedFeeds.title || '',
        recommendedFeedsDescription: settings.recommendedFeeds.description || '',
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Settings
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'site' && (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
              
              {activeTab === 'feeds' && (
                <button
                  onClick={handleResetFeeds}
                  className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Feeds</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('site')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'site'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  Site Settings
                </button>
                <button
                  onClick={() => setActiveTab('feeds')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'feeds'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  Feed Management
                </button>
              </nav>
            </div>
          </div>

          {/* Site Settings Tab */}
          {activeTab === 'site' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Settings Status */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Settings Status
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Settings Source:</span>
                      <div className="flex items-center space-x-2">
                        {isLoadingGlobal ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        ) : (
                          <>
                            <div className={`w-2 h-2 rounded-full ${
                              useGlobalSettings && globalSettings 
                                ? 'bg-green-500' 
                                : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {useGlobalSettings && globalSettings 
                                ? 'Global (Firebase)' 
                                : 'Local (Device Only)'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {useGlobalSettings && globalSettings ? (
                        <>✅ Settings are synchronized across all devices and users. Changes made here will be visible to everyone.</>  
                      ) : (
                        <>⚠️ Settings are stored locally on this device only. Changes will not sync to other devices or users. {error && <><br/><strong>Issue:</strong> {error}</>}</>  
                      )}
                    </div>
                    
                    {user && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        👤 Logged in as: {user.email}
                      </div>
                    )}
                    
                    {!globalSettings && (
                      <button
                        onClick={loadGlobalSettings}
                        disabled={isLoadingGlobal}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                      >
                        {isLoadingGlobal ? 'Loading...' : 'Retry loading global settings'}
                      </button>
                    )}
                  </div>
                </div>
                {/* Header Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Header Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Site Title
                      </label>
                      <input
                        type="text"
                        value={formData.siteTitle}
                        onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="Enter site title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Site Description
                      </label>
                      <input
                        type="text"
                        value={formData.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="Enter site description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Logo URL (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="/omzo_farmz_logo.png or https://example.com/logo.png"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Use relative paths (e.g., /omzo_farmz_logo.png) or full URLs. Leave empty to use the default chicken icon.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠️ Note: Logo is currently hardcoded to /omzo_farmz_logo.png for production consistency.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Footer Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Footer Logo URL (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.footerLogoUrl}
                        onChange={(e) => handleInputChange('footerLogoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                        placeholder="/omzo_farmz_logo.png or https://example.com/logo.png"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Footer logo will be 3x larger than the header logo. Use relative paths or full URLs.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        ⚠️ Note: Footer logo is currently hardcoded to /omzo_farmz_logo.png for production consistency.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Footer Description
                      </label>
                      <textarea
                        value={formData.footerDescription}
                        onChange={(e) => handleInputChange('footerDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
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

              {/* Preview */}
              {showPreview && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                      Preview
                    </h2>
                    
                    {/* Header Preview */}
                    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Header</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-white text-lg">🐔</span>
                          )}
                        </div>
                        <div>
                          <h1 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                            {formData.siteTitle}
                          </h1>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {formData.siteDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer Preview */}
                    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Footer</h3>
                      <div className="text-xs space-y-2">
                        <div className="flex items-center space-x-3 mb-2">
                          {formData.footerLogoUrl && (
                            <img 
                              src={formData.footerLogoUrl} 
                              alt="Footer Logo" 
                              className="w-16 h-16 object-contain rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formData.siteTitle}
                          </h4>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300">
                          {formData.footerDescription}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Features</h4>
                            <ul className="space-y-1 text-neutral-600 dark:text-neutral-300">
                              {formData.footerFeatures.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Support</h4>
                            <ul className="space-y-1 text-neutral-600 dark:text-neutral-300">
                              {formData.footerSupport.map((support, index) => (
                                <li key={index}>• {support}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                          {formData.footerCopyright}
                        </p>
                      </div>
                    </div>
                    
                    {/* Recommended Feeds Preview */}
                    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recommended Feeds Section</h3>
                      <div className="text-center">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                          {formData.recommendedFeedsTitle}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {formData.recommendedFeedsDescription}
                        </p>
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
              {/* Commercial Feeds */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Commercial Feeds
                  </h2>
                  <button
                    onClick={() => {
                      setEditingFeed(null);
                      setShowFeedForm(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feed</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(feeds).map(([category, categoryFeeds]) => (
                    <div key={category}>
                      <h3 className="text-md font-medium text-neutral-800 dark:text-neutral-200 mb-3 capitalize">
                        {category} Feeds ({categoryFeeds.length})
                      </h3>
                      <div className="grid gap-3">
                        {categoryFeeds.map((feed) => (
                          <div key={feed.id} className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{feed.name}</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {feed.brand} • Protein: {feed.protein}% • Calcium: {feed.calcium}%
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                  {feed.description}
                                </p>
                                {feed.estimatedPrice && (
                                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                    From {feed.currency} {Object.values(feed.estimatedPrice)[0]}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
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
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Local Feed Mixes
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(localMixes).map(([category, mix]) => (
                    <div key={category} className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{category} Mix</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {mix.name} • Protein: {mix.protein}%
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                            {mix.ingredients?.length || 0} ingredients
                          </p>
                        </div>
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
                  ))}
                </div>
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