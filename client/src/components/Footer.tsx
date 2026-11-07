import React from "react";
import type { CountryRegion } from "../types";
import { AFRICAN_REGIONS } from "../data/regions";
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
            <h4 className="col-heading">Collections & Drops</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#catalog-section" onClick={onOpenPoDFilter}>
                  💵 Payment on Delivery (PoD)
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  👗 Women&apos;s Silk & Linen
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  👔 Men&apos;s Tailoring & Knits
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  ⚡ Appliances & Steamer Tech
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  📱 Phones & Tuscan Leather Folios
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  👑 Official Flagship Stores
                </a>
              </li>
              <li>
                <a href="#catalog-section">
                  🔥 Flash Sale & Scavenger Drops
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Partner & Marketplace */}
          <div className="footer-nav-col">
            <h4 className="col-heading">Marketplace & Partners</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenBecomeSeller}>
                  🏪 Become a Seller (0% Fee)
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenVendorHub}>
                  🏢 3P Vendor Hub & Drops
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenJForce}>
                  💼 JForce Reseller (12% Commission)
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenVroomDelivery}>
                  📦 Vroom Delivery Parcel Hub
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("gateways")}>
                  🔌 Merchant REST API Documentation
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenAdmin}>
                  ⚡ Store Retail Intelligence
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Fulfillment */}
          <div className="footer-nav-col">
            <h4 className="col-heading">Customer Care</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-action-link" onClick={onOpenTracking}>
                  📍 Orders & Waybill Tracking
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("returns")}>
                  ⏱️ 24-48 Hour Shipping Information
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onOpenCompliance("returns")}>
                  ↺ 7-Day Complimentary Returns
                </button>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onShowToast("Complimentary size exchanges dispatched within 24 hours.")}>
                  📐 Architectural Fit & Size Guide
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/2349130831439"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-action-link"
                >
                  💬 WhatsApp Stylist Support
                </a>
              </li>
              <li>
                <button type="button" className="footer-action-link" onClick={() => onShowToast("All pieces dry clean or delicate silk wash.")}>
                  ✨ Fabric & Leather Care Handbook
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Compliance, Legal & Trust Verification */}
          <div className="footer-nav-col compliance-col">
            <h4 className="col-heading">Compliance & Trust</h4>
            <ul className="footer-links-list">
              <li>
                <button
                  type="button"
                  className="footer-action-link compliance-highlight"
                  onClick={() => onOpenCompliance("dispute")}
                >
                  ⚖️ Dispute Resolution Protocols
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("returns")}
                >
                  ↺ Return & Exchange Timelines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("cookies")}
                >
                  🍪 Cookie Management Preferences
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onOpenCompliance("gateways")}
                >
                  💳 Accepted Payment Gateways
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onShowToast("Vroom Style(s) Privacy Policy audited under NDPR 2023.")}
                >
                  🛡️ NDPR & GDPR Privacy Charter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-action-link"
                  onClick={() => onShowToast("All sales protected under FCCPA 2018 consumer regulations.")}
                >
                  🏛️ FCCPC Consumer Protection
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Regional African Routing / Multi-Country Switcher */}
        <div className="footer-regional-routing-tier">
          <div className="regional-header">
            <div className="regional-title-row">
              <span className="regional-globe-icon">🌍</span>
              <strong>Pan-African Regional Storefronts & Routing:</strong>
            </div>
            <button
              type="button"
              className="country-switcher-trigger-btn"
              onClick={onOpenCountrySwitcher}
              title="Open full country & currency switcher"
            >
              <span>Current Region: <strong>{currentRegion.flag} {currentRegion.name} ({currentRegion.currency})</strong></span>
              <span className="switch-arrow">Change Country ▾</span>
            </button>
          </div>

          <div className="regional-countries-strip">
            {AFRICAN_REGIONS.map((reg) => {
              const isSelected = reg.code === currentRegion.code;
              return (
                <button
                  key={reg.code}
                  type="button"
                  className={`regional-country-pill ${isSelected ? "selected-country" : ""}`}
                  onClick={() => {
                    if (!isSelected) {
                      onOpenCountrySwitcher();
                    }
                  }}
                  title={`Switch to Vroom Style(s) ${reg.name} (${reg.domain})`}
                >
                  <span className="reg-flag">{reg.flag}</span>
                  <span className="reg-name">{reg.name}</span>
                  <span className="reg-curr">({reg.currency})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 4: Accepted Payment Gateway Badges & Trust Verification Seals */}
        <div className="footer-gateways-trust-tier">
          <div className="gateways-badges-group">
            <span className="gateways-group-title">Accepted Payment Gateways:</span>
            <div className="gateway-badges-list">
              <span className="payment-badge-pill gateway-mastercard" title="Mastercard 3D Secure 2.0">
                <span className="badge-icon">💳</span> Mastercard
              </span>
              <span className="payment-badge-pill gateway-visa" title="Verified by Visa Secure">
                <span className="badge-icon">💳</span> Visa
              </span>
              <span className="payment-badge-pill gateway-verve" title="Interswitch Verve Certified">
                <span className="badge-icon">🟢</span> Verve
              </span>
              <span className="payment-badge-pill gateway-paystack" title="Paystack PCI-DSS Level 1 Gateway">
                <span className="badge-icon">⚡</span> Paystack
              </span>
              <span className="payment-badge-pill gateway-bank" title="Direct Instant NIP Bank Transfer">
                <span className="badge-icon">🏦</span> Bank Transfer
              </span>
              <span className="payment-badge-pill gateway-pod" title="Payment on Delivery (Doorstep Mobile POS & Cash)">
                <span className="badge-icon">💵</span> Pay on Delivery (PoD)
              </span>
            </div>
          </div>

          <div className="trust-seals-group">
            <span className="gateways-group-title">Trust & Regulatory Verification:</span>
            <div className="trust-seals-list">
              <span className="trust-seal-chip" onClick={() => onOpenCompliance("gateways")}>
                🔒 256-Bit SSL Encrypted
              </span>
              <span className="trust-seal-chip" onClick={() => onOpenCompliance("cookies")}>
                🛡️ NDPR & GDPR Certified
              </span>
              <span className="trust-seal-chip" onClick={() => onOpenCompliance("dispute")}>
                🏛️ FCCPC Verified E-Commerce
              </span>
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
