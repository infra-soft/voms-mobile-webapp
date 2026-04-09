import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Stepper, Button } from "@/shared/components/ui";

const STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right break-words">{value}</span>
    </div>
  );
}

export default function VinInformation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vin, vehicleInfo, fullResponse } = location.state || {};

  const displayVehicleInfo = vehicleInfo || fullResponse?.vehicleInfo || {};
  const displayVin = vin || fullResponse?.vin || 'N/A';

  const [checkboxes, setCheckboxes] = useState({
    correctVehicle: false,
    isOwner: false,
  });

  useEffect(() => {
    if (!displayVin || displayVin === 'N/A') {
      toast.error("No VIN information available");
      navigate("/app/certificate-request/enter-vin");
    }
  }, [displayVin, navigate]);

  const handleCheckboxChange = (field: string) => {
    setCheckboxes((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handleContinue = () => {
    if (!checkboxes.correctVehicle || !checkboxes.isOwner) {
      toast.error("Please confirm both statements to continue");
      return;
    }
    navigate("/app/certificate-request/addtional-information", {
      state: {
        vin: displayVin,
        vehicleInfo: displayVehicleInfo,
        fullResponse,
        requestId: fullResponse?.requestId,
      },
    });
  };

  const allValid = checkboxes.correctVehicle && checkboxes.isOwner;

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/certificate-request/enter-vin')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={2} />
          <h2 className="text-lg font-bold text-white">VIN Information</h2>
          <p className="text-sm text-slate-400 mt-1">
            Please verify the vehicle information below is correct.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Success banner */}
          {fullResponse?.success && (
            <div className="flex items-center gap-2 rounded-xl bg-sage-50 border border-sage-200 px-4 py-3">
              <CheckCircle className="h-4 w-4 text-sage-700 flex-shrink-0" />
              <p className="text-sm font-medium text-sage-800">VIN verified successfully</p>
            </div>
          )}

          {/* Vehicle info card */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Vehicle Details</p>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="VIN" value={displayVin} />
              <InfoRow label="Make" value={displayVehicleInfo?.make} />
              <InfoRow label="Model" value={displayVehicleInfo?.model} />
              <InfoRow label="Year" value={String(displayVehicleInfo?.year ?? '')} />
              <InfoRow label="Color" value={displayVehicleInfo?.color} />
              <InfoRow label="Vehicle Type" value={displayVehicleInfo?.vehicle_type ?? displayVehicleInfo?.type} />
            </div>
          </div>

          {/* Confirmation checkboxes */}
          <div className="space-y-3">
            {[
              { key: 'correctVehicle', label: 'This is the correct vehicle to be processed.' },
              { key: 'isOwner', label: 'I am the owner of this vehicle or the authorised representative of the owner.' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCheckboxChange(key)}
                className={`flex items-start gap-3 w-full text-left rounded-xl border-2 px-4 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 ${
                  checkboxes[key as keyof typeof checkboxes]
                    ? 'border-sage-700 bg-sage-50'
                    : 'border-slate-200 hover:border-sage-400'
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  checkboxes[key as keyof typeof checkboxes]
                    ? 'border-sage-700 bg-sage-700'
                    : 'border-slate-300 bg-white'
                }`}>
                  {checkboxes[key as keyof typeof checkboxes] && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-slate-700">{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!allValid}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
