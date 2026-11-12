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
  const [activeTab, setActiveTab] = useState<"Furniture" | "TVs" | "Laptops" | "Monitors">("TVs");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const handleTabChange = (tab: "Furniture" | "TVs" | "Laptops" | "Monitors") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getActiveProducts = (): Product[] => {
    switch (activeTab) {
      case "Furniture":
        return furnitureProducts;
      case "TVs":
        return tvsProducts;
      case "Laptops":
        return laptopsProducts;
      case "Monitors":
        return monitorsProducts;
      default:
        return tvsProducts;
    }
  };

  const activeProducts = getActiveProducts();

  return (
    <section className="department-showcase-section tech-living-section" id="tech-living-showcase-section" aria-label="Electronics & Furniture Department">
      <div className="department-header">
        <div className="dept-title-group">
          <div className="dept-badge tech-badge">
            <span className="badge-icon">💻</span>
            <span>ENTERTAINMENT, COMPUTING & LUXURY LIVING</span>
            <span className="count-pill">120 Total Items</span>
          </div>
          <h2 className="dept-main-title">Cinematic Displays, High-Performance Computing & Interior Living</h2>
          <p className="dept-subtitle">
            Next-generation 4K/8K OLED televisions, M3 MacBooks, high-refresh studio gaming monitors, and architectural Scandinavian furniture.
          </p>
        </div>

        <div className="dept-header-actions">
          {onOpenPromptStudio && (
            <button
              type="button"
              className="dept-prompt-btn"
              onClick={() => onOpenPromptStudio(activeTab)}
            >
              <span className="btn-icon">🎨</span>
              <span>View {activeTab} Prompts</span>
            </button>
          )}

          <button
            type="button"
            className="dept-catalog-btn"
            onClick={() => onSelectCategory(activeTab)}
          >
            <span>Open {activeTab} in Catalog</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="dept-tabs-nav">
        {[
          { id: "TVs" as const, label: "📺 Smart TVs & Cinema (30 items)", tag: "OLED & QLED" },
          { id: "Laptops" as const, label: "💻 Laptops & Ultrabooks (30 items)", tag: "M3 & RTX 4090" },
          { id: "Monitors" as const, label: "🖥️ Studio Displays & Monitors (30 items)", tag: "5K & 240Hz OLED" },
          { id: "Furniture" as const, label: "🛋️ Designer Furniture (30 items)", tag: "Nordic & Italian" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dept-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-tag">{tab.tag}</span>
          </button>
        ))}
      </div>

      {/* Grid of paginated products for the active tab */}
      {(() => {
        const totalPages = Math.ceil(activeProducts.length / itemsPerPage);
        const displayedProducts = activeProducts.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

        return (
          <>
            <div className="dept-products-grid">
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

            {/* Pagination Controls */}
            {activeProducts.length > itemsPerPage && (
              <div className="showroom-pagination-bar dept-pagination-bar">
                <span className="pagination-count-summary">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, activeProducts.length)} of {activeProducts.length} items in {activeTab}
                </span>

                <div className="pagination-actions-wrap">
                  <button
                    type="button"
                    className="pagination-arrow-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ‹ Previous
                  </button>

                  <div className="pagination-numbers-row">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`pagination-number-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-arrow-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </section>
  );
};
