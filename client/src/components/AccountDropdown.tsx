import React, { useRef, useState } from "react";
import type { User } from "../types";
import { useClickOutside } from "../hooks/useClickOutside";

interface AccountDropdownProps {
  currentUser: User | null;
  wishlistCount: number;
  onOpenAuth: () => void;
  onOpenTracking: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onSignOut: () => void;
}

/**
 * High-contrast Account Popover Component inspired by top-tier e-commerce UX.
 * Provides accessible click-toggling, outside dismissal, guest sign-in CTA,
 * order tracking shortcut, wishlist navigation, and role-based admin controls.
 */
export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  currentUser,
  wishlistCount,
  onOpenAuth,
  onOpenTracking,
  onOpenWishlist,
  onOpenAdmin,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="account-dropdown-wrapper" ref={dropdownRef}>
      {/* Anchor Trigger Button */}
      <button
        type="button"
        id="account-dropdown-trigger"
        className={`account-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={currentUser ? `Account: ${currentUser.firstName}` : "Account & Orders"}
      >
        {currentUser ? (
          <span className="user-avatar-badge">
            {currentUser.firstName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <span className="account-icon">👤</span>
        )}
        <span className="account-label">
          {currentUser ? `Hi, ${currentUser.firstName}` : "Account"}
        </span>
        <span className={`account-chevron ${isOpen ? "rotate" : ""}`}>▾</span>
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div
          className="account-popover-card"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="account-dropdown-trigger"
        >
          {/* Guest State */}
          {!currentUser ? (
            <div className="account-popover-header guest">
              <button
                type="button"
                className="account-primary-cta-btn"
                onClick={() => handleAction(onOpenAuth)}
              >
                <span>SIGN IN</span>
                <span className="cta-arrow">→</span>
              </button>
              <div className="account-subtext">
                New patron?{" "}
                <button
                  type="button"
                  className="link-subtle"
                  onClick={() => handleAction(onOpenAuth)}
                >
                  Create account
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated User State */
            <div className="account-popover-header authenticated">
              <div className="user-profile-summary">
                <span className="user-avatar-large">
                  {currentUser.firstName.charAt(0).toUpperCase()}
                </span>
                <div className="user-details">
                  <div className="user-display-name">
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="user-email-text">{currentUser.email}</div>
                  <div className="user-role-tag">
                    {currentUser.role === "ADMIN" ? "⚡ ATELIER ADMIN" : "💎 VALUED PATRON"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="dropdown-divider" />

          {/* Actionable Menu List */}
          <ul className="account-menu-list">
            <li>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => handleAction(currentUser ? onOpenAuth : onOpenAuth)}
              >
                <span className="menu-item-icon">👤</span>
                <span className="menu-item-label">My Account</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => handleAction(onOpenTracking)}
              >
                <span className="menu-item-icon">📦</span>
                <span className="menu-item-label">Orders & Tracking</span>
                <span className="item-pill">Live</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className="account-menu-item"
                onClick={() => handleAction(onOpenWishlist)}
              >
                <span className="menu-item-icon">♡</span>
                <span className="menu-item-label">Saved Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="menu-badge">{wishlistCount}</span>
                )}
              </button>
            </li>

            {/* Admin Portal Shortcut */}
            {currentUser?.role === "ADMIN" && (
              <li>
                <button
                  type="button"
                  className="account-menu-item admin-highlight"
                  onClick={() => handleAction(onOpenAdmin)}
                >
                  <span className="menu-item-icon">⚡</span>
                  <span className="menu-item-label">Admin Management Portal</span>
                </button>
              </li>
            )}
          </ul>

          {/* Sign Out Action for Logged In User */}
          {currentUser && (
            <>
              <div className="dropdown-divider" />
              <div className="account-popover-footer">
                <button
                  type="button"
                  className="account-signout-btn"
                  onClick={() => handleAction(onSignOut)}
                >
                  <span>Sign Out</span>
                  <span className="signout-icon">⎋</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
