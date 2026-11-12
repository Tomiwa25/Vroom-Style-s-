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
  fitGuide?: "Runs Small" | "True to Size" | "Runs Large" | string;
  material?: string;
  // Step 4: Marketplace & Seller Integrations
  sellerType?: "1P" | "3P"; // 1P = Vroom Direct / Atelier; 3P = Marketplace Partner
  sellerName?: string; // e.g. "Vroom Direct", "SteamOne Paris", "Courant Studio Official"
  sellerRating?: number; // e.g. 96 (%)
  isFulfilledByVroom?: boolean; // Express fulfillment badge
  warranty?: string; // e.g. "+ 12 Month Warranty", "2-Year Manufacturer Warranty", "Lifetime Craftsmanship Guarantee"
  bundledIncentive?: string; // e.g. "+ FREE 43\" SMART TV", "+ FREE Qi2 FAST CHARGE CABLE", "+ FREE SILK CARE KIT"
  // Step 5: Conversion & Checkout Enablers
  isPodEligible?: boolean; // Payment on Delivery (PoD) post-delivery settlement eligibility
  podTerms?: string; // PoD settlement terms e.g. "Pay with POS/Cash upon doorstep inspection"
  imagePrompt?: string; // Generative AI photographic prompt for Midjourney / Imagen
  specs?: Record<string, string>; // Key automotive, appliance, or tech specifications
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

// ---------------- Step 5: Vroom Delivery Parcel-Shipping Micro-Services ----------------
export type DeliverySpeed = "EXPRESS_SAME_DAY" | "NEXT_DAY" | "STANDARD" | "INTERSTATE";
export type ParcelCategory = "APPAREL_FASHION" | "ELECTRONICS" | "FRAGILE_LUXURY" | "DOCUMENTS" | "BULK_CARGO";

export interface PodCheckoutDetails {
  address: string;
  phone: string;
  city: string;
  deliveryNotes?: string;
}

export interface DeliveryRateQuote {
  originCity: string;
  destinationCity: string;
  weightKg: number;
  speed: DeliverySpeed;
  speedLabel: string;
  baseRateNGN: number;
  insuranceNGN: number;
  fuelSurchargeNGN: number;
  totalRateNGN: number;
  estimatedTransit: string;
}

export interface DeliveryTrackingMilestone {
  stage: "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  title: string;
  timestamp: string;
  location: string;
  note: string;
  completed: boolean;
}

export interface VroomDeliveryShipment {
  waybillNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  parcelCategory: ParcelCategory;
  weightKg: number;
  speed: DeliverySpeed;
  declaredValueNGN: number;
  requiresPodSettlement: boolean;
  podCollectionAmountNGN?: number;
  totalCostNGN: number;
  paymentMode: "PREPAID" | "POD_COLLECTION";
  status: "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  createdAt: string;
  timeline: DeliveryTrackingMilestone[];
}

// ---------------- Step 7: Footer Architecture & Internationalization (i18n) ----------------
export interface CountryRegion {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  domain: string;
  subdomain: string;
  path: string;
  language: string;
  exchangeRateToNGN: number;
  deliveryTimeDays: string;
  customsCovered: boolean;
  isActiveFlagship?: boolean;
}

export interface CookieConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  updatedAt: string;
}

export interface DisputeTicket {
  ticketId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  disputeType: "DAMAGED_GOODS" | "DELAYED_DELIVERY" | "WRONG_SIZE_COLOR" | "REFUND_DELAY" | "POD_OVERCHARGE";
  description: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED";
  submittedAt: string;
}
