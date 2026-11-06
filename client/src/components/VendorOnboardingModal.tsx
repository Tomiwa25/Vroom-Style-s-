import React from "react";
import { VendorPortalModal } from "./VendorPortalModal";

interface VendorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

/**
 * Backwards-compatible onboarding modal forwarding to the comprehensive VendorPortalModal.
 */
export const VendorOnboardingModal: React.FC<VendorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  return (
    <VendorPortalModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab="onboarding"
      onSuccessToast={onSuccessToast}
    />
  );
};
