import React, { useState } from "react";
import type { Product } from "../types";
import { carsProducts } from "../data/products";
import { ProductCard } from "./ProductCard";

interface CarsShowroomSectionProps {
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onViewAllCars: () => void;
  onOpenPromptStudio?: (category: string) => void;
}

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "SUPERCARS", label: "Supercars" },
  { id: "GERMAN", label: "German saloons" },
  { id: "SUVS", label: "SUVs" },
  { id: "ELECTRIC", label: "Electric" },
];

const SUPERCAR_BRANDS = ["Porsche", "Ferrari", "Lamborghini", "McLaren", "Aston Martin"];
const GERMAN_BRANDS = ["Mercedes-Benz", "BMW", "Audi"];
const SUV_MARKERS = [
  "SUV",
  "Land Cruiser",
  "Range Rover",
  "XC90",
  "G63",
  "Wrangler",
  "X7",
  "GV80",
  "RX 350",
];
const ELECTRIC_MARKERS = ["Taycan", "Ioniq", "Recharge"];

const matchesFilter = (car: Product, filterId: string): boolean => {
  switch (filterId) {
    case "SUPERCARS":
      return SUPERCAR_BRANDS.includes(car.brand || "");
    case "GERMAN":
      return GERMAN_BRANDS.includes(car.brand || "");
    case "SUVS":
      return SUV_MARKERS.some((marker) => car.name.includes(marker));
    case "ELECTRIC":
      return car.brand === "Tesla" || ELECTRIC_MARKERS.some((marker) => car.name.includes(marker));
    default:
      return true;
  }
};

/** The floor plan of the showroom: one car on the wall, the rest in a grid. */
export const CarsShowroomSection: React.FC<CarsShowroomSectionProps> = ({
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onOpenLightbox,
  onAddToCart,
  onViewAllCars,
  onOpenPromptStudio,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [carsPerPage] = useState<number>(6);
  const [showAll, setShowAll] = useState<boolean>(false);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const filteredCars = carsProducts.filter((car) => matchesFilter(car, activeFilter));

  const featuredCar = carsProducts[0];
  const featuredSpecs = featuredCar?.specs ? Object.entries(featuredCar.specs).slice(0, 4) : [];

  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  const displayedCars = showAll
    ? filteredCars
    : filteredCars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage);

  return (
    <section className="showcase showcase-motors" id="cars-showroom-section" aria-labelledby="motors-title">
      <header className="showcase-head">
        <div className="showcase-head-copy">
          <span className="showcase-kicker">Vroom Motors · {carsProducts.length} cars on the floor</span>
          <h2 className="showcase-title" id="motors-title">
            Cars we would drive ourselves
          </h2>
          <p className="showcase-lede">
            Direct imports with documented history, a pre-delivery inspection, and the
            manufacturer&apos;s warranty still running. Delivered to Lagos or Abuja.
          </p>
        </div>

        <div className="showcase-aside">
          {onOpenPromptStudio && (
            <button
              type="button"
              className="showcase-link is-quiet"
              onClick={() => onOpenPromptStudio("Cars")}
            >
              Photography prompts
            </button>
          )}
          <button type="button" className="showcase-link" onClick={onViewAllCars}>
            All cars in the catalog
          </button>
        </div>
      </header>

      {featuredCar && (
        <article className="motor-feature">
          <figure className="motor-feature-media">
            <button
              type="button"
              className="motor-feature-photo"
              onClick={() => onOpenLightbox && onOpenLightbox(featuredCar, 0)}
              aria-label={`View photographs of ${featuredCar.name}`}
              disabled={!onOpenLightbox}
            >
              <img src={featuredCar.image} alt={featuredCar.name} />
            </button>
            <figcaption className="motor-feature-caption">
              <span>{featuredCar.name}</span>
              {onOpenLightbox && <span className="motor-caption-note">Three angles, including the cockpit</span>}
            </figcaption>
          </figure>

          <div className="motor-feature-panel">
            <p className="motor-price">
              {formatPrice(featuredCar.price)}
              {featuredCar.originalPrice && featuredCar.originalPrice > featuredCar.price && (
                <s>{formatPrice(featuredCar.originalPrice)}</s>
              )}
            </p>

            {featuredSpecs.length > 0 && (
              <dl className="motor-specs">
                {featuredSpecs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {featuredCar.warranty && (
              <div className="motor-assurance">
                <p>{featuredCar.warranty}</p>
                {featuredCar.bundledIncentive && <p>{featuredCar.bundledIncentive}</p>}
              </div>
            )}

            <div className="motor-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => onAddToCart(featuredCar)}
              >
                Reserve for inspection
              </button>
              <button
                type="button"
                className="showcase-link"
                onClick={() => onQuickView(featuredCar)}
              >
                Full specification
              </button>
            </div>
          </div>
        </article>
      )}

      <div className="filter-row" role="group" aria-label="Filter the showroom">
        <span className="filter-row-label">Showing</span>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = carsProducts.filter((car) => matchesFilter(car, filter.id)).length;
          return (
            <button
              key={filter.id}
              type="button"
              className={`filter-chip ${isActive ? "is-active" : ""}`}
              onClick={() => handleFilterChange(filter.id)}
              aria-pressed={isActive}
            >
              {filter.label}
              <span className="filter-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="plate-grid">
        {displayedCars.map((car) => (
          <ProductCard
            key={car.id}
            product={car}
            formatPrice={formatPrice}
            isFavorited={wishlist.includes(car.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            onOpenLightbox={onOpenLightbox}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {filteredCars.length > carsPerPage && (
        <div className="pager">
          <p className="pager-count">
            {showAll ? 1 : (currentPage - 1) * carsPerPage + 1}–
            {showAll ? filteredCars.length : Math.min(currentPage * carsPerPage, filteredCars.length)} of{" "}
            {filteredCars.length} cars
          </p>

          {!showAll && (
            <div className="pager-controls">
              <button
                type="button"
                className="pager-step"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Back
              </button>

              <div className="pager-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pager-number ${currentPage === pageNum ? "is-active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pager-step"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}

          <button type="button" className="pager-toggle" onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? "Page them again" : `Show all ${filteredCars.length}`}
          </button>
        </div>
      )}
    </section>
  );
};
