import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { StatusTimeline, Button, FormHelpText } from '@/shared/components/ui';
import type { TimelineStage } from '@/shared/components/ui';
import { useLazyGetRequestStatusQuery } from '../api/certificate.api';
import type { RequestStatus, PaymentStatus } from '../models/api.models';

// ── Status → timeline builder ────────────────────────────────────────────────

function buildTimeline(
  requestStatus: RequestStatus,
  paymentStatus?: PaymentStatus,
  type?: 'migration' | 'transfer',
): TimelineStage[] {
  const paid = paymentStatus === 'paid';
  const payFailed = paymentStatus === 'failed';
  const done = requestStatus === 'completed' || requestStatus === 'approved';
  const rejected = requestStatus === 'rejected';
  const processing = requestStatus === 'processing';

  return [
    {
      label: 'Request Submitted',
      description: `Your ${type === 'transfer' ? 'ownership transfer' : 'certificate migration'} request was received.`,
      status: 'done',
    },
    {
      label: 'Payment',
      description: paid ? 'Payment confirmed.' : payFailed ? 'Payment failed.' : 'Awaiting payment.',
      status: paid ? 'done' : payFailed ? 'failed' : 'pending',
    },
    {
      label: 'Under Review',
      description: 'A VOMS officer is reviewing your documents.',
      status: done || rejected
        ? 'done'
        : processing && paid
        ? 'active'
        : 'pending',
    },
    {
      label: rejected ? 'Request Rejected' : 'Certificate Issued',
      description: rejected
        ? 'Your request was rejected. Please contact support.'
        : done
        ? 'Your digital certificate is ready.'
        : 'Waiting for approval.',
      status: rejected ? 'failed' : done ? 'done' : 'pending',
    },
  ];
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  approved: 'bg-sage-100 text-sage-700',
  completed: 'bg-sage-100 text-sage-700',
  rejected: 'bg-red-100 text-red-600',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RequestStatusTracker() {
  const [requestId, setRequestId] = useState('');
  const [inputError, setInputError] = useState('');
  const [getStatus, { data, isLoading, isFetching }] = useLazyGetRequestStatusQuery();

  const handleSearch = async () => {
    const id = requestId.trim();
    if (!id) { setInputError('Please enter a Request ID.'); return; }
    setInputError('');
    try {
      await getStatus(id).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Request not found. Please check the ID and try again.');
    }
  };

  const info = data?.data;
  const timeline = info ? buildTimeline(info.status, info.payment_status, info.type) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-12 px-4 pb-12">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Track Your Request</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter the Request ID from your submission confirmation.
          </p>
        </div>

        {/* Search card */}
        <div className="rounded-2xl bg-white shadow-xl px-6 py-6 space-y-4">
          <div>
            <label htmlFor="requestId" className="block text-sm font-medium text-slate-700 mb-1.5">
              Request ID
            </label>
            <div className="flex gap-2">
              <input
                id="requestId"
                type="text"
                value={requestId}
                onChange={(e) => { setRequestId(e.target.value); setInputError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. req_abc123xyz"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-700/20"
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={isLoading || isFetching}
                className="flex-shrink-0"
              >
                {isLoading || isFetching
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />
                }
              </Button>
            </div>
            {inputError && <FormHelpText error>{inputError}</FormHelpText>}
          </div>
        </div>

        {/* Results */}
        {info && (
          <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Summary header */}
            <div className="bg-slate-900 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-semibold">
                    {info.type === 'transfer' ? 'Ownership Transfer' : 'Certificate Migration'}
                  </p>
                  <p className="text-sm font-mono text-white break-all">{info.request_id}</p>
                </div>
                <StatusBadge status={info.status} />
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-slate-400 mb-0.5">Payment</p>
                  <p className="font-semibold capitalize text-slate-800">{info.payment_status ?? '—'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-slate-400 mb-0.5">Last Updated</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(info.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Certificate download */}
              {info.certificate_url && (
                <a
                  href={info.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-sm font-semibold py-3 transition-colors"
                >
                  Download Certificate
                </a>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Progress</p>
                <StatusTimeline stages={timeline} />
              </div>

              {/* Rejected help */}
              {info.status === 'rejected' && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs text-red-700 leading-relaxed">
                    Your request was rejected. Please contact VOMS support with your Request ID for assistance.
                  </p>
                </div>
              )}

              {/* Refresh */}
              <Button
                variant="secondary"
                onClick={() => getStatus(requestId.trim())}
                disabled={isFetching}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
