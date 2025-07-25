'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';

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
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual toast item
function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'loading':
        return (
          <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'border-l-4';
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-800 dark:text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-800 dark:text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-400 text-yellow-800 dark:text-yellow-100`;
      case 'loading':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-100`;
      default:
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-100`;
    }
  };

  return (
    <div
      className={clsx(
        'transform transition-all duration-300 ease-in-out',
        'bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4 flex items-start space-x-3',
        getStyles(),
        {
          'translate-x-full opacity-0': !isVisible,
          'translate-x-0 opacity-100': isVisible && !isLeaving,
          'translate-x-full opacity-0': isLeaving
        }
      )}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium mb-1">
            {toast.title}
          </p>
        )}
        <p className="text-sm">
          {toast.message}
        </p>
        {toast.action && (
          <div className="mt-2">
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
      
      {toast.type !== 'loading' && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
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