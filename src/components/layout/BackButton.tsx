'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Back', className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm min-h-[44px]',
        'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-offset)]',
        'transition-colors duration-[var(--transition-ui)]',
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
