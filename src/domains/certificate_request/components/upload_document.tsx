import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { Formik, Form } from "formik";
import { documentUploadSchema, type DocumentUpload } from "../../../shared/utils";
import { useUploadMigrationCertificateMutation } from "../api";
import { FileUpload } from "../../../shared/components/common/file_input";
import { Stepper, Button } from "@/shared/components/ui";

const STEPS = [
  { label: 'Service' },
  { label: 'Enter VIN' },
  { label: 'VIN Info' },
  { label: 'Extra Info' },
  { label: 'Upload' },
  { label: 'Summary' },
];

export default function UploadDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, vin, vehicleInfo, additionalInfo } = location.state || {};

  const [uploadCertificate, { isLoading: isUploading }] = useUploadMigrationCertificateMutation();

  const initialValues: DocumentUpload = {
    supportingDocument: null as unknown as File,
  };

  const handleSubmit = async (values: DocumentUpload) => {
    if (!requestId) {
      toast.error("Request ID not found. Please start from the beginning.");
      navigate("/app/certificate-request/enter-vin");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('certificate', values.supportingDocument);
      const result = await uploadCertificate({ requestId, file: formData }).unwrap();
      if (result.success) {
        toast.success("Document uploaded successfully!");
        navigate("/app/certificate-request/information-summary", {
          state: { requestId, vin, vehicleInfo, additionalInfo, uploadedFile: result.data?.file_url },
        });
      } else {
        toast.error(result.message || "Failed to upload document");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload document. Please try again.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[720px] px-4">
      <button
        onClick={() => navigate('/app/certificate-request/addtional-information')}
        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <Stepper steps={STEPS} current={4} />
          <h2 className="text-lg font-bold text-white">Upload Certificate</h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload your current Proof of Ownership certificate.
          </p>
        </div>

        <div className="px-6 py-6">
          <Formik
            initialValues={initialValues}
            validationSchema={documentUploadSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form className="space-y-6">

                {/* Hint */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Upload className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Accepted formats</p>
                    <p className="text-xs text-slate-500 mt-0.5">JPG, JPEG, PNG or PDF — max 10 MB</p>
                  </div>
                </div>

                <FileUpload
                  onFileSelected={(file) => setFieldValue("supportingDocument", file)}
                  allowedFormats={["jpg", "jpeg", "png", "pdf"]}
                />

                {errors.supportingDocument && touched.supportingDocument && (
                  <p className="text-sm text-red-600">
                    {typeof errors.supportingDocument === "string"
                      ? errors.supportingDocument
                      : JSON.stringify(errors.supportingDocument)}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isUploading}
                  className="w-full"
                >
                  {isSubmitting || isUploading ? "Uploading…" : "Continue"}
                </Button>

              </Form>
            )}
          </Formik>
        </div>
      </div>
    </main>
  );
}
