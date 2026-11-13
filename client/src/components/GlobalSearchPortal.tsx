import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  { key: "All", label: "All Categories", icon: "✨" },
  { key: "Cars", label: "Vehicles & Motors", icon: "🚗" },
  { key: "Fridges", label: "Refrigerators", icon: "🧊" },
  { key: "Microwaves", label: "Microwaves & Ovens", icon: "📻" },
  { key: "Kitchen Utensils", label: "Cookware & Utensils", icon: "🍳" },
  { key: "Furniture", label: "Designer Furniture", icon: "🛋️" },
  { key: "TVs", label: "Smart TVs & Cinema", icon: "📺" },
  { key: "Laptops", label: "Laptops & Ultrabooks", icon: "💻" },
  { key: "Monitors", label: "Studio Monitors", icon: "🖥️" },
  { key: "Women", label: "Fashion & Atelier", icon: "👗" },
  { key: "Accessories", label: "Luxury Leather Goods", icon: "👜" },
  { key: "Health & Beauty", label: "Parfumerie & Skincare", icon: "✨" },
];

const TRENDING_SEARCHES = [
  "Porsche 911",
  "Mercedes-AMG GT",
  "Samsung Bespoke Refrigerator",
  "MacBook Pro M3",
  "Sony BRAVIA OLED",
  "Contour Silk Dress",
  "Arc Cashmere Knit",
  "Inverter Microwave",
];

const RECENT_SEARCHES_KEY = "vroom_recent_searches";

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
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const removeSingleRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut '/' or Ctrl+K / Cmd+K to focus search
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

  // Compute suggestions (Categories, Brands, Query Suggestions, Matching Products)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        querySuggestions: [],
        categories: [],
        brands: [],
        products: [],
      };
    }

    // 1. Category matches
    const matchedCategories = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((cat) => cat && cat.toLowerCase().includes(q))
      )
    ).slice(0, 4);

    // 2. Brand matches
    const matchedBrands = Array.from(
      new Set(
        products
          .map((p) => p.brand)
          .filter((brand): brand is string => Boolean(brand && brand.toLowerCase().includes(q)))
      )
    ).slice(0, 4);

    // 3. Query title suggestions (phrases)
    const matchedQueries = Array.from(
      new Set(
        products
          .map((p) => p.name)
          .filter((name) => name.toLowerCase().includes(q))
      )
    ).slice(0, 4);

    // 4. Products matching query
    const matchedProducts = products
      .filter((p) => {
        const matchesTaxonomy =
          selectedTaxonomy === "All" ||
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
      querySuggestions: matchedQueries,
      categories: matchedCategories,
      brands: matchedBrands,
      products: matchedProducts,
    };
  }, [searchQuery, products, selectedTaxonomy]);

  const hasSuggestions =
    suggestions.querySuggestions.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.products.length > 0;

  // Flatten suggestions for keyboard navigation
  const flatItems = useMemo(() => {
    const items: { type: "query" | "category" | "brand" | "product"; value: string | Product }[] = [];
    suggestions.querySuggestions.forEach((q) => items.push({ type: "query", value: q }));
    suggestions.categories.forEach((cat) => items.push({ type: "category", value: cat }));
    suggestions.brands.forEach((brand) => items.push({ type: "brand", value: brand }));
    suggestions.products.forEach((prod) => items.push({ type: "product", value: prod }));
    return items;
  }, [suggestions]);

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && flatItems[focusedIndex]) {
        e.preventDefault();
        const selected = flatItems[focusedIndex];
        if (selected.type === "query") {
          const val = selected.value as string;
          onSearchChange(val);
          saveRecentSearch(val);
          setIsOpen(false);
          onExecuteSearch();
        } else if (selected.type === "category") {
          const val = selected.value as string;
          onTaxonomyChange(val);
          onSearchChange("");
          saveRecentSearch(val);
          setIsOpen(false);
          onExecuteSearch();
        } else if (selected.type === "brand") {
          const val = selected.value as string;
          onSearchChange(val);
          saveRecentSearch(val);
          setIsOpen(false);
          onExecuteSearch();
        } else if (selected.type === "product") {
          const prod = selected.value as Product;
          onSelectProduct(prod);
          saveRecentSearch(prod.name);
          setIsOpen(false);
        }
      } else {
        // Default form submit
        saveRecentSearch(searchQuery);
        setIsOpen(false);
      }
    }
  };

  const handleSelectCategory = (cat: string) => {
    onTaxonomyChange(cat);
    onSearchChange("");
    saveRecentSearch(cat);
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleSelectBrand = (brand: string) => {
    onSearchChange(brand);
    saveRecentSearch(brand);
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleSelectProduct = (prod: Product) => {
    saveRecentSearch(prod.name);
    onSelectProduct(prod);
    setIsOpen(false);
  };

  const handleDirectSearch = (term: string) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setIsOpen(false);
    onExecuteSearch();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    setIsOpen(false);
    onExecuteSearch();
  };


  return (
    <div className="global-search-portal" ref={containerRef}>
      <form onSubmit={handleFormSubmit} className="search-form-shell">
        {/* Category Taxonomy Selector */}
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
            title={TAXONOMY_OPTIONS.find((o) => o.key === selectedTaxonomy)?.label ?? "All Categories"}
          >
            {TAXONOMY_OPTIONS.map((opt) => (
              <option
                key={opt.key}
                value={opt.key}
                label={opt.key === "All" ? "All" : opt.label}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <span className="taxonomy-select-value" aria-hidden="true">
            {selectedTaxonomy === "All" ? "All" : selectedTaxonomy}
          </span>
          <span className="taxonomy-select-chevron" aria-hidden="true">▾</span>
        </div>

        {/* Search Input Bar with Real-time Suggestion listener */}
        <div className="search-input-field-wrap">
          <span className="search-field-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" width="14" height="14">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.4 10.4 14 14" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder={
              selectedTaxonomy !== "All"
                ? `Search ${selectedTaxonomy}`
                : "Search the collection"
            }
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setFocusedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDownInInput}
            autoComplete="off"
            aria-label="Search Catalog with Suggestions"
          />

          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                onSearchChange("");
                setFocusedIndex(-1);
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

      {/* Predictive Suggestions Dropdown */}
      {isOpen && (
        <div className="search-suggestions-dropdown" role="listbox">
          {searchQuery.trim().length === 0 ? (
            /* Empty State: Recent Searches + Trending */
            <div className="suggestions-idle-panel">
              {recentSearches.length > 0 && (
                <div className="suggestions-recent-panel">
                  <div className="recent-header-row">
                    <span className="trending-title">Recent searches</span>
                    <button
                      type="button"
                      className="clear-history-btn"
                      onClick={clearRecentSearches}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="recent-pills-row">
                    {recentSearches.map((term) => (
                      <div key={term} className="recent-pill-wrap">
                        <button
                          type="button"
                          className="recent-pill"
                          onClick={() => handleDirectSearch(term)}
                        >
                          <span>{term}</span>
                        </button>
                        <button
                          type="button"
                          className="recent-delete-btn"
                          onClick={(e) => removeSingleRecentSearch(e, term)}
                          title={`Remove ${term} from history`}
                          aria-label={`Remove ${term}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="suggestions-trending-panel">
                <span className="trending-title">Trending now</span>
                <div className="trending-pills-row">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="trending-pill"
                      onClick={() => handleDirectSearch(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : hasSuggestions ? (
            /* Active Predictive Suggestions */
            <div className="suggestions-results-panel">
              {/* Query Autocomplete Suggestions */}
              {suggestions.querySuggestions.length > 0 && (
                <div className="suggestion-section query-suggestions-section">
                  <span className="suggestion-section-title">Searches</span>
                  {suggestions.querySuggestions.map((queryText) => (
                    <button
                      key={queryText}
                      type="button"
                      className="suggestion-row query-row"
                      onClick={() => handleDirectSearch(queryText)}
                    >
                      <strong className="row-highlight">{queryText}</strong>
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Category Matches */}
              {suggestions.categories.length > 0 && (
                <div className="suggestion-section">
                  <span className="suggestion-section-title">Categories</span>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="suggestion-row category-row"
                      onClick={() => handleSelectCategory(cat)}
                    >
                      <strong className="row-highlight">{cat}</strong>
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Brand Matches */}
              {suggestions.brands.length > 0 && (
                <div className="suggestion-section">
                  <span className="suggestion-section-title">Brands</span>
                  {suggestions.brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      className="suggestion-row brand-row"
                      onClick={() => handleSelectBrand(brand)}
                    >
                      <strong className="row-highlight">{brand}</strong>
                      <span className="row-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Products with Thumbnail & Price */}
              {suggestions.products.length > 0 && (
                <div className="suggestion-section products-section">
                  <span className="suggestion-section-title">Pieces</span>
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
                      <span className={`suggestion-stock-tag ${prod.stock > 0 ? "in-stock" : "out"}`}>
                        {prod.stock > 0 ? "In stock" : "Sold out"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="suggestions-empty-state">
              <p>Nothing matched "{searchQuery}".</p>
              <button
                type="button"
                className="empty-state-search-all-btn"
                onClick={onExecuteSearch}
              >
                Search the whole catalogue for "{searchQuery}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
