import React, { useState } from "react";
import type { Product } from "../types";

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
 * Product card. Photograph first; three lines of type under it. The second
 * photograph arrives on hover as a slow wipe, which is the only motion the
 * grid allows. Everything else — badges, ratings, stock meters, variant
 * pills, seller strips — lives in Quick Look, where there is room to read it.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  formatPrice,
  isFavorited = false,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [errorImageId, setErrorImageId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const hasImgError = errorImageId === product.id;
  const gallery =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const primary = hasImgError ? FALLBACK_IMAGE : gallery[0] || product.image || FALLBACK_IMAGE;
  const secondary = hasImgError
    ? FALLBACK_IMAGE
    : gallery[1] || gallery[0] || product.image || FALLBACK_IMAGE;
  const hasSecondLook = secondary !== primary;

  const selectedSize = product.sizes?.[0] ?? "Standard";
  const selectedColor = product.colors?.[0]?.name ?? "Default";
  const sizeCount = product.sizes?.length ?? 0;

  const saved = formatPrice(product.price);
  const was = product.originalPrice && product.originalPrice > product.price
    ? formatPrice(product.originalPrice)
    : null;
  const soldOut = product.stock <= 0;

  const open = () => onQuickView?.(product);

  const add = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product, selectedSize, selectedColor);
  };

  return (
    <article
      className={`product-card ${soldOut ? "is-sold-out" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="product-card-media"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name}`}
      >
        <img
          className="product-card-photo is-primary"
          src={primary}
          alt={product.name}
          loading="lazy"
          onError={() => setErrorImageId(product.id)}
        />
        {hasSecondLook && (
          <img
            className={`product-card-photo is-secondary ${isHovered ? "is-shown" : ""}`}
            src={secondary}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setErrorImageId(product.id)}
          />
        )}

        {soldOut && <span className="product-card-flag">Sold out</span>}

        {onToggleWishlist && (
          <button
            type="button"
            className={`product-card-save ${isFavorited ? "is-saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isFavorited ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          >
            {isFavorited ? "Saved" : "Save"}
          </button>
        )}
      </div>

      <div className="product-card-body">
        <button type="button" className="product-card-name" onClick={open}>
          {product.name}
        </button>

        <span className="product-card-facts">
          {product.brand || product.category}
          {sizeCount > 1 ? ` · ${sizeCount} sizes` : ""}
        </span>

        <span className="product-card-price">
          {saved}
          {was && <span className="product-card-was">{was}</span>}
        </span>

        {onAddToCart && !soldOut && (
          <button
            type="button"
            className="product-card-add"
            onClick={add}
            aria-label={`Add ${product.name} to bag`}
          >
            Add to bag
          </button>
        )}
      </div>
    </article>
  );
};
