import React from "react";

export interface CatalogFiltersProps {
  currency: "NGN" | "USD";
  priceRange: [number, number];
  minPriceBound: number;
  maxPriceBound: number;
  onPriceRangeChange: (range: [number, number]) => void;
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  selectedMaterials: string[];
  onToggleMaterial: (material: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sellerTypeFilter: "ALL" | "1P" | "3P";
  onSelectSellerType: (type: "ALL" | "1P" | "3P") => void;
  isPodFilterActive: boolean;
  onTogglePodFilter: () => void;
  sortBy: "curated" | "price-asc" | "price-desc" | "newest" | "rating";
  onSortChange: (sort: "curated" | "price-asc" | "price-desc" | "newest" | "rating") => void;
  totalResults: number;
  onResetAll: () => void;
  formatPrice: (amount: number) => string;
  availableCategories: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const FOOTWEAR_SIZES = ["40", "41", "42", "43", "44", "45"];
const CURATED_MATERIALS = [
  "Mulberry Silk",
  "Grade-A Cashmere",
  "Italian Calfskin",
  "Organic Linen",
  "Merino Wool",
  "Wool Melton",
];

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  currency,
  priceRange,
  minPriceBound,
  maxPriceBound,
  onPriceRangeChange,
  selectedSizes,
  onToggleSize,
  selectedMaterials,
  onToggleMaterial,
  selectedCategory,
  onSelectCategory,
  sellerTypeFilter,
  onSelectSellerType,
  isPodFilterActive,
  onTogglePodFilter,
  sortBy,
  onSortChange,
  totalResults,
  onResetAll,
  formatPrice,
  availableCategories,
  isOpen,
  onToggleOpen,
}) => {
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedSizes.length > 0 ||
    selectedMaterials.length > 0 ||
    sellerTypeFilter !== "ALL" ||
    isPodFilterActive ||
    priceRange[0] > minPriceBound ||
    priceRange[1] < maxPriceBound ||
    sortBy !== "curated";

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = Math.min(val, priceRange[1] - 1000);
    onPriceRangeChange([clamped, priceRange[1]]);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = Math.max(val, priceRange[0] + 1000);
    onPriceRangeChange([priceRange[0], clamped]);
  };

  return (
    <div className="catalog-filters-wrapper" id="catalog-filters-root">
      {/* ---------------- Filter Top Bar: Live Counter, Sort & Filter Trigger ---------------- */}
      <div className="catalog-header-bar">
        <div className="catalog-counter-group">
          <span className="catalog-count-number">{totalResults}</span>
          <span className="catalog-count-label">
            {totalResults === 1 ? "Curated Piece" : "Curated Pieces"}
          </span>
          {selectedCategory !== "All" && (
            <span className="catalog-count-category">in {selectedCategory}</span>
          )}
        </div>

        <div className="catalog-header-controls">
          {/* Sorting Dropdown */}
          <div className="catalog-sort-wrapper">
            <label htmlFor="catalog-sort-select" className="catalog-sort-label">
              Sort by
            </label>
            <select
              id="catalog-sort-select"
              className="catalog-sort-select"
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as "curated" | "price-asc" | "price-desc" | "newest" | "rating"
                )
              }
              aria-label="Sort catalog collection"
            >
              <option value="curated">Curated Recommendations</option>
              <option value="newest">Newest Atelier Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Filter Panel Toggle Button */}
          <button
            type="button"
            className={`catalog-filter-btn ${isOpen ? "is-active" : ""} ${
              hasActiveFilters ? "has-filters" : ""
            }`}
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            aria-controls="catalog-refinements-panel"
          >
            <span className="filter-btn-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 3.5H14M4 8H12M6.5 12.5H9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>Refine</span>
            {hasActiveFilters && <span className="filter-active-indicator" />}
          </button>
        </div>
      </div>

      {/* ---------------- Active Facets Pill Bar ---------------- */}
      {hasActiveFilters && (
        <div className="active-facets-strip" aria-label="Active catalog filters">
          <span className="active-facets-heading">Active:</span>

          {selectedCategory !== "All" && (
            <button
              type="button"
              className="facet-pill"
              onClick={() => onSelectCategory("All")}
              title="Remove category filter"
            >
              <span>Category: {selectedCategory}</span>
              <span className="facet-remove">&times;</span>
            </button>
          )}

          {(priceRange[0] > minPriceBound || priceRange[1] < maxPriceBound) && (
            <button
              type="button"
              className="facet-pill"
              onClick={() => onPriceRangeChange([minPriceBound, maxPriceBound])}
              title="Reset price filter"
            >
              <span>
                Price: {formatPrice(priceRange[0])} &ndash; {formatPrice(priceRange[1])}
              </span>
              <span className="facet-remove">&times;</span>
            </button>
          )}

          {selectedSizes.map((size) => (
            <button
              key={size}
              type="button"
              className="facet-pill"
              onClick={() => onToggleSize(size)}
              title={`Remove size ${size}`}
            >
              <span>Size: {size}</span>
              <span className="facet-remove">&times;</span>
            </button>
          ))}

          {selectedMaterials.map((mat) => (
            <button
              key={mat}
              type="button"
              className="facet-pill"
              onClick={() => onToggleMaterial(mat)}
              title={`Remove material ${mat}`}
            >
              <span>{mat}</span>
              <span className="facet-remove">&times;</span>
            </button>
          ))}

          {sellerTypeFilter !== "ALL" && (
            <button
              type="button"
              className="facet-pill"
              onClick={() => onSelectSellerType("ALL")}
              title="Reset origin filter"
            >
              <span>Origin: {sellerTypeFilter === "1P" ? "Vroom Atelier" : "Partners"}</span>
              <span className="facet-remove">&times;</span>
            </button>
          )}

          {isPodFilterActive && (
            <button
              type="button"
              className="facet-pill"
              onClick={onTogglePodFilter}
              title="Remove Payment on Delivery filter"
            >
              <span>Pay on Delivery</span>
              <span className="facet-remove">&times;</span>
            </button>
          )}

          <button
            type="button"
            className="facet-clear-all-btn"
            onClick={onResetAll}
            title="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ---------------- Slide-out / Expandable Refinements Panel ---------------- */}
      {isOpen && (
        <aside
          className="catalog-refinements-panel"
          id="catalog-refinements-panel"
          aria-label="Filter options"
        >
          <div className="refinements-grid">
            {/* 0. Department / Categories */}
            <div className="refinement-group category-refinement">
              <div className="refinement-group-header">
                <span className="refinement-title">Department</span>
              </div>
              <div className="category-pills-wrap">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`material-pill-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => onSelectCategory(cat)}
                      aria-pressed={isSelected}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. Price Range Slider */}
            <div className="refinement-group price-refinement">
              <div className="refinement-group-header">
                <span className="refinement-title">Price Range</span>
                <span className="refinement-range-values">
                  {formatPrice(priceRange[0])} &ndash; {formatPrice(priceRange[1])}
                </span>
              </div>
              <div className="price-slider-track-wrap">
                <input
                  type="range"
                  min={minPriceBound}
                  max={maxPriceBound}
                  step={currency === "USD" ? 5 : 5000}
                  value={priceRange[0]}
                  onChange={handleMinSliderChange}
                  className="price-range-input range-min"
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={minPriceBound}
                  max={maxPriceBound}
                  step={currency === "USD" ? 5 : 5000}
                  value={priceRange[1]}
                  onChange={handleMaxSliderChange}
                  className="price-range-input range-max"
                  aria-label="Maximum price"
                />
              </div>
              <div className="price-bounds-labels">
                <span>{formatPrice(minPriceBound)}</span>
                <span>{formatPrice(maxPriceBound)}</span>
              </div>
            </div>

            {/* 2. Apparel Sizes Chips */}
            <div className="refinement-group sizes-refinement">
              <div className="refinement-group-header">
                <span className="refinement-title">Apparel Sizing</span>
                {selectedSizes.some((s) => APPAREL_SIZES.includes(s)) && (
                  <span className="refinement-hint">Filtered</span>
                )}
              </div>
              <div className="size-chips-grid">
                {APPAREL_SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`size-chip-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => onToggleSize(sz)}
                      aria-pressed={isSelected}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Footwear Sizing Sub-row */}
              <div className="footwear-sizing-subgroup">
                <span className="subgroup-label">Footwear (EU)</span>
                <div className="size-chips-grid footwear-chips">
                  {FOOTWEAR_SIZES.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`size-chip-btn ${isSelected ? "is-selected" : ""}`}
                        onClick={() => onToggleSize(sz)}
                        aria-pressed={isSelected}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Materiality & Textile Badges */}
            <div className="refinement-group materials-refinement">
              <div className="refinement-group-header">
                <span className="refinement-title">Artisanal Material</span>
              </div>
              <div className="material-pills-wrap">
                {CURATED_MATERIALS.map((mat) => {
                  const isSelected = selectedMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      className={`material-pill-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => onToggleMaterial(mat)}
                      aria-pressed={isSelected}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Origin & Settlement Preferences */}
            <div className="refinement-group preferences-refinement">
              <div className="refinement-group-header">
                <span className="refinement-title">Provenance & Terms</span>
              </div>
              <div className="preference-toggles-wrap">
                <button
                  type="button"
                  className={`preference-pill-btn ${sellerTypeFilter === "1P" ? "is-selected" : ""}`}
                  onClick={() => onSelectSellerType(sellerTypeFilter === "1P" ? "ALL" : "1P")}
                >
                  <span className="pref-mark">✦</span>
                  <span>Vroom Atelier Only</span>
                </button>
                <button
                  type="button"
                  className={`preference-pill-btn ${isPodFilterActive ? "is-selected" : ""}`}
                  onClick={onTogglePodFilter}
                >
                  <span className="pref-mark">✓</span>
                  <span>Pay on Delivery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Reset & Collapse Row */}
          <div className="refinements-footer">
            <button
              type="button"
              className="refinements-reset-btn"
              onClick={onResetAll}
              disabled={!hasActiveFilters}
            >
              Reset All Filters
            </button>
            <button
              type="button"
              className="refinements-apply-btn"
              onClick={onToggleOpen}
            >
              Done &bull; View {totalResults} {totalResults === 1 ? "Piece" : "Pieces"}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
