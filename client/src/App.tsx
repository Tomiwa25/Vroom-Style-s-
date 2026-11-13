import { useEffect, useState, useMemo, useCallback } from "react";
import type { Product, CartItem, User, CampaignEvent, PodCheckoutDetails, CountryRegion } from "./types";
import { useProducts } from "./hooks/useProducts";
import { useAttribution } from "./hooks/useAttribution";
import { DEFAULT_REGION } from "./data/regions";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { QuickViewModal } from "./components/QuickViewModal";
import { ImageLightboxModal } from "./components/ImageLightboxModal";
import { AdminModal } from "./components/AdminModal";
import { CartFeedbackModal } from "./components/CartFeedbackModal";
import { OrderTrackingModal } from "./components/OrderTrackingModal";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { AccountDropdown } from "./components/AccountDropdown";
import { HelpDropdown } from "./components/HelpDropdown";
import { HelpCenterModal } from "./components/HelpCenterModal";
import { VendorPortalModal } from "./components/VendorPortalModal";
import { JForcePortalModal } from "./components/JForcePortalModal";
import { VroomDeliveryModal } from "./components/VroomDeliveryModal";
import { NewsletterSubscription } from "./components/NewsletterSubscription";
import { AppSmartBanner } from "./components/AppSmartBanner";
import { LiveChatConcierge } from "./components/LiveChatConcierge";
import { CountrySwitcherModal } from "./components/CountrySwitcherModal";
import { ComplianceModal } from "./components/ComplianceModal";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { Footer } from "./components/Footer";
import { GlobalSearchPortal } from "./components/GlobalSearchPortal";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { CategoryMegaMenu } from "./components/CategoryMegaMenu";
import { FlashSaleSection } from "./components/FlashSaleSection";
import { CampaignBannerGrid } from "./components/CampaignBannerGrid";
import { ScavengerHuntModal } from "./components/ScavengerHuntModal";
import { ProductCard } from "./components/ProductCard";
import { RecommendationRail } from "./components/RecommendationRail";
import { BrandPortalSection } from "./components/BrandPortalSection";
import { CarsShowroomSection } from "./components/CarsShowroomSection";
import { HomeAppliancesSection } from "./components/HomeAppliancesSection";
import { TechLivingSection } from "./components/TechLivingSection";
import { PromptStudioModal } from "./components/PromptStudioModal";
import { useRecentlyViewed } from "./hooks/useRecentlyViewed";
import { useReveal } from "./hooks/useReveal";
import { openPaystackPopup, redirectToPaystackCheckout } from "./services/paystack";
import api, { createIdempotencyKey } from "./services/api";
import "./styles.css";

/**
 * Density switch.
 *
 * The storefront is deliberately quiet: one hero, one catalog, one editorial
 * band. The legacy marketing rails (flash sale, campaign grid, brand/vehicle/
 * appliance showcases, affiliate banners) still ship, but stay folded away so
 * the page reads as a gallery rather than a marketplace. Flip to true to
 * restore them.
 */
const SHOW_MARKETING_SECTIONS = false;

// Departments that actually hold stock — mirrors Product.category values.
const DEPARTMENTS = [
  "Women",
  "Outerwear",
  "Knitwear",
  "Accessories",
  "Footwear",
  "Phones & Tablets",
  "Appliances",
  "Health & Beauty",
];

function App() {
  // Store Catalog managed via TanStack Query
  const { products, isLoading, isError, error, refetch } = useProducts();
  const { activeCampaign, setCampaign, clearCampaign } = useAttribution();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isVendorPortalOpen, setIsVendorPortalOpen] = useState<boolean>(false);
  const [vendorPortalInitialTab, setVendorPortalInitialTab] = useState<"onboarding" | "hub">("onboarding");
  const [isJForcePortalOpen, setIsJForcePortalOpen] = useState<boolean>(false);
  const [sellerTypeFilter, setSellerTypeFilter] = useState<"ALL" | "1P" | "3P">("ALL");
  const [isPodFilterActive, setIsPodFilterActive] = useState<boolean>(false);
  const [vendorDrops, setVendorDrops] = useState<Product[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [isScavengerModalOpen, setIsScavengerModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isVroomDeliveryOpen, setIsVroomDeliveryOpen] = useState<boolean>(false);
  const [vroomDeliveryInitialTab, setVroomDeliveryInitialTab] = useState<"calculator" | "book" | "track" | "api">("calculator");
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<{
    orderId: string;
    reference: string;
    total: number;
    isPod?: boolean;
    podAddress?: string;
    podCity?: string;
    podPhone?: string;
  } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState<boolean>(false);
  const [promptStudioInitialCategory, setPromptStudioInitialCategory] = useState<string>("Cars");

  const handleOpenPromptStudio = (cat: string = "Cars") => {
    setPromptStudioInitialCategory(cat);
    setIsPromptStudioOpen(true);
  };

  // Regional Storefront & Internationalization (i18n)
  const [currentRegion, setCurrentRegion] = useState<CountryRegion>(() => {
    try {
      const stored = localStorage.getItem("vroom_selected_region");
      return stored ? JSON.parse(stored) : DEFAULT_REGION;
    } catch {
      return DEFAULT_REGION;
    }
  });
  const [isCountrySwitcherOpen, setIsCountrySwitcherOpen] = useState<boolean>(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState<boolean>(false);
  const [complianceInitialTab, setComplianceInitialTab] = useState<"dispute" | "returns" | "cookies" | "gateways">("dispute");
  // The consent card waits until someone has actually read the page.
  const [isCookieCardVisible, setIsCookieCardVisible] = useState<boolean>(false);

  // Recently Viewed history (client-side localStorage tracking)
  const { recentlyViewed, recordView, clearHistory } = useRecentlyViewed();

  const handleOpenQuickView = useCallback(
    (product: Product) => {
      recordView(product);
      setQuickViewProduct(product);
    },
    [recordView]
  );

  // High-Resolution Multi-Angle Image Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState<number>(0);

  const handleOpenLightbox = useCallback(
    (product: Product, initialIndex = 0) => {
      recordView(product);
      setLightboxProduct(product);
      setLightboxInitialIndex(initialIndex);
      setIsLightboxOpen(true);
    },
    [recordView]
  );

  // Main Catalog Pagination (Show 12 items per page by default)
  const [catalogCurrentPage, setCatalogCurrentPage] = useState<number>(1);
  const [catalogPageSize, setCatalogPageSize] = useState<number>(12);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [prevFilterKey, setPrevFilterKey] = useState<string>("");

  // Reset pagination to first page whenever catalog filters change during render without effect
  const filterKey = `${selectedCategory}|${searchQuery}|${sellerTypeFilter}|${isPodFilterActive}|${activeCampaign || ""}`;
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCatalogCurrentPage(1);
  }
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    status: "SUCCESS" | "OUT_OF_STOCK";
    product: Product | null;
    selectedSize?: string;
    selectedColor?: string;
  }>({
    isOpen: false,
    status: "SUCCESS",
    product: null,
  });

  // Cart & Wishlist with localStorage hydration
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("vroom_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vroom_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("vroom_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem("vroom_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [cartItems]);

  // Let the page speak first; consent asks once the visitor has settled in.
  useEffect(() => {
    const timer = window.setTimeout(() => setIsCookieCardVisible(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem("vroom_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Could not save wishlist to localStorage", e);
    }
  }, [wishlist]);

  // Currency Converter Formatter (1 USD ≈ 1,500 NGN)
  const formatPrice = (amountInNGN: number): string => {
    if (currency === "USD") {
      const inUSD = amountInNGN / 1500;
      return `$${inUSD.toFixed(2)}`;
    }
    return `₦${amountInNGN.toLocaleString()}`;
  };

  // Add to Cart with real-time stock availability check & feedback popup
  const handleAddToCart = (
    product: Product,
    size?: string,
    color?: string,
    quantity: number = 1
  ) => {
    recordView(product);
    const chosenSize = size || product.sizes?.[0] || "Standard";
    const chosenColor = color || product.colors?.[0]?.name || "Default";

    // 1. Stock check: If product is out of stock (stock <= 0)
    if (product.stock <= 0) {
      setFeedbackModal({
        isOpen: true,
        status: "OUT_OF_STOCK",
        product,
        selectedSize: chosenSize,
        selectedColor: chosenColor,
      });
      return;
    }

    // 2. Product is present & confirmed in stock: add to bag
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize === chosenSize &&
          i.selectedColor === chosenColor
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
        },
      ];
    });

    // 3. Open the bag. One less modal to dismiss before checkout.
    setIsCartOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    const removedName = cartItems[index]?.product.name;
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    if (removedName) {
      showToast(`Removed ${removedName} from your bag`);
    }
  };

  // Payment Verification Handler
  const handleVerifyPayment = useCallback(
    async (
      reference: string,
      fallbackOrderId?: string,
      fallbackAmount?: number
    ) => {
      try {
        showToast("Verifying payment with Paystack...");
        const verifyRes = await api.post("/payments/verify", { reference });

        if (verifyRes.data?.success) {
          setCartItems([]);
          localStorage.removeItem("vroom_cart");
          setIsCartOpen(false);

          // The verify endpoint now returns the authoritative orderId, so we
          // never guess it from the reference string.
          const orderId =
            verifyRes.data?.data?.orderId ||
            fallbackOrderId ||
            sessionStorage.getItem("vroom_pending_order") ||
            "";

          let total =
            fallbackAmount ||
            Number(sessionStorage.getItem("vroom_pending_amount")) ||
            0;

          if ((!total || !orderId) && orderId) {
            try {
              const trackRes = await api.get(`/orders/${orderId}/track`);
              total = Number(trackRes.data?.data?.total) || total;
            } catch {
              /* best effort: amount is display-only */
            }
          }

          sessionStorage.removeItem("vroom_pending_order");
          sessionStorage.removeItem("vroom_pending_amount");

          setConfirmedOrderDetails({
            orderId,
            reference,
            total,
          });
          setIsSuccessModalOpen(true);
          showToast("Payment verified! Order confirmed.");
        }
      } catch (err: unknown) {
        console.error("Payment verification failed:", err);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          "Payment verification was unsuccessful. Please check with concierge.";
        showToast(msg);
      }
    },
    [showToast]
  );

  // Check URL parameters on mount for Paystack Redirect Return (Option A)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference") || urlParams.get("trxref");
    if (reference) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const timer = setTimeout(() => {
        void handleVerifyPayment(reference);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [handleVerifyPayment]);

  // Connect Frontend Checkout (Option A Paystack Redirect, Option B Paystack Pop, and Option C Payment on Delivery)
  const handleCheckout = async (
    method: "inline" | "redirect" | "pod" = "inline",
    podDetails?: PodCheckoutDetails
  ) => {
    if (cartItems.length === 0) {
      showToast("Your bag is currently empty.");
      return;
    }

    if (!currentUser) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      showToast("Please sign in or create an account to complete your atelier order.");
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Lock in order items on the backend with a client-side idempotency key.
      //    `source: "cart"` tells the server to build from the user's cart and
      //    clear it on success; the client-sent `items` are a fallback only.
      const orderPayload: Record<string, unknown> = {
        source: "cart",
        items: cartItems.map((item) => ({
          productId: item.product.id,
          externalId: item.product.externalId,
          quantity: item.quantity,
        })),
      };

      // Option C: Payment on Delivery (PoD). Creates a real unpaid order that
      // reserves stock and appears in the admin order list; settlement happens
      // at the doorstep. No Paystack interaction.
      if (method === "pod") {
        const ineligible = cartItems.filter((i) => !i.product.isPodEligible);
        if (ineligible.length > 0) {
          showToast("Some items require prepayment. Please remove them or choose Pay Online.");
          setIsCheckingOut(false);
          return;
        }

        orderPayload.deliveryMethod = "POD";
        orderPayload.shipping = {
          name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          phone: podDetails?.phone,
          address: podDetails?.address,
          city: podDetails?.city,
          notes: podDetails?.deliveryNotes,
        };

        const podRes = await api.post("/orders", orderPayload, {
          headers: { "Idempotency-Key": createIdempotencyKey("pod") },
        });
        const createdPodOrder = podRes.data?.data;
        if (!createdPodOrder?.id) {
          throw new Error("Unable to create order. Please review your bag.");
        }

        setCartItems([]);
        localStorage.removeItem("vroom_cart");
        setIsCartOpen(false);

        setConfirmedOrderDetails({
          orderId: createdPodOrder.id,
          reference: `POD-${createdPodOrder.id.slice(0, 8).toUpperCase()}`,
          total: Number(createdPodOrder.total),
          isPod: true,
          podAddress: podDetails?.address,
          podCity: podDetails?.city,
          podPhone: podDetails?.phone,
        });
        setIsSuccessModalOpen(true);
        showToast("Payment on Delivery order confirmed!");
        return;
      }

      const checkoutKey = createIdempotencyKey("checkout");
      const orderRes = await api.post("/orders", orderPayload, {
        headers: {
          "Idempotency-Key": checkoutKey,
        },
      });
      const createdOrder = orderRes.data?.data;

      if (!createdOrder?.id) {
        throw new Error("Unable to create order. Please review your cart.");
      }

      // 2. Initialize Paystack payment session with deterministic idempotency key for this order
      const initRes = await api.post(
        "/payments/initialize",
        {
          orderId: createdOrder.id,
        },
        {
          headers: {
            "Idempotency-Key": `pay_init_${createdOrder.id}`,
          },
        }
      );

      const paymentData = initRes.data?.data;
      if (!paymentData?.reference) {
        throw new Error("Unable to initialize Paystack transaction.");
      }

      const totalAmount = Number(createdOrder.total);

      // Option A: Hosted Redirect
      if (method === "redirect") {
        sessionStorage.setItem("vroom_pending_order", createdOrder.id);
        sessionStorage.setItem("vroom_pending_amount", String(totalAmount));
        showToast("Redirecting to Paystack Secure Checkout...");
        redirectToPaystackCheckout(paymentData.authorizationUrl);
        return;
      }

      // Option B: Paystack Pop Inline Modal
      const opened = await openPaystackPopup({
        accessCode: paymentData.accessCode,
        reference: paymentData.reference,
        email: currentUser.email,
        amountInKobo: Math.round(totalAmount * 100),
        onSuccess: async (ref) => {
          await handleVerifyPayment(ref, createdOrder.id, totalAmount);
        },
        onClose: () => {
          showToast("Checkout closed. Your cart remains safely saved.");
          setIsCheckingOut(false);
        },
      });

      if (!opened) {
        // Fall back gracefully to Option A if popup is blocked or script fails
        showToast("Opening Paystack hosted checkout...");
        sessionStorage.setItem("vroom_pending_order", createdOrder.id);
        sessionStorage.setItem("vroom_pending_amount", String(totalAmount));
        redirectToPaystackCheckout(paymentData.authorizationUrl);
      }
    } catch (err: unknown) {
      console.error("Checkout failed:", err);
      const msg =
        (err as { response?: { data?: { message?: string }; message?: string } })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "Checkout failed. Please try again.";
      showToast(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast("Removed from wishlist");
        return prev.filter((id) => id !== productId);
      }
      showToast("Saved to your wishlist ♡");
      return [...prev, productId];
    });
  };

  // Login handler
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("vroom_user", JSON.stringify(user));
      localStorage.setItem("vroom_token", token);
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("vroom_user");
      localStorage.removeItem("vroom_token");
    } catch (e) {
      console.warn("Storage error", e);
    }
    showToast("Signed out of your account");
    setIsAuthOpen(false);
  };

  const handleScrollToCatalog = useCallback(() => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleResetToHome = useCallback(() => {
    setSelectedCategory("All");
    setSearchQuery("");
    setQuickViewProduct(null);
    clearCampaign();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [clearCampaign]);

  const handleSelectCampaign = useCallback(
    (event: CampaignEvent) => {
      setCampaign(event.campaignKey, event.affiliateParams);

      if (event.campaignKey === "scavenger_hunt") {
        setIsScavengerModalOpen(true);
        return;
      }

      if (event.targetCategory) {
        setSelectedCategory(event.targetCategory);
      } else if (event.campaignKey === "black_friday") {
        setSelectedCategory("All");
        showToast("🔥 Black Friday Event Activated! Special discounts up to -56% applied.");
      } else if (event.campaignKey === "bogof") {
        setSelectedCategory("All");
        showToast("🎁 BOGOF Event Activated! Buy One Get One 50% Off.");
      } else if (event.campaignKey === "flash_sale") {
        setSelectedCategory("All");
        showToast("⚡ Flash Deals Activated!");
      }

      handleScrollToCatalog();
    },
    [handleScrollToCatalog, setCampaign, showToast]
  );

  // Aggregate all products (live backend / initial + vendor-created 3P drops)
  const allProducts = useMemo(() => {
    return vendorDrops.length > 0 ? [...vendorDrops, ...products] : products;
  }, [products, vendorDrops]);

  // Filtered & Deduplicated Products (filters duplicate images so each product card on UI is distinct)
  const filteredProducts = useMemo(() => {
    // 1. Deduplicate by primary image so duplicate sweatshirts/cards don't appear
    const seenImages = new Set<string>();
    const uniqueProducts = allProducts.filter((prod) => {
      const imgKey = prod.image?.trim().toLowerCase();
      if (!imgKey) return true;
      if (seenImages.has(imgKey)) {
        return false;
      }
      seenImages.add(imgKey);
      return true;
    });

    // 2. Apply campaign, multi-taxonomy, search, and multi-tenant seller model filters
    return uniqueProducts.filter((prod) => {
      // Multi-tenant Seller Model Separation (1P Retail vs 3P Marketplace)
      if (sellerTypeFilter === "1P" && prod.sellerType !== "1P") return false;
      if (sellerTypeFilter === "3P" && prod.sellerType !== "3P") return false;

      const pCat = (prod.category || "").toLowerCase();
      const sCat = selectedCategory.toLowerCase();

      // Promotional campaign filter if active
      if (activeCampaign) {
        if (activeCampaign === "black_friday" || activeCampaign === "black_friday_deals") {
          const isBF =
            prod.campaignTag === "BLACK_FRIDAY" ||
            Boolean(prod.originalPrice && prod.originalPrice > prod.price * 1.35);
          if (!isBF) return false;
        } else if (activeCampaign === "bogof" || activeCampaign === "bogof_pairs") {
          const isBOGOF =
            prod.campaignTag === "BOGOF" ||
            Boolean(prod.originalPrice && prod.originalPrice > prod.price * 1.25);
          if (!isBOGOF) return false;
        } else if (activeCampaign === "flash_sale" || activeCampaign === "official_store_day") {
          const isFlash =
            prod.campaignTag === "FLASH_SALE" ||
            prod.sellerType === "1P" ||
            pCat === "official store" ||
            Boolean(prod.tag && prod.tag.toLowerCase().includes("official"));
          if (!isFlash) return false;
        } else if (
          activeCampaign === "scavenger_hunt" ||
          activeCampaign === "scavenger_hunt_event"
        ) {
          const isScavenger =
            prod.campaignTag === "SCAVENGER_HUNT" || pCat === "accessories";
          if (!isScavenger) return false;
        }
      }

      // Multi-tiered taxonomy routing
      let matchesTaxonomy: boolean;
      if (selectedCategory === "All") {
        matchesTaxonomy = true;
      } else if (selectedCategory === "Official Store") {
        matchesTaxonomy =
          prod.sellerType === "1P" ||
          pCat === "official store" ||
          Boolean(prod.tag && (prod.tag.toLowerCase().includes("official") || prod.tag.toLowerCase().includes("atelier"))) ||
          Boolean(prod.brand && prod.brand.toLowerCase().includes("official"));
      } else if (selectedCategory === "Fashion & Atelier") {
        matchesTaxonomy =
          pCat === "fashion & atelier" ||
          pCat === "women" ||
          pCat === "men" ||
          pCat === "outerwear" ||
          pCat === "knitwear" ||
          Boolean(prod.tag && prod.tag.toLowerCase().includes("atelier"));
      } else if (selectedCategory === "Appliances" || selectedCategory === "All Appliances") {
        matchesTaxonomy =
          pCat === "appliances" ||
          pCat === "fridges" ||
          pCat === "microwaves" ||
          pCat === "kitchen utensils";
      } else {
        matchesTaxonomy =
          pCat === sCat ||
          Boolean(prod.tag && prod.tag.toLowerCase().includes(sCat)) ||
          Boolean(prod.brand && prod.brand.toLowerCase().includes(sCat));
      }

      // Free-text query dispatching across multiple taxonomies: products, brands, categories, tags, materials, sellers
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        pCat.includes(q) ||
        Boolean(prod.brand && prod.brand.toLowerCase().includes(q)) ||
        Boolean(prod.sellerName && prod.sellerName.toLowerCase().includes(q)) ||
        Boolean(prod.tag && prod.tag.toLowerCase().includes(q)) ||
        Boolean(prod.material && prod.material.toLowerCase().includes(q)) ||
        Boolean(prod.warranty && prod.warranty.toLowerCase().includes(q)) ||
        Boolean(prod.bundledIncentive && prod.bundledIncentive.toLowerCase().includes(q));

      // Step 5: Payment on Delivery (PoD) Filter Rail
      if (isPodFilterActive && !prod.isPodEligible) return false;

      return matchesTaxonomy && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery, activeCampaign, sellerTypeFilter, isPodFilterActive]);

  // Main Catalog Pagination Slicing
  const totalCatalogPages = Math.ceil(filteredProducts.length / catalogPageSize);
  const paginatedCatalogProducts = useMemo(() => {
    const start = (catalogCurrentPage - 1) * catalogPageSize;
    return filteredProducts.slice(start, start + catalogPageSize);
  }, [filteredProducts, catalogCurrentPage, catalogPageSize]);

  const handleCatalogPageChange = (newPage: number) => {
    setCatalogCurrentPage(newPage);
    const catalogEl = document.getElementById("catalog-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Step 5: Curated Recommendation Feed - Payment on Delivery (PoD) Essentials
  const podEligibleProducts = useMemo(() => {
    return allProducts.filter((p) => p.isPodEligible);
  }, [allProducts]);

  // Curated Recommendation Feeds
  const topSellingProducts = useMemo(() => {
    return [...allProducts]
      .filter((p) => (p.reviewCount && p.reviewCount >= 500) || (p.rating && p.rating >= 4.8))
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }, [allProducts]);

  const searchBasedProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        Boolean(p.brand && p.brand.toLowerCase().includes(q)) ||
        Boolean(p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
        Boolean(p.tag && p.tag.toLowerCase().includes(q))
    );
  }, [allProducts, searchQuery]);

  const techDealsProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.category === "Phones & Tablets" ||
        p.category === "Appliances" ||
        Boolean(p.brand && (p.brand === "Courant" || p.brand === "SteamOne"))
    );
  }, [allProducts]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // Reveal sections as they enter the viewport (see useReveal).
  useReveal([isLoading, products.length]);

  return (
    <div className="app">
      {SHOW_MARKETING_SECTIONS && (
      <>
      {/* ---------------- 0. App Store Deep-Linking / Smart Banner (iOS, Android & Desktop) ---------------- */}
      <AppSmartBanner />

      {/* ---------------- 1. Top Quick Action Utility Bar & Announcements ---------------- */}
      <div className="quick-action-utility-bar">
        <div className="utility-bar-wrap">
          <div className="utility-left-links">
            <button
              type="button"
              className="utility-link vendor-entry-btn"
              onClick={() => {
                setVendorPortalInitialTab("onboarding");
                setIsVendorPortalOpen(true);
              }}
              title="Sell on Vroom Style(s) Marketplace"
            >
              <span className="utility-icon">🏪</span>
              <strong>Sell on Vroom</strong>
              <span className="utility-tag">0% Fee</span>
            </button>

            <span className="utility-sep">•</span>

            <button
              type="button"
              className="utility-link vendor-hub-btn"
              onClick={() => {
                setVendorPortalInitialTab("hub");
                setIsVendorPortalOpen(true);
              }}
              title="3P Merchant Portal & Drops Manager"
            >
              <span className="utility-icon">🏢</span>
              <span>Vendor Hub</span>
            </button>

            <span className="utility-sep">•</span>

            <button
              type="button"
              className="utility-link jforce-entry-btn"
              onClick={() => setIsJForcePortalOpen(true)}
              title="Earn 12% Commission on Client Orders"
            >
              <span className="utility-icon">💼</span>
              <strong>JForce Network</strong>
              <span className="utility-tag" style={{ background: "#fef08a", color: "#854d0e" }}>12% Earn</span>
            </button>

            <span className="utility-sep">•</span>

            <button
              type="button"
              className="utility-link logistics-entry-btn"
              onClick={() => {
                if (!currentUser) {
                  showToast("Please sign in or enter your Order ID to track");
                  setIsAuthOpen(true);
                } else {
                  setIsTrackingOpen(true);
                }
              }}
              title="Track nationwide shipment"
            >
              <span className="utility-icon">🚚</span>
              <span>Logistics & Order Tracking</span>
            </button>

            <span className="utility-sep">•</span>

            <button
              type="button"
              className="utility-link vroom-delivery-entry-btn"
              onClick={() => {
                setVroomDeliveryInitialTab("calculator");
                setIsVroomDeliveryOpen(true);
              }}
              title="Vroom Delivery — Parcel Shipping & Rate Calculator"
            >
              <span className="utility-icon">📦</span>
              <strong>Vroom Delivery</strong>
              <span className="utility-tag delivery-tag">Parcel Hub</span>
            </button>

            <span className="utility-sep">•</span>

            <span className="utility-notice">
              ⚡ Free Express Delivery on orders over ₦100,000 • 7-Day Doorstep Returns
            </span>
          </div>

          <div className="utility-right-links">
            <button
              type="button"
              className="utility-region-btn"
              onClick={() => setIsCountrySwitcherOpen(true)}
              title={`Switch Country / Regional Storefront (Current: ${currentRegion.name})`}
            >
              <span className="utility-flag">{currentRegion.flag}</span>
              <span className="utility-region-name">{currentRegion.name}</span>
              <span className="utility-region-tld">.{currentRegion.code.toLowerCase()}</span>
            </button>
            <span className="utility-sep">•</span>
            <button
              type="button"
              className="utility-link"
              onClick={() => setIsHelpModalOpen(true)}
              title="Official Concierge & WhatsApp Support (+234 913 083 1439)"
            >
              <span>24/7 Concierge: +234 913 083 1439</span>
            </button>
            <span className="utility-sep">•</span>
            <button
              type="button"
              className="utility-currency-toggle"
              onClick={() => setCurrency((c) => (c === "NGN" ? "USD" : "NGN"))}
              title="Toggle Currency"
            >
              <span>{currency === "NGN" ? "🇳🇬 NGN (₦)" : "🇺🇸 USD ($)"}</span>
            </button>
          </div>
        </div>
      </div>

      </>
      )}

      {/* ---------------- 2. Sticky Header with Persistent Global Search Portal ---------------- */}
      <header className="topbar">
        <div className="topbar-wrap">
          {/* Brand Logo & Home Reset */}
          <a
            className="brand"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleResetToHome();
            }}
          >
            <span className="brand-mark" aria-hidden="true">V</span>
            <span className="brand-copy">
              <strong>Vroom Style(s)</strong>
              <span>Lagos &middot; Since 2021</span>
            </span>
          </a>

          {/* Center: department index toggle + search portal */}
          <div className="topbar-center">
            <button
              type="button"
              className={`index-trigger ${isMegaMenuOpen ? "is-open" : ""}`}
              onClick={() => setIsMegaMenuOpen((prev) => !prev)}
              aria-expanded={isMegaMenuOpen}
              aria-controls="mega-menu-panel"
            >
              <span className="index-trigger-rule" aria-hidden="true" />
              <span>Index</span>
            </button>

            {/* Center Persistent Search Portal with Auto-Focus & Multi-Taxonomy Routing */}
            <GlobalSearchPortal
            searchQuery={searchQuery}
            selectedTaxonomy={selectedCategory}
            products={products}
            onSearchChange={setSearchQuery}
            onTaxonomyChange={(tax) => {
              setSelectedCategory(tax);
              handleScrollToCatalog();
            }}
            onSelectProduct={handleOpenQuickView}
            onExecuteSearch={handleScrollToCatalog}
            formatPrice={formatPrice}
          />
          </div>

          {/* Right Session Identity & Cart State */}
          <div className="topbar-actions">
            {/* User Session & Identity State: Account Dropdown */}
            <AccountDropdown
              currentUser={currentUser}
              wishlistCount={wishlist.length}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenTracking={() => {
                if (!currentUser) {
                  showToast("Please sign in to track your orders");
                  setIsAuthOpen(true);
                } else {
                  setIsTrackingOpen(true);
                }
              }}
              onOpenWishlist={() => {
                showToast(`You have ${wishlist.length} item(s) in your saved wishlist`);
                handleScrollToCatalog();
              }}
              onOpenAdmin={() => setIsAdminOpen(true)}
              onOpenVendorHub={() => {
                setVendorPortalInitialTab("hub");
                setIsVendorPortalOpen(true);
              }}
              onOpenJForce={() => setIsJForcePortalOpen(true)}
              onOpenVroomDelivery={() => {
                setVroomDeliveryInitialTab("calculator");
                setIsVroomDeliveryOpen(true);
              }}
              onSignOut={handleLogout}
            />

            {/* User Session & Identity State: Help Dropdown */}
            <HelpDropdown
              onOpenHelpCenter={() => setIsHelpModalOpen(true)}
              onOpenTracking={() => {
                if (!currentUser) {
                  showToast("Please sign in to track your orders");
                  setIsAuthOpen(true);
                } else {
                  setIsTrackingOpen(true);
                }
              }}
              onOpenReturns={() => setIsHelpModalOpen(true)}
              onOpenContact={() => setIsHelpModalOpen(true)}
            />

            {/* Stateful Cart Counter (Cart) */}
            <button
              type="button"
              className={`icon-button cart-btn ${totalCartCount > 0 ? "has-items" : ""}`}
              aria-label={`Shopping Bag with ${totalCartCount} items`}
              onClick={() => setIsCartOpen(true)}
            >
              <span className="cart-icon-graphic">Bag</span>
              <span
                className={`cart-counter-badge ${
                  totalCartCount > 0 ? "badge-active" : "badge-empty"
                }`}
              >
                {totalCartCount}
              </span>
            </button>

            {/* Admin Quick Portal if Admin */}
            {currentUser?.role === "ADMIN" && (
              <button
                type="button"
                className="admin-badge-btn"
                onClick={() => setIsAdminOpen(true)}
                title="Store Retail Intelligence"
              >
                Analytics
              </button>
            )}
          </div>
        </div>

        {/* Multi-Tiered Taxonomy Navigation: Horizontal quick links bar */}
        <nav className="dept-bar" aria-label="Departments">
          <div className="dept-bar-inner">
            <CategoryMegaMenu
              showTrigger={false}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setIsMegaMenuOpen(false);
                handleScrollToCatalog();
              }}
              onSearchQuery={(q) => setSearchQuery(q)}
              isOpen={isMegaMenuOpen}
              onToggle={setIsMegaMenuOpen}
            />
            {DEPARTMENTS.map((dept) => {
              const isActive = selectedCategory === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  className={`dept-link ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => {
                    setSelectedCategory(dept);
                    handleScrollToCatalog();
                  }}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </nav>

      </header>

      {/* ---------------- 3. Main Page Body ---------------- */}
      <main className="page-wrap">
        {/* Hero — one image, one line, two doors. */}
        <section className="hero">
          <div className="hero-copy">
            <span className="kicker">Autumn 2026 &mdash; The First Cut</span>

            <h1>
              Elegance
              <em>in motion</em>
            </h1>

            <p className="subtitle">
              Considered clothing and signature accessories, cut in small runs from
              mulberry silk, Grade-A cashmere and Italian calfskin. Delivered
              nationwide within 24 hours.
            </p>

            <div className="hero-cta">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Shop the collection
              </button>
            </div>

            <dl className="hero-facts">
              <div>
                <dt>Dispatch</dt>
                <dd>24 hours</dd>
              </div>
              <div>
                <dt>Returns</dt>
                <dd>7 days</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>Card or cash</dd>
              </div>
            </dl>
          </div>

          <figure className="hero-image">
            <div className="hero-photo-wrap">
              <img
                src="/images/hero.jpg"
                alt=""
                className="hero-photo-img"
                loading="eager"
                decoding="async"
              />
            </div>
            <figcaption className="hero-caption">
              <span className="hero-caption-index">01</span>
              <span className="hero-caption-text">
                Belted tailored blazer &mdash; mulberry silk
              </span>
            </figcaption>
          </figure>
        </section>

        {/* ---------------- 4. Value Proposition Trust Bar ---------------- */}
        <section className="trust-bar" data-reveal aria-label="Service">
          <div className="trust-item">
            <strong>24h dispatch</strong>
            <span>Nationwide, Lagos to Abuja</span>
          </div>
          <div className="trust-item">
            <strong>7-day returns</strong>
            <span>Unworn, with tags</span>
          </div>
          <div className="trust-item">
            <strong>Pay on delivery</strong>
            <span>Card, POS or cash at the door</span>
          </div>
          <div className="trust-item">
            <strong>Paystack secured</strong>
            <span>Encrypted checkout</span>
          </div>
        </section>

{SHOW_MARKETING_SECTIONS && (
        <>
        {/* ---------------- 5. Real-Time Flash Sale Countdown Engine ---------------- */}
        <FlashSaleSection
          products={products}
          onSelectProduct={handleOpenQuickView}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
          onViewAllFlashSales={() => {
            setCampaign("flash_sale");
            handleScrollToCatalog();
          }}
        />

        {/* ---------------- 6. Marketing & Campaign Banner Grids (Affiliate Attribution) ---------------- */}
        <CampaignBannerGrid
          onSelectCampaign={handleSelectCampaign}
          activeCampaignKey={activeCampaign}
          onClearCampaign={clearCampaign}
        />

        {/* ---------------- 7. Collections / Category Spotlight ---------------- */}
        <section className="section-label">
          <h2>Shop by Category</h2>
          <span>Curated Selections</span>
        </section>

        <section className="collection-strip">
          {[
            { id: "01", title: "🚗 Vroom Motors (30 Cars)", cat: "Cars" },
            { id: "02", title: "🧊 Fridges & Freezers (30)", cat: "Fridges" },
            { id: "03", title: "📻 Smart Microwaves (30)", cat: "Microwaves" },
            { id: "04", title: "🍳 Kitchen Utensils (30)", cat: "Kitchen Utensils" },
            { id: "05", title: "🛋️ Designer Furniture (30)", cat: "Furniture" },
            { id: "06", title: "📺 Cinematic 4K/8K TVs (30)", cat: "TVs" },
            { id: "07", title: "💻 Laptops & Ultrabooks (30)", cat: "Laptops" },
            { id: "08", title: "🖥️ Studio Monitors (30)", cat: "Monitors" },
            { id: "09", title: "👗 Fashion & Atelier", cat: "Fashion & Atelier" },
          ].map((col) => (
            <article
              key={col.id}
              className={`collection-card ${selectedCategory === col.cat ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(col.cat);
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="collection-index">{col.id}</span>
              <span className="collection-title">{col.title}</span>
              <span className="collection-arrow">→</span>
            </article>
          ))}
        </section>

        {/* ---------------- 8. Curated Recommendation Rails: Recently Viewed ---------------- */}
        {recentlyViewed.length > 0 && (
          <RecommendationRail
            title="Recently Viewed Pieces"
            subtitle="Pick up right where you left off"
            kicker="Browsing history"
            products={recentlyViewed}
            formatPrice={formatPrice}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleOpenQuickView}
            onOpenLightbox={handleOpenLightbox}
            onAddToCart={handleAddToCart}
            onClearRail={clearHistory}
          />
        )}

        {/* ---------------- 9. Curated Recommendation Rails: Based on Your Search ---------------- */}
        {searchQuery.trim().length > 0 && searchBasedProducts.length > 0 && (
          <RecommendationRail
            title={`Based on your search for "${searchQuery}"`}
            subtitle="Pieces that go with what you were just looking at."
            kicker="Based on what you searched"
            products={searchBasedProducts}
            formatPrice={formatPrice}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleOpenQuickView}
            onOpenLightbox={handleOpenLightbox}
            onAddToCart={handleAddToCart}
            onViewAll={() => handleScrollToCatalog()}
          />
        )}

        {/* ---------------- 10. Curated Recommendation Rails: Top Selling & Customer Faves ---------------- */}
        <RecommendationRail
          title="What everyone is buying"
          subtitle="Ranked by what has actually left the shelf this month."
          kicker="Bestsellers"
          
          products={topSellingProducts}
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onViewAll={(cat) => {
            setSelectedCategory(cat || "All");
            handleScrollToCatalog();
          }}
        />

        {/* ---------------- 11. Dedicated Brand Portal Section (Authorized Flagships) ---------------- */}
        <BrandPortalSection
          products={products}
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onExploreBrandCatalog={(brandName) => {
            setSearchQuery(brandName);
            setSelectedCategory("All");
            handleScrollToCatalog();
          }}
        />

        {/* ---------------- Dedicated Vroom Motors Showroom Section (30 Cars) ---------------- */}
        <CarsShowroomSection
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onViewAllCars={() => {
            setSelectedCategory("Cars");
            handleScrollToCatalog();
          }}
          onOpenPromptStudio={handleOpenPromptStudio}
        />

        {/* ---------------- Dedicated Home Appliances Section (Fridges, Microwaves, Utensils - 30 each) ---------------- */}
        <HomeAppliancesSection
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleScrollToCatalog();
          }}
          onOpenPromptStudio={handleOpenPromptStudio}
        />

        {/* ---------------- Dedicated Tech & Living Showcase (TVs, Laptops, Monitors, Furniture - 30 each) ---------------- */}
        <TechLivingSection
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleScrollToCatalog();
          }}
          onOpenPromptStudio={handleOpenPromptStudio}
        />

        </>
      )}

        {/* ---------------- 12. Main Product Catalog Section ---------------- */}
        <Breadcrumbs
          selectedTaxonomy={selectedCategory}
          searchQuery={searchQuery}
          activeProduct={quickViewProduct}
          onResetToHome={handleResetToHome}
          onSelectTaxonomy={(tax) => {
            setSelectedCategory(tax);
            handleScrollToCatalog();
          }}
          onClearSearch={() => setSearchQuery("")}
        />

        <section id="catalog-section" className="catalog-container" data-reveal>
          <div className="catalog-header-bar">
            <div className="catalog-title-block">
              <span className="kicker">
                {selectedCategory === "All" ? "The collection" : selectedCategory}
              </span>
              <h2 className="catalog-title">
                {searchQuery.trim()
                  ? `“${searchQuery.trim()}”`
                  : selectedCategory === "All"
                    ? "Autumn 2026"
                    : selectedCategory}
              </h2>
            </div>
            <div className="catalog-meta">
              {isError ? (
                <button
                  onClick={() => refetch()}
                  className="catalog-retry-btn"
                  title={`The catalogue did not load: ${error?.message || "the server could not be reached"}. Click to try again.`}
                >
                  Try again
                </button>
              ) : (
                <span className="catalog-count">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
                </span>
              )}
              <button
                type="button"
                className={`catalog-filter-toggle ${isFilterPanelOpen ? "is-open" : ""}`}
                onClick={() => setIsFilterPanelOpen((v) => !v)}
                aria-expanded={isFilterPanelOpen}
                aria-controls="catalog-filters"
              >
                <span className="catalog-filter-toggle-rule" aria-hidden="true" />
                <span>Filter</span>
                {(sellerTypeFilter !== "ALL" || isPodFilterActive) && (
                  <span className="catalog-filter-dot" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {isFilterPanelOpen && (
            <div className="catalog-filter-panel" id="catalog-filters">
              <div className="catalog-filter-group">
                <span className="catalog-filter-label">Category</span>
                <div className="catalog-filter-tabs">
                  {(() => {
                    const seen = new Set<string>();
                    const cats = ["All", ...products.map((p) => p.category).filter(Boolean)];
                    return cats.filter((cat) => {
                      if (!cat || seen.has(cat)) return false;
                      seen.add(cat);
                      return true;
                    });
                  })().map((cat) => (
                    <button
                      key={cat}
                      className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog-filter-group">
                <span className="catalog-filter-label">Source</span>
                <div className="catalog-filter-tabs">
                  <button
                    type="button"
                    className={`filter-pill ${sellerTypeFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setSellerTypeFilter("ALL")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${sellerTypeFilter === "1P" ? "active" : ""}`}
                    onClick={() => setSellerTypeFilter("1P")}
                    title="First-party, made in the Vroom atelier"
                  >
                    Atelier
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${sellerTypeFilter === "3P" ? "active" : ""}`}
                    onClick={() => setSellerTypeFilter("3P")}
                    title="Verified third-party partners"
                  >
                    Partners
                  </button>
                </div>
              </div>

              <div className="catalog-filter-group">
                <span className="catalog-filter-label">Settlement</span>
                <div className="catalog-filter-tabs">
                  <button
                    type="button"
                    className={`filter-pill ${isPodFilterActive ? "active" : ""}`}
                    onClick={() => setIsPodFilterActive((prev) => !prev)}
                    title="Inspect on arrival, then settle by POS or cash"
                  >
                    Pay on delivery
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="catalog-filter-reset"
                onClick={() => {
                  setSellerTypeFilter("ALL");
                  setIsPodFilterActive(false);
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-notice">
              <p>
                {searchQuery.trim()
                  ? `Nothing in ${selectedCategory === "All" ? "the collection" : selectedCategory} matches “${searchQuery.trim()}”.`
                  : `Nothing in ${selectedCategory === "All" ? "the collection" : selectedCategory} right now.`}
              </p>
              <button
                className="secondary-button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <section className="product-grid" id="catalog-results-grid">
                {paginatedCatalogProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                    isFavorited={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={handleOpenQuickView}
                    onOpenLightbox={handleOpenLightbox}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </section>

              {/* Main Catalog Pagination Bar (Lazy page slicing) */}
              {filteredProducts.length > catalogPageSize && (
                <div className="catalog-pagination-container">
                  <span className="pagination-count-summary">
                    {String((catalogCurrentPage - 1) * catalogPageSize + 1).padStart(3, "0")}
                    &ndash;
                    {String(
                      Math.min(catalogCurrentPage * catalogPageSize, filteredProducts.length)
                    ).padStart(3, "0")}
                    <span className="pagination-of"> of </span>
                    {String(filteredProducts.length).padStart(3, "0")}
                  </span>

                  <div className="pagination-controls-row">
                    <button
                      type="button"
                      className="pagination-arrow-btn"
                      disabled={catalogCurrentPage === 1}
                      onClick={() => handleCatalogPageChange(Math.max(1, catalogCurrentPage - 1))}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="pagination-arrow-btn"
                      disabled={catalogCurrentPage >= totalCatalogPages}
                      onClick={() =>
                        handleCatalogPageChange(Math.min(totalCatalogPages, catalogCurrentPage + 1))
                      }
                    >
                      Next
                    </button>
                  </div>

                  <label className="pagination-page-size-selector" htmlFor="catalog-page-size">
                    <select
                      id="catalog-page-size"
                      value={catalogPageSize}
                      onChange={(e) => {
                        setCatalogPageSize(Number(e.target.value));
                        setCatalogCurrentPage(1);
                      }}
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={48}>48 per page</option>
                    </select>
                  </label>
                </div>
              )}
            </>
          )}
        </section>

{SHOW_MARKETING_SECTIONS && (
        <>
        {/* ---------------- 13. Category Specific Feed: Smart Living & Tech Deals ---------------- */}
        <RecommendationRail
          title="For the desk and the wardrobe"
          subtitle="Steamers, chargers and desk pieces that earn the space they take."
          kicker="Tech and living"
          
          products={techDealsProducts}
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          viewAllCategory="Phones & Tablets"
          onViewAll={(cat) => {
            setSelectedCategory(cat || "Phones & Tablets");
            handleScrollToCatalog();
          }}
        />

        {/* ---------------- 13b. Conversion Enabler: Payment on Delivery (PoD) Essentials Rail ---------------- */}
        <RecommendationRail
          title="Pay when it reaches you"
          subtitle="Open the box, look it over, then settle by card, POS or cash. Lagos, Abuja and Port Harcourt."
          kicker="Paid at the door"
          
          products={podEligibleProducts}
          formatPrice={formatPrice}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={handleOpenQuickView}
          onOpenLightbox={handleOpenLightbox}
          onAddToCart={handleAddToCart}
          onViewAll={() => {
            setIsPodFilterActive(true);
            handleScrollToCatalog();
          }}
        />

        {/* ---------------- Integrated Delivery Services (Vroom Delivery) Showcase Banner ---------------- */}
        <section className="vroom-delivery-showcase-banner" aria-labelledby="delivery-title">
          <div className="delivery-layout">
            <div className="delivery-copy">
              <span className="showcase-kicker">Vroom Delivery</span>
              <h2 className="showcase-title" id="delivery-title">
                We can move it for you, too
              </h2>
              <p className="showcase-lede">
                Same-day dispatch inside Lagos and Abuja, interstate line-haul, and cash
                or POS collected at the door. Available for our own orders and for other
                merchants.
              </p>
              <div className="delivery-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setVroomDeliveryInitialTab("calculator");
                    setIsVroomDeliveryOpen(true);
                  }}
                >
                  Calculate a rate
                </button>
                <button
                  type="button"
                  className="showcase-link"
                  onClick={() => {
                    setVroomDeliveryInitialTab("track");
                    setIsVroomDeliveryOpen(true);
                  }}
                >
                  Track a waybill
                </button>
                <button
                  type="button"
                  className="showcase-link is-quiet"
                  onClick={() => {
                    setVroomDeliveryInitialTab("api");
                    setIsVroomDeliveryOpen(true);
                  }}
                >
                  Merchant API
                </button>
              </div>
            </div>

            <dl className="delivery-facts">
              <div>
                <dt>Inside the city</dt>
                <dd>3–5 hours</dd>
              </div>
              <div>
                <dt>At the door</dt>
                <dd>POS or cash collection</dd>
              </div>
              <div>
                <dt>In transit</dt>
                <dd>Insured to full value</dd>
              </div>
            </dl>
          </div>
        </section>

        </>
      )}

        {/* ---------------- 7. Quality & Craftsmanship Pillars ---------------- */}
        <section className="feature-band" data-reveal>
          <article className="feature">
            <span className="feature-title">Premium fabrics</span>
            <p className="feature-copy">
              Mulberry silk, Grade-A cashmere, Italian calfskin leather, and heavy combed cotton.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">Tailored fit</span>
            <p className="feature-copy">
              Architectural silhouettes designed for versatile movement, comfortable all-day wear, and effortless presence.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">Made to endure</span>
            <p className="feature-copy">
              Reinforced construction and thoughtful finishing details built to look exceptional season after season.
            </p>
          </article>
        </section>

        {/* ---------------- 6. User Retention & Growth: VIP Newsletter Acquisition ---------------- */}
        <section className="newsletter-retention-section" data-reveal>
          <NewsletterSubscription onSuccessToast={showToast} variant="banner" />
        </section>
      </main>

      {/* ---------------- 6. Direct Messaging Integration: WhatsApp (+234 913 083 1439) & Live Concierge Chat ---------------- */}
      <LiveChatConcierge
        onOpenTracking={() => {
          if (!currentUser) {
            showToast("Please sign in or enter your Order ID to track");
            setIsAuthOpen(true);
          } else {
            setIsTrackingOpen(true);
          }
        }}
        onOpenVroomDelivery={() => {
          setVroomDeliveryInitialTab("calculator");
          setIsVroomDeliveryOpen(true);
        }}
      />

      {/* ---------------- Modals & Drawers ---------------- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        currency={currency}
        formatPrice={formatPrice}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        formatPrice={formatPrice}
        onOpenLightbox={handleOpenLightbox}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        formatPrice={formatPrice}
      />

      <CartFeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        status={feedbackModal.status}
        product={feedbackModal.product}
        selectedSize={feedbackModal.selectedSize}
        selectedColor={feedbackModal.selectedColor}
        onOpenCart={() => setIsCartOpen(true)}
        formatPrice={formatPrice}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        formatPrice={formatPrice}
        initialOrderId={trackingOrderId}
      />

      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderId={confirmedOrderDetails?.orderId || ""}
        reference={confirmedOrderDetails?.reference || ""}
        total={confirmedOrderDetails?.total || 0}
        formatPrice={formatPrice}
        onTrackOrder={(orderId) => {
          setIsSuccessModalOpen(false);
          setTrackingOrderId(orderId);
          setIsTrackingOpen(true);
        }}
        isPod={confirmedOrderDetails?.isPod}
        podAddress={confirmedOrderDetails?.podAddress}
        podCity={confirmedOrderDetails?.podCity}
        podPhone={confirmedOrderDetails?.podPhone}
      />

      {/* Multi-Tenant Marketplace Vendor Portal ("Become a Seller" & "Vendor Hub") */}
      <VendorPortalModal
        isOpen={isVendorPortalOpen}
        onClose={() => setIsVendorPortalOpen(false)}
        initialTab={vendorPortalInitialTab}
        onSuccessToast={showToast}
        onAddNewProduct={(newProd) => {
          setVendorDrops((prev) => [newProd, ...prev]);
        }}
        formatPrice={formatPrice}
      />

      {/* JForce Affiliate / Reseller Consultant Network Modal */}
      <JForcePortalModal
        isOpen={isJForcePortalOpen}
        onClose={() => setIsJForcePortalOpen(false)}
        onSuccessToast={showToast}
        formatPrice={formatPrice}
      />

      {/* Integrated Delivery Services (Vroom Delivery Micro-Services) Modal */}
      <VroomDeliveryModal
        isOpen={isVroomDeliveryOpen}
        onClose={() => setIsVroomDeliveryOpen(false)}
        formatPrice={formatPrice}
        onSuccessToast={showToast}
        initialTab={vroomDeliveryInitialTab}
      />

      {/* Customer Help & Concierge Center Modal */}
      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenTracking={() => {
          if (!currentUser) {
            showToast("Please sign in to track your orders");
            setIsAuthOpen(true);
          } else {
            setIsTrackingOpen(true);
          }
        }}
      />

      {/* Seasonal Mystery Scavenger Hunt Modal */}
      <ScavengerHuntModal
        isOpen={isScavengerModalOpen}
        onClose={() => setIsScavengerModalOpen(false)}
        onClaimVoucher={(code) => {
          showToast(`Voucher ${code} applied! ₦15,000 seasonal savings unlocked.`);
          setCampaign("scavenger_hunt");
          handleScrollToCatalog();
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------- 7. Footer Architecture: 5-Column Grid, Regional Routing & Trust Verification ---------------- */}
      <Footer
        currentRegion={currentRegion}
        onOpenCountrySwitcher={() => setIsCountrySwitcherOpen(true)}
        onOpenCompliance={(tab = "dispute") => {
          setComplianceInitialTab(tab);
          setIsComplianceModalOpen(true);
        }}
        onOpenVendorHub={() => {
          setVendorPortalInitialTab("hub");
          setIsVendorPortalOpen(true);
        }}
        onOpenBecomeSeller={() => {
          setVendorPortalInitialTab("onboarding");
          setIsVendorPortalOpen(true);
        }}
        onOpenJForce={() => setIsJForcePortalOpen(true)}
        onOpenVroomDelivery={() => {
          setVroomDeliveryInitialTab("calculator");
          setIsVroomDeliveryOpen(true);
        }}
        onOpenTracking={() => {
          if (!currentUser) {
            showToast("Please sign in or enter your Order ID to track");
            setIsAuthOpen(true);
          } else {
            setIsTrackingOpen(true);
          }
        }}
        onOpenPoDFilter={() => {
          setIsPodFilterActive(true);
          handleScrollToCatalog();
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onShowToast={showToast}
      />

      {/* ---------------- NDPR & GDPR Cookie Consent Banner ---------------- */}
      {isCookieCardVisible && (
      <CookieConsentBanner
        onOpenCookieSettings={() => {
          setComplianceInitialTab("cookies");
          setIsComplianceModalOpen(true);
        }}
        onSuccessToast={showToast}
      />
      )}

      {/* ---------------- Pan-African Regional Storefront Switcher Modal ---------------- */}
      <CountrySwitcherModal
        isOpen={isCountrySwitcherOpen}
        onClose={() => setIsCountrySwitcherOpen(false)}
        currentRegion={currentRegion}
        onSelectRegion={setCurrentRegion}
        onSuccessToast={showToast}
      />

      {/* ---------------- Dispute Protocols, Return Timelines, Cookies & Trust Verification Modal ---------------- */}
      <ComplianceModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        initialTab={complianceInitialTab}
        onSuccessToast={showToast}
      />

      {/* ---------------- AI Image Generation Prompt Studio Modal (240 Prompts across 8 Categories) ---------------- */}
      <PromptStudioModal
        isOpen={isPromptStudioOpen}
        onClose={() => setIsPromptStudioOpen(false)}
        initialCategory={promptStudioInitialCategory}
      />

      {/* ---------------- High-Resolution Multi-Angle Image Lightbox Modal ---------------- */}
      <ImageLightboxModal
        product={lightboxProduct}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        initialIndex={lightboxInitialIndex}
        formatPrice={formatPrice}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default App;