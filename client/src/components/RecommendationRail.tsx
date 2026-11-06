import React, { useRef } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface RecommendationRailProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  badge?: string;
  products: Product[];
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onClearRail?: () => void;
  viewAllCategory?: string;
  onViewAll?: (category?: string) => void;
}

/**
 * Reusable Horizontal Recommendation Rail / Carousel.
 * Powers "Recently Viewed", "Based On Your Search", and Category-Specific feeds
 * (Top Selling, Customer Faves, Phones Deals, Outdoors/Care).
 */
export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  title,
  subtitle,
  kicker = "RECOMMENDED FOR YOU",
  badge,
  products,
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onClearRail,
  viewAllCategory,
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="recommendation-rail-section" aria-label={title}>
      <div className="recommendation-rail-header">
        <div className="rail-title-group">
          {kicker && <span className="rail-kicker">{kicker}</span>}
          <div className="rail-heading-row">
            <h3 className="rail-title">{title}</h3>
            {badge && <span className="rail-badge">{badge}</span>}
          </div>
          {subtitle && <p className="rail-subtitle">{subtitle}</p>}
        </div>

        <div className="rail-actions-row">
          {onClearRail && (
            <button
              type="button"
              className="rail-clear-history-btn"
              onClick={onClearRail}
              title="Clear browsing history"
            >
              Clear History ×
            </button>
          )}

          {onViewAll && (
            <button
              type="button"
              className="rail-view-all-btn"
              onClick={() => onViewAll(viewAllCategory)}
            >
              See All →
            </button>
          )}

          {/* Carousel Arrow Controls */}
          <div className="rail-scroll-nav-buttons">
            <button
              type="button"
              className="rail-nav-btn prev"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              type="button"
              className="rail-nav-btn next"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="recommendation-carousel-track" ref={scrollContainerRef}>
        {products.map((product) => (
          <div key={product.id} className="rail-item-card-wrapper">
            <ProductCard
              product={product}
              formatPrice={formatPrice}
              isFavorited={wishlist.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
};
