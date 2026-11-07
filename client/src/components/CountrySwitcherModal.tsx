import React, { useState } from "react";
import type { CountryRegion } from "../types";
import { AFRICAN_REGIONS } from "../data/regions";

interface CountrySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: CountryRegion;
  onSelectRegion: (region: CountryRegion) => void;
  onSuccessToast: (msg: string) => void;
}

export const CountrySwitcherModal: React.FC<CountrySwitcherModalProps> = ({
  isOpen,
  onClose,
  currentRegion,
  onSelectRegion,
  onSuccessToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredRegions = AFRICAN_REGIONS.filter((region) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      region.name.toLowerCase().includes(q) ||
      region.currency.toLowerCase().includes(q) ||
      region.language.toLowerCase().includes(q) ||
      region.domain.toLowerCase().includes(q)
    );
  });

  const handleCountryPick = (region: CountryRegion) => {
    onSelectRegion(region);
    try {
      localStorage.setItem("vroom_selected_region", JSON.stringify(region));
    } catch {
      // ignore
    }
    onSuccessToast(`Region switched to ${region.name} (${region.flag} ${region.currency}) • Routing to ${region.domain}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card country-switcher-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close regional switcher"
        >
          ✕
        </button>

        <div className="country-modal-header">
          <div className="country-modal-title-row">
            <span className="globe-icon">🌍</span>
            <div>
              <h3>Select Country & Regional Storefront</h3>
              <p>
                Browse country-specific top-level domains, localized settlement currencies, and regional logistics hubs across Africa.
              </p>
            </div>
          </div>

          {/* Search Filter */}
          <div className="country-search-bar">
            <input
              type="text"
              placeholder="Search country, currency, or language (e.g., Ghana, KES, Français)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vroom-input country-search-input"
              autoFocus
            />
          </div>
        </div>

        {/* Current Active Region Indicator */}
        <div className="active-country-banner">
          <span className="active-banner-label">Current Active Region:</span>
          <div className="active-country-pill">
            <span className="flag">{currentRegion.flag}</span>
            <strong>{currentRegion.name}</strong>
            <span className="domain-chip">{currentRegion.domain}</span>
            <span className="currency-chip">{currentRegion.currency} ({currentRegion.currencySymbol})</span>
          </div>
        </div>

        {/* Country Grid */}
        <div className="country-cards-grid">
          {filteredRegions.map((region) => {
            const isCurrent = region.code === currentRegion.code;
            return (
              <div
                key={region.code}
                className={`country-region-card ${isCurrent ? "current" : ""}`}
                onClick={() => handleCountryPick(region)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCountryPick(region);
                  }
                }}
              >
                <div className="region-card-top">
                  <span className="region-flag">{region.flag}</span>
                  <div className="region-name-group">
                    <strong className="region-name">{region.name}</strong>
                    <span className="region-domain">{region.domain}</span>
                  </div>
                  {isCurrent && <span className="current-badge">ACTIVE</span>}
                </div>

                <div className="region-card-meta">
                  <div className="meta-row">
                    <span>Currency:</span>
                    <strong>{region.currency} ({region.currencySymbol})</strong>
                  </div>
                  <div className="meta-row">
                    <span>Language:</span>
                    <span>{region.language}</span>
                  </div>
                  <div className="meta-row">
                    <span>Express Transit:</span>
                    <span>{region.deliveryTimeDays}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`region-select-btn ${isCurrent ? "active-btn" : ""}`}
                >
                  {isCurrent ? "Selected Region ✓" : `Switch to ${region.name} →`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="country-modal-footer">
          <span>
            🛡️ All cross-border regional shipments are duty-paid with all customs clearance handled by Vroom International Freight.
          </span>
        </div>
      </div>
    </div>
  );
};
