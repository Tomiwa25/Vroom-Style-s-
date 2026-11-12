import React, { useState } from "react";
import {
  carsProducts,
  fridgesProducts,
  microwavesProducts,
  kitchenUtensilsProducts,
  furnitureProducts,
  tvsProducts,
  laptopsProducts,
  monitorsProducts,
} from "../data/products";

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

const CATEGORY_TABS = [
  { id: "Cars", label: "🚗 Cars (30)", items: carsProducts },
  { id: "Fridges", label: "🧊 Fridges (30)", items: fridgesProducts },
  { id: "Microwaves", label: "📻 Microwaves (30)", items: microwavesProducts },
  { id: "Kitchen Utensils", label: "🍳 Kitchen Utensils (30)", items: kitchenUtensilsProducts },
  { id: "Furniture", label: "🛋️ Furniture (30)", items: furnitureProducts },
  { id: "TVs", label: "📺 Smart TVs (30)", items: tvsProducts },
  { id: "Laptops", label: "💻 Laptops (30)", items: laptopsProducts },
  { id: "Monitors", label: "🖥️ Monitors (30)", items: monitorsProducts },
];

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  isOpen,
  onClose,
  initialCategory = "Cars",
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const currentTab = CATEGORY_TABS.find((t) => t.id === selectedCat) || CATEGORY_TABS[0];
  const filteredItems = currentTab.items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.imagePrompt && item.imagePrompt.toLowerCase().includes(q)) ||
      (item.brand && item.brand.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    const allPrompts = currentTab.items
      .map((item, idx) => `### ${idx + 1}. ${item.name} (${item.brand})\n**Price**: ₦${item.price.toLocaleString()}\n**AI Image Prompt**:\n${item.imagePrompt || item.description}\n`)
      .join("\n---\n\n");
    navigator.clipboard.writeText(allPrompts);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  return (
    <div className="vroom-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="prompt-studio-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1100px",
          width: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#121417",
          color: "#E2E8F0",
          borderRadius: "16px",
          border: "1px solid #2D3748",
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #2D3748",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #1A202C 0%, #171923 100%)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🎨</span>
              <h2 style={{ margin: 0, fontSize: "1.35rem", color: "#F7FAFC", fontWeight: 700 }}>
                AI Image Prompt Studio
              </h2>
              <span
                style={{
                  background: "#3182CE",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                240 Prompts Generated
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#A0AEC0" }}>
              Photorealistic e-commerce prompts tailored for Midjourney v6, DALL-E 3, and Imagen with lighting, camera rigs, and showroom reflections.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#A0AEC0",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px 10px",
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 24px",
            background: "#0F1115",
            borderBottom: "1px solid #2D3748",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCat(tab.id);
                setSearchTerm("");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: selectedCat === tab.id ? "1px solid #4299E1" : "1px solid #2D3748",
                background: selectedCat === tab.id ? "#2B6CB0" : "#1A202C",
                color: selectedCat === tab.id ? "#FFFFFF" : "#CBD5E0",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div
          style={{
            padding: "12px 24px",
            background: "#161922",
            borderBottom: "1px solid #2D3748",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
            <span style={{ color: "#718096" }}>🔍</span>
            <input
              type="text"
              placeholder={`Search within ${currentTab.id}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "#0F1115",
                border: "1px solid #2D3748",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#E2E8F0",
                fontSize: "13px",
                width: "100%",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#A0AEC0" }}>
              Showing {filteredItems.length} of {currentTab.items.length} items
            </span>
            <button
              onClick={handleCopyAll}
              style={{
                background: copiedAll ? "#38A169" : "#2B6CB0",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {copiedAll ? "✓ Copied All 30 Prompts!" : `📋 Copy All 30 ${currentTab.id} Prompts`}
            </button>
          </div>
        </div>

        {/* Prompts Grid */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredItems.map((product, idx) => (
            <div
              key={product.id}
              style={{
                background: "#1A202C",
                borderRadius: "12px",
                border: "1px solid #2D3748",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "80px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #4A5568",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#63B3ED", textTransform: "uppercase" }}>
                      #{idx + 1} • {product.brand || product.category}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#68D391" }}>
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                  <h4
                    style={{
                      margin: "2px 0 0",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#F7FAFC",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                </div>
              </div>

              {/* Prompt Box */}
              <div
                style={{
                  background: "#0F1115",
                  border: "1px solid #2D3748",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  color: "#CBD5E0",
                  fontFamily: "monospace",
                  position: "relative",
                }}
              >
                <div style={{ color: "#718096", fontSize: "10px", marginBottom: "4px", textTransform: "uppercase", fontWeight: 700 }}>
                  Prompt / Image Generation Directive:
                </div>
                {product.imagePrompt || product.description}
              </div>

              {/* Specs Pills if any */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        background: "#2D3748",
                        color: "#E2E8F0",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      <strong>{k}:</strong> {v}
                    </span>
                  ))}
                </div>
              )}

              {/* Action */}
              <button
                onClick={() => handleCopy(product.imagePrompt || product.description, product.id)}
                style={{
                  alignSelf: "flex-end",
                  background: copiedId === product.id ? "#38A169" : "#2D3748",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "background 0.15s ease",
                }}
              >
                {copiedId === product.id ? "✓ Copied!" : "📋 Copy Prompt"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #2D3748",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#0F1115",
            fontSize: "12px",
            color: "#A0AEC0",
          }}
        >
          <span>
            Tip: Paste these prompts into Midjourney with <code style={{ color: "#63B3ED" }}>--ar 16:9 --v 6.0 --style raw</code> or into Imagen/DALL-E 3 directly.
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#4A5568",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
