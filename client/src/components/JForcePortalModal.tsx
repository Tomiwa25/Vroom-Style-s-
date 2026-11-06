import React, { useState } from "react";
import type { JForceAgent, JForceCommissionRecord } from "../types";

interface JForcePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  formatPrice?: (amount: number) => string;
}

const DEFAULT_JFORCE_AGENT: JForceAgent = {
  agentId: "JF-LAGOS-8821",
  fullName: "Adeola Babatunde",
  email: "adeola.b@vroomforce.ng",
  phone: "+234 802 889 4432",
  city: "Lagos",
  tier: "GOLD_ELITE",
  commissionRate: 0.12, // 12% Gold Elite
  referralCode: "JF-LAGOS-8821",
  walletBalanceNGN: 184500,
  lifetimeEarningsNGN: 642000,
  totalOrdersCount: 28,
  bankName: "GTBank (Guaranty Trust)",
  accountNumber: "0234567891",
  accountName: "Adeola Babatunde Consulting",
};

const INITIAL_COMMISSION_LEDGER: JForceCommissionRecord[] = [
  {
    id: "comm-1",
    orderId: "VRM-ORD-88190",
    date: "2026-03-02",
    customerName: "Chief K. Adeleke",
    orderTotalNGN: 184000,
    commissionNGN: 22080,
    ratePercent: 12,
    status: "APPROVED",
  },
  {
    id: "comm-2",
    orderId: "VRM-ORD-87940",
    date: "2026-02-28",
    customerName: "Folashade Alakija",
    orderTotalNGN: 320000,
    commissionNGN: 38400,
    ratePercent: 12,
    status: "APPROVED",
  },
  {
    id: "comm-3",
    orderId: "VRM-ORD-87412",
    date: "2026-02-24",
    customerName: "Dr. Emeka Okafor",
    orderTotalNGN: 95000,
    commissionNGN: 11400,
    ratePercent: 12,
    status: "PAID",
  },
  {
    id: "comm-4",
    orderId: "VRM-ORD-86921",
    date: "2026-02-19",
    customerName: "Zainab Dantata",
    orderTotalNGN: 210000,
    commissionNGN: 25200,
    ratePercent: 12,
    status: "PAID",
  },
];

export const JForcePortalModal: React.FC<JForcePortalModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  formatPrice = (amount) => `₦${amount.toLocaleString()}`,
}) => {
  const [agent, setAgent] = useState<JForceAgent>(() => {
    try {
      const saved = localStorage.getItem("vroom_jforce_agent");
      return saved ? JSON.parse(saved) : DEFAULT_JFORCE_AGENT;
    } catch {
      return DEFAULT_JFORCE_AGENT;
    }
  });

  const [ledger, setLedger] = useState<JForceCommissionRecord[]>(() => {
    try {
      const saved = localStorage.getItem("vroom_jforce_ledger");
      return saved ? JSON.parse(saved) : INITIAL_COMMISSION_LEDGER;
    } catch {
      return INITIAL_COMMISSION_LEDGER;
    }
  });

  // Commission Calculator Slider State
  const [calcOrderValue, setCalcOrderValue] = useState<number>(250000);
  const [calcOrderCount, setCalcOrderCount] = useState<number>(5);

  // Payout request processing
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  if (!isOpen) return null;

  const referralLink = `${window.location.origin}/?ref=${agent.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    onSuccessToast("✓ JForce Referral Link copied to clipboard!");
  };

  const handleRequestPayout = () => {
    if (agent.walletBalanceNGN <= 0) {
      onSuccessToast("Wallet balance is currently ₦0.");
      return;
    }

    setIsProcessingPayout(true);

    setTimeout(() => {
      const amount = agent.walletBalanceNGN;
      const updatedAgent: JForceAgent = {
        ...agent,
        walletBalanceNGN: 0,
        lifetimeEarningsNGN: agent.lifetimeEarningsNGN + amount,
      };

      // Mark pending commissions as PAID
      const updatedLedger = ledger.map((rec) =>
        rec.status === "APPROVED" ? { ...rec, status: "PAID" as const } : rec
      );

      setAgent(updatedAgent);
      setLedger(updatedLedger);
      setIsProcessingPayout(false);

      try {
        localStorage.setItem("vroom_jforce_agent", JSON.stringify(updatedAgent));
        localStorage.setItem("vroom_jforce_ledger", JSON.stringify(updatedLedger));
      } catch (err) {
        console.warn("Storage error", err);
      }

      onSuccessToast(
        `✓ Payout of ${formatPrice(amount)} requested! Dispatched via Paystack to ${agent.bankName} (${agent.accountNumber})`
      );
    }, 900);
  };

  // Commission calculator projections
  const projectedVolume = calcOrderValue * calcOrderCount;
  const projectedEarnings = projectedVolume * agent.commissionRate;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container jforce-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">AFFILIATE & RESELLER COMMISSION NETWORK</span>
            <h2 className="modal-title">Vroom Force (JForce) Consultant Hub</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="jforce-modal-body">
          {/* Agent Banner & Tier Status */}
          <div className="jforce-agent-banner">
            <div className="agent-profile-col">
              <div className="agent-tier-badge-row">
                <span className="tier-tag gold">★ GOLD ELITE CONSULTANT</span>
                <span className="agent-code-tag">ID: {agent.agentId}</span>
              </div>
              <h3 className="agent-name">{agent.fullName}</h3>
              <p className="agent-sub">
                Location: <strong>{agent.city}</strong> • Commission Rate: <strong>{(agent.commissionRate * 100).toFixed(0)}% per order</strong> • Orders Assisted: <strong>{agent.totalOrdersCount}</strong>
              </p>
            </div>

            {/* Referral Link Quick Copy Box */}
            <div className="agent-referral-box">
              <label htmlFor="ref-url-input">Your Personal JForce Tracking Link</label>
              <div className="referral-input-group">
                <input
                  id="ref-url-input"
                  readOnly
                  value={referralLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className="copy-ref-btn"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  Copy Link
                </button>
              </div>
              <span className="referral-hint">
                Orders placed via your link automatically earn {(agent.commissionRate * 100).toFixed(0)}% commission.
              </span>
            </div>
          </div>

          {/* Wallet Balance & Metrics Grid */}
          <div className="jforce-metrics-grid">
            <div className="jforce-metric-card wallet-highlight">
              <div className="metric-header">
                <span className="metric-icon">💳</span>
                <span className="metric-label">Available Commission Wallet</span>
              </div>
              <strong className="metric-number">{formatPrice(agent.walletBalanceNGN)}</strong>
              <div className="payout-action-row">
                <button
                  type="button"
                  className="jforce-payout-cta-btn"
                  onClick={handleRequestPayout}
                  disabled={isProcessingPayout || agent.walletBalanceNGN <= 0}
                >
                  {isProcessingPayout ? "Transferring via Paystack..." : "Request Direct Bank Payout →"}
                </button>
              </div>
              <span className="settlement-info">
                Settles to {agent.bankName} ({agent.accountNumber})
              </span>
            </div>

            <div className="jforce-metric-card">
              <div className="metric-header">
                <span className="metric-icon">📈</span>
                <span className="metric-label">Lifetime Commission Earned</span>
              </div>
              <strong className="metric-number">{formatPrice(agent.lifetimeEarningsNGN)}</strong>
              <span className="metric-note">100% verified order payouts</span>
            </div>

            <div className="jforce-metric-card">
              <div className="metric-header">
                <span className="metric-icon">👑</span>
                <span className="metric-label">Current Tier Rate</span>
              </div>
              <strong className="metric-number">{(agent.commissionRate * 100).toFixed(0)}%</strong>
              <span className="metric-note">Gold Elite Tier (Highest Bracket)</span>
            </div>
          </div>

          {/* Interactive Commission Calculator & Simulator */}
          <div className="jforce-calculator-section">
            <div className="calc-header">
              <span className="calc-kicker">EARNINGS SIMULATOR</span>
              <h4>Project Your Monthly JForce Consultant Income</h4>
            </div>

            <div className="calc-controls-grid">
              <div className="calc-slider-box">
                <div className="slider-label-row">
                  <span>Average Customer Order Value:</span>
                  <strong>{formatPrice(calcOrderValue)}</strong>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={500000}
                  step={5000}
                  value={calcOrderValue}
                  onChange={(e) => setCalcOrderValue(Number(e.target.value))}
                />
              </div>

              <div className="calc-slider-box">
                <div className="slider-label-row">
                  <span>Assisted Orders per Month:</span>
                  <strong>{calcOrderCount} orders</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={calcOrderCount}
                  onChange={(e) => setCalcOrderCount(Number(e.target.value))}
                />
              </div>

              <div className="calc-result-box">
                <span className="result-label">Projected Monthly Payout:</span>
                <strong className="result-value">{formatPrice(projectedEarnings)}</strong>
                <span className="result-sub">On {formatPrice(projectedVolume)} gross order volume</span>
              </div>
            </div>
          </div>

          {/* Attributed Orders Commission Ledger */}
          <div className="jforce-ledger-table-wrap">
            <div className="ledger-header-row">
              <h4>Attributed Orders & Commission History</h4>
              <span className="ledger-count">{ledger.length} Tracked Orders</span>
            </div>

            <table className="jforce-ledger-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Order Total</th>
                  <th>Rate</th>
                  <th>Your Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <strong>{rec.orderId}</strong>
                    </td>
                    <td>{rec.date}</td>
                    <td>{rec.customerName}</td>
                    <td>{formatPrice(rec.orderTotalNGN)}</td>
                    <td>{rec.ratePercent}%</td>
                    <td>
                      <strong className="commission-amt">+{formatPrice(rec.commissionNGN)}</strong>
                    </td>
                    <td>
                      <span className={`ledger-status-pill ${rec.status.toLowerCase()}`}>
                        {rec.status === "PAID" ? "✓ Paid to Bank" : "● Ready in Wallet"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
