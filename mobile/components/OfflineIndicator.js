import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OfflineIndicator() {
  return (
    <View className="bg-warning-500 px-mobile py-2">
      <View className="flex-row items-center justify-center">
        <Ionicons name="cloud-offline" size={16} color="white" />
        <Text className="text-white text-mobile-sm font-medium ml-2">
          You're offline. Some features may be limited.
        </Text>
      </View>
    </View>
  );
}