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
    title: "🚗 Vroom Motors Showroom",
    categoryKey: "Cars",
    items: [
      { label: "Porsche 911 & Exotic Supercars", query: "Porsche" },
      { label: "Mercedes-AMG & G-Wagon", query: "Mercedes" },
      { label: "BMW M Series & Luxury Sedans", query: "BMW" },
      { label: "Range Rover & 4x4 SUVs", query: "Range Rover" },
      { label: "Tesla & Electric Hyper-Saloons", query: "Tesla" },
      { label: "View All 30 Showroom Cars" },
    ],
  },
  {
    title: "🧊 Fridges & Cooling",
    categoryKey: "Fridges",
    items: [
      { label: "Samsung & LG French Door Smart Fridges", query: "French Door" },
      { label: "Smeg Retro 50s Pastel Fridges", query: "Smeg" },
      { label: "Side-by-Side Inverter Refrigerator", query: "Side-by-Side" },
      { label: "Commercial Deep Chest Freezers", query: "Freezer" },
      { label: "View All 30 Fridges & Freezers" },
    ],
  },
  {
    title: "📻 Microwaves & Ovens",
    categoryKey: "Microwaves",
    items: [
      { label: "Panasonic Genius Inverter Microwaves", query: "Inverter" },
      { label: "Breville & Samsung Smart Sensors", query: "Breville" },
      { label: "Convection Air Fryer Combos", query: "Convection" },
      { label: "Built-In Undercounter Drawers", query: "Drawer" },
      { label: "View All 30 Microwaves" },
    ],
  },
  {
    title: "🍳 Kitchenware & Utensils",
    categoryKey: "Kitchen Utensils",
    items: [
      { label: "Le Creuset Enameled Dutch Ovens", query: "Creuset" },
      { label: "Wüsthof & Shun Japanese Knife Sets", query: "Knife" },
      { label: "All-Clad & Caraway Cookware Sets", query: "Cookware" },
      { label: "Boos Block End-Grain Cutting Boards", query: "Board" },
      { label: "View All 30 Kitchen Essentials" },
    ],
  },
  {
    title: "🛋️ Designer Living & Furniture",
    categoryKey: "Furniture",
    items: [
      { label: "Eames Lounge & Barcelona Chairs", query: "Chair" },
      { label: "Solid White Oak & Marble Dining Tables", query: "Table" },
      { label: "Velvet & Bouclé Modular Sofas", query: "Sofa" },
      { label: "Herman Miller & Steelcase Task Chairs", query: "Ergonomic" },
      { label: "View All 30 Furniture Pieces" },
    ],
  },
  {
    title: "📺 Cinematic 4K/8K TVs",
    categoryKey: "TVs",
    items: [
      { label: "LG OLED evo & Gallery Edition", query: "OLED" },
      { label: "Sony BRAVIA XR QD-OLED Displays", query: "Sony" },
      { label: "Samsung Neo QLED 8K & The Frame", query: "Samsung" },
      { label: "75\" - 100\" Giant Home Cinema Screens", query: "Giant" },
      { label: "View All 30 Smart TVs" },
    ],
  },
  {
    title: "💻 Laptops & Workstations",
    categoryKey: "Laptops",
    items: [
      { label: "Apple MacBook Pro M3 Max & Air", query: "MacBook" },
      { label: "RTX 4090 Gaming Rigs & Zephyrus", query: "RTX" },
      { label: "Dell XPS & Lenovo ThinkPad Carbon", query: "ThinkPad" },
      { label: "OLED Creator & 2-in-1 Touch Laptops", query: "OLED" },
      { label: "View All 30 Laptops" },
    ],
  },
  {
    title: "🖥️ Studio Displays & Monitors",
    categoryKey: "Monitors",
    items: [
      { label: "Apple Studio Display 5K & XDR", query: "Apple" },
      { label: "Samsung 49\" Odyssey OLED Ultrawide", query: "Odyssey" },
      { label: "Dell UltraSharp & ASUS ProArt Displays", query: "UltraSharp" },
      { label: "240Hz - 360Hz QD-OLED eSports Monitors", query: "OLED" },
      { label: "View All 30 Monitors" },
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
