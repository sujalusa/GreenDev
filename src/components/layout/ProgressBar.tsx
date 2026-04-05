import { cn } from '@/lib/utils';

const STEPS = ['Analyze', 'Configure', 'Scanning', 'Results'];

interface ProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-sm" aria-label={`Step ${currentStep} of ${STEPS.length}`}>
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  isComplete
                    ? 'bg-[var(--color-primary)] text-white'
                    : isActive
                    ? 'bg-[var(--color-primary-tint)] border-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-offset)] text-[var(--color-text-faint)]'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? '✓' : stepNum}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 whitespace-nowrap',
                  isActive
                    ? 'text-[var(--color-primary)] font-medium'
                    : isComplete
                    ? 'text-[var(--color-text-muted)]'
                    : 'text-[var(--color-text-faint)]'
                )}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-1 transition-colors',
                  isComplete ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
