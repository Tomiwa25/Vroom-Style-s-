import React, { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

interface CategoryMegaMenuProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSearchQuery?: (query: string) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  /** When false, only the panel renders (trigger lives outside, e.g. header). */
  showTrigger?: boolean;
  onOpenBecomeSeller?: () => void;
}

interface MegaColumn {
  no: string;
  title: string;
  categoryKey: string;
  items: { label: string; query?: string }[];
}

const MEGA_DEPARTMENTS: MegaColumn[] = [
  {
    no: "01",
    title: "Tailoring",
    categoryKey: "Women",
    items: [
      { label: "Coats & Blazers", query: "blazer" },
      { label: "Dresses", query: "dress" },
      { label: "Trousers", query: "trouser" },
      { label: "Shirts", query: "shirt" },
    ],
  },
  {
    no: "02",
    title: "Outerwear",
    categoryKey: "Outerwear",
    items: [
      { label: "Overshirts", query: "overshirt" },
      { label: "Trench Coats", query: "trench" },
      { label: "Field Jackets", query: "field" },
    ],
  },
  {
    no: "03",
    title: "Knitwear",
    categoryKey: "Knitwear",
    items: [
      { label: "Cashmere", query: "cashmere" },
      { label: "Merino", query: "merino" },
      { label: "Polo Collars", query: "polo" },
    ],
  },
  {
    no: "04",
    title: "Accessories",
    categoryKey: "Accessories",
    items: [
      { label: "Leather Goods", query: "leather" },
      { label: "Belts", query: "belt" },
      { label: "Silk", query: "silk" },
    ],
  },
  {
    no: "05",
    title: "Footwear",
    categoryKey: "Footwear",
    items: [
      { label: "Loafers", query: "loafer" },
      { label: "Boots", query: "boot" },
      { label: "Derbies", query: "derby" },
    ],
  },
  {
    no: "06",
    title: "Living",
    categoryKey: "Appliances",
    items: [
      { label: "Kitchen", query: "kitchen" },
      { label: "Cooling", query: "fridge" },
      { label: "Textiles", query: "linen" },
    ],
  },
];

/**
 * Departments panel. One column per floor, thin rules, no ornament:
 * a printed store index rather than a navigation widget.
 */
export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  selectedCategory,
  onSelectCategory,
  onSearchQuery,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  showTrigger = true,
  onOpenBecomeSeller,
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

  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubItemClick = (categoryKey: string, query?: string) => {
    onSelectCategory(categoryKey);
    if (query && onSearchQuery) {
      onSearchQuery(query);
    }
    setMegaOpen(false);
    scrollToCatalog();
  };

  return (
    <div className="index-panel-anchor" ref={containerRef}>
      {showTrigger && (
        <button
          type="button"
          className={`all-categories-btn ${isMegaOpen ? "active" : ""}`}
          onClick={() => setMegaOpen(!isMegaOpen)}
          aria-expanded={isMegaOpen}
          aria-controls="mega-menu-panel"
          aria-label="Open Full Mega Menu Catalog"
        >
          <span className="hamburger-icon" aria-hidden="true">☰</span>
          <span className="all-cat-label">All Categories</span>
          <span className="all-cat-chevron" aria-hidden="true">▾</span>
        </button>
      )}
      {isMegaOpen && (
        <div
          id="mega-menu-panel"
          className="index-panel"
          role="region"
          aria-label="Departments index"
        >
          <div className="index-panel-head">
            <span className="kicker">Index</span>
            <button
              type="button"
              className="index-panel-close"
              onClick={() => setMegaOpen(false)}
              aria-label="Close index"
            >
              Close
            </button>
          </div>

          <div className="index-panel-grid">
            {MEGA_DEPARTMENTS.map((dept) => {
              const isCurrent =
                selectedCategory.toLowerCase() === dept.categoryKey.toLowerCase();
              return (
                <div
                  key={dept.no}
                  className={`index-column ${isCurrent ? "is-current" : ""}`}
                >
                  <div className="index-column-head">
                    <span className="index-no">{dept.no}</span>
                    <button
                      type="button"
                      className="index-column-title"
                      onClick={() => handleSubItemClick(dept.categoryKey)}
                    >
                      {dept.title}
                    </button>
                  </div>
                  <ul className="index-list">
                    {dept.items.map((item) => (
                      <li key={item.label}>
                        <button
                          type="button"
                          className="index-item"
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

          {onOpenBecomeSeller && (
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line, #E6DFD5)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Independent designer or bespoke Nigerian atelier?</span>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--brand-tan, #C59B6D)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                onClick={() => {
                  setMegaOpen(false);
                  onOpenBecomeSeller();
                }}
              >
                Become a Verified Seller (0% Fee) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
