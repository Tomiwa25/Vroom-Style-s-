/**
 * Device & OS Detection utilities for App Store Deep-Linking and Smart Banners.
 */

export type UserOS = "ios" | "android" | "desktop";

export interface AppStoreConfig {
  os: UserOS;
  storeName: string;
  storeIcon: string;
  badgeLabel: string;
  appTitle: string;
  ratingText: string;
  downloadUrl: string;
  protocolUrl: string;
}

export const OFFICIAL_WHATSAPP_NUMBER = "2349130831439";
export const OFFICIAL_WHATSAPP_DISPLAY = "+234 913 083 1439";

/**
 * Detect client operating system from Navigator User-Agent
 */
export function detectUserOS(): UserOS {
  if (typeof window === "undefined" || !navigator) return "desktop";

  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream) {
    return "ios";
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return "android";
  }

  return "desktop";
}

/**
 * Retrieve deep link & store configuration according to user device OS
 */
export function getAppStoreConfig(os: UserOS): AppStoreConfig {
  switch (os) {
    case "ios":
      return {
        os: "ios",
        storeName: "Apple App Store",
        storeIcon: "",
        badgeLabel: "Download on the App Store",
        appTitle: "Vroom Style(s): Luxury Atelier",
        ratingText: "4.9 ★ • #1 in Shopping",
        downloadUrl: "https://apps.apple.com/app/vroom-styles/id6478912345",
        protocolUrl: "vroomstyles://open",
      };
    case "android":
      return {
        os: "android",
        storeName: "Google Play Store",
        storeIcon: "▶",
        badgeLabel: "GET IT ON Google Play",
        appTitle: "Vroom Style(s): Fashion & Living",
        ratingText: "4.8 ★ • 100K+ Downloads",
        downloadUrl: "https://play.google.com/store/apps/details?id=com.vroomstyles.app",
        protocolUrl: "intent://vroomstyles.com#Intent;scheme=vroomstyles;package=com.vroomstyles.app;end",
      };
    case "desktop":
    default:
      return {
        os: "desktop",
        storeName: "App Store & Google Play",
        storeIcon: "📱",
        badgeLabel: "Download Mobile App",
        appTitle: "Vroom Style(s) for iOS & Android",
        ratingText: "4.9 ★ Verified on iOS & Android",
        downloadUrl: "https://apps.apple.com/app/vroom-styles/id6478912345",
        protocolUrl: "https://play.google.com/store/apps/details?id=com.vroomstyles.app",
      };
  }
}

/**
 * Trigger WhatsApp deep-link utilizing external protocol handlers (whatsapp://)
 * with graceful fallback to browser HTTPS web link (https://wa.me/).
 */
export function openWhatsAppChat(
  phone: string = OFFICIAL_WHATSAPP_NUMBER,
  message: string = "Hello Vroom Style(s), I have an inquiry about my atelier order."
): void {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  const protocolUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
  const webUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  if (typeof window === "undefined") return;

  // Attempt opening via native protocol handler on mobile/desktop app
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Try native app scheme first
    const now = Date.now();
    window.location.href = protocolUrl;

    // If native app doesn't open within 1.2 seconds, fallback to web wa.me
    setTimeout(() => {
      if (Date.now() - now < 1800) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 1200);
  } else {
    // On desktop, open web link directly in a new tab
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}
