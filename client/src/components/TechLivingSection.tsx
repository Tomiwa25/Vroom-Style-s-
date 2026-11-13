import React, { useState } from "react";
import type { Product } from "../types";
import { furnitureProducts, tvsProducts, laptopsProducts, monitorsProducts } from "../data/products";
import { ProductCard } from "./ProductCard";

interface TechLivingSectionProps {
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenPromptStudio?: (category: string) => void;
}

type Tab = "TVs" | "Laptops" | "Monitors" | "Furniture";

const TABS: { id: Tab; note: string }[] = [
  { id: "TVs", note: "OLED & QLED" },
  { id: "Laptops", note: "M-series & RTX" },
  { id: "Monitors", note: "5K, 240Hz" },
  { id: "Furniture", note: "Nordic & Italian" },
];

const ITEMS_PER_PAGE = 6;

export const TechLivingSection: React.FC<TechLivingSectionProps> = ({
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  onSelectCategory,
  onOpenPromptStudio,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("TVs");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const collections: Record<Tab, Product[]> = {
    TVs: tvsProducts,
    Laptops: laptopsProducts,
    Monitors: monitorsProducts,
    Furniture: furnitureProducts,
  };

  const activeProducts = collections[activeTab];
  const totalPages = Math.ceil(activeProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = activeProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section
      className="showcase showcase-department tech-living-section"
      id="tech-living-showcase-section"
      aria-labelledby="tech-title"
    >
      <header className="showcase-head">
        <div className="showcase-head-copy">
          <span className="showcase-kicker">
            Screens, computing & living ·{" "}
            {tvsProducts.length + laptopsProducts.length + monitorsProducts.length + furnitureProducts.length} pieces
          </span>
          <h2 className="showcase-title" id="tech-title">
            The rooms you spend the evening in
          </h2>
          <p className="showcase-lede">
            Displays, machines and furniture picked for how they sit in a room rather
            than how they read on a specification sheet.
          </p>
        </div>

        <div className="showcase-aside">
          {onOpenPromptStudio && (
            <button
              type="button"
              className="showcase-link is-quiet"
              onClick={() => onOpenPromptStudio(activeTab)}
            >
              Photography prompts
            </button>
          )}
          <button type="button" className="showcase-link" onClick={() => onSelectCategory(activeTab)}>
            {activeTab} in the catalog
          </button>
        </div>
      </header>

      <div className="tab-row" role="tablist" aria-label="Living and technology collections">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab-item ${isActive ? "is-active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="tab-name">{tab.id}</span>
              <span className="tab-note">
                {tab.note} · {collections[tab.id].length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="plate-grid">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            formatPrice={formatPrice}
            isFavorited={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            onOpenLightbox={onOpenLightbox}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {activeProducts.length > ITEMS_PER_PAGE && (
        <div className="pager">
          <p className="pager-count">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, activeProducts.length)} of {activeProducts.length}{" "}
            in {activeTab.toLowerCase()}
          </p>

          <div className="pager-controls">
            <button
              type="button"
              className="pager-step"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Back
            </button>

            <div className="pager-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`pager-number ${currentPage === pageNum ? "is-active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pager-step"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
