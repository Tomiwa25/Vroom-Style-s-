import { useEffect, useState, useMemo } from "react";
import type { Product, CartItem, User } from "./types";
import { useProducts } from "./hooks/useProducts";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { QuickViewModal } from "./components/QuickViewModal";
import { AdminModal } from "./components/AdminModal";
import { CartFeedbackModal } from "./components/CartFeedbackModal";
import { OrderTrackingModal } from "./components/OrderTrackingModal";
import "./styles.css";

function App() {
  // Store Catalog managed via TanStack Query
  const { products, isLoading, isError, error, refetch, isLive } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem("vroom_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [cartItems]);

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

    // 3. Display confirmation modal popup
    setFeedbackModal({
      isOpen: true,
      status: "SUCCESS",
      product,
      selectedSize: chosenSize,
      selectedColor: chosenColor,
    });
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

  // Filtered & Deduplicated Products (filters duplicate images so each product card on UI is distinct)
  const filteredProducts = useMemo(() => {
    // 1. Deduplicate by primary image so duplicate sweatshirts/cards don't appear
    const seenImages = new Set<string>();
    const uniqueProducts = products.filter((prod) => {
      const imgKey = prod.image?.trim().toLowerCase();
      if (!imgKey) return true;
      if (seenImages.has(imgKey)) {
        return false;
      }
      seenImages.add(imgKey);
      return true;
    });

    // 2. Apply category and search filters on distinct products
    return uniqueProducts.filter((prod) => {
      const matchesCategory =
        selectedCategory === "All" ||
        prod.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="app">
      {/* ---------------- 1. Top Announcement Bar ---------------- */}
      <div className="announcement-banner">
        <span>⚡ FREE EXPRESS DELIVERY ON ORDERS OVER ₦100,000 • PAYSTACK VERIFIED CHECKOUT • 7-DAY EASY RETURNS</span>
      </div>

      {/* ---------------- 2. Sticky Header ---------------- */}
      <header className="topbar">
        <div className="topbar-wrap">
          <a className="brand" href="#">
            <span className="brand-mark">V</span>
            <span className="brand-copy">
              <strong>Vroom Style(s)</strong>
              <span>Modern Essentials</span>
            </span>
          </a>

          <nav className="main-nav">
            {["All", "Women", "Outerwear", "Knitwear", "Accessories"].map((cat) => (
              <button
                key={cat}
                className={`nav-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                className="search"
                placeholder="Search styles, items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="currency-toggle-btn"
              onClick={() => setCurrency((c) => (c === "NGN" ? "USD" : "NGN"))}
              title="Toggle Currency"
            >
              {currency}
            </button>

            <button
              className="track-order-top-btn"
              onClick={() => {
                if (!currentUser) {
                  showToast("Please sign in to track your orders");
                  setIsAuthOpen(true);
                } else {
                  setIsTrackingOpen(true);
                }
              }}
              title="Track Order Fulfillment"
            >
              <span>🚚</span>
              <span className="track-btn-label">Track</span>
            </button>

            <button
              className="icon-button wishlist-top-btn"
              aria-label="Wishlist"
              onClick={() => showToast(`You have ${wishlist.length} item(s) in your wishlist`)}
            >
              <span className={wishlist.length > 0 ? "heart-active" : ""}>♡</span>
              {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
            </button>

            <button
              className="icon-button user-btn"
              aria-label="Account"
              onClick={() => setIsAuthOpen(true)}
            >
              {currentUser ? (
                <span className="user-avatar-small">
                  {currentUser.firstName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span>👤</span>
              )}
            </button>

            <button
              className="icon-button cart-btn"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <span className="bag-label">Bag</span>
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </button>

            <button
              className="admin-badge-btn"
              onClick={() => setIsAdminOpen(true)}
              title="Store Retail Intelligence"
            >
              Analytics
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- 3. Main Page Body ---------------- */}
      <main className="page-wrap">
        {/* Hero Section with Confirmed Tagline */}
        <section className="hero">
          <section className="hero-copy">
            <span className="kicker">NEW ARRIVALS • 2026</span>
            <h1>Style in Motion</h1>
            <p className="subtitle">
              Premium clothing and signature accessories designed for modern momentum,
              refined comfort, and effortless everyday confidence.
            </p>

            <div className="hero-cta">
              <button
                className="primary-button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Shop New Arrivals
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedCategory("Women");
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Collection
              </button>
            </div>

            <div className="hero-metrics">
              <div>
                <span className="metric-value">24h</span>
                <br />
                <span className="metric-label">Fast Dispatch</span>
              </div>
              <div>
                <span className="metric-value">100%</span>
                <br />
                <span className="metric-label">Premium Fabrics</span>
              </div>
              <div>
                <span className="metric-value">7 Days</span>
                <br />
                <span className="metric-label">Easy Returns</span>
              </div>
            </div>
          </section>

          <section className="hero-image">
            <div className="hero-photo-wrap">
              <img
                src="/images/hero.jpg"
                alt="Vroom Style High Fashion Model"
                className="hero-photo-img"
              />
              <div className="hero-floating-card">
                <span className="floating-card-tag">Trending Now</span>
                <strong>Belted Tailored Blazer Set</strong>
                <p>Designed for versatile day-to-night movement</p>
              </div>
            </div>
          </section>
        </section>

        {/* ---------------- 4. Value Proposition Trust Bar ---------------- */}
        <section className="trust-bar">
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <div className="trust-content">
              <strong>Fast Express Delivery</strong>
              <span>Nationwide 24-48h dispatch</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <div className="trust-content">
              <strong>Secure Payments</strong>
              <span>Encrypted Paystack checkout</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">↺</div>
            <div className="trust-content">
              <strong>7-Day Easy Returns</strong>
              <span>Hassle-free size exchange</span>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">✨</div>
            <div className="trust-content">
              <strong>Authentic Quality</strong>
              <span>100% verified materials</span>
            </div>
          </div>
        </section>

        {/* ---------------- 5. Collections / Category Spotlight ---------------- */}
        <section className="section-label">
          <h2>Shop by Category</h2>
          <span>Curated Selections</span>
        </section>

        <section className="collection-strip">
          {[
            { id: "01", title: "Women's Collection", cat: "Women" },
            { id: "02", title: "Men's Outerwear", cat: "Outerwear" },
            { id: "03", title: "Luxury Knitwear", cat: "Knitwear" },
            { id: "04", title: "Signature Accessories", cat: "Accessories" },
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

        {/* ---------------- 6. Main Product Catalog Section ---------------- */}
        <section id="catalog-section" className="catalog-container">
          <div className="catalog-header-bar">
            <div>
              <span className="kicker">FEATURED COLLECTION</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2>Trending Styles</h2>
                {isLoading && (
                  <span className="catalog-status-badge loading">Syncing Catalog...</span>
                )}
                {isError && (
                  <button
                    onClick={() => refetch()}
                    className="catalog-retry-btn"
                    title={`Failed: ${error?.message || "Server unreachable"}. Click to retry.`}
                  >
                    ⚠ Offline Mode (Click to Retry)
                  </button>
                )}
                {!isLoading && !isError && isLive && (
                  <span className="catalog-status-badge live" title="Connected to live database">
                    ● Live Sync
                  </span>
                )}
              </div>
            </div>
            <div className="catalog-filter-tabs">
              {["All", "Women", "Outerwear", "Knitwear", "Accessories"].map((cat) => (
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

          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-notice">
              <p>No products found matching "{searchQuery}" in {selectedCategory}.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <section className="product-grid">
              {filteredProducts.map((product) => {
                const isFavorited = wishlist.includes(product.id);
                return (
                  <article key={product.id} className="product-card">
                    <div className="product-media-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-card-img"
                        onClick={() => setQuickViewProduct(product)}
                      />
                      {product.tag && (
                        <span className="product-badge">{product.tag}</span>
                      )}
                      <button
                        className={`card-wishlist-btn ${isFavorited ? "active" : ""}`}
                        onClick={() => handleToggleWishlist(product.id)}
                        aria-label="Save to wishlist"
                      >
                        {isFavorited ? "♥" : "♡"}
                      </button>
                      <button
                        className="quick-view-trigger-btn"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        Quick Look
                      </button>
                    </div>

                    <div className="meta">
                      <div className="meta-category-row">
                        <span className="product-category">{product.category}</span>
                        {product.stock <= 3 && (
                          <span className="stock low">Only {product.stock} left</span>
                        )}
                      </div>

                      <h3
                        className="product-name"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        {product.name}
                      </h3>

                      {product.colors && product.colors.length > 0 && (
                        <div className="card-color-swatches">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              className="color-dot"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      )}

                      <div className="product-details">
                        <span className="product-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.stock <= 5 ? (
                          <span className="stock low" title={`${product.stock} items left in stock`}>
                            Only {product.stock} left
                          </span>
                        ) : (
                          <span className="stock in" title={`${product.stock} items in stock`}>
                            {product.stock} in stock
                          </span>
                        )}
                      </div>

                      <button
                        className="product-add"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Bag +
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </section>

        {/* ---------------- 7. Quality & Craftsmanship Pillars ---------------- */}
        <section className="feature-band">
          <article className="feature">
            <span className="feature-title">01 / Premium Fabrics</span>
            <p className="feature-copy">
              Mulberry silk, Grade-A cashmere, Italian calfskin leather, and heavy combed cotton.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">02 / Tailored Fit</span>
            <p className="feature-copy">
              Architectural silhouettes designed for versatile movement, comfortable all-day wear, and effortless presence.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">03 / Made to Endure</span>
            <p className="feature-copy">
              Reinforced construction and thoughtful finishing details built to look exceptional season after season.
            </p>
          </article>
        </section>
      </main>

      {/* ---------------- Floating Stylist Button ---------------- */}
      <a
        href="https://wa.me/?text=Hello%20Vroom%20Style(s),%20I%20have%20an%20inquiry%20about%20a%20product"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-stylist-btn"
        title="Chat with Customer Support"
      >
        <span className="stylist-icon">💬</span>
        <span className="stylist-text">Ask a Stylist</span>
      </a>

      {/* ---------------- Modals & Drawers ---------------- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        currency={currency}
        formatPrice={formatPrice}
        onCheckout={() => {
          showToast("Redirecting to Paystack Secure Checkout...");
        }}
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
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------- Footer ---------------- */}
      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-top-col">
            <div className="footer-brand">
              <span className="brand-mark">V</span>
              <strong>Vroom Style(s)</strong>
            </div>
            <p className="footer-bio">
              Modern essentials and elevated fashion crafted for fast-paced, confident living.
            </p>
          </div>

          <div className="footer-newsletter">
            <span className="newsletter-title">Join the Vroom Style Club</span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Welcome! Check your email for 10% off your first order.");
              }}
              className="newsletter-form"
            >
              <input type="email" required placeholder="Enter your email for 10% off" />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          <div className="footer-bottom-row">
            <span className="footer-copy">© 2026 Vroom Style(s). All rights reserved.</span>
            <nav className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Delivery: 24-48 hours nationwide"); }}>Shipping Information</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("7-Day Hassle-Free Returns & Exchanges"); }}>Returns & Exchanges</a>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                if (!currentUser) {
                  showToast("Please sign in to track your orders");
                  setIsAuthOpen(true);
                } else {
                  setIsTrackingOpen(true);
                }
              }}>Track Order</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("All items dry clean or gentle hand wash"); }}>Care Guide</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsAdminOpen(true); }}>Store Intelligence</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;