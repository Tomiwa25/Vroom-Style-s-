import React from "react";
import type { Product } from "../types";

interface BreadcrumbsProps {
  selectedTaxonomy: string;
  searchQuery: string;
  activeProduct?: Product | null;
  onResetToHome: () => void;
  onSelectTaxonomy: (taxonomy: string) => void;
  onClearSearch: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  selectedTaxonomy,
  searchQuery,
  activeProduct,
  onResetToHome,
  onSelectTaxonomy,
  onClearSearch,
}) => {
  const isFiltered = selectedTaxonomy !== "All" || !!searchQuery.trim() || !!activeProduct;

  if (!isFiltered) {
    return (
      <nav className="breadcrumbs-bar default-home" aria-label="Breadcrumb">
        <div className="breadcrumbs-wrap">
          <span className="crumb-active">Home</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-muted">Curated Atelier Collection</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="breadcrumbs-bar" aria-label="Breadcrumb">
      <div className="breadcrumbs-wrap">
        {/* Home */}
        <button
          type="button"
          className="crumb-link"
          onClick={onResetToHome}
          title="Return to Home Collection"
        >
          Home
        </button>
        <span className="crumb-sep">/</span>

        {/* Categories Root */}
        <button
          type="button"
          className="crumb-link"
          onClick={() => {
            onSelectTaxonomy("All");
            onClearSearch();
          }}
        >
          Catalog
        </button>

        {/* Selected Taxonomy */}
        {selectedTaxonomy !== "All" && (
          <>
            <span className="crumb-sep">/</span>
            {searchQuery || activeProduct ? (
              <button
                type="button"
                className="crumb-link"
                onClick={() => onSelectTaxonomy(selectedTaxonomy)}
              >
                {selectedTaxonomy}
              </button>
            ) : (
              <span className="crumb-active">{selectedTaxonomy}</span>
            )}
          </>
        )}

        {/* Search Query */}
        {searchQuery && (
          <>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">
              Search: "{searchQuery}"
              <button
                type="button"
                className="crumb-clear-inline"
                onClick={onClearSearch}
                title="Clear search"
              >
                ×
              </button>
            </span>
          </>
        )}

        {/* Quick Product Detail View */}
        {activeProduct && (
          <>
            <span className="crumb-sep">/</span>
            <span className="crumb-active truncate">{activeProduct.name}</span>
          </>
        )}
      </div>
    </nav>
  );
};

