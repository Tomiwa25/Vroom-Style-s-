import React, { useRef } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface RecommendationRailProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  products: Product[];
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onClearRail?: () => void;
  viewAllCategory?: string;
  onViewAll?: (category?: string) => void;
}

/**
 * A shelf, not a carousel: the row scrolls sideways on a snap, and the head
 * carries only the name of the shelf and one way forward.
 */
export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  title,
  subtitle,
  kicker,
  products,
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  onClearRail,
  viewAllCategory,
  onViewAll,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.round(track.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="showcase showcase-rail" aria-labelledby={`rail-${title.replace(/\s+/g, "-")}`}>
      <header className="showcase-head">
        <div className="showcase-head-copy">
          {kicker && <span className="showcase-kicker">{kicker}</span>}
          <h2 className="showcase-title" id={`rail-${title.replace(/\s+/g, "-")}`}>
            {title}
          </h2>
          {subtitle && <p className="showcase-lede">{subtitle}</p>}
        </div>

        <div className="showcase-aside">
          {onClearRail && (
            <button type="button" className="showcase-link is-quiet" onClick={onClearRail}>
              Clear history
            </button>
          )}
          {onViewAll && (
            <button
              type="button"
              className="showcase-link"
              onClick={() => onViewAll(viewAllCategory)}
            >
              See everything
            </button>
          )}
          <div className="rail-nav">
            <button
              type="button"
              className="rail-nav-btn"
              onClick={() => scroll(-1)}
              aria-label={`Scroll ${title} back`}
            >
              ←
            </button>
            <button
              type="button"
              className="rail-nav-btn"
              onClick={() => scroll(1)}
              aria-label={`Scroll ${title} forward`}
            >
              →
            </button>
          </div>
        </div>
      </header>

      <div className="rail-track" ref={trackRef}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            formatPrice={formatPrice}
            isFavorited={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            onOpenLightbox={onOpenLightbox}
            onAddToCart={onAddToCart}
            compact
          />
        ))}
      </div>
    </section>
  );
};
