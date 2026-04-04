import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { OtpInput, FormHelpText, Stepper, Button } from '@/shared/components/ui';
import { useVerifyTransferOtpMutation } from '../../certificate_request/api';

const STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, otpMethod, currentOwner } = location.state || {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifyTransferOtp, { isLoading }] = useVerifyTransferOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setError('');

    if (!requestId) {
      toast.error('Request ID not found. Please start from the beginning.');
      navigate('/app/change-ownership/enter-cert-no');
      return;
    }

    try {
      const result = await verifyTransferOtp({ requestId, data: { request_id: requestId, otp } }).unwrap();
      if (result.success) {
        toast.success(result.message || 'OTP verified successfully!');
        navigate('/app/change-ownership/next-owner-info', {
          state: {
            requestId,
            certificateNo: location.state?.certificateNo,
            vehicleInfo: location.state?.vehicleInfo,
            currentOwner: location.state?.currentOwner,
            otpMethod,
            otpVerified: true,
            otpVerificationResponse: result,
          },
        });
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.');
        setError('Incorrect OTP — please check and try again.');
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to verify OTP.';
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/change-ownership/review-information')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={5} />
          <h2 className="text-lg font-bold text-white">Verify OTP</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter the 6-digit code sent to the current owner via{' '}
            <span className="text-white">{otpMethod || 'email/SMS'}</span>.
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Current owner info */}
          {currentOwner && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">OTP sent to</p>
              <p className="text-sm font-medium text-slate-900">{currentOwner.name}</p>
              {otpMethod === 'email' && currentOwner.email && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {currentOwner.email}
                </p>
              )}
              {otpMethod === 'sms' && currentOwner.phone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {currentOwner.phone}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP boxes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4 text-center">
                Enter 6-digit code
              </label>
              <OtpInput value={otp} onChange={(v: string) => { setOtp(v); setError(''); }} length={6} />
              {error ? (
                <div className="mt-3 flex justify-center">
                  <FormHelpText error>{error}</FormHelpText>
                </div>
              ) : (
                <div className="mt-3 flex justify-center">
                  <FormHelpText>Check your {otpMethod === 'email' ? 'inbox' : 'SMS messages'} for the code.</FormHelpText>
                </div>
              )}
            </div>

            {/* Resend hint */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-700">
                Didn't receive the code? Go back and resend via{' '}
                {otpMethod === 'email' ? 'SMS' : 'email'}, or contact support.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={otp.length < 6 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Verifying…' : 'Verify OTP'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
