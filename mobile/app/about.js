import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function About() {
  const router = useRouter();

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const FeatureCard = ({ icon, title, description }) => (
    <View className="card">
      <View className="flex-row items-start">
        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
          <Ionicons name={icon} size={24} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-mobile-lg font-semibold text-neutral-900 mb-2">
            {title}
          </Text>
          <Text className="text-mobile-sm text-neutral-700 leading-relaxed">
            {description}
          </Text>
        </View>
      </View>
    </View>
  );

  const ContactCard = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity onPress={onPress} className="card">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color="#475569" />
          </View>
          <View className="flex-1">
            <Text className="text-mobile-base font-medium text-neutral-900">
              {title}
            </Text>
            <Text className="text-mobile-sm text-neutral-600">
              {subtitle}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

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
            About
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="space-y-6">
          {/* App Header */}
          <View className="card text-center">
            <View className="w-20 h-20 bg-primary-100 rounded-2xl items-center justify-center mx-auto mb-4">
              <Ionicons name="nutrition" size={40} color="#2563eb" />
            </View>
            <Text className="text-mobile-2xl font-bold text-neutral-900 mb-2">
              Chicken Feed Calculator
            </Text>
            <Text className="text-mobile-base text-neutral-600 mb-4">
              Smart poultry feed management for African farmers
            </Text>
            <View className="badge-primary mx-auto">
              <Text className="text-mobile-sm font-medium">
                Version 1.0.0
              </Text>
            </View>
          </View>

          {/* Mission Statement */}
          <View className="card">
            <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4">
              Our Mission
            </Text>
            <Text className="text-mobile-sm text-neutral-700 leading-relaxed">
              To empower African poultry farmers with smart, accessible tools that optimize feed management, 
              reduce costs, and improve bird health. We believe that technology should serve farmers, 
              not complicate their work.
            </Text>
          </View>

          {/* Key Features */}
          <View className="space-y-4">
            <Text className="text-mobile-xl font-semibold text-neutral-900 px-1">
              Key Features
            </Text>
            
            <FeatureCard
              icon="calculator"
              title="Smart Feed Calculator"
              description="Calculate precise feed requirements based on bird type, breed, age, and target weight with instant results."
            />
            
            <FeatureCard
              icon="storefront"
              title="Feed Recommendations"
              description="Access curated lists of commercial feeds and local mix recipes with pricing and nutritional information."
            />
            
            <FeatureCard
              icon="library"
              title="Knowledge Center"
              description="Weekly tips, seasonal advice, and emergency signs to help you manage your flock effectively."
            />
            
            <FeatureCard
              icon="phone-portrait"
              title="Offline Support"
              description="Core features work offline, ensuring you can access critical information anywhere."
            />
            
            <FeatureCard
              icon="globe"
              title="Local Focus"
              description="Designed specifically for Nigerian and African farming conditions with local feed brands and pricing."
            />
          </View>

          {/* Target Users */}
          <View className="card">
            <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4">
              Who We Serve
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3" />
                <Text className="flex-1 text-mobile-sm text-neutral-700">
                  <Text className="font-medium">Backyard Farmers:</Text> Managing small flocks (≤10 birds) for family consumption or local sales
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3" />
                <Text className="flex-1 text-mobile-sm text-neutral-700">
                  <Text className="font-medium">Commercial Farmers:</Text> Operating larger operations ({'>'}10 birds) with focus on efficiency and profitability
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3" />
                <Text className="flex-1 text-mobile-sm text-neutral-700">
                  <Text className="font-medium">New Farmers:</Text> Starting their poultry journey and need guidance on best practices
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3" />
                <Text className="flex-1 text-mobile-sm text-neutral-700">
                  <Text className="font-medium">Agricultural Extension Workers:</Text> Supporting farmers with technical knowledge and tools
                </Text>
              </View>
            </View>
          </View>

          {/* Technology Stack */}
          <View className="card">
            <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4">
              Built With
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-mobile-sm text-neutral-600">Mobile App:</Text>
                <Text className="text-mobile-sm font-medium text-neutral-900">React Native + Expo</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-mobile-sm text-neutral-600">Web App:</Text>
                <Text className="text-mobile-sm font-medium text-neutral-900">Next.js + Tailwind CSS</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-mobile-sm text-neutral-600">State Management:</Text>
                <Text className="text-mobile-sm font-medium text-neutral-900">Zustand</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-mobile-sm text-neutral-600">Styling:</Text>
                <Text className="text-mobile-sm font-medium text-neutral-900">NativeWind</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View className="space-y-4">
            <Text className="text-mobile-xl font-semibold text-neutral-900 px-1">
              Get in Touch
            </Text>
            
            <ContactCard
              icon="mail"
              title="Email Support"
              subtitle="support@chickenfeedcalc.com"
              onPress={() => handleOpenLink('mailto:support@chickenfeedcalc.com')}
            />
            
            <ContactCard
              icon="logo-github"
              title="GitHub Repository"
              subtitle="View source code and contribute"
              onPress={() => handleOpenLink('https://github.com/chickenfeedcalc/app')}
            />
            
            <ContactCard
              icon="globe"
              title="Website"
              subtitle="www.chickenfeedcalc.com"
              onPress={() => handleOpenLink('https://www.chickenfeedcalc.com')}
            />
            
            <ContactCard
              icon="logo-twitter"
              title="Follow Us"
              subtitle="@ChickenFeedCalc"
              onPress={() => handleOpenLink('https://twitter.com/ChickenFeedCalc')}
            />
          </View>

          {/* Legal */}
          <View className="card">
            <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4">
              Legal
            </Text>
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-mobile-sm text-neutral-700">Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-mobile-sm text-neutral-700">Terms of Service</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between">
                <Text className="text-mobile-sm text-neutral-700">Open Source Licenses</Text>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Acknowledgments */}
          <View className="card">
            <Text className="text-mobile-xl font-semibold text-neutral-900 mb-4">
              Acknowledgments
            </Text>
            <Text className="text-mobile-sm text-neutral-700 leading-relaxed mb-4">
              Special thanks to the agricultural extension workers, veterinarians, and experienced farmers 
              who provided valuable insights and feedback during the development of this application.
            </Text>
            <Text className="text-mobile-sm text-neutral-700 leading-relaxed">
              Feed calculation formulas and best practices are based on research from leading agricultural 
              institutions and industry standards adapted for African farming conditions.
            </Text>
          </View>

          {/* Footer */}
          <View className="card bg-gradient-to-r from-primary-50 to-secondary-50">
            <View className="text-center space-y-2">
              <Text className="text-mobile-sm font-medium text-neutral-900">
                Made with ❤️ for African Farmers
              </Text>
              <Text className="text-mobile-xs text-neutral-600">
                Empowering agriculture through technology
              </Text>
              <Text className="text-mobile-xs text-neutral-500">
                © 2024 Chicken Feed Calculator. All rights reserved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}