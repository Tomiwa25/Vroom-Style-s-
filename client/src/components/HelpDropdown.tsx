import React, { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

interface HelpDropdownProps {
  onOpenHelpCenter: () => void;
  onOpenTracking: () => void;
  onOpenReturns: () => void;
  onOpenContact: () => void;
}

/**
 * High-contrast Help & Customer Support popover component.
 * Provides rapid access to Help Center, order tracking, returns policy, and live concierge.
 */
export const HelpDropdown: React.FC<HelpDropdownProps> = ({
  onOpenHelpCenter,
  onOpenTracking,
  onOpenReturns,
  onOpenContact,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleAction = (cb: () => void) => {
    cb();
    setIsOpen(false);
  };

  return (
    <div className="help-dropdown-wrapper" ref={dropdownRef}>
      {/* Help Trigger Button */}
      <button
        type="button"
        id="help-dropdown-trigger"
        className={`help-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Customer Help & Concierge"
      >
        <span className="help-icon">❓</span>
        <span className="help-label">Help</span>
        <span className={`help-chevron ${isOpen ? "rotate" : ""}`}>▾</span>
      </button>

      {/* Floating Popover Card */}
      {isOpen && (
        <div
          className="help-popover-card"
          role="menu"
          aria-labelledby="help-dropdown-trigger"
        >
          <div className="help-popover-header">
            <span className="help-header-title">Customer Care & Support</span>
            <span className="help-header-sub">Atelier Concierge Services</span>
          </div>

          <div className="help-menu-list">
            <button
              type="button"
              className="help-menu-item"
              onClick={() => handleAction(onOpenHelpCenter)}
            >
              <span className="help-item-icon">📖</span>
              <div className="help-item-text">
                <strong>Help Center & FAQs</strong>
                <span>Ordering, accounts, deliveries & vouchers</span>
              </div>
            </button>

            <button
              type="button"
              className="help-menu-item"
              onClick={() => handleAction(onOpenTracking)}
            >
              <span className="help-item-icon">🚚</span>
              <div className="help-item-text">
                <strong>Track My Order</strong>
                <span>Real-time delivery progress & rider dispatch</span>
              </div>
            </button>

            <button
              type="button"
              className="help-menu-item"
              onClick={() => handleAction(onOpenReturns)}
            >
              <span className="help-item-icon">🔄</span>
              <div className="help-item-text">
                <strong>Returns & Refunds Policy</strong>
                <span>7-day easy returns with doorstep pickup</span>
              </div>
            </button>

            <button
              type="button"
              className="help-menu-item"
              onClick={() => handleAction(onOpenContact)}
            >
              <span className="help-item-icon">💬</span>
              <div className="help-item-text">
                <strong>Live Chat & Concierge</strong>
                <span>+234 800-VROOM • concierge@vroomstyles.com</span>
              </div>
            </button>
          </div>

          <div className="help-popover-footer">
            <span className="help-badge-pill">🔒 Paystack Verified Marketplace</span>
          </div>
        </div>
      )}
    </div>
  );
};

