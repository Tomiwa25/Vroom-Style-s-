import React from "react";
import type { CampaignEvent } from "../types";

interface CampaignBannerGridProps {
  onSelectCampaign: (campaign: CampaignEvent) => void;
  activeCampaignKey: string | null;
  onClearCampaign: () => void;
}

const CAMPAIGN_EVENTS: CampaignEvent[] = [
  {
    id: "camp-01",
    title: "BLACK FRIDAY DEALS",
    subtitle: "Up to -56% OFF",
    badge: "ANNUAL DROP",
    discountHighlight: "UP TO -56%",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    campaignKey: "black_friday",
    targetQuery: "",
    affiliateParams: {
      utm_campaign: "black_friday_deals",
      utm_source: "homepage_banner_grid",
      utm_medium: "promotional_tile",
    },
  },
  {
    id: "camp-02",
    title: "BUY ONE GET ONE (BOGOF)",
    subtitle: "Pair & Save 50% Off",
    badge: "BUNDLE PERK",
    discountHighlight: "50% OFF 2ND",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85",
    campaignKey: "bogof",
    targetQuery: "",
    affiliateParams: {
      utm_campaign: "bogof_pairs",
      utm_source: "homepage_banner_grid",
      utm_medium: "bundle_tile",
    },
  },
  {
    id: "camp-03",
    title: "SECRET SCAVENGER HUNT",
    subtitle: "Find Voucher Code & Save ₦15k",
    badge: "MYSTERY VOUCHER",
    discountHighlight: "EXTRA ₦15,000",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85",
    campaignKey: "scavenger_hunt",
    targetQuery: "",
    affiliateParams: {
      utm_campaign: "scavenger_hunt_event",
      utm_source: "interactive_grid",
      utm_medium: "gamified_banner",
    },
  },
  {
    id: "camp-04",
    title: "OFFICIAL STORE DAY",
    subtitle: "100% Certified Authentic",
    badge: "SUPER BRAND",
    discountHighlight: "FREE EXPRESS",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
    campaignKey: "flash_sale",
    targetCategory: "Official Store",
    affiliateParams: {
      utm_campaign: "official_store_day",
      utm_source: "homepage_banner_grid",
      utm_medium: "brand_day_tile",
    },
  },
];

export const CampaignBannerGrid: React.FC<CampaignBannerGridProps> = ({
  onSelectCampaign,
  activeCampaignKey,
  onClearCampaign,
}) => {
  return (
    <section className="campaign-banner-grid-section" aria-label="Featured Seasonal Promotions">
      {/* Active Campaign Attribution Header if user arrived via campaign or selected one */}
      {activeCampaignKey && (
        <div className="active-campaign-banner-strip">
          <div className="campaign-strip-content">
            <span className="campaign-pulse-icon">🏷️</span>
            <span>
              Active Marketing Event:{" "}
              <strong className="campaign-key-label">{activeCampaignKey.replace(/_/g, " ").toUpperCase()}</strong>{" "}
              — Special affiliate discount pricing and seasonal perks unlocked!
            </span>
          </div>
          <button
            type="button"
            className="clear-campaign-btn"
            onClick={onClearCampaign}
            title="Reset active promotional event"
          >
            Clear Event ×
          </button>
        </div>
      )}

      <div className="campaign-grid-header">
        <span className="kicker">CURATED PROMOTIONS</span>
        <h2>Seasonal Events & Special Drops</h2>
      </div>

      <div className="campaign-tiles-grid">
        {CAMPAIGN_EVENTS.map((event) => {
          const isActive =
            activeCampaignKey &&
            (activeCampaignKey === event.campaignKey ||
              activeCampaignKey === event.affiliateParams.utm_campaign);

          return (
            <div
              key={event.id}
              className={`campaign-tile-card ${isActive ? "active-event" : ""}`}
              onClick={() => onSelectCampaign(event)}
              role="button"
              tabIndex={0}
            >
              <div className="campaign-tile-img-wrap">
                <img
                  src={event.image}
                  alt={event.title}
                  className="campaign-tile-img"
                  loading="lazy"
                />
                <div className="campaign-tile-overlay" />
                <span className="campaign-tile-badge">{event.badge}</span>
                <span className="campaign-discount-pill">{event.discountHighlight}</span>
              </div>

              <div className="campaign-tile-content">
                <h3 className="campaign-tile-title">{event.title}</h3>
                <p className="campaign-tile-sub">{event.subtitle}</p>
                <div className="campaign-tile-cta">
                  <span>Enter Event</span>
                  <span className="cta-arrow">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
