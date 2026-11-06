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
  campaignTag?: "BLACK_FRIDAY" | "FLASH_SALE" | "BOGOF" | "SCAVENGER_HUNT";
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tag?: string;
  fitGuide?: "Runs Small" | "True to Size" | "Runs Large";
  material?: string;
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gad_campaignid?: string;
  affiliate_id?: string;
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
