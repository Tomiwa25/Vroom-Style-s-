import React, { useState, useRef, useEffect } from "react";
import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_WHATSAPP_DISPLAY,
  openWhatsAppChat,
} from "../utils/device";

interface LiveChatConciergeProps {
  onOpenTracking?: () => void;
  onOpenVroomDelivery?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: "whatsapp" | "tracking" | "vroom_delivery";
  };
}

let messageIdCounter = 0;
function getNextMessageId(prefix: string): string {
  messageIdCounter += 1;
  return `${prefix}-${messageIdCounter}`;
}

const PRESET_QUICK_ACTIONS = [
  {
    id: "whatsapp",
    label: "💬 Chat on WhatsApp (+234 913 083 1439)",
    userQuery: "Hello, I want to chat directly with a live stylist on WhatsApp.",
  },
  {
    id: "pod",
    label: "💵 How does Payment on Delivery (PoD) work?",
    userQuery: "How does Payment on Delivery work on Vroom?",
  },
  {
    id: "tracking",
    label: "📦 Track my Order or Waybill",
    userQuery: "Can you help me check the status of my order?",
  },
  {
    id: "sizing",
    label: "👗 Size & Styling recommendations",
    userQuery: "I need guidance on atelier sizing and fabric care.",
  },
];

export const LiveChatConcierge: React.FC<LiveChatConciergeProps> = ({
  onOpenTracking,
  onOpenVroomDelivery,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome-1",
      sender: "agent",
      text: "Hello! I'm Sarah from the Vroom Atelier Concierge team. How can I assist you with your luxury order or styling today?",
      timestamp: "Just now",
    },
    {
      id: "msg-welcome-2",
      sender: "agent",
      text: `You can chat with me here, or tap below to connect with us on our verified WhatsApp line (${OFFICIAL_WHATSAPP_DISPLAY}).`,
      timestamp: "Just now",
      suggestedAction: {
        label: `Open WhatsApp (${OFFICIAL_WHATSAPP_DISPLAY})`,
        actionType: "whatsapp",
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: getNextMessageId("usr"),
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Simulate Agent response based on query
    setTimeout(() => {
      let agentReplyText = `Thank you for your inquiry! Our concierge team is standing by. Feel free to connect directly via our official WhatsApp line (${OFFICIAL_WHATSAPP_DISPLAY}) for personalized lookbook curation.`;
      let action: ChatMessage["suggestedAction"] = {
        label: `Chat on WhatsApp (${OFFICIAL_WHATSAPP_DISPLAY})`,
        actionType: "whatsapp",
      };

      const lower = text.toLowerCase();
      if (lower.includes("whatsapp") || lower.includes("chat") || lower.includes("human") || lower.includes("agent")) {
        agentReplyText = "Connecting you directly to our lead stylist on WhatsApp (+234 913 083 1439). Tap the button below to launch our priority WhatsApp chat.";
        action = {
          label: "Launch WhatsApp (+234 913 083 1439) →",
          actionType: "whatsapp",
        };
      } else if (lower.includes("pod") || lower.includes("delivery") || lower.includes("cash") || lower.includes("pay")) {
        agentReplyText = "Payment on Delivery (PoD) is available across Lagos, Abuja, and Port Harcourt. You can inspect your garments at your doorstep and settle via mobile POS card terminal (Visa/Mastercard/Verve) or cash.";
        action = undefined;
      } else if (lower.includes("track") || lower.includes("waybill") || lower.includes("order")) {
        agentReplyText = "You can track orders and dispatch waybills in real time using our logistics tracking portal.";
        action = {
          label: "Open Order & Waybill Tracker 📦",
          actionType: "tracking",
        };
      } else if (lower.includes("size") || lower.includes("fit") || lower.includes("fabric")) {
        agentReplyText = "Our pieces are tailored true-to-size with French and Italian architectural grading. We offer 7-day complimentary doorstep size exchanges if you need an adjustment!";
        action = undefined;
      }

      const agentReply: ChatMessage = {
        id: getNextMessageId("agent"),
        sender: "agent",
        text: agentReplyText,
        timestamp: "Just now",
        suggestedAction: action,
      };

      setMessages((prev) => [...prev, agentReply]);
    }, 600);
  };

  const handleActionClick = (actionType: "whatsapp" | "tracking" | "vroom_delivery", customText?: string) => {
    if (actionType === "whatsapp") {
      openWhatsAppChat(OFFICIAL_WHATSAPP_NUMBER, customText || "Hello Vroom Style(s), I need assistance with an order.");
    } else if (actionType === "tracking") {
      if (onOpenTracking) onOpenTracking();
    } else if (actionType === "vroom_delivery") {
      if (onOpenVroomDelivery) onOpenVroomDelivery();
    }
  };

  return (
    <>
      {/* Floating Trigger Bubble */}
      <div className="live-chat-floating-container">
        {!isOpen && (
          <button
            type="button"
            className="live-chat-bubble-trigger"
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            aria-label="Open Live Concierge Chat"
            title="Chat with Atelier Stylist Sarah"
          >
            <div className="bubble-avatar-wrapper">
              <span className="stylist-avatar-emoji" aria-hidden="true">S</span>
              <span className="online-pulse-beacon" title="Sarah is online now"></span>
            </div>
            <div className="bubble-text-group">
              <strong className="bubble-name">Ask a Stylist</strong>
              <span className="bubble-status">Sarah is online</span>
            </div>
            {hasUnread && <span className="unread-dot-badge">1</span>}
          </button>
        )}
      </div>

      {/* Expandable Embedded Live Chat Drawer */}
      {isOpen && (
        <aside className="live-chat-embedded-drawer" aria-label="Live Concierge Chat Window">
          {/* Header */}
          <div className="chat-drawer-header">
            <div className="chat-agent-profile">
              <div className="agent-avatar-box">
                <span className="agent-avatar-icon" aria-hidden="true">S</span>
                <span className="agent-status-dot online"></span>
              </div>
              <div className="agent-meta">
                <strong className="agent-name">Sarah, atelier concierge</strong>
                <span className="agent-sub">Usually replies within two minutes</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="whatsapp-quick-header-btn"
                onClick={() => handleActionClick("whatsapp")}
                title="Launch WhatsApp Chat directly"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                className="chat-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Chat Window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Official WhatsApp Notice Bar */}
          <div
            className="chat-whatsapp-banner"
            onClick={() => handleActionClick("whatsapp")}
            role="button"
            tabIndex={0}
          >
            <div className="wa-banner-text">
              <strong>WhatsApp</strong>
              <span>{OFFICIAL_WHATSAPP_DISPLAY}</span>
            </div>
            <span className="wa-open-arrow" aria-hidden="true">→</span>
          </div>

          {/* Chat Stream Body */}
          <div className="chat-messages-scroll-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                {msg.sender === "agent" && (
                  <span className="msg-avatar-icon" aria-hidden="true">S</span>
                )}
                <div className="msg-bubble-content">
                  <p className="msg-bubble-text">{msg.text}</p>
                  <span className="msg-time">{msg.timestamp}</span>

                  {msg.suggestedAction && (
                    <button
                      type="button"
                      className="msg-action-chip-btn"
                      onClick={() =>
                        handleActionClick(msg.suggestedAction!.actionType)
                      }
                    >
                      {msg.suggestedAction.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="chat-quick-chips-wrapper">
            <span className="quick-chips-hint">Common questions</span>
            <div className="quick-chips-scroll">
              {PRESET_QUICK_ACTIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleSendMessage(preset.userQuery)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chat-input-dock"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about a piece, a size, or an order"
              className="chat-text-input"
              aria-label="Type message"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              →
            </button>
          </form>

          {/* Bottom WhatsApp Fallback */}
          <div className="chat-footer-protocol-row">
            <span>Prefer WhatsApp?</span>
            <button
              type="button"
              className="chat-wa-direct-link"
              onClick={() =>
                openWhatsAppChat(
                  OFFICIAL_WHATSAPP_NUMBER,
                  inputValue.trim() || "Hello Vroom Style(s), I have an inquiry about my order."
                )
              }
            >
              Continue on WhatsApp (+234 913 083 1439) ↗
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
