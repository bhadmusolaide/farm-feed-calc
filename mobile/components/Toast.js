import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Toast context for managing toasts globally
const ToastContext = createContext();

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ ...options, type: 'success', message }),
    error: (message, options = {}) => addToast({ ...options, type: 'error', message, duration: 7000 }),
    warning: (message, options = {}) => addToast({ ...options, type: 'warning', message }),
    info: (message, options = {}) => addToast({ ...options, type: 'info', message }),
    loading: (message, options = {}) => addToast({ ...options, type: 'loading', message, duration: 0 })
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast container component
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <View style={styles.toastContainer}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </View>
    </SafeAreaView>
  );
}

// Individual toast item
function ToastItem({ toast, onRemove }) {
  const [slideAnim] = useState(new Animated.Value(width));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Enter animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleRemove = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onRemove(toast.id);
    });
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'loading':
        return 'refresh';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'loading':
        return '#3B82F6';
      default:
        return '#3B82F6';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#F0FDF4';
      case 'error':
        return '#FEF2F2';
      case 'warning':
        return '#FFFBEB';
      case 'loading':
        return '#EFF6FF';
      default:
        return '#EFF6FF';
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'loading':
        return '#3B82F6';
      default:
        return '#3B82F6';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons
          name={getIcon()}
          size={24}
          color={getIconColor()}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          {toast.title && (
            <Text style={[styles.title, { color: getIconColor() }]}>
              {toast.title}
            </Text>
          )}
          <Text style={styles.message}>
            {toast.message}
          </Text>
          {toast.action && (
            <TouchableOpacity
              onPress={toast.action.onClick}
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: getIconColor() }]}>
                {toast.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {toast.type !== 'loading' && (
          <TouchableOpacity
            onPress={handleRemove}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Error toast helper
export function showErrorToast(error, toast) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const errorTitle = error?.type ? getErrorTitle(error.type) : 'Error';
  
  toast.error(errorMessage, {
    title: errorTitle,
    duration: 7000
  });
}

// Success toast helper
export function showSuccessToast(message, toast, options = {}) {
  toast.success(message, {
    title: 'Success',
    ...options
  });
}

// Loading toast helper
export function showLoadingToast(message, toast) {
  return toast.loading(message, {
    title: 'Loading'
  });
}

function getErrorTitle(type) {
  switch (type) {
    case 'VALIDATION':
      return 'Invalid Input';
    case 'CALCULATION':
      return 'Calculation Error';
    case 'NETWORK':
      return 'Connection Error';
    case 'STORAGE':
      return 'Storage Error';
    default:
      return 'Error';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});