import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { vinValidationSchema, type VinValidation } from '../../../shared/utils';
import { useVerifyVinMutation } from '../api';
import { Stepper, FormHelpText } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';

const STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

export default function EnterVin() {
  const navigate = useNavigate();
  const [verifyVin, { isLoading }] = useVerifyVinMutation();

  const handleSubmit = async (values: VinValidation) => {
    try {
      const result = await verifyVin({ vin: values.vin }).unwrap();
      if (result?.success || result?.data) {
        toast.success('VIN validated successfully!');
        navigate('/app/certificate-request/vin-information', {
          state: { vin: values.vin, vehicleInfo: result.data?.vehicleInfo || result.data, fullResponse: result },
        });
      } else {
        toast.error(result?.message || 'VIN validation failed');
      }
    } catch (error: any) {
      if (error?.status === 404) toast.error('VIN not found in the system');
      else if (error?.status === 400) toast.error(error?.data?.message || 'Invalid VIN format');
      else if (error?.status === 500) toast.error('Server error. Please try again later.');
      else toast.error(error?.data?.message || 'Failed to verify VIN. Please try again.');
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
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={1} />
          <h2 className="text-lg font-bold text-white">Enter VIN</h2>
          <p className="text-sm text-slate-400 mt-1">
            Provide your Vehicle Identification Number to look up your vehicle.
          </p>
        </div>

        <div className="px-6 py-6">
          <Formik initialValues={{ vin: '' }} validationSchema={vinValidationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-5">
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vehicle Identification Number (VIN)
                  </label>
                  <Field
                    id="vin"
                    name="vin"
                    type="text"
                    placeholder="e.g. 1HGBH41JXMN109186"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-700/20 disabled:bg-slate-50"
                  />
                  <ErrorMessage name="vin">
                    {(msg) => <FormHelpText error>{msg}</FormHelpText>}
                  </ErrorMessage>
                  {!(errors.vin && touched.vin) && (
                    <FormHelpText>
                      Your 17-character VIN is printed on your existing certificate and on the dashboard of your vehicle.
                    </FormHelpText>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isLoading}
                  className="w-full"
                >
                  {isSubmitting || isLoading ? 'Validating…' : 'Validate VIN'}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </main>
  );
}
