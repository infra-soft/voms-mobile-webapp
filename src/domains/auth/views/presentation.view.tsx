import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText, RefreshCw } from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Certificate Migration',
    body: 'Convert your existing paper Proof of Ownership to the new digital certificate.',
  },
  {
    icon: RefreshCw,
    title: 'Change of Ownership',
    body: 'Seamlessly transfer vehicle ownership with OTP-verified consent.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Verified',
    body: 'Government-backed digital records with QR code verification.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function PresentationView() {
  const navigate = useNavigate();

  return (
    <motion.main
      className="mx-auto w-full max-w-2xl px-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero */}
      <motion.section variants={item} className="text-center py-8">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 mb-5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Official Government Portal
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Vehicle Ownership <br />
          <span className="text-sage-400">Management System</span>
        </h1>

        <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
          Your one-stop portal for digital Proof of Ownership Certificates and
          seamless vehicle ownership transfers.
        </p>

        <button
          onClick={() => navigate('/select-option')}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sage-700 hover:bg-sage-800 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.section>

      {/* Feature cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-white/10 bg-white/8 backdrop-blur-sm px-4 py-5 text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-700/20 border border-sage-700/30">
                <Icon className="h-5 w-5 text-sage-400" />
              </div>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{title}</p>
            <p className="text-xs text-white/60 leading-relaxed">{body}</p>
          </div>
        ))}
      </motion.div>
    </motion.main>
  );
}
