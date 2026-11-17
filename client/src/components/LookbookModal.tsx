import React, { useState, useEffect } from "react";
import type { Product } from "../types";
import {
  LOOKBOOK_LOOKS,
  TEXTILE_ARCHIVE,
  type LookbookLook,
  type LookbookHotspot,
} from "../data/lookbookData";

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (price: number) => string;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onOpenQuickView?: (product: Product) => void;
  onOpenCart?: () => void;
  currency: "NGN" | "USD";
  onToggleCurrency?: () => void;
  onShowToast: (msg: string) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  formatPrice,
  onAddToCart,
  onOpenCart,
  currency,
  onToggleCurrency,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"runway" | "archive" | "studio">("runway");
  const [currentLookIndex, setCurrentLookIndex] = useState<number>(0);
  const [selectedHotspot, setSelectedHotspot] = useState<LookbookHotspot | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [hoveredHotspot, setHoveredHotspot] = useState<LookbookHotspot | null>(null);

  const currentLook: LookbookLook = LOOKBOOK_LOOKS[currentLookIndex] || LOOKBOOK_LOOKS[0];

  // Appointment Form state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [fittingDate, setFittingDate] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isBooked, setIsBooked] = useState(false);


  // Handle ESC key to close modal or drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedHotspot) {
          setSelectedHotspot(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedHotspot, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevLook = () => {
    setSelectedHotspot(null);
    setCurrentLookIndex((prev) => (prev > 0 ? prev - 1 : LOOKBOOK_LOOKS.length - 1));
  };

  const handleNextLook = () => {
    setSelectedHotspot(null);
    setCurrentLookIndex((prev) => (prev < LOOKBOOK_LOOKS.length - 1 ? prev + 1 : 0));
  };

  const handleHotspotClick = (spot: LookbookHotspot) => {
    setSelectedHotspot(spot);
    setSelectedSize(spot.sizes.length > 0 ? spot.sizes[0] : "");
  };

  const handleAddGarmentToBag = () => {
    if (!selectedHotspot) return;

    // Map hotspot to Product type
    const productItem: Product = {
      id: selectedHotspot.id,
      name: selectedHotspot.name,
      description: selectedHotspot.description,
      price: currency === "USD" ? selectedHotspot.priceUSD * 1500 : selectedHotspot.priceNGN,
      image: selectedHotspot.image,
      images: [selectedHotspot.image],
      category: selectedHotspot.category,
      brand: "Vroom Styles Atelier",
      stock: selectedHotspot.inStockCount,
      material: selectedHotspot.fabric,
      sizes: selectedHotspot.sizes,
      tag: "Atelier Drop",
      isPodEligible: true,
    };

    onAddToCart(productItem, selectedSize || undefined, undefined, 1);
    onShowToast(`Added "${selectedHotspot.name}" (${selectedSize}) to Atelier Bag`);
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !fittingDate) {
      onShowToast("Please fill in your name, contact phone, and preferred date.");
      return;
    }
    setIsBooked(true);
    onShowToast("Appointment received! Our atelier concierge will contact you via WhatsApp.");
  };

  return (
    <div className="lookbook-overlay" role="dialog" aria-modal="true" aria-label="Autumn / Winter Atelier Lookbook">
      <div className="lookbook-container">
        {/* Top Atelier Bar */}
        <header className="lookbook-header">
          <div className="lookbook-brand">
            <span className="lookbook-capsule-tag">Atelier Capsule 24/25</span>
            <h1 className="lookbook-title">Silhouette &amp; Texture Study</h1>
          </div>

          {/* View Mode Navigation */}
          <nav className="lookbook-nav" aria-label="Lookbook Sections">
            <button
              type="button"
              className={`lookbook-tab ${activeTab === "runway" ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab("runway");
                setSelectedHotspot(null);
              }}
            >
              Runway Looks ({LOOKBOOK_LOOKS.length})
            </button>
            <button
              type="button"
              className={`lookbook-tab ${activeTab === "archive" ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab("archive");
                setSelectedHotspot(null);
              }}
            >
              Textile Archive
            </button>
            <button
              type="button"
              className={`lookbook-tab ${activeTab === "studio" ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab("studio");
                setSelectedHotspot(null);
              }}
            >
              Private Studio Fitting
            </button>
          </nav>

          <div className="lookbook-header-actions">
            {onToggleCurrency && (
              <button
                type="button"
                className="lookbook-currency-toggle"
                onClick={onToggleCurrency}
                title="Switch Currency"
              >
                {currency === "NGN" ? "🇳🇬 NGN (₦)" : "🇺🇸 USD ($)"}
              </button>
            )}
            <button
              type="button"
              className="lookbook-close-btn"
              onClick={onClose}
              aria-label="Close lookbook"
              title="Close lookbook (ESC)"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Tab 1: Interactive Runway Looks */}
        {activeTab === "runway" && (
          <div className="lookbook-body">
            {/* Left: Interactive Canvas with Pulse Pins */}
            <div className="lookbook-stage">
              <div className="lookbook-viewport">
                <img
                  src={currentLook.editorialImage}
                  alt={`${currentLook.title} - ${currentLook.subtitle}`}
                  className="lookbook-image"
                  loading="eager"
                />

                {/* Hotspot Pulse Pins */}
                {currentLook.hotspots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    className={`lookbook-pin ${selectedHotspot?.id === spot.id ? "is-selected" : ""}`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    onClick={() => handleHotspotClick(spot)}
                    onMouseEnter={() => setHoveredHotspot(spot)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    aria-label={`Inspect ${spot.name}`}
                    title={`Click to inspect: ${spot.name}`}
                  >
                    <span className="pin-pulse" aria-hidden="true" />
                    <span className="pin-dot" aria-hidden="true" />
                    <span className="pin-label">{spot.name}</span>
                  </button>
                ))}

                {/* Floating Tooltip when hovering over a pin */}
                {hoveredHotspot && (
                  <div
                    className="lookbook-hover-card"
                    style={{
                      left: `${Math.min(Math.max(hoveredHotspot.x, 20), 80)}%`,
                      top: `${hoveredHotspot.y > 60 ? hoveredHotspot.y - 12 : hoveredHotspot.y + 8}%`,
                    }}
                  >
                    <span className="hover-kicker">{hoveredHotspot.category}</span>
                    <strong className="hover-title">{hoveredHotspot.name}</strong>
                    <span className="hover-price">
                      {formatPrice(currency === "USD" ? hoveredHotspot.priceUSD * 1500 : hoveredHotspot.priceNGN)}
                    </span>
                    <span className="hover-hint">Click to inspect silhouette &rarr;</span>
                  </div>
                )}
              </div>

              {/* Lookbook Pagination Controls */}
              <div className="lookbook-controls">
                <button
                  type="button"
                  className="lookbook-control-btn"
                  onClick={handlePrevLook}
                  title="Previous look"
                >
                  &larr; Previous Look
                </button>

                <div className="lookbook-dots">
                  {LOOKBOOK_LOOKS.map((look, idx) => (
                    <button
                      key={look.id}
                      type="button"
                      className={`lookbook-dot ${idx === currentLookIndex ? "is-active" : ""}`}
                      onClick={() => {
                        setSelectedHotspot(null);
                        setCurrentLookIndex(idx);
                      }}
                      aria-label={`Jump to Look ${look.lookNumber}`}
                    >
                      <span>{look.lookNumber}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="lookbook-control-btn"
                  onClick={handleNextLook}
                  title="Next look"
                >
                  Next Look &rarr;
                </button>
              </div>
            </div>

            {/* Right: Look Meta & Garment Rail or Slide-Out Fitting Drawer */}
            <aside className="lookbook-sidebar">
              {selectedHotspot ? (
                /* Slide-Out Atelier Fitting Drawer */
                <div className="fitting-drawer" data-reveal>
                  <div className="fitting-drawer-header">
                    <span className="drawer-kicker">Atelier Fitting Drawer</span>
                    <button
                      type="button"
                      className="drawer-back-btn"
                      onClick={() => setSelectedHotspot(null)}
                      title="Back to look overview"
                    >
                      &larr; Back to Look
                    </button>
                  </div>

                  <div className="drawer-hero-photo">
                    <img src={selectedHotspot.image} alt={selectedHotspot.name} />
                    <span className="drawer-badge">{selectedHotspot.category}</span>
                  </div>

                  <div className="drawer-body">
                    <h2 className="drawer-title">{selectedHotspot.name}</h2>
                    <div className="drawer-price">
                      {formatPrice(
                        currency === "USD" ? selectedHotspot.priceUSD * 1500 : selectedHotspot.priceNGN
                      )}
                    </div>

                    <p className="drawer-desc">{selectedHotspot.description}</p>

                    {/* Technical Fabric Specs */}
                    <dl className="drawer-specs">
                      <div>
                        <dt>Fabric</dt>
                        <dd>{selectedHotspot.fabric}</dd>
                      </div>
                      {selectedHotspot.gsm && (
                        <div>
                          <dt>Weight</dt>
                          <dd>{selectedHotspot.gsm}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Origin</dt>
                        <dd>{selectedHotspot.origin}</dd>
                      </div>
                      <div>
                        <dt>Silhoutte</dt>
                        <dd>{selectedHotspot.fit}</dd>
                      </div>
                    </dl>

                    {/* Size Selector */}
                    {selectedHotspot.sizes.length > 0 && (
                      <div className="drawer-sizes">
                        <label className="size-label">
                          <span>Select Size:</span>
                          <strong>{selectedSize || "Select a size"}</strong>
                        </label>
                        <div className="size-chips">
                          {selectedHotspot.sizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              className={`size-chip ${selectedSize === sz ? "is-selected" : ""}`}
                              onClick={() => setSelectedSize(sz)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stock status */}
                    <div className="drawer-stock">
                      <span className="stock-dot" />
                      <span>{selectedHotspot.inStockCount} units remaining in this limited atelier drop</span>
                    </div>

                    {/* Actions */}
                    <div className="drawer-actions">
                      <button
                        type="button"
                        className="drawer-add-btn"
                        onClick={handleAddGarmentToBag}
                      >
                        Add to Atelier Bag &bull;{" "}
                        {formatPrice(
                          currency === "USD" ? selectedHotspot.priceUSD * 1500 : selectedHotspot.priceNGN
                        )}
                      </button>

                      {onOpenCart && (
                        <button
                          type="button"
                          className="drawer-view-cart-btn"
                          onClick={() => {
                            onClose();
                            onOpenCart();
                          }}
                        >
                          View Bag &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Look Overview */
                <div className="look-overview">
                  <div className="look-meta-header">
                    <span className="look-meta-index">Look {currentLook.lookNumber} / 06</span>
                    <span className="look-meta-location">{currentLook.location}</span>
                  </div>

                  <h2 className="look-meta-title">{currentLook.title}</h2>
                  <p className="look-meta-subtitle">{currentLook.subtitle}</p>

                  <blockquote className="look-meta-quote">
                    &ldquo;{currentLook.quote}&rdquo;
                  </blockquote>

                  {/* Macro Texture Study */}
                  <div className="look-texture-study">
                    <span className="texture-label">Macro Textile Focus</span>
                    <div className="texture-frame">
                      <img src={currentLook.macroTextureImage} alt="Fabric texture" />
                    </div>
                    <p className="texture-caption">{currentLook.textureCaption}</p>
                  </div>

                  {/* Hotspot quick list */}
                  <div className="look-garments-list">
                    <span className="garments-label">Pieces in this Look:</span>
                    <div className="garments-items">
                      {currentLook.hotspots.map((spot) => (
                        <button
                          key={spot.id}
                          type="button"
                          className="garment-row"
                          onClick={() => handleHotspotClick(spot)}
                        >
                          <span className="garment-row-name">{spot.name}</span>
                          <span className="garment-row-price">
                            {formatPrice(currency === "USD" ? spot.priceUSD * 1500 : spot.priceNGN)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Tab 2: Textile Archive */}
        {activeTab === "archive" && (
          <div className="archive-view">
            <div className="archive-header">
              <span className="archive-kicker">Materiality Manifesto</span>
              <h2 className="archive-title">Bespoke Mill Sourcing &amp; GSM Weights</h2>
              <p className="archive-lede">
                Every fabric is sourced directly from heritage family-owned mills in Biella, Como, and Tuscany.
                We select raw fibres by weight and drape rather than seasonal trends.
              </p>
            </div>

            <div className="archive-grid">
              {TEXTILE_ARCHIVE.map((mat) => (
                <article key={mat.name} className="archive-card">
                  <div className="archive-card-image">
                    <img src={mat.macroImage} alt={mat.name} />
                    <span className="archive-card-gsm">{mat.gsm}</span>
                  </div>
                  <div className="archive-card-body">
                    <span className="archive-card-origin">{mat.origin} &bull; {mat.weave}</span>
                    <h3 className="archive-card-title">{mat.name}</h3>
                    <p className="archive-card-desc">{mat.description}</p>
                    <div className="archive-card-cert">
                      <span className="cert-badge">{mat.certification}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Private Studio Fitting Appointment */}
        {activeTab === "studio" && (
          <div className="studio-view">
            <div className="studio-container">
              <div className="studio-header">
                <span className="studio-kicker">Flagship Atelier Consultation</span>
                <h2 className="studio-title">Private Studio Fitting in Lagos</h2>
                <p className="studio-lede">
                  Experience bespoke silhouette fittings, personal adjustments, and archive viewings at our
                  Victoria Island, Lagos flagship studio with our master pattern cutter.
                </p>
              </div>

              {isBooked ? (
                <div className="studio-success-box">
                  <span className="success-icon">&check;</span>
                  <h3>Fitting Consultation Requested</h3>
                  <p>
                    Thank you, <strong>{clientName}</strong>. Our head atelier concierge will contact you
                    at <strong>{clientPhone}</strong> via WhatsApp within 2 hours to confirm your private salon appointment.
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setIsBooked(false);
                      setClientName("");
                      setClientPhone("");
                      setFittingDate("");
                    }}
                  >
                    Schedule Another Consultation
                  </button>
                </div>
              ) : (
                <form className="studio-form" onSubmit={handleAppointmentSubmit}>
                  <div className="form-group">
                    <label htmlFor="client-name">Your Full Name</label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g. Chimamanda Adeleke"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="client-phone">Phone / WhatsApp Number</label>
                    <input
                      id="client-phone"
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fitting-date">Preferred Fitting Date</label>
                    <input
                      id="fitting-date"
                      type="date"
                      required
                      value={fittingDate}
                      onChange={(e) => setFittingDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fitting-notes">Pieces of Interest / Alteration Notes</label>
                    <textarea
                      id="fitting-notes"
                      rows={3}
                      placeholder="e.g. Double-Faced Trench Coat in Size M, sleeve shortening, silk evening gown..."
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      Confirm Studio Consultation
                    </button>
                    <span className="concierge-direct">
                      Need immediate fitting? WhatsApp: <strong>+234 913 083 1439</strong>
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
