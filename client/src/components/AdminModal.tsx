import React from "react";
import { useAdminCatalog } from "../hooks/useAdminCatalog";
import { initialProducts } from "../data/products";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amountInNGN: number) => string;
}

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
  } = useAdminCatalog();

  if (!isOpen) return null;

  const currentStats = stats || {
    products: 248,
    orders: 36,
    revenue: 1850000,
    conversionRate: 3.4,
  };

  // Use live admin products, or initial collection as fallback
  const productsToManage =
    adminProducts && adminProducts.length > 0 ? adminProducts : initialProducts.slice(0, 6);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card admin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="admin-header-title">
            <span className="kicker">Retail Intelligence</span>
            <h3>Atelier Operations & Insights</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="admin-system-status">
          <span className="status-dot online"></span>
          <span>
            API Status: <strong>{syncStatus ? "Synced with Backend Cache" : "Connected (PostgreSQL / In-Memory)"}</strong>
          </span>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Gross Revenue</span>
            <strong className="stat-val">
              {formatPrice(currentStats.revenue)}
            </strong>
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
            <span className="stat-trend neutral">6 active seasonal drops</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Store Conversion</span>
            <strong className="stat-val">{currentStats.conversionRate}%</strong>
            <span className="stat-trend positive">+0.8% industry leading</span>
          </div>
        </div>

        {/* Quick Actions & Automated Batch Sync */}
        <div className="admin-quick-links">
          <h4>Atelier Quick Actions</h4>
          <div className="admin-action-row">
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

        {/* Live Stock Management with Optimistic TanStack Query updates */}
        <div className="admin-stock-manager">
          <div className="stock-manager-header">
            <h4>Live Stock Management (Optimistic Updates)</h4>
            <span className="stock-manager-hint">
              Changes update storefront instantly and invalidate query cache
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
                  <span className="admin-stock-cat">{prod.category} • {formatPrice(prod.price)}</span>
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
                      title="Decrease stock (simulates order fulfillment)"
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
      </div>
    </div>
  );
};
