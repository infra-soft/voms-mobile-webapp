import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Stepper, Button } from '@/shared/components/ui';
import { useInitiateTransferPaymentMutation } from '../../certificate_request/api';

const STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

const TRANSFER_FEE = 5000;

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

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

export default function ReviewInformation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, nextOwnerInfo, vehicleInfo, currentOwner } = location.state || {};

  const [confirmed, setConfirmed] = useState(false);
  const [initiateTransferPayment, { isLoading }] = useInitiateTransferPaymentMutation();

  const handleProceedToPayment = async () => {
    if (!confirmed) { toast.error('Please confirm the information to proceed.'); return; }
    if (!requestId) {
      toast.error('Request ID not found. Please start from the beginning.');
      navigate('/app/change-ownership/enter-cert-no');
      return;
    }

    try {
      const result = await initiateTransferPayment({
        requestId,
        data: { request_id: requestId, amount: TRANSFER_FEE },
      }).unwrap();

      if (result.success && result.paymentUrl) {
        toast.success('Redirecting to payment…');
        window.location.href = result.paymentUrl;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/change-ownership/next-owner-info', { state: location.state })}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={4} />
          <h2 className="text-lg font-bold text-white">Review & Pay</h2>
          <p className="text-sm text-slate-400 mt-1">
            Check your details carefully before proceeding to payment.
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Vehicle info */}
          {vehicleInfo && (
            <SectionCard title="Vehicle Information">
              <InfoRow label="Make"      value={vehicleInfo.make} />
              <InfoRow label="Model"     value={vehicleInfo.model} />
              <InfoRow label="Year"      value={vehicleInfo.year} />
              <InfoRow label="Colour"    value={vehicleInfo.color} />
              <InfoRow label="Plate No." value={vehicleInfo.plate_number} />
              <InfoRow label="VIN"       value={vehicleInfo.vin} />
            </SectionCard>
          )}

          {/* Current owner */}
          {currentOwner && (
            <SectionCard title="Current Owner">
              <InfoRow label="Name"  value={currentOwner.name} />
              <InfoRow label="Phone" value={currentOwner.phone} />
              <InfoRow label="Email" value={currentOwner.email} />
            </SectionCard>
          )}

          {/* New owner */}
          {nextOwnerInfo && (
            <SectionCard title="New Owner">
              <InfoRow label="Name"    value={nextOwnerInfo.ownerName} />
              <InfoRow label="Address" value={nextOwnerInfo.ownerAddress} />
              <InfoRow label="Phone"   value={nextOwnerInfo.phone} />
              <InfoRow label="Email"   value={nextOwnerInfo.email} />
            </SectionCard>
          )}

          {/* Payment summary */}
          <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-sage-700" />
              <p className="text-sm font-semibold text-sage-800">Payment Summary</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Transfer Fee</span>
              <span className="text-lg font-bold text-slate-900">
                ₦{TRANSFER_FEE.toLocaleString()}
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
            onClick={handleProceedToPayment}
            disabled={!confirmed || isLoading}
            className="w-full"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Redirecting…' : `Pay ₦${TRANSFER_FEE.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </main>
  );
}
