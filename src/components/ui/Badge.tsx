import { cn } from '@/lib/utils';
import { ImpactLevel, EffortLevel } from '@/types';

type BadgeVariant = 'impact' | 'effort' | 'status' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  level?: ImpactLevel | EffortLevel | string;
  children: React.ReactNode;
  className?: string;
}

const impactStyles: Record<string, string> = {
  HIGH: 'bg-[var(--color-high-bg)] text-[var(--color-high)]',
  MEDIUM: 'bg-[var(--color-medium-bg)] text-[var(--color-medium)]',
  LOW: 'bg-[var(--color-low-bg)] text-[var(--color-low)]',
};

export function Badge({ variant = 'neutral', level, children, className }: BadgeProps) {
  const impactStyle = level ? impactStyles[level] ?? '' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-semibold uppercase tracking-wide',
        variant === 'impact' || variant === 'effort' ? impactStyle : '',
        variant === 'neutral' &&
          'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)]',
        className
      )}
    >
      {children}
    </span>
  );
}
