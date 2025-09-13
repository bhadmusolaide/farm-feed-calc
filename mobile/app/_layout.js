import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastProvider } from '../components/Toast';
import { useOfflineStore } from '../lib/store';

export default function RootLayout() {
  const { isOnline } = useOfflineStore();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="about" />
            <Stack.Screen name="disclaimer" />
            <Stack.Screen name="poultry-products" />
          </Stack>
          <OfflineIndicator />
          <StatusBar style="auto" />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}