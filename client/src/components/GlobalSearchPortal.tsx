import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Product } from "../types";
import { useClickOutside } from "../hooks/useClickOutside";

interface GlobalSearchPortalProps {
  searchQuery: string;
  selectedTaxonomy: string;
  products: Product[];
  onSearchChange: (query: string) => void;
  onTaxonomyChange: (taxonomy: string) => void;
  onSelectProduct: (product: Product) => void;
  onExecuteSearch: () => void;
  formatPrice?: (price: number) => string;
}

const TAXONOMY_OPTIONS = [
  { key: "All", label: "All Taxonomies" },
  { key: "Official Store", label: "Official Store" },
  { key: "Fashion & Atelier", label: "Fashion & Atelier" },
  { key: "Appliances", label: "Appliances" },
  { key: "Phones & Tablets", label: "Phones & Tablets" },
  { key: "Health & Beauty", label: "Health & Beauty" },
  { key: "Outerwear", label: "Outerwear" },
  { key: "Knitwear", label: "Knitwear" },
  { key: "Accessories", label: "Accessories" },
];

const TRENDING_SEARCHES = [
  "Silk Midi Dress",
  "Cashmere Sweaters",
  "MagSafe Folio",
  "Garment Steamer",
  "Santal 28",
  "Overcoats",
];

export const GlobalSearchPortal: React.FC<GlobalSearchPortalProps> = ({
  searchQuery,
  selectedTaxonomy,
  products,
  onSearchChange,
  onTaxonomyChange,
  onSelectProduct,
  onExecuteSearch,
  formatPrice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // Global Keyboard Shortcut: Press '/' or 'Ctrl+K' / 'Cmd+K' to auto-focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      if ((e.key === "/" && !isInputActive) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute multi-taxonomy matches (Categories, Brands, Products)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        categories: [],
        brands: [],
        products: [],
      };
    }

    // 1. Categories matching query
    const matchedCategories = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((cat) => cat && cat.toLowerCase().includes(q))
      )
    ).slice(0, 3);

    // 2. Brands matching query
    const matchedBrands = Array.from(
      new Set(
        products
          .map((p) => p.brand)
          .filter((brand): brand is string => Boolean(brand && brand.toLowerCase().includes(q)))
      )
    ).slice(0, 3);

    // 3. Products matching query (title, description, material)
    const matchedProducts = products
      .filter((p) => {
        const matchesTaxonomy =
          selectedTaxonomy === "All" ||
          (selectedTaxonomy === "Official Store" && (p.tag?.includes("Official") || p.tag?.includes("Atelier"))) ||
          (selectedTaxonomy === "Fashion & Atelier" && (p.category === "Women" || p.category === "Fashion & Atelier")) ||
          p.category.toLowerCase() === selectedTaxonomy.toLowerCase();

        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.tag && p.tag.toLowerCase().includes(q));

        return matchesTaxonomy && matchesQuery;
      })
      .slice(0, 5);

    return {
      categories: matchedCategories,
      brands: matchedBrands,
      products: matchedProducts,
    };
  }, [searchQuery, products, selectedTaxonomy]);

  const hasSuggestions =
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.products.length > 0;

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectCategory = (cat: string) => {
    onTaxonomyChange(cat);
    onSearchChange("");
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleSelectBrand = (brand: string) => {
    onSearchChange(brand);
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleSelectProduct = (prod: Product) => {
    onSelectProduct(prod);
    setIsOpen(false);
  };

  const handleTrendingClick = (term: string) => {
    onSearchChange(term);
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onExecuteSearch();
  };

  return (
    <div className="global-search-portal" ref={containerRef}>
      <form onSubmit={handleFormSubmit} className="search-form-shell">
        {/* Taxonomy / Category Selector Prefix */}
        <div className="search-taxonomy-select-wrap">
          <select
            id="search-taxonomy-select"
            className="search-taxonomy-select"
            value={selectedTaxonomy}
            onChange={(e) => {
              onTaxonomyChange(e.target.value);
              inputRef.current?.focus();
            }}
            aria-label="Filter Search by Category Taxonomy"
          >
            {TAXONOMY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="taxonomy-select-chevron">▾</span>
        </div>

        {/* Search Input Bar */}
        <div className="search-input-field-wrap">
          <span className="search-field-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder={
              selectedTaxonomy !== "All"
                ? `Search in ${selectedTaxonomy} (e.g. brand, style, item)...`
                : "Search products, brands and luxury taxonomies..."
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleInputFocus}
            autoComplete="off"
            aria-label="Search Catalog"
          />

          {/* Keyboard shortcut hint badge */}
          {!searchQuery && (
            <span className="search-shortcut-badge" title="Press / or Ctrl+K to search">
              <kbd>/</kbd>
            </span>
          )}

          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
              title="Clear search text"
              aria-label="Clear search text"
            >
              ×
            </button>
          )}
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          className="search-dispatch-btn"
          title="Search collection"
          aria-label="Dispatch Search"
        >
          <span>SEARCH</span>
        </button>
      </form>

      {/* Predictive Multi-Taxonomy Suggestions Dropdown */}
      {isOpen && (
        <div className="search-suggestions-dropdown" role="listbox">
          {searchQuery.trim().length === 0 ? (
            /* Popular / Trending Suggestions */
            <div className="suggestions-trending-panel">
              <span className="trending-title">🔥 TRENDING SEARCHES</span>
              <div className="trending-pills-row">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="trending-pill"
                    onClick={() => handleTrendingClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : hasSuggestions ? (
            /* Multi-Taxonomy Matches */
            <div className="suggestions-results-panel">
              {/* Category Matches */}
              {suggestions.categories.length > 0 && (
                <div className="suggestion-section">
                  <span className="suggestion-section-title">CATEGORIES</span>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="suggestion-row category-row"
                      onClick={() => handleSelectCategory(cat)}
                    >
                      <span className="row-prefix">Browse in</span>
                      <strong className="row-highlight">{cat}</strong>
                      <span className="row-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Brand Matches */}
              {suggestions.brands.length > 0 && (
                <div className="suggestion-section">
                  <span className="suggestion-section-title">BRANDS & ATELIERS</span>
                  {suggestions.brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      className="suggestion-row brand-row"
                      onClick={() => handleSelectBrand(brand)}
                    >
                      <span className="row-prefix">Brand:</span>
                      <strong className="row-highlight">{brand}</strong>
                      <span className="row-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Product Matches */}
              {suggestions.products.length > 0 && (
                <div className="suggestion-section products-section">
                  <span className="suggestion-section-title">MATCHING PRODUCTS</span>
                  {suggestions.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="suggestion-product-card"
                      onClick={() => handleSelectProduct(prod)}
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="suggestion-thumb"
                        loading="lazy"
                      />
                      <div className="suggestion-prod-info">
                        <strong className="suggestion-prod-name">{prod.name}</strong>
                        <div className="suggestion-prod-meta">
                          <span className="meta-brand">{prod.brand || prod.category}</span>
                          <span className="meta-price">
                            {formatPrice ? formatPrice(prod.price) : `₦${prod.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <span className="suggestion-stock-tag">
                        {prod.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="suggestions-empty-state">
              <p>No direct matches found for "{searchQuery}".</p>
              <button
                type="button"
                className="empty-state-search-all-btn"
                onClick={onExecuteSearch}
              >
                Search entire catalog for "{searchQuery}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
