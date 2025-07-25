'use client';

import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// Main loading component with different variants
export function LoadingState({ 
  variant = 'default', 
  size = 'md', 
  message = 'Loading...', 
  className = '',
  showMessage = true 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'inline') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        <Loader2 className={clsx('animate-spin text-blue-600', sizeClasses[size])} />
        {showMessage && (
          <span className={clsx('text-gray-600', textSizeClasses[size])}>
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={clsx(
        'absolute inset-0 bg-white/80 backdrop-blur-sm',
        'flex items-center justify-center z-50',
        className
      )}>
        <div className="text-center">
          <Loader2 className={clsx('animate-spin text-blue-600 mx-auto mb-2', sizeClasses[size])} />
          {showMessage && (
            <p className={clsx('text-gray-600', textSizeClasses[size])}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={clsx(
        'fixed inset-0 bg-white/90 backdrop-blur-sm',
        'flex items-center justify-center z-50',
        className
      )}>
        <div className="text-center">
          <Loader2 className={clsx('animate-spin text-blue-600 mx-auto mb-4', sizeClasses[size])} />
          {showMessage && (
            <p className={clsx('text-gray-600', textSizeClasses[size])}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
      <Loader2 className={clsx('animate-spin text-blue-600 mb-4', sizeClasses[size])} />
      {showMessage && (
        <p className={clsx('text-gray-600 text-center', textSizeClasses[size])}>
          {message}
        </p>
      )}
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  loadingText = 'Loading...', 
  ...props 
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'relative inline-flex items-center justify-center',
        'px-4 py-2 border border-transparent text-sm font-medium rounded-md',
        'text-white bg-blue-600 hover:bg-blue-700',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        className
      )}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {loading ? loadingText : children}
    </button>
  );
}

// Skeleton loading components
export function SkeletonLine({ className = '', width = 'full' }) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  return (
    <div className={clsx(
      'h-4 bg-gray-200 rounded animate-pulse',
      widthClasses[width],
      className
    )} />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={clsx('border border-gray-200 rounded-lg p-4 space-y-3', className)}>
      <SkeletonLine width="3/4" />
      <SkeletonLine width="1/2" />
      <SkeletonLine width="full" />
      <div className="flex space-x-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 3, columns = 4, className = '' }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={i} width="1/4" className="h-6" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine key={colIndex} width="1/4" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading wrapper component
export function LoadingWrapper({ 
  loading, 
  error, 
  children, 
  loadingComponent, 
  errorComponent,
  className = '' 
}) {
  if (error) {
    return errorComponent || (
      <div className={clsx('text-center p-8', className)}>
        <p className="text-red-600 mb-2">Something went wrong</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return loadingComponent || (
      <LoadingState className={className} />
    );
  }

  return children;
}

// Progress bar component
export function ProgressBar({ 
  progress = 0, 
  className = '', 
  showPercentage = true,
  color = 'blue' 
}) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={clsx('h-2 rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Spinner component
export function Spinner({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  return (
    <Loader2 className={clsx(
      'animate-spin',
      sizeClasses[size],
      colorClasses[color],
      className
    )} />
  );
}