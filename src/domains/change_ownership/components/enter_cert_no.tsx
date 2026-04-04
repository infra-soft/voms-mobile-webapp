import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Stepper, FormHelpText, Button } from '@/shared/components/ui';
import { certificateValidationSchema, type CertificateValidation } from '../../../shared/utils';
import { useVerifyCertificateMutation } from '../../certificate_request/api';

const STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

export default function EnterCertNo() {
  const navigate = useNavigate();
  const [verifyCertificate, { isLoading }] = useVerifyCertificateMutation();

  const handleSubmit = async (values: CertificateValidation) => {
    try {
      const result = await verifyCertificate({
        certificate_number: values.certificateNo,
      }).unwrap();

      if (result.success === true) {
        toast.success('Certificate validated successfully!');
        navigate('/app/change-ownership/vehicle-information', {
          state: {
            certificateNo: values.certificateNo,
            requestId: result.requestId,
            currentOwner: result.currentOwner,
            vehicleInfo: result.vehicleInfo,
            fullResponse: result,
          },
        });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to verify certificate. Please try again.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/select-option')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={1} />
          <h2 className="text-lg font-bold text-white">Enter Certificate Number</h2>
          <p className="text-sm text-slate-400 mt-1">
            Provide your VOMS Proof of Ownership certificate number to get started.
          </p>
        </div>

        <Formik
          initialValues={{ certificateNo: '' }}
          validationSchema={certificateValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="px-6 py-6 space-y-5">
              <div>
                <label htmlFor="certificateNo" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Certificate Number
                </label>
                <Field
                  id="certificateNo"
                  name="certificateNo"
                  type="text"
                  placeholder="e.g. VOMS-2024-001234"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-700/20"
                />
                <ErrorMessage name="certificateNo">
                  {(msg) => <FormHelpText error>{msg}</FormHelpText>}
                </ErrorMessage>
                {!errors.certificateNo && (
                  <FormHelpText>
                    The certificate number is printed on your paper Proof of Ownership document.
                  </FormHelpText>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoading}
                className="w-full"
              >
                {isSubmitting || isLoading ? 'Validating…' : 'Validate Certificate'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
