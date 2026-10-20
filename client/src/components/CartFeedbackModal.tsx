import React from "react";
import type { Product } from "../types";

export interface CartFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "SUCCESS" | "OUT_OF_STOCK";
  product: Product | null;
  selectedSize?: string;
  selectedColor?: string;
  onOpenCart: () => void;
  formatPrice: (amount: number) => string;
}

export const CartFeedbackModal: React.FC<CartFeedbackModalProps> = ({
  isOpen,
  onClose,
  status,
  product,
  selectedSize,
  selectedColor,
  onOpenCart,
  formatPrice,
}) => {
  if (!isOpen || !product) return null;

  const isSuccess = status === "SUCCESS";

  return (
    <div className="modal-backdrop feedback-modal-backdrop" onClick={onClose}>
      <div
        className="modal-card feedback-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className={`feedback-icon-wrap ${isSuccess ? "success" : "unavailable"}`}>
          {isSuccess ? (
            <span className="feedback-icon">✓</span>
          ) : (
            <span className="feedback-icon">✕</span>
          )}
        </div>

        <div className="feedback-header">
          <span className="feedback-kicker">
            {isSuccess ? "ATELIER SELECTION" : "AVAILABILITY NOTICE"}
          </span>
          <h3>
            {isSuccess
              ? "Product Added to Cart Successfully"
              : "Product is Not Available at the Moment"}
          </h3>
          <p className="feedback-subtext">
            {isSuccess
              ? "Your bespoke garment has been reserved in your shopping bag."
              : "This signature piece is currently out of stock or reserved by other atelier clients."}
          </p>
        </div>

        {/* Product mini-preview */}
        <div className="feedback-product-preview">
          <img
            src={product.image}
            alt={product.name}
            className="feedback-product-img"
          />
          <div className="feedback-product-info">
            <strong>{product.name}</strong>
            <span className="feedback-product-category">{product.category}</span>
            <div className="feedback-specs-row">
              {selectedSize && <span>Size: {selectedSize}</span>}
              {selectedColor && <span>Color: {selectedColor}</span>}
            </div>
            <strong className="feedback-product-price">
              {formatPrice(product.price)}
            </strong>
          </div>
        </div>

        {/* Actions */}
        <div className="feedback-actions">
          {isSuccess ? (
            <>
              <button
                className="primary-button"
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
              >
                View Bag & Checkout →
              </button>
              <button className="secondary-button" onClick={onClose}>
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <button
                className="primary-button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Available Collection
              </button>
              <button className="secondary-button" onClick={onClose}>
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
