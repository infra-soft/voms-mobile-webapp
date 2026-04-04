import { Check, Clock, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineStageStatus = 'done' | 'active' | 'pending' | 'failed';

export interface TimelineStage {
  label: string;
  description?: string;
  status: TimelineStageStatus;
  timestamp?: string;
}

interface Props {
  stages: TimelineStage[];
}

function StageIcon({ status }: { status: TimelineStageStatus }) {
  if (status === 'done')
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-700">
        <Check className="h-4 w-4 text-white" />
      </div>
    );
  if (status === 'active')
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
        <Loader2 className="h-4 w-4 text-white animate-spin" />
      </div>
    );
  if (status === 'failed')
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
        <XCircle className="h-4 w-4 text-white" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
      <Clock className="h-4 w-4 text-slate-400" />
    </div>
  );
}

export function StatusTimeline({ stages }: Props) {
  return (
    <ol className="space-y-0">
      {stages.map((stage, i) => {
        const last = i === stages.length - 1;
        return (
          <li key={i} className="flex gap-4">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <StageIcon status={stage.status} />
              {!last && (
                <div
                  className={cn(
                    'mt-1 w-0.5 flex-1 min-h-[28px]',
                    stage.status === 'done' ? 'bg-sage-700' : 'bg-slate-200',
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', last && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-semibold leading-tight',
                  stage.status === 'done' && 'text-sage-700',
                  stage.status === 'active' && 'text-blue-600',
                  stage.status === 'failed' && 'text-red-600',
                  stage.status === 'pending' && 'text-slate-400',
                )}
              >
                {stage.label}
              </p>
              {stage.description && (
                <p className="mt-0.5 text-xs text-slate-500">{stage.description}</p>
              )}
              {stage.timestamp && (
                <p className="mt-0.5 text-xs text-slate-400">{stage.timestamp}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
