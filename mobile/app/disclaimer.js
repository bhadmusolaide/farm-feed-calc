import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Disclaimer() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
          <Text className="text-primary-600 dark:text-primary-400 ml-2 font-medium">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Main Content Card */}
          <View className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            {/* Title */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="document-text" size={28} color="#2563eb" />
              <Text className="text-2xl font-bold text-neutral-900 dark:text-white ml-3">
                📄 Disclaimer
              </Text>
            </View>

            <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Last updated: July 1, 2025
            </Text>

            {/* Introduction */}
            <Text className="text-base text-neutral-700 dark:text-neutral-300 mb-6 leading-6">
              This application ("Feed Calculator by Omzo Farmz") is owned and operated by Omzo Farmz. 
              The App is designed to provide general guidance and feed recommendations for poultry farmers, 
              specifically targeting users in Nigeria and other African regions.
            </Text>

            {/* Information Accuracy */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                Information Accuracy
              </Text>
              <Text className="text-neutral-700 dark:text-neutral-300 mb-3 leading-6">
                While we aim to provide accurate and practical recommendations, all information in the App is based on:
              </Text>
              <View className="ml-4">
                <Text className="text-neutral-700 dark:text-neutral-300 mb-2 leading-6">
                  • General poultry farming standards
                </Text>
                <Text className="text-neutral-700 dark:text-neutral-300 mb-2 leading-6">
                  • Locally observed best practices
                </Text>
                <Text className="text-neutral-700 dark:text-neutral-300 mb-3 leading-6">
                  • Breed and feed data commonly available in Nigeria
                </Text>
              </View>
              <Text className="text-neutral-700 dark:text-neutral-300 leading-6">
                Omzo Farmz does not guarantee that all results will be suitable for every user or farming condition.
              </Text>
            </View>

            {/* No Professional Veterinary Advice */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                No Professional Veterinary Advice
              </Text>
              <Text className="text-neutral-700 dark:text-neutral-300 leading-6">
                The App does not replace veterinary or agricultural expert consultation. Always seek advice from 
                certified professionals before making health, feed, or treatment decisions for your birds.
              </Text>
            </View>

            {/* User Responsibility */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                User Responsibility
              </Text>
              <Text className="text-neutral-700 dark:text-neutral-300 mb-3 leading-6">
                By using this App:
              </Text>
              <View className="ml-4">
                <Text className="text-neutral-700 dark:text-neutral-300 mb-2 leading-6">
                  • You agree to apply the information at your own discretion and risk.
                </Text>
                <Text className="text-neutral-700 dark:text-neutral-300 mb-2 leading-6">
                  • You are responsible for monitoring your birds and adjusting feeding or care based on real-life observations.
                </Text>
                <Text className="text-neutral-700 dark:text-neutral-300 leading-6">
                  • Omzo Farmz will not be held liable for any losses, injuries, or poor outcomes resulting from the use of this App.
                </Text>
              </View>
            </View>

            {/* External Links */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                External Links
              </Text>
              <Text className="text-neutral-700 dark:text-neutral-300 leading-6">
                The App may include links to feed suppliers, brands, or external content. These are provided for convenience. 
                Omzo Farmz is not responsible for their content or pricing.
              </Text>
            </View>

            {/* Updates */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                Updates
              </Text>
              <Text className="text-neutral-700 dark:text-neutral-300 leading-6">
                This disclaimer may change over time as the App evolves. Continued use means you agree to the most recent version.
              </Text>
            </View>

            {/* Contact Information */}
            <View className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
              <Text className="text-neutral-700 dark:text-neutral-300 mb-2 leading-6">
                For questions or feedback, contact:{' '}
                <Text className="text-primary-600 dark:text-primary-400 font-medium">
                  support@omzofarmz.com
                </Text>
              </Text>
              <Text className="text-neutral-600 dark:text-neutral-400 text-sm">
                Thank you for using the app.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}