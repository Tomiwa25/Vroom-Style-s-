import React, { useState } from "react";
import { detectUserOS, getAppStoreConfig, type UserOS } from "../utils/device";

interface AppSmartBannerProps {
  onOpenAppModal?: () => void;
}

export const AppSmartBanner: React.FC<AppSmartBannerProps> = ({ onOpenAppModal }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("vroom_smart_banner_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const detectedOS: UserOS = detectUserOS();
  const config = getAppStoreConfig(detectedOS);

  if (isDismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("vroom_smart_banner_dismissed", "true");
    } catch {
      // ignore
    }
    setIsDismissed(true);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    if (detectedOS === "desktop") {
      e.preventDefault();
      if (onOpenAppModal) {
        onOpenAppModal();
      } else {
        setShowQrModal(true);
      }
    } else {
      window.open(config.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  const actionLabel =
    detectedOS === "ios" ? "Get it on the App Store" : detectedOS === "android" ? "Get it on Google Play" : "Get the app";

  return (
    <>
      <div className={`smart-app-banner os-${detectedOS}`} role="banner" aria-label="Vroom Style(s) mobile app">
        <div className="smart-banner-wrap">
          <p className="smart-banner-info">
            <span className="smart-app-name">Vroom Style(s) for {detectedOS === "android" ? "Android" : "iPhone"}</span>
            <span className="smart-app-meta">{config.ratingText}</span>
          </p>

          <a
            href={config.downloadUrl}
            onClick={handleActionClick}
            className="smart-banner-action-btn"
            target={detectedOS === "desktop" ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            {actionLabel}
            <span aria-hidden="true">→</span>
          </a>

          <button
            type="button"
            className="smart-banner-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss app banner"
          >
            Dismiss
          </button>
        </div>
      </div>

      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div
            className="modal-card app-download-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-download-title"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowQrModal(false)}
              aria-label="Close app dialog"
            >
              Close
            </button>

            <div className="app-download-content">
              <div className="app-modal-header">
                <h3 id="app-download-title">Scan this to install Vroom Style(s)</h3>
                <p>
                  Point your phone camera at the code. It opens the App Store or Google Play, whichever your
                  device uses.
                </p>
              </div>

              <div className="qr-scan-block">
                <svg viewBox="0 0 100 100" width="132" height="132" role="img" aria-label="App download QR code">
                  <rect width="100" height="100" fill="#ffffff" />

                  <rect x="8" y="8" width="25" height="25" fill="#0f172a" />
                  <rect x="13" y="13" width="15" height="15" fill="#ffffff" />
                  <rect x="18" y="18" width="5" height="5" fill="#0f172a" />

                  <rect x="67" y="8" width="25" height="25" fill="#0f172a" />
                  <rect x="72" y="13" width="15" height="15" fill="#ffffff" />
                  <rect x="77" y="18" width="5" height="5" fill="#0f172a" />

                  <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                  <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                  <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

                  <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="50" y="18" width="8" height="5" fill="#0f172a" />
                  <rect x="42" y="26" width="12" height="6" fill="#0f172a" />
                  <rect x="12" y="42" width="6" height="12" fill="#0f172a" />
                  <rect x="25" y="45" width="8" height="8" fill="#0f172a" />
                  <rect x="40" y="40" width="20" height="20" fill="#0f172a" />
                  <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                  <rect x="48" y="48" width="4" height="4" fill="#0f172a" />
                  <rect x="66" y="42" width="10" height="6" fill="#0f172a" />
                  <rect x="78" y="48" width="12" height="8" fill="#0f172a" />
                  <rect x="42" y="66" width="6" height="14" fill="#0f172a" />
                  <rect x="54" y="70" width="10" height="6" fill="#0f172a" />
                  <rect x="68" y="68" width="8" height="8" fill="#0f172a" />
                  <rect x="80" y="75" width="10" height="10" fill="#0f172a" />
                </svg>
                <span className="qr-scan-hint">Open your camera app and hold it over the code</span>
              </div>

              <dl className="app-perks-list">
                <div className="app-perk-item">
                  <dt>Early access</dt>
                  <dd>Friday drops appear in the app two hours before they reach the web catalogue.</dd>
                </div>
                <div className="app-perk-item">
                  <dt>Delivery on your lock screen</dt>
                  <dd>Follow the rider who is carrying your parcel, live.</dd>
                </div>
                <div className="app-perk-item">
                  <dt>₦5,000 credit</dt>
                  <dd>Applied to your first order placed inside the app.</dd>
                </div>
              </dl>

              <div className="store-buttons-row">
                <a
                  href="https://apps.apple.com/app/vroom-styles/id6478912345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-download-btn"
                >
                  <div className="store-btn-text">
                    <small>Download on the</small>
                    <strong>App Store</strong>
                  </div>
                </a>

                <a
                  href="https://play.google.com/store/apps/details?id=com.vroomstyles.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-download-btn"
                >
                  <div className="store-btn-text">
                    <small>Get it on</small>
                    <strong>Google Play</strong>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
