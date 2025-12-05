'use client';

import * as React from 'react';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-[500vw] max-w-[200px] sm:w-auto sm:max-w-xs">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const typeConfig = {
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-primary/10 dark:bg-primary/15',
      border: 'border-primary/30 dark:border-primary/40',
      text: 'text-primary',
    },
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-green-500/10 dark:bg-green-500/15',
      border: 'border-green-500/30 dark:border-green-500/40',
      text: 'text-green-600 dark:text-green-400',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      text: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-red-500/10 dark:bg-red-500/15',
      border: 'border-red-500/30 dark:border-red-500/40',
      text: 'text-red-600 dark:text-red-400',
    },
  };

  const config = typeConfig[toast.type ?? 'info'];

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden rounded-xl sm:rounded-2xl border backdrop-blur-xl
        bg-card/98 dark:bg-card/95 ${config.border}
        shadow-lg shadow-black/5 dark:shadow-black/20
        transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      {/* Accent gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
        toast.type === 'success' ? 'bg-gradient-to-r from-transparent via-green-500/50 to-transparent' :
        toast.type === 'warning' ? 'bg-gradient-to-r from-transparent via-amber-500/50 to-transparent' :
        toast.type === 'error' ? 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent' :
        'bg-gradient-to-r from-transparent via-primary/50 to-transparent'
      }`} />
      
      <div className="relative flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.text}`}>
          <div className="w-4 h-4 sm:w-5 sm:h-5">
            {config.icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground leading-snug sm:leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-md p-0.5 sm:p-1 text-muted-foreground/60 hover:text-foreground hover:bg-background/40 transition-all duration-150 active:scale-95"
          aria-label="Close notification"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
