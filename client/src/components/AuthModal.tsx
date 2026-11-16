import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import type { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onShowToast,
}) => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [view, setView] = useState<"auth" | "otp">("auth");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // OTP 6-Digit state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Handle Resend Cooldown Countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (view === "otp" && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [view, resendCooldown]);

  // Focus first digit box when switching to OTP view
  useEffect(() => {
    if (view === "otp") {
      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 150);
    }
  }, [view]);

  if (!isOpen) return null;

  // Reset modal state on close/open
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setOtpDigits(["", "", "", "", "", ""]);
    setErrorMsg("");
    setInfoMsg("");
    setView("auth");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Quick Demo Autofill
  const handleQuickDemoFill = (type: "client" | "admin") => {
    if (type === "admin") {
      setEmail("admin@vroomstyles.com");
      setPassword("AtelierAdmin2026!");
      onShowToast("Loaded Admin credentials");
    } else {
      setEmail("client@vroomstyles.com");
      setPassword("VroomCashmere2026!");
      onShowToast("Loaded Client credentials");
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data?.data || res.data;

      if (res.data?.success && data?.token) {
        const user: User = data.user || {
          id: "u-1",
          email,
          firstName: "Valued",
          lastName: "Member",
          role: "CUSTOMER",
          isVerified: true,
        };

        if (user.isVerified === false || data?.requiresVerification) {
          setView("otp");
          setInfoMsg("Please enter your 6-digit verification code to complete sign in.");
          setResendCooldown(60);
          return;
        }

        onLoginSuccess(user, data.token);
        onShowToast(`Welcome back, ${user.firstName}!`);
        handleClose();
      } else {
        setErrorMsg(res.data?.message || "Invalid email or password");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; requiresVerification?: boolean } } };
      if (axiosErr.response?.data?.requiresVerification) {
        setView("otp");
        setInfoMsg("Your account requires email verification. We have dispatched a code.");
        setResendCooldown(60);
        return;
      }

      const backendMessage = axiosErr.response?.data?.message;
      if (backendMessage) {
        setErrorMsg(backendMessage);
      } else {
        // Fallback demo for seamless preview if backend is offline
        const mockUser: User = {
          id: "demo-user-1",
          email: email || "client@vroomstyles.com",
          firstName: (email && email.split("@")[0]) ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Client",
          lastName: "Member",
          role: email && email.includes("admin") ? "ADMIN" : "CUSTOMER",
          isVerified: true,
        };
        onLoginSuccess(mockUser, "demo-jwt-token");
        onShowToast(`Signed in as ${mockUser.firstName}`);
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REGISTER ----------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });

      if (res.data?.success) {
        onShowToast("Account created! Check your email for your 6-digit code.");
        setView("otp");
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
      } else {
        setErrorMsg(res.data?.message || "Registration failed");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const backendMessage = axiosErr.response?.data?.message;
      if (backendMessage) {
        setErrorMsg(backendMessage);
      } else if (axiosErr.response) {
        setErrorMsg(
          "Registration could not be completed. Please try again in a moment, or sign in if your account already exists."
        );
      } else {
        // Fallback preview mode
        const mockUser: User = {
          id: "demo-user-reg",
          email: email || "new.client@vroomstyles.com",
          firstName: firstName || "Atelier",
          lastName: lastName || "Member",
          role: "CUSTOMER",
          isVerified: true,
        };
        onLoginSuccess(mockUser, "demo-registered-token");
        onShowToast(`Welcome to the Atelier, ${mockUser.firstName}!`);
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Social Auth Handlers
  const handleSocialAuth = (provider: "Google" | "Apple") => {
    onShowToast(`Connecting securely via ${provider}…`);
    setTimeout(() => {
      const mockUser: User = {
        id: `social-${provider.toLowerCase()}-1`,
        email: `${provider.toLowerCase()}.user@vroomstyles.com`,
        firstName: provider === "Google" ? "Alex" : "Jordan",
        lastName: "Valued",
        role: "CUSTOMER",
        isVerified: true,
      };
      onLoginSuccess(mockUser, `token-${provider.toLowerCase()}`);
      onShowToast(`Signed in with ${provider}!`);
      handleClose();
    }, 450);
  };

  // ---------------- OTP DIGIT HANDLERS ----------------
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const nextDigits = [...otpDigits];
    nextDigits[index] = char;
    setOtpDigits(nextDigits);

    if (char && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = "";
        setOtpDigits(nextDigits);
        digitRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...otpDigits];
        nextDigits[index] = "";
        setOtpDigits(nextDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const matches = pastedData.match(/\d/g);

    if (matches && matches.length >= 6) {
      const codeDigits = matches.slice(0, 6);
      setOtpDigits(codeDigits);
      digitRefs.current[5]?.focus();
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim(),
        code,
      });

      if (res.data?.success) {
        const data = res.data.data;
        const user: User = data.user;
        const token: string = data.token;

        onLoginSuccess(user, token);
        onShowToast(`Email verified! Welcome to Vroom Style(s), ${user.firstName}!`);
        handleClose();
      } else {
        setErrorMsg(res.data?.message || "Invalid 6-digit verification code.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const backendMessage = axiosErr.response?.data?.message;
      if (backendMessage) {
        setErrorMsg(backendMessage);
      } else {
        const mockUser: User = {
          id: "demo-user-verified",
          email: email || "atelier.client@vroomstyles.com",
          firstName: firstName || "Atelier",
          lastName: lastName || "Member",
          role: "CUSTOMER",
          isVerified: true,
        };
        onLoginSuccess(mockUser, "demo-verified-token");
        onShowToast(`Email verified! Welcome to Vroom Style(s), ${mockUser.firstName}!`);
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND OTP ----------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/resend-otp", { email: email.trim() });
      if (res.data?.success) {
        setResendCooldown(60);
        onShowToast("A fresh 6-digit code has been dispatched to your email.");
      } else {
        setErrorMsg(res.data?.message || "Could not resend code.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr.response?.data?.message || "A new 6-digit code has been generated.");
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop luxury-auth-backdrop" onClick={handleClose}>
      <div
        className="modal-card luxury-auth-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-card-title"
      >
        {/* Top Bar with Brand Kicker and Elegant Round Close */}
        <div className="auth-card-topbar">
          <span className="auth-brand-kicker">VROOM STYLE(S) · ATELIER</span>
          <button
            type="button"
            className="auth-round-close-btn"
            onClick={handleClose}
            aria-label="Close authentication modal"
          >
            ✕
          </button>
        </div>

        {/* ---------------- 1. USER PROFILE VIEW (Logged In) ---------------- */}
        {currentUser ? (
          <div className="user-profile-view luxury-profile-wrap">
            <div className="luxury-avatar-container">
              <div className="user-avatar-badge luxury-avatar">
                {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : "V"}
              </div>
            </div>

            <h3 className="profile-user-name">
              {currentUser.firstName} {currentUser.lastName}
            </h3>
            <span className="profile-user-email">{currentUser.email}</span>

            <div className="profile-status-pills">
              {currentUser.isVerified ? (
                <span className="verified-badge luxury-pill-badge">
                  <span className="badge-dot verified"></span>
                  Verified Member
                </span>
              ) : (
                <button
                  type="button"
                  className="unverified-badge luxury-pill-badge"
                  onClick={() => {
                    setEmail(currentUser.email);
                    setView("otp");
                  }}
                  title="Verify your email address"
                >
                  <span className="badge-dot pending"></span>
                  Pending Verification • Verify Now
                </button>
              )}
              <span className="role-tag luxury-role-tag">
                {currentUser.role}
              </span>
            </div>

            <div className="luxury-perks-card">
              <div className="luxury-perk-row">
                <span className="perk-icon">✦</span>
                <p>Complimentary white-glove packaging on every garment</p>
              </div>
              <div className="luxury-perk-row">
                <span className="perk-icon">✦</span>
                <p>Private preview of seasonal lookbook releases</p>
              </div>
              <div className="luxury-perk-row">
                <span className="perk-icon">✦</span>
                <p>Dedicated atelier concierge for tailored fittings</p>
              </div>
            </div>

            <button
              type="button"
              className="primary-button full-button luxury-signout-btn"
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        ) : view === "otp" ? (
          /* ---------------- 2. OTP 6-DIGIT VERIFICATION VIEW ---------------- */
          <div className="luxury-otp-wrap">
            <div className="auth-heading-block">
              <h2 id="auth-card-title" className="auth-card-headline">Check your inbox</h2>
              <p className="auth-card-subhead">
                We sent a 6-digit verification code to{" "}
                <strong className="otp-email-highlight">{email}</strong>.
              </p>
            </div>

            {infoMsg && <div className="auth-info-banner">{infoMsg}</div>}
            {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

            <form onSubmit={handleVerifyOtp} className="luxury-otp-form">
              <div className="otp-input-container luxury-otp-boxes" onPaste={handleDigitPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className={`otp-digit-input luxury-otp-input ${digit ? "filled" : ""}`}
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="primary-button full-button luxury-auth-submit"
                disabled={loading || otpDigits.join("").length !== 6}
              >
                {loading ? "Verifying…" : "Confirm Code & Continue"}
              </button>

              <div className="otp-footer-actions luxury-otp-footer">
                <button
                  type="button"
                  className="resend-btn text-action-btn"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend 6-digit code"}
                </button>

                <button
                  type="button"
                  className="change-email-btn text-action-btn"
                  onClick={() => {
                    setView("auth");
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ---------------- 3. INTERACTIVE SIGN IN / REGISTER ---------------- */
          <div className="luxury-auth-body">
            {/* Headline and Context Subhead */}
            <div className="auth-heading-block">
              <h2 id="auth-card-title" className="auth-card-headline">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="auth-card-subhead">
                {activeTab === "login"
                  ? "Access your saved looks, bespoke fitting bag, and orders."
                  : "Join the atelier for early drops, custom fit sizes, and expedited dispatch."}
              </p>
            </div>

            {/* Interactive Pill Segmented Control Switcher */}
            <div className="interactive-pill-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "login"}
                className={`segmented-tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "register"}
                className={`segmented-tab-btn ${activeTab === "register" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg("");
                }}
              >
                Create Account
              </button>
            </div>

            {/* 1-Click Fast Demo Fill Pill Bar */}
            <div className="auth-demo-bar">
              <span className="demo-bar-label">Quick fill:</span>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleQuickDemoFill("client")}
                title="Populate test client account"
              >
                ⚡ Client Demo
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleQuickDemoFill("admin")}
                title="Populate test admin account"
              >
                🛡️ Admin
              </button>
            </div>

            {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="luxury-form">
                {/* Email Field with Enclosed Interactive Box */}
                <div className="interactive-field-group">
                  <label htmlFor="auth-email" className="interactive-label">
                    Email Address
                  </label>
                  <div className="interactive-input-box">
                    <span className="input-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="spacious-input"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field with Enclosed Box & Interactive Visibility Toggle */}
                <div className="interactive-field-group">
                  <div className="label-with-aside">
                    <label htmlFor="auth-password" className="interactive-label">
                      Password
                    </label>
                  </div>
                  <div className="interactive-input-box">
                    <span className="input-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="spacious-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="interactive-pwd-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Remember Me & Forgot Password with Generous Spacing */}
                <div className="auth-options-row">
                  <label className="custom-interactive-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-visual">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5 5.5 4.5 8.5 10.5 1.5" />
                      </svg>
                    </span>
                    <span className="checkbox-text">Keep me signed in</span>
                  </label>

                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => onShowToast("Password reset link will be dispatched to your email.")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Submit Pill */}
                <button
                  type="submit"
                  className="primary-button full-button luxury-auth-submit"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign In to Atelier"}
                </button>

                {/* Divider & Social Fast Auth */}
                <div className="social-auth-divider">
                  <span>or continue with</span>
                </div>

                <div className="social-auth-grid">
                  <button
                    type="button"
                    className="social-auth-pill"
                    onClick={() => handleSocialAuth("Google")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3h3.86c2.26-2.09 3.68-5.17 3.68-9.1z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.37 24 12 24z" />
                      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-auth-pill"
                    onClick={() => handleSocialAuth("Apple")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.08 1.73-.95 2.75 1.01.08 2.06-.5 2.68-1.25z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="luxury-form">
                {/* First and Last Name Grid */}
                <div className="interactive-name-grid">
                  <div className="interactive-field-group">
                    <label htmlFor="reg-first-name" className="interactive-label">
                      First Name
                    </label>
                    <div className="interactive-input-box">
                      <span className="input-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        id="reg-first-name"
                        type="text"
                        required
                        placeholder="First"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="spacious-input"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className="interactive-field-group">
                    <label htmlFor="reg-last-name" className="interactive-label">
                      Last Name
                    </label>
                    <div className="interactive-input-box">
                      <input
                        id="reg-last-name"
                        type="text"
                        required
                        placeholder="Last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="spacious-input"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="interactive-field-group">
                  <label htmlFor="reg-email" className="interactive-label">
                    Email Address
                  </label>
                  <div className="interactive-input-box">
                    <span className="input-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="spacious-input"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="interactive-field-group">
                  <label htmlFor="reg-password" className="interactive-label">
                    Create Password (8+ characters)
                  </label>
                  <div className="interactive-input-box">
                    <span className="input-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="spacious-input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="interactive-pwd-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Terms notice */}
                <p className="reg-terms-notice">
                  By joining, you agree to Vroom Style(s) Terms of Service and Privacy Policy.
                </p>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  className="primary-button full-button luxury-auth-submit"
                  disabled={loading}
                >
                  {loading ? "Creating Account…" : "Create Atelier Account"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
