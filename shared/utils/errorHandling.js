// Shared error handling utilities for both web and mobile

// Error types for better categorization
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION',
  CALCULATION: 'CALCULATION',
  NETWORK: 'NETWORK',
  STORAGE: 'STORAGE',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Custom error class for better error handling
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_NUMBER: 'Please enter a valid number',
  NUMBER_TOO_SMALL: 'Value must be greater than {min}',
  NUMBER_TOO_LARGE: 'Value must be less than {max}',
  INVALID_AGE: 'Age must be between 1 and 365 days',
  INVALID_QUANTITY: 'Number of birds must be between 1 and 10,000',
  INVALID_BREED: 'Please select a valid breed',
  INVALID_BIRD_TYPE: 'Please select a valid bird type',
  INVALID_REARING_STYLE: 'Please select a valid rearing style'
};

// Network error messages
export const NETWORK_MESSAGES = {
  OFFLINE: 'You are currently offline. Some features may be limited.',
  CONNECTION_FAILED: 'Failed to connect to the server. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.'
};

// Input validation functions
export const validateInput = {
  // Validate bird quantity
  quantity: (value) => {
    if (!value || value === '') {
      throw new AppError(VALIDATION_MESSAGES.REQUIRED_FIELD, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new AppError(VALIDATION_MESSAGES.INVALID_NUMBER, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    if (num < 1) {
      throw new AppError(VALIDATION_MESSAGES.NUMBER_TOO_SMALL.replace('{min}', '1'), ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    if (num > 10000) {
      throw new AppError(VALIDATION_MESSAGES.NUMBER_TOO_LARGE.replace('{max}', '10,000'), ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    return num;
  },

  // Validate bird age
  age: (value, unit = 'days') => {
    if (!value || value === '') {
      throw new AppError(VALIDATION_MESSAGES.REQUIRED_FIELD, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new AppError(VALIDATION_MESSAGES.INVALID_NUMBER, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    const ageInDays = unit === 'weeks' ? num * 7 : num;
    
    if (ageInDays < 1) {
      throw new AppError(VALIDATION_MESSAGES.NUMBER_TOO_SMALL.replace('{min}', '1'), ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    if (ageInDays > 365) {
      throw new AppError(VALIDATION_MESSAGES.INVALID_AGE, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    return ageInDays;
  },

  // Validate bird type
  birdType: (value) => {
    if (!value) {
      throw new AppError(VALIDATION_MESSAGES.REQUIRED_FIELD, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    const validTypes = ['broiler', 'layer'];
    if (!validTypes.includes(value)) {
      throw new AppError(VALIDATION_MESSAGES.INVALID_BIRD_TYPE, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    return value;
  },

  // Validate breed
  breed: (value) => {
    if (!value) {
      throw new AppError(VALIDATION_MESSAGES.REQUIRED_FIELD, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    return value;
  },

  // Validate rearing style
  rearingStyle: (value) => {
    if (!value) {
      throw new AppError(VALIDATION_MESSAGES.REQUIRED_FIELD, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM);
    }
    
    // Keep this list in sync with getRearingStyleOptions (web/lib/unifiedStore.js)
    const validStyles = ['backyard', 'commercial', 'free-range', 'organic'];
    if (!validStyles.includes(value)) {
      throw new AppError(VALIDATION_MESSAGES.INVALID_REARING_STYLE, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM, { received: value, valid: validStyles });
    }
    
    return value;
  }
};

// Validate complete form data
export const validateFormData = (formData) => {
  const errors = [];
  
  try {
    validateInput.birdType(formData.birdType);
  } catch (error) {
    errors.push({ field: 'birdType', ...error });
  }
  
  try {
    validateInput.breed(formData.breed);
  } catch (error) {
    errors.push({ field: 'breed', ...error });
  }
  
  try {
    validateInput.age(formData.ageInDays, 'days');
  } catch (error) {
    errors.push({ field: 'age', ...error });
  }
  
  try {
    validateInput.quantity(formData.quantity);
  } catch (error) {
    errors.push({ field: 'quantity', ...error });
  }
  
  try {
    validateInput.rearingStyle(formData.rearingStyle);
  } catch (error) {
    errors.push({ field: 'rearingStyle', ...error });
  }
  
  return errors;
};

// Error logging utility
export const logError = (error, context = {}) => {
  const errorLog = {
    message: error.message,
    type: error.type || ERROR_TYPES.UNKNOWN,
    severity: error.severity || ERROR_SEVERITY.MEDIUM,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development' || __DEV__) {
    console.error('App Error:', errorLog);
  }
  
  // In production, you might want to send to an error reporting service
  // sendToErrorReportingService(errorLog);
  
  return errorLog;
};

// Retry utility with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Safe async wrapper that catches and logs errors
export const safeAsync = (fn, fallback = null) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });
      return fallback;
    }
  };
};

// Network error handler
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return new AppError(NETWORK_MESSAGES.OFFLINE, ERROR_TYPES.NETWORK, ERROR_SEVERITY.MEDIUM);
  }
  
  if (error.name === 'TimeoutError') {
    return new AppError(NETWORK_MESSAGES.TIMEOUT, ERROR_TYPES.NETWORK, ERROR_SEVERITY.MEDIUM);
  }
  
  if (error.status >= 500) {
    return new AppError(NETWORK_MESSAGES.SERVER_ERROR, ERROR_TYPES.NETWORK, ERROR_SEVERITY.HIGH);
  }
  
  return new AppError(NETWORK_MESSAGES.CONNECTION_FAILED, ERROR_TYPES.NETWORK, ERROR_SEVERITY.MEDIUM);
};

// Storage error handler
export const handleStorageError = (error, operation = 'storage') => {
  logError(error, { operation });
  return new AppError(
    `Failed to ${operation}. Your data may not be saved.`,
    ERROR_TYPES.STORAGE,
    ERROR_SEVERITY.LOW
  );
};

// User-friendly error message formatter
export const formatErrorForUser = (error) => {
  if (error instanceof AppError) {
    return {
      title: getErrorTitle(error.type),
      message: error.message,
      severity: error.severity,
      type: error.type
    };
  }
  
  // Handle unknown errors
  return {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    severity: ERROR_SEVERITY.MEDIUM,
    type: ERROR_TYPES.UNKNOWN
  };
};

// Get appropriate error title based on type
const getErrorTitle = (type) => {
  switch (type) {
    case ERROR_TYPES.VALIDATION:
      return 'Invalid Input';
    case ERROR_TYPES.CALCULATION:
      return 'Calculation Error';
    case ERROR_TYPES.NETWORK:
      return 'Connection Error';
    case ERROR_TYPES.STORAGE:
      return 'Storage Error';
    default:
      return 'Error';
  }
};

// Debounce utility for input validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};