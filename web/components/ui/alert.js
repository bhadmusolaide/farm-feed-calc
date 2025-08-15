'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

const alertVariants = {
  default: "bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800",
  destructive: "bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800",
  warning: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800",
  success: "bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800"
};

export const Alert = forwardRef(({ 
  className, 
  variant = "default", 
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={clsx(
        "relative w-full rounded-lg border p-4",
        "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = "Alert";

export const AlertDescription = forwardRef(({ 
  className, 
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        "text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

AlertDescription.displayName = "AlertDescription";

export const AlertTitle = forwardRef(({ 
  className, 
  children,
  ...props 
}, ref) => {
  return (
    <h5
      ref={ref}
      className={clsx(
        "mb-1 font-medium leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h5>
  );
});

AlertTitle.displayName = "AlertTitle";