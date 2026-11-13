import React, { useState } from "react";

interface NewsletterSubscriptionProps {
  onSuccessToast?: (msg: string) => void;
  variant?: "footer" | "banner";
}

interface SubscriberData {
  email: string;
  subscribedAt: string;
  promoCode: string;
  interests: string[];
}

const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gmil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

const INTEREST_TAGS = [
  "Women's Atelier",
  "Men's Tailoring",
  "Tech & Living",
  "All VIP Drops",
];

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  onSuccessToast,
  variant = "footer",
}) => {
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["All VIP Drops"]);
  const [agreedToGdprNdpr, setAgreedToGdprNdpr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Check if subscriber exists in localStorage
  const [subscriber, setSubscriber] = useState<SubscriberData | null>(() => {
    try {
      const stored = localStorage.getItem("vroom_newsletter_subscriber");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateEmail = (input: string): { valid: boolean; suggestion?: string; error?: string } => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { valid: false, error: "Email address is required." };
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, error: "Please enter a valid email address (e.g., patron@domain.com)." };
    }

    const [, domain] = trimmed.split("@");
    if (domain) {
      const lowerDomain = domain.toLowerCase();
      if (COMMON_DOMAIN_TYPOS[lowerDomain]) {
        return {
          valid: false,
          suggestion: `Did you mean @${COMMON_DOMAIN_TYPOS[lowerDomain]}?`,
          error: `Typo detected in domain. Did you mean @${COMMON_DOMAIN_TYPOS[lowerDomain]}?`,
        };
      }
      const parts = lowerDomain.split(".");
      if (parts[parts.length - 1].length < 2) {
        return { valid: false, error: "Please provide a valid domain extension." };
      }
    }

    return { valid: true };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validation = validateEmail(email);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Please enter a valid email address.");
      return;
    }

    // Explicit GDPR / NDPR Opt-In Checkbox Enforcement
    if (!agreedToGdprNdpr) {
      setErrorMessage(
        "Consent required: You must explicitly agree to the NDPR/GDPR marketing data processing terms to subscribe."
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newSub: SubscriberData = {
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString(),
        promoCode: "VROOM-VIP-10",
        interests: selectedInterests.length > 0 ? selectedInterests : ["All VIP Drops"],
      };

      try {
        localStorage.setItem("vroom_newsletter_subscriber", JSON.stringify(newSub));
      } catch {
        // ignore storage errors
      }

      setSubscriber(newSub);
      setIsSubmitting(false);
      if (onSuccessToast) {
        onSuccessToast("Welcome to the Vroom Style Club! 10% VIP voucher unlocked.");
      }
    }, 500);
  };

  const handleCopyCode = () => {
    if (subscriber?.promoCode && navigator.clipboard) {
      navigator.clipboard.writeText(subscriber.promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      if (onSuccessToast) {
        onSuccessToast("Promo code VROOM-VIP-10 copied to clipboard!");
      }
    }
  };

  const handleResetSubscriber = () => {
    try {
      localStorage.removeItem("vroom_newsletter_subscriber");
    } catch {
      // ignore
    }
    setSubscriber(null);
    setEmail("");
    setAgreedToGdprNdpr(false);
  };

  // If already subscribed, render high-contrast VIP membership confirmation card
  if (subscriber) {
    return (
      <div className={`newsletter-module subscriber-confirmed ${variant}`}>
        <div className="subscriber-badge-header">
          <div>
            <h3 className="subscriber-title">You're on the list</h3>
            <span className="subscriber-email-tag">{subscriber.email}</span>
          </div>
        </div>
        <p className="subscriber-benefit-text">
          Your 10% welcome credit is active on everything in the collection.
        </p>

        <div className="promo-voucher-pill-container">
          <span className="voucher-label">Welcome code</span>
          <div className="voucher-display">
            <span className="voucher-code">{subscriber.promoCode}</span>
            <button
              type="button"
              className="voucher-copy-btn"
              onClick={handleCopyCode}
              title="Copy promo code"
            >
              {copiedCode ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="subscriber-footer-row">
          <span className="gdpr-verified-badge">
            Consent recorded {new Date(subscriber.subscribedAt).toLocaleDateString()}
          </span>
          <button
            type="button"
            className="subscriber-switch-btn"
            onClick={handleResetSubscriber}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`newsletter-module ${variant}`}>
      <div className="newsletter-intro">
        <div className="newsletter-title-row">
          <h3 className="newsletter-title">The Vroom list</h3>
        </div>
        <p className="newsletter-sub">
          Private drop invitations, runway previews, and <strong>10% off</strong> your first order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="newsletter-form-container" noValidate>
        {/* Email Input Field with validation indicator */}
        <div className="newsletter-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="you@example.com"
            className={`newsletter-email-input ${errorMessage ? "has-error" : ""}`}
            aria-label="Email address for newsletter"
            required
          />
          <button
            type="submit"
            className="primary-button newsletter-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-sm"></span>
            ) : (
              "Claim 10% off"
            )}
          </button>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="newsletter-inline-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interest Selection Chips */}
        <div className="newsletter-interests-strip">
          <span className="interests-label">What you follow</span>
          <div className="interests-chips">
            {INTEREST_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`interest-chip ${selectedInterests.includes(tag) ? "active" : ""}`}
                onClick={() => toggleInterest(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Explicit GDPR / NDPR Compliant Opt-In Checkbox */}
        <div className="newsletter-gdpr-optin">
          <label className="gdpr-checkbox-label">
            <input
              type="checkbox"
              checked={agreedToGdprNdpr}
              onChange={(e) => {
                setAgreedToGdprNdpr(e.target.checked);
                if (errorMessage) setErrorMessage("");
              }}
              required
              className="gdpr-checkbox"
            />
            <span className="gdpr-text">
              I agree to receive newsletters, private runway access, and seasonal drops. Vroom Style(s) processes this data under the <strong>NDPR</strong> and <strong>GDPR</strong>. You can unsubscribe at any time.
            </span>
          </label>
        </div>
      </form>
    </div>
  );
};
