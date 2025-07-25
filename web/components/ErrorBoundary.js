'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
    
    // Production error reporting
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // Basic error logging for production
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Store error locally for debugging
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem('app_errors', JSON.stringify(errors));

      // If you have Sentry or other error service, report here:
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: { react: { componentStack: errorInfo.componentStack } }
      //   });
      // }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry, showDetails = false }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-neutral-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or go back to the home page.
        </p>
        
        {showDetails && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-neutral-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-neutral-100 rounded-lg p-3 text-xs font-mono text-neutral-800 overflow-auto max-h-32">
              <div className="font-semibold mb-1">Error:</div>
              <div className="mb-2">{error.toString()}</div>
              {error.stack && (
                <>
                  <div className="font-semibold mb-1">Stack Trace:</div>
                  <div className="whitespace-pre-wrap">{error.stack}</div>
                </>
              )}
            </div>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary, ErrorFallback };
export default ErrorBoundary;