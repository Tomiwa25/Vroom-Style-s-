import React, { useState } from "react";
import type { VendorProfile, VendorProductListing, Product, VendorOrder } from "../types";

interface VendorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "overview" | "inventory" | "orders" | "payouts" | "onboarding" | "hub";
  onSuccessToast: (msg: string) => void;
  onAddNewProduct?: (product: Product) => void;
  formatPrice?: (amount: number) => string;
}

const DEFAULT_VENDOR_PROFILE: VendorProfile = {
  merchantId: "VRM-MKT-94281",
  storeName: "Courant Atelier & Living",
  category: "Fashion & Atelier",
  contactName: "Monique Vance",
  email: "partner@courantstudio.com",
  phone: "+234 812 345 6789",
  city: "Lagos (Ikeja Hub)",
  cacNumber: "RC-1849204",
  bankName: "Access Bank Nigeria",
  accountNumber: "0123456789",
  accountName: "Courant Studio West Africa Ltd",
  sellerType: "3P",
  status: "VERIFIED",
  rating: 98,
  fulfilledByVroom: true,
  totalSalesNGN: 2450000,
  availablePayoutNGN: 385000,
  totalOrders: 34,
  activeListingsCount: 3,
  joinedDate: "2025-10-15",
  isOpen: true,
};

const INITIAL_VENDOR_LISTINGS: VendorProductListing[] = [
  {
    id: "v-list-1",
    name: "Contour Mulberry Silk Evening Slip",
    category: "Fashion & Atelier",
    price: 58000,
    originalPrice: 85000,
    stock: 12,
    warranty: "Lifetime Craftsmanship Guarantee",
    bundledIncentive: "+ FREE SILK CARE TRAVEL POUCH",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Oat Sand", hex: "#D9CDBF" },
      { name: "Noir", hex: "#1A1A1A" },
    ],
    material: "100% Organic Mulberry Silk",
    fitGuide: "True to Size",
    sku: "CRT-SLK-01",
    salesCount: 18,
    revenueNGN: 1044000,
    status: "ACTIVE",
    createdAt: "2026-02-10",
  },
  {
    id: "v-list-2",
    name: "Architectural Calfskin Flap Messenger",
    category: "Accessories",
    price: 78000,
    originalPrice: 120000,
    stock: 8,
    warranty: "+ 24 Month Seam Protection",
    bundledIncentive: "+ FREE BRASS KEY FOB",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    ],
    sizes: ["One Size"],
    colors: [
      { name: "Cognac Tan", hex: "#C68642" },
      { name: "Ebony", hex: "#222222" },
    ],
    material: "Full-Grain Italian Calfskin Leather",
    fitGuide: "True to Size",
    sku: "CRT-BAG-02",
    salesCount: 11,
    revenueNGN: 858000,
    status: "ACTIVE",
    createdAt: "2026-02-18",
  },
  {
    id: "v-list-3",
    name: "Oversized Ribbed Cashmere Crewneck",
    category: "Knitwear",
    price: 49000,
    originalPrice: 75000,
    stock: 5,
    warranty: "100% Authenticity Guaranteed",
    bundledIncentive: "+ CEDAR STORAGE BLOCKS",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Raw Oatmeal", hex: "#E3DDD2" },
      { name: "Charcoal", hex: "#3A3A3C" },
    ],
    material: "70% Grade-A Mongolian Cashmere, 30% Merino",
    fitGuide: "Runs Large",
    sku: "CRT-KNT-03",
    salesCount: 5,
    revenueNGN: 245000,
    status: "ACTIVE",
    createdAt: "2026-03-01",
  },
];

const INITIAL_VENDOR_ORDERS: VendorOrder[] = [
  {
    orderId: "VRM-ORD-94281",
    customerName: "Chidinma Nwosu",
    customerCity: "Victoria Island, Lagos",
    items: [
      {
        listingId: "v-list-1",
        productName: "Contour Mulberry Silk Evening Slip",
        quantity: 1,
        price: 58000,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Noir",
      },
    ],
    grossTotalNGN: 58000,
    platformFeeNGN: 5800,
    netPayoutNGN: 52200,
    fulfillmentStatus: "PENDING_DISPATCH",
    createdAt: "Today, 10:45 AM",
  },
  {
    orderId: "VRM-ORD-94190",
    customerName: "Babajide Adeleke",
    customerCity: "Maitama, Abuja FCT",
    items: [
      {
        listingId: "v-list-2",
        productName: "Architectural Calfskin Flap Messenger",
        quantity: 1,
        price: 78000,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
        size: "One Size",
        color: "Cognac Tan",
      },
    ],
    grossTotalNGN: 78000,
    platformFeeNGN: 7800,
    netPayoutNGN: 70200,
    fulfillmentStatus: "IN_TRANSIT",
    createdAt: "Yesterday, 3:12 PM",
  },
  {
    orderId: "VRM-ORD-93910",
    customerName: "Kemi Balogun",
    customerCity: "GRA Phase 2, Port Harcourt",
    items: [
      {
        listingId: "v-list-3",
        productName: "Oversized Ribbed Cashmere Crewneck",
        quantity: 2,
        price: 49000,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80",
        size: "L",
        color: "Raw Oatmeal",
      },
    ],
    grossTotalNGN: 98000,
    platformFeeNGN: 9800,
    netPayoutNGN: 88200,
    fulfillmentStatus: "DELIVERED",
    createdAt: "3 days ago",
  },
];

// Presets by category to help vendors populate 3-angle triads instantly if they do not have URLs
const CATEGORY_TRIAD_PRESETS: Record<string, [string, string, string]> = {
  "Fashion & Atelier": [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
  ],
  "Accessories": [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
  ],
  "Knitwear": [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
  ],
  "Outerwear": [
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
  ],
  "Footwear": [
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85",
  ],
};

export const VendorPortalModal: React.FC<VendorPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "overview",
  onSuccessToast,
  onAddNewProduct,
  formatPrice = (amount) => `₦${amount.toLocaleString()}`,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "orders" | "payouts" | "onboarding">(
    initialTab === "onboarding" ? "onboarding" : initialTab === "hub" ? "overview" : initialTab || "overview"
  );

  // Vendor Profile State
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>(() => {
    try {
      const saved = localStorage.getItem("vroom_vendor_profile");
      return saved ? JSON.parse(saved) : DEFAULT_VENDOR_PROFILE;
    } catch {
      return DEFAULT_VENDOR_PROFILE;
    }
  });

  // Vendor Listings State
  const [listings, setListings] = useState<VendorProductListing[]>(() => {
    try {
      const saved = localStorage.getItem("vroom_vendor_listings");
      return saved ? JSON.parse(saved) : INITIAL_VENDOR_LISTINGS;
    } catch {
      return INITIAL_VENDOR_LISTINGS;
    }
  });

  // Vendor Orders State
  const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>(() => {
    try {
      const saved = localStorage.getItem("vroom_vendor_orders");
      return saved ? JSON.parse(saved) : INITIAL_VENDOR_ORDERS;
    } catch {
      return INITIAL_VENDOR_ORDERS;
    }
  });

  // ---------------- Onboarding Wizard State ----------------
  const [obStep, setObStep] = useState<1 | 2 | 3>(1);
  const [obStoreName, setObStoreName] = useState("");
  const [obCategory, setObCategory] = useState("Fashion & Atelier");
  const [obContact, setObContact] = useState("");
  const [obEmail, setObEmail] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obCity, setObCity] = useState("Lagos (Ikeja Hub)");
  const [obCacNumber, setObCacNumber] = useState("");
  const [obBank, setObBank] = useState("Access Bank Nigeria");
  const [obAccountNumber, setObAccountNumber] = useState("");
  const [obAccountName, setObAccountName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [newMerchantId, setNewMerchantId] = useState<string | null>(null);

  // ---------------- Separate Inventory Upload Form State ----------------
  const [isAddingDrop, setIsAddingDrop] = useState(false);
  const [dropTitle, setDropTitle] = useState("");
  const [dropCategory, setDropCategory] = useState("Fashion & Atelier");
  const [dropPrice, setDropPrice] = useState("");
  const [dropOriginalPrice, setDropOriginalPrice] = useState("");
  const [dropStock, setDropStock] = useState("15");
  const [dropWarranty, setDropWarranty] = useState("Lifetime Craftsmanship Guarantee");
  const [dropBundledIncentive, setDropBundledIncentive] = useState("+ FREE SILK CARE KIT");
  const [dropMaterial, setDropMaterial] = useState("100% Organic Mulberry Silk");
  const [dropFitGuide, setDropFitGuide] = useState<"Runs Small" | "True to Size" | "Runs Large">("True to Size");

  // REQUIRED 3-ANGLE FASHION TRIAD SLOTS
  const [slot1Editorial, setSlot1Editorial] = useState(CATEGORY_TRIAD_PRESETS["Fashion & Atelier"][0]);
  const [slot2Studio, setSlot2Studio] = useState(CATEGORY_TRIAD_PRESETS["Fashion & Atelier"][1]);
  const [slot3Detail, setSlot3Detail] = useState(CATEGORY_TRIAD_PRESETS["Fashion & Atelier"][2]);
  const [previewAngleIndex, setPreviewAngleIndex] = useState<0 | 1 | 2>(0);

  if (!isOpen) return null;

  // Auto-fill Triad Presets when Category Changes in Upload Form
  const handleCategoryChange = (newCat: string) => {
    setDropCategory(newCat);
    const presets = CATEGORY_TRIAD_PRESETS[newCat] || CATEGORY_TRIAD_PRESETS["Fashion & Atelier"];
    setSlot1Editorial(presets[0]);
    setSlot2Studio(presets[1]);
    setSlot3Detail(presets[2]);
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    setTimeout(() => {
      const genId = `VRM-MKT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newProfile: VendorProfile = {
        merchantId: genId,
        storeName: obStoreName || "New Merchant Atelier",
        category: obCategory,
        contactName: obContact || "Store Representative",
        email: obEmail || "merchant@vroomstyles.ng",
        phone: obPhone || "+234 800 000 0000",
        city: obCity,
        cacNumber: obCacNumber || "RC-1849204",
        bankName: obBank,
        accountNumber: obAccountNumber || "0123456789",
        accountName: obAccountName || obStoreName,
        sellerType: "3P",
        status: "VERIFIED",
        rating: 100,
        fulfilledByVroom: true,
        totalSalesNGN: 0,
        availablePayoutNGN: 0,
        totalOrders: 0,
        activeListingsCount: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        isOpen: true,
      };

      setVendorProfile(newProfile);
      setNewMerchantId(genId);
      setIsRegistering(false);
      try {
        localStorage.setItem("vroom_vendor_profile", JSON.stringify(newProfile));
      } catch (err) {
        console.warn("Storage error", err);
      }
      onSuccessToast(`🎉 Congratulations! Store registered with Merchant ID: ${genId}`);
      setActiveTab("overview");
    }, 700);
  };

  // Publish New Product Listing with Required 3-Angle Triad
  const handlePublishListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropTitle || !dropPrice || !dropStock) {
      onSuccessToast("Please complete all required product fields.");
      return;
    }

    if (!slot1Editorial || !slot2Studio || !slot3Detail) {
      onSuccessToast("All 3 photo angles (Editorial, Studio, Detail) are required for 360° digital fitting.");
      return;
    }

    const numPrice = Number(dropPrice);
    const numOrig = dropOriginalPrice ? Number(dropOriginalPrice) : Math.round(numPrice * 1.35);
    const numStock = Number(dropStock);
    const triadImages = [slot1Editorial.trim(), slot2Studio.trim(), slot3Detail.trim()];

    const newListing: VendorProductListing = {
      id: `v-list-${Date.now()}`,
      name: dropTitle,
      category: dropCategory,
      price: numPrice,
      originalPrice: numOrig,
      stock: numStock,
      warranty: dropWarranty,
      bundledIncentive: dropBundledIncentive || undefined,
      image: triadImages[0],
      images: triadImages,
      material: dropMaterial,
      fitGuide: dropFitGuide,
      sku: `VRM-${dropCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      salesCount: 0,
      revenueNGN: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedListings = [newListing, ...listings];
    setListings(updatedListings);
    try {
      localStorage.setItem("vroom_vendor_listings", JSON.stringify(updatedListings));
    } catch (err) {
      console.warn("Storage error", err);
    }

    // Inject into parent store catalog so it appears in the storefront with 360° Triad!
    if (onAddNewProduct) {
      const productToAdd: Product = {
        id: `3p-${Date.now()}`,
        name: dropTitle,
        description: `Verified 3P artisan piece by ${vendorProfile.storeName}. Tailored in ${dropMaterial}. Includes ${dropWarranty}.`,
        price: numPrice,
        originalPrice: numOrig,
        stock: numStock,
        initialStock: numStock,
        image: triadImages[0],
        images: triadImages,
        category: dropCategory,
        brand: vendorProfile.storeName,
        sellerType: "3P",
        sellerName: vendorProfile.storeName,
        sellerRating: vendorProfile.rating,
        isFulfilledByVroom: true,
        warranty: dropWarranty,
        bundledIncentive: dropBundledIncentive || undefined,
        material: dropMaterial,
        fitGuide: dropFitGuide,
        sizes: dropCategory === "Accessories" ? ["One Size"] : ["S", "M", "L", "XL"],
        colors: [
          { name: "Oat Sand", hex: "#D9CDBF" },
          { name: "Obsidian Noir", hex: "#181614" },
        ],
        rating: 5.0,
        reviewCount: 1,
        hasVariants: true,
        minPrice: numPrice,
        tag: "360° TRIAD DROP",
      };
      onAddNewProduct(productToAdd);
    }

    // Reset Form
    setDropTitle("");
    setDropPrice("");
    setDropOriginalPrice("");
    setDropStock("15");
    setIsAddingDrop(false);
    onSuccessToast(`✓ New marketplace drop "${dropTitle}" published with 360° Triad!`);
  };

  // Adjust Stock live from table (+ / -)
  const handleStockAdjustment = (listingId: string, delta: number) => {
    const updated = listings.map((item) => {
      if (item.id === listingId) {
        const newStock = Math.max(0, item.stock + delta);
        return {
          ...item,
          stock: newStock,
          status: (newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE") as "ACTIVE" | "OUT_OF_STOCK",
        };
      }
      return item;
    });
    setListings(updated);
    try {
      localStorage.setItem("vroom_vendor_listings", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
  };

  // Dispatch Order Action
  const handleUpdateFulfillment = (orderId: string, nextStatus: VendorOrder["fulfillmentStatus"]) => {
    const updated = vendorOrders.map((ord) => (ord.orderId === orderId ? { ...ord, fulfillmentStatus: nextStatus } : ord));
    setVendorOrders(updated);
    try {
      localStorage.setItem("vroom_vendor_orders", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
    onSuccessToast(`Order #${orderId} updated to: ${nextStatus.replace(/_/g, " ")}`);
  };

  // Request Paystack Settlement Payout
  const handleRequestPayout = () => {
    if (vendorProfile.availablePayoutNGN <= 0) {
      onSuccessToast("No available balance for payout at this time.");
      return;
    }
    const payoutAmount = vendorProfile.availablePayoutNGN;
    const updated = {
      ...vendorProfile,
      availablePayoutNGN: 0,
    };
    setVendorProfile(updated);
    try {
      localStorage.setItem("vroom_vendor_profile", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
    onSuccessToast(`✓ Automated Paystack Transfer initiated: ${formatPrice(payoutAmount)} sent to ${vendorProfile.bankName} (${vendorProfile.accountNumber})`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container vendor-portal-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1100 }}>
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">MULTI-TENANT MARKETPLACE PLATFORM</span>
            <h2 className="modal-title">Vendor & Merchant Command Center</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Global Tab Navigation */}
        <div className="vendor-portal-tabs-bar" style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--line)", padding: "12px 24px", overflowX: "auto" }}>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span>📊 Overview & Revenue</span>
          </button>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <span>📦 Inventory & 3-Angle Drops</span>
            <span style={{ fontSize: "11px", background: "var(--brand-tan)", color: "#fff", padding: "1px 6px", borderRadius: "10px", marginLeft: "6px" }}>
              {listings.length}
            </span>
          </button>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span>🚚 Orders & Dispatch</span>
            <span style={{ fontSize: "11px", background: "var(--brand-blue)", color: "#fff", padding: "1px 6px", borderRadius: "10px", marginLeft: "6px" }}>
              {vendorOrders.filter((o) => o.fulfillmentStatus === "PENDING_DISPATCH").length} New
            </span>
          </button>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "payouts" ? "active" : ""}`}
            onClick={() => setActiveTab("payouts")}
          >
            <span>💳 Payouts & Settlement</span>
          </button>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "onboarding" ? "active" : ""}`}
            onClick={() => setActiveTab("onboarding")}
          >
            <span>🚀 Onboarding Wizard</span>
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & SALES PERFORMANCE ================= */}
        {activeTab === "overview" && (
          <div className="vendor-tab-content" style={{ padding: "24px" }}>
            {newMerchantId && (
              <div style={{ background: "rgba(30, 58, 95, 0.08)", border: "1px solid var(--accent, #1E3A5F)", padding: "14px 18px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "var(--accent, #1E3A5F)", fontSize: "14px" }}>🎉 Congratulations! Store onboarded with Merchant ID: {newMerchantId}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                    Your store is verified on the VroomStyle network. You can now publish 3-angle drops and receive Paystack payouts.
                  </p>
                </div>
                <button
                  type="button"
                  style={{ background: "var(--accent, #1E3A5F)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => setNewMerchantId(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Store Identification Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-warm, #FAF8F4)", border: "1px solid var(--line, #E6DFD5)", padding: "16px 20px", borderRadius: "10px", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", background: "var(--accent, #1E3A5F)", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>
                    3P VERIFIED MERCHANT
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                    ID: {vendorProfile.merchantId}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--success, #3E6F58)", fontWeight: 700 }}>
                    ● 99.4% Fulfillment SLA
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{vendorProfile.storeName}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Hub: {vendorProfile.city} • Category: {vendorProfile.category} • Settlement: {vendorProfile.bankName}
                </span>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setActiveTab("inventory");
                  setIsAddingDrop(true);
                }}
              >
                + Upload 3-Angle Product Drop
              </button>
            </div>

            {/* Performance KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", padding: "18px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.06em" }}>Gross GMV Sales</span>
                <h3 style={{ margin: "8px 0 2px", fontSize: "24px", fontWeight: 800 }}>{formatPrice(vendorProfile.totalSalesNGN)}</h3>
                <span style={{ fontSize: "11px", color: "var(--success, #3E6F58)" }}>+14.2% vs last month</span>
              </div>

              <div style={{ background: "var(--paper, #fff)", border: "2px solid var(--brand-tan, #C59B6D)", padding: "18px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--brand-tan, #C59B6D)", fontWeight: 700, letterSpacing: "0.06em" }}>Available Payout</span>
                <h3 style={{ margin: "8px 0 2px", fontSize: "24px", fontWeight: 800, color: "var(--brand-tan, #C59B6D)" }}>{formatPrice(vendorProfile.availablePayoutNGN)}</h3>
                <button
                  type="button"
                  style={{ background: "none", border: "none", padding: 0, color: "var(--accent, #1E3A5F)", fontSize: "11px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  onClick={handleRequestPayout}
                >
                  Request Paystack Transfer →
                </button>
              </div>

              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", padding: "18px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.06em" }}>Orders Settled</span>
                <h3 style={{ margin: "8px 0 2px", fontSize: "24px", fontWeight: 800 }}>{vendorProfile.totalOrders}</h3>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>100% Doorstep SLA</span>
              </div>

              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", padding: "18px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.06em" }}>360° Live Drops</span>
                <h3 style={{ margin: "8px 0 2px", fontSize: "24px", fontWeight: 800 }}>{listings.length}</h3>
                <span style={{ fontSize: "11px", color: "var(--success, #3E6F58)" }}>● All Synchronized</span>
              </div>
            </div>

            {/* Sales Breakdown & Revenue Split Diagram */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", padding: "20px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  7-Day Sales Volume Velocity
                </h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "140px", paddingBottom: "10px", borderBottom: "1px solid var(--line, #E6DFD5)" }}>
                  {[
                    { day: "Mon", val: 320000, h: "45%" },
                    { day: "Tue", val: 450000, h: "60%" },
                    { day: "Wed", val: 280000, h: "35%" },
                    { day: "Thu", val: 620000, h: "85%" },
                    { day: "Fri", val: 780000, h: "100%" },
                    { day: "Sat", val: 510000, h: "70%" },
                    { day: "Sun", val: 390000, h: "52%" },
                  ].map((d) => (
                    <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{d.val / 1000}k</span>
                      <div style={{ width: "100%", background: "var(--accent, #1E3A5F)", borderRadius: "4px 4px 0 0", height: d.h }} />
                      <span style={{ fontSize: "11px", fontWeight: 700 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", padding: "20px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Marketplace Settlement Split
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Vendor Payout (90%)</span>
                    <strong>{formatPrice(Math.round(vendorProfile.totalSalesNGN * 0.9))}</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--soft, #EFEBE2)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "90%", height: "100%", background: "var(--brand-tan, #C59B6D)" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Vroom Infrastructure & Logistics (10%)</span>
                    <strong>{formatPrice(Math.round(vendorProfile.totalSalesNGN * 0.1))}</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--soft, #EFEBE2)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "10%", height: "100%", background: "var(--accent, #1E3A5F)" }} />
                  </div>
                  <small style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>
                    Covers door-to-door express dispatch, Paystack security, and customer returns insurance.
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVENTORY & 3-ANGLE UPLOAD ================= */}
        {activeTab === "inventory" && (
          <div className="vendor-tab-content" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Vendor Catalog & 360° Drops</h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Every product listed on VroomStyle requires the 3-angle Fashion Triad (Editorial, Studio Silhouette, Detail Texture).
                </span>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsAddingDrop((prev) => !prev)}
              >
                {isAddingDrop ? "Close Upload Form" : "+ Create 3-Angle Product Drop"}
              </button>
            </div>

            {/* SEPARATE INVENTORY UPLOAD FORM WITH REQUIRED 3-ANGLE PHOTO SLOTS */}
            {isAddingDrop && (
              <div style={{ background: "var(--paper-warm, #FAF8F4)", border: "2px solid var(--brand-tan, #C59B6D)", borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand-tan, #C59B6D)" }}>
                      REQUIRED 360° DIGITAL FITTING PIPELINE
                    </span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800 }}>Publish New Marketplace Product</h3>
                  </div>
                  <button
                    type="button"
                    style={{ background: "none", border: "1px solid var(--line, #E6DFD5)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                    onClick={() => handleCategoryChange(dropCategory)}
                  >
                    ↺ Load Category Triad Presets
                  </button>
                </div>

                <form onSubmit={handlePublishListing}>
                  {/* Basic Metadata */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Product Title *</label>
                      <input
                        required
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="e.g. Sculpted Mulberry Silk Midi Slip"
                        value={dropTitle}
                        onChange={(e) => setDropTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Department Category *</label>
                      <select
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        value={dropCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="Fashion & Atelier">Fashion & Atelier</option>
                        <option value="Outerwear">Outerwear & Coats</option>
                        <option value="Knitwear">Knitwear & Cashmere</option>
                        <option value="Accessories">Leather Bags & Accessories</option>
                        <option value="Footwear">Footwear & Loafers</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Selling Price (₦ NGN) *</label>
                      <input
                        type="number"
                        required
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="58000"
                        value={dropPrice}
                        onChange={(e) => setDropPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Original Strikethrough Price (₦)</label>
                      <input
                        type="number"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="85000"
                        value={dropOriginalPrice}
                        onChange={(e) => setDropOriginalPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Available Stock Units *</label>
                      <input
                        type="number"
                        required
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="15"
                        value={dropStock}
                        onChange={(e) => setDropStock(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* THE REQUIRED 3-ANGLE FASHION TRIAD SLOTS SECTION */}
                  <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", padding: "18px", marginBottom: "18px" }}>
                    <div style={{ marginBottom: "14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--brand-tan, #C59B6D)", letterSpacing: "0.08em" }}>
                        THE FASHION TRIAD (ALL 3 SLOTS REQUIRED)
                      </span>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                        Eliminates product mismatch. Every uploaded garment or accessory must provide these 3 synchronized perspectives.
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                      {/* Slot 1: Editorial Lookbook */}
                      <div style={{ border: "1.5px solid var(--line, #E6DFD5)", borderRadius: "8px", padding: "12px", background: "var(--paper-warm, #FAF8F4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <strong style={{ fontSize: "12px" }}>📸 Angle 1: Editorial</strong>
                          <span style={{ fontSize: "10px", background: "var(--brand-tan, #C59B6D)", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            REQUIRED
                          </span>
                        </div>
                        <span style={{ display: "block", fontSize: "10.5px", color: "var(--muted)", marginBottom: "8px" }}>
                          On-model styling showing fit, drape & motion.
                        </span>
                        <div style={{ width: "100%", height: "130px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", background: "#eee" }}>
                          <img src={slot1Editorial} alt="Angle 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <input
                          required
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "11.5px" }}
                          placeholder="Editorial image URL"
                          value={slot1Editorial}
                          onChange={(e) => setSlot1Editorial(e.target.value)}
                        />
                      </div>

                      {/* Slot 2: Studio Silhouette */}
                      <div style={{ border: "1.5px solid var(--line, #E6DFD5)", borderRadius: "8px", padding: "12px", background: "var(--paper-warm, #FAF8F4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <strong style={{ fontSize: "12px" }}>📐 Angle 2: Studio</strong>
                          <span style={{ fontSize: "10px", background: "var(--brand-tan, #C59B6D)", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            REQUIRED
                          </span>
                        </div>
                        <span style={{ display: "block", fontSize: "10.5px", color: "var(--muted)", marginBottom: "8px" }}>
                          Clean front or 3/4 studio angle on light ground.
                        </span>
                        <div style={{ width: "100%", height: "130px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", background: "#eee" }}>
                          <img src={slot2Studio} alt="Angle 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <input
                          required
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "11.5px" }}
                          placeholder="Studio silhouette URL"
                          value={slot2Studio}
                          onChange={(e) => setSlot2Studio(e.target.value)}
                        />
                      </div>

                      {/* Slot 3: Macro Craftsmanship Detail */}
                      <div style={{ border: "1.5px solid var(--line, #E6DFD5)", borderRadius: "8px", padding: "12px", background: "var(--paper-warm, #FAF8F4)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <strong style={{ fontSize: "12px" }}>🔍 Angle 3: Detail</strong>
                          <span style={{ fontSize: "10px", background: "var(--brand-tan, #C59B6D)", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            REQUIRED
                          </span>
                        </div>
                        <span style={{ display: "block", fontSize: "10.5px", color: "var(--muted)", marginBottom: "8px" }}>
                          Macro close-up of weave, seam, or hardware.
                        </span>
                        <div style={{ width: "100%", height: "130px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", background: "#eee" }}>
                          <img src={slot3Detail} alt="Angle 3" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <input
                          required
                          style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "11.5px" }}
                          placeholder="Craftsmanship macro detail URL"
                          value={slot3Detail}
                          onChange={(e) => setSlot3Detail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Live Triad Simulator Bar */}
                    <div style={{ marginTop: "14px", padding: "10px 14px", background: "var(--soft, #EFEBE2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text)" }}>
                        ⇄ Live 360° Triad Simulator Test:
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {["1: Editorial Fit", "2: Studio Cut", "3: Detail Weave"].map((label, idx) => (
                          <button
                            key={idx}
                            type="button"
                            style={{
                              background: previewAngleIndex === idx ? "var(--accent, #1E3A5F)" : "var(--paper, #fff)",
                              color: previewAngleIndex === idx ? "#fff" : "var(--text)",
                              border: "1px solid var(--line, #E6DFD5)",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            onClick={() => setPreviewAngleIndex(idx as 0 | 1 | 2)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Material & Warranty Attributes */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Material Composition *</label>
                      <input
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="e.g. 100% Organic Mulberry Silk & Linen"
                        value={dropMaterial}
                        onChange={(e) => setDropMaterial(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Fit Guide *</label>
                      <select
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        value={dropFitGuide}
                        onChange={(e) => setDropFitGuide(e.target.value as "True to Size" | "Runs Small" | "Runs Large")}
                      >
                        <option value="True to Size">True to Size (Recommended)</option>
                        <option value="Runs Small">Runs Small (Recommend 1 size up)</option>
                        <option value="Runs Large">Runs Large (Oversized relaxed fit)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Warranty & Guarantee *</label>
                      <select
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        value={dropWarranty}
                        onChange={(e) => setDropWarranty(e.target.value)}
                      >
                        <option value="Lifetime Craftsmanship Guarantee">Lifetime Craftsmanship Guarantee</option>
                        <option value="2-Year Atelier Stitch Warranty">2-Year Atelier Stitch Warranty</option>
                        <option value="1-Year Luxury Finish Warranty">1-Year Luxury Finish Warranty</option>
                        <option value="30-Day Hassle-Free Exchange">30-Day Hassle-Free Exchange</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Bundled Incentive / Gift (Optional)</label>
                      <input
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="e.g. + FREE SILK CARE KIT or + DUST BAG"
                        value={dropBundledIncentive}
                        onChange={(e) => setDropBundledIncentive(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setIsAddingDrop(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="primary-button">
                      Publish to Live Vroom Catalog (with 360° Triad) →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Active Inventory Listings Table with Live Stock Steppers */}
            <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--soft, #EFEBE2)", borderBottom: "1px solid var(--line, #E6DFD5)" }}>
                    <th style={{ padding: "12px 16px" }}>Item & Triad Angles</th>
                    <th style={{ padding: "12px 16px" }}>Category</th>
                    <th style={{ padding: "12px 16px" }}>Selling Price</th>
                    <th style={{ padding: "12px 16px" }}>Inventory Stock</th>
                    <th style={{ padding: "12px 16px" }}>Units Sold</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--line, #E6DFD5)" }}>
                      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {(item.images && item.images.length >= 3 ? item.images : [item.image, item.image, item.image]).slice(0, 3).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              style={{ width: "32px", height: "42px", objectFit: "cover", borderRadius: "3px", border: "1px solid var(--line, #E6DFD5)" }}
                              title={`Angle ${i + 1}`}
                            />
                          ))}
                        </div>
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            SKU: {item.sku || item.id} • {item.material || "Silk/Wool"}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{item.category}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{formatPrice(item.price)}</strong>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div style={{ fontSize: "11px", textDecoration: "line-through", color: "var(--muted)" }}>
                            {formatPrice(item.originalPrice)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--line, #E6DFD5)", borderRadius: "6px", padding: "2px 8px" }}>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 800, fontSize: "14px", padding: "0 4px" }}
                            onClick={() => handleStockAdjustment(item.id, -1)}
                          >
                            −
                          </button>
                          <strong style={{ minWidth: "20px", textAlign: "center" }}>{item.stock}</strong>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 800, fontSize: "14px", padding: "0 4px" }}
                            onClick={() => handleStockAdjustment(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{item.salesCount || 0} sold</strong>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: item.stock > 0 ? "var(--success, #3E6F58)" : "var(--danger, #B84A39)" }}>
                          {item.stock > 0 ? "● Live on Catalog" : "● Sold Out"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS & FULFILLMENT ================= */}
        {activeTab === "orders" && (
          <div className="vendor-tab-content" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Vendor Customer Orders</h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Orders are picked and fulfilled by Vroom Express Courier Network with real-time status updates.
                </span>
              </div>
              <span style={{ fontSize: "12px", background: "var(--soft, #EFEBE2)", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                Fulfillment SLA: <strong>24h Doorstep Guarantee</strong>
              </span>
            </div>

            <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--soft, #EFEBE2)", borderBottom: "1px solid var(--line, #E6DFD5)" }}>
                    <th style={{ padding: "12px 16px" }}>Order ID & Customer</th>
                    <th style={{ padding: "12px 16px" }}>Item Ordered</th>
                    <th style={{ padding: "12px 16px" }}>Gross Value</th>
                    <th style={{ padding: "12px 16px" }}>Net Vendor Payout (90%)</th>
                    <th style={{ padding: "12px 16px" }}>Fulfillment Status</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorOrders.map((ord) => (
                    <tr key={ord.orderId} style={{ borderBottom: "1px solid var(--line, #E6DFD5)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{ord.orderId}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          {ord.customerName} • {ord.customerCity}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img src={item.image} alt="" style={{ width: "24px", height: "30px", objectFit: "cover", borderRadius: "3px" }} />
                            <span>{item.quantity}x {item.productName} ({item.size})</span>
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{formatPrice(ord.grossTotalNGN)}</strong>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "var(--brand-tan, #C59B6D)" }}>{formatPrice(ord.netPayoutNGN)}</strong>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background:
                              ord.fulfillmentStatus === "DELIVERED"
                                ? "rgba(62, 111, 88, 0.15)"
                                : ord.fulfillmentStatus === "IN_TRANSIT"
                                ? "rgba(30, 58, 95, 0.15)"
                                : "rgba(197, 155, 109, 0.2)",
                            color:
                              ord.fulfillmentStatus === "DELIVERED"
                                ? "var(--success, #3E6F58)"
                                : ord.fulfillmentStatus === "IN_TRANSIT"
                                ? "var(--accent, #1E3A5F)"
                                : "var(--brand-tan, #C59B6D)",
                          }}
                        >
                          {ord.fulfillmentStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {ord.fulfillmentStatus === "PENDING_DISPATCH" && (
                          <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "5px 12px", fontSize: "11px" }}
                            onClick={() => handleUpdateFulfillment(ord.orderId, "PICKED_BY_VROOM")}
                          >
                            Mark Picked by Courier →
                          </button>
                        )}
                        {ord.fulfillmentStatus === "PICKED_BY_VROOM" && (
                          <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "11px" }}
                            onClick={() => handleUpdateFulfillment(ord.orderId, "IN_TRANSIT")}
                          >
                            Mark In Transit →
                          </button>
                        )}
                        {ord.fulfillmentStatus === "IN_TRANSIT" && (
                          <button
                            type="button"
                            className="secondary-button"
                            style={{ padding: "5px 12px", fontSize: "11px" }}
                            onClick={() => handleUpdateFulfillment(ord.orderId, "DELIVERED")}
                          >
                            Confirm Delivered ✓
                          </button>
                        )}
                        {ord.fulfillmentStatus === "DELIVERED" && (
                          <span style={{ fontSize: "11px", color: "var(--success, #3E6F58)", fontWeight: 700 }}>
                            Settled ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PAYOUTS & SETTLEMENT ================= */}
        {activeTab === "payouts" && (
          <div className="vendor-tab-content" style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", marginBottom: "24px" }}>
              <div style={{ background: "var(--paper-warm, #FAF8F4)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", padding: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand-tan, #C59B6D)" }}>
                  PAYSTACK NIGERIAN BANK SETTLEMENT
                </span>
                <h3 style={{ margin: "6px 0 16px", fontSize: "22px", fontWeight: 800 }}>
                  Available Balance: {formatPrice(vendorProfile.availablePayoutNGN)}
                </h3>
                <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Designated Payout Account:</div>
                  <strong style={{ fontSize: "14px" }}>{vendorProfile.bankName}</strong>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{vendorProfile.accountNumber} ({vendorProfile.accountName})</div>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleRequestPayout}
                  disabled={vendorProfile.availablePayoutNGN <= 0}
                  style={{ width: "100%", padding: "12px" }}
                >
                  Transfer {formatPrice(vendorProfile.availablePayoutNGN)} to Bank Now →
                </button>
              </div>

              <div style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "10px", padding: "20px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase" }}>Settlement Policies</h4>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  <li>90% Net payout on all successful order deliveries.</li>
                  <li>Instant Paystack Automated Transfer upon doorstep customer confirmation.</li>
                  <li>Automated CAC & Tax ID withholding for Nigerian NDPR compliance.</li>
                  <li>Zero chargeback liability for orders fulfilled via Vroom Express.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ONBOARDING WIZARD ================= */}
        {activeTab === "onboarding" && (
          <div className="vendor-tab-content" style={{ padding: "24px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand-tan, #C59B6D)" }}>
                  STEP {obStep} OF 3
                </span>
                <h3 style={{ margin: "4px 0 6px", fontSize: "22px", fontWeight: 800 }}>Register Store on Vroom Marketplace</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                  Join verified Nigerian fashion ateliers, luxury designers, and artisan creators.
                </p>
              </div>

              <form onSubmit={handleCompleteOnboarding} style={{ background: "var(--paper, #fff)", border: "1px solid var(--line, #E6DFD5)", borderRadius: "12px", padding: "24px" }}>
                {obStep === 1 && (
                  <div>
                    <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700 }}>Step 1: Store & Brand Profile</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Store Name *</label>
                        <input
                          required
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          placeholder="e.g. Atelier Noir Lagos"
                          value={obStoreName}
                          onChange={(e) => setObStoreName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Contact Person / Brand Lead *</label>
                        <input
                          required
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          placeholder="e.g. Amara Okafor"
                          value={obContact}
                          onChange={(e) => setObContact(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Category *</label>
                        <select
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          value={obCategory}
                          onChange={(e) => setObCategory(e.target.value)}
                        >
                          <option value="Fashion & Atelier">Fashion & Atelier</option>
                          <option value="Outerwear">Outerwear & Coats</option>
                          <option value="Knitwear">Knitwear & Cashmere</option>
                          <option value="Accessories">Leather Bags & Accessories</option>
                          <option value="Footwear">Footwear & Loafers</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Dispatch Hub *</label>
                        <select
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          value={obCity}
                          onChange={(e) => setObCity(e.target.value)}
                        >
                          <option value="Lagos (Ikeja Hub)">Lagos (Ikeja / Lekki Hub)</option>
                          <option value="Abuja (Central)">Abuja (Central Logistics)</option>
                          <option value="Port Harcourt">Port Harcourt (Rivers)</option>
                          <option value="Ibadan (Oyo)">Ibadan (Oyo)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ width: "100%", padding: "11px" }}
                      onClick={() => {
                        if (!obStoreName) {
                          onSuccessToast("Please enter your store name.");
                          return;
                        }
                        setObStep(2);
                      }}
                    >
                      Next: Business Verification →
                    </button>
                  </div>
                )}

                {obStep === 2 && (
                  <div>
                    <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700 }}>Step 2: Business Identity & Verification</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Business Email *</label>
                        <input
                          type="email"
                          required
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          placeholder="partner@yourbrand.com"
                          value={obEmail}
                          onChange={(e) => setObEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>WhatsApp Contact Phone *</label>
                        <input
                          required
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          placeholder="+234 800 000 0000"
                          value={obPhone}
                          onChange={(e) => setObPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>CAC / Registration Number</label>
                      <input
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="RC-1849204 or BN-391024"
                        value={obCacNumber}
                        onChange={(e) => setObCacNumber(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setObStep(1)}>
                        ← Back
                      </button>
                      <button type="button" className="primary-button" style={{ flex: 2 }} onClick={() => setObStep(3)}>
                        Next: Bank Settlement Details →
                      </button>
                    </div>
                  </div>
                )}

                {obStep === 3 && (
                  <div>
                    <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700 }}>Step 3: Settlement Bank Account</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Bank Name *</label>
                        <select
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          value={obBank}
                          onChange={(e) => setObBank(e.target.value)}
                        >
                          <option value="Access Bank Nigeria">Access Bank Nigeria</option>
                          <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                          <option value="Zenith Bank">Zenith Bank Plc</option>
                          <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                          <option value="Stanbic IBTC">Stanbic IBTC</option>
                          <option value="Kuda MFB">Kuda Microfinance Bank</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>10-Digit NUBAN Account *</label>
                        <input
                          required
                          maxLength={10}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                          placeholder="0123456789"
                          value={obAccountNumber}
                          onChange={(e) => setObAccountNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Account Name (as with bank) *</label>
                      <input
                        required
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid var(--line, #E6DFD5)", fontSize: "13px" }}
                        placeholder="Atelier Noir Studio Ltd"
                        value={obAccountName}
                        onChange={(e) => setObAccountName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => setObStep(2)}>
                        ← Back
                      </button>
                      <button type="submit" className="primary-button" style={{ flex: 2 }} disabled={isRegistering}>
                        {isRegistering ? "Verifying & Generating Merchant ID..." : "Complete Registration & Start Selling →"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
