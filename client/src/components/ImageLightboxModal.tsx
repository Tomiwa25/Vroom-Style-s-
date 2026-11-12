import React, { useState, useEffect, useCallback } from "react";
import type { Product } from "../types";

interface ImageLightboxModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  formatPrice?: (amount: number) => string;
  onAddToCart?: (product: Product) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  product,
  isOpen,
  onClose,
  initialIndex = 0,
  formatPrice,
  onAddToCart,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [prevProduct, setPrevProduct] = useState<Product | null>(null);
  const [prevInitialIndex, setPrevInitialIndex] = useState<number>(initialIndex);

  // Sync state when product or initialIndex prop changes without effect
  if (product !== prevProduct || initialIndex !== prevInitialIndex) {
    setPrevProduct(product);
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }

  const images = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    return [product.image];
  }, [product]);

  const getAngleLabel = useCallback(
    (index: number) => {
      if (!product) return `Angle ${index + 1}`;
      if (product.category === "Cars") {
        switch (index) {
          case 0:
            return "Exterior Front (3/4 Profile)";
          case 1:
            return "Exterior Rear (Diffuser & Lights)";
          case 2:
            return "Interior Cockpit (Cabin & Dashboard)";
          default:
            return `View Angle ${index + 1}`;
        }
      }
      switch (index) {
        case 0:
          return "Front Perspective";
        case 1:
          return "Side / Profile View";
        case 2:
          return "Interior / Craft Detail";
        default:
          return `View Angle ${index + 1}`;
      }
    },
    [product]
  );

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !product || images.length === 0) return null;

  const currentImage = images[currentIndex] || product.image;

  return (
    <div
      className="image-lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} multi-angle photo gallery`}
    >
      <div
        className="image-lightbox-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <header className="image-lightbox-header">
          <div className="lightbox-product-meta">
            <span className="lightbox-category-tag">{product.category}</span>
            <h3 className="lightbox-product-title">{product.name}</h3>
            <span className="lightbox-angle-indicator">
              📸 {getAngleLabel(currentIndex)} ({currentIndex + 1} of {images.length})
            </span>
          </div>

          <div className="lightbox-header-actions">
            <button
              type="button"
              className={`lightbox-action-btn ${isZoomed ? "active" : ""}`}
              onClick={() => setIsZoomed((prev) => !prev)}
              title={isZoomed ? "Reset zoom (1x)" : "Zoom in (2x)"}
              aria-label={isZoomed ? "Reset zoom" : "Zoom in"}
            >
              <span>{isZoomed ? "🔍 1x Reset" : "🔍 2x Zoom"}</span>
            </button>

            <button
              type="button"
              className="lightbox-close-btn"
              onClick={onClose}
              title="Close image viewer (Esc)"
              aria-label="Close image viewer"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Main Stage Image Area */}
        <div className="image-lightbox-stage">
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={handlePrev}
              title="Previous angle (Left arrow)"
              aria-label="Previous angle"
            >
              ‹
            </button>
          )}

          <div
            className={`lightbox-viewport ${isZoomed ? "zoomed" : ""}`}
            onClick={() => setIsZoomed((prev) => !prev)}
            title="Click to toggle zoom"
          >
            <img
              src={currentImage}
              alt={`${product.name} - ${getAngleLabel(currentIndex)}`}
              className={`lightbox-primary-img ${isZoomed ? "is-zoomed" : ""}`}
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={handleNext}
              title="Next angle (Right arrow)"
              aria-label="Next angle"
            >
              ›
            </button>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div className="lightbox-thumbnails-rail">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                className={`lightbox-thumb-btn ${idx === currentIndex ? "active" : ""}`}
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Angle ${idx + 1}`}
                  className="lightbox-thumb-img"
                />
                <span className="lightbox-thumb-label">
                  {idx === 0
                    ? "Front"
                    : idx === 1
                    ? product.category === "Cars"
                      ? "Rear"
                      : "Side"
                    : product.category === "Cars"
                    ? "Interior"
                    : "Detail"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Specs & Action Bar */}
        <footer className="image-lightbox-footer">
          <div className="lightbox-footer-info">
            <span className="lightbox-price">
              {formatPrice ? formatPrice(product.price) : `₦${product.price.toLocaleString()}`}
            </span>
            {product.specs && (
              <div className="lightbox-specs-pills">
                {Object.entries(product.specs)
                  .slice(0, 3)
                  .map(([key, val]) => (
                    <span key={key} className="lightbox-spec-pill">
                      <strong>{key}:</strong> {val}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {onAddToCart && (
            <button
              type="button"
              className="lightbox-cta-btn"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <span>Add to Cart • ₦{product.price.toLocaleString()}</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
