import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import { CheckCircle2, XCircle, Loader2, Copy, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { StatusTimeline, Button } from '@/shared/components/ui';
import type { TimelineStage } from '@/shared/components/ui';
import celebrationAnimation from '../../../assets/animation/celebration.json';
import { useLazyVerifyPaymentQuery } from '../api/certificate.api';

// ── Timeline builder ──────────────────────────────────────────────────────────

function buildTimeline(
  paymentStatus: 'success' | 'failed' | 'verifying',
  requestStatus: string,
): TimelineStage[] {
  const paid = paymentStatus === 'success';
  const failed = paymentStatus === 'failed';

  return [
    {
      label: 'Request Submitted',
      description: 'Your migration request was received.',
      status: 'done',
    },
    {
      label: 'Payment',
      description: paid ? 'Payment confirmed.' : failed ? 'Payment could not be verified.' : 'Awaiting confirmation…',
      status: paid ? 'done' : failed ? 'failed' : 'active',
    },
    {
      label: 'Under Review',
      description: 'A VOMS officer is reviewing your documents.',
      status: paid
        ? requestStatus === 'processing' || requestStatus === 'approved' || requestStatus === 'completed'
          ? 'done'
          : 'active'
        : 'pending',
    },
    {
      label: 'Certificate Issued',
      description: 'Your digital certificate is ready.',
      status: paid && (requestStatus === 'approved' || requestStatus === 'completed') ? 'done' : 'pending',
    },
  ];
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-slate-800 break-all text-right max-w-[180px]">{value || '—'}</span>
        {value && (
          <button onClick={copy} className="text-slate-400 hover:text-sage-700 transition-colors" aria-label={`Copy ${label}`}>
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        {copied && <span className="text-xs text-sage-700 font-medium">Copied!</span>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifyPayment, { isLoading: isVerifying }] = useLazyVerifyPaymentQuery();

  const [status, setStatus] = useState<'success' | 'failed' | 'verifying'>('verifying');
  const [requestStatus, setRequestStatus] = useState('pending');
  const [details, setDetails] = useState({ requestId: '', trxref: '', reference: '' });

  useEffect(() => {
    const requestId = searchParams.get('requestId') ?? '';
    const trxref = searchParams.get('trxref') ?? '';
    const reference = searchParams.get('reference') ?? '';
    setDetails({ requestId, trxref, reference });

    if (requestId && trxref && reference) {
      verify(requestId);
    } else {
      setStatus('failed');
      toast.error('Invalid payment callback — missing parameters');
    }
  }, []);

  const verify = async (requestId: string) => {
    try {
      const result = await verifyPayment(requestId).unwrap();
      if (result.success && result.paymentStatus === 'successful') {
        setStatus('success');
        setRequestStatus(result.requestStatus ?? 'pending');
        toast.success('Payment verified!');
      } else {
        setStatus('failed');
        toast.error(result.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setStatus('failed');
      toast.error(err?.data?.message || 'Failed to verify payment');
    }
  };

  const timeline = buildTimeline(status, requestStatus);

  // ── Verifying ──
  if (isVerifying || status === 'verifying') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-8 text-center">
          <Loader2 className="h-12 w-12 text-sage-700 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900">Verifying Payment</h2>
          <p className="text-sm text-slate-500 mt-1">Please wait — this takes just a moment.</p>
        </div>
      </div>
    );
  }

  // ── Failed ──
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* Red header */}
          <div className="bg-red-600 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <XCircle className="h-9 w-9 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
            <p className="text-sm text-red-100 mt-1">We couldn't confirm your payment.</p>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Recovery card */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Were you charged?</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                If money was deducted, please contact VOMS support and quote your transaction reference below.
                No duplicate charge will occur if you retry.
              </p>
            </div>

            {/* Transaction ref */}
            {details.trxref && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <CopyField label="Transaction Ref" value={details.trxref} />
                {details.requestId && <CopyField label="Request ID" value={details.requestId} />}
              </div>
            )}

            {/* Timeline */}
            <StatusTimeline stages={timeline} />

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => { setStatus('verifying'); verify(details.requestId); }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Verification
              </Button>
              <Button variant="secondary" onClick={() => navigate('/select-option')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Sage header with Lottie */}
        <div className="bg-sage-700 px-6 py-8 text-center">
          <div className="mx-auto mb-2 h-24 w-24">
            <Lottie animationData={celebrationAnimation} loop={false} className="h-full w-full" />
          </div>
          <div className="flex justify-center mb-3">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
          <p className="text-sm text-sage-200 mt-1">
            Your certificate migration request has been submitted.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Transaction details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-1">
            <CopyField label="Request ID" value={details.requestId} />
            <CopyField label="Transaction Ref" value={details.trxref} />
            <CopyField label="Status" value={requestStatus} />
          </div>

          {/* Info banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              Your certificate is now being processed. You'll receive a notification once it's ready.
              Keep your Request ID safe for tracking.
            </p>
          </div>

          {/* Status timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Request Progress</p>
            <StatusTimeline stages={timeline} />
          </div>

          <Button variant="primary" onClick={() => navigate('/select-option')} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
