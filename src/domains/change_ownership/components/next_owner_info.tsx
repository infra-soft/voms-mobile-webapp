import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Stepper, FormHelpText, Button } from '@/shared/components/ui';
import { nextOwnerInfoSchema, type NextOwnerInfo } from '../../../shared/utils';
import { useSubmitTransferInfoMutation } from '../../certificate_request/api';

const STEPS = [
  { label: 'Service' },
  { label: 'Cert No.' },
  { label: 'Vehicle' },
  { label: 'New Owner' },
  { label: 'Review' },
  { label: 'OTP' },
];

const fields: { name: keyof NextOwnerInfo; label: string; placeholder: string; type?: string }[] = [
  { name: 'ownerName',    label: 'Full Name',    placeholder: 'Name of new owner' },
  { name: 'ownerAddress', label: 'Address',      placeholder: 'Residential or business address' },
  { name: 'phone',        label: 'Phone Number', placeholder: 'e.g. 08012345678' },
  { name: 'email',        label: 'Email',        placeholder: 'email@example.com', type: 'email' },
];

export default function NextOwnerInformation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { certificateNo, vehicleInfo, currentOwner, requestId } = location.state || {};

  const [submitTransferInfo, { isLoading }] = useSubmitTransferInfoMutation();

  const handleSubmit = async (values: NextOwnerInfo) => {
    if (!requestId) {
      toast.error('Request ID not found. Please start from the beginning.');
      navigate('/app/change-ownership/enter-cert-no');
      return;
    }

    try {
      const result = await submitTransferInfo({
        requestId,
        data: {
          request_id: requestId,
          new_owner_name: values.ownerName,
          new_owner_address: values.ownerAddress,
          new_owner_phone: values.phone,
          new_owner_email: values.email,
        },
      }).unwrap();

      if (result.success) {
        toast.success(result.message || 'Transfer information submitted successfully!');
        navigate('/app/change-ownership/review-information', {
          state: {
            certificateNo,
            vehicleInfo,
            currentOwner,
            requestId,
            nextOwnerInfo: values,
            transferResponse: result,
          },
        });
      } else {
        toast.error(result.message || 'Failed to submit transfer information.');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit transfer information. Please try again.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/change-ownership/vehicle-information', { state: location.state })}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={3} />
          <h2 className="text-lg font-bold text-white">New Owner Information</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter the details of the person or organisation this vehicle is being transferred to.
          </p>
        </div>

        <Formik
          initialValues={{ ownerName: '', ownerAddress: '', phone: '', email: '' }}
          validationSchema={nextOwnerInfoSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="px-6 py-6 space-y-4">
              {fields.map(({ name, label, placeholder, type = 'text' }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                  </label>
                  <Field
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-700/20"
                  />
                  <ErrorMessage name={name}>
                    {(msg) => <FormHelpText error>{msg}</FormHelpText>}
                  </ErrorMessage>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isLoading}
                  className="w-full"
                >
                  {isSubmitting || isLoading ? 'Submitting…' : 'Continue'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
