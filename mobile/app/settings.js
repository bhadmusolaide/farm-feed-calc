import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../lib/store';

export default function Settings() {
  const router = useRouter();
  const {
    units,
    currency,
    language,
    theme,
    notifications,
    location,
    setUnits,
    setCurrency,
    setLanguage,
    setTheme,
    setNotifications,
    setLocation,
    resetSettings
  } = useSettingsStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Success', 'Settings have been reset to default values.');
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View className="card">
      <Text className="text-mobile-lg font-semibold text-neutral-900 mb-4">
        {title}
      </Text>
      <View className="space-y-4">
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ icon, title, subtitle, children, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between py-2"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-mobile-base font-medium text-neutral-900">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-mobile-sm text-neutral-600">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {children}
    </TouchableOpacity>
  );

  const SelectionModal = ({ title, options, currentValue, onSelect, onClose }) => (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-mobile-lg p-6 mx-4 w-full max-w-sm">
        <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4 text-center">
          {title}
        </Text>
        <View className="space-y-2 mb-6">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              className={`p-3 rounded-mobile border ${
                currentValue === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-300 bg-white'
              }`}
            >
              <Text
                className={`text-mobile-base ${
                  currentValue === option.value
                    ? 'text-primary-700 font-medium'
                    : 'text-neutral-900'
                }`}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text className="text-mobile-sm text-neutral-600 mt-1">
                  {option.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="bg-neutral-200 rounded-mobile py-3 items-center"
        >
          <Text className="text-mobile-base font-medium text-neutral-700">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const unitsOptions = [
    { value: 'metric', label: 'Metric', description: 'Kilograms, grams, liters' },
    { value: 'imperial', label: 'Imperial', description: 'Pounds, ounces, gallons' }
  ];

  const currencyOptions = [
    { value: 'NGN', label: 'Nigerian Naira (₦)', description: 'NGN' },
    { value: 'USD', label: 'US Dollar ($)', description: 'USD' },
    { value: 'EUR', label: 'Euro (€)', description: 'EUR' },
    { value: 'GBP', label: 'British Pound (£)', description: 'GBP' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', description: 'Default language' },
    { value: 'yo', label: 'Yoruba', description: 'Coming soon' },
    { value: 'ha', label: 'Hausa', description: 'Coming soon' },
    { value: 'ig', label: 'Igbo', description: 'Coming soon' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', description: 'Light theme' },
    { value: 'dark', label: 'Dark', description: 'Dark theme' },
    { value: 'system', label: 'System', description: 'Follow system setting' }
  ];

  const locationOptions = [
    { value: 'nigeria', label: 'Nigeria', description: 'Nigerian market prices' },
    { value: 'ghana', label: 'Ghana', description: 'Ghanaian market prices' },
    { value: 'kenya', label: 'Kenya', description: 'Kenyan market prices' },
    { value: 'other', label: 'Other', description: 'Generic pricing' }
  ];

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white border-b border-neutral-200 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-mobile-xl font-semibold text-neutral-900">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="space-y-6">
          {/* Units & Display */}
          <SettingSection title="Units & Display">
            <SettingRow
              icon="scale"
              title="Units"
              subtitle={units === 'metric' ? 'Metric (kg, g, L)' : 'Imperial (lb, oz, gal)'}
              onPress={() => setShowUnitsModal(true)}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
            
            <SettingRow
              icon="card"
              title="Currency"
              subtitle={currencyOptions.find(c => c.value === currency)?.label || currency}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
            
            <SettingRow
              icon="language"
              title="Language"
              subtitle={languageOptions.find(l => l.value === language)?.label || language}
              onPress={() => setShowLanguageModal(true)}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
            
            <SettingRow
              icon="color-palette"
              title="Theme"
              subtitle={themeOptions.find(t => t.value === theme)?.label || theme}
              onPress={() => setShowThemeModal(true)}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
          </SettingSection>

          {/* Location & Market */}
          <SettingSection title="Location & Market">
            <SettingRow
              icon="location"
              title="Location"
              subtitle={locationOptions.find(l => l.value === location)?.label || location}
              onPress={() => setShowLocationModal(true)}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
          </SettingSection>

          {/* Notifications */}
          <SettingSection title="Notifications">
            <SettingRow
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive tips and reminders"
            >
              <Switch
                value={notifications.push}
                onValueChange={(value) => setNotifications({ ...notifications, push: value })}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={notifications.push ? '#ffffff' : '#f3f4f6'}
              />
            </SettingRow>
            
            <SettingRow
              icon="mail"
              title="Email Updates"
              subtitle="Weekly tips and updates"
            >
              <Switch
                value={notifications.email}
                onValueChange={(value) => setNotifications({ ...notifications, email: value })}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={notifications.email ? '#ffffff' : '#f3f4f6'}
              />
            </SettingRow>
            
            <SettingRow
              icon="alarm"
              title="Feeding Reminders"
              subtitle="Daily feeding schedule alerts"
            >
              <Switch
                value={notifications.reminders}
                onValueChange={(value) => setNotifications({ ...notifications, reminders: value })}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={notifications.reminders ? '#ffffff' : '#f3f4f6'}
              />
            </SettingRow>
          </SettingSection>

          {/* Data & Privacy */}
          <SettingSection title="Data & Privacy">
            <SettingRow
              icon="analytics"
              title="Usage Analytics"
              subtitle="Help improve the app"
            >
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </SettingRow>
            
            <SettingRow
              icon="shield-checkmark"
              title="Privacy Policy"
              subtitle="View our privacy policy"
              onPress={() => {}}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
          </SettingSection>

          {/* Support */}
          <SettingSection title="Support">
            <SettingRow
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Get help and answers"
              onPress={() => {}}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
            
            <SettingRow
              icon="mail"
              title="Contact Support"
              subtitle="Get in touch with us"
              onPress={() => {}}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
            
            <SettingRow
              icon="star"
              title="Rate the App"
              subtitle="Leave a review"
              onPress={() => {}}
            >
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </SettingRow>
          </SettingSection>

          {/* Reset */}
          <SettingSection title="Reset">
            <SettingRow
              icon="refresh"
              title="Reset Settings"
              subtitle="Restore default settings"
              onPress={handleResetSettings}
            >
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </SettingRow>
          </SettingSection>

          {/* App Info */}
          <View className="card">
            <View className="text-center space-y-2">
              <Text className="text-mobile-sm text-neutral-600">
                Chicken Feed Calculator
              </Text>
              <Text className="text-mobile-sm text-neutral-600">
                Version 1.0.0
              </Text>
              <Text className="text-mobile-xs text-neutral-500">
                Made with ❤️ for African farmers
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {showUnitsModal && (
        <SelectionModal
          title="Select Units"
          options={unitsOptions}
          currentValue={units}
          onSelect={setUnits}
          onClose={() => setShowUnitsModal(false)}
        />
      )}

      {showCurrencyModal && (
        <SelectionModal
          title="Select Currency"
          options={currencyOptions}
          currentValue={currency}
          onSelect={setCurrency}
          onClose={() => setShowCurrencyModal(false)}
        />
      )}

      {showLanguageModal && (
        <SelectionModal
          title="Select Language"
          options={languageOptions}
          currentValue={language}
          onSelect={setLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}

      {showThemeModal && (
        <SelectionModal
          title="Select Theme"
          options={themeOptions}
          currentValue={theme}
          onSelect={setTheme}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showLocationModal && (
        <SelectionModal
          title="Select Location"
          options={locationOptions}
          currentValue={location}
          onSelect={setLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </View>
  );
}