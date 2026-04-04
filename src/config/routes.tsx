import {
  ErrorFallback,
  ProtectedRoute,
  RootLayout,
} from "../shared/components";
import { SelectOptionView } from "../domains/auth/views/select_option.view";
import PresentationView from "../domains/auth/views/presentation.view";
import { createBrowserRouter } from "react-router-dom";
import { CertificateView } from "../domains/certificate_request/views";
import { AuthLayout } from "../shared/components/layouts/auth.layout";
import EnterVin from "../domains/certificate_request/components/migration_enter_vin";
import VinInformation from "../domains/certificate_request/components/vin_info";
import AdditionalInformation from "../domains/certificate_request/components/additional_info";
import UploadDocument from "../domains/certificate_request/components/upload_document";
import InformationSummary from "../domains/certificate_request/components/info_summary";
import PaymentCallback from "../domains/certificate_request/components/payment_callback";
import RequestStatusTracker from "../domains/certificate_request/components/RequestStatusTracker";
import { ChangeOwnershipView } from "../domains/change_ownership/views/change_ownership.view";
import EnterCertNo from "../domains/change_ownership/components/enter_cert_no";
import VehicleInformation from "../domains/change_ownership/components/vehicle_info";
import NextOwnerInformation from "../domains/change_ownership/components/next_owner_info";
import ReviewInformation from "../domains/change_ownership/components/review_info";
import VerifyOtp from "../domains/change_ownership/components/verify_otp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <PresentationView /> },
      { path: "presentation", element: <PresentationView /> },
      { path: "select-option", element: <SelectOptionView /> },
    ],
  },
  {
    path: "/payment/callback",
    element: <PaymentCallback />,
    errorElement: <ErrorFallback />,
  },
  {
    path: "/track",
    element: <RequestStatusTracker />,
    errorElement: <ErrorFallback />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
      {
        path: "certificate-request",
        element: <CertificateView />,
        children: [
          { path: "enter-vin", element: <EnterVin /> },
          { path: "vin-information", element: <VinInformation /> },
          { path: "addtional-information", element: <AdditionalInformation /> },
          { path: "upload-documents", element: <UploadDocument /> },
          { path: "information-summary", element: <InformationSummary /> },
        ],
      },
      {
        path: "change-ownership",
        element: <ChangeOwnershipView />,
        children: [
          { path: "enter-cert-no", element: <EnterCertNo /> },
          { path: "vehicle-information", element: <VehicleInformation /> },
          { path: "next-owner-info", element: <NextOwnerInformation /> },
          { path: "review-information", element: <ReviewInformation /> },
          { path: "verify-otp", element: <VerifyOtp /> },
        ],
      },
    ],
  },
]);

export default router;
