import React, { useState } from "react";
import type { DeliverySpeed, ParcelCategory, DeliveryRateQuote, VroomDeliveryShipment } from "../types";

interface VroomDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amount: number) => string;
  onSuccessToast: (msg: string) => void;
  initialTab?: "calculator" | "book" | "track" | "api";
  initialTrackingCode?: string;
}

const SUPPORTED_CITIES = [
  "Lagos (Island & Lekki)",
  "Lagos (Mainland & Ikeja)",
  "Abuja FCT",
  "Port Harcourt",
  "Ibadan",
  "Benin City",
  "Enugu",
  "Kano",
  "Abeokuta",
  "Asaba / Warri",
];

const PARCEL_CATEGORIES: { id: ParcelCategory; label: string; icon: string }[] = [
  { id: "APPAREL_FASHION", label: "Apparel & Atelier Fashion", icon: "👗" },
  { id: "ELECTRONICS", label: "Consumer Tech & Gadgets", icon: "📱" },
  { id: "FRAGILE_LUXURY", label: "Luxury Leather & Fragile Goods", icon: "💎" },
  { id: "DOCUMENTS", label: "Certificates & Business Documents", icon: "📄" },
  { id: "BULK_CARGO", label: "Bulk Retail Inventory", icon: "📦" },
];

const SPEED_CONFIGS: Record<
  DeliverySpeed,
  {
    label: string;
    sublabel: string;
    basePrice: number;
    perKgRate: number;
    transitTime: string;
    icon: string;
  }
> = {
  EXPRESS_SAME_DAY: {
    label: "Same-Day Flash",
    sublabel: "Delivered within 3 - 5 hours intra-city",
    basePrice: 4500,
    perKgRate: 800,
    transitTime: "Same Day (3 - 5 Hours)",
    icon: "⚡",
  },
  NEXT_DAY: {
    label: "Next-Day Priority",
    sublabel: "Dispatched overnight, delivered morning",
    basePrice: 3200,
    perKgRate: 600,
    transitTime: "Tomorrow by 12:00 PM",
    icon: "🚀",
  },
  STANDARD: {
    label: "Standard Dispatch",
    sublabel: "Economical reliable door-to-door delivery",
    basePrice: 2200,
    perKgRate: 400,
    transitTime: "2 - 3 Business Days",
    icon: "🚚",
  },
  INTERSTATE: {
    label: "Interstate Line-Haul",
    sublabel: "Cross-country secure hub distribution",
    basePrice: 5500,
    perKgRate: 1100,
    transitTime: "3 - 5 Business Days",
    icon: "🌍",
  },
};

const DEFAULT_SAMPLE_SHIPMENT: VroomDeliveryShipment = {
  waybillNumber: "VRM-DEL-89240-NG",
  senderName: "Vroom Atelier Logistics Hub",
  senderPhone: "+234 802 112 3344",
  senderAddress: "Plot 12, Admiralty Way, Lekki Phase 1",
  senderCity: "Lagos (Island & Lekki)",
  recipientName: "Dr. Chioma Adebayo",
  recipientPhone: "+234 803 998 8776",
  recipientAddress: "Apt 4B, Maitama Crescent, Wuse II",
  recipientCity: "Abuja FCT",
  parcelCategory: "APPAREL_FASHION",
  weightKg: 2.5,
  speed: "NEXT_DAY",
  declaredValueNGN: 120000,
  requiresPodSettlement: true,
  podCollectionAmountNGN: 72000,
  totalCostNGN: 4700,
  paymentMode: "POD_COLLECTION",
  status: "OUT_FOR_DELIVERY",
  createdAt: "2026-11-06T14:30:00Z",
  timeline: [
    {
      stage: "CREATED",
      title: "Waybill Generated & Manifest Logged",
      timestamp: "Nov 6, 2:30 PM",
      location: "Lekki Phase 1 Sorting Hub, Lagos",
      note: "Parcel registered with PoD cash/POS collection voucher of ₦72,000.",
      completed: true,
    },
    {
      stage: "PICKED_UP",
      title: "Picked Up by Dispatch Fleet",
      timestamp: "Nov 6, 4:15 PM",
      location: "Lagos Dispatch Hub",
      note: "Scanned into Vroom secure freight container VRM-FLEET-409.",
      completed: true,
    },
    {
      stage: "IN_TRANSIT",
      title: "Arrived at Regional Sort Center",
      timestamp: "Nov 7, 5:45 AM",
      location: "Idu Industrial Gateway, Abuja FCT",
      note: "Cleared interstate priority freight line-haul check.",
      completed: true,
    },
    {
      stage: "OUT_FOR_DELIVERY",
      title: "Out for Doorstep Delivery",
      timestamp: "Nov 7, 8:15 AM",
      location: "Wuse II / Maitama Delivery Route, Abuja",
      note: "Courier Rider Ibrahim Musa (+234 809 123 4567) is en route with mobile POS terminal.",
      completed: true,
    },
    {
      stage: "DELIVERED",
      title: "Delivered & Inspected",
      timestamp: "Pending",
      location: "Maitama Crescent, Abuja",
      note: "Awaiting recipient inspection and POS transaction confirmation.",
      completed: false,
    },
  ],
};

export const VroomDeliveryModal: React.FC<VroomDeliveryModalProps> = ({
  isOpen,
  onClose,
  formatPrice,
  onSuccessToast,
  initialTab = "calculator",
  initialTrackingCode,
}) => {
  const [userTab, setUserTab] = useState<"calculator" | "book" | "track" | "api" | null>(null);
  const activeTab = userTab ?? initialTab;

  // Rate Quote state
  const [originCity, setOriginCity] = useState<string>("Lagos (Island & Lekki)");
  const [destCity, setDestCity] = useState<string>("Abuja FCT");
  const [weightKg, setWeightKg] = useState<number>(2);
  const [selectedSpeed, setSelectedSpeed] = useState<DeliverySpeed>("NEXT_DAY");
  const [parcelCategory, setParcelCategory] = useState<ParcelCategory>("APPAREL_FASHION");
  const [declaredValue, setDeclaredValue] = useState<number>(50000);

  // Booking Form State
  const [senderName, setSenderName] = useState<string>("");
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [enablePod, setEnablePod] = useState<boolean>(true);
  const [podSettlementAmount, setPodSettlementAmount] = useState<number>(35000);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Tracking State
  const [trackingInput, setTrackingInput] = useState<string>(
    initialTrackingCode || DEFAULT_SAMPLE_SHIPMENT.waybillNumber
  );
  const [activeShipment, setActiveShipment] = useState<VroomDeliveryShipment>(DEFAULT_SAMPLE_SHIPMENT);
  const [trackingNotFound, setTrackingNotFound] = useState<boolean>(false);

  // API Key State
  const [generatedApiKey, setGeneratedApiKey] = useState<string>("");

  if (!isOpen) return null;

  // Calculate live rate quote
  const calculateQuote = (): DeliveryRateQuote => {
    const isInterstate = originCity !== destCity;
    const speedKey = isInterstate && selectedSpeed === "EXPRESS_SAME_DAY" ? "INTERSTATE" : selectedSpeed;
    const config = SPEED_CONFIGS[speedKey] || SPEED_CONFIGS.STANDARD;

    const baseRateNGN = config.basePrice + Math.max(0, weightKg - 1) * config.perKgRate;
    const insuranceNGN = Math.round(declaredValue * 0.01); // 1% goods insurance
    const fuelSurchargeNGN = Math.round(baseRateNGN * 0.08); // 8% fuel surcharge
    const totalRateNGN = baseRateNGN + insuranceNGN + fuelSurchargeNGN;

    return {
      originCity,
      destinationCity: destCity,
      weightKg,
      speed: speedKey,
      speedLabel: config.label,
      baseRateNGN,
      insuranceNGN,
      fuelSurchargeNGN,
      totalRateNGN,
      estimatedTransit: config.transitTime,
    };
  };

  const currentQuote = calculateQuote();

  // Handle switching to Book tab with calculated quote
  const handleProceedToBooking = () => {
    setUserTab("book");
  };

  // Handle Booking submission
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderPhone.trim() || !senderAddress.trim()) {
      onSuccessToast("Please complete sender details.");
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      onSuccessToast("Please complete recipient details.");
      return;
    }

    setIsSubmittingBooking(true);

    setTimeout(() => {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const generatedWaybill = `VRM-DEL-${randomSuffix}-NG`;

      const newShipment: VroomDeliveryShipment = {
        waybillNumber: generatedWaybill,
        senderName,
        senderPhone,
        senderAddress,
        senderCity: originCity,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientCity: destCity,
        parcelCategory,
        weightKg,
        speed: selectedSpeed,
        declaredValueNGN: declaredValue,
        requiresPodSettlement: enablePod,
        podCollectionAmountNGN: enablePod ? podSettlementAmount : undefined,
        totalCostNGN: currentQuote.totalRateNGN,
        paymentMode: enablePod ? "POD_COLLECTION" : "PREPAID",
        status: "CREATED",
        createdAt: new Date().toISOString(),
        timeline: [
          {
            stage: "CREATED",
            title: "Waybill Generated & Dispatch Assigned",
            timestamp: "Just now",
            location: originCity,
            note: enablePod
              ? `Delivery booked with Payment on Delivery collection of ₦${podSettlementAmount.toLocaleString()}. Courier dispatched for pickup.`
              : "Prepaid parcel booked. Vroom dispatch rider is assigned for doorstep pickup.",
            completed: true,
          },
          {
            stage: "PICKED_UP",
            title: "Pickup by Courier Rider",
            timestamp: "Scheduled within 60 mins",
            location: senderAddress,
            note: "Rider will verify physical parcel weight and scan barcode.",
            completed: false,
          },
          {
            stage: "IN_TRANSIT",
            title: "Transit via Vroom Sort Facility",
            timestamp: "Pending",
            location: `${originCity} Central Hub`,
            note: "Automated sortation and vehicle loading.",
            completed: false,
          },
          {
            stage: "OUT_FOR_DELIVERY",
            title: "Out for Final Doorstep Delivery",
            timestamp: "Pending",
            location: destCity,
            note: "Rider on direct route to recipient with mobile POS terminal.",
            completed: false,
          },
          {
            stage: "DELIVERED",
            title: "Delivered & Settlement Confirmed",
            timestamp: "Pending",
            location: recipientAddress,
            note: "Doorstep handover and digital signature verification.",
            completed: false,
          },
        ],
      };

      // Save to localStorage
      try {
        const stored = localStorage.getItem("vroom_delivery_shipments");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newShipment);
        localStorage.setItem("vroom_delivery_shipments", JSON.stringify(list));
      } catch {
        // ignore localStorage errors
      }

      setIsSubmittingBooking(false);
      setActiveShipment(newShipment);
      setTrackingInput(generatedWaybill);
      setUserTab("track");
      onSuccessToast(`Waybill ${generatedWaybill} booked successfully! Dispatch rider assigned.`);
    }, 700);
  };

  // Handle tracking query
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingInput.trim().toUpperCase();
    if (!query) return;

    // Check localStorage first
    try {
      const stored = localStorage.getItem("vroom_delivery_shipments");
      if (stored) {
        const list: VroomDeliveryShipment[] = JSON.parse(stored);
        const match = list.find((s) => s.waybillNumber.toUpperCase() === query);
        if (match) {
          setActiveShipment(match);
          setTrackingNotFound(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    if (query === DEFAULT_SAMPLE_SHIPMENT.waybillNumber.toUpperCase()) {
      setActiveShipment(DEFAULT_SAMPLE_SHIPMENT);
      setTrackingNotFound(false);
      return;
    }

    // If query starts with VRM, simulate live response
    if (query.startsWith("VRM")) {
      const simulated: VroomDeliveryShipment = {
        ...DEFAULT_SAMPLE_SHIPMENT,
        waybillNumber: query,
        timeline: [
          {
            stage: "CREATED",
            title: "Waybill Registered in System",
            timestamp: "Today, 10:14 AM",
            location: "Lagos Hub",
            note: "Waybill manifest confirmed by merchant.",
            completed: true,
          },
          {
            stage: "PICKED_UP",
            title: "Picked Up by Fleet Driver",
            timestamp: "Today, 11:30 AM",
            location: "Lekki Gateway",
            note: "In transit to main sort center.",
            completed: true,
          },
          {
            stage: "IN_TRANSIT",
            title: "Processing at Sort Facility",
            timestamp: "Today, 1:15 PM",
            location: "Ikeja Cargo Depot",
            note: "Sorting for outbound line-haul.",
            completed: true,
          },
          {
            stage: "OUT_FOR_DELIVERY",
            title: "En Route to Destination",
            timestamp: "Estimated 4:00 PM",
            location: "Destination District",
            note: "Dispatched with delivery courier.",
            completed: false,
          },
          {
            stage: "DELIVERED",
            title: "Delivery & PoD Settlement",
            timestamp: "Pending",
            location: "Recipient Doorstep",
            note: "Awaiting recipient sign-off.",
            completed: false,
          },
        ],
      };
      setActiveShipment(simulated);
      setTrackingNotFound(false);
    } else {
      setTrackingNotFound(true);
    }
  };

  const handleGenerateApiKey = () => {
    const key = `vrm_live_sec_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    setGeneratedApiKey(key);
    onSuccessToast("Production sandbox API key generated!");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card vroom-delivery-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close delivery portal"
        >
          ✕
        </button>

        {/* Portal Header */}
        <div className="vroom-delivery-header">
          <div className="delivery-brand-lockup">
            <div className="delivery-logo-badge">
              <span className="logo-box-icon">📦</span>
              <span className="logo-spark">⚡</span>
            </div>
            <div>
              <div className="delivery-title-badge-row">
                <h2>Vroom Delivery</h2>
                <span className="logistics-status-tag">Live Logistics Micro-Service</span>
              </div>
              <p className="delivery-subtitle">
                On-demand intra-city parcel dispatch, interstate freight & integrated Payment on Delivery (PoD) collection across Nigeria.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="delivery-metrics-strip">
            <div className="metric-cell">
              <span className="metric-val">36 States</span>
              <span className="metric-lbl">Nationwide Reach</span>
            </div>
            <div className="metric-cell">
              <span className="metric-val">99.4%</span>
              <span className="metric-lbl">On-Time Dispatch</span>
            </div>
            <div className="metric-cell">
              <span className="metric-val">₦0 Loss</span>
              <span className="metric-lbl">Goods In-Transit Cover</span>
            </div>
            <div className="metric-cell">
              <span className="metric-val">Instant PoD</span>
              <span className="metric-lbl">Next-Day Merchant Remittance</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="delivery-nav-tabs">
            <button
              type="button"
              className={`delivery-tab-btn ${activeTab === "calculator" ? "active" : ""}`}
              onClick={() => setUserTab("calculator")}
            >
              <span className="tab-icon">🧮</span> Instant Rate Calculator
            </button>
            <button
              type="button"
              className={`delivery-tab-btn ${activeTab === "book" ? "active" : ""}`}
              onClick={() => setUserTab("book")}
            >
              <span className="tab-icon">📝</span> Book Parcel Dispatch
            </button>
            <button
              type="button"
              className={`delivery-tab-btn ${activeTab === "track" ? "active" : ""}`}
              onClick={() => setUserTab("track")}
            >
              <span className="tab-icon">📍</span> Live Waybill Tracking
            </button>
            <button
              type="button"
              className={`delivery-tab-btn ${activeTab === "api" ? "active" : ""}`}
              onClick={() => setUserTab("api")}
            >
              <span className="tab-icon">🔌</span> Merchant API Micro-Service
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="vroom-delivery-body">
          {/* TAB 1: INSTANT RATE CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="delivery-calculator-pane">
              <div className="calc-grid-layout">
                {/* Inputs Column */}
                <div className="calc-inputs-column">
                  <h3 className="section-title">Calculate Shipping & PoD Rate</h3>
                  <p className="section-desc">
                    Get upfront transparent freight charges based on destination, speed, and parcel specifications.
                  </p>

                  <div className="calc-form-row two-cols">
                    <div className="form-group">
                      <label>Origin Location (Pickup)</label>
                      <select
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        className="vroom-select"
                      >
                        {SUPPORTED_CITIES.map((c) => (
                          <option key={`orig-${c}`} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Destination Location (Drop-off)</label>
                      <select
                        value={destCity}
                        onChange={(e) => setDestCity(e.target.value)}
                        className="vroom-select"
                      >
                        {SUPPORTED_CITIES.map((c) => (
                          <option key={`dest-${c}`} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Parcel Category */}
                  <div className="form-group">
                    <label>Parcel Category</label>
                    <div className="category-chips-grid">
                      {PARCEL_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-chip-btn ${parcelCategory === cat.id ? "selected" : ""}`}
                          onClick={() => setParcelCategory(cat.id)}
                        >
                          <span className="chip-icon">{cat.icon}</span>
                          <span className="chip-label">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight & Declared Value */}
                  <div className="calc-form-row two-cols">
                    <div className="form-group">
                      <div className="label-with-val">
                        <label>Weight (kg)</label>
                        <span className="range-val">{weightKg} kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="30"
                        step="0.5"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                        className="vroom-slider"
                      />
                      <div className="slider-ticks">
                        <span>0.5kg</span>
                        <span>10kg</span>
                        <span>20kg</span>
                        <span>30kg</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Declared Goods Value (₦)</label>
                      <input
                        type="number"
                        min="1000"
                        step="5000"
                        value={declaredValue}
                        onChange={(e) => setDeclaredValue(Math.max(1000, parseInt(e.target.value) || 0))}
                        className="vroom-input"
                        placeholder="50,000"
                      />
                      <span className="field-hint">Includes 1% comprehensive goods-in-transit cover</span>
                    </div>
                  </div>

                  {/* Speed Selector */}
                  <div className="form-group">
                    <label>Select Delivery Speed & Priority</label>
                    <div className="speed-cards-grid">
                      {(Object.keys(SPEED_CONFIGS) as DeliverySpeed[]).map((key) => {
                        const cfg = SPEED_CONFIGS[key];
                        return (
                          <div
                            key={key}
                            className={`speed-option-card ${selectedSpeed === key ? "active" : ""}`}
                            onClick={() => setSelectedSpeed(key)}
                          >
                            <div className="speed-card-header">
                              <span className="speed-icon">{cfg.icon}</span>
                              <strong>{cfg.label}</strong>
                            </div>
                            <span className="speed-transit-time">{cfg.transitTime}</span>
                            <span className="speed-card-sub">{cfg.sublabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Quote Summary Card */}
                <div className="calc-summary-column">
                  <div className="quote-summary-card">
                    <div className="quote-card-badge">Instant Rate Quote</div>
                    <div className="quote-price-header">
                      <span className="quote-total-label">Total Shipping Fee</span>
                      <h3 className="quote-total-price">{formatPrice(currentQuote.totalRateNGN)}</h3>
                      <span className="quote-transit-badge">
                        ⏱ Est. Delivery: {currentQuote.estimatedTransit}
                      </span>
                    </div>

                    <div className="quote-breakdown-list">
                      <div className="breakdown-row">
                        <span>Base Freight ({currentQuote.speedLabel})</span>
                        <span>{formatPrice(currentQuote.baseRateNGN)}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Goods In-Transit Insurance (1%)</span>
                        <span>{formatPrice(currentQuote.insuranceNGN)}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Fuel & Road Infrastructure Surcharge</span>
                        <span>{formatPrice(currentQuote.fuelSurchargeNGN)}</span>
                      </div>
                      <div className="breakdown-row divider">
                        <strong>Net Payable</strong>
                        <strong>{formatPrice(currentQuote.totalRateNGN)}</strong>
                      </div>
                    </div>

                    <div className="pod-features-box">
                      <div className="pod-box-title">
                        <span className="pod-icon">💵</span>
                        <span>Payment on Delivery (PoD) Ready</span>
                      </div>
                      <p className="pod-box-desc">
                        Our courier riders carry certified mobile POS terminals. Your recipient can inspect parcels prior to card or cash payment.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="primary-button quote-book-cta"
                      onClick={handleProceedToBooking}
                    >
                      Book This Shipment Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOK PARCEL DISPATCH */}
          {activeTab === "book" && (
            <div className="delivery-booking-pane">
              <form onSubmit={handleBookingSubmit} className="booking-form-grid">
                {/* Sender Details */}
                <div className="booking-card">
                  <h4 className="card-heading">
                    <span className="heading-icon">📤</span> Sender & Pickup Information
                  </h4>
                  <div className="form-group">
                    <label>Sender Full Name / Business</label>
                    <input
                      type="text"
                      className="vroom-input"
                      placeholder="e.g. Vroom Atelier Lekki or Personal Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Sender Contact Phone</label>
                    <input
                      type="tel"
                      className="vroom-input"
                      placeholder="+234 802 345 6789"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pickup Street Address & Landmark</label>
                    <textarea
                      rows={2}
                      className="vroom-textarea"
                      placeholder="Apartment / Suite, Building, Street, Landmark"
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pickup City Region</label>
                    <select
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="vroom-select"
                    >
                      {SUPPORTED_CITIES.map((c) => (
                        <option key={`book-orig-${c}`} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="booking-card">
                  <h4 className="card-heading">
                    <span className="heading-icon">📥</span> Recipient & Drop-Off Information
                  </h4>
                  <div className="form-group">
                    <label>Recipient Full Name</label>
                    <input
                      type="text"
                      className="vroom-input"
                      placeholder="e.g. Fatima Mohammed"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Recipient Contact Phone (For Courier Call)</label>
                    <input
                      type="tel"
                      className="vroom-input"
                      placeholder="+234 809 876 5432"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery Street Address</label>
                    <textarea
                      rows={2}
                      className="vroom-textarea"
                      placeholder="Residential / Office Address, Floor, Gate Code"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination City Region</label>
                    <select
                      value={destCity}
                      onChange={(e) => setDestCity(e.target.value)}
                      className="vroom-select"
                    >
                      {SUPPORTED_CITIES.map((c) => (
                        <option key={`book-dest-${c}`} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PoD and Settlement Options */}
                <div className="booking-card full-width">
                  <h4 className="card-heading">
                    <span className="heading-icon">💵</span> Payment on Delivery (PoD) Collection Configuration
                  </h4>
                  <div className="pod-toggle-row">
                    <label className="switch-toggle-label">
                      <input
                        type="checkbox"
                        checked={enablePod}
                        onChange={(e) => setEnablePod(e.target.checked)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                    <div className="pod-toggle-text">
                      <strong>Enable Post-Delivery Doorstep Settlement (PoD)</strong>
                      <p>
                        Instruct the courier to collect funds from the recipient via mobile POS card terminal or cash before releasing the package.
                      </p>
                    </div>
                  </div>

                  {enablePod && (
                    <div className="pod-config-fields">
                      <div className="form-group">
                        <label>Amount to Collect from Recipient (₦)</label>
                        <input
                          type="number"
                          min="500"
                          step="1000"
                          value={podSettlementAmount}
                          onChange={(e) => setPodSettlementAmount(parseInt(e.target.value) || 0)}
                          className="vroom-input"
                          placeholder="35,000"
                          required={enablePod}
                        />
                        <span className="field-hint">
                          The exact amount our dispatch rider will charge on the mobile POS terminal at the doorstep.
                        </span>
                      </div>

                      <div className="pod-settlement-guarantee">
                        <span className="guarantee-icon">🛡️</span>
                        <div>
                          <strong>Automated Next-Day Settlement:</strong>
                          <p>
                            Collected funds are automatically reconciled and transferred to your verified merchant bank account within 24 hours of successful delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="booking-submit-row">
                    <div className="total-indicator">
                      <span>Total Dispatch Charge:</span>
                      <strong>{formatPrice(currentQuote.totalRateNGN)}</strong>
                    </div>

                    <button
                      type="submit"
                      className="primary-button generate-waybill-btn"
                      disabled={isSubmittingBooking}
                    >
                      {isSubmittingBooking ? "Generating Waybill..." : "Generate Waybill & Dispatch Courier →"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: LIVE WAYBILL TRACKING */}
          {activeTab === "track" && (
            <div className="delivery-tracking-pane">
              {/* Search Bar */}
              <form onSubmit={handleTrackSubmit} className="track-search-bar">
                <input
                  type="text"
                  placeholder="Enter Waybill Number (e.g. VRM-DEL-89240-NG)"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="vroom-input track-input"
                />
                <button type="submit" className="primary-button track-search-btn">
                  Track Parcel 🔍
                </button>
              </form>

              {trackingNotFound ? (
                <div className="tracking-not-found-state">
                  <span className="not-found-icon">🔎</span>
                  <h4>Waybill Not Found</h4>
                  <p>
                    We couldn&apos;t locate a parcel matching <strong>{trackingInput}</strong>. Please check your waybill number or test with <code>VRM-DEL-89240-NG</code>.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setTrackingInput(DEFAULT_SAMPLE_SHIPMENT.waybillNumber);
                      setActiveShipment(DEFAULT_SAMPLE_SHIPMENT);
                      setTrackingNotFound(false);
                    }}
                  >
                    View Sample Live Waybill
                  </button>
                </div>
              ) : (
                <div className="tracking-details-card">
                  {/* Waybill Header Card */}
                  <div className="waybill-summary-header">
                    <div className="waybill-left">
                      <span className="waybill-tag">Waybill Number</span>
                      <h3 className="waybill-code">{activeShipment.waybillNumber}</h3>
                      <span className="waybill-created-date">
                        Booked: {new Date(activeShipment.createdAt).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>

                    <div className="waybill-right">
                      <span className={`status-pill ${activeShipment.status.toLowerCase()}`}>
                        {activeShipment.status.replace(/_/g, " ")}
                      </span>
                      {activeShipment.requiresPodSettlement && (
                        <span className="pod-amount-pill">
                          💵 PoD: {formatPrice(activeShipment.podCollectionAmountNGN || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route Infographic */}
                  <div className="route-infographic">
                    <div className="route-node origin">
                      <span className="node-icon">📍</span>
                      <div>
                        <strong>Origin: {activeShipment.senderCity}</strong>
                        <p>{activeShipment.senderAddress}</p>
                      </div>
                    </div>
                    <div className="route-arrow">
                      <span className="arrow-line"></span>
                      <span className="speed-tag">{activeShipment.speed.replace(/_/g, " ")}</span>
                    </div>
                    <div className="route-node destination">
                      <span className="node-icon">🎯</span>
                      <div>
                        <strong>Destination: {activeShipment.recipientCity}</strong>
                        <p>{activeShipment.recipientAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Timeline */}
                  <div className="tracking-timeline-container">
                    <h4 className="timeline-heading">Milestone Timeline</h4>
                    <div className="timeline-steps">
                      {activeShipment.timeline.map((step, idx) => (
                        <div
                          key={idx}
                          className={`timeline-step-item ${step.completed ? "completed" : "pending"}`}
                        >
                          <div className="step-marker">
                            {step.completed ? "✓" : idx + 1}
                          </div>
                          <div className="step-content">
                            <div className="step-header">
                              <strong>{step.title}</strong>
                              <span className="step-time">{step.timestamp}</span>
                            </div>
                            <span className="step-location">📍 {step.location}</span>
                            <p className="step-note">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Waybill Actions */}
                  <div className="waybill-actions-strip">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        navigator.clipboard?.writeText(activeShipment.waybillNumber);
                        onSuccessToast("Waybill number copied to clipboard!");
                      }}
                    >
                      📋 Copy Waybill
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        onSuccessToast("Waybill dispatched via SMS & WhatsApp alert.");
                      }}
                    >
                      📱 Send Alert to Recipient
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      🖨️ Print Shipping Label
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MERCHANT API MICRO-SERVICE */}
          {activeTab === "api" && (
            <div className="delivery-api-pane">
              <div className="api-intro-box">
                <h3>Vroom Delivery REST Micro-Services API</h3>
                <p>
                  Embed automated Nigerian parcel dispatch, real-time rates, and Payment on Delivery settlement directly into your custom website, mobile app, or Shopify store.
                </p>
              </div>

              {/* API Key Box */}
              <div className="api-key-container">
                <div className="key-header">
                  <strong>Sandbox & Live API Keys</strong>
                  <button
                    type="button"
                    className="api-gen-btn"
                    onClick={handleGenerateApiKey}
                  >
                    Generate New Key 🔑
                  </button>
                </div>
                <div className="key-display-row">
                  <input
                    type="text"
                    readOnly
                    value={generatedApiKey || "vrm_live_sec_78941_99x_atelier"}
                    className="vroom-input mono"
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        generatedApiKey || "vrm_live_sec_78941_99x_atelier"
                      );
                      onSuccessToast("API Key copied!");
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="api-code-block">
                <div className="code-header">
                  <span>POST /api/vroom-delivery/dispatch</span>
                  <span className="lang-tag">JSON / cURL</span>
                </div>
                <pre className="code-content">
{`curl -X POST "https://api.vroomstyles.com/v1/delivery/dispatch" \\
  -H "Authorization: Bearer ${generatedApiKey || "vrm_live_sec_78941_99x_atelier"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sender": {
      "name": "Courant Studio Store",
      "phone": "+2348021112233",
      "address": "15 Adeola Odeku, VI, Lagos"
    },
    "recipient": {
      "name": "Babatunde Cole",
      "phone": "+2348035557788",
      "address": "4 Admiralty Way, Lekki, Lagos"
    },
    "parcel": {
      "category": "ELECTRONICS",
      "weight_kg": 1.8,
      "speed": "EXPRESS_SAME_DAY"
    },
    "payment_on_delivery": {
      "enabled": true,
      "collection_amount_ngn": 74000,
      "payment_modes_allowed": ["POS_CARD", "CASH"]
    }
  }'`}
                </pre>
              </div>

              {/* Webhooks Info */}
              <div className="webhooks-grid">
                <div className="webhook-card">
                  <strong>⚡ Webhook: <code>parcel.picked_up</code></strong>
                  <p>Fires when courier scans package barcode at the sender doorstep.</p>
                </div>
                <div className="webhook-card">
                  <strong>📍 Webhook: <code>parcel.out_for_delivery</code></strong>
                  <p>Notifies customer with live courier GPS link and dispatch ETA.</p>
                </div>
                <div className="webhook-card">
                  <strong>💵 Webhook: <code>pod.settlement_success</code></strong>
                  <p>Fires immediately when recipient card or cash settlement is verified on courier POS.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
