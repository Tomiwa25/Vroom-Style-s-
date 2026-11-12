import React, { useState } from "react";
import type { Product } from "../types";
import { fridgesProducts, microwavesProducts, kitchenUtensilsProducts } from "../data/products";
import { ProductCard } from "./ProductCard";

interface HomeAppliancesSectionProps {
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenPromptStudio?: (category: string) => void;
}

export const HomeAppliancesSection: React.FC<HomeAppliancesSectionProps> = ({
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  onSelectCategory,
  onOpenPromptStudio,
}) => {
  const [activeTab, setActiveTab] = useState<"Fridges" | "Microwaves" | "Kitchen Utensils">("Fridges");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const handleTabChange = (tab: "Fridges" | "Microwaves" | "Kitchen Utensils") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getActiveProducts = (): Product[] => {
    switch (activeTab) {
      case "Fridges":
        return fridgesProducts;
      case "Microwaves":
        return microwavesProducts;
      case "Kitchen Utensils":
        return kitchenUtensilsProducts;
      default:
        return fridgesProducts;
    }
  };

  const activeProducts = getActiveProducts();

  return (
    <section className="department-showcase-section" id="appliances-showcase-section" aria-label="Home Appliances Department">
      <div className="department-header">
        <div className="dept-title-group">
          <div className="dept-badge">
            <span className="badge-icon">⚡</span>
            <span>MAJOR HOME APPLIANCES & CULINARY HUB</span>
            <span className="count-pill">90 Total Items</span>
          </div>
          <h2 className="dept-main-title">Modern Kitchen & Home Appliance Living</h2>
          <p className="dept-subtitle">
            German, Japanese, and American certified energy-efficient cooling, smart inverter heating, and professional chef cookware with nationwide delivery.
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
          { id: "Fridges" as const, label: "🧊 Refrigerators & Freezers (30 items)", tag: "Inverter Cooling" },
          { id: "Microwaves" as const, label: "📻 Microwaves & Ovens (30 items)", tag: "Smart Heating" },
          { id: "Kitchen Utensils" as const, label: "🍳 Cookware & Utensils (30 items)", tag: "Culinary Craft" },
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

      {/* Grid of paginated products for the active department tab */}
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
