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
      onSuccessToast("Cookie preferences saved (All accepted).");
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
      onSuccessToast("Only strictly necessary cookies remain active.");
    }
  };

  return (
    <div className="cookie-consent-bar" role="region" aria-label="Cookie consent banner">
      <div className="cookie-consent-wrap">
        <div className="cookie-text-col">
          <span className="cookie-icon">🍪</span>
          <p className="cookie-message">
            We use essential and personalization cookies pursuant to the <strong>Nigeria Data Protection Regulation (NDPR)</strong> and <strong>GDPR</strong> to safeguard your browsing experience, remember bag items, and measure speed.
          </p>
        </div>

        <div className="cookie-buttons-col">
          <button
            type="button"
            className="cookie-btn-link"
            onClick={onOpenCookieSettings}
          >
            Manage Preferences
          </button>
          <button
            type="button"
            className="cookie-btn-secondary"
            onClick={handleDeclineNonEssential}
          >
            Essential Only
          </button>
          <button
            type="button"
            className="cookie-btn-primary"
            onClick={handleAcceptAll}
          >
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
};
