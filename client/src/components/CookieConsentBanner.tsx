import React, { useState } from "react";

interface CookieConsentBannerProps {
  onOpenCookieSettings: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenCookieSettings,
  onSuccessToast,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem("vroom_cookie_consent"));
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        "vroom_cookie_consent",
        JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: true,
          preferences: true,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
    setIsDismissed(true);
    if (onSuccessToast) {
      onSuccessToast("Cookie preferences saved.");
    }
  };

  const handleDeclineNonEssential = () => {
    try {
      localStorage.setItem(
        "vroom_cookie_consent",
        JSON.stringify({
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
    setIsDismissed(true);
    if (onSuccessToast) {
      onSuccessToast("Only necessary cookies are active now.");
    }
  };

  return (
    <div className="cookie-consent-bar" role="region" aria-label="Cookie choices">
      <div className="cookie-consent-wrap">
        <div className="cookie-text-col">
          <p className="cookie-message">
            Some cookies keep your bag and sign-in working. Others tell us which pages people actually read.
            You decide which of those we keep, under the NDPR and GDPR.
          </p>
        </div>

        <div className="cookie-buttons-col">
          <button type="button" className="cookie-btn-primary" onClick={handleAcceptAll}>
            Accept all
          </button>
          <button
            type="button"
            className="cookie-btn-secondary"
            onClick={handleDeclineNonEssential}
          >
            Necessary only
          </button>
          <button type="button" className="cookie-btn-link" onClick={onOpenCookieSettings}>
            Choose individually
          </button>
        </div>
      </div>
    </div>
  );
};
