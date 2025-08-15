import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Main loading component with different variants
export function LoadingState({ 
  variant = 'default', 
  size = 'large', 
  message = 'Loading...', 
  style = {},
  showMessage = true,
  color = '#3B82F6'
}) {
  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <ActivityIndicator size={size} color={color} />
        {showMessage && (
          <Text style={[styles.inlineText, { color }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  if (variant === 'overlay') {
    return (
      <View style={[styles.overlayContainer, style]}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          {showMessage && (
            <Text style={[styles.overlayText, { color }]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <View style={[styles.fullscreenContainer, style]}>
        <View style={styles.fullscreenContent}>
          <ActivityIndicator size={size} color={color} />
          {showMessage && (
            <Text style={[styles.fullscreenText, { color }]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={[styles.defaultContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {showMessage && (
        <Text style={[styles.defaultText, { color }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  style = {}, 
  textStyle = {},
  loadingText = 'Loading...', 
  onPress,
  color = '#3B82F6',
  ...props 
}) {
  return (
    <TouchableOpacity
      {...props}
      onPress={loading || disabled ? undefined : onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: color },
        (disabled || loading) && styles.buttonDisabled,
        style
      ]}
    >
      <View style={styles.buttonContent}>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color="white" 
            style={styles.buttonLoader}
          />
        )}
        <Text style={[styles.buttonText, textStyle]}>
          {loading ? loadingText : children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Skeleton loading components
export function SkeletonLine({ style = {}, width = '100%', height = 16 }) {
  const animatedValue = new Animated.Value(0);
  
  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View 
      style={[
        styles.skeletonLine,
        { width, height, opacity },
        style
      ]} 
    />
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <View style={[styles.skeletonCard, style]}>
      <SkeletonLine width="75%" height={20} style={{ marginBottom: 8 }} />
      <SkeletonLine width="50%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLine width="100%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.skeletonButtonRow}>
        <SkeletonLine width={60} height={32} />
        <SkeletonLine width={60} height={32} />
      </View>
    </View>
  );
}

export function SkeletonTable({ rows = 3, style = {} }) {
  return (
    <View style={[styles.skeletonTable, style]}>
      {/* Header */}
      <View style={styles.skeletonTableRow}>
        <SkeletonLine width="25%" height={20} />
        <SkeletonLine width="25%" height={20} />
        <SkeletonLine width="25%" height={20} />
        <SkeletonLine width="25%" height={20} />
      </View>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonTableRow}>
          <SkeletonLine width="25%" height={16} />
          <SkeletonLine width="25%" height={16} />
          <SkeletonLine width="25%" height={16} />
          <SkeletonLine width="25%" height={16} />
        </View>
      ))}
    </View>
  );
}

// Loading wrapper component
export function LoadingWrapper({ 
  loading, 
  error, 
  children, 
  loadingComponent, 
  errorComponent,
  style = {} 
}) {
  if (error) {
    return errorComponent || (
      <View style={[styles.errorContainer, style]}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (loading) {
    return loadingComponent || (
      <LoadingState style={style} />
    );
  }

  return children;
}

// Progress bar component
export function ProgressBar({ 
  progress = 0, 
  style = {}, 
  showPercentage = true,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  height = 8
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.progressContainer, style]}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        {showPercentage && (
          <Text style={styles.progressPercentage}>{Math.round(clampedProgress)}%</Text>
        )}
      </View>
      <View style={[styles.progressTrack, { backgroundColor, height }]}>
        <Animated.View 
          style={[
            styles.progressFill,
            { 
              backgroundColor: color, 
              height,
              width: `${clampedProgress}%`
            }
          ]}
        />
      </View>
    </View>
  );
}

// Spinner component
export function Spinner({ size = 'large', color = '#3B82F6', style = {} }) {
  return (
    <ActivityIndicator 
      size={size} 
      color={color} 
      style={[styles.spinner, style]} 
    />
  );
}

// Pulse animation component
export function PulseLoader({ style = {}, color = '#3B82F6' }) {
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pulseLoader,
        { backgroundColor: color, transform: [{ scale: pulseAnim }] },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // Loading state styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineText: {
    marginLeft: 8,
    fontSize: 16,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 8,
    fontSize: 16,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContent: {
    alignItems: 'center',
  },
  fullscreenText: {
    marginTop: 16,
    fontSize: 18,
  },
  defaultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  defaultText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },

  // Button styles
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLoader: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Skeleton styles
  skeletonLine: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
  },
  skeletonTable: {
    padding: 16,
  },
  skeletonTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Progress bar styles
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressTrack: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },

  // Spinner styles
  spinner: {
    alignSelf: 'center',
  },

  // Pulse loader styles
  pulseLoader: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});