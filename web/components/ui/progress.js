'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export const Progress = forwardRef(({ 
  className, 
  value = 0, 
  max = 100,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div
      ref={ref}
      className={clsx(
        "relative h-4 w-full overflow-hidden rounded-full",
        "bg-neutral-200 dark:bg-neutral-700",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
        style={{
          transform: `translateX(-${100 - percentage}%)`
        }}
      />
    </div>
  );
});

Progress.displayName = "Progress";