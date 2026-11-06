import React, { useState, useEffect } from "react";
import type { Product } from "../types";
import { calculateDiscount } from "../utils/discount";

interface FlashSaleSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (amount: number) => string;
  onViewAllFlashSales: () => void;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Flash Sale Countdown Engine & Product Showcase.
 * Features a real-time countdown timer (00h : 00m : 29s), on-the-fly dynamic discount
 * badges (-49%, -56%), and inventory scarcity meters showing remaining items.
 */
export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  formatPrice,
  onViewAllFlashSales,
}) => {
  // Real-time Countdown Timer (counts down toward next flash cycle, e.g. daily 6-hour windows)
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => {
    const now = new Date();
    // Next 6-hour cycle milestone: 00:00, 06:00, 12:00, 18:00
    const currentHour = now.getHours();
    const nextWindowHour = (Math.floor(currentHour / 6) + 1) * 6;
    const targetDate = new Date(now);
    targetDate.setHours(nextWindowHour, 0, 0, 0);

    const diff = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        // Reset when window expires
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigits = (val: number): string => val.toString().padStart(2, "0");

  // Filter flash sale eligible products (either tagged FLASH_SALE or with high discount)
  const flashSaleProducts = products.filter(
    (p) => p.campaignTag === "FLASH_SALE" || (p.originalPrice && p.originalPrice > p.price * 1.3)
  ).slice(0, 6);

  if (flashSaleProducts.length === 0) return null;

  return (
    <section className="flash-sale-section" aria-label="Limited Time Flash Deals">
      <div className="flash-sale-container">
        {/* Flash Sale Header with High-Urgency Countdown Clock */}
        <div className="flash-sale-header-bar">
          <div className="flash-title-group">
            <span className="flash-icon-pulse">⚡</span>
            <div className="flash-headings">
              <h3 className="flash-main-title">FLASH SALE DEALS</h3>
              <span className="flash-sub-title">Top luxury drops at limited-time promotional pricing</span>
            </div>
          </div>

          <div className="flash-countdown-wrapper">
            <span className="countdown-label">TIME LEFT:</span>
            <div className="countdown-clock-boxes" role="timer" aria-live="polite">
              <span className="clock-box">
                <strong>{formatDigits(timeLeft.hours)}</strong>
                <small>h</small>
              </span>
              <span className="clock-sep">:</span>
              <span className="clock-box">
                <strong>{formatDigits(timeLeft.minutes)}</strong>
                <small>m</small>
              </span>
              <span className="clock-sep">:</span>
              <span className="clock-box highlight-sec">
                <strong>{formatDigits(timeLeft.seconds)}</strong>
                <small>s</small>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="flash-see-all-btn"
            onClick={onViewAllFlashSales}
            title="Explore all flash sale products"
          >
            <span>SEE ALL DEALS</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Horizontal Flash Deal Grid */}
        <div className="flash-deals-grid">
          {flashSaleProducts.map((product) => {
            const discount = calculateDiscount(product.price, product.originalPrice);
            const totalStock = product.initialStock || Math.max(product.stock * 2, 30);
            const remainingStock = product.stock;
            const soldCount = Math.max(0, totalStock - remainingStock);
            const percentSold = Math.min(100, Math.round((soldCount / totalStock) * 100));
            const isCriticalStock = remainingStock <= 6;

            return (
              <div key={product.id} className="flash-deal-card">
                <div
                  className="flash-card-media"
                  onClick={() => onSelectProduct(product)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="flash-prod-img"
                    loading="lazy"
                  />

                  {/* Dynamic Discount Tag */}
                  {discount.hasDiscount && (
                    <span className="dynamic-discount-badge">
                      {discount.formattedBadge}
                    </span>
                  )}

                  <span className="flash-flame-tag">🔥 HOT DEAL</span>
                </div>

                <div className="flash-card-body">
                  <div className="flash-card-meta">
                    <span className="flash-brand">{product.brand || product.category}</span>
                  </div>

                  <h4
                    className="flash-prod-title"
                    onClick={() => onSelectProduct(product)}
                    title={product.name}
                  >
                    {product.name}
                  </h4>

                  {/* Dynamic Pricing with Strikethrough Baseline */}
                  <div className="flash-pricing-row">
                    <span className="flash-sale-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="flash-original-price">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Inventory Scarcity Meter */}
                  <div className="inventory-scarcity-meter">
                    <div className="scarcity-label-row">
                      <span className={`scarcity-text ${isCriticalStock ? "critical" : ""}`}>
                        {isCriticalStock
                          ? `⚠️ Only ${remainingStock} items left in stock!`
                          : `${remainingStock} items in stock`}
                      </span>
                      <span className="scarcity-percent">{percentSold}% sold</span>
                    </div>
                    <div className="scarcity-progress-track">
                      <div
                        className={`scarcity-progress-bar ${isCriticalStock ? "urgency-high" : ""}`}
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    className="flash-claim-btn"
                    onClick={() => onAddToCart(product)}
                    disabled={remainingStock <= 0}
                  >
                    {remainingStock <= 0 ? "SOLD OUT" : "CLAIM DEAL"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

