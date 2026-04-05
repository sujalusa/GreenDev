'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelOff?: string;
  labelOn?: string;
  id?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  labelOff = 'Off',
  labelOn = 'On',
  id,
  disabled = false,
}: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'toggle';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-sm transition-colors',
            !checked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          {labelOff}
        </span>
        <button
          role="switch"
          aria-checked={checked}
          id={toggleId}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 min-w-[44px]',
            checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        <span
          className={cn(
            'text-sm transition-colors',
            checked ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          {labelOn}
        </span>
      </div>
    </div>
  );
}
