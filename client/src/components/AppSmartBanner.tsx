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
      // On mobile devices, redirect directly to App Store / Google Play
      window.open(config.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className={`smart-app-banner os-${detectedOS}`} role="banner" aria-label="Mobile app download banner">
        <div className="smart-banner-wrap">
          {/* Dismiss button */}
          <button
            type="button"
            className="smart-banner-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss app banner"
          >
            ✕
          </button>

          {/* App Icon */}
          <div className="smart-banner-app-icon">
            <span className="app-icon-letter">V</span>
            <span className="app-icon-spark">✦</span>
          </div>

          {/* App Details */}
          <div className="smart-banner-info">
            <div className="smart-banner-title-row">
              <strong className="smart-app-name">{config.appTitle}</strong>
              <span className="smart-os-pill">{config.storeName}</span>
            </div>
            <span className="smart-app-meta">{config.ratingText}</span>
          </div>

          {/* Call to Action */}
          <div className="smart-banner-actions">
            <a
              href={config.downloadUrl}
              onClick={handleActionClick}
              className="smart-banner-action-btn"
              target={detectedOS === "desktop" ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {detectedOS === "ios" ? (
                <span>GET </span>
              ) : detectedOS === "android" ? (
                <span>INSTALL ▶</span>
              ) : (
                <span>GET APP 📱</span>
              )}
            </a>
          </div>
        </div>
      </div>

      {/* QR Code Scan Modal for Desktop */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div
            className="modal-card app-download-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowQrModal(false)}
              aria-label="Close app modal"
            >
              ✕
            </button>

            <div className="app-download-content">
              <div className="app-modal-header">
                <span className="app-modal-badge">MOBILE COMPANION</span>
                <h3>Experience Vroom Style(s) on iOS & Android</h3>
                <p>
                  Scan the QR code with your smartphone camera to download our native app directly from the Apple App Store or Google Play Store.
                </p>
              </div>

              <div className="app-qr-display-grid">
                {/* Simulated High-Res SVG QR Code */}
                <div className="qr-code-box">
                  <svg
                    viewBox="0 0 100 100"
                    className="qr-svg-graphic"
                    aria-label="QR Code to download Vroom Styles mobile application"
                  >
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Top-left marker */}
                    <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="18" width="9" height="9" fill="#0f172a" />

                    {/* Top-right marker */}
                    <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="73" y="18" width="9" height="9" fill="#0f172a" />

                    {/* Bottom-left marker */}
                    <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                    <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

                    {/* Data patterns */}
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
                  <span className="qr-scan-hint">📷 Scan with phone camera</span>
                </div>

                <div className="app-perks-list">
                  <div className="app-perk-item">
                    <span className="perk-icon">⚡</span>
                    <div>
                      <strong>Exclusive App Drops</strong>
                      <p>Access secret Friday runway drops 2 hours before the web catalog.</p>
                    </div>
                  </div>
                  <div className="app-perk-item">
                    <span className="perk-icon">🔔</span>
                    <div>
                      <strong>Live Courier Push Notifications</strong>
                      <p>Real-time GPS rider location alerts right to your lock screen.</p>
                    </div>
                  </div>
                  <div className="app-perk-item">
                    <span className="perk-icon">💵</span>
                    <div>
                      <strong>₦5,000 In-App Voucher</strong>
                      <p>Instant credit applied at checkout on your first native mobile purchase.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Store Links */}
              <div className="store-buttons-row">
                <a
                  href="https://apps.apple.com/app/vroom-styles/id6478912345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-download-btn apple"
                >
                  <span className="store-btn-icon"></span>
                  <div className="store-btn-text">
                    <small>Download on the</small>
                    <strong>Apple App Store</strong>
                  </div>
                </a>

                <a
                  href="https://play.google.com/store/apps/details?id=com.vroomstyles.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-download-btn google"
                >
                  <span className="store-btn-icon">▶</span>
                  <div className="store-btn-text">
                    <small>GET IT ON</small>
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
