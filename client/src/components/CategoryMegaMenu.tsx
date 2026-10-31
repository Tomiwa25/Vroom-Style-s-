import React, { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";

interface CategoryMegaMenuProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSearchQuery?: (query: string) => void;
}

interface MegaColumn {
  title: string;
  categoryKey: string;
  items: { label: string; query?: string }[];
}

const MEGA_DEPARTMENTS: MegaColumn[] = [
  {
    title: "Women's Atelier",
    categoryKey: "Women",
    items: [
      { label: "Silk Midi Dresses", query: "Silk Midi Dress" },
      { label: "Evening Silhouettes", query: "Dress" },
      { label: "Minimalist Blouses", query: "Blouse" },
      { label: "Tailored Trousers", query: "Pants" },
      { label: "View All Women's Collection" },
    ],
  },
  {
    title: "Outerwear & Tailoring",
    categoryKey: "Outerwear",
    items: [
      { label: "Architectural Trenches", query: "Trench" },
      { label: "Cashmere Overcoats", query: "Coat" },
      { label: "Leather Jackets", query: "Leather" },
      { label: "Structured Blazers", query: "Blazer" },
      { label: "View All Outerwear" },
    ],
  },
  {
    title: "Knitwear & Essentials",
    categoryKey: "Knitwear",
    items: [
      { label: "Chunky Rib Crewnecks", query: "Knit" },
      { label: "Merino Wool Sweaters", query: "Sweater" },
      { label: "Cashmere Cardigans", query: "Cardigan" },
      { label: "Fine Gauge Turtlenecks", query: "Turtleneck" },
      { label: "View All Knitwear" },
    ],
  },
  {
    title: "Leather & Accessories",
    categoryKey: "Accessories",
    items: [
      { label: "Calfskin Structured Totes", query: "Tote" },
      { label: "Italian Leather Belts", query: "Belt" },
      { label: "Mulberry Silk Scarves", query: "Scarf" },
      { label: "Minimalist Crossbody Bags", query: "Bag" },
      { label: "View All Accessories" },
    ],
  },
];

const QUICK_TABS = ["All", "Women", "Outerwear", "Knitwear", "Accessories"];

/**
 * High-contrast Category Navigation Bar & Multi-Column Mega Menu.
 * Features keyboard & click-outside dismissal, departmental grouping,
 * quick category tabs, and an Atelier spotlight showcase.
 */
export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  selectedCategory,
  onSelectCategory,
  onSearchQuery,
}) => {
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsMegaOpen(false), isMegaOpen);

  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    setIsMegaOpen(false);
    scrollToCatalog();
  };

  const handleSubItemClick = (categoryKey: string, query?: string) => {
    onSelectCategory(categoryKey);
    if (query && onSearchQuery) {
      onSearchQuery(query);
    }
    setIsMegaOpen(false);
    scrollToCatalog();
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="category-megamenu-nav" ref={containerRef} aria-label="Category Navigation">
      <div className="category-nav-container">
        {/* All Departments Button (Triggers the Mega-Menu) */}
        <button
          type="button"
          id="mega-menu-trigger"
          className={`mega-trigger-btn ${isMegaOpen ? "active" : ""}`}
          onClick={() => setIsMegaOpen((prev) => !prev)}
          aria-expanded={isMegaOpen}
          aria-haspopup="true"
        >
          <span className="hamburger-icon">☰</span>
          <span className="mega-trigger-text">All Departments</span>
          <span className={`chevron-indicator ${isMegaOpen ? "rotate" : ""}`}>▾</span>
        </button>

        {/* Quick Horizontal Category Links */}
        <div className="quick-category-tabs">
          {QUICK_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab-link ${selectedCategory === cat ? "selected" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat === "All" ? "Full Catalog" : cat}
            </button>
          ))}
        </div>

        {/* Right-side Badge / Store Feature */}
        <div className="nav-feature-pill">
          <span className="pulse-dot" />
          <span>Atelier Direct • Verified Luxury</span>
        </div>
      </div>

      {/* Expanded Multi-Column Mega-Menu Drawer */}
      {isMegaOpen && (
        <div
          className="mega-menu-dropdown-panel"
          role="region"
          aria-labelledby="mega-menu-trigger"
        >
          <div className="mega-menu-content-grid">
            {/* 4 Categorized Department Columns */}
            {MEGA_DEPARTMENTS.map((dept) => (
              <div key={dept.title} className="mega-column">
                <button
                  type="button"
                  className="mega-column-header-btn"
                  onClick={() => handleCategoryClick(dept.categoryKey)}
                >
                  <span className="column-title">{dept.title}</span>
                  <span className="column-arrow">→</span>
                </button>
                <ul className="mega-items-list">
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
            ))}

            {/* Column 5: Atelier Featured Spotlight */}
            <div className="mega-spotlight-card">
              <div className="spotlight-tag">CURATED ATELIER</div>
              <div className="spotlight-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
                  alt="Featured Luxury Atelier Drop"
                  className="spotlight-img"
                  loading="lazy"
                />
                <div className="spotlight-gradient-overlay" />
              </div>
              <div className="spotlight-body">
                <h4 className="spotlight-heading">Mulberry Silk Series</h4>
                <p className="spotlight-desc">
                  Tailored minimalist elegance for effortless day-to-evening transitions.
                </p>
                <button
                  type="button"
                  className="spotlight-cta-btn"
                  onClick={() => handleCategoryClick("Women")}
                >
                  <span>Explore Series</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
