import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
      activeOpacity={0.7}
    >
      <View style={{ position: 'relative' }}>
        <Ionicons
          name="sunny"
          size={20}
          color={theme.colors.primary}
          style={{
            position: 'absolute',
            opacity: isDarkMode ? 0 : 1,
            transform: [{ rotate: isDarkMode ? '90deg' : '0deg' }],
          }}
        />
        <Ionicons
          name="moon"
          size={20}
          color={theme.colors.primary}
          style={{
            position: 'absolute',
            opacity: isDarkMode ? 1 : 0,
            transform: [{ rotate: isDarkMode ? '0deg' : '-90deg' }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}