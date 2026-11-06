import { useState, useCallback } from "react";
import type { AttributionData } from "../types";

const STORAGE_KEY = "vroom_attribution";

const parseInitialAttribution = (): AttributionData | null => {
  if (typeof window === "undefined") return null;

  // 1. Check current URL query parameters for fresh campaign attribution
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get("utm_source") || undefined;
  const utm_medium = params.get("utm_medium") || undefined;
  const utm_campaign = params.get("utm_campaign") || undefined;
  const gad_campaignid = params.get("gad_campaignid") || params.get("gclid") || undefined;
  const affiliate_id = params.get("affiliate_id") || params.get("ref") || undefined;

  if (utm_source || utm_campaign || gad_campaignid || affiliate_id) {
    const freshAttribution: AttributionData = {
      utm_source,
      utm_medium,
      utm_campaign,
      gad_campaignid,
      affiliate_id,
      capturedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(freshAttribution));
    } catch (err) {
      console.warn("Could not save attribution to sessionStorage", err);
    }

    return freshAttribution;
  }

  // 2. Fall back to existing session attribution
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

/**
 * Custom hook to capture, persist, and manage affiliate and marketing campaign attribution parameters
 * (utm_source, utm_medium, utm_campaign, gad_campaignid, affiliate_id).
 */
export function useAttribution() {
  const [attribution, setAttribution] = useState<AttributionData | null>(parseInitialAttribution);

  const [activeCampaign, setActiveCampaign] = useState<string | null>(
    () => attribution?.utm_campaign || null
  );

  const setCampaign = useCallback(
    (campaignKey: string, extraParams?: Partial<AttributionData>) => {
      const updated: AttributionData = {
        utm_source: extraParams?.utm_source || "vroom_promotions",
        utm_medium: extraParams?.utm_medium || "banner_grid",
        utm_campaign: campaignKey,
        gad_campaignid: extraParams?.gad_campaignid,
        affiliate_id: extraParams?.affiliate_id,
        capturedAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not persist campaign attribution", err);
      }

      setAttribution(updated);
      setActiveCampaign(campaignKey);

      // Reflect in URL query string without reloading
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("utm_campaign", campaignKey);
        if (updated.utm_source) url.searchParams.set("utm_source", updated.utm_source);
        if (updated.utm_medium) url.searchParams.set("utm_medium", updated.utm_medium);
        window.history.replaceState({}, "", url.toString());
      }
    },
    []
  );

  const clearCampaign = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Could not clear attribution", err);
    }
    setAttribution(null);
    setActiveCampaign(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("utm_campaign");
      url.searchParams.delete("utm_source");
      url.searchParams.delete("utm_medium");
      url.searchParams.delete("gad_campaignid");
      url.searchParams.delete("affiliate_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  return {
    attribution,
    activeCampaign,
    setCampaign,
    clearCampaign,
  };
}
