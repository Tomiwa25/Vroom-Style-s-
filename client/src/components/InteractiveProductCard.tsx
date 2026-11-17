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

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });

    // Horizontal scrub trigger across gallery images
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
    setActiveImageIndex(0);
  };

  const currentDisplayImg = gallery[activeImageIndex] || product.image;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

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

      {/* Media container */}
      <div
        className="product-media-container"
        onClick={() => onQuickView(product)}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onQuickView(product);
          }
        }}
      >
        <img
          src={currentDisplayImg}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Multi-angle scrub bar indicators */}
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

        {/* Floating Wishlist Button */}
        <button
          type="button"
          className={`card-wishlist-btn ${isFavorited ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={
            isFavorited
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          title={isFavorited ? "Saved to wishlist" : "Add to wishlist"}
        >
          {isFavorited ? "♥" : "♡"}
        </button>

        {/* Hover Quick View Trigger */}
        <button
          type="button"
          className="quick-view-hover-btn pill"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
        >
          Quick View
        </button>
      </div>

      {/* Streamlined Product Card Body */}
      <div className="product-card-body">
        <div className="product-card-eyebrow">
          <span className="product-card-category">
            {product.brand ? `${product.brand} · ${product.category}` : product.category}
          </span>
        </div>

        <h3 className="product-card-title" onClick={() => onQuickView(product)}>
          {product.name}
        </h3>

        {/* Clean concise description for the view */}
        {product.description && (
          <p className="product-card-desc" title={product.description}>
            {product.description}
          </p>
        )}

        {/* Price and In-Store stock count */}
        <div className="product-card-footer">
          <span className="product-card-price">{formatPrice(product.price)}</span>

          <span
            className={`product-card-stock ${
              isOutOfStock ? "out" : isLowStock ? "low" : "in"
            }`}
          >
            <span className="stock-dot" />
            {isOutOfStock
              ? "Out of store"
              : isLowStock
              ? `Only ${product.stock} in store`
              : `${product.stock} in store`}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="product-card-add-btn pill"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          {isOutOfStock ? "Sold Out" : "Add to Bag +"}
        </button>
      </div>
    </article>
  );
};
