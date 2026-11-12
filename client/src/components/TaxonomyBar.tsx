import React from "react";

interface TaxonomyItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  isOfficial?: boolean;
}

interface TaxonomyBarProps {
  selectedTaxonomy: string;
  onSelectTaxonomy: (taxonomy: string) => void;
  onOpenMegaMenu: () => void;
  isMegaMenuOpen?: boolean;
  onOpenVroomDelivery?: () => void;
  onOpenPromptStudio?: () => void;
}

const TAXONOMY_LINKS: TaxonomyItem[] = [
  { id: "Cars", label: "Cars & Motors", icon: "🚗", badge: "30 CARS", isOfficial: true },
  { id: "Fridges", label: "Fridges", icon: "🧊", badge: "30 ITEMS" },
  { id: "Microwaves", label: "Microwaves", icon: "📻" },
  { id: "Kitchen Utensils", label: "Kitchen Utensils", icon: "🍳" },
  { id: "Furniture", label: "Furniture", icon: "🛋️" },
  { id: "TVs", label: "Smart TVs", icon: "📺", badge: "4K/8K" },
  { id: "Laptops", label: "Laptops", icon: "💻", badge: "M3/RTX" },
  { id: "Monitors", label: "Monitors", icon: "🖥️" },
  { id: "Appliances", label: "All Appliances", icon: "⚡" },
  { id: "Official Store", label: "Official Store", icon: "👑", badge: "VERIFIED", isOfficial: true },
  { id: "Fashion & Atelier", label: "Fashion & Atelier", icon: "👗" },
  { id: "Accessories", label: "Accessories", icon: "👜" },
];

export const TaxonomyBar: React.FC<TaxonomyBarProps> = ({
  selectedTaxonomy,
  onSelectTaxonomy,
  onOpenMegaMenu,
  isMegaMenuOpen = false,
  onOpenVroomDelivery,
  onOpenPromptStudio,
}) => {
  const handleItemClick = (taxonomyId: string) => {
    onSelectTaxonomy(taxonomyId);
    const catalogEl = document.getElementById("catalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="taxonomy-bar" aria-label="Departmental Taxonomy Navigation">
      <div className="taxonomy-bar-wrap">
        {/* All Categories Mega Menu Toggle */}
        <button
          type="button"
          className={`all-categories-btn ${isMegaMenuOpen ? "active" : ""}`}
          onClick={onOpenMegaMenu}
          aria-expanded={isMegaMenuOpen}
          aria-label="Open Full Mega Menu Catalog"
        >
          <span className="hamburger-icon">☰</span>
          <span className="all-cat-label">All Categories</span>
          <span className="all-cat-chevron">▾</span>
        </button>

        {/* Horizontal Quick Links Container */}
        <div className="taxonomy-links-strip">
          {/* "All Products" reset tab */}
          <button
            type="button"
            className={`taxonomy-pill ${selectedTaxonomy === "All" ? "active" : ""}`}
            onClick={() => handleItemClick("All")}
          >
            <span>All Products</span>
          </button>

          {TAXONOMY_LINKS.map((item) => {
            const isActive = selectedTaxonomy.toLowerCase() === item.id.toLowerCase();
            return (
              <button
                key={item.id}
                type="button"
                className={`taxonomy-pill ${isActive ? "active" : ""} ${item.isOfficial ? "official-pill" : ""}`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.icon && <span className="pill-icon">{item.icon}</span>}
                <span className="pill-label">{item.label}</span>
                {item.badge && (
                  <span className={`pill-badge ${item.badge.toLowerCase()}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onOpenPromptStudio && (
            <button
              type="button"
              className="taxonomy-delivery-shortcut-btn"
              style={{ borderColor: "#805AD5", color: "#B794F4", background: "rgba(128, 90, 213, 0.15)" }}
              onClick={onOpenPromptStudio}
              title="AI Image Prompt Studio (240 Prompts across all sections)"
            >
              <span className="shortcut-icon">🎨</span>
              <span className="shortcut-label">AI Prompts</span>
              <span className="shortcut-badge" style={{ background: "#6B46C1", color: "#FFFFFF" }}>240 PROMPTS</span>
            </button>
          )}

          {onOpenVroomDelivery && (
            <button
              type="button"
              className="taxonomy-delivery-shortcut-btn"
              onClick={onOpenVroomDelivery}
              title="Vroom Delivery Parcel Shipping & Tracking Hub"
            >
              <span className="shortcut-icon">🚚</span>
              <span className="shortcut-label">Vroom Delivery</span>
              <span className="shortcut-badge">Micro-Service</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
