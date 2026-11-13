import React from "react";
import type { CountryRegion } from "../types";
import { NewsletterSubscription } from "./NewsletterSubscription";
import { OFFICIAL_WHATSAPP_DISPLAY } from "../utils/device";

interface FooterProps {
  currentRegion: CountryRegion;
  onOpenCountrySwitcher: () => void;
  onOpenCompliance: (tab?: "dispute" | "returns" | "cookies" | "gateways") => void;
  onOpenVendorHub: () => void;
  onOpenBecomeSeller: () => void;
  onOpenJForce: () => void;
  onOpenVroomDelivery: () => void;
  onOpenTracking: () => void;
  onOpenPoDFilter: () => void;
  onOpenAdmin: () => void;
  onShowToast: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentRegion,
  onOpenCountrySwitcher,
  onOpenCompliance,
  onOpenVendorHub,
  onOpenBecomeSeller,
  onOpenJForce,
  onOpenVroomDelivery,
  onOpenTracking,
  onOpenPoDFilter,
  onOpenAdmin,
  onShowToast,
}) => {
  return (
    <footer className="footer-enterprise" role="contentinfo" aria-label="Vroom Styles Global Footer">
      <div className="footer-enterprise-container">
        {/* Tier 1: Newsletter Acquisition Module */}
        <div className="footer-newsletter-tier">
          <NewsletterSubscription onSuccessToast={onShowToast} variant="footer" />
        </div>

        {/* Tier 2: 5-Column Navigation Grid */}
        <div className="footer-columns-grid">
          {/* Column 1: Brand Atelier & Concierge */}
          <div className="footer-nav-col brand-col">
            <div className="footer-brand-lockup">
              <span className="brand-logo-mark">V</span>
              <strong className="brand-full-name">Vroom Style(s)</strong>
            </div>
            <p className="brand-manifesto">
              Luxury ready-to-wear atelier, bespoke tailoring, and curated living essentials. Handcrafted for fast-paced, confident living across Africa.
            </p>
            <div className="footer-concierge-card">
              <span className="concierge-tag">Direct Concierge Line</span>
              <a
                href="https://wa.me/2349130831439"
                target="_blank"
                rel="noopener noreferrer"
                className="concierge-phone-link"
                title="Connect via official WhatsApp"
              >
                <span className="wa-icon">💬</span>
                <strong>{OFFICIAL_WHATSAPP_DISPLAY}</strong>
              </a>
              <span className="concierge-hours">Mon - Sun (8:00 AM – 9:00 PM WAT)</span>
            </div>
          </div>

          {/* Column 2: Shopping & Collections */}
          <div className="footer-nav-col">
            <h3 className="col-heading">Collections & Drops</h3>
            <ul className="footer-links-list">
              <li>
                <a href="#catalog-section" onClick={onOpenPoDFilter}>
                  Payment on Delivery (PoD)
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Women&apos;s Silk & Linen
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Men&apos;s Tailoring & Knits
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Appliances & Steamer Tech
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Phones & Tuscan Leather Folios
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Official Flagship Stores
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  Flash Sale & Scavenger Drops
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Partner & Marketplace */}
          <div className="footer-nav-col">
            <h3 className="col-heading">Marketplace & Partners</h3>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenBecomeSeller}>
                  Become a Seller (0% Fee)
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenVendorHub}>
                  3P Vendor Hub & Drops
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenJForce}>
                  JForce Reseller (12% Commission)
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenVroomDelivery}>
                  Vroom Delivery Parcel Hub
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("gateways")}>
                  Merchant REST API Documentation
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenAdmin}>
                  Store Retail Intelligence
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Fulfillment */}
          <div className="footer-nav-col">
            <h3 className="col-heading">Customer Care</h3>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenTracking}>
                  Orders & Waybill Tracking
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("returns")}>
                  Shipping & delivery times
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("returns")}>
                  Returns & exchanges
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onShowToast("Complimentary size exchanges dispatched within 24 hours.")}>
                  Architectural Fit & Size Guide
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/2349130831439"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-action-link"
                >
                  WhatsApp Stylist Support
                </a>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onShowToast("All pieces dry clean or delicate silk wash.")}>
                  Fabric & Leather Care Handbook
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Compliance, Legal & Trust Verification */}
          <div className="footer-nav-col compliance-col">
            <h3 className="col-heading">Compliance & Trust</h3>
            <ul className="footer-links-list">
              <li>
                <button
                  type="button"
                  className="footer-action-link compliance-highlight"
                  onClick={() => onOpenCompliance("dispute")}
                >
                  Dispute Resolution Protocols
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("returns")}
                >
                  Return & Exchange Timelines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("cookies")}
                >
                  Cookie Management Preferences
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("gateways")}
                >
                  Accepted Payment Gateways
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onShowToast("Vroom Style(s) Privacy Policy audited under NDPR 2023.")}
                >
                  NDPR & GDPR Privacy Charter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onShowToast("All sales protected under FCCPA 2018 consumer regulations.")}
                >
                  FCCPC Consumer Protection
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Region line — the switcher modal carries the country list */}
        <div className="footer-regional-routing-tier">
          <span className="regional-title-row">
            Shipping to <strong>{currentRegion.name}</strong> in{" "}
            {currentRegion.currency}
          </span>
          <button
            type="button"
            className="country-switcher-trigger-btn"
            onClick={onOpenCountrySwitcher}
            title="Open full country & currency switcher"
          >
            Change region
          </button>
        </div>

        {/* Tier 4: Payment and verification, set as quiet text rather than badges */}
        <div className="footer-gateways-trust-tier">
          <div className="gateways-badges-group">
            <span className="gateways-group-title">We accept</span>
            <div className="gateway-badges-list">
              <span className="payment-badge-pill">Mastercard</span>
              <span className="payment-badge-pill">Visa</span>
              <span className="payment-badge-pill">Verve</span>
              <span className="payment-badge-pill">Paystack</span>
              <span className="payment-badge-pill">Bank transfer</span>
              <span className="payment-badge-pill">Payment on delivery</span>
            </div>
          </div>

          <div className="trust-seals-group">
            <span className="gateways-group-title">Verified</span>
            <div className="trust-seals-list">
              <button type="button" className="trust-seal-chip" onClick={() => onOpenCompliance("gateways")}>
                256-bit SSL
              </button>
              <button type="button" className="trust-seal-chip" onClick={() => onOpenCompliance("cookies")}>
                NDPR &amp; GDPR
              </button>
              <button type="button" className="trust-seal-chip" onClick={() => onOpenCompliance("dispute")}>
                FCCPC
              </button>
            </div>
          </div>
        </div>

        {/* Tier 5: Copyright & Regulatory Notice */}
        <div className="footer-copyright-tier">
          <p className="copyright-text">
            © 2026 Vroom Style(s) West Africa Ltd. Registered with the Corporate Affairs Commission (RC-1892401). Operating in compliance with the Nigeria Data Protection Act 2023 and the Federal Competition & Consumer Protection Act. All rights reserved.
          </p>
          <div className="footer-bottom-compliance-links">
            <button type="button" onClick={() => onOpenCompliance("dispute")}>Dispute Resolution</button>
            <span className="sep">•</span>
            <button type="button" onClick={() => onOpenCompliance("returns")}>Return Policy</button>
            <span className="sep">•</span>
            <button type="button" onClick={() => onOpenCompliance("cookies")}>Cookie Preferences</button>
            <span className="sep">•</span>
            <button type="button" onClick={() => onOpenCompliance("gateways")}>Payment Protection</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
