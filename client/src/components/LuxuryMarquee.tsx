import React from "react";

const MARQUEE_ITEMS = [
  "✦ 360° DIGITAL FITTING",
  "•",
  "MULBERRY SILKS & ORGANIC LINEN",
  "•",
  "GUARANTEED 3-VIEW FASHION TRIAD",
  "•",
  "24H EXPRESS NATIONWIDE DISPATCH",
  "•",
  "ZERO UNMATCHED SANDBOX IMAGES",
  "•",
  "MONGOLIAN GRADE-A CASHMERE",
  "•",
  "ENCRYPTED PAYSTACK CHECKOUT",
  "•",
  "BESPOKE ARCHITECTURAL SILHOUETTES",
  "•",
];

export const LuxuryMarquee: React.FC = () => {
  return (
    <div className="luxury-marquee-container" aria-hidden="true">
      <div className="marquee-track">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <span key={idx} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
