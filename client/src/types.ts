export interface Product {
  id: string;
  externalId?: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  stock: number;
  initialStock?: number;
  rating?: number;
  reviewCount?: number;
  hasVariants?: boolean;
  minPrice?: number;
  campaignTag?: "BLACK_FRIDAY" | "FLASH_SALE" | "BOGOF" | "SCAVENGER_HUNT";
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tag?: string;
  fitGuide?: "Runs Small" | "True to Size" | "Runs Large";
  material?: string;
  // Step 4: Marketplace & Seller Integrations
  sellerType?: "1P" | "3P"; // 1P = Vroom Direct / Atelier; 3P = Marketplace Partner
  sellerName?: string; // e.g. "Vroom Direct", "SteamOne Paris", "Courant Studio Official"
  sellerRating?: number; // e.g. 96 (%)
  isFulfilledByVroom?: boolean; // Express fulfillment badge
  warranty?: string; // e.g. "+ 12 Month Warranty", "2-Year Manufacturer Warranty", "Lifetime Craftsmanship Guarantee"
  bundledIncentive?: string; // e.g. "+ FREE 43\" SMART TV", "+ FREE Qi2 FAST CHARGE CABLE", "+ FREE SILK CARE KIT"
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gad_campaignid?: string;
  affiliate_id?: string;
  jforce_agent_id?: string;
  capturedAt: string;
}

export interface CampaignEvent {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discountHighlight: string;
  image: string;
  targetCategory?: string;
  targetQuery?: string;
  campaignKey: "black_friday" | "scavenger_hunt" | "bogof" | "flash_sale";
  affiliateParams: {
    utm_campaign: string;
    utm_source: string;
    utm_medium: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  isVerified?: boolean;
}

// ---------------- Multi-Tenant Vendor & Marketplace Types ----------------
export interface VendorProfile {
  merchantId: string;
  storeName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  cacNumber?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  sellerType: "3P";
  status: "VERIFIED" | "PENDING";
  rating: number; // e.g. 98%
  fulfilledByVroom: boolean;
  totalSalesNGN: number;
  availablePayoutNGN: number;
  totalOrders: number;
  activeListingsCount: number;
  joinedDate: string;
  isOpen: boolean;
}

export interface VendorProductListing {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  warranty: string;
  bundledIncentive?: string;
  image: string;
  status: "ACTIVE" | "PENDING_REVIEW" | "OUT_OF_STOCK";
  createdAt: string;
}

// ---------------- JForce Reseller / Affiliate Types ----------------
export type JForceTier = "BRONZE" | "SILVER" | "GOLD_ELITE";

export interface JForceAgent {
  agentId: string; // e.g. "JF-LAGOS-8821"
  fullName: string;
  email: string;
  phone: string;
  city: string;
  tier: JForceTier;
  commissionRate: number; // e.g. 0.05, 0.08, 0.12
  referralCode: string;
  walletBalanceNGN: number;
  lifetimeEarningsNGN: number;
  totalOrdersCount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface JForceCommissionRecord {
  id: string;
  orderId: string;
  date: string;
  customerName: string;
  orderTotalNGN: number;
  commissionNGN: number;
  ratePercent: number;
  status: "APPROVED" | "PENDING" | "PAID";
}

export interface JForcePayoutRequest {
  id: string;
  agentId: string;
  amountNGN: number;
  bankName: string;
  accountNumber: string;
  reference: string;
  status: "PROCESSING" | "COMPLETED";
  requestedAt: string;
}
