import React, { useState, useEffect } from "react";
import api from "../services/api";

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
  const [stats, setStats] = useState({
    products: 248,
    orders: 36,
    revenue: 1850000,
    conversionRate: 3.4,
  });
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  useEffect(() => {
    if (!isOpen) return;

    const fetchAdminStats = async () => {
      try {
        const healthRes = await api.get("/health");
        setBackendStatus(healthRes.data?.message || "Connected");

        const statsRes = await api.get("/admin/stats");
        if (statsRes.data?.data) {
          setStats((prev) => ({
            ...prev,
            ...statsRes.data.data,
          }));
        }
      } catch {
        setBackendStatus("Running with Local Demo Cache");
      }
    };

    fetchAdminStats();
  }, [isOpen]);

  if (!isOpen) return null;

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
            API Status: <strong>{backendStatus}</strong>
          </span>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Gross Revenue</span>
            <strong className="stat-val">
              {formatPrice(stats.revenue)}
            </strong>
            <span className="stat-trend positive">+18.4% vs last week</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Completed Orders</span>
            <strong className="stat-val">{stats.orders}</strong>
            <span className="stat-trend positive">94% fulfillment rate</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Active Catalog Items</span>
            <strong className="stat-val">{stats.products}</strong>
            <span className="stat-trend neutral">6 active seasonal drops</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Store Conversion</span>
            <strong className="stat-val">{stats.conversionRate}%</strong>
            <span className="stat-trend positive">+0.8% industry leading</span>
          </div>
        </div>

        <div className="admin-quick-links">
          <h4>Atelier Quick Actions</h4>
          <div className="admin-action-row">
            <button
              className="secondary-button"
              onClick={() => alert("Syncing latest inventory with PostgreSQL...")}
            >
              Sync Database Inventory
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                alert("Simulating Paystack webhook reconciliation...")
              }
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
      </div>
    </div>
  );
};
