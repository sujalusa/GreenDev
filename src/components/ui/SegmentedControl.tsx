'use client';

import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, label, className }: SegmentedControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      )}
      <div
        role="group"
        aria-label={label}
        className={cn(
          'flex flex-wrap gap-2',
          className
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all duration-150 min-h-[36px]',
              value === opt.value
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
