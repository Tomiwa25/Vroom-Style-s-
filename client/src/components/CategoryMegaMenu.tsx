import React, { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

interface CategoryMegaMenuProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSearchQuery?: (query: string) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface MegaColumn {
  title: string;
  categoryKey: string;
  items: { label: string; query?: string }[];
}

const MEGA_DEPARTMENTS: MegaColumn[] = [
  {
    title: "Official Store Drops",
    categoryKey: "Official Store",
    items: [
      { label: "Atelier Signature Suiting", query: "Blazer" },
      { label: "Limited Edition Overcoats", query: "Overcoat" },
      { label: "Monogrammed Accessories", query: "Tote" },
      { label: "View All Official Drops" },
    ],
  },
  {
    title: "Fashion & Atelier",
    categoryKey: "Fashion & Atelier",
    items: [
      { label: "Silk Midi Dresses", query: "Silk Midi Dress" },
      { label: "Pleated Trousers", query: "Pants" },
      { label: "French Linen Shirts", query: "Linen" },
      { label: "View All Fashion" },
    ],
  },
  {
    title: "Appliances & Care",
    categoryKey: "Appliances",
    items: [
      { label: "Precision Garment Steamers", query: "Steamer" },
      { label: "Sonic Fabric Debobblers", query: "Care" },
      { label: "Artisan Coffee Makers", query: "Coffee" },
      { label: "View All Appliances" },
    ],
  },
  {
    title: "Phones & Tablets",
    categoryKey: "Phones & Tablets",
    items: [
      { label: "MagSafe Calfskin Folios", query: "MagSafe" },
      { label: "Wireless Valet Stations", query: "Charging" },
      { label: "Designer Tech Sleeves", query: "Tech" },
      { label: "View All Tech Essentials" },
    ],
  },
  {
    title: "Health & Beauty",
    categoryKey: "Health & Beauty",
    items: [
      { label: "Santal Extrait de Parfum", query: "Santal" },
      { label: "Botanical Squalane Elixir", query: "Elixir" },
      { label: "Rose Quartz Face Sculptors", query: "Beauty" },
      { label: "View All Clean Beauty" },
    ],
  },
  {
    title: "Outerwear & Knitwear",
    categoryKey: "Outerwear",
    items: [
      { label: "Cashmere Overcoats", query: "Coat" },
      { label: "Ribbed Crewnecks", query: "Knit" },
      { label: "Architectural Trenches", query: "Trench" },
      { label: "View All Outerwear" },
    ],
  },
];

/**
 * High-contrast Category Navigation Bar & Multi-Column Mega Menu.
 * Features keyboard & click-outside dismissal, departmental grouping,
 * quick category tabs, and an Atelier spotlight showcase.
 */
export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  selectedCategory,
  onSelectCategory,
  onSearchQuery,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isMegaOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setMegaOpen = (open: boolean) => {
    if (controlledOnToggle) {
      controlledOnToggle(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setMegaOpen(false), isMegaOpen);

  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    setMegaOpen(false);
    scrollToCatalog();
  };

  const handleSubItemClick = (categoryKey: string, query?: string) => {
    onSelectCategory(categoryKey);
    if (query && onSearchQuery) {
      onSearchQuery(query);
    }
    setMegaOpen(false);
    scrollToCatalog();
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mega-menu-drawer-wrapper" ref={containerRef}>
      {/* Floating Mega-Menu Popover Panel */}
      {isMegaOpen && (
        <div
          id="mega-menu-panel"
          className="mega-menu-panel"
          role="region"
          aria-label="Atelier Departments Mega Menu"
        >
          <div className="mega-menu-inner">
            {/* Multi-Column Grid */}
            <div className="mega-columns-grid">
              {MEGA_DEPARTMENTS.map((dept) => {
                const isCurrent = selectedCategory.toLowerCase() === dept.categoryKey.toLowerCase();
                return (
                  <div
                    key={dept.title}
                    className={`mega-column ${isCurrent ? "active-department" : ""}`}
                  >
                    <h3
                      className="mega-column-title"
                      onClick={() => handleCategoryClick(dept.categoryKey)}
                      tabIndex={0}
                      role="button"
                    >
                      <span>{dept.title}</span>
                      <span className="column-title-arrow">→</span>
                    </h3>
                    <ul className="mega-column-list">
                      {dept.items.map((item) => (
                        <li key={item.label}>
                          <button
                            type="button"
                            className="mega-item-link"
                            onClick={() => handleSubItemClick(dept.categoryKey, item.query)}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Atelier Spotlight Card */}
            <div className="mega-spotlight-card">
              <div className="spotlight-badge">👑 OFFICIAL ATELIER</div>
              <h4>Vroom Style(s) Master Lookbook</h4>
              <p>
                Handcrafted garments, Italian bridle leathers, and curated lifestyle essentials
                shipped across Nigeria within 24–48 hours.
              </p>
              <button
                type="button"
                className="spotlight-cta-btn"
                onClick={() => handleCategoryClick("Official Store")}
              >
                Explore Official Store →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
