import React, { useState, useEffect, useRef } from "react";
import type { Product } from "../types";

export interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: string,
    color: string,
    quantity: number
  ) => void;
  formatPrice: (amountInNGN: number) => string;
  onOpenLightbox?: (product: Product, initialIndex?: number) => void;
  isFavorited?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

interface MeasurementRow {
  size: string;
  chestIn: string;
  chestCm: string;
  waistIn: string;
  waistCm: string;
  hipsIn: string;
  hipsCm: string;
  lengthIn: string;
  lengthCm: string;
}

const DEFAULT_MEASUREMENTS: MeasurementRow[] = [
  { size: "XS", chestIn: "33-34\"", chestCm: "84-86 cm", waistIn: "25-26\"", waistCm: "64-66 cm", hipsIn: "35-36\"", hipsCm: "89-91 cm", lengthIn: "45.5\"", lengthCm: "115 cm" },
  { size: "S", chestIn: "35-36\"", chestCm: "89-91 cm", waistIn: "27-28\"", waistCm: "69-71 cm", hipsIn: "37-38\"", hipsCm: "94-96 cm", lengthIn: "46.0\"", lengthCm: "117 cm" },
  { size: "M", chestIn: "37-38\"", chestCm: "94-96 cm", waistIn: "29-30\"", waistCm: "74-76 cm", hipsIn: "39-40\"", hipsCm: "99-101 cm", lengthIn: "46.5\"", lengthCm: "118 cm" },
  { size: "L", chestIn: "39-41\"", chestCm: "99-104 cm", waistIn: "31-33\"", waistCm: "79-84 cm", hipsIn: "41-43\"", hipsCm: "104-109 cm", lengthIn: "47.0\"", lengthCm: "119 cm" },
  { size: "XL", chestIn: "42-44\"", chestCm: "107-112 cm", waistIn: "34-36\"", waistCm: "86-91 cm", hipsIn: "44-46\"", hipsCm: "112-117 cm", lengthIn: "47.5\"", lengthCm: "120 cm" },
];

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  formatPrice,
  onOpenLightbox,
  isFavorited = false,
  onToggleWishlist,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState<"in" | "cm">("cm");
  const [activeAccordion, setActiveAccordion] = useState<"cut" | "materials" | "provenance" | "care">("cut");

  // Optical Magnifier Zoom State
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const zoomStageRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSizeGuideOpen) {
          setIsSizeGuideOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSizeGuideOpen, onClose]);

  if (!isOpen || !product) return null;

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = gallery[activeImageIndex] || product.image;
  const currentSize = selectedSize || product.sizes?.[0] || "One Size";
  const currentColor = selectedColor || product.colors?.[0]?.name || "Atelier Default";
  const inStock = product.stock > 0;

  // Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomStageRef.current) return;
    const rect = zoomStageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleAdd = () => {
    if (!inStock) return;
    onAddToCart(product, currentSize, currentColor, quantity);
    onClose();
  };

  const handleOpenWhatsAppConcierge = () => {
    const message = encodeURIComponent(
      `Hello Vroom Styles Atelier, I would like to inquire about the ${product.name} (Code: ${product.id}).`
    );
    window.open(`https://wa.me/2349130831439?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="modal-backdrop salon-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card salon-modal-card"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${product.name} details`}
      >
        {/* Modal Top Dismiss & Actions */}
        <div className="salon-modal-header">
          <span className="salon-header-badge">Atelier Garment Story &middot; Run 24/25</span>
          <button
            type="button"
            className="salon-close-btn"
            onClick={onClose}
            aria-label="Close salon view"
          >
            &times;
          </button>
        </div>

        <div className="salon-layout-grid">
          {/* ---------------- 1. High-Resolution Optical Gallery Stage ---------------- */}
          <div className="salon-media-column">
            <div
              className="salon-zoom-stage"
              ref={zoomStageRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              aria-label="Garment photograph with optical zoom"
            >
              <img
                src={activeImage}
                alt={product.name}
                className={`salon-primary-image ${isZooming ? "is-zooming" : ""}`}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: "scale(2.2)",
                      }
                    : undefined
                }
                loading="eager"
              />

              <div className="salon-image-overlay-controls">
                {onToggleWishlist && (
                  <button
                    type="button"
                    className={`salon-wishlist-btn ${isFavorited ? "is-favorited" : ""}`}
                    onClick={() => onToggleWishlist(product.id)}
                    aria-label={isFavorited ? "Remove from saved wardrobe" : "Save to wardrobe"}
                    title="Bookmark in Atelier Wardrobe"
                  >
                    <span>{isFavorited ? "★ Saved" : "☆ Save"}</span>
                  </button>
                )}

                {onOpenLightbox && (
                  <button
                    type="button"
                    className="salon-fullscreen-btn"
                    onClick={() => onOpenLightbox(product, activeImageIndex)}
                    title="Fullscreen Lightbox"
                    aria-label="Open fullscreen gallery"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {!isZooming && (
                <div className="salon-zoom-hint" aria-hidden="true">
                  <span>Hover over garment to magnify weave</span>
                </div>
              )}
            </div>

            {/* Multi-Angle Angle Thumbnails */}
            {gallery.length > 1 && (
              <div className="salon-thumbnails-strip" role="tablist" aria-label="Garment views">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={activeImageIndex === idx}
                    className={`salon-thumbnail-btn ${activeImageIndex === idx ? "is-active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} />
                    <span className="thumbnail-index">
                      {idx === 0 ? "Drape" : idx === 1 ? "Profile" : "Texture"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- 2. Garment Story & Craftsmanship Narrative ---------------- */}
          <div className="salon-details-column">
            {/* Header / Provenance Eyebrow */}
            <div className="salon-eyebrow-row">
              <span className="salon-brand-kicker">
                {product.brand || "Vroom Atelier"} &middot; {product.category}
              </span>
              {product.sellerType === "1P" ? (
                <span className="salon-origin-badge">Atelier Made</span>
              ) : (
                <span className="salon-origin-badge partner">Partner Curation</span>
              )}
            </div>

            <h1 className="salon-title">{product.name}</h1>

            <div className="salon-price-row">
              <span className="salon-price-current">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="salon-price-was">{formatPrice(product.originalPrice)}</span>
                  <span className="salon-savings-pill">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Real-time Atelier Stock & Dispatch Indicator */}
            <div className="salon-stock-banner">
              <span className={`salon-stock-dot ${inStock ? "in-stock" : "out-stock"}`} />
              <span className="salon-stock-text">
                {inStock ? (
                  <>
                    <strong>In Store &amp; Ready</strong> &middot; 24h Express Nationwide Dispatch
                  </>
                ) : (
                  <strong>Currently Out of Stock &middot; Made to Order Inquire</strong>
                )}
              </span>
            </div>

            {/* ---------------- 3. Color Swatches & Size Matrix ---------------- */}
            {/* Color Swatch Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="salon-option-group">
                <div className="salon-option-header">
                  <span className="salon-option-label">Color:</span>
                  <strong className="salon-option-value">{currentColor}</strong>
                </div>
                <div className="salon-swatches-grid">
                  {product.colors.map((c: { name: string; hex: string }) => {
                    const isSelected = currentColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        className={`salon-color-tile ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        aria-pressed={isSelected}
                      >
                        <span className="color-swatch-circle" style={{ backgroundColor: c.hex }} />
                        <span className="color-swatch-name">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizing Chips & Measurement Guide Trigger */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="salon-option-group">
                <div className="salon-option-header">
                  <span className="salon-option-label">Size:</span>
                  <strong className="salon-option-value">{currentSize}</strong>
                  <button
                    type="button"
                    className="salon-size-guide-trigger"
                    onClick={() => setIsSizeGuideOpen(true)}
                  >
                    <span>📐 View Size &amp; Measurement Guide</span>
                  </button>
                </div>

                <div className="salon-sizes-grid">
                  {product.sizes.map((s) => {
                    const isSelected = currentSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`salon-size-tile ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={isSelected}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                {product.fitGuide && (
                  <p className="salon-fit-hint">
                    <span className="hint-check">✓</span> Fit Profile: <strong>{product.fitGuide}</strong> (true tailored drape)
                  </p>
                )}
              </div>
            )}

            {/* ---------------- 4. Materiality & Craftsmanship Accordion ---------------- */}
            <div className="salon-narrative-accordion">
              <div className="accordion-tabs-nav">
                <button
                  type="button"
                  className={`accordion-tab-btn ${activeAccordion === "cut" ? "is-active" : ""}`}
                  onClick={() => setActiveAccordion("cut")}
                >
                  The Cut &amp; Drapery
                </button>
                <button
                  type="button"
                  className={`accordion-tab-btn ${activeAccordion === "materials" ? "is-active" : ""}`}
                  onClick={() => setActiveAccordion("materials")}
                >
                  Materiality &amp; Weave
                </button>
                <button
                  type="button"
                  className={`accordion-tab-btn ${activeAccordion === "provenance" ? "is-active" : ""}`}
                  onClick={() => setActiveAccordion("provenance")}
                >
                  Provenance
                </button>
                <button
                  type="button"
                  className={`accordion-tab-btn ${activeAccordion === "care" ? "is-active" : ""}`}
                  onClick={() => setActiveAccordion("care")}
                >
                  Care Guide
                </button>
              </div>

              <div className="accordion-content-panel">
                {activeAccordion === "cut" && (
                  <div className="accordion-panel-body">
                    <p className="editorial-essay">
                      {product.description}
                    </p>
                    <p className="editorial-essay-sub">
                      Architectural shoulder seam shaping with a balanced back vent for natural ease of movement. Cut individually in limited atelier runs to prevent fabric grain distortion.
                    </p>
                  </div>
                )}

                {activeAccordion === "materials" && (
                  <div className="accordion-panel-body">
                    <dl className="atelier-spec-list">
                      <div>
                        <dt>Composition</dt>
                        <dd>{product.material || "100% Pure Mulberry Silk & Fine Combed Cotton"}</dd>
                      </div>
                      <div>
                        <dt>Fabric Weight</dt>
                        <dd>280–320 GSM Balanced Haute Weave</dd>
                      </div>
                      <div>
                        <dt>Hardware &amp; Lining</dt>
                        <dd>Hand-cast antique brass fittings with breathable cupro silk lining</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {activeAccordion === "provenance" && (
                  <div className="accordion-panel-body">
                    <dl className="atelier-spec-list">
                      <div>
                        <dt>Fiber Milling</dt>
                        <dd>Woven in Biella, Northern Italy</dd>
                      </div>
                      <div>
                        <dt>Construction</dt>
                        <dd>Pattern-cut &amp; hand-tailored at the Vroom Styles Atelier, Lagos</dd>
                      </div>
                      <div>
                        <dt>Quality Control</dt>
                        <dd>Double-inspected for grain balance, seam tension, and finish precision</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {activeAccordion === "care" && (
                  <div className="accordion-panel-body">
                    <dl className="atelier-spec-list">
                      <div>
                        <dt>Cleaning</dt>
                        <dd>Specialist green dry clean or gentle eco-wash only</dd>
                      </div>
                      <div>
                        <dt>Pressing</dt>
                        <dd>Low-temperature vertical steam pressing (&lt; 110&deg;C / 230&deg;F)</dd>
                      </div>
                      <div>
                        <dt>Storage</dt>
                        <dd>Complimentary breathable canvas dust garment bag included</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </div>

            {/* ---------------- 5. Action Footer & Bag Integration ---------------- */}
            <div className="salon-action-footer">
              <div className="salon-quantity-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || !inStock}
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="qty-number">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || !inStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="salon-add-bag-btn"
                onClick={handleAdd}
                disabled={!inStock}
              >
                <span>Add to Atelier Bag &middot; {formatPrice(product.price * quantity)}</span>
              </button>
            </div>

            {/* White-glove logistics notes & Concierge */}
            <div className="salon-trust-strip">
              <div className="trust-pill">
                <span className="trust-icon">✓</span>
                <span>Payment on Delivery eligible</span>
              </div>
              <div className="trust-pill">
                <span className="trust-icon">✓</span>
                <span>Doorstep fit inspection</span>
              </div>
              <div className="trust-pill">
                <span className="trust-icon">✓</span>
                <span>7-Day returns &amp; exchanges</span>
              </div>
            </div>

            <button
              type="button"
              className="salon-concierge-chat-link"
              onClick={handleOpenWhatsAppConcierge}
            >
              <span>Questions on sizing or styling? Inquire with Official Concierge &rarr;</span>
            </button>
          </div>
        </div>

        {/* ---------------- Interactive Size & Measurement Guide Modal ---------------- */}
        {isSizeGuideOpen && (
          <div
            className="size-guide-overlay"
            onClick={() => setIsSizeGuideOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Size & Measurement Matrix"
          >
            <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
              <div className="size-guide-header">
                <div>
                  <h3 className="size-guide-title">Atelier Measurement Matrix</h3>
                  <p className="size-guide-subtitle">
                    Measurements are taken flat across the garment. For body fit, measure over light undergarments.
                  </p>
                </div>
                <div className="size-guide-actions">
                  <div className="unit-toggle-group">
                    <button
                      type="button"
                      className={`unit-btn ${sizeGuideUnit === "cm" ? "is-active" : ""}`}
                      onClick={() => setSizeGuideUnit("cm")}
                    >
                      Centimeters
                    </button>
                    <button
                      type="button"
                      className={`unit-btn ${sizeGuideUnit === "in" ? "is-active" : ""}`}
                      onClick={() => setSizeGuideUnit("in")}
                    >
                      Inches
                    </button>
                  </div>
                  <button
                    type="button"
                    className="size-guide-close-btn"
                    onClick={() => setIsSizeGuideOpen(false)}
                    aria-label="Close measurement matrix"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="size-guide-table-wrap">
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust / Chest</th>
                      <th>Natural Waist</th>
                      <th>Low Hips</th>
                      <th>Total Garment Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_MEASUREMENTS.map((row) => (
                      <tr key={row.size} className={currentSize === row.size ? "is-highlighted" : ""}>
                        <td>
                          <strong>{row.size}</strong>
                          {currentSize === row.size && <span className="selected-tag">Selected</span>}
                        </td>
                        <td>{sizeGuideUnit === "cm" ? row.chestCm : row.chestIn}</td>
                        <td>{sizeGuideUnit === "cm" ? row.waistCm : row.waistIn}</td>
                        <td>{sizeGuideUnit === "cm" ? row.hipsCm : row.hipsIn}</td>
                        <td>{sizeGuideUnit === "cm" ? row.lengthCm : row.lengthIn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="size-guide-footer">
                <p>
                  Unsure between two sizes? Our concierge team offers complimentary size exchange and doorstep trial fittings in Lagos and Abuja.
                </p>
                <button
                  type="button"
                  className="size-guide-done-btn"
                  onClick={() => setIsSizeGuideOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
