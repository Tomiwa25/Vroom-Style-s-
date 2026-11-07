import React, { useState } from "react";
import type { CookieConsentSettings, DisputeTicket } from "../types";

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "dispute" | "returns" | "cookies" | "gateways";
  onSuccessToast: (msg: string) => void;
}

const DEFAULT_COOKIE_SETTINGS: CookieConsentSettings = {
  necessary: true,
  analytics: true,
  marketing: true,
  preferences: true,
  updatedAt: new Date().toISOString(),
};

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = "dispute",
  onSuccessToast,
}) => {
  const [userTab, setUserTab] = useState<"dispute" | "returns" | "cookies" | "gateways" | null>(null);
  const activeTab = userTab ?? initialTab;

  // Cookie Consent State
  const [cookieSettings, setCookieSettings] = useState<CookieConsentSettings>(() => {
    try {
      const stored = localStorage.getItem("vroom_cookie_consent");
      return stored ? JSON.parse(stored) : DEFAULT_COOKIE_SETTINGS;
    } catch {
      return DEFAULT_COOKIE_SETTINGS;
    }
  });

  // Dispute form state
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [disputeType, setDisputeType] = useState<DisputeTicket["disputeType"]>("DAMAGED_GOODS");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [activeTicket, setActiveTicket] = useState<DisputeTicket | null>(null);

  if (!isOpen) return null;

  const handleSaveCookiePreferences = () => {
    const updated = {
      ...cookieSettings,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("vroom_cookie_consent", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setCookieSettings(updated);
    onSuccessToast("Cookie & privacy preferences saved successfully.");
    onClose();
  };

  const handleAcceptAllCookies = () => {
    const allAccepted: CookieConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("vroom_cookie_consent", JSON.stringify(allAccepted));
    } catch {
      // ignore
    }
    setCookieSettings(allAccepted);
    onSuccessToast("All cookies accepted pursuant to NDPR & GDPR standards.");
    onClose();
  };

  const handleRejectNonEssential = () => {
    const strictlyNecessary: CookieConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("vroom_cookie_consent", JSON.stringify(strictlyNecessary));
    } catch {
      // ignore
    }
    setCookieSettings(strictlyNecessary);
    onSuccessToast("Non-essential cookies disabled. Strictly necessary cookies remain active.");
    onClose();
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !customerName.trim() || !customerEmail.trim() || !disputeDesc.trim()) {
      onSuccessToast("Please complete all required fields for your dispute dossier.");
      return;
    }

    const ticketNumber = `DISP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket: DisputeTicket = {
      ticketId: ticketNumber,
      orderId: orderId.trim().toUpperCase(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      disputeType,
      description: disputeDesc.trim(),
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    };

    setActiveTicket(newTicket);
    onSuccessToast(`Dispute dossier ${ticketNumber} logged. An Ombudsman Case Officer is assigned.`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card compliance-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close compliance modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="compliance-modal-header">
          <div className="compliance-title-group">
            <span className="compliance-icon-badge">⚖️</span>
            <div>
              <h3>Compliance, Trust & Legal Framework</h3>
              <p>
                Transparent dispute resolution protocols, return timelines, cookie consent controls, and verified payment gateway architecture.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="compliance-nav-tabs">
            <button
              type="button"
              className={`compliance-tab-btn ${activeTab === "dispute" ? "active" : ""}`}
              onClick={() => setUserTab("dispute")}
            >
              <span className="tab-icon">⚖️</span> Dispute Resolution
            </button>
            <button
              type="button"
              className={`compliance-tab-btn ${activeTab === "returns" ? "active" : ""}`}
              onClick={() => setUserTab("returns")}
            >
              <span className="tab-icon">↺</span> Return Timelines
            </button>
            <button
              type="button"
              className={`compliance-tab-btn ${activeTab === "cookies" ? "active" : ""}`}
              onClick={() => setUserTab("cookies")}
            >
              <span className="tab-icon">🍪</span> Cookie Management
            </button>
            <button
              type="button"
              className={`compliance-tab-btn ${activeTab === "gateways" ? "active" : ""}`}
              onClick={() => setUserTab("gateways")}
            >
              <span className="tab-icon">💳</span> Payment Gateways & Trust
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="compliance-modal-body">
          {/* TAB 1: DISPUTE RESOLUTION PROTOCOLS */}
          {activeTab === "dispute" && (
            <div className="compliance-pane dispute-pane">
              <div className="dispute-overview-card">
                <h4>Three-Tier Consumer Protection & Dispute Architecture</h4>
                <p>
                  Pursuant to the Federal Competition and Consumer Protection Act (FCCPA) and Nigerian E-Commerce Guidelines, Vroom Style(s) operates a binding, non-adversarial dispute resolution process ensuring all patron transactions are fair and remediated swiftly.
                </p>

                <div className="protocol-steps-grid">
                  <div className="protocol-step-card">
                    <span className="step-num">Tier 01</span>
                    <strong>48-Hour Concierge Resolution</strong>
                    <p>Direct priority investigation by our dedicated Patron Care Ombudsman. 94% of claims are settled within 2 business days.</p>
                  </div>
                  <div className="protocol-step-card">
                    <span className="step-num">Tier 02</span>
                    <strong>Tribunal Mediation</strong>
                    <p>Neutral internal hearing assessing courier dispatch manifests, waybill photo proof, and mobile POS transaction timestamps.</p>
                  </div>
                  <div className="protocol-step-card">
                    <span className="step-num">Tier 03</span>
                    <strong>Independent ADR & FCCPC</strong>
                    <p>Escalation to recognized Alternative Dispute Resolution (ADR) panels with full cooperation and binding remediation guarantees.</p>
                  </div>
                </div>
              </div>

              {/* Dispute Submission / Ticket Confirmation */}
              {activeTicket ? (
                <div className="dispute-ticket-confirmed-card">
                  <span className="confirmed-seal">✓</span>
                  <h4>Dispute Dossier Logged: {activeTicket.ticketId}</h4>
                  <p>
                    Thank you, <strong>{activeTicket.customerName}</strong>. Your dispute regarding Order <strong>{activeTicket.orderId}</strong> has been assigned to Senior Case Specialist Babatunde Cole.
                  </p>
                  <div className="ticket-meta-pill">
                    <span>Category: <strong>{activeTicket.disputeType.replace(/_/g, " ")}</strong></span>
                    <span>Status: <strong className="status-badge-open">UNDER INVESTIGATION</strong></span>
                  </div>
                  <p className="ticket-notice">
                    You will receive formal findings and remediation options at <strong>{activeTicket.customerEmail}</strong> within 24 to 48 hours.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setActiveTicket(null)}
                  >
                    Log Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDisputeSubmit} className="dispute-form-card">
                  <h4>Open an Official Dispute Dossier</h4>
                  <p className="form-sub">
                    If an item arrived damaged, delivery was significantly delayed, or you experienced an issue with Payment on Delivery settlement, file your claim below:
                  </p>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label>Order ID or Waybill Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. ORD-10924 or VRM-DEL-89240-NG"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="vroom-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Dispute Category *</label>
                      <select
                        value={disputeType}
                        onChange={(e) => setDisputeType(e.target.value as DisputeTicket["disputeType"])}
                        className="vroom-select"
                      >
                        <option value="DAMAGED_GOODS">Damaged / Defective Goods Upon Delivery</option>
                        <option value="DELAYED_DELIVERY">Delivery Exceeded Guaranteed Timeline</option>
                        <option value="WRONG_SIZE_COLOR">Wrong Item / Size / Color Delivered</option>
                        <option value="REFUND_DELAY">Pending Refund Not Reflected in Bank</option>
                        <option value="POD_OVERCHARGE">Payment on Delivery (PoD) Overcharge</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label>Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Oluwaseun Adeleke"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="vroom-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address for Case Updates *</label>
                      <input
                        type="email"
                        placeholder="e.g. adeleke@domain.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="vroom-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description of Issue & Desired Resolution *</label>
                    <textarea
                      rows={3}
                      placeholder="Please specify what happened and whether you prefer an immediate replacement, store credit, or direct bank refund..."
                      value={disputeDesc}
                      onChange={(e) => setDisputeDesc(e.target.value)}
                      className="vroom-textarea"
                      required
                    />
                  </div>

                  <button type="submit" className="primary-button dispute-submit-btn">
                    Submit Formal Dispute Dossier →
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: RETURN TIMELINES & POLICY */}
          {activeTab === "returns" && (
            <div className="compliance-pane returns-pane">
              <div className="returns-timeline-container">
                <h4>7-Day Complimentary Doorstep Return Timeline</h4>
                <p>
                  Every purchase from Vroom Style(s) is backed by our signature 7-day hassle-free inspection and exchange guarantee.
                </p>

                <div className="returns-milestones-row">
                  <div className="milestone-card">
                    <div className="milestone-badge">Day 0</div>
                    <strong>Doorstep Arrival & Inspection</strong>
                    <p>Inspect garments and packaging. For Payment on Delivery (PoD), verify before card or cash handover.</p>
                  </div>
                  <div className="milestone-card">
                    <div className="milestone-badge">Days 1 - 7</div>
                    <strong>Initiate Return or Size Swap</strong>
                    <p>Request a return via your account or WhatsApp concierge. State whether you need a different size.</p>
                  </div>
                  <div className="milestone-card">
                    <div className="milestone-badge">&lt; 24 Hours</div>
                    <strong>Doorstep Courier Retrieval</strong>
                    <p>Our Vroom Delivery fleet driver retrieves the item from your home or office address at no extra fee.</p>
                  </div>
                  <div className="milestone-card">
                    <div className="milestone-badge">Instant</div>
                    <strong>Reimbursement or Exchange Drop</strong>
                    <p>Instant store credit with a 10% bonus, or complete 24-hour reversal to your original payment card.</p>
                  </div>
                </div>
              </div>

              <div className="return-rules-grid">
                <div className="rule-card">
                  <span className="rule-icon">🏷️</span>
                  <strong>Tags & Packaging</strong>
                  <p>Garments must have original Vroom Atelier security tags attached and be in unworn condition.</p>
                </div>
                <div className="rule-card">
                  <span className="rule-icon">👗</span>
                  <strong>Complimentary Size Swaps</strong>
                  <p>If an item runs slightly small or large, size swaps are processed with priority express dispatch.</p>
                </div>
                <div className="rule-card">
                  <span className="rule-icon">💵</span>
                  <strong>PoD Inspection Assurance</strong>
                  <p>For Payment on Delivery orders, you may decline the delivery at the door if the package is opened or damaged.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COOKIE MANAGEMENT DRAWER */}
          {activeTab === "cookies" && (
            <div className="compliance-pane cookies-pane">
              <div className="cookies-intro-box">
                <h4>GDPR & NDPR Privacy & Cookie Preferences</h4>
                <p>
                  We respect your right to privacy pursuant to the <strong>Nigeria Data Protection Regulation (NDPR)</strong> and international <strong>GDPR</strong> data processing standards. Manage which categories of cookies you consent to below:
                </p>
              </div>

              <div className="cookie-categories-list">
                {/* Strictly Necessary */}
                <div className="cookie-category-item locked">
                  <div className="cookie-cat-info">
                    <div className="cat-title-row">
                      <strong>Strictly Necessary Cookies</strong>
                      <span className="locked-badge">ALWAYS ACTIVE</span>
                    </div>
                    <p>
                      Essential for catalog navigation, session security, Paystack encrypted checkout, and maintaining your shopping bag state. Cannot be deactivated.
                    </p>
                  </div>
                  <div className="cookie-toggle-slot">
                    <input type="checkbox" checked disabled className="cookie-checkbox disabled" />
                  </div>
                </div>

                {/* Analytics & Performance */}
                <div className="cookie-category-item">
                  <div className="cookie-cat-info">
                    <div className="cat-title-row">
                      <strong>Performance & Analytics Cookies</strong>
                      <span className="optional-badge">OPTIONAL</span>
                    </div>
                    <p>
                      Collect aggregated, anonymous telemetry regarding site performance, page load speeds, and error rates to help us refine your atelier shopping experience.
                    </p>
                  </div>
                  <div className="cookie-toggle-slot">
                    <label className="switch-toggle-label">
                      <input
                        type="checkbox"
                        checked={cookieSettings.analytics}
                        onChange={(e) =>
                          setCookieSettings((prev) => ({ ...prev, analytics: e.target.checked }))
                        }
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Marketing & Personalization */}
                <div className="cookie-category-item">
                  <div className="cookie-cat-info">
                    <div className="cat-title-row">
                      <strong>Marketing & Behavioral Personalization</strong>
                      <span className="optional-badge">OPTIONAL</span>
                    </div>
                    <p>
                      Used to remember curated recommendation rails, seasonal promotion banners (e.g. Black Friday, BOGOF), and tailored drop announcements.
                    </p>
                  </div>
                  <div className="cookie-toggle-slot">
                    <label className="switch-toggle-label">
                      <input
                        type="checkbox"
                        checked={cookieSettings.marketing}
                        onChange={(e) =>
                          setCookieSettings((prev) => ({ ...prev, marketing: e.target.checked }))
                        }
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="cookies-actions-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleRejectNonEssential}
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleSaveCookiePreferences}
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleAcceptAllCookies}
                >
                  Accept All Cookies →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT GATEWAYS & TRUST BADGES */}
          {activeTab === "gateways" && (
            <div className="compliance-pane gateways-pane">
              <div className="gateways-intro-card">
                <h4>Verified Payment Infrastructure & Security Seals</h4>
                <p>
                  All transactions on Vroom Style(s) are encrypted with 256-Bit SSL protocols and processed via bank-grade PCI-DSS Level 1 compliant financial switches.
                </p>
              </div>

              {/* Gateway Badges Grid */}
              <div className="gateway-cards-grid">
                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">💳</span>
                  </div>
                  <strong>Mastercard</strong>
                  <span className="gateway-spec">Mastercard Identity Check & 3D Secure 2.0</span>
                </div>

                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">💳</span>
                  </div>
                  <strong>Visa</strong>
                  <span className="gateway-spec">Verified by Visa with tokenized authorization</span>
                </div>

                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">🟢</span>
                  </div>
                  <strong>Verve Card</strong>
                  <span className="gateway-spec">Interswitch Verified Domestic Card Network</span>
                </div>

                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">⚡</span>
                  </div>
                  <strong>Paystack</strong>
                  <span className="gateway-spec">Certified PCI-DSS Level 1 Gateway Partner</span>
                </div>

                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">🏦</span>
                  </div>
                  <strong>Direct Bank Transfer</strong>
                  <span className="gateway-spec">Instant NIP & Dedicated Virtual Accounts</span>
                </div>

                <div className="gateway-badge-card">
                  <div className="gateway-icon-box">
                    <span className="card-brand-graphic">💵</span>
                  </div>
                  <strong>Payment on Delivery (PoD)</strong>
                  <span className="gateway-spec">Mobile POS Terminal & Cash upon inspection</span>
                </div>
              </div>

              {/* Security & Regulatory Verifications */}
              <div className="security-seals-grid">
                <div className="security-seal-item">
                  <span className="seal-icon">🔒</span>
                  <div>
                    <strong>256-Bit SSL Encryption</strong>
                    <p>All transmitted payload data and identity credentials are fully end-to-end encrypted.</p>
                  </div>
                </div>
                <div className="security-seal-item">
                  <span className="seal-icon">🛡️</span>
                  <div>
                    <strong>NDPR Certified Compliant</strong>
                    <p>Audited and verified in strict accordance with the Nigeria Data Protection Commission.</p>
                  </div>
                </div>
                <div className="security-seal-item">
                  <span className="seal-icon">🏛️</span>
                  <div>
                    <strong>FCCPC Verified E-Commerce</strong>
                    <p>Registered and adhering to consumer rights standards across Nigerian digital retail.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
