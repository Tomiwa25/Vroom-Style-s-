import React, { useState } from "react";

interface VendorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const VendorOnboardingModal: React.FC<VendorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("Fashion & Atelier");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lagos");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [merchantId, setMerchantId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !contactName || !email || !phone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `VRM-${Math.floor(100000 + Math.random() * 900000)}`;
      setMerchantId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSuccessToast(`Merchant Application submitted! Merchant ID: ${generatedId}`);
    }, 900);
  };

  const handleReset = () => {
    setStoreName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container vendor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">MARKETPLACE PARTNER NETWORK</span>
            <h2 className="modal-title">Sell on Vroom Style(s)</h2>
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

        {!isSubmitted ? (
          <div className="vendor-modal-body">
            {/* Value Proposition Highlights */}
            <div className="vendor-perks-grid">
              <div className="perk-box">
                <span className="perk-icon">📈</span>
                <strong>250k+ Patrons</strong>
                <span>Reach high-intent luxury & lifestyle buyers nationwide.</span>
              </div>
              <div className="perk-box">
                <span className="perk-icon">⚡</span>
                <strong>0% Commission</strong>
                <span>Introductory 0% fee on all sales for your first 30 days.</span>
              </div>
              <div className="perk-box">
                <span className="perk-icon">💳</span>
                <strong>Weekly Payouts</strong>
                <span>Direct settlement to your bank account via Paystack.</span>
              </div>
              <div className="perk-box">
                <span className="perk-icon">🚚</span>
                <strong>Vroom Express</strong>
                <span>Full door-to-door fulfillment and customer returns handled.</span>
              </div>
            </div>

            {/* Merchant Application Form */}
            <form onSubmit={handleSubmit} className="vendor-form">
              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="vendor-store-name">Store or Brand Name *</label>
                  <input
                    id="vendor-store-name"
                    required
                    placeholder="e.g. Atelier Noir Studio"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="vendor-category">Primary Category *</label>
                  <select
                    id="vendor-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Fashion & Atelier">Fashion & Atelier</option>
                    <option value="Appliances">Appliances & Home Care</option>
                    <option value="Phones & Tablets">Phones, Tablets & Tech</option>
                    <option value="Health & Beauty">Health & Clean Beauty</option>
                    <option value="Accessories">Leather Goods & Accessories</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="vendor-contact">Contact Person *</label>
                  <input
                    id="vendor-contact"
                    required
                    placeholder="Full legal name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="vendor-email">Business Email *</label>
                  <input
                    id="vendor-email"
                    type="email"
                    required
                    placeholder="partner@yourbrand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="vendor-phone">WhatsApp / Phone Number *</label>
                  <input
                    id="vendor-phone"
                    required
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="vendor-city">Primary Warehouse City *</label>
                  <select
                    id="vendor-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="Lagos">Lagos State</option>
                    <option value="Abuja">Abuja (FCT)</option>
                    <option value="Port Harcourt">Port Harcourt (Rivers)</option>
                    <option value="Ibadan">Ibadan (Oyo)</option>
                    <option value="Other">Other Nationwide Location</option>
                  </select>
                </div>
              </div>

              <div className="vendor-terms-note">
                By submitting, you agree to the Vroom Style(s) Merchant Terms of Service and Quality Authentication Standards.
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="vendor-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering Store..." : "Register Store & Start Selling →"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="vendor-success-view">
            <div className="success-icon-badge">🎉</div>
            <h3>Application Received Successfully</h3>
            <p className="success-merchant-code">
              Your Temporary Merchant ID: <strong>{merchantId}</strong>
            </p>
            <p className="success-explanation">
              Welcome to the Vroom Style(s) Marketplace! Our Merchant Onboarding Concierge will review your
              catalog, verify your store credentials, and contact <strong>{email}</strong> within 24 hours
              to activate your Vendor Portal and Paystack payout bank link.
            </p>
            <div className="success-actions">
              <button
                type="button"
                className="primary-button"
                onClick={handleReset}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

