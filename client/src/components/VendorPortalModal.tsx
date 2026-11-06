import React, { useState } from "react";
import type { VendorProfile, VendorProductListing, Product } from "../types";

interface VendorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "onboarding" | "hub";
  onSuccessToast: (msg: string) => void;
  onAddNewProduct?: (product: Product) => void;
  formatPrice?: (amount: number) => string;
}

const DEFAULT_VENDOR_PROFILE: VendorProfile = {
  merchantId: "VRM-MKT-94281",
  storeName: "Courant Studio Official",
  category: "Phones & Tablets",
  contactName: "Monique Vance",
  email: "partner@courantstudio.com",
  phone: "+234 812 345 6789",
  city: "Lagos",
  cacNumber: "RC-1849204",
  bankName: "Access Bank",
  accountNumber: "0123456789",
  accountName: "Courant Studio West Africa Ltd",
  sellerType: "3P",
  status: "VERIFIED",
  rating: 98,
  fulfilledByVroom: true,
  totalSalesNGN: 2450000,
  availablePayoutNGN: 385000,
  totalOrders: 34,
  activeListingsCount: 5,
  joinedDate: "2025-10-15",
  isOpen: true,
};

const INITIAL_VENDOR_LISTINGS: VendorProductListing[] = [
  {
    id: "v-list-1",
    name: "Architectural Valet Wireless Charging Station",
    category: "Phones & Tablets",
    price: 74000,
    originalPrice: 135000,
    stock: 10,
    warranty: "+ 24 Month Qi2 Warranty",
    bundledIncentive: "+ FREE 65W GaN FAST ADAPTER & CABLE",
    image: "https://images.unsplash.com/photo-1622445262464-84b14e0745b1?auto=format&fit=crop&w=1200&q=85",
    status: "ACTIVE",
    createdAt: "2026-02-10",
  },
  {
    id: "v-list-2",
    name: "SteamOne Precision Garment Steamer",
    category: "Appliances",
    price: 45000,
    originalPrice: 90000,
    stock: 15,
    warranty: "2-Year Manufacturer Warranty",
    bundledIncentive: "+ FREE HEAT-RESISTANT GLOVE & MAT",
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=1200&q=85",
    status: "ACTIVE",
    createdAt: "2026-02-18",
  },
  {
    id: "v-list-3",
    name: "Ultra HD MagSafe Valet Desk Mat",
    category: "Accessories",
    price: 29000,
    originalPrice: 55000,
    stock: 18,
    warranty: "+ 12 Month Seam Protection",
    bundledIncentive: "+ FREE CABLE ORGANIZER CLIPS",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=85",
    status: "ACTIVE",
    createdAt: "2026-03-01",
  },
];

export const VendorPortalModal: React.FC<VendorPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = "onboarding",
  onSuccessToast,
  onAddNewProduct,
  formatPrice = (amount) => `₦${amount.toLocaleString()}`,
}) => {
  const [userTab, setUserTab] = useState<"onboarding" | "hub" | null>(null);
  const activeTab = userTab ?? initialTab;

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

  // Onboarding Form State
  const [obStep, setObStep] = useState<1 | 2 | 3>(1);
  const [obStoreName, setObStoreName] = useState("");
  const [obCategory, setObCategory] = useState("Fashion & Atelier");
  const [obContact, setObContact] = useState("");
  const [obEmail, setObEmail] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obCity, setObCity] = useState("Lagos");
  const [obCacNumber, setObCacNumber] = useState("");
  const [obBank, setObBank] = useState("Access Bank");
  const [obAccountNumber, setObAccountNumber] = useState("");
  const [obAccountName, setObAccountName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [newMerchantId, setNewMerchantId] = useState<string | null>(null);

  // New Drop Form State inside Vendor Hub
  const [isAddingDrop, setIsAddingDrop] = useState(false);
  const [dropTitle, setDropTitle] = useState("");
  const [dropCategory, setDropCategory] = useState("Fashion & Atelier");
  const [dropPrice, setDropPrice] = useState("");
  const [dropOriginalPrice, setDropOriginalPrice] = useState("");
  const [dropStock, setDropStock] = useState("");
  const [dropWarranty, setDropWarranty] = useState("+ 12 Month Warranty");
  const [dropBundledIncentive, setDropBundledIncentive] = useState("");
  const [dropImage, setDropImage] = useState("");

  if (!isOpen) return null;

  // Handle Onboarding Completion
  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    setTimeout(() => {
      const genId = `VRM-MKT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newProfile: VendorProfile = {
        merchantId: genId,
        storeName: obStoreName || "New Merchant Atelier",
        category: obCategory,
        contactName: obContact || "Store Owner",
        email: obEmail || "merchant@vroomstyles.ng",
        phone: obPhone || "+234 800 000 0000",
        city: obCity,
        cacNumber: obCacNumber || "RC-PENDING",
        bankName: obBank,
        accountNumber: obAccountNumber || "0000000000",
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
    }, 800);
  };

  // Handle Creating a New Product Drop in Vendor Hub
  const handlePublishDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropTitle || !dropPrice || !dropStock) return;

    const numPrice = Number(dropPrice);
    const numOrig = dropOriginalPrice ? Number(dropOriginalPrice) : numPrice * 1.4;
    const numStock = Number(dropStock);
    const imgUrl = dropImage.trim() || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85";

    const newListing: VendorProductListing = {
      id: `v-list-${Date.now()}`,
      name: dropTitle,
      category: dropCategory,
      price: numPrice,
      originalPrice: numOrig,
      stock: numStock,
      warranty: dropWarranty,
      bundledIncentive: dropBundledIncentive || undefined,
      image: imgUrl,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newListing, ...listings];
    setListings(updated);
    try {
      localStorage.setItem("vroom_vendor_listings", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }

    // Also inject into the store's active catalog if parent handler provided
    if (onAddNewProduct) {
      const productToAdd: Product = {
        id: `3p-${Date.now()}`,
        name: dropTitle,
        description: `Verified 3P marketplace drop by ${vendorProfile.storeName}. Includes ${dropWarranty}.`,
        price: numPrice,
        originalPrice: numOrig,
        stock: numStock,
        initialStock: numStock,
        image: imgUrl,
        category: dropCategory,
        brand: vendorProfile.storeName,
        sellerType: "3P",
        sellerName: vendorProfile.storeName,
        sellerRating: vendorProfile.rating,
        isFulfilledByVroom: true,
        warranty: dropWarranty,
        bundledIncentive: dropBundledIncentive || undefined,
        rating: 5.0,
        reviewCount: 1,
        hasVariants: true,
        minPrice: numPrice,
        tag: "Marketplace Drop",
      };
      onAddNewProduct(productToAdd);
    }

    // Reset Drop Form
    setDropTitle("");
    setDropPrice("");
    setDropOriginalPrice("");
    setDropStock("");
    setDropBundledIncentive("");
    setDropImage("");
    setIsAddingDrop(false);
    onSuccessToast(`✓ New marketplace drop "${dropTitle}" published to live store!`);
  };

  // Handle Paystack Settlement Payout Request
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
    onSuccessToast(`✓ Payout of ${formatPrice(payoutAmount)} sent via Paystack to ${vendorProfile.bankName} (${vendorProfile.accountNumber})`);
  };

  // Toggle Store Live Status
  const handleToggleStoreStatus = () => {
    const updated = {
      ...vendorProfile,
      isOpen: !vendorProfile.isOpen,
    };
    setVendorProfile(updated);
    try {
      localStorage.setItem("vroom_vendor_profile", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage error", err);
    }
    onSuccessToast(updated.isOpen ? "Store is now LIVE & accepting customer orders." : "Store is now on VACATION mode.");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container vendor-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">MULTI-TENANT MARKETPLACE INFRASTRUCTURE</span>
            <h2 className="modal-title">Vendor & Merchant Portal</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="vendor-portal-tabs-bar">
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "onboarding" ? "active" : ""}`}
            onClick={() => setUserTab("onboarding")}
          >
            <span className="tab-icon">🚀</span>
            <span>Become a Seller (Onboarding)</span>
          </button>
          <button
            type="button"
            className={`vendor-tab-btn ${activeTab === "hub" ? "active" : ""}`}
            onClick={() => setUserTab("hub")}
          >
            <span className="tab-icon">🏢</span>
            <span>Vendor Hub (Dashboard)</span>
            <span className="tab-live-dot" />
          </button>
        </div>

        {/* ================= TAB 1: BECOME A SELLER ONBOARDING ================= */}
        {activeTab === "onboarding" && (
          <div className="vendor-tab-content onboarding-content">
            {newMerchantId ? (
              <div className="onboarding-success-card">
                <div className="success-icon-badge">🎉</div>
                <h3>Welcome to Vroom Style(s) Marketplace!</h3>
                <p className="merchant-code-display">
                  Your Official Merchant ID: <strong>{newMerchantId}</strong>
                </p>
                <div className="merchant-details-summary">
                  <div><strong>Store:</strong> {vendorProfile.storeName}</div>
                  <div><strong>Primary Category:</strong> {vendorProfile.category}</div>
                  <div><strong>Settlement Bank:</strong> {vendorProfile.bankName} ({vendorProfile.accountNumber})</div>
                  <div><strong>Fulfillment:</strong> Fulfilled by Vroom Express (100% Doorstep SLA)</div>
                </div>
                <div className="success-actions-row">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setUserTab("hub")}
                  >
                    Open Vendor Hub Dashboard →
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onClose}
                  >
                    Back to Store
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Onboarding Perks Strip */}
                <div className="onboarding-perks-strip">
                  <div className="perk-cell">
                    <span className="perk-glyph">⚡</span>
                    <strong>0% Commission</strong>
                    <p>0% marketplace fees for your first 30 days of trading</p>
                  </div>
                  <div className="perk-cell">
                    <span className="perk-glyph">🚚</span>
                    <strong>Vroom Express</strong>
                    <p>Nationwide door-to-door delivery & returns handled</p>
                  </div>
                  <div className="perk-cell">
                    <span className="perk-glyph">💳</span>
                    <strong>Paystack Settlement</strong>
                    <p>Direct weekly or instant automated bank payouts</p>
                  </div>
                  <div className="perk-cell">
                    <span className="perk-glyph">🛡️</span>
                    <strong>Warranty Tags</strong>
                    <p>Badge your inventory with warranties & free gifts</p>
                  </div>
                </div>

                {/* Multi-Step Indicator */}
                <div className="onboarding-steps-indicator">
                  <div className={`step-node ${obStep >= 1 ? "active" : ""}`}>
                    <span className="step-num">1</span>
                    <span className="step-label">Store Profile</span>
                  </div>
                  <div className="step-connector" />
                  <div className={`step-node ${obStep >= 2 ? "active" : ""}`}>
                    <span className="step-num">2</span>
                    <span className="step-label">Verification & CAC</span>
                  </div>
                  <div className="step-connector" />
                  <div className={`step-node ${obStep >= 3 ? "active" : ""}`}>
                    <span className="step-num">3</span>
                    <span className="step-label">Bank Settlement</span>
                  </div>
                </div>

                <form onSubmit={handleCompleteOnboarding} className="onboarding-form">
                  {/* STEP 1: Store & Brand Profile */}
                  {obStep === 1 && (
                    <div className="form-step-pane">
                      <h4 className="step-heading">Step 1: Store & Brand Details</h4>
                      <div className="form-group-row">
                        <div className="form-field">
                          <label htmlFor="ob-store">Store / Brand Name *</label>
                          <input
                            id="ob-store"
                            required
                            placeholder="e.g. SteamOne Flagship Store"
                            value={obStoreName}
                            onChange={(e) => setObStoreName(e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="ob-cat">Primary Category *</label>
                          <select
                            id="ob-cat"
                            value={obCategory}
                            onChange={(e) => setObCategory(e.target.value)}
                          >
                            <option value="Fashion & Atelier">Fashion & Atelier</option>
                            <option value="Appliances">Appliances & Living</option>
                            <option value="Phones & Tablets">Phones, Tablets & Tech</option>
                            <option value="Health & Beauty">Health & Clean Beauty</option>
                            <option value="Accessories">Leather Goods & Accessories</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-field">
                          <label htmlFor="ob-city">Warehouse Dispatch Hub *</label>
                          <select
                            id="ob-city"
                            value={obCity}
                            onChange={(e) => setObCity(e.target.value)}
                          >
                            <option value="Lagos">Lagos (Ikeja / Lekki Hub)</option>
                            <option value="Abuja">Abuja (Central Logistics)</option>
                            <option value="Port Harcourt">Port Harcourt (Rivers)</option>
                            <option value="Ibadan">Ibadan (Oyo)</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="ob-contact">Contact Representative *</label>
                          <input
                            id="ob-contact"
                            required
                            placeholder="Full legal name"
                            value={obContact}
                            onChange={(e) => setObContact(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="step-nav-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => {
                            if (!obStoreName) {
                              onSuccessToast("Please enter your store or brand name.");
                              return;
                            }
                            setObStep(2);
                          }}
                        >
                          Next: Business Verification →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Business Verification & CAC */}
                  {obStep === 2 && (
                    <div className="form-step-pane">
                      <h4 className="step-heading">Step 2: Business Verification & Identity</h4>
                      <div className="form-group-row">
                        <div className="form-field">
                          <label htmlFor="ob-email">Business Email *</label>
                          <input
                            id="ob-email"
                            type="email"
                            required
                            placeholder="partner@yourbrand.com"
                            value={obEmail}
                            onChange={(e) => setObEmail(e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="ob-phone">WhatsApp Business Phone *</label>
                          <input
                            id="ob-phone"
                            required
                            placeholder="+234 800 000 0000"
                            value={obPhone}
                            onChange={(e) => setObPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-field">
                          <label htmlFor="ob-cac">CAC Registration Number (Optional / Recommended)</label>
                          <input
                            id="ob-cac"
                            placeholder="RC-1234567 or BN-987654"
                            value={obCacNumber}
                            onChange={(e) => setObCacNumber(e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label>Fulfillment Model</label>
                          <div className="readonly-badge-field">
                            <span>⚡ Fulfilled by Vroom Express (Automated dispatch)</span>
                          </div>
                        </div>
                      </div>

                      <div className="step-nav-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setObStep(1)}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => {
                            if (!obEmail || !obPhone) {
                              onSuccessToast("Please fill in your business email and phone.");
                              return;
                            }
                            setObStep(3);
                          }}
                        >
                          Next: Payout Settlement Account →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Bank Settlement for Paystack Payouts */}
                  {obStep === 3 && (
                    <div className="form-step-pane">
                      <h4 className="step-heading">Step 3: Bank Settlement & Paystack Link</h4>
                      <p className="step-subtext">
                        Marketplace order revenues will be settled directly into this Nigerian corporate or personal bank account.
                      </p>

                      <div className="form-group-row">
                        <div className="form-field">
                          <label htmlFor="ob-bank">Bank Name *</label>
                          <select
                            id="ob-bank"
                            value={obBank}
                            onChange={(e) => setObBank(e.target.value)}
                          >
                            <option value="Access Bank">Access Bank Nigeria</option>
                            <option value="GTBank (Guaranty Trust)">GTBank (Guaranty Trust)</option>
                            <option value="Zenith Bank">Zenith Bank Plc</option>
                            <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                            <option value="UBA (United Bank for Africa)">UBA</option>
                            <option value="Stanbic IBTC">Stanbic IBTC Bank</option>
                            <option value="Kuda MFB">Kuda Microfinance Bank</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="ob-acct-num">10-Digit NUBAN Account Number *</label>
                          <input
                            id="ob-acct-num"
                            required
                            maxLength={10}
                            placeholder="0123456789"
                            value={obAccountNumber}
                            onChange={(e) => setObAccountNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="ob-acct-name">Account Name (as registered with bank) *</label>
                        <input
                          id="ob-acct-name"
                          required
                          placeholder="e.g. Atelier Noir Studio Ltd"
                          value={obAccountName}
                          onChange={(e) => setObAccountName(e.target.value)}
                        />
                      </div>

                      <div className="step-nav-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setObStep(2)}
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          className="primary-button highlight-cta"
                          disabled={isRegistering}
                        >
                          {isRegistering ? "Verifying & Registering..." : "Complete Registration & Start Selling →"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: VENDOR HUB DASHBOARD ================= */}
        {activeTab === "hub" && (
          <div className="vendor-tab-content hub-content">
            {/* Store Header Banner */}
            <div className="hub-store-banner">
              <div className="hub-store-info">
                <div className="store-badge-row">
                  <span className="vendor-role-pill">3P MARKETPLACE MERCHANT</span>
                  <span className="vendor-id-pill">ID: {vendorProfile.merchantId}</span>
                  <span className={`store-status-indicator ${vendorProfile.isOpen ? "open" : "vacation"}`}>
                    ● {vendorProfile.isOpen ? "Store Open (Accepting Orders)" : "Vacation Mode (Paused)"}
                  </span>
                </div>
                <h3 className="hub-store-name">{vendorProfile.storeName}</h3>
                <p className="hub-store-meta">
                  Category: <strong>{vendorProfile.category}</strong> • Dispatch Hub: <strong>{vendorProfile.city}</strong> • Seller Rating: <strong>{vendorProfile.rating}% Positive</strong>
                </p>
              </div>

              <div className="hub-store-actions">
                <button
                  type="button"
                  className="secondary-button toggle-status-btn"
                  onClick={handleToggleStoreStatus}
                >
                  {vendorProfile.isOpen ? "Pause Store (Vacation Mode)" : "Re-open Store"}
                </button>
                <button
                  type="button"
                  className="primary-button add-drop-btn"
                  onClick={() => setIsAddingDrop((prev) => !prev)}
                >
                  {isAddingDrop ? "Cancel Listing" : "+ Add Marketplace Drop"}
                </button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="hub-metrics-grid">
              <div className="hub-metric-card">
                <span className="metric-icon">💰</span>
                <span className="metric-label">Gross Revenue</span>
                <strong className="metric-number">{formatPrice(vendorProfile.totalSalesNGN)}</strong>
                <span className="metric-foot">Lifetime settled orders</span>
              </div>
              <div className="hub-metric-card highlight">
                <span className="metric-icon">💳</span>
                <span className="metric-label">Available for Payout</span>
                <strong className="metric-number">{formatPrice(vendorProfile.availablePayoutNGN)}</strong>
                <button
                  type="button"
                  className="instant-payout-btn"
                  onClick={handleRequestPayout}
                  disabled={vendorProfile.availablePayoutNGN <= 0}
                >
                  Request Paystack Transfer
                </button>
              </div>
              <div className="hub-metric-card">
                <span className="metric-icon">📦</span>
                <span className="metric-label">Fulfilled Orders</span>
                <strong className="metric-number">{vendorProfile.totalOrders}</strong>
                <span className="metric-foot">99.2% Dispatch SLA</span>
              </div>
              <div className="hub-metric-card">
                <span className="metric-icon">🏷️</span>
                <span className="metric-label">Active Drops</span>
                <strong className="metric-number">{listings.length}</strong>
                <span className="metric-foot">Live on Vroom catalog</span>
              </div>
            </div>

            {/* Add New 3P Drop Form (Collapsible) */}
            {isAddingDrop && (
              <div className="hub-add-drop-pane">
                <h4 className="pane-title">Create New 3P Marketplace Product Drop</h4>
                <p className="pane-subtitle">
                  Configure product details, stock, warranty protection terms, and bundled incentive offers.
                </p>

                <form onSubmit={handlePublishDrop} className="add-drop-form">
                  <div className="form-group-row">
                    <div className="form-field">
                      <label htmlFor="drop-title">Product Title *</label>
                      <input
                        id="drop-title"
                        required
                        placeholder="e.g. Wireless Noise-Cancelling Headphones"
                        value={dropTitle}
                        onChange={(e) => setDropTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="drop-cat">Category *</label>
                      <select
                        id="drop-cat"
                        value={dropCategory}
                        onChange={(e) => setDropCategory(e.target.value)}
                      >
                        <option value="Fashion & Atelier">Fashion & Atelier</option>
                        <option value="Appliances">Appliances & Living</option>
                        <option value="Phones & Tablets">Phones, Tablets & Tech</option>
                        <option value="Health & Beauty">Health & Clean Beauty</option>
                        <option value="Accessories">Leather Goods & Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label htmlFor="drop-price">Price (₦ NGN) *</label>
                      <input
                        id="drop-price"
                        type="number"
                        required
                        placeholder="e.g. 65000"
                        value={dropPrice}
                        onChange={(e) => setDropPrice(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="drop-orig-price">Original Price (Strike-through ₦)</label>
                      <input
                        id="drop-orig-price"
                        type="number"
                        placeholder="e.g. 120000"
                        value={dropOriginalPrice}
                        onChange={(e) => setDropOriginalPrice(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="drop-stock">Initial Stock Units *</label>
                      <input
                        id="drop-stock"
                        type="number"
                        required
                        placeholder="e.g. 25"
                        value={dropStock}
                        onChange={(e) => setDropStock(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label htmlFor="drop-warranty">Warranty Protection Tag *</label>
                      <select
                        id="drop-warranty"
                        value={dropWarranty}
                        onChange={(e) => setDropWarranty(e.target.value)}
                      >
                        <option value="+ 12 Month Warranty">+ 12 Month Standard Warranty</option>
                        <option value="2-Year Manufacturer Warranty">2-Year Manufacturer Warranty</option>
                        <option value="Lifetime Craftsmanship Guarantee">Lifetime Craftsmanship Guarantee</option>
                        <option value="100% Authenticity Guaranteed">100% Authenticity Guaranteed</option>
                        <option value="+ 6 Month Protection">+ 6 Month Basic Protection</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="drop-incentive">Bundled Incentive (Free Gift / Incentive Tag)</label>
                      <input
                        id="drop-incentive"
                        placeholder={'e.g. + FREE 43" SMART TV or + FREE TRAVEL DUSTBAG'}
                        value={dropBundledIncentive}
                        onChange={(e) => setDropBundledIncentive(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="drop-img">Product Image CDN URL (Optional)</label>
                    <input
                      id="drop-img"
                      placeholder="https://images.unsplash.com/..."
                      value={dropImage}
                      onChange={(e) => setDropImage(e.target.value)}
                    />
                  </div>

                  <div className="drop-form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setIsAddingDrop(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="primary-button">
                      Publish to Live Store Catalog →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Active Listings Table */}
            <div className="hub-listings-table-wrap">
              <div className="table-header-row">
                <h4>Marketplace Inventory Listings ({listings.length})</h4>
                <span className="table-subnote">Synchronized with Vroom Express Fulfillment</span>
              </div>

              <table className="hub-listings-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Warranty & Assurance</th>
                    <th>Bundled Offer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item.id}>
                      <td className="listing-item-cell">
                        <img src={item.image} alt={item.name} className="listing-thumb" />
                        <div>
                          <strong>{item.name}</strong>
                          <span className="item-id-sub">{item.id}</span>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <strong>{formatPrice(item.price)}</strong>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="item-orig-price">{formatPrice(item.originalPrice)}</span>
                        )}
                      </td>
                      <td>
                        <span className={`stock-badge ${item.stock <= 5 ? "low" : "ok"}`}>
                          {item.stock} left
                        </span>
                      </td>
                      <td>
                        <span className="warranty-tag-pill">🛡️ {item.warranty}</span>
                      </td>
                      <td>
                        {item.bundledIncentive ? (
                          <span className="bundled-tag-pill">🎁 {item.bundledIncentive}</span>
                        ) : (
                          <span className="none-tag">—</span>
                        )}
                      </td>
                      <td>
                        <span className="status-pill active">● Live</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
