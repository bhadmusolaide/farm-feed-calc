'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const DialogContext = createContext();

export function Dialog({ open, onOpenChange, children }) {
  const overlayRef = useRef();
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);
  
  if (!open) return null;
  
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
        />
        {/* Content */}
        <div className="relative z-10 w-full max-w-lg mx-4">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div 
      className={clsx(
        "glass-card p-6 backdrop-blur-xl border border-white/20 dark:border-neutral-700/20",
        "bg-white/90 dark:bg-neutral-900/90 rounded-xl shadow-xl",
        "max-h-[90vh] overflow-y-auto",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div 
      className={clsx("flex flex-col space-y-2 text-center sm:text-left mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2 
      className={clsx(
        "text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p 
      className={clsx(
        "text-sm text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function DialogClose({ className, children, ...props }) {
  const { onOpenChange } = useContext(DialogContext);
  
  return (
    <button
      className={clsx(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      onClick={() => onOpenChange?.(false)}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  );
}