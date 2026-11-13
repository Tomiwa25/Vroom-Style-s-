import React, { useState } from "react";
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
  formatPrice,
  onCheckout,
  isCheckingOut = false,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Payment on Delivery (PoD) State
  const [selectedMethod, setSelectedMethod] = useState<"online" | "pod">("online");
  const [podAddress, setPodAddress] = useState("");
  const [podPhone, setPodPhone] = useState("");
  const [podCity, setPodCity] = useState("Lagos (Island & Lekki)");
  const [podNotes, setPodNotes] = useState("");
  const [podFormError, setPodFormError] = useState("");

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = rawSubtotal - discountAmount;
  const freeShippingThreshold = 100000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = amountToFreeShipping === 0 ? 0 : 5000;
  const totalAmount = subtotal + shippingFee;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  // PoD Eligibility calculation
  const isCartEligibleForPod =
    items.length > 0 && items.every((i) => i.product.isPodEligible);
  const nonPodItems = items.filter((i) => !i.product.isPodEligible);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "VROOM10") {
      setDiscountPercent(10);
      setPromoMessage("VROOM10 applied — 10% off.");
    } else if (promoCode.trim().toUpperCase() === "VROOM20") {
      setDiscountPercent(20);
      setPromoMessage("VROOM20 applied — 20% off.");
    } else {
      setPromoMessage("That code isn't valid.");
    }
  };

  const handlePodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podAddress.trim()) {
      setPodFormError("Add the address the courier should bring this to.");
      return;
    }
    if (!podPhone.trim() || podPhone.trim().length < 10) {
      setPodFormError("Add the phone number your courier will call.");
      return;
    }
    setPodFormError("");

    onCheckout("pod", {
      address: podAddress.trim(),
      phone: podPhone.trim(),
      city: podCity,
      deliveryNotes: podNotes.trim(),
    });
  };

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>Bag</h3>
            <span className="drawer-count">
              {items.reduce((acc, i) => acc + i.quantity, 0) === 1
                ? "1 piece"
                : `${items.reduce((acc, i) => acc + i.quantity, 0)} pieces`}
            </span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Free Shipping Tier Banner */}
        <div className="shipping-tier-card">
          <div className="shipping-tier-text">
            {amountToFreeShipping === 0 ? (
              <span>
                <strong>Express delivery is on us</strong>
              </span>
            ) : (
              <span>
                <strong>{formatPrice(amountToFreeShipping)}</strong> more and
                delivery is on us
              </span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="drawer-empty-state">
              <p className="empty-title">Your bag is empty</p>
              <p className="empty-sub">
                Pieces you add will be held here until you check out.
              </p>
              <button className="primary-button" onClick={onClose}>
                Browse the collection
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="drawer-item">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="drawer-item-img"
                />
                <div className="drawer-item-info">
                  <div className="drawer-item-header">
                    <h4 className="drawer-item-title">{item.product.name}</h4>
                    <button
                      className="item-remove-btn"
                      onClick={() => onRemoveItem(index)}
                      aria-label={`Remove ${item.product.name} from bag`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="drawer-item-meta">
                    {item.selectedSize && <span>Size {item.selectedSize}</span>}
                    {item.selectedColor && <span>{item.selectedColor}</span>}
                  </div>

                  <div className="drawer-item-pod-tag">
                    {item.product.isPodEligible
                      ? "Can be paid at delivery"
                      : "Paid in advance"}
                  </div>

                  <div className="drawer-item-bottom">
                    <div className="qty-stepper">
                      <button
                        onClick={() =>
                          onUpdateQuantity(index, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(index, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="drawer-item-price">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Totals & Conversion Enablers */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <form onSubmit={handleApplyPromo} className="promo-input-row">
              <input
                type="text"
                placeholder="Discount code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-field"
              />
              <button type="submit" className="promo-apply-btn">
                Apply
              </button>
            </form>
            {promoMessage && (
              <div
                className={`promo-message ${
                  discountPercent > 0 ? "success" : "warning"
                }`}
              >
                {promoMessage}
              </div>
            )}

            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>{formatPrice(rawSubtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="cost-row discount">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="cost-row">
                <span>Delivery</span>
                <span>
                  {amountToFreeShipping === 0 ? "Free" : formatPrice(5000)}
                </span>
              </div>
              <div className="cost-row total-row">
                <strong>Total</strong>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>
            </div>

            {/* Step 5: Conversion & Checkout Enabler - Settlement Method Switcher */}
            <div className="checkout-settlement-section">
              <div className="settlement-toggle-tabs">
                <button
                  type="button"
                  className={`settlement-tab ${selectedMethod === "online" ? "active" : ""}`}
                  onClick={() => setSelectedMethod("online")}
                >
                  <div className="tab-labels">
                    <strong>Pay online</strong>
                    <span>Card or transfer via Paystack</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`settlement-tab ${selectedMethod === "pod" ? "active" : ""}`}
                  onClick={() => setSelectedMethod("pod")}
                >
                  <div className="tab-labels">
                    <strong>Pay on delivery</strong>
                    <span>POS or cash at your door</span>
                  </div>
                </button>
              </div>

              {/* ONLINE METHOD CTA */}
              {selectedMethod === "online" && (
                <div className="checkout-action-group">
                  <button
                    className="primary-button checkout-btn"
                    onClick={() => onCheckout("inline")}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <span className="checkout-spinner-label">
                        <span className="btn-spinner"></span> Taking you to payment...
                      </span>
                    ) : (
                      `Checkout · ${formatPrice(totalAmount)}`
                    )}
                  </button>

                  <button
                    type="button"
                    className="checkout-alt-link"
                    onClick={() => onCheckout("redirect")}
                    disabled={isCheckingOut}
                    title="Open the Paystack checkout page in a new tab"
                  >
                    Pay in a separate window
                  </button>
                </div>
              )}

              {/* PAYMENT ON DELIVERY (PoD) DRAWER FORM */}
              {selectedMethod === "pod" && (
                <div className="pod-checkout-form-container">
                  {!isCartEligibleForPod ? (
                    <div className="pod-ineligible-banner">
                      
                      <div>
                        <strong>These pieces need paying in advance</strong>
                        <p>Everything else in your bag can be paid at the door.</p>
                        <ul>
                          {nonPodItems.map((it, i) => (
                            <li key={i}>{it.product.name}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="switch-to-online-btn"
                          onClick={() => setSelectedMethod("online")}
                        >
                          Pay online instead
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePodSubmit} className="pod-doorstep-form">
                      <div className="pod-form-header">
                        <span className="pod-form-badge">Paid at your door</span>
                        <p>
                          Inspect the parcel when it arrives. Pay <strong>{formatPrice(totalAmount)}</strong> via mobile POS card terminal (Mastercard, Visa, Verve) or cash.
                        </p>
                      </div>

                      {podFormError && (
                        <div className="pod-form-error-msg">{podFormError}</div>
                      )}

                      <div className="pod-input-group">
                        <label>Delivery region</label>
                        <select
                          value={podCity}
                          onChange={(e) => setPodCity(e.target.value)}
                          className="pod-select"
                        >
                          <option value="Lagos (Island & Lekki)">Lagos (Island & Lekki)</option>
                          <option value="Lagos (Mainland & Ikeja)">Lagos (Mainland & Ikeja)</option>
                          <option value="Abuja FCT">Abuja FCT</option>
                          <option value="Port Harcourt">Port Harcourt</option>
                          <option value="Ibadan">Ibadan</option>
                        </select>
                      </div>

                      <div className="pod-input-group">
                        <label>Street address</label>
                        <input
                          type="text"
                          className="pod-input"
                          placeholder="Flat 3, 14 Admiralty Way, Lekki Phase 1"
                          value={podAddress}
                          onChange={(e) => setPodAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="pod-input-group">
                        <label>Phone for the courier</label>
                        <input
                          type="tel"
                          className="pod-input"
                          placeholder="+234 802 345 6789"
                          value={podPhone}
                          onChange={(e) => setPodPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="pod-input-group">
                        <label>Delivery notes (optional)</label>
                        <input
                          type="text"
                          className="pod-input"
                          placeholder="Gate code, landmark, when to call"
                          value={podNotes}
                          onChange={(e) => setPodNotes(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="primary-button pod-confirm-btn"
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <span className="checkout-spinner-label">
                            <span className="btn-spinner"></span> Dispatching Order...
                          </span>
                        ) : (
                          `Place order, pay at delivery (${formatPrice(totalAmount)})`
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="checkout-trust-row">
              <span>256-bit encrypted checkout</span>
              <span>Dispatched within 24 hours</span>
              <span>Inspect before you pay</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
