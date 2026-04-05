import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            aria-invalid={!!error}
            className={cn(
              'w-full px-4 py-2.5 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] transition-all duration-[var(--transition-ui)] outline-none min-h-[44px]',
              'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-tint)]',
              error
                ? 'border-[var(--color-error)] focus:ring-[rgba(161,44,123,0.15)]'
                : success
                ? 'border-[var(--color-success)]'
                : 'border-[var(--color-border)]',
              (success || error) && 'pr-10',
              className
            )}
            {...props}
          />
          {success && !error && (
            <CheckCircle2
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-success)]"
              aria-hidden="true"
            />
          )}
          {error && (
            <AlertCircle
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-error)]"
              aria-hidden="true"
            />
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[var(--color-error)] flex items-center gap-1"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
