'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function FeedForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingFeed = null,
  categories = [],
  packagingOptions = [],
  availabilityRegions = [],
  feedTags = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'starter',
    protein: '',
    calcium: '',
    phosphorus: '',
    fiber: '',
    fat: '',
    description: '',
    packaging: [],
    availability: [],
    tags: [],
    estimatedPrice: {
      '25kg': ''
    },
    currency: 'NGN',
    isCustom: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingFeed) {
      setFormData({
        name: editingFeed.name || '',
        brand: editingFeed.brand || '',
        category: editingFeed.category || 'starter',
        protein: editingFeed.protein || '',
        calcium: editingFeed.calcium || '',
        phosphorus: editingFeed.phosphorus || '',
        fiber: editingFeed.fiber || '',
        fat: editingFeed.fat || '',
        description: editingFeed.description || '',
        packaging: editingFeed.packaging || [],
        availability: editingFeed.availability || [],
        tags: editingFeed.tags || [],
        estimatedPrice: editingFeed.estimatedPrice || { '25kg': '' },
        currency: editingFeed.currency || 'NGN',
        isCustom: editingFeed.isCustom !== undefined ? editingFeed.isCustom : true
      });
    } else {
      // Reset form for new feed
      setFormData({
        name: '',
        brand: '',
        category: 'starter',
        protein: '',
        calcium: '',
        phosphorus: '',
        fiber: '',
        fat: '',
        description: '',
        packaging: [],
        availability: [],
        tags: [],
        estimatedPrice: {
          '25kg': ''
        },
        currency: 'NGN',
        isCustom: true
      });
    }
    setErrors({});
  }, [editingFeed, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handlePriceChange = (packageSize, value) => {
    setFormData(prev => ({
      ...prev,
      estimatedPrice: {
        ...prev.estimatedPrice,
        [packageSize]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Feed name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.protein || formData.protein < 0 || formData.protein > 100) {
      newErrors.protein = 'Protein must be between 0-100%';
    }
    if (!formData.calcium || formData.calcium < 0 || formData.calcium > 100) {
      newErrors.calcium = 'Calcium must be between 0-100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const feedData = {
      ...formData,
      id: editingFeed?.id || `custom_${Date.now()}`,
      protein: parseFloat(formData.protein),
      calcium: parseFloat(formData.calcium),
      phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : undefined,
      fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
      fat: formData.fat ? parseFloat(formData.fat) : undefined,
    };
    
    onSave(feedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-600">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {editingFeed ? 'Edit Feed' : 'Add New Feed'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Feed Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100 ${
                  errors.name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="Enter feed name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100 ${
                  errors.brand ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="Enter brand name"
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="starter">Starter</option>
              <option value="grower">Grower</option>
              <option value="finisher">Finisher</option>
              <option value="layer">Layer</option>
            </select>
          </div>

          {/* Nutritional Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Protein (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.protein}
                onChange={(e) => handleInputChange('protein', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100 ${
                  errors.protein ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="0.0"
              />
              {errors.protein && <p className="text-red-500 text-xs mt-1">{errors.protein}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Calcium (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.calcium}
                onChange={(e) => handleInputChange('calcium', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100 ${
                  errors.calcium ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="0.0"
              />
              {errors.calcium && <p className="text-red-500 text-xs mt-1">{errors.calcium}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Phosphorus (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.phosphorus}
                onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Fiber (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.fiber}
                onChange={(e) => handleInputChange('fiber', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Enter feed description"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Estimated Price for 25kg (NGN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.estimatedPrice['25kg']}
              onChange={(e) => handlePriceChange('25kg', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="0.00"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingFeed ? 'Update Feed' : 'Add Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}