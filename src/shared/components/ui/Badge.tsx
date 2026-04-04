import { cn } from '@/lib/utils';

export type BadgeVariant = 'approved' | 'pending' | 'rejected' | 'urgent' | 'draft';

const variantClasses: Record<BadgeVariant, string> = {
  approved: 'status-approved',
  pending: 'status-pending',
  rejected: 'status-rejected',
  urgent: 'status-urgent',
  draft: 'status-draft',
};

const dotColors: Record<BadgeVariant, string> = {
  approved: 'bg-sage-600',
  pending: 'bg-amber-500',
  rejected: 'bg-red-500',
  urgent: 'bg-red-700',
  draft: 'bg-slate-400',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'draft', dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantClasses[variant], className)}>
      {dot && (
        <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0', dotColors[variant])} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
