import React, { useState } from "react";
import { useCustomerOrders, useOrderTracking } from "../hooks/useOrderTracking";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amountInNGN: number) => string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  formatPrice,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  const { orders } = useCustomerOrders(isOpen);
  const activeId = selectedOrderId || (orders.length > 0 ? orders[0].id : "");

  const {
    tracking,
    isLoading: isTrackingLoading,
    isError,
    errorMessage,
    refetch,
  } = useOrderTracking(activeId);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedOrderId(searchInput.trim());
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card tracking-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="admin-header-title">
            <span className="kicker">Atelier Concierge</span>
            <h3>Order Fulfillment & Live Tracking</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close tracking modal"
          >
            ✕
          </button>
        </div>

        {/* Recent Orders Quick-Picker */}
        {orders && orders.length > 0 && (
          <div className="tracking-quick-orders">
            <span className="tracking-section-label">Your Recent Orders:</span>
            <div className="tracking-orders-pills">
              {orders.map((o) => (
                <button
                  key={o.id}
                  className={`order-pill ${activeId === o.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    setSearchInput("");
                  }}
                >
                  <span className="pill-id">#{o.id.slice(0, 8)}</span>
                  <span className="pill-total">{formatPrice(Number(o.total))}</span>
                  <span className={`pill-status status-${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order ID Search Form */}
        <form onSubmit={handleSearchSubmit} className="tracking-search-bar">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. uuid or reference)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="tracking-input"
          />
          <button type="submit" className="primary-button tracking-search-btn">
            Track Order
          </button>
        </form>

        {/* Tracking Content */}
        {isTrackingLoading ? (
          <div className="tracking-loading-state">
            <div className="tracking-spinner"></div>
            <p>Retrieving real-time dispatch telemetrics...</p>
          </div>
        ) : isError ? (
          <div className="tracking-error-notice">
            <span className="error-icon">⚠</span>
            <p>{errorMessage || "Order not found. Please verify the ID or log into the account used during checkout."}</p>
            <button className="secondary-button" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        ) : tracking ? (
          <div className="tracking-results-wrap">
            {/* Delivery Alert Banner when out for delivery */}
            {(tracking.status === "SHIPPED" || tracking.status === "DELIVERED") && (
              <div className="delivery-alert-banner">
                <span className="alert-badge">⚡ Real-time Notification</span>
                <strong>Order is In Final Delivery Transit</strong>
                <p>
                  An arrival email has been activated and dispatched to your email with courier contact details.
                </p>
              </div>
            )}

            {/* Order Overview Header */}
            <div className="tracking-meta-header">
              <div>
                <span className="tracking-id-label">Order Reference</span>
                <strong className="tracking-id-value">#{tracking.id}</strong>
              </div>
              <div className="tracking-meta-right">
                <span className={`tracking-status-badge status-${tracking.status.toLowerCase()}`}>
                  ● {tracking.status}
                </span>
                <span className="tracking-carrier">{tracking.carrier}</span>
              </div>
            </div>

            {/* Visual Milestones Timeline */}
            <div className="milestones-timeline">
              {tracking.milestones.map((m, idx) => {
                const isStepCompleted = m.completed;
                const isStepCurrent = m.current;

                return (
                  <div
                    key={m.key}
                    className={`milestone-step ${
                      isStepCompleted ? "completed" : ""
                    } ${isStepCurrent ? "current" : ""}`}
                  >
                    <div className="milestone-indicator-col">
                      <div className="milestone-node">
                        {isStepCompleted ? "✓" : idx + 1}
                      </div>
                      {idx < tracking.milestones.length - 1 && (
                        <div
                          className={`milestone-connector ${
                            isStepCompleted && !isStepCurrent ? "filled" : ""
                          }`}
                        />
                      )}
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>{m.title}</strong>
                        {isStepCurrent && (
                          <span className="milestone-live-pill">Active Step</span>
                        )}
                      </div>
                      <p className="milestone-desc">{m.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ordered Items Mini List */}
            <div className="tracking-items-section">
              <span className="tracking-section-label">Artisan Items in Shipment:</span>
              <div className="tracking-items-grid">
                {tracking.items.map((item) => (
                  <div key={item.id} className="tracking-item-card">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="tracking-item-thumb"
                    />
                    <div className="tracking-item-info">
                      <strong>{item.productName}</strong>
                      <span>
                        Qty: {item.quantity} • {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Summary Footer */}
            <div className="tracking-footer-summary">
              <div className="summary-col">
                <span>Estimated Delivery:</span>
                <strong>{tracking.estimatedDelivery}</strong>
              </div>
              <div className="summary-col text-right">
                <span>Order Total:</span>
                <strong className="tracking-total-amount">
                  {formatPrice(tracking.total)}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="tracking-empty-state">
            <span className="empty-icon">📦</span>
            <h4>No Active Order Selected</h4>
            <p>
              Select one of your recent purchases above or enter your Order Reference ID to view live fulfillment milestones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
