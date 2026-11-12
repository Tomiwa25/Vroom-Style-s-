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

  const filteredCars = carsProducts.filter((car) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "SUPERCARS") {
      return (
        car.brand === "Porsche" ||
        car.brand === "Ferrari" ||
        car.brand === "Lamborghini" ||
        car.brand === "McLaren" ||
        car.brand === "Aston Martin"
      );
    }
    if (activeFilter === "GERMAN") {
      return (
        car.brand === "Mercedes-Benz" ||
        car.brand === "BMW" ||
        car.brand === "Audi"
      );
    }
    if (activeFilter === "SUVS") {
      return (
        car.name.includes("SUV") ||
        car.name.includes("Land Cruiser") ||
        car.name.includes("Range Rover") ||
        car.name.includes("XC90") ||
        car.name.includes("G63") ||
        car.name.includes("Wrangler") ||
        car.name.includes("X7") ||
        car.name.includes("GV80") ||
        car.name.includes("RX 350")
      );
    }
    if (activeFilter === "ELECTRIC") {
      return (
        car.brand === "Tesla" ||
        car.name.includes("Taycan") ||
        car.name.includes("Ioniq") ||
        car.name.includes("Recharge")
      );
    }
    return true;
  });

  const featuredCar = carsProducts[0]; // Porsche 911 Carrera GTS

  return (
    <section className="cars-showroom-section" id="cars-showroom-section" aria-label="Vroom Motors Showroom">
      {/* Showroom Header */}
      <div className="cars-showroom-header">
        <div className="showroom-title-block">
          <div className="showroom-kicker-badge">
            <span className="badge-icon">🚗</span>
            <span>VROOM MOTORS • CERTIFIED VEHICLE SHOWROOM</span>
            <span className="count-pill">30 Vehicles Available</span>
          </div>
          <h2 className="showroom-main-heading">
            Luxury Automobiles, Supercars & Executive SUVs
          </h2>
          <p className="showroom-subheading">
            Direct-import certified luxury vehicles with verified history, manufacturer warranty, pre-delivery inspection, and doorstep Lagos/Abuja transit logistics.
          </p>
        </div>

        <div className="showroom-header-actions">
          {onOpenPromptStudio && (
            <button
              type="button"
              className="showroom-prompt-studio-btn"
              onClick={() => onOpenPromptStudio("Cars")}
              title="View & copy Midjourney AI prompts for these 30 cars"
            >
              <span className="btn-icon">🎨</span>
              <span>View 30 Car Prompts</span>
            </button>
          )}

          <button
            type="button"
            className="showroom-view-all-btn"
            onClick={onViewAllCars}
          >
            <span>View All 30 Cars in Catalog</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Featured Vehicle Spotlight Banner */}
      {featuredCar && (
        <div className="cars-spotlight-hero">
          <div
            className="spotlight-media-frame"
            onClick={() => onOpenLightbox && onOpenLightbox(featuredCar, 0)}
            style={{ cursor: onOpenLightbox ? "zoom-in" : "default" }}
            title="Click to view all 3 angles (Front, Rear, Interior)"
          >
            <img
              src={featuredCar.image}
              alt={featuredCar.name}
              className="spotlight-hero-img"
            />
            <div className="spotlight-hero-overlay">
              <span className="spotlight-flagship-tag">FLAGSHIP SHOWROOM ARRIVAL</span>
              <h3 className="spotlight-car-name">{featuredCar.name}</h3>
              <p className="spotlight-car-specs-line">
                {featuredCar.specs ? Object.entries(featuredCar.specs).map(([k, v]) => `${k}: ${v}`).join(" • ") : ""}
              </p>
            </div>
            {onOpenLightbox && (
              <span className="spotlight-angles-pill">
                📸 Open 3 Angles (Front, Rear, Cockpit)
              </span>
            )}
          </div>

          <div className="spotlight-info-panel">
            <div className="spotlight-price-box">
              <span className="price-label">Official Showroom Price:</span>
              <div className="price-val-row">
                <span className="spotlight-price-val">{formatPrice(featuredCar.price)}</span>
                {featuredCar.originalPrice && (
                  <span className="spotlight-orig-price">{formatPrice(featuredCar.originalPrice)}</span>
                )}
              </div>
              {featuredCar.originalPrice && (
                <span className="spotlight-savings-tag">
                  Direct Import Savings: {formatPrice(featuredCar.originalPrice - featuredCar.price)}
                </span>
              )}
            </div>

            <div className="spotlight-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Engine</span>
                <strong className="spec-value">{featuredCar.specs?.["Engine"] || "3.0L Boxer 6"}</strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Horsepower</span>
                <strong className="spec-value">{featuredCar.specs?.["Horsepower"] || "473 HP"}</strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">0-100 km/h</span>
                <strong className="spec-value">{featuredCar.specs?.["0-100 km/h"] || "3.3s"}</strong>
              </div>
              <div className="spec-item">
                <span className="spec-label">Transmission</span>
                <strong className="spec-value">{featuredCar.specs?.["Transmission"] || "8-Speed PDK"}</strong>
              </div>
            </div>

            <div className="spotlight-incentive-box">
              <span className="incentive-icon">🛡️</span>
              <div>
                <strong>{featuredCar.warranty}</strong>
                <p>{featuredCar.bundledIncentive}</p>
              </div>
            </div>

            <div className="spotlight-cta-row">
              <button
                type="button"
                className="spotlight-quickview-btn"
                onClick={() => onQuickView(featuredCar)}
              >
                Inspect Vehicle Details
              </button>
              {onOpenLightbox && (
                <button
                  type="button"
                  className="spotlight-angles-action-btn"
                  onClick={() => onOpenLightbox(featuredCar, 0)}
                >
                  View 3 Angles Gallery
                </button>
              )}
              <button
                type="button"
                className="spotlight-reserve-btn"
                onClick={() => onAddToCart(featuredCar)}
              >
                Reserve / Book Inspection +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs Strip */}
      <div className="showroom-filter-strip">
        <span className="filter-label">Filter Showroom:</span>
        {[
          { id: "ALL", label: `All Vehicles (${carsProducts.length})` },
          { id: "SUPERCARS", label: "Supercars & Exotics" },
          { id: "GERMAN", label: "Mercedes, BMW & Audi" },
          { id: "SUVS", label: "Luxury SUVs & 4x4" },
          { id: "ELECTRIC", label: "Electric & Hybrid" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`showroom-filter-pill ${activeFilter === tab.id ? "active" : ""}`}
            onClick={() => handleFilterChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vehicles Grid with Pagination */}
      {(() => {
        const totalPages = Math.ceil(filteredCars.length / carsPerPage);
        const displayedCars = showAll
          ? filteredCars
          : filteredCars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage);

        return (
          <>
            <div className="showroom-vehicles-grid">
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

            {/* Pagination Controls */}
            {filteredCars.length > carsPerPage && (
              <div className="showroom-pagination-bar">
                <span className="pagination-count-summary">
                  Showing {showAll ? 1 : (currentPage - 1) * carsPerPage + 1}–
                  {showAll ? filteredCars.length : Math.min(currentPage * carsPerPage, filteredCars.length)} of {filteredCars.length} vehicles
                </span>

                <div className="pagination-actions-wrap">
                  {!showAll && (
                    <>
                      <button
                        type="button"
                        className="pagination-arrow-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous vehicle page"
                      >
                        ‹ Previous
                      </button>

                      <div className="pagination-numbers-row">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            className={`pagination-number-btn ${currentPage === pageNum ? "active" : ""}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="pagination-arrow-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Next vehicle page"
                      >
                        Next ›
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="pagination-toggle-all-btn"
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? "Show in Pages (6 per page)" : `Show All ${filteredCars.length} Vehicles`}
                  </button>
                </div>
              </div>
            )}
          </>
        );
      })()}
    </section>
  );
};
