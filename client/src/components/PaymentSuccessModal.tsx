import React, { useState } from "react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  reference: string;
  total: number;
  formatPrice: (amountInNGN: number) => string;
  onTrackOrder: (orderId: string) => void;
  isPod?: boolean;
  podAddress?: string;
  podCity?: string;
  podPhone?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  orderId,
  reference,
  total,
  formatPrice,
  onTrackOrder,
  isPod = false,
  podAddress,
  podCity,
  podPhone,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyOrderId = () => {
    if (orderId && navigator.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card payment-success-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="admin-header-title">
            <span className="kicker">
              {isPod ? "Doorstep Settlement" : "Payment Verified"}
            </span>
            <h3>{isPod ? "Pay on Delivery Confirmed" : "Atelier Order Confirmed"}</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="payment-success-content">
          <div className="success-badge-wrapper">
            <div className={`success-icon-seal ${isPod ? "pod-seal" : ""}`}>
              {isPod ? "💵" : "✓"}
            </div>
            <h4>
              {isPod
                ? "Doorstep Dispatch Booked Successfully"
                : "Thank You for Your Patronage"}
            </h4>
            <p className="success-subtitle">
              {isPod
                ? `Your items are locked into fulfillment. Our courier will bring the package to your address. Please inspect upon arrival and settle ${formatPrice(
                    total
                  )} via courier mobile POS terminal or cash.`
                : "Your payment has been cleared via Paystack and your signature garments are locked into fulfillment with our dispatch courier."}
            </p>
          </div>

          <div className="receipt-card">
            <div className="receipt-row">
              <span className="receipt-label">Order Identifier</span>
              <div className="receipt-copy-pill">
                <span className="order-id-mono">{orderId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="copy-id-btn"
                  title="Copy Order ID"
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">
                {isPod ? "Settlement Method" : "Paystack Reference"}
              </span>
              <span className="receipt-mono-val">
                {isPod ? "Payment on Delivery (Cash / POS Terminal)" : reference}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">
                {isPod ? "Payable on Arrival" : "Total Amount Paid"}
              </span>
              <span className="receipt-amount-val">{formatPrice(total)}</span>
            </div>

            {isPod && podAddress && (
              <div className="receipt-row">
                <span className="receipt-label">Delivery Destination</span>
                <span className="receipt-mono-val">
                  {podAddress}{podCity ? `, ${podCity}` : ""}{podPhone ? ` (📞 ${podPhone})` : ""}
                </span>
              </div>
            )}

            <div className="receipt-row">
              <span className="receipt-label">Fulfillment Status</span>
              <span className={`receipt-status-badge ${isPod ? "pod" : ""}`}>
                {isPod ? "Dispatched (Pay on Arrival)" : "Processing (Paid)"}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Estimated Delivery</span>
              <span className="receipt-delivery-val">
                {isPod ? "24 - 48 hours doorstep arrival" : "3-7 days nationwide"}
              </span>
            </div>
          </div>

          <div className="payment-success-actions">
            <button
              className="primary-button track-order-action-btn"
              onClick={() => onTrackOrder(orderId)}
            >
              Track Order Fulfillment Milestone →
            </button>
            <button
              className="secondary-button continue-shopping-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
