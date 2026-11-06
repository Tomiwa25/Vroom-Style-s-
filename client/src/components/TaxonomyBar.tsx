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
}

const TAXONOMY_LINKS: TaxonomyItem[] = [
  { id: "Official Store", label: "Official Store", icon: "👑", badge: "VERIFIED", isOfficial: true },
  { id: "Appliances", label: "Appliances", icon: "⚡", badge: "HOT" },
  { id: "Phones & Tablets", label: "Phones & Tablets", icon: "📱" },
  { id: "Health & Beauty", label: "Health & Beauty", icon: "💄", badge: "NEW" },
  { id: "Fashion & Atelier", label: "Fashion & Atelier", icon: "👗" },
  { id: "Outerwear", label: "Outerwear", icon: "🧥" },
  { id: "Knitwear", label: "Knitwear", icon: "🧶" },
  { id: "Accessories", label: "Accessories", icon: "👜" },
];

export const TaxonomyBar: React.FC<TaxonomyBarProps> = ({
  selectedTaxonomy,
  onSelectTaxonomy,
  onOpenMegaMenu,
  isMegaMenuOpen = false,
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
        </div>
      </div>
    </nav>
  );
};
