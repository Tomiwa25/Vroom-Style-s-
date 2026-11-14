import React, { useState, useRef, useEffect, useCallback } from "react";

interface Product360ViewerProps {
  images: string[];
  productName: string;
  category?: string;
  tag?: string;
  initialMode?: "triad" | "360";
}

const VIEW_LABELS = [
  { label: "Editorial Fit", icon: "👤", desc: "Styled lookbook drape on model" },
  { label: "Studio Silhouette", icon: "📐", desc: "Isolated 3/4 clean studio profile" },
  { label: "Craftsmanship Detail", icon: "🔍", desc: "Macro fabric weave & hardware" },
];

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  productName,
  category = "Luxury Apparel",
  tag,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const autoSpinInterval = useRef<number | null>(null);

  // Guarantee we always have safe images
  const safeImages = images && images.length > 0 ? images : ["/images/hero.jpg"];

  // Handle pointer drag to spin/rotate angles
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (isAutoSpinning) setIsAutoSpinning(false);
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
    const sensitivity = 35; // Pixels per angle step

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
      // Ignore if pointer capture already lost
    }
  };

  // Scroll wheel on viewer to scrub angles
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (safeImages.length <= 1) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) > 15) {
      const step = e.deltaY > 0 ? 1 : -1;
      setActiveIndex((prev) => (prev + step + safeImages.length) % safeImages.length);
    }
  };

  // Auto-spin toggle
  const toggleAutoSpin = useCallback(() => {
    setIsAutoSpinning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isAutoSpinning && safeImages.length > 1) {
      autoSpinInterval.current = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % safeImages.length);
      }, 1400);
    } else if (autoSpinInterval.current) {
      window.clearInterval(autoSpinInterval.current);
    }
    return () => {
      if (autoSpinInterval.current) window.clearInterval(autoSpinInterval.current);
    };
  }, [isAutoSpinning, safeImages.length]);

  const activeLabel = VIEW_LABELS[activeIndex] || {
    label: `Angle ${activeIndex + 1}`,
    icon: "✦",
    desc: "Alternative perspective",
  };

  return (
    <div className="product-360-container">
      {/* 3D Viewer Canvas Header */}
      <div className="viewer-top-bar">
        <div className="viewer-badge-group">
          <span className="viewer-category-tag">{category}</span>
          {tag && <span className="viewer-special-tag">{tag}</span>}
        </div>
        <div className="viewer-controls-group">
          <button
            type="button"
            className={`viewer-action-pill ${isAutoSpinning ? "active" : ""}`}
            onClick={toggleAutoSpin}
            title="Auto-rotate 360°"
          >
            <span>{isAutoSpinning ? "⏸ Pause Spin" : "▶ 360° Auto-Spin"}</span>
          </button>
          <button
            type="button"
            className={`viewer-action-pill ${isZoomed ? "active" : ""}`}
            onClick={() => setIsZoomed((z) => !z)}
            title="Inspect fabric texture up close"
          >
            <span>{isZoomed ? "🔍 Exit Zoom" : "🔎 2x Loupe"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
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
          alt={`${productName} - ${activeLabel.label}`}
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

        {/* Ambient 3D Rim Light Glare */}
        <div className="viewer-ambient-light" />

        {/* Overlay Interactive Prompt */}
        {!isZoomed && (
          <div className="viewer-drag-prompt">
            <span className="prompt-icon">⇄</span>
            <span>Drag or scroll to rotate 3D view</span>
          </div>
        )}

        {/* Active Angle Descriptor Pill */}
        <div className="viewer-angle-descriptor">
          <span className="descriptor-icon">{activeLabel.icon}</span>
          <div className="descriptor-copy">
            <strong>{activeLabel.label}</strong>
            <small>{activeLabel.desc}</small>
          </div>
        </div>
      </div>

      {/* 3-Angle Fashion Triad Navigation Strip */}
      <div className="viewer-triad-tabs">
        {safeImages.map((img, idx) => {
          const itemMeta = VIEW_LABELS[idx] || {
            label: `Angle ${idx + 1}`,
            icon: "✦",
            desc: "Custom Angle",
          };
          const isActive = activeIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              className={`triad-tab-card ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveIndex(idx);
                setIsAutoSpinning(false);
              }}
            >
              <div className="triad-thumb-wrap">
                <img src={img} alt={itemMeta.label} />
                {isActive && <span className="triad-active-indicator" />}
              </div>
              <div className="triad-text">
                <span className="triad-label-title">
                  {itemMeta.icon} {itemMeta.label}
                </span>
                <span className="triad-label-sub">{itemMeta.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
