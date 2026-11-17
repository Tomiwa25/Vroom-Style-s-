import React, { useState, useRef, useCallback } from "react";

interface Product360ViewerProps {
  images: string[];
  productName: string;
  category?: string;
  tag?: string;
  initialMode?: "triad" | "360";
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
  category = "Luxury Apparel",
  tag,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  // Guarantee we always have safe images
  const safeImages = images && images.length > 0 ? images : ["/images/hero.jpg"];

  // Handle pointer drag to swipe angles
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isZoomed && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      return;
    }

    if (!isDragging || safeImages.length <= 1) return;
    const deltaX = e.clientX - startX.current;
    const sensitivity = 40; // Pixels per angle step

    if (Math.abs(deltaX) > sensitivity) {
      const step = deltaX > 0 ? -1 : 1;
      setActiveIndex((prev) => (prev + step + safeImages.length) % safeImages.length);
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (isZoomed || safeImages.length <= 1) return;
      if (Math.abs(e.deltaX) > 20) {
        const step = e.deltaX > 0 ? 1 : -1;
        setActiveIndex((prev) => (prev + step + safeImages.length) % safeImages.length);
      }
    },
    [isZoomed, safeImages.length]
  );

  return (
    <div className="product-360-container">
      {/* Clean Top Bar */}
      <div className="viewer-top-bar">
        <div className="viewer-badge-group">
          <span className="viewer-category-tag">{category}</span>
          {tag && <span className="viewer-special-tag">{tag}</span>}
        </div>
        <div className="viewer-controls-group">
          <button
            type="button"
            className={`viewer-action-pill ${isZoomed ? "active" : ""}`}
            onClick={() => setIsZoomed((z) => !z)}
            title={isZoomed ? "Exit zoom" : "Inspect fabric texture"}
          >
            <span>{isZoomed ? "Exit Zoom" : "🔎 2x Loupe"}</span>
          </button>
        </div>
      </div>

      {/* Main Photographic Stage (No intrusive text overlays) */}
      <div
        ref={containerRef}
        className={`viewer-stage ${isDragging ? "dragging" : ""} ${isZoomed ? "zoomed" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <img
          src={safeImages[activeIndex]}
          alt={`${productName} view ${activeIndex + 1}`}
          className="viewer-main-image"
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: "scale(2.2)",
                  cursor: "crosshair",
                }
              : undefined
          }
        />

        {/* Ambient Studio Rim Light */}
        <div className="viewer-ambient-light" />
      </div>

      {/* Clean Photo Thumbnail Strip (Clean minimalist image tiles, no redundant text) */}
      {safeImages.length > 1 && (
        <div className="viewer-triad-tabs clean-thumbs-strip">
          {safeImages.map((img, idx) => {
            const isActive = activeIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                className={`triad-tab-card clean-thumb-card ${isActive ? "active" : ""}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`View angle ${idx + 1}`}
              >
                <div className="triad-thumb-wrap">
                  <img src={img} alt="" />
                  {isActive && <span className="triad-active-indicator" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
