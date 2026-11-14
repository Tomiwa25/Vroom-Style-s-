import React, { useState, useRef } from "react";
import type { Product } from "../types";

interface InteractiveProductCardProps {
  product: Product;
  isFavorited: boolean;
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export const InteractiveProductCard: React.FC<InteractiveProductCardProps> = ({
  product,
  isFavorited,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  formatPrice,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const gallery =
    product.images && product.images.length > 0 ? product.images : [product.image];

  // 3D Tilt calculation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });

    // Horizontal scrub trigger across 3 angles
    if (gallery.length > 1) {
      const stepWidth = rect.width / gallery.length;
      const hoveredStep = Math.min(
        gallery.length - 1,
        Math.max(0, Math.floor(x / stepWidth))
      );
      setActiveImageIndex(hoveredStep);
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare((g) => ({ ...g, opacity: 0 }));
    setActiveImageIndex(0); // Reset to primary lookbook editorial shot
  };

  const currentDisplayImg = gallery[activeImageIndex] || product.image;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="interactive-3d-card"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
      }}
    >
      {/* Specular Light Flare */}
      <div
        className="card-specular-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 70%)`,
        }}
      />

      <div className="product-media-container">
        <img
          src={currentDisplayImg}
          alt={product.name}
          className="product-card-img"
          onClick={() => onQuickView(product)}
        />

        {/* 3-Angle Quick Scrub Segments Indicator */}
        {gallery.length > 1 && (
          <div className="card-scrub-indicators">
            {gallery.map((_, idx) => (
              <span
                key={idx}
                className={`scrub-bar ${activeImageIndex === idx ? "active" : ""}`}
              />
            ))}
          </div>
        )}

        {/* Tag & 360 Badge */}
        <div className="card-badge-row">
          {product.tag && <span className="product-badge">{product.tag}</span>}
          <span className="card-3d-pill" title="Interactive 3D Triad Available">
            360° TRIAD
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          className={`card-wishlist-btn ${isFavorited ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label="Save to wishlist"
          title={isFavorited ? "Saved to wishlist" : "Add to wishlist"}
        >
          {isFavorited ? "♥" : "♡"}
        </button>

        {/* Quick View Button */}
        <button
          className="quick-view-trigger-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
        >
          <span>Quick 3D View</span>
        </button>
      </div>

      <div className="meta">
        <div className="meta-category-row">
          <span className="product-category">{product.category}</span>
          {product.stock <= 4 && (
            <span className="stock low">Only {product.stock} left</span>
          )}
        </div>

        <h3 className="product-name" onClick={() => onQuickView(product)}>
          {product.name}
        </h3>

        {product.colors && product.colors.length > 0 && (
          <div className="card-color-swatches">
            {product.colors.map((c) => (
              <span
                key={c.name}
                className="color-dot"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        <div className="product-details">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.stock <= 5 ? (
            <span className="stock low" title={`${product.stock} items left in stock`}>
              Only {product.stock} left
            </span>
          ) : (
            <span className="stock in" title={`${product.stock} items in stock`}>
              {product.stock} in stock
            </span>
          )}
        </div>

        <button
          type="button"
          className="product-add"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          Add to Bag +
        </button>
      </div>
    </article>
  );
};
