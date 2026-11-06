import React, { useState } from "react";

interface ScavengerHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimVoucher: (code: string) => void;
}

export const ScavengerHuntModal: React.FC<ScavengerHuntModalProps> = ({
  isOpen,
  onClose,
  onClaimVoucher,
}) => {
  const [copied, setCopied] = useState(false);
  const SECRET_CODE = "ATELIER15K";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(SECRET_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    onClaimVoucher(SECRET_CODE);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container scavenger-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">SEASONAL GAMIFIED PROMOTION</span>
            <h2 className="modal-title">Secret Atelier Scavenger Hunt 🕵️‍♂️</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="scavenger-modal-body">
          <div className="scavenger-hero-banner">
            <span className="mystery-badge">👑 MYSTERY UNLOCKED</span>
            <h3>You Discovered the Secret Atelier Vault!</h3>
            <p>
              Congratulations on finding our exclusive Seasonal Scavenger Hunt drop.
              Enjoy an additional <strong>₦15,000 Voucher</strong> applicable towards any
              luxury suiting, silk dress, or cashmere knit in your cart.
            </p>
          </div>

          <div className="voucher-code-card">
            <span className="voucher-label">SECRET VOUCHER CODE</span>
            <div className="voucher-display-row">
              <span className="voucher-code">{SECRET_CODE}</span>
              <button
                type="button"
                className="voucher-copy-btn"
                onClick={handleCopy}
              >
                {copied ? "✓ COPIED" : "COPY CODE"}
              </button>
            </div>
            <small className="voucher-terms">
              Valid for orders over ₦50,000 • Verified at Paystack Checkout
            </small>
          </div>

          <div className="scavenger-perks-list">
            <div className="scavenger-perk-item">
              <span className="perk-bullet">⚡</span>
              <span>Stackable with active Flash Sale and Black Friday promotional discounts</span>
            </div>
            <div className="scavenger-perk-item">
              <span className="perk-bullet">🚚</span>
              <span>Includes Free Express 24h Courier Dispatch nationwide</span>
            </div>
            <div className="scavenger-perk-item">
              <span className="perk-bullet">✨</span>
              <span>Complimentary Atelier signature cotton garment bag with order</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="primary-button scavenger-explore-btn"
            onClick={handleApply}
          >
            Apply Code & Explore Secret Drops →
          </button>
        </div>
      </div>
    </div>
  );
};
