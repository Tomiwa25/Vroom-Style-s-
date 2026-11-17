import React, { useState, useRef } from "react";
import type { Product } from "../types";

interface Hero3DShowcaseProps {
  featuredProduct: Product;
  onExploreCollection: () => void;
  onQuickView: (product: Product) => void;
}

const HERO_ANGLES = [
  {
    name: "Editorial Lookbook",
    icon: "✦",
    tag: "Motion & Drape",
    desc: "Styled in motion on model",
  },
  {
    name: "Studio Silhouette",
    icon: "📐",
    tag: "Architecture",
    desc: "Clean 3/4 studio angle",
  },
  {
    name: "Macro Craftsmanship",
    icon: "🔍",
    tag: "Texture",
    desc: "Silk & linen weave close-up",
  },
];

export const Hero3DShowcase: React.FC<Hero3DShowcaseProps> = ({
  featuredProduct,
  onExploreCollection,
  onQuickView,
}) => {
  const [activeAngle, setActiveAngle] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const images =
    featuredProduct.images && featuredProduct.images.length > 0
      ? featuredProduct.images
      : [featuredProduct.image];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare((g) => ({ ...g, opacity: 0 }));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || images.length <= 1) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 40) {
      const step = deltaX > 0 ? -1 : 1;
      setActiveAngle((prev) => (prev + step + images.length) % images.length);
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const currentAngleMeta = HERO_ANGLES[activeAngle] || HERO_ANGLES[0];
  const currentImg = images[activeAngle] || images[0];

  return (
    <section className="hero-motion-container">
      {/* Editorial Narrative Column */}
      <div className="hero-narrative">
        <div className="hero-pill-badge">
          <span className="pill-dot"></span>
          <span>ATELIER 2026 • 360° LUXURY MARKETPLACE</span>
        </div>

        <h1 className="hero-title">
          Style In <span className="title-highlight">Motion.</span>
        </h1>

        <p className="hero-description">
          Engineered for modern momentum. Every garment is crafted from organic silks,
          Mongolian cashmeres, and vegetable-tanned calfskin—explored through
          interactive 360° multi-angle digital fitting.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            className="hero-primary-btn"
            onClick={onExploreCollection}
          >
            <span>Explore Collection</span>
            <span className="btn-arrow">↓</span>
          </button>
          <button
            type="button"
            className="hero-secondary-btn"
            onClick={() => onQuickView(featuredProduct)}
          >
            <span>360° Interactive Tour</span>
            <span className="btn-icon">↺</span>
          </button>
        </div>

        {/* Live Metrics Trust Banner */}
        <div className="hero-metrics-bar">
          <div className="metric-box">
            <span className="metric-num">360°</span>
            <span className="metric-title">Triad View</span>
            <small>Editorial • Studio • Detail</small>
          </div>
          <div className="metric-box">
            <span className="metric-num">100%</span>
            <span className="metric-title">Pure Fabrics</span>
            <small>Mulberry Silk & Cashmere</small>
          </div>
          <div className="metric-box">
            <span className="metric-num">24h</span>
            <span className="metric-title">Fast Dispatch</span>
            <small>Inspected & Verified</small>
          </div>
        </div>
      </div>

      {/* 3D Interactive Stage Column */}
      <div className="hero-3d-stage-col">
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`hero-3d-card ${isDragging ? "dragging" : ""}`}
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          {/* Specular Glare */}
          <div
            className="hero-glare"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 65%)`,
            }}
          />

          {/* Main 3D Garment Image */}
          <div className="hero-image-viewport">
            <img
              src={currentImg}
              alt={`${featuredProduct.name} - ${currentAngleMeta.name}`}
              className="hero-interactive-img"
            />
          </div>

          {/* Floating 3D Badge (Top Left) */}
          <div className="hero-floating-badge top-left">
            <span className="badge-kicker">FEATURED DROP</span>
            <strong>{featuredProduct.name}</strong>
          </div>

          {/* Floating 3D Badge (Bottom Right) */}
          <div className="hero-floating-badge bottom-right">
            <div className="badge-triad-indicator">
              <span className="pulse-indicator"></span>
              <strong>{currentAngleMeta.name}</strong>
            </div>
            <p>{currentAngleMeta.desc}</p>
          </div>

          {/* 360 Scrub Hint */}
          <div className="hero-scrub-prompt">
            <span>⇄ Drag horizontally to spin 3D angle</span>
          </div>
        </div>

        {/* 3-Angle Quick Selector Controls */}
        <div className="hero-angle-selector">
          {images.slice(0, 3).map((img, idx) => {
            const angleMeta = HERO_ANGLES[idx] || HERO_ANGLES[0];
            const isSelected = activeAngle === idx;

            return (
              <button
                key={idx}
                type="button"
                className={`hero-angle-pill ${isSelected ? "selected" : ""}`}
                onClick={() => setActiveAngle(idx)}
              >
                <img src={img} alt={angleMeta.name} className="pill-thumb" />
                <div className="pill-copy">
                  <span className="pill-title">{angleMeta.name}</span>
                  <span className="pill-tag">{angleMeta.tag}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
