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

const WINDOW_HOURS = 6;

/**
 * A six-hour window, stated plainly. The clock sits in the margin of the head
 * as three numbers and two colons; stock is a hairline measure under each price
 * rather than a coloured bar. Nothing here pulses.
 */
export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  formatPrice,
  onViewAllFlashSales,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const nextWindowHour = (Math.floor(currentHour / WINDOW_HOURS) + 1) * WINDOW_HOURS;
    const target = new Date(now);
    target.setHours(nextWindowHour, 0, 0, 0);

    const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: WINDOW_HOURS - 1, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (value: number) => value.toString().padStart(2, "0");

  const closingHour = new Date().getHours();
  const closesAt = (Math.floor(closingHour / WINDOW_HOURS) + 1) * WINDOW_HOURS;

  const deals = products
    .filter((p) => p.campaignTag === "FLASH_SALE" || (p.originalPrice && p.originalPrice > p.price * 1.3))
    .slice(0, 6);

  if (deals.length === 0) return null;

  return (
    <section className="showcase showcase-last-call" aria-labelledby="last-call-title">
      <header className="showcase-head">
        <div className="showcase-head-copy">
          <span className="showcase-kicker">Prices reset at {closesAt}:00</span>
          <h2 className="showcase-title" id="last-call-title">
            Last call
          </h2>
          <p className="showcase-lede">
            Six pieces at their final price until this window closes. Stock shown is
            what is actually on the shelf.
          </p>
        </div>

        <div className="showcase-aside last-call-aside">
          <p className="last-call-clock" role="timer" aria-live="off">
            <span>{pad(timeLeft.hours)}</span>
            <i aria-hidden="true">:</i>
            <span>{pad(timeLeft.minutes)}</span>
            <i aria-hidden="true">:</i>
            <span>{pad(timeLeft.seconds)}</span>
          </p>
          <p className="last-call-clock-note">hours &middot; minutes &middot; seconds</p>
          <button type="button" className="showcase-link" onClick={onViewAllFlashSales}>
            See every reduced piece
          </button>
        </div>
      </header>

      <div className="deal-grid">
        {deals.map((product) => {
          const discount = calculateDiscount(product.price, product.originalPrice);
          const totalStock = product.initialStock || Math.max(product.stock * 2, 30);
          const remaining = Math.max(0, product.stock);
          const shareLeft = Math.max(0, Math.min(100, Math.round((remaining / totalStock) * 100)));
          const low = remaining > 0 && remaining <= 6;

          return (
            <article key={product.id} className="deal-card">
              <div
                className="deal-media"
                onClick={() => onSelectProduct(product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${product.name}`}
              >
                <img src={product.image} alt={product.name} className="deal-photo" loading="lazy" />
                {discount.hasDiscount && <span className="deal-mark">{discount.formattedBadge}</span>}
              </div>

              <div className="deal-body">
                <span className="deal-brand">{product.brand || product.category}</span>

                <button type="button" className="deal-name" onClick={() => onSelectProduct(product)}>
                  {product.name}
                </button>

                <p className="deal-price">
                  <span>{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <s>{formatPrice(product.originalPrice)}</s>
                  )}
                </p>

                <div className="deal-stock">
                  <div
                    className="deal-measure"
                    role="img"
                    aria-label={`${remaining} of ${totalStock} left`}
                  >
                    <span style={{ width: `${shareLeft}%` }} />
                  </div>
                  <p className={`deal-stock-note ${low ? "is-low" : ""}`}>
                    {remaining <= 0
                      ? "Sold out"
                      : low
                        ? `${remaining} left of ${totalStock}`
                        : `${remaining} of ${totalStock} left`}
                  </p>
                </div>

                <button
                  type="button"
                  className="deal-add"
                  onClick={() => onAddToCart(product)}
                  disabled={remaining <= 0}
                >
                  {remaining <= 0 ? "Sold out" : "Add to bag"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
