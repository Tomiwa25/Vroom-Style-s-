import React, { useState } from "react";
import type { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  currency: "NGN" | "USD";
  formatPrice: (amountInNGN: number) => string;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  formatPrice,
  onCheckout,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotal = rawSubtotal - discountAmount;
  const freeShippingThreshold = 100000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "VROOM10") {
      setDiscountPercent(10);
      setPromoMessage("10% Atelier VIP discount applied!");
    } else if (promoCode.trim().toUpperCase() === "VROOM20") {
      setDiscountPercent(20);
      setPromoMessage("20% Summer Drop discount applied!");
    } else {
      setPromoMessage("Invalid promo code. Try 'VROOM10'");
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>Shopping Bag</h3>
            <span className="drawer-count">
              ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close bag"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Tier Banner */}
        <div className="shipping-tier-card">
          <div className="shipping-tier-text">
            {amountToFreeShipping === 0 ? (
              <span>✨ <strong>Complimentary Express Dispatch unlocked!</strong></span>
            ) : (
              <span>
                Add <strong>{formatPrice(amountToFreeShipping)}</strong> more to
                unlock <strong>Free Express Dispatch</strong>
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
              <span className="empty-bag-icon">🛍</span>
              <p className="empty-title">Your shopping bag is empty</p>
              <p className="empty-sub">
                Explore our curated atelier clothing and luxury accessories.
              </p>
              <button className="primary-button" onClick={onClose}>
                Explore Collection
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
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>

                  <div className="drawer-item-meta">
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <span>Color: {item.selectedColor}</span>
                    )}
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

        {/* Drawer Footer with Totals */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <form onSubmit={handleApplyPromo} className="promo-input-row">
              <input
                type="text"
                placeholder="Discount code (e.g. VROOM10)"
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
                  <span>VIP Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="cost-row">
                <span>Estimated Shipping</span>
                <span>
                  {amountToFreeShipping === 0 ? "FREE" : formatPrice(5000)}
                </span>
              </div>
              <div className="cost-row total-row">
                <strong>Estimated Total</strong>
                <strong>
                  {formatPrice(
                    subtotal + (amountToFreeShipping === 0 ? 0 : 5000)
                  )}
                </strong>
              </div>
            </div>

            <button className="primary-button checkout-btn" onClick={onCheckout}>
              Proceed to Secure Checkout →
            </button>

            <div className="checkout-trust-row">
              <span>🔒 256-Bit Encrypted</span>
              <span>⚡ Fast Paystack Dispatch</span>
              <span>↺ 7-Day Free Returns</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
