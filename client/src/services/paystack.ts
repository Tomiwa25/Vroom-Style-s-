/**
 * Paystack Client Integration Service
 * Supports Option B (Paystack Pop Inline iframe) and Option A (Hosted Redirect fallback)
 */

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackSetupConfig {
  key: string;
  access_code: string;
  reference: string;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

interface PaystackPopGlobal {
  setup: (config: PaystackSetupConfig) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopGlobal;
  }
}

let scriptPromise: Promise<boolean> | null = null;

export const loadPaystackScript = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.PaystackPop) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existingScript = document.getElementById("paystack-inline-js");
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "paystack-inline-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn("[Paystack] Failed to load inline script, will use redirect fallback.");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
};

export interface PaystackInlineOptions {
  accessCode: string;
  reference: string;
  email: string;
  amountInKobo: number;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

/**
 * Opens Paystack inline popup using accessCode / reference.
 * Returns true if popup opened, false if failed/unavailable.
 */
export const openPaystackPopup = async (
  options: PaystackInlineOptions
): Promise<boolean> => {
  const loaded = await loadPaystackScript();
  const PaystackPop = window.PaystackPop;

  if (!loaded || !PaystackPop) {
    return false;
  }

  try {
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_vroom_placeholder",
      access_code: options.accessCode,
      reference: options.reference,
      callback: (response: { reference: string }) => {
        options.onSuccess(response.reference);
      },
      onClose: () => {
        if (options.onClose) options.onClose();
      },
    });

    handler.openIframe();
    return true;
  } catch (error) {
    console.error("[Paystack] Error opening inline popup:", error);
    return false;
  }
};

/**
 * Redirects user directly to Paystack's hosted checkout page (Option A).
 */
export const redirectToPaystackCheckout = (authorizationUrl: string): void => {
  if (typeof window !== "undefined") {
    window.location.href = authorizationUrl;
  }
};
