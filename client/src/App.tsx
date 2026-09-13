import { useEffect, useState } from "react";
import api from "./services/api";
import "./styles.css";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const testBackend = async () => {
            try {
                const response = await api.get("/health");
                setMessage(response.data.message);
            } catch (error) {
                console.error("Backend connection failed:", error);
            }
        };
        testBackend();
    }, []);

    return (
        <div className="app">
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
                        <a href="#">New In</a>
                        <a href="#">Women</a>
                        <a href="#">Men</a>
                        <a href="#">Collections</a>
                        <a href="#">Accessories</a>
                    </nav>

                    <div className="topbar-actions">
                        <input className="search" placeholder="Search" />
                        <button className="icon-button" aria-label="Account">♡</button>
                        <button className="icon-button" aria-label="Cart">Bag</button>
                    </div>
                </div>
            </header>

            <main className="page-wrap">
                <section className="hero">
                    <section className="hero-copy">
                        <span className="kicker">The Summer Edit</span>
                        <h1>Quiet Luxury Objects</h1>
                        <p className="subtitle">
                            Thoughtful clothing, accessories, and wardrobe objects shaped for the everyday ritual.
                        </p>

                        <div className="hero-cta">
                            <button className="primary-button">Shop Collection</button>
                            <button className="secondary-button">Lookbook</button>
                        </div>

                        <div className="hero-metrics">
                            <div>
                                <span className="metric-value">24h</span><br />
                                <span className="metric-label">Express Dispatch</span>
                            </div>
                            <div>
                                <span className="metric-value">07</span><br />
                                <span className="metric-label">Curated Drops</span>
                            </div>
                            <div>
                                <span className="metric-value">01</span><br />
                                <span className="metric-label">Quiet Standard</span>
                            </div>
                        </div>
                    </section>

                    <section className="hero-image">
                        <div className="hero-photo"></div>
                    </section>
                </section>

                <section className="section-label">
                    <h2>Collections</h2>
                    <span>{message || "Vroom Style(s) Online"}</span>
                </section>

                <section className="collection-strip">
                    <article className="collection-card">
                        <span className="collection-index">01</span>
                        <span className="collection-title">Soft Structure</span>
                        <span className="collection-arrow">→</span>
                    </article>
                    <article className="collection-card">
                        <span className="collection-index">02</span>
                        <span className="collection-title">Everyday Icons</span>
                        <span className="collection-arrow">→</span>
                    </article>
                    <article className="collection-card">
                        <span className="collection-index">03</span>
                        <span className="collection-title">Weekend Layers</span>
                        <span className="collection-arrow">→</span>
                    </article>
                    <article className="collection-card">
                        <span className="collection-index">04</span>
                        <span className="collection-title">Object Edit</span>
                        <span className="collection-arrow">→</span>
                    </article>
                </section>

                <section className="section-label">
                    <h2>Featured Products</h2>
                    <span>01 / 2026</span>
                </section>

                <section className="product-grid">
                    <article className="product-card">
                        <div className="product-image">01</div>
                        <div className="meta">
                            <span className="product-category">Women / Dress</span>
                            <span className="product-name">Contour Dress</span>
                            <div className="product-details">
                                <span className="product-price">$56.00</span>
                                <span className="stock">In stock</span>
                            </div>
                            <button className="product-add">Add to Bag</button>
                        </div>
                    </article>

                    <article className="product-card">
                        <div className="product-image">02</div>
                        <div className="meta">
                            <span className="product-category">Accessories</span>
                            <span className="product-name">Signature Tote</span>
                            <div className="product-details">
                                <span className="product-price">$72.00</span>
                                <span className="stock">In stock</span>
                            </div>
                            <button className="product-add">Add to Bag</button>
                        </div>
                    </article>

                    <article className="product-card">
                        <div className="product-image">03</div>
                        <div className="meta">
                            <span className="product-category">Women / Knitwear</span>
                            <span className="product-name">Arc Knit</span>
                            <div className="product-details">
                                <span className="product-price">$45.00</span>
                                <span className="stock">In stock</span>
                            </div>
                            <button className="product-add">Add to Bag</button>
                        </div>
                    </article>

                    <article className="product-card">
                        <div className="product-image">04</div>
                        <div className="meta">
                            <span className="product-category">Men / Outerwear</span>
                            <span className="product-name">Field Overshirt</span>
                            <div className="product-details">
                                <span className="product-price">$78.00</span>
                                <span className="stock">Low stock</span>
                            </div>
                            <button className="product-add">Add to Bag</button>
                        </div>
                    </article>
                </section>

                <section className="feature-band">
                    <article className="feature">
                        <span className="feature-title">01 / Material</span>
                        <p className="feature-copy">Organic cotton, washed wool, and slow-made finishing details.</p>
                    </article>
                    <article className="feature">
                        <span className="feature-title">02 / Fit</span>
                        <p className="feature-copy">A balanced wardrobe with clean lines and confident movement.</p>
                    </article>
                    <article className="feature">
                        <span className="feature-title">03 / Care</span>
                        <p className="feature-copy">Designed for longevity and a slower conversation with clothing.</p>
                    </article>
                </section>

                <section className="auth-showcase">
                    <div className="auth-heading">
                        <div>
                            <span className="kicker">Customer Access</span>
                            <h2>Welcome to Vroom Style(s)</h2>
                        </div>
                        <span className="auth-badge">Members Only</span>
                    </div>

                    <div className="auth-grid">
                        <article className="auth-panel login-panel">
                            <div className="panel-top">
                                <span className="panel-label">Existing customer</span>
                                <span className="panel-icon">↗</span>
                            </div>
                            <h3>Login</h3>
                            <form className="auth-form">
                                <label className="field-label">
                                    <span>Email address</span>
                                    <input type="email" placeholder="customer@example.com" />
                                </label>
                                <label className="field-label">
                                    <span>Password</span>
                                    <input type="password" placeholder="••••••••" />
                                </label>
                                <div className="form-row">
                                    <label className="check-row">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a className="small-link" href="#">Forgot password?</a>
                                </div>
                                <button className="primary-button full-button">Login to account</button>
                            </form>
                        </article>

                        <article className="auth-panel register-panel">
                            <div className="panel-top">
                                <span className="panel-label">New customer</span>
                                <span className="panel-icon">+</span>
                            </div>
                            <h3>Create account</h3>
                            <form className="auth-form">
                                <label className="field-label">
                                    <span>First name</span>
                                    <input type="text" placeholder="First name" />
                                </label>
                                <label className="field-label">
                                    <span>Last name</span>
                                    <input type="text" placeholder="Last name" />
                                </label>
                                <label className="field-label">
                                    <span>Email address</span>
                                    <input type="email" placeholder="newcustomer@example.com" />
                                </label>
                                <label className="field-label">
                                    <span>Password</span>
                                    <input type="password" placeholder="Create password" />
                                </label>
                                <button className="secondary-button full-button">Register now</button>
                            </form>
                        </article>
                    </div>
                </section>

                <section className="admin-summary">
                    <div>
                        <span className="kicker">Store Dashboard</span>
                        <h2>Retail Intelligence</h2>
                    </div>
                    <div className="admin-stats">
                        <div className="stat-box">
                            <strong>248</strong>
                            <span>Products</span>
                        </div>
                        <div className="stat-box">
                            <strong>36</strong>
                            <span>Orders</span>
                        </div>
                        <div className="stat-box">
                            <strong>18k</strong>
                            <span>Revenue</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-wrap">
                    <span className="footer-copy">© 2026 Vroom Style(s)</span>
                    <nav className="footer-links">
                        <a href="#">Instagram</a>
                        <a href="#">Lookbook</a>
                        <a href="#">Care Guide</a>
                        <a href="#">Contact</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

export default App;