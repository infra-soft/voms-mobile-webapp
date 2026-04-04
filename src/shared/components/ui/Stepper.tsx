import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  label: string;
}

interface Props {
  steps: StepperStep[];
  current: number; // 0-based index of the active step
}

/**
 * Horizontal step indicator for multi-step forms.
 * current = 0 → first step active.
 */
export function Stepper({ steps, current }: Props) {
  return (
    <nav aria-label="Form steps" className="mb-6">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const last = i === steps.length - 1;

          return (
            <li key={i} className={cn('flex items-center', !last && 'flex-1')}>
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                    done && 'border-sage-700 bg-sage-700 text-white',
                    active && 'border-sage-700 bg-white text-sage-700',
                    !done && !active && 'border-slate-300 bg-white text-slate-400',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'hidden sm:block text-[10px] font-semibold uppercase tracking-wide text-center whitespace-nowrap',
                    active ? 'text-sage-700' : done ? 'text-slate-500' : 'text-slate-400',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!last && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded transition-colors',
                    done ? 'bg-sage-700' : 'bg-slate-200',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
