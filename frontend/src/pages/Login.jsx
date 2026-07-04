import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "../utils/constants";
import "./Auth.css";

const Login = () => {
  const { login, logout, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "", loginAs: "user" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [sideError, setSideError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSideError("");
    if (!validate()) return;
    const res = await login(form.email.trim(), form.password.trim());
    if (res.success) {
      if (form.loginAs === "admin" && res.role !== "admin") {
        logout();
        setSideError("This account is not an admin account.");
        return;
      }

      if (form.loginAs === "user" && res.role === "admin") {
        logout();
        setSideError("This account is an admin account. Please select Admin Side.");
        return;
      }

      navigate(form.loginAs === "admin" ? "/admin" : from, { replace: true });
    }
  };

  return (
    <main className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {APP_NAME}
            </Link>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in and choose your side</p>
          </div>

          <div className="auth-divider"><span>Sign in manually</span></div>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner">
              ⚠ {error}
            </div>
          )}
          {sideError && (
            <div className="auth-error-banner">
              ⚠ {sideError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate autoComplete="off">
            <div className="form-group">
              <label className="form-label">Login Side</label>
              <select
                className="form-select"
                value={form.loginAs}
                onChange={(e) => {
                  setForm({ email: "", password: "", loginAs: e.target.value });
                  setFormErrors({});
                  setSideError("");
                }}
              >
                <option value="user">User Side</option>
                <option value="admin">Admin Side</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="manual_email_entry"
                className={`form-input ${formErrors.email ? "error" : ""}`}
                placeholder=""
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  setFormErrors((fe) => ({ ...fe, email: "" }));
                  setSideError("");
                }}
                autoComplete="new-password"
              />
              {formErrors.email && <span className="auth-field-error">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="manual_password_entry"
                  className={`form-input ${formErrors.password ? "error" : ""}`}
                  placeholder=""
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    setFormErrors((fe) => ({ ...fe, password: "" }));
                    setSideError("");
                  }}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {formErrors.password && <span className="auth-field-error">{formErrors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full auth-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to={form.loginAs === "admin" ? "/admin/signup" : "/signup"}>Create one →</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
