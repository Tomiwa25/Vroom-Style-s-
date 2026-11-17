import React, { useState, useEffect, useId } from "react";
import type { CartItem, PodCheckoutDetails } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  currency: "NGN" | "USD";
  formatPrice: (amountInNGN: number) => string;
  onCheckout: (
    method: "inline" | "redirect" | "pod",
    podDetails?: PodCheckoutDetails
  ) => void;
  isCheckingOut?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  currency,
  formatPrice,
  onCheckout,
  isCheckingOut = false,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">("idle");

  // Gifting & Personalization State
  const [isGiftingSelected, setIsGiftingSelected] = useState<boolean>(false);
  const [calligraphyMessage, setCalligraphyMessage] = useState<string>("");

  // Payment on Delivery (PoD) State
  const [selectedMethod, setSelectedMethod] = useState<"online" | "pod">("online");
  const [podAddress, setPodAddress] = useState("");
  const [podPhone, setPodPhone] = useState("");
  const [podCity, setPodCity] = useState("Lagos (Island & Lekki)");
  const [podNotes, setPodNotes] = useState("");
  const [podFormError, setPodFormError] = useState("");

  const giftCheckboxId = useId();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = rawSubtotal - discountAmount;

  // Free shipping threshold: ₦150,000 (or equivalent ~$100 in USD)
  const freeShippingThreshold = 150000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = amountToFreeShipping === 0 ? 0 : 5000;
  const totalAmount = subtotal + shippingFee;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const totalPieces = items.reduce((acc, i) => acc + i.quantity, 0);

  // PoD Eligibility calculation
  const isCartEligibleForPod =
    items.length > 0 && items.every((i) => i.product.isPodEligible);
  const nonPodItems = items.filter((i) => !i.product.isPodEligible);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "ATELIER10" || code === "VROOM10") {
      setDiscountPercent(10);
      setPromoStatus("success");
      setPromoMessage("Atelier 10% privilege applied to your order.");
    } else if (code === "ATELIER20" || code === "VROOM20") {
      setDiscountPercent(20);
      setPromoStatus("success");
      setPromoMessage("Editorial 20% privilege applied to your order.");
    } else if (!code) {
      setPromoStatus("error");
      setPromoMessage("Please enter a privilege or VIP invitation code.");
    } else {
      setDiscountPercent(0);
      setPromoStatus("error");
      setPromoMessage("The invitation code entered is invalid or expired.");
    }
  };

  const handlePodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podAddress.trim()) {
      setPodFormError("Please enter your complete doorstep delivery address.");
      return;
    }
    if (!podPhone.trim() || podPhone.trim().length < 10) {
      setPodFormError("Please provide a valid direct mobile number for the courier concierge.");
      return;
    }
    setPodFormError("");

    let combinedNotes = podNotes.trim();
    if (isGiftingSelected) {
      combinedNotes = `[GIFT PACKAGING REQUESTED${
        calligraphyMessage.trim() ? ` · Calligraphy: "${calligraphyMessage.trim()}"` : ""
      }] ${combinedNotes}`.trim();
    }

    onCheckout("pod", {
      address: podAddress.trim(),
      phone: podPhone.trim(),
      city: podCity,
      deliveryNotes: combinedNotes || undefined,
    });
  };

  return (
    <div
      className="atelier-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your Atelier Bag"
    >
      <aside
        className="atelier-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Atelier Bar */}
        <div className="atelier-drawer-header">
          <div className="atelier-drawer-header-left">
            <span className="atelier-drawer-kicker">Haute Warmth · Curated Bag</span>
            <div className="atelier-drawer-title-row">
              <h2 className="atelier-drawer-title">Your Atelier Bag</h2>
              <span className="atelier-drawer-badge">
                {totalPieces === 0
                  ? "Empty"
                  : totalPieces === 1
                  ? "1 Piece"
                  : `${totalPieces} Pieces`}
              </span>
            </div>
          </div>
          <button
            className="atelier-drawer-close-btn"
            onClick={onClose}
            aria-label="Close atelier bag"
            title="Close bag (Esc)"
          >
            <span className="close-text">Close</span>
            <span className="close-icon" aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Free Shipping Milestone Progress Bar */}
        <div className="atelier-shipping-tier">
          <div className="atelier-shipping-tier-header">
            <div className="tier-icon" aria-hidden="true">
              {amountToFreeShipping === 0 ? "✓" : "✦"}
            </div>
            <div className="tier-text">
              {amountToFreeShipping === 0 ? (
                <span>
                  <strong>Complimentary White-Glove Delivery Unlocked</strong>
                </span>
              ) : (
                <span>
                  Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for complimentary express delivery
                </span>
              )}
            </div>
          </div>
          <div className="atelier-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`atelier-progress-fill ${progressPercent >= 100 ? "unlocked" : ""}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Curated Garment Line Items */}
        <div className="atelier-drawer-items">
          {items.length === 0 ? (
            <div className="atelier-drawer-empty">
              <div className="empty-silhouette-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 className="empty-headline">Your Atelier Bag is Empty</h3>
              <p className="empty-subtext">
                Every garment in our catalog is hand-finished in numbered small batches. Browse our curated lookbook to discover your bespoke silhouette.
              </p>
              <button
                type="button"
                className="atelier-browse-btn"
                onClick={onClose}
              >
                Explore Curated Collections →
              </button>
            </div>
          ) : (
            <div className="atelier-line-items-stack">
              {items.map((item, index) => {
                const itemSubtotal = item.product.price * item.quantity;
                return (
                  <article
                    key={`${item.product.id}-${item.selectedSize || "nosize"}-${item.selectedColor || "nocolor"}-${index}`}
                    className="atelier-line-item"
                  >
                    {/* 3:4 Portrait Image */}
                    <div className="atelier-item-media">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="atelier-item-img"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                    </div>

                    {/* Garment Editorial Details */}
                    <div className="atelier-item-body">
                      <div className="atelier-item-headline-row">
                        <div>
                          <span className="atelier-item-category">
                            {item.product.category.replace(/-/g, " ")}
                          </span>
                          <h4 className="atelier-item-name">{item.product.name}</h4>
                        </div>
                        <button
                          type="button"
                          className="atelier-item-remove"
                          onClick={() => onRemoveItem(index)}
                          aria-label={`Remove ${item.product.name} from atelier bag`}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Selected Attributes Chips */}
                      <div className="atelier-item-facets">
                        {item.selectedSize && (
                          <span className="facet-chip size-chip">
                            Size: <strong>{item.selectedSize}</strong>
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="facet-chip color-chip">
                            <span
                              className="color-dot"
                              style={{
                                backgroundColor:
                                  item.product.colors?.find(
                                    (c) => c.name.toLowerCase() === item.selectedColor?.toLowerCase()
                                  )?.hex || "#111111",
                              }}
                              aria-hidden="true"
                            />
                            {item.selectedColor}
                          </span>
                        )}
                        {item.product.material && (
                          <span className="facet-chip material-chip">
                            {item.product.material}
                          </span>
                        )}
                      </div>

                      {/* Payment on Delivery Capability Chip */}
                      <div className="atelier-item-pod-tag">
                        {item.product.isPodEligible ? (
                          <span className="pod-tag-eligible">
                            <span className="tag-dot">✦</span> Doorstep Inspection & Pay Eligible
                          </span>
                        ) : (
                          <span className="pod-tag-prepay">
                            <span className="tag-dot">·</span> Pre-payment Required
                          </span>
                        )}
                      </div>

                      {/* Stepper & Price Row */}
                      <div className="atelier-item-footer">
                        <div className="atelier-qty-stepper" role="group" aria-label="Garment quantity stepper">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity for ${item.product.name}`}
                            className="qty-btn"
                          >
                            −
                          </button>
                          <span className="qty-value" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            disabled={item.quantity >= (item.product.stock || 20)}
                            aria-label={`Increase quantity for ${item.product.name}`}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>

                        <div className="atelier-item-price-col">
                          {item.quantity > 1 && (
                            <span className="unit-price">
                              {formatPrice(item.product.price)} each
                            </span>
                          )}
                          <span className="line-total">{formatPrice(itemSubtotal)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer: Gifting, Promo, Summary, Settlement Switcher */}
        {items.length > 0 && (
          <div className="atelier-drawer-footer">
            {/* 3. Atelier Gifting & Personalization Section */}
            <div className="atelier-gifting-container">
              <label htmlFor={giftCheckboxId} className="atelier-gifting-toggle">
                <input
                  type="checkbox"
                  id={giftCheckboxId}
                  checked={isGiftingSelected}
                  onChange={(e) => setIsGiftingSelected(e.target.checked)}
                  className="atelier-checkbox"
                />
                <div className="gifting-text-block">
                  <div className="gifting-header-row">
                    <span className="gifting-title">
                      Signature Gift Ribbon & Cotton Dustbag
                    </span>
                    <span className="gifting-complimentary-pill">Complimentary</span>
                  </div>
                  <p className="gifting-subtitle">
                    Enclosed in acid-free tissue paper, hand-tied grosgrain ribbon, and an archival keepsake box.
                  </p>
                </div>
              </label>

              {isGiftingSelected && (
                <div className="atelier-calligraphy-field animate-fade-in">
                  <label htmlFor="calligraphy-textarea" className="calligraphy-label">
                    Handwritten Calligraphy Card (Optional)
                  </label>
                  <textarea
                    id="calligraphy-textarea"
                    rows={2}
                    maxLength={250}
                    value={calligraphyMessage}
                    onChange={(e) => setCalligraphyMessage(e.target.value)}
                    placeholder="To dearest Sophia, on the occasion of your celebration. With love..."
                    className="calligraphy-input"
                  />
                  <div className="calligraphy-counter">
                    {calligraphyMessage.length} / 250 characters
                  </div>
                </div>
              )}
            </div>

            {/* Privilege Code / Invitation Row */}
            <form onSubmit={handleApplyPromo} className="atelier-promo-box">
              <div className="promo-input-wrapper">
                <input
                  type="text"
                  placeholder="Privilege Code (e.g. ATELIER10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="atelier-promo-input"
                  aria-label="Discount code"
                />
                <button type="submit" className="atelier-promo-btn">
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`atelier-promo-notice status-${promoStatus}`}>
                  {promoMessage}
                </p>
              )}
            </form>

            {/* Valuation Breakdown */}
            <div className="atelier-valuation-card">
              <div className="valuation-row">
                <span className="valuation-label">Atelier Subtotal</span>
                <span className="valuation-value">{formatPrice(rawSubtotal)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="valuation-row privilege-row">
                  <span className="valuation-label">VIP Privilege ({discountPercent}%)</span>
                  <span className="valuation-value discount-text">
                    −{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              {isGiftingSelected && (
                <div className="valuation-row">
                  <span className="valuation-label">Archival Keepsake Packaging</span>
                  <span className="valuation-value complimentary-text">Complimentary</span>
                </div>
              )}

              <div className="valuation-row">
                <span className="valuation-label">
                  White-Glove Express Courier
                  {amountToFreeShipping === 0 && (
                    <span className="tag-free">Unlocked</span>
                  )}
                </span>
                <span className="valuation-value">
                  {amountToFreeShipping === 0 ? "Complimentary" : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="valuation-row">
                <span className="valuation-label">Estimated Doorstep Duties & Taxes</span>
                <span className="valuation-value complimentary-text">Included</span>
              </div>

              <div className="valuation-row valuation-total">
                <div className="total-label-wrap">
                  <span className="total-title">Total Order Valuation</span>
                  <span className="total-currency-note">
                    {currency === "USD" ? "USD International Settlement" : "NGN Official Atelier Rate"}
                  </span>
                </div>
                <span className="total-amount">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Multi-Gateway Settlement Tabs */}
            <div className="atelier-settlement-suite">
              <div className="settlement-selector" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedMethod === "online"}
                  className={`settlement-option ${selectedMethod === "online" ? "selected" : ""}`}
                  onClick={() => setSelectedMethod("online")}
                >
                  <div className="option-radio" aria-hidden="true">
                    <span className="radio-inner" />
                  </div>
                  <div className="option-text">
                    <strong>Pay Online via Paystack</strong>
                    <span>Instant Cards, Apple Pay, Bank Transfer</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedMethod === "pod"}
                  className={`settlement-option ${selectedMethod === "pod" ? "selected" : ""}`}
                  onClick={() => setSelectedMethod("pod")}
                >
                  <div className="option-radio" aria-hidden="true">
                    <span className="radio-inner" />
                  </div>
                  <div className="option-text">
                    <strong>Payment on Delivery (PoD)</strong>
                    <span>Inspect garment at door in Lagos, Abuja & PH</span>
                  </div>
                </button>
              </div>

              {/* Online Paystack Settlement */}
              {selectedMethod === "online" && (
                <div className="settlement-body-online">
                  <button
                    type="button"
                    className="atelier-primary-cta"
                    onClick={() => onCheckout("inline")}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <span className="btn-loading-flex">
                        <span className="atelier-spinner" /> Connecting to Paystack...
                      </span>
                    ) : (
                      `Proceed to Encrypted Checkout · ${formatPrice(totalAmount)}`
                    )}
                  </button>

                  <button
                    type="button"
                    className="atelier-secondary-link"
                    onClick={() => onCheckout("redirect")}
                    disabled={isCheckingOut}
                  >
                    Open Paystack window in separate tab →
                  </button>
                </div>
              )}

              {/* Payment on Delivery (PoD) Section */}
              {selectedMethod === "pod" && (
                <div className="settlement-body-pod">
                  {!isCartEligibleForPod ? (
                    <div className="pod-advisory-box">
                      <div className="advisory-title">
                        <span>✦</span> Pre-payment Required For Some Pieces
                      </div>
                      <p className="advisory-text">
                        The following pieces in your bag are limited runway or bespoke items requiring pre-settlement:
                      </p>
                      <ul className="advisory-list">
                        {nonPodItems.map((it, idx) => (
                          <li key={idx}>{it.product.name}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className="advisory-switch-btn"
                        onClick={() => setSelectedMethod("online")}
                      >
                        Switch to Online Settlement →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePodSubmit} className="pod-concierge-form">
                      <div className="pod-banner-note">
                        <span className="badge-doorstep">Doorstep Inspection Guarantee</span>
                        <p>
                          Our courier will present the parcel for your inspection. Settle <strong>{formatPrice(totalAmount)}</strong> via mobile POS card terminal (Mastercard, Visa, Verve) or cash upon satisfaction.
                        </p>
                      </div>

                      {podFormError && (
                        <div className="pod-error-alert" role="alert">
                          {podFormError}
                        </div>
                      )}

                      <div className="pod-field-group">
                        <label htmlFor="pod-city-select" className="pod-label">
                          Metropolitan Region
                        </label>
                        <select
                          id="pod-city-select"
                          value={podCity}
                          onChange={(e) => setPodCity(e.target.value)}
                          className="pod-select-input"
                        >
                          <option value="Lagos (Island & Lekki)">Lagos (Ikoyi, Victoria Island & Lekki)</option>
                          <option value="Lagos (Mainland & Ikeja)">Lagos (Ikeja, GRA, Surulere & Yaba)</option>
                          <option value="Abuja FCT">Abuja FCT (Maitama, Asokoro, Wuse II)</option>
                          <option value="Port Harcourt">Port Harcourt (Old GRA, Trans-Amadi)</option>
                          <option value="Ibadan">Ibadan (Bodija, Iyaganku GRA)</option>
                        </select>
                      </div>

                      <div className="pod-field-group">
                        <label htmlFor="pod-address-input" className="pod-label">
                          Doorstep Residence / Suite Address
                        </label>
                        <input
                          id="pod-address-input"
                          type="text"
                          placeholder="e.g. Penthouse 4, 18 Alexander Road, Ikoyi"
                          value={podAddress}
                          onChange={(e) => setPodAddress(e.target.value)}
                          className="pod-text-input"
                          required
                        />
                      </div>

                      <div className="pod-field-group">
                        <label htmlFor="pod-phone-input" className="pod-label">
                          Courier Contact Phone
                        </label>
                        <input
                          id="pod-phone-input"
                          type="tel"
                          placeholder="+234 802 345 6789"
                          value={podPhone}
                          onChange={(e) => setPodPhone(e.target.value)}
                          className="pod-text-input"
                          required
                        />
                      </div>

                      <div className="pod-field-group">
                        <label htmlFor="pod-notes-input" className="pod-label">
                          Concierge / Gate Instructions (Optional)
                        </label>
                        <input
                          id="pod-notes-input"
                          type="text"
                          placeholder="Estate security code, intercom number, or delivery window"
                          value={podNotes}
                          onChange={(e) => setPodNotes(e.target.value)}
                          className="pod-text-input"
                        />
                      </div>

                      <button
                        type="submit"
                        className="atelier-primary-cta pod-cta"
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <span className="btn-loading-flex">
                            <span className="atelier-spinner" /> Dispatching Atelier Order...
                          </span>
                        ) : (
                          `Confirm Order · Settle at Doorstep (${formatPrice(totalAmount)})`
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* White-Glove Security & Service Strip */}
            <div className="atelier-trust-strip">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span className="trust-text">256-Bit SSL Encrypted Settlement</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📦</span>
                <span className="trust-text">Dispatched Within 24h</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">↺</span>
                <span className="trust-text">7-Day Complimentary Atelier Exchange</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
