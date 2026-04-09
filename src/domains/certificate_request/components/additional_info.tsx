import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { additionalInfoSchema, type AdditionalInfo } from "../../../shared/utils";
import { useSubmitMigrationInfoMutation } from "../api";
import { lgas } from "../data";
import { Stepper, Button, FormHelpText } from "@/shared/components/ui";

const STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

interface AdditionalInfoForm extends Omit<AdditionalInfo, 'issuedDate'> {
  issuedDate: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-700/20 disabled:bg-slate-50";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function AdditionalInformation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vin, vehicleInfo, requestId } = location.state || {};

  const [submitMigrationInfo, { isLoading: isSubmittingInfo }] = useSubmitMigrationInfoMutation();

  const handleSubmit = async (values: AdditionalInfoForm) => {
    try {
      const result = await submitMigrationInfo({
        requestId,
        data: {
          request_id: requestId,
          state: values.state,
          lga_id: values.lga,
          certificate_number: values.certificateNo,
          issue_date: values.issuedDate,
          plate_number: values.plateNo,
          purpose: values.purpose,
          owner_name: values.ownerName,
          owner_address: values.ownerAddress,
          engine_number: values.engineNo,
          title: values.title,
          telephone: values.phone,
          email: values.email,
        },
      }).unwrap();

      if (result.success) {
        toast.success("Information saved successfully!");
        navigate("/app/certificate-request/upload-documents", {
          state: { requestId, vin, vehicleInfo, additionalInfo: values, submissionResponse: result },
        });
      } else {
        toast.error(result.message || "Failed to save information");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save information. Please try again.");
    }
  };

  const initialValues: AdditionalInfoForm = {
    state: "", lga: "", certificateNo: "", issuedDate: "",
    plateNo: "", purpose: "", ownerName: "", ownerAddress: "",
    make: "", model: "", engineNo: "", chassisNo: "",
    title: "", phone: "", email: "",
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/certificate-request/vin-information')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={3} />
          <h2 className="text-lg font-bold text-white">Additional Information</h2>
          <p className="text-sm text-slate-400 mt-1">
            Provide details as shown on your current Proof of Ownership Certificate.
          </p>
        </div>

        <div className="px-6 py-6">
          <Formik
            initialValues={initialValues}
            validationSchema={additionalInfoSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-4">

                {/* State & LGA */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>State</label>
                    <select name="state" value={values.state} onChange={handleChange} onBlur={handleBlur} className={inputClass}>
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                    </select>
                    <ErrorMessage name="state">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>LGA</label>
                    <select name="lga" value={values.lga} onChange={handleChange} onBlur={handleBlur} className={inputClass}>
                      <option value="">Select LGA</option>
                      {lgas.map((lga) => <option key={lga.id} value={lga.id}>{lga.name}</option>)}
                    </select>
                    <ErrorMessage name="lga">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                {/* Certificate No. & Issue Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Certificate No.</label>
                    <Field name="certificateNo" placeholder="e.g. CERT-2023-12345" className={inputClass} />
                    <ErrorMessage name="certificateNo">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>Issue Date</label>
                    <Field name="issuedDate" type="date" className={inputClass} />
                    <ErrorMessage name="issuedDate">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                {/* Plate No. & Purpose */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Plate No.</label>
                    <Field name="plateNo" placeholder="e.g. ABC-123-DE" className={inputClass} />
                    <ErrorMessage name="plateNo">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>Purpose</label>
                    <Field name="purpose" placeholder="e.g. Proof of Ownership" className={inputClass} />
                    <ErrorMessage name="purpose">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                {/* Title & Owner Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <Field name="title" placeholder="e.g. Mr, Mrs, Dr" className={inputClass} />
                    <ErrorMessage name="title">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>Owner Name</label>
                    <Field name="ownerName" placeholder="Full name" className={inputClass} />
                    <ErrorMessage name="ownerName">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                {/* Owner Address */}
                <div>
                  <label className={labelClass}>Owner Address</label>
                  <Field name="ownerAddress" placeholder="Full address" className={inputClass} />
                  <ErrorMessage name="ownerAddress">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <Field name="phone" placeholder="+2348012345678" className={inputClass} />
                    <ErrorMessage name="phone">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <Field name="email" type="email" placeholder="you@example.com" className={inputClass} />
                    <ErrorMessage name="email">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                {/* Engine No. & Chassis No. */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Engine No.</label>
                    <Field name="engineNo" placeholder="Engine number" className={inputClass} />
                    <ErrorMessage name="engineNo">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                  <div>
                    <label className={labelClass}>Chassis No.</label>
                    <Field name="chassisNo" placeholder="Chassis number" className={inputClass} />
                    <ErrorMessage name="chassisNo">{(m) => <FormHelpText error>{m}</FormHelpText>}</ErrorMessage>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isSubmittingInfo}
                  className="w-full mt-2"
                >
                  {isSubmitting || isSubmittingInfo ? "Saving…" : "Continue"}
                </Button>

              </Form>
            )}
          </Formik>
        </div>
      </div>
    </main>
  );
}
