import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Stepper, Button } from '@/shared/components/ui';
import { useInitiateMigrationPaymentMutation } from '../api';
import { lgas } from '../data';

const STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

const PROCESSING_FEE = 5000;

// ── Small key-value row ───────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InformationSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, vin, vehicleInfo, additionalInfo } = location.state || {};

  const lgaName = lgas.find((l) => l.id === additionalInfo?.lga)?.name ?? additionalInfo?.lga;

  const [confirmed, setConfirmed] = useState(false);
  const [initiatePayment, { isLoading }] = useInitiateMigrationPaymentMutation();

  const handleConfirm = async () => {
    if (!confirmed) { toast.error('Please confirm the information to proceed'); return; }
    if (!requestId) {
      toast.error('Request ID not found. Please start from the beginning.');
      navigate('/app/certificate-request/enter-vin');
      return;
    }

    try {
      const result = await initiatePayment({ requestId, data: { request_id: requestId, amount: PROCESSING_FEE } }).unwrap();
      if (result.success) {
        toast.success('Redirecting to payment…');
        window.location.href = result.paymentUrl;
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/certificate-request/upload-documents')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={5} />
          <h2 className="text-lg font-bold text-white">Review & Pay</h2>
          <p className="text-sm text-slate-400 mt-1">
            Check your details carefully before proceeding to payment.
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Vehicle info */}
          <SectionCard title="Vehicle Information">
            <InfoRow label="VIN" value={vin} />
            <InfoRow label="Year" value={vehicleInfo?.year} />
            <InfoRow label="Make" value={vehicleInfo?.make} />
            <InfoRow label="Model" value={vehicleInfo?.model} />
            <InfoRow label="Type" value={vehicleInfo?.type} />
          </SectionCard>

          {/* Additional info */}
          <SectionCard title="Additional Information">
            <InfoRow label="State" value={additionalInfo?.state} />
            <InfoRow label="LGA" value={lgaName} />
            <InfoRow label="Certificate No." value={additionalInfo?.certificateNo} />
            <InfoRow label="Issued Date" value={additionalInfo?.issuedDate} />
            <InfoRow label="Plate No." value={additionalInfo?.plateNo} />
            <InfoRow label="Purpose" value={additionalInfo?.purpose} />
            <InfoRow label="Owner Name" value={additionalInfo?.ownerName} />
            <InfoRow label="Owner Address" value={additionalInfo?.ownerAddress} />
            <InfoRow label="Engine No." value={additionalInfo?.engineNo} />
            <InfoRow label="Chassis No." value={additionalInfo?.chassisNo} />
            <InfoRow label="Title" value={additionalInfo?.title} />
            <InfoRow label="Phone" value={additionalInfo?.phone} />
            <InfoRow label="Email" value={additionalInfo?.email} />
          </SectionCard>

          {/* Payment summary */}
          <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-sage-700" />
              <p className="text-sm font-semibold text-sage-800">Payment Summary</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Processing Fee</span>
              <span className="text-lg font-bold text-slate-900">
                ₦{PROCESSING_FEE.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              You will be redirected to Paystack to complete this payment securely.
            </p>
          </div>

          {/* Confirmation checkbox */}
          <button
            type="button"
            onClick={() => setConfirmed((v) => !v)}
            className="flex items-start gap-3 w-full text-left rounded-xl border-2 border-slate-200 hover:border-sage-400 px-4 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
          >
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                confirmed ? 'border-sage-700 bg-sage-700' : 'border-slate-300 bg-white'
              }`}
            >
              {confirmed && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-slate-700">
              I confirm that all the information above is correct and I am ready to proceed to payment.
            </span>
          </button>

          {/* CTA */}
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!confirmed || isLoading}
            className="w-full"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Redirecting…' : `Pay ₦${PROCESSING_FEE.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </main>
  );
}
