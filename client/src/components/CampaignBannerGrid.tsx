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

/** House titles. The stored event names are shouted; the page states them. */
const DISPLAY_TITLES: Record<string, string> = {
  "camp-01": "Black Friday",
  "camp-02": "Buy one, get one",
  "camp-03": "Secret scavenger hunt",
  "camp-04": "Official store day",
};

export const CampaignBannerGrid: React.FC<CampaignBannerGridProps> = ({
  onSelectCampaign,
  activeCampaignKey,
  onClearCampaign,
}) => {
  return (
    <section className="showcase showcase-events" aria-labelledby="events-title">
      {activeCampaignKey && (
        <div className="event-active-line" role="status">
          <p>
            You are shopping <strong>{activeCampaignKey.replace(/_/g, " ")}</strong> pricing.
          </p>
          <button type="button" className="showcase-link is-quiet" onClick={onClearCampaign}>
            Leave event
          </button>
        </div>
      )}

      <header className="showcase-head">
        <div className="showcase-head-copy">
          <span className="showcase-kicker">Running now</span>
          <h2 className="showcase-title" id="events-title">
            Four ways in this season
          </h2>
          <p className="showcase-lede">
            Each one changes what lands in your bag, not the price you were quoted
            before you arrived.
          </p>
        </div>
      </header>

      <div className="event-grid">
        {CAMPAIGN_EVENTS.map((event) => {
          const isActive =
            !!activeCampaignKey &&
            (activeCampaignKey === event.campaignKey ||
              activeCampaignKey === event.affiliateParams.utm_campaign);

          return (
            <button
              key={event.id}
              type="button"
              className={`event-tile ${isActive ? "is-active" : ""}`}
              onClick={() => onSelectCampaign(event)}
              aria-pressed={isActive}
            >
              <span className="event-tile-media">
                <img src={event.image} alt="" loading="lazy" />
              </span>
              <span className="event-tile-body">
                <span className="event-tile-title">{DISPLAY_TITLES[event.id] ?? event.title}</span>
                <span className="event-tile-line">{event.subtitle}</span>
                <span className="event-tile-enter">
                  {isActive ? "Shopping this event" : "Enter the event"}
                  <span aria-hidden="true">→</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
