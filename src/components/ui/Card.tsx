import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  tinted?: boolean;
}

export function Card({ elevated = false, tinted = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        elevated && 'shadow-[var(--shadow-md)]',
        tinted && 'bg-[var(--color-primary-tint)] border-[var(--color-primary-subtle)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
