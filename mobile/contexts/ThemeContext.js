import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Light theme colors
const lightTheme = {
  colors: {
    primary: '#f59e0b',
    primaryContainer: '#fef3c7',
    secondary: '#22c55e',
    secondaryContainer: '#dcfce7',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',
    text: '#0f172a',
    onSurface: '#475569',
    onSurfaceVariant: '#64748b',
    disabled: '#cbd5e1',
    placeholder: '#94a3b8',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#ef4444',
    border: '#e2e8f0',
    card: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

// Dark theme colors
const darkTheme = {
  colors: {
    primary: '#fbbf24',
    primaryContainer: '#92400e',
    secondary: '#4ade80',
    secondaryContainer: '#166534',
    accent: '#fbbf24',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    text: '#f8fafc',
    onSurface: '#cbd5e1',
    onSurfaceVariant: '#94a3b8',
    disabled: '#475569',
    placeholder: '#64748b',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#f87171',
    border: '#475569',
    card: '#1e293b',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
      } else {
        // Use system preference if no saved preference
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      theme, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}