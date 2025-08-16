'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export default function LocalMixForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingLocalMix = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    category: 'starter',
    ingredients: [],
    instructions: '',
    estimatedCost: '',
    isCustom: true
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', percentage: '', pricePerKg: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingLocalMix) {
      setFormData({
        name: editingLocalMix.name || '',
        protein: editingLocalMix.protein || '',
        category: editingLocalMix.category || 'starter',
        ingredients: editingLocalMix.ingredients || [],
        instructions: Array.isArray(editingLocalMix.instructions) 
          ? editingLocalMix.instructions.join('\n') 
          : (editingLocalMix.instructions || ''),
        estimatedCost: editingLocalMix.estimatedCost || '',
        isCustom: editingLocalMix.isCustom !== undefined ? editingLocalMix.isCustom : true
      });
    } else {
      // Reset form for new local mix
      setFormData({
        name: '',
        protein: '',
        category: 'starter',
        ingredients: [],
        instructions: '',
        estimatedCost: '',
        isCustom: true
      });
    }
    setNewIngredient({ name: '', percentage: '', pricePerKg: '' });
    setErrors({});
  }, [editingLocalMix, isOpen]);

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

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.percentage && newIngredient.pricePerKg) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, {
          name: newIngredient.name.trim(),
          percentage: parseFloat(newIngredient.percentage),
          pricePerKg: parseFloat(newIngredient.pricePerKg)
        }]
      }));
      setNewIngredient({ name: '', percentage: '', pricePerKg: '' });
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Mix name is required';
    if (!formData.protein || formData.protein < 0 || formData.protein > 100) {
      newErrors.protein = 'Protein must be between 0-100%';
    }
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    
    // Check if ingredients total percentage is reasonable (not required to be 100%)
    const totalPercentage = formData.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
    if (totalPercentage > 100) {
      newErrors.ingredients = 'Total ingredient percentage cannot exceed 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const mixData = {
      ...formData,
      protein: parseFloat(formData.protein),
      instructions: formData.instructions 
        ? formData.instructions.split('\n').filter(line => line.trim() !== '') 
        : [],
      ...(formData.estimatedCost && { estimatedCost: parseFloat(formData.estimatedCost) }),
    };
    
    onSave(mixData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-600">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Edit Local Feed Mix
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
                Mix Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100 ${
                  errors.name ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="Enter mix name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

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
          </div>

          {/* Protein */}
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

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Ingredients *
            </label>
            
            {/* Add Ingredient */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="Ingredient name"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newIngredient.percentage}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, percentage: e.target.value }))}
                className="w-20 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="%"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={newIngredient.pricePerKg}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, pricePerKg: e.target.value }))}
                className="w-24 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="₦/kg"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {ingredient.name}
                    </span>
                    <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {ingredient.percentage}%
                    </span>
                    {ingredient.pricePerKg && (
                      <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                        ₦{ingredient.pricePerKg}/kg
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
            
            {formData.ingredients.length > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Total: {formData.ingredients.reduce((sum, ing) => sum + ing.percentage, 0).toFixed(1)}%
              </p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Mixing Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Enter mixing instructions"
            />
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Estimated Cost per kg (NGN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.estimatedCost}
              onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
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
              <span>Update Mix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}