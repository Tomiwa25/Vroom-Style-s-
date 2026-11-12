import React, { useState } from "react";
import type { Product } from "../types";
import { carsProducts } from "../data/products";
import { ProductCard } from "./ProductCard";

interface CarsShowroomSectionProps {
  formatPrice: (amount: number) => string;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onViewAllCars: () => void;
  onOpenPromptStudio?: (category: string) => void;
}

export const CarsShowroomSection: React.FC<CarsShowroomSectionProps> = ({
  formatPrice,
  wishlist,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onViewAllCars,
  onOpenPromptStudio,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

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
          <div className="spotlight-media-frame">
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
              <span className="spotlight-savings-tag">
                Direct Import Savings: {formatPrice((featuredCar.originalPrice || 0) - featuredCar.price)}
              </span>
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
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="showroom-vehicles-grid">
        {filteredCars.map((car) => (
          <ProductCard
            key={car.id}
            product={car}
            formatPrice={formatPrice}
            isFavorited={wishlist.includes(car.id)}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};
