'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let currentToasts: ToastItem[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).slice(2);
  currentToasts = [...currentToasts, { id, message, type }];
  toastListeners.forEach((listener) => listener(currentToasts));
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(currentToasts));
  }, 3000);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />,
  error: <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />,
  info: <Info className="w-4 h-4 text-[var(--color-primary)]" />,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] min-w-[260px] max-w-sm',
            'animate-in slide-in-from-right-4 fade-in duration-200'
          )}
        >
          {icons[toast.type]}
          <p className="text-sm text-[var(--color-text)] flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
