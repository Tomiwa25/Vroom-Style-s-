import React from "react";

interface TaxonomyItem {
  id: string;
  label: string;
  badge?: string;
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
  { id: "Cars", label: "Cars & motors" },
  { id: "Fridges", label: "Fridges" },
  { id: "Microwaves", label: "Microwaves" },
  { id: "Kitchen Utensils", label: "Kitchen" },
  { id: "Furniture", label: "Furniture" },
  { id: "TVs", label: "Televisions" },
  { id: "Laptops", label: "Laptops" },
  { id: "Monitors", label: "Monitors" },
  { id: "Appliances", label: "Appliances" },
  { id: "Official Store", label: "Official store" },
  { id: "Fashion & Atelier", label: "Fashion" },
  { id: "Accessories", label: "Accessories" },
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
    <nav className="taxonomy-bar" aria-label="Departments">
      <div className="taxonomy-bar-wrap">
        <button
          type="button"
          className={`all-categories-btn ${isMegaMenuOpen ? "active" : ""}`}
          onClick={onOpenMegaMenu}
          aria-expanded={isMegaMenuOpen}
          aria-label="Open the full department menu"
        >
          <span>Every department</span>
          <span className="all-cat-chevron" aria-hidden="true">
            {isMegaMenuOpen ? "−" : "+"}
          </span>
        </button>

        <div className="taxonomy-links-strip">
          <button
            type="button"
            className={`taxonomy-pill ${selectedTaxonomy === "All" ? "active" : ""}`}
            onClick={() => handleItemClick("All")}
            aria-current={selectedTaxonomy === "All" ? "true" : undefined}
          >
            Everything
          </button>

          {TAXONOMY_LINKS.map((item) => {
            const isActive = selectedTaxonomy.toLowerCase() === item.id.toLowerCase();
            return (
              <button
                key={item.id}
                type="button"
                className={`taxonomy-pill ${isActive ? "active" : ""}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? "true" : undefined}
              >
                {item.label}
              </button>
            );
          })}

          {onOpenVroomDelivery && (
            <button
              type="button"
              className="taxonomy-delivery-shortcut-btn"
              onClick={onOpenVroomDelivery}
            >
              Delivery & tracking
            </button>
          )}

          {onOpenPromptStudio && (
            <button
              type="button"
              className="taxonomy-delivery-shortcut-btn"
              onClick={onOpenPromptStudio}
            >
              Image prompt studio
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
