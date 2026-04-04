import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Show as error (red) vs hint (slate) */
  error?: boolean;
}

/**
 * Helper text shown below a form field.
 * Use error=true for validation messages, omit for hints.
 */
export function FormHelpText({ children, className, error }: Props) {
  return (
    <p
      className={cn(
        'mt-1.5 flex items-start gap-1 text-xs',
        error ? 'text-red-600' : 'text-slate-500',
        className,
      )}
      role={error ? 'alert' : undefined}
    >
      {!error && <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" aria-hidden="true" />}
      {children}
    </p>
  );
}
