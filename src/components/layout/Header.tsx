'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeaderProps {
  showBreadcrumb?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  showStartNewScan?: boolean;
}

function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 3C8 3 4 8 4 14c0 4 2.5 7.5 6 9.5L14 25l4-2.5c3.5-2 6-5.5 6-9.5 0-6-4-11-10-11z"
        fill="var(--color-primary)"
        opacity="0.15"
      />
      <path
        d="M8 14c0-3.5 2.5-6.5 6-7.5M14 22c3.5-1 6-4 6-8"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text
        x="6"
        y="19"
        fill="var(--color-primary)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="700"
      >
        &gt;_
      </text>
    </svg>
  );
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-[var(--color-text-faint)] text-sm">/</span>
          )}
          {i === items.length - 1 ? (
            <span className="text-sm text-[var(--color-text)] font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  // Default to dark mode on server
  const isDark = theme === 'dark' || theme === undefined;

  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] transition-colors',
        'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]'
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

export function Header({
  showBreadcrumb = true,
  breadcrumbItems = [],
  showStartNewScan = true,
}: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handleStartNewScan() {
    dispatch({ type: 'RESET_ALL' });
    router.push('/');
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-14 flex items-center px-4 md:px-6',
        'bg-[var(--color-bg)]/85 backdrop-blur-[12px]',
        'border-b border-[var(--color-divider)]'
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0 mr-6 group" aria-label="GreenDev Coach home">
        <Logo />
        <span
          className="hidden sm:block text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          GreenDev Coach
        </span>
      </Link>

      {/* Center breadcrumb */}
      <div className="flex-1">
        {showBreadcrumb && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        <DarkModeToggle />
        {showStartNewScan && (
          <Button variant="ghost" size="sm" onClick={handleStartNewScan}>
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">New Scan</span>
          </Button>
        )}
      </div>
    </header>
  );
}
