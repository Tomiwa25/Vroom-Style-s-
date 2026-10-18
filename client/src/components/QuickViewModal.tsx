import React, { useState } from "react";
import type { Product } from "../types";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: string,
    color: string,
    quantity: number
  ) => void;
  formatPrice: (amountInNGN: number) => string;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  formatPrice,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  if (!isOpen || !product) return null;

  const currentImage = activeImage || product.image;
  const currentSize = selectedSize || product.sizes?.[0] || "One Size";
  const currentColor = selectedColor || product.colors?.[0]?.name || "Default";
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAdd = () => {
    onAddToCart(product, currentSize, currentColor, quantity);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card quickview-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="quickview-layout">
          {/* Product Media with Multi-Image Gallery */}
          <div className="quickview-media">
            <img
              src={currentImage}
              alt={product.name}
              className="quickview-img"
            />
            {product.tag && (
              <span className="quickview-badge">{product.tag}</span>
            )}

            {gallery.length > 1 && (
              <div className="quickview-gallery-strip">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    className={`gallery-thumb-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    title={`View angle ${idx + 1}`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="quickview-details">
            <span className="quickview-category">{product.category}</span>
            <h2 className="quickview-title">{product.name}</h2>
            <div className="quickview-price">{formatPrice(product.price)}</div>

            <p className="quickview-desc">{product.description}</p>

            {product.material && (
              <div className="quickview-spec">
                <strong>Material:</strong> <span>{product.material}</span>
              </div>
            )}

            {/* Stock counter indicator */}
            <div className="quickview-stock-indicator">
              <span className="stock-dot"></span>
              <span>
                {product.stock > 5 ? (
                  `In Stock (${product.stock} items ready to dispatch)`
                ) : (
                  <strong>Only {product.stock} items left in stock — order soon</strong>
                )}
              </span>
            </div>

            {/* Color Swatch Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="quickview-option-group">
                <label className="option-label">
                  <span>Color:</span> <strong>{currentColor}</strong>
                </label>
                <div className="swatch-pills-row">
                  {product.colors.map((c: { name: string; hex: string }) => (
                    <button
                      key={c.name}
                      className={`swatch-pill ${
                        currentColor === c.name ? "selected" : ""
                      }`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="quickview-option-group">
                <div className="size-header-row">
                  <label className="option-label">
                    <span>Select Size:</span> <strong>{currentSize}</strong>
                  </label>
                  {product.fitGuide && (
                    <span className="fit-guide-tag">
                      ✓ Fits {product.fitGuide}
                    </span>
                  )}
                </div>
                <div className="size-chips-row">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-chip ${
                        currentSize === s ? "selected" : ""
                      }`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add CTA */}
            <div className="quickview-cta-row">
              <div className="qty-stepper large">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

              <button
                className="primary-button quickview-add-btn"
                onClick={handleAdd}
              >
                Add to Bag • {formatPrice(product.price * quantity)}
              </button>
            </div>

            <div className="quickview-perks">
              <span>✦ Free express dispatch on orders over ₦100,000</span>
              <span>✦ 7-day complimentary return & size exchange</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
