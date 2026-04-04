import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Stepper, Button } from '@/shared/components/ui';
import { useSendTransferOtpMutation } from '../../certificate_request/api';

const STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

export default function VehicleInformation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { certificateNo, requestId, currentOwner, vehicleInfo, fullResponse } = location.state || {};

  const displayVehicleInfo = vehicleInfo || fullResponse?.vehicleInfo || {};
  const ownerInfo = currentOwner || fullResponse?.currentOwner || {};
  const transferRequestId = requestId || fullResponse?.requestId;
  const certificateNumber = certificateNo || 'N/A';

  const [confirmed, setConfirmed] = useState(false);
  const [sendTransferOtp, { isLoading: isSendingOtp }] = useSendTransferOtpMutation();

  const handleSendOtp = async (method: 'email' | 'sms') => {
    if (!confirmed) {
      toast.error('Please confirm the vehicle information to continue.');
      return;
    }
    if (!transferRequestId) {
      toast.error('Request ID not found. Please start from the beginning.');
      navigate('/app/change-ownership/enter-cert-no');
      return;
    }

    try {
      const result = await sendTransferOtp({
        requestId: transferRequestId,
        data: { request_id: transferRequestId, method },
      }).unwrap();

      if (result.success) {
        toast.success(result.message || `OTP sent to current owner's ${method}.`);
        navigate('/app/change-ownership/verify-otp', {
          state: {
            certificateNo: certificateNumber,
            vehicleInfo: displayVehicleInfo,
            currentOwner: ownerInfo,
            requestId: transferRequestId,
            otpMethod: method,
            otpSendResponse: result,
          },
        });
      } else {
        toast.error(result.message || `Failed to send OTP via ${method}.`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to send OTP via ${method}. Please try again.`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/change-ownership/enter-cert-no')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={2} />
          <h2 className="text-lg font-bold text-white">Vehicle Information</h2>
          <p className="text-sm text-slate-400 mt-1">
            Confirm this is the correct vehicle before proceeding.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Vehicle details */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Certificate · {certificateNumber}
              </p>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Make"       value={displayVehicleInfo?.make} />
              <InfoRow label="Model"      value={displayVehicleInfo?.model} />
              <InfoRow label="Year"       value={displayVehicleInfo?.year} />
              <InfoRow label="Colour"     value={displayVehicleInfo?.color} />
              <InfoRow label="Plate No."  value={displayVehicleInfo?.plate_number} />
              <InfoRow label="VIN"        value={displayVehicleInfo?.vin} />
            </div>
          </div>

          {/* Current owner */}
          {ownerInfo && Object.keys(ownerInfo).length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Owner</p>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Name"  value={ownerInfo?.name} />
                <InfoRow label="Phone" value={ownerInfo?.phone} />
                <InfoRow label="Email" value={ownerInfo?.email} />
              </div>
            </div>
          )}

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
              This is the correct vehicle and certificate to be processed.
            </span>
          </button>

          {/* Send OTP */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Send OTP to Current Owner
            </p>
            <Button
              variant="primary"
              onClick={() => handleSendOtp('email')}
              disabled={!confirmed || isSendingOtp}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSendingOtp ? 'Sending…' : 'Send OTP via Email'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
