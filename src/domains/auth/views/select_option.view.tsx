import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, RefreshCw } from 'lucide-react';
import { Stepper } from '@/shared/components/ui';

// Steps for the full certificate-migration flow (shown at the top)
const CERT_STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

const OWNERSHIP_STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

const SelectOptionView = () => {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      {/* Back */}
      <button
        onClick={() => navigate('/presentation')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Step 1 of 6</p>
          <h2 className="text-lg font-bold text-white">Choose a Service</h2>
          <p className="text-sm text-slate-400 mt-1">Select the service you need to proceed.</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Certificate Migration option */}
          <ServiceCard
            icon={FileText}
            title="Certificate Migration"
            description="Convert your existing paper Proof of Ownership Certificate to the new digital format."
            steps={CERT_STEPS}
            onClick={() => navigate('/app/certificate-request/enter-vin')}
          />

          {/* Change of Ownership option */}
          <ServiceCard
            icon={RefreshCw}
            title="Change of Vehicle Ownership"
            description="Transfer vehicle ownership to a new owner after a sale or gift, with OTP-verified consent."
            steps={OWNERSHIP_STEPS}
            onClick={() => navigate('/app/change-ownership/enter-cert-no')}
          />
        </div>
      </div>
    </main>
  );
};

// ── Service option card ───────────────────────────────────────────────────────

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  steps: { label: string }[];
  onClick: () => void;
}

function ServiceCard({ icon: Icon, title, description, steps, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border-2 border-slate-200 hover:border-sage-700 hover:shadow-md transition-all p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sage-50 border border-sage-200 group-hover:bg-sage-100 transition-colors">
            <Icon className="h-5 w-5 text-sage-700" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-sage-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 leading-snug">{description}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-sage-700 transition-colors mt-1" />
      </div>

      {/* Mini stepper preview */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {steps.length} steps
        </p>
        <Stepper steps={steps} current={0} />
      </div>
    </button>
  );
}

export { SelectOptionView };
