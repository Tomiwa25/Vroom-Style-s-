import React, { useState } from "react";
import type { Product } from "../types";
import { calculateDiscount } from "../utils/discount";

interface ProductCardProps {
  product: Product;
  formatPrice: (amount: number) => string;
  isFavorited?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart?: (product: Product, size?: string, color?: string) => void;
  compact?: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85";

/**
 * Reusable Product Card Component.
 * Encapsulates lazy-loaded image with CDN fallback, multi-line title/description clamping,
 * star-rating engine with customer review counts, localized ₦ dual-pricing,
 * "From ₦..." variant selector logic, inventory scarcity meters,
 * multi-tenant seller separation (1P vs 3P), warranty indicators, and bundled incentives.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  formatPrice,
  isFavorited = false,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  compact = false,
}) => {
  const [errorImageId, setErrorImageId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeAngleIndex, setActiveAngleIndex] = useState<number>(0);
  const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
  const [userSelectedColor, setUserSelectedColor] = useState<string | null>(null);

  const selectedSize = userSelectedSize ?? product.sizes?.[0] ?? "Standard";
  const selectedColor = userSelectedColor ?? product.colors?.[0]?.name ?? "Default";
  const hasImgError = errorImageId === product.id;

  const discount = calculateDiscount(product.price, product.originalPrice);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = hasImgError
    ? FALLBACK_IMAGE
    : gallery[activeAngleIndex] || product.image || FALLBACK_IMAGE;

  // Star Rating Engine
  const ratingValue = product.rating || 4.8;
  const reviewCount = product.reviewCount || 120;
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue - fullStars >= 0.5;

  // Variant & "From ₦..." logic
  const hasMultipleVariants =
    Boolean(product.hasVariants) ||
    Boolean(product.sizes && product.sizes.length > 1) ||
    Boolean(product.colors && product.colors.length > 1);

  // Scarcity threshold
  const isScarce = product.stock > 0 && product.stock <= 10;
  const initialStock = product.initialStock || Math.max(product.stock * 2, 30);
  const percentClaimed = Math.min(
    100,
    Math.round(((initialStock - product.stock) / initialStock) * 100)
  );

  const handleCardClick = () => {
    if (onQuickView) onQuickView(product);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, selectedSize, selectedColor);
    }
  };

  return (
    <article
      className={`reusable-product-card ${compact ? "compact" : ""} ${
        product.category === "Cars" ? "card-category-cars" : ""
      } ${product.stock <= 0 ? "out-of-stock" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveAngleIndex(0);
      }}
    >
      {/* Media & Badges */}
      <div
        className={`card-media-wrapper ${product.category === "Cars" ? "cars-media-frame" : ""}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={activeImage}
          alt={product.name}
          className="card-product-img"
          loading="lazy"
          onError={() => setErrorImageId(product.id)}
        />

        {/* Dynamic Discount Badge (-49%, -56%) */}
        {discount.hasDiscount && (
          <span className="card-dynamic-discount-badge">
            {discount.formattedBadge}
          </span>
        )}

        {/* Multi-angle indicator pill */}
        {gallery.length > 1 && (
          <span className="card-angles-badge" title="Multiple high-resolution angles available">
            📸 {gallery.length} Angles
          </span>
        )}

        {/* Atelier / Collection Tag Badge */}
        {product.tag && (
          <span className="card-marketing-tag">{product.tag}</span>
        )}

        {/* Bundled Incentive Ribbon Tag (e.g. + FREE 43" SMART TV, + FREE Qi2 FAST CHARGE CABLE) */}
        {product.bundledIncentive && (
          <div className="card-bundled-incentive-pill" title={product.bundledIncentive}>
            <span className="incentive-icon">🎁</span>
            <span className="incentive-text">{product.bundledIncentive}</span>
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        {onToggleWishlist && (
          <button
            type="button"
            className={`card-wishlist-action ${isFavorited ? "favorited" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isFavorited ? "Remove from saved items" : "Save to wishlist"}
          >
            {isFavorited ? "♥" : "♡"}
          </button>
        )}

        {/* Multi-angle quick hover dots / buttons */}
        {gallery.length > 1 && isHovered && (
          <div
            className="card-angle-dots-row"
            onClick={(e) => e.stopPropagation()}
          >
            {gallery.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`card-angle-dot ${activeAngleIndex === idx ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAngleIndex(idx);
                }}
                onMouseEnter={() => setActiveAngleIndex(idx)}
                title={
                  product.category === "Cars"
                    ? idx === 0
                      ? "Front Exterior"
                      : idx === 1
                      ? "Rear View"
                      : "Interior Cockpit"
                    : `Angle ${idx + 1}`
                }
              />
            ))}
          </div>
        )}

        {/* Card Overlay Actions: Quick Look + Open Lightbox */}
        <div className="card-media-overlay-actions">
          {onOpenLightbox && (
            <button
              type="button"
              className="card-lightbox-trigger-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(product, activeAngleIndex);
              }}
              title="Open full-resolution image viewer"
              aria-label="Open full image gallery"
            >
              🔍 Open Angles
            </button>
          )}

          {onQuickView && (
            <button
              type="button"
              className="card-quick-look-btn"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              Quick Look
            </button>
          )}
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="card-content-body">
        {/* Multi-Tenant Seller Attribution & Logistics Tag */}
        <div className="card-seller-attribution-row">
          {product.sellerType === "1P" ? (
            <span className="seller-tag seller-1p" title="Official Vroom Direct Retail">
              <span className="seller-icon">👑</span> Vroom Direct
            </span>
          ) : (
            <span className="seller-tag seller-3p" title={`Verified Marketplace Vendor: ${product.sellerName || "Partner"}`}>
              <span className="seller-icon">🏪</span> {product.sellerName || "Marketplace"}
              {product.sellerRating ? ` (${product.sellerRating}%)` : ""}
            </span>
          )}

          {product.isFulfilledByVroom && (
            <span className="express-logistics-pill" title="Fulfilled by Vroom Express Logistics">
              ⚡ Express
            </span>
          )}

          {product.isPodEligible && (
            <span className="pod-logistics-pill" title={product.podTerms || "Eligible for Payment on Delivery"}>
              💵 Pay on Delivery
            </span>
          )}
        </div>

        {/* Brand & Category taxonomy string */}
        <div className="card-taxonomy-row">
          <span className="card-brand-name">
            {product.brand ? product.brand : product.category}
          </span>
          <span className="card-category-sub">• {product.category}</span>
        </div>

        {/* Multi-line clamped product title */}
        <h4
          className="card-clamped-title"
          onClick={handleCardClick}
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Warranty & Assurance Attribute Tag (e.g. + 12 Month Warranty, 2-Year Warranty) */}
        {product.warranty && (
          <div className="card-warranty-assurance-row" title={`Warranty: ${product.warranty}`}>
            <span className="warranty-shield-icon">🛡️</span>
            <span className="warranty-text">{product.warranty}</span>
          </div>
        )}

        {/* Specs Badges for Cars, Appliances & Tech */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="card-specs-preview-strip">
            {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
              <span key={k} className="card-spec-chip" title={`${k}: ${v}`}>
                <strong>{k}:</strong> {v}
              </span>
            ))}
          </div>
        )}

        {/* Multi-line clamped description string (hidden on compact mode) */}
        {!compact && product.description && (
          <p className="card-clamped-description" title={product.description}>
            {product.description}
          </p>
        )}

        {/* Star Rating Engine with Aggregate Customer Review Counter */}
        <div className="card-star-rating-row" title={`Rated ${ratingValue} out of 5 stars by ${reviewCount} patrons`}>
          <div className="stars-cluster" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`star-char ${
                  i < fullStars ? "star-filled" : i === fullStars && hasHalfStar ? "star-half" : "star-empty"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="star-aggregate-text">
            <strong>{ratingValue.toFixed(1)}</strong> ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Variant Size Selector Pills (From ₦... logic) */}
        {product.sizes && product.sizes.length > 1 && (
          <div className="card-variant-sizes-strip">
            <span className="sizes-label">Sizes:</span>
            <div className="sizes-pill-list">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`size-mini-pill ${selectedSize === sz ? "selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserSelectedSize(sz);
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Swatches */}
        {product.colors && product.colors.length > 1 && (
          <div className="card-color-swatches-row">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`color-swatch-ring ${selectedColor === c.name ? "selected" : ""}`}
                style={{ backgroundColor: c.hex }}
                onClick={(e) => {
                  e.stopPropagation();
                  setUserSelectedColor(c.name);
                }}
                title={c.name}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        )}

        {/* Dual-Price Localized Display with "From ₦..." variant prefix */}
        <div className="card-pricing-block">
          <div className="pricing-primary-row">
            {hasMultipleVariants && (
              <span className="from-price-prefix">From</span>
            )}
            <span className="current-price-val">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="strikethrough-original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className={`stock-status-pill ${product.stock <= 5 ? "low" : "in"}`}>
            {product.stock <= 0
              ? "Sold Out"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : `${product.stock} in stock`}
          </span>
        </div>

        {/* Inventory Scarcity Progress Meter */}
        {isScarce && (
          <div className="card-scarcity-container">
            <div className="card-scarcity-meter">
              <div className="scarcity-progress-track">
                <div
                  className={`scarcity-progress-bar ${product.stock <= 4 ? "urgency-high" : ""}`}
                  style={{ width: `${percentClaimed}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add to Bag Action Button */}
        {onAddToCart && (
          <button
            type="button"
            className="card-add-to-cart-btn"
            onClick={handleAddClick}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Bag +"}
          </button>
        )}
      </div>
    </article>
  );
};

