import React, { useState, useRef } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface BrandPortalSectionProps {
  products: Product[];
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
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

/**
 * Dedicated Brand Portal Showcase Section.
 * Inspired by official e-commerce brand store pages (e.g. Samsung/Apple/SteamOne official flagship carousels).
 */
export const BrandPortalSection: React.FC<BrandPortalSectionProps> = ({
  products,
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onExploreBrandCatalog,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("steamone");
  const trackRef = useRef<HTMLDivElement>(null);

  const activeProfile = BRAND_PROFILES.find((b) => b.id === selectedBrandId) || BRAND_PROFILES[0];

  // Filter products matching current brand
  const brandProducts = products.filter((p) => {
    const pBrand = (p.brand || "").toLowerCase();
    const query = activeProfile.brandQuery.toLowerCase();
    return pBrand.includes(query) || (p.tag && p.tag.toLowerCase().includes(query));
  });

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const offset = direction === "left" ? -340 : 340;
      trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="brand-portal-section" aria-label="Official Brand Stores">
      <div className="brand-portal-container">
        {/* Brand Switcher Tabs */}
        <div className="brand-portal-tabs-nav">
          <div className="brand-tabs-header">
            <span className="brand-tabs-kicker">AUTHORIZED FLAGSHIPS</span>
            <h3 className="brand-tabs-heading">Official Brand Stores</h3>
          </div>

          <div className="brand-tabs-list">
            {BRAND_PROFILES.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={`brand-pill-tab ${selectedBrandId === brand.id ? "active" : ""}`}
                onClick={() => setSelectedBrandId(brand.id)}
              >
                <span className="brand-pill-icon">{brand.icon}</span>
                <span className="brand-pill-label">{brand.shortTag}</span>
                {selectedBrandId === brand.id && (
                  <span className="brand-pill-verified">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Spotlight Banner Header */}
        <div className="brand-spotlight-banner">
          <div className="brand-spotlight-left">
            <div className="brand-verified-row">
              <span className="brand-badge-official">{activeProfile.badge}</span>
              <span className="brand-verified-bullet">• {activeProfile.warranty}</span>
            </div>
            <h4 className="brand-spotlight-title">{activeProfile.name}</h4>
            <p className="brand-spotlight-tagline">{activeProfile.tagline}</p>
            <p className="brand-spotlight-desc">{activeProfile.description}</p>
          </div>

          <div className="brand-spotlight-actions">
            {onExploreBrandCatalog && (
              <button
                type="button"
                className="brand-explore-catalog-btn"
                onClick={() => onExploreBrandCatalog(activeProfile.brandQuery)}
              >
                View Full {activeProfile.shortTag} Collection →
              </button>
            )}
            <div className="brand-scroll-arrows">
              <button
                type="button"
                className="rail-nav-btn prev"
                onClick={() => scroll("left")}
                aria-label="Scroll brand items left"
              >
                ‹
              </button>
              <button
                type="button"
                className="rail-nav-btn next"
                onClick={() => scroll("right")}
                aria-label="Scroll brand items right"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Brand Products Carousel Track */}
        <div className="brand-products-carousel-track" ref={trackRef}>
          {brandProducts.map((product) => (
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
      </div>
    </section>
  );
};

