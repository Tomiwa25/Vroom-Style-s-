import React, { useState } from "react";
import { useAdminCatalog, type GenerationJob } from "../hooks/useAdminCatalog";
import { initialProducts } from "../data/products";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amountInNGN: number) => string;
}

const MARKETPLACE_CATEGORIES = [
  "Electronics",
  "Phones and Tablets",
  "Computers and Accessories",
  "Fashion",
  "Shoes and Bags",
  "Beauty and Personal Care",
  "Home and Kitchen",
  "Furniture",
  "Sports and Fitness",
  "Automotive",
  "Gaming",
  "Books and Stationery",
  "Baby Products",
  "Toys",
  "Health and Wellness",
  "Groceries",
  "Home Appliances",
  "Office Equipment",
  "Jewelry and Watches",
  "Tools and Home Improvement",
];

const PRESET_COUNTS = [100, 1000, 5000, 10000, 20000, 50000];

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object") {
    const maybeAxios = err as { response?: { data?: { message?: string } }; message?: string };
    if (maybeAxios.response?.data?.message) {
      return maybeAxios.response.data.message;
    }
    if (maybeAxios.message) {
      return maybeAxios.message;
    }
  }
  return "An unexpected error occurred.";
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  formatPrice,
}) => {
  const {
    stats,
    adminProducts,
    updateStock,
    syncInventory,
    isSyncingInventory,
    syncStatus,
    generationJobs,
    generateCatalog,
    isGenerating,
    deleteJobProducts,
    isDeletingJob,
    cleanAllDemoProducts,
    isCleaningDemo,
  } = useAdminCatalog();

  const [activeTab, setActiveTab] = useState<"operations" | "generator">("operations");

  // Generator State
  const [selectedCount, setSelectedCount] = useState<number>(1000);
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
  const [customCountValue, setCustomCountValue] = useState<string>("2500");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(MARKETPLACE_CATEGORIES);
  const [includeVariations, setIncludeVariations] = useState<boolean>(true);
  const [seedValue, setSeedValue] = useState<string>("");
  const [batchSize, setBatchSize] = useState<number>(500);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  if (!isOpen) return null;

  const currentStats = stats || {
    products: 248,
    orders: 36,
    revenue: 1850000,
    conversionRate: 3.4,
  };

  const productsToManage =
    adminProducts && adminProducts.length > 0 ? adminProducts : initialProducts.slice(0, 6);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(MARKETPLACE_CATEGORIES);
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleStartGeneration = async () => {
    const finalCount = isCustomCount ? parseInt(customCountValue, 10) || 100 : selectedCount;

    if (finalCount <= 0) {
      setActionNotice({ type: "error", text: "Please enter a valid count greater than 0." });
      return;
    }

    if (selectedCategories.length === 0) {
      setActionNotice({ type: "error", text: "Please select at least one target category." });
      return;
    }

    try {
      setActionNotice({ type: "info", text: `Triggering generation pipeline for ${finalCount.toLocaleString()} products...` });

      const parsedSeed = seedValue.trim() ? parseInt(seedValue.trim(), 10) : undefined;

      const result = await generateCatalog({
        count: finalCount,
        categories: selectedCategories,
        seed: isNaN(parsedSeed as number) ? undefined : parsedSeed,
        batchSize,
        includeVariations,
      });

      if (result?.totalGenerated) {
        setActionNotice({
          type: "success",
          text: `Successfully generated ${result.totalGenerated.toLocaleString()} products! Duration: ${(result.durationMs / 1000).toFixed(2)}s.`,
        });
      } else {
        setActionNotice({
          type: "info",
          text: `High-volume generation job started in background (Job ID: ${result?.jobId || "Active"}). Polling status...`,
        });
      }
    } catch (err: unknown) {
      setActionNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    }
  };

  const handleCleanAllDemo = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clean all demo products?\n\nReal seller listings (1P/3P) and products associated with customer orders will be strictly preserved."
    );
    if (!confirmed) return;

    try {
      setActionNotice({ type: "info", text: "Safely cleaning demo products from database..." });
      const result = await cleanAllDemoProducts();
      setActionNotice({
        type: "success",
        text: `Cleaned ${result?.deletedCount || 0} demo products (${result?.preservedCount || 0} preserved with order history).`,
      });
    } catch (err: unknown) {
      setActionNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = window.confirm(
      `Delete all demo products generated by Job ${jobId.slice(0, 8)}? Items with customer orders will remain protected.`
    );
    if (!confirmed) return;

    try {
      const result = await deleteJobProducts(jobId);
      setActionNotice({
        type: "success",
        text: `Job products removed: ${result?.deletedCount || 0} deleted, ${result?.preservedCount || 0} preserved.`,
      });
    } catch (err: unknown) {
      setActionNotice({
        type: "error",
        text: getErrorMessage(err),
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card admin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="admin-header-title">
            <span className="kicker">Retail Intelligence & Catalog Operations</span>
            <h3>Atelier Marketplace Portal</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "operations" ? "active" : ""}`}
            onClick={() => setActiveTab("operations")}
          >
            Overview & Inventory
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "generator" ? "active" : ""}`}
            onClick={() => setActiveTab("generator")}
          >
            Catalog Generator & Seeder
          </button>
        </div>

        {actionNotice && (
          <div
            style={{
              padding: "10px 20px",
              fontSize: "0.85rem",
              background:
                actionNotice.type === "success"
                  ? "#ecfdf5"
                  : actionNotice.type === "error"
                  ? "#fef2f2"
                  : "#eff6ff",
              color:
                actionNotice.type === "success"
                  ? "#065f46"
                  : actionNotice.type === "error"
                  ? "#991b1b"
                  : "#1e40af",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            {actionNotice.text}
          </div>
        )}

        {/* TAB 1: OPERATIONS & INVENTORY */}
        {activeTab === "operations" && (
          <>
            <div className="admin-system-status">
              <span className="status-dot online"></span>
              <span>
                API Status:{" "}
                <strong>
                  {syncStatus ? "Synced with Backend Cache" : "Connected (PostgreSQL / In-Memory)"}
                </strong>
              </span>
            </div>

            <div className="admin-stats-grid">
              <div className="stat-card">
                <span className="stat-label">Gross Revenue</span>
                <strong className="stat-val">{formatPrice(currentStats.revenue)}</strong>
                <span className="stat-trend positive">+18.4% vs last week</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Completed Orders</span>
                <strong className="stat-val">{currentStats.orders}</strong>
                <span className="stat-trend positive">94% fulfillment rate</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Active Catalog Items</span>
                <strong className="stat-val">{currentStats.products}</strong>
                <span className="stat-trend neutral">All marketplace drops</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Store Conversion</span>
                <strong className="stat-val">{currentStats.conversionRate}%</strong>
                <span className="stat-trend positive">+0.8% industry leading</span>
              </div>
            </div>

            <div className="admin-quick-links">
              <h4>Atelier Quick Actions</h4>
              <div className="admin-action-row" style={{ borderTop: "none", padding: 0 }}>
                <button
                  className="secondary-button"
                  disabled={isSyncingInventory}
                  onClick={() => syncInventory()}
                >
                  {isSyncingInventory ? "Automating Batch Re-sync..." : "Sync Database Inventory"}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => alert("Simulating Paystack webhook reconciliation...")}
                >
                  Verify Paystack Webhooks
                </button>
                <button
                  className="primary-button"
                  onClick={() =>
                    window.open("https://vroom-styles.onrender.com/api/health", "_blank")
                  }
                >
                  Open API Health Endpoint ↗
                </button>
              </div>
            </div>

            <div className="admin-stock-manager">
              <div className="stock-manager-header">
                <h4>Live Stock Management (Optimistic Updates)</h4>
                <span className="stock-manager-hint">
                  Updates storefront instantly with TanStack Query cache invalidation
                </span>
              </div>

              <div className="admin-stock-list">
                {productsToManage.map((prod) => (
                  <div key={prod.id} className="admin-stock-row">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="admin-stock-thumb"
                    />
                    <div className="admin-stock-info">
                      <strong>{prod.name}</strong>
                      <span className="admin-stock-cat">
                        {prod.category} • {formatPrice(prod.price)}
                      </span>
                    </div>

                    <div className="admin-stock-stepper">
                      <span className="admin-stock-counter">
                        Stock: <strong>{prod.stock}</strong>
                      </span>
                      <div className="stepper-buttons">
                        <button
                          className="stepper-btn"
                          disabled={prod.stock <= 0}
                          onClick={() =>
                            updateStock({
                              productId: prod.id,
                              stock: Math.max(0, prod.stock - 1),
                            })
                          }
                          title="Decrease stock"
                        >
                          -
                        </button>
                        <button
                          className="stepper-btn"
                          onClick={() =>
                            updateStock({
                              productId: prod.id,
                              stock: prod.stock + 5,
                            })
                          }
                          title="Restock (+5 units)"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CATALOG GENERATOR & SEEDER */}
        {activeTab === "generator" && (
          <div className="generator-section">
            <div>
              <span className="generator-kicker">High-Scale Seeder</span>
              <h3 className="generator-title">Product Catalog Generation Engine</h3>
              <p className="generator-desc">
                Instantly populate your marketplace with thousands of schema-compliant products across 20 categories.
                Includes verified multi-angle imagery, localized NGN pricing, unique SKUs, warranty tags, and seller attribution.
              </p>
            </div>

            {/* Volume Presets */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Target Product Volume
              </label>
              <div className="generator-presets">
                {PRESET_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`generator-preset-btn ${!isCustomCount && selectedCount === cnt ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCount(cnt);
                      setIsCustomCount(false);
                    }}
                  >
                    {cnt.toLocaleString()} Products
                  </button>
                ))}
                <button
                  type="button"
                  className={`generator-preset-btn ${isCustomCount ? "active" : ""}`}
                  onClick={() => setIsCustomCount(true)}
                >
                  Custom Count:
                </button>
                {isCustomCount && (
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={customCountValue}
                    onChange={(e) => setCustomCountValue(e.target.value)}
                    className="generator-custom-input"
                    placeholder="e.g. 2500"
                  />
                )}
              </div>
            </div>

            {/* Category Selectors */}
            <div>
              <div className="generator-cat-header">
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Target Categories ({selectedCategories.length}/{MARKETPLACE_CATEGORIES.length})
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    style={{ background: "none", border: "none", color: "var(--ink)", textDecoration: "underline", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCategories}
                    style={{ background: "none", border: "none", color: "var(--graphite-soft)", textDecoration: "underline", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="generator-cat-grid">
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <label key={cat} className="generator-cat-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Generation Options */}
            <div className="generator-options-row">
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={includeVariations}
                  onChange={(e) => setIncludeVariations(e.target.checked)}
                />
                <span>Include size & color variations</span>
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                <span>Seed (optional):</span>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={seedValue}
                  onChange={(e) => setSeedValue(e.target.value)}
                  style={{ width: 80, padding: "3px 6px", border: "1px solid var(--hairline)" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                <span>Batch Size:</span>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  style={{ padding: "3px 6px", border: "1px solid var(--hairline)", background: "var(--bg)" }}
                >
                  <option value={100}>100 items / batch</option>
                  <option value={500}>500 items / batch</option>
                  <option value={1000}>1,000 items / batch</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="generator-actions">
              <button
                className="primary-button"
                disabled={isGenerating}
                onClick={handleStartGeneration}
                style={{ padding: "10px 24px", minWidth: 200 }}
              >
                {isGenerating ? "⚡ Generating Pipeline Running..." : "🚀 Generate Marketplace Catalog"}
              </button>

              <button
                className="secondary-button"
                disabled={isCleaningDemo || isGenerating}
                onClick={handleCleanAllDemo}
                style={{ color: "#991b1b", borderColor: "#fca5a5" }}
                title="Cleans up all demonstration products while safeguarding legitimate seller items and customer orders"
              >
                {isCleaningDemo ? "Cleaning Demo Items..." : "🧹 Clean All Demo Products"}
              </button>
            </div>

            {/* Jobs History */}
            <div className="generator-jobs-wrap">
              <h4 style={{ fontSize: "0.9rem", margin: "0 0 8px 0" }}>Recent Generation Jobs</h4>
              {generationJobs && generationJobs.length > 0 ? (
                <table className="generator-jobs-table">
                  <thead>
                    <tr>
                      <th className="generator-jobs-th">Job ID</th>
                      <th className="generator-jobs-th">Status</th>
                      <th className="generator-jobs-th">Requested</th>
                      <th className="generator-jobs-th">Generated</th>
                      <th className="generator-jobs-th">Created</th>
                      <th className="generator-jobs-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generationJobs.map((job: GenerationJob) => (
                      <tr key={job.id}>
                        <td className="generator-jobs-td" style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {job.id.slice(0, 8)}...
                        </td>
                        <td className="generator-jobs-td">
                          <span className={`job-badge ${job.status.toLowerCase()}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="generator-jobs-td">{job.totalRequested.toLocaleString()}</td>
                        <td className="generator-jobs-td">{job.totalGenerated.toLocaleString()}</td>
                        <td className="generator-jobs-td" style={{ fontSize: "0.75rem", color: "var(--graphite-soft)" }}>
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="generator-jobs-td">
                          {job.status !== "DELETED" && (
                            <button
                              type="button"
                              disabled={isDeletingJob}
                              onClick={() => handleDeleteJob(job.id)}
                              style={{
                                background: "none",
                                border: "1px solid var(--hairline)",
                                padding: "2px 8px",
                                fontSize: "0.7rem",
                                cursor: "pointer",
                              }}
                            >
                              Delete Demo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "var(--graphite-soft)" }}>No generation jobs recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
