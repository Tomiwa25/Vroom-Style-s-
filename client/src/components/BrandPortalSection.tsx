import React, { useState, useRef } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface BrandPortalSectionProps {
  products: Product[];
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onExploreBrandCatalog?: (brandName: string) => void;
}

interface BrandProfile {
  id: string;
  name: string;
  shortTag: string;
  icon: string;
  tagline: string;
  warranty: string;
  badge: string;
  description: string;
  brandQuery: string;
}

const BRAND_PROFILES: BrandProfile[] = [
  {
    id: "steamone",
    name: "SteamOne Paris",
    shortTag: "SteamOne",
    icon: "⚡",
    tagline: "Haute Garment Steaming & Luxury Fabric Restoration",
    warranty: "2-Year Manufacturer Warranty Included",
    badge: "OFFICIAL FLAGSHIP",
    description: "Engineered in Paris for cashmere, silk eveningwear, and bespoke suiting care.",
    brandQuery: "SteamOne",
  },
  {
    id: "courant",
    name: "Courant Studio",
    shortTag: "Courant",
    icon: "📱",
    tagline: "Architectural Wireless Valet Stations & Tech Accessories",
    warranty: "Qi2 Certified Fast-Charge Standard",
    badge: "OFFICIAL STORE",
    description: "Cast in aerospace-grade aluminum and wrapped in authentic Belgian linen.",
    brandQuery: "Courant",
  },
  {
    id: "atelier",
    name: "Vroom Atelier Official",
    shortTag: "Vroom Atelier",
    icon: "👑",
    tagline: "Master Lookbook: Pure Mulberry Silks & Biella Wool Tailoring",
    warranty: "100% Certified Authentic Fabrics",
    badge: "SIGNATURE ATELIER",
    description: "Limited drops handcrafted for confident, effortless contemporary elegance.",
    brandQuery: "Vroom Atelier",
  },
  {
    id: "parfums",
    name: "Vroom Parfumerie",
    shortTag: "Parfums",
    icon: "✨",
    tagline: "Extrait de Parfum & Botanical Skincare Formulations",
    warranty: "30% Pure Perfume Oil Concentration",
    badge: "CLEAN BEAUTY",
    description: "Niche unisex extraits and cold-pressed botanical squalane restorative oils.",
    brandQuery: "Vroom",
  },
];

/** Who is authorised to sell here, set as a reading list rather than a tab bar. */
const BADGE_AS_STATEMENT: Record<string, string> = {
  "OFFICIAL FLAGSHIP": "Flagship house",
  "OFFICIAL STORE": "Official store",
  "SIGNATURE ATELIER": "Signature atelier",
  "CLEAN BEAUTY": "Clean beauty house",
};

export const BrandPortalSection: React.FC<BrandPortalSectionProps> = ({
  products,
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  onExploreBrandCatalog,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("steamone");
  const trackRef = useRef<HTMLDivElement>(null);

  const activeProfile = BRAND_PROFILES.find((b) => b.id === selectedBrandId) || BRAND_PROFILES[0];

  const brandProducts = products.filter((p) => {
    const pBrand = (p.brand || "").toLowerCase();
    const query = activeProfile.brandQuery.toLowerCase();
    return pBrand.includes(query) || (p.tag && p.tag.toLowerCase().includes(query));
  });

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.round(track.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="showcase showcase-houses" aria-labelledby="houses-title">
      <header className="showcase-head">
        <div className="showcase-head-copy">
          <span className="showcase-kicker">Authorised sellers</span>
          <h2 className="showcase-title" id="houses-title">
            The houses we keep
          </h2>
          <p className="showcase-lede">
            Four labels, each one sold by its own studio. Warranty and authenticity are
            the house&apos;s, not ours.
          </p>
        </div>
      </header>

      <nav className="house-index" aria-label="Choose a house">
        {BRAND_PROFILES.map((brand) => {
          const isActive = selectedBrandId === brand.id;
          return (
            <button
              key={brand.id}
              type="button"
              className={`house-index-item ${isActive ? "is-active" : ""}`}
              onClick={() => setSelectedBrandId(brand.id)}
              aria-pressed={isActive}
            >
              <span className="house-index-name">{brand.shortTag}</span>
              <span className="house-index-note">
                {BADGE_AS_STATEMENT[brand.badge] ?? brand.badge.toLowerCase()}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="house-spotlight">
        <div className="house-spotlight-copy">
          <h3 className="house-name">{activeProfile.name}</h3>
          <p className="house-tagline">{activeProfile.tagline}</p>
          <p className="house-description">{activeProfile.description}</p>
          <p className="house-warranty">{activeProfile.warranty}</p>
        </div>

        <div className="house-spotlight-aside">
          {onExploreBrandCatalog && (
            <button
              type="button"
              className="showcase-link"
              onClick={() => onExploreBrandCatalog(activeProfile.brandQuery)}
            >
              All {activeProfile.shortTag}
            </button>
          )}
          <div className="rail-nav">
            <button
              type="button"
              className="rail-nav-btn"
              onClick={() => scroll(-1)}
              aria-label={`Scroll ${activeProfile.shortTag} back`}
            >
              ←
            </button>
            <button
              type="button"
              className="rail-nav-btn"
              onClick={() => scroll(1)}
              aria-label={`Scroll ${activeProfile.shortTag} forward`}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {brandProducts.length > 0 ? (
        <div className="rail-track" ref={trackRef}>
          {brandProducts.map((product) => (
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
      ) : (
        <p className="house-empty">
          This house has nothing on the floor today. Its next drop is listed under events.
        </p>
      )}
    </section>
  );
};
