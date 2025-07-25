import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
          showDetails={__DEV__}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry, showDetails = false }) {
  const router = useRouter();
  const { theme } = useTheme();

  const handleGoHome = () => {
    router.replace('/');
  };

  const showErrorDetails = () => {
    if (showDetails && error) {
      Alert.alert(
        'Error Details (Development)',
        `Error: ${error.toString()}\n\nStack: ${error.stack?.substring(0, 500)}...`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <View style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <View style={{
          width: 64,
          height: 64,
          backgroundColor: '#fee2e2',
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <Ionicons name="warning" size={32} color="#dc2626" />
        </View>
        
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.colors.text,
          textAlign: 'center',
          marginBottom: 8
        }}>
          Something went wrong
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: theme.colors.onSurfaceVariant,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24
        }}>
          We encountered an unexpected error. Please try restarting the app or go back to the home screen.
        </Text>
        
        <View style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            onPress={onRetry}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.onPrimary} />
            <Text style={{
              color: theme.colors.onPrimary,
              fontSize: 16,
              fontWeight: '600'
            }}>
              Try Again
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleGoHome}
            style={{
              backgroundColor: theme.colors.surface,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Ionicons name="home" size={20} color={theme.colors.text} />
            <Text style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: '600'
            }}>
              Go Home
            </Text>
          </TouchableOpacity>
          
          {showDetails && error && (
            <TouchableOpacity
              onPress={showErrorDetails}
              style={{
                paddingVertical: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: theme.colors.onSurfaceVariant,
                fontSize: 14,
                textDecorationLine: 'underline'
              }}>
                Show Error Details (Dev)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default ErrorBoundary;
export { ErrorFallback };