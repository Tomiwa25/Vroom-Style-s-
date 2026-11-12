import React, { useState } from "react";
import type { Product } from "../types";
import { fridgesProducts, microwavesProducts, kitchenUtensilsProducts } from "../data/products";
import { ProductCard } from "./ProductCard";

interface HomeAppliancesSectionProps {
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenPromptStudio?: (category: string) => void;
}

export const HomeAppliancesSection: React.FC<HomeAppliancesSectionProps> = ({
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onSelectCategory,
  onOpenPromptStudio,
}) => {
  const [activeTab, setActiveTab] = useState<"Fridges" | "Microwaves" | "Kitchen Utensils">("Fridges");

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
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-tag">{tab.tag}</span>
          </button>
        ))}
      </div>

      {/* Grid of 30 products for the active department tab */}
      <div className="dept-products-grid">
        {activeProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            formatPrice={formatPrice}
            isFavorited={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};
