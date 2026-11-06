import React, { useState } from "react";

interface HelpCenterModalProps {
  isOpen: boolean;
  initialTab?: "faqs" | "returns" | "payment" | "contact";
  onClose: () => void;
  onOpenTracking: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  initialTab = "faqs",
  onClose,
  onOpenTracking,
}) => {
  const [activeTab, setActiveTab] = useState<"faqs" | "returns" | "payment" | "contact">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container help-center-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">ASSISTANCE & POLICIES</span>
            <h2 className="modal-title">Help Center & Concierge</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Help Center"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="help-tabs">
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "faqs" ? "active" : ""}`}
            onClick={() => setActiveTab("faqs")}
          >
            Frequently Asked
          </button>
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "returns" ? "active" : ""}`}
            onClick={() => setActiveTab("returns")}
          >
            7-Day Returns Policy
          </button>
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            Payment Security
          </button>
          <button
            type="button"
            className={`help-tab-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            Contact Concierge
          </button>
        </div>

        {/* Tab Body */}
        <div className="help-modal-body">
          {activeTab === "faqs" && (
            <div className="help-faq-list">
              <div className="faq-item">
                <h4>How do I track my delivery status?</h4>
                <p>
                  You can track your order anytime by clicking the <strong>Track Order</strong> button
                  in the header or inside your Account dropdown. Our order fulfillment portal displays
                  5 live milestone checkpoints from Placed to Delivered.
                </p>
                <button
                  type="button"
                  className="faq-inline-action"
                  onClick={() => {
                    onClose();
                    onOpenTracking();
                  }}
                >
                  Open Order Tracker →
                </button>
              </div>

              <div className="faq-item">
                <h4>How fast is nationwide delivery?</h4>
                <p>
                  Orders in Lagos and Abuja arrive within 24 to 48 hours via Vroom Express. Other states
                  and nationwide locations are delivered within 3 to 5 business days with insured courier partners.
                </p>
              </div>

              <div className="faq-item">
                <h4>Are all products 100% authentic?</h4>
                <p>
                  Every garment and accessory in the Official Store and Atelier drop is handcrafted from
                  certified Grade-A fabrics (Mulberry silk, Mongolian cashmere, Italian bridle leather)
                  and authenticated before dispatch.
                </p>
              </div>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="help-policy-panel">
              <div className="policy-badge-banner">
                <span className="badge-shield">🛡️</span>
                <div>
                  <strong>7-Day Guaranteed Doorstep Return Policy</strong>
                  <p>Not completely satisfied with your fit or finish? Return or exchange with zero stress.</p>
                </div>
              </div>

              <ul className="policy-checklist">
                <li>
                  <strong>Eligibility:</strong> Items must be unworn, unwashed, with all original atelier
                  garment tags attached and original presentation packaging intact.
                </li>
                <li>
                  <strong>Free Doorstep Pickup:</strong> In Lagos, Abuja, and Port Harcourt, our courier
                  will collect the package directly from your delivery address at no extra charge.
                </li>
                <li>
                  <strong>Rapid Refund:</strong> Refunds are processed back to your original Paystack bank card
                  or bank account within 24 hours of inspection.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="help-payment-panel">
              <div className="paystack-security-card">
                <span className="paystack-logo-badge">💳 Paystack Secured</span>
                <p>
                  All checkout transactions on Vroom Style(s) are encrypted with bank-grade 256-bit SSL encryption
                  and processed directly via Paystack (PCI-DSS Level 1 certified).
                </p>
                <div className="supported-channels">
                  <span className="channel-pill">Mastercard</span>
                  <span className="channel-pill">Visa</span>
                  <span className="channel-pill">Verve</span>
                  <span className="channel-pill">Bank Transfer</span>
                  <span className="channel-pill">USSD</span>
                  <span className="channel-pill">Apple Pay</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="help-contact-panel">
              <p className="contact-lead">
                Our Private Client Concierge is available 7 days a week (8:00 AM – 9:00 PM WAT).
              </p>
              <div className="contact-cards-grid">
                <div className="contact-card">
                  <span className="card-icon">📞</span>
                  <strong>Toll-Free Hotline</strong>
                  <span>+234 800-VROOM (800-87666)</span>
                  <small>Instant priority connection</small>
                </div>
                <div className="contact-card">
                  <span className="card-icon">💬</span>
                  <strong>WhatsApp Concierge</strong>
                  <span>+234 901 888 7666</span>
                  <small>Response within 5 minutes</small>
                </div>
                <div className="contact-card">
                  <span className="card-icon">✉️</span>
                  <strong>Email Support</strong>
                  <span>concierge@vroomstyles.com</span>
                  <small>For bespoke tailoring & inquiries</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

