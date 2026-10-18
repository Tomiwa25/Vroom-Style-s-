import { useEffect, useState, useMemo } from "react";
import api from "./services/api";
import { initialProducts } from "./data/products";
import type { Product, CartItem, User } from "./types";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { QuickViewModal } from "./components/QuickViewModal";
import { AdminModal } from "./components/AdminModal";
import "./styles.css";

function App() {
  // Store Catalog
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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

  // Fetch live products from backend (with graceful fallback to curated collection)
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await api.get("/products?limit=12");
        if (res.data?.data?.products && res.data.data.products.length > 0) {
          // Merge remote products while preserving rich images & attributes
          const liveList: Product[] = res.data.data.products.map(
            (p: Record<string, unknown>, idx: number) => {
              const fallback = initialProducts[idx % initialProducts.length];
              const pImage = typeof p.image === "string" ? p.image : "";
              return {
                id: (p.id as string) || `live-${idx}`,
                name: (p.name as string) || fallback.name,
                description: (p.description as string) || fallback.description,
                price: Number(p.price) || fallback.price,
                image: pImage.startsWith("http") ? pImage : fallback.image,
                category: (p.category as string) || fallback.category,
                stock: (p.stock as number) ?? fallback.stock,
                tag: fallback.tag,
                colors: fallback.colors,
                sizes: fallback.sizes,
                fitGuide: fallback.fitGuide,
                material: fallback.material,
              };
            }
          );
          setProducts(liveList);
        }
      } catch (err) {
        console.log("Operating with curated atelier local cache", err);
      }
    };

    fetchLiveProducts();
  }, []);

  // Currency Converter Formatter (1 USD ≈ 1,500 NGN)
  const formatPrice = (amountInNGN: number): string => {
    if (currency === "USD") {
      const inUSD = amountInNGN / 1500;
      return `$${inUSD.toFixed(2)}`;
    }
    return `₦${amountInNGN.toLocaleString()}`;
  };

  // Add to Cart
  const handleAddToCart = (
    product: Product,
    size?: string,
    color?: string,
    quantity: number = 1
  ) => {
    const chosenSize = size || product.sizes?.[0] || "Standard";
    const chosenColor = color || product.colors?.[0]?.name || "Atelier Tone";

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

    showToast(`Added ${product.name} (${chosenSize}) to your Bag`);
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
      showToast(`Removed ${removedName} from your Bag`);
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      }
      showToast("Saved to your Atelier Wishlist ♡");
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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
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
      {/* ---------------- Top Banner Bar ---------------- */}
      <div className="announcement-banner">
        <span>✨ The Summer Atelier Drop is now live — Worldwide Express Shipping Available</span>
      </div>

      {/* ---------------- Sticky Header ---------------- */}
      <header className="topbar">
        <div className="topbar-wrap">
          <a className="brand" href="#">
            <span className="brand-mark">V</span>
            <span className="brand-copy">
              <strong>Vroom Style(s)</strong>
              <span>atelier collection</span>
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
                placeholder="Search pieces, fabrics..."
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
              className="icon-button wishlist-top-btn"
              aria-label="Wishlist"
              onClick={() => showToast(`You have ${wishlist.length} item(s) in your Wishlist`)}
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
              Intelligence
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Main Page Body ---------------- */}
      <main className="page-wrap">
        {/* Hero Section */}
        <section className="hero">
          <section className="hero-copy">
            <span className="kicker">The Summer Edit</span>
            <h1>Quiet Luxury Objects</h1>
            <p className="subtitle">
              Thoughtful clothing, tailored outerwear, and wardrobe objects
              crafted for the understated daily ritual.
            </p>

            <div className="hero-cta">
              <button
                className="primary-button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Shop Atelier Drop
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  showToast("Summer Lookbook: Photographed in Marseille by Vroom Studio")
                }
              >
                View Lookbook
              </button>
            </div>

            <div className="hero-metrics">
              <div>
                <span className="metric-value">24h</span>
                <br />
                <span className="metric-label">Express Dispatch</span>
              </div>
              <div>
                <span className="metric-value">07</span>
                <br />
                <span className="metric-label">Curated Drops</span>
              </div>
              <div>
                <span className="metric-value">100%</span>
                <br />
                <span className="metric-label">Artisanal Craft</span>
              </div>
            </div>
          </section>

          <section className="hero-image">
            <div className="hero-photo-wrap">
              <img
                src="/images/hero.jpg"
                alt="Quiet Luxury Fashion Editorial"
                className="hero-photo-img"
              />
              <div className="hero-floating-card">
                <span className="floating-card-tag">Atelier Drop 01</span>
                <strong>Washed Wool Belted Blazer</strong>
                <p>Spun in Biella, Italy</p>
              </div>
            </div>
          </section>
        </section>

        {/* Collections Strip */}
        <section className="section-label">
          <h2>Collections</h2>
          <span>Summer 2026 Season</span>
        </section>

        <section className="collection-strip">
          {[
            { id: "01", title: "Soft Structure", cat: "Women" },
            { id: "02", title: "Everyday Icons", cat: "Outerwear" },
            { id: "03", title: "Weekend Layers", cat: "Knitwear" },
            { id: "04", title: "Object Edit", cat: "Accessories" },
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

        {/* Product Catalog Grid Section */}
        <section id="catalog-section" className="catalog-container">
          <div className="catalog-header-bar">
            <div>
              <span className="kicker">Seasonal Catalog</span>
              <h2>Featured Atelier Pieces</h2>
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
                        <span className="stock in">Available</span>
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

        {/* Feature Brand Pillars */}
        <section className="feature-band">
          <article className="feature">
            <span className="feature-title">01 / Material</span>
            <p className="feature-copy">
              Mulberry silk, Grade-A cashmere, Italian calfskin, and slow-woven
              organic cotton.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">02 / Fit</span>
            <p className="feature-copy">
              A balanced wardrobe designed with clean architectural lines and
              confident fluid drape.
            </p>
          </article>
          <article className="feature">
            <span className="feature-title">03 / Care</span>
            <p className="feature-copy">
              Constructed for timeless longevity and an enduring, sustainable
              conversation with style.
            </p>
          </article>
        </section>
      </main>

      {/* ---------------- Floating Concierge Button ---------------- */}
      <a
        href="https://wa.me/?text=Hello%20Vroom%20Style(s)%20Atelier,%20I%20have%20an%20inquiry%20about%20a%20piece"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-stylist-btn"
        title="Chat with a Stylist"
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <span className="toast-icon">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ---------------- Footer ---------------- */}
      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-top-col">
            <div className="footer-brand">
              <span className="brand-mark">V</span>
              <strong>Vroom Style(s) Atelier</strong>
            </div>
            <p className="footer-bio">
              Quiet luxury objects and tailored wardrobe staples shaped for everyday ritual.
            </p>
          </div>

          <div className="footer-newsletter">
            <span className="newsletter-title">Subscribe to Atelier Notes</span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Subscribed to Vroom Style(s) Atelier Notes");
              }}
              className="newsletter-form"
            >
              <input type="email" required placeholder="Enter your email" />
              <button type="submit">Join</button>
            </form>
          </div>

          <div className="footer-bottom-row">
            <span className="footer-copy">© 2026 Vroom Style(s). All rights reserved.</span>
            <nav className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Lookbook Marseille 2026"); }}>Lookbook</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("7-Day Complimentary Returns"); }}>Shipping & Returns</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast("Organic dry clean only"); }}>Care Guide</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsAdminOpen(true); }}>Retail Portal</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;