import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "../utils/constants";
import "./Auth.css";

const Signup = () => {
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminAuthPath = location.pathname.startsWith("/admin/");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: isAdminAuthPath ? "admin" : "user" });
  const [formErrors, setFormErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    const res = await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
    if (res.success) navigate(form.role === "admin" ? "/admin" : "/");
  };

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFormErrors((fe) => ({ ...fe, [key]: "" }));
  };

  return (
    <main className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {APP_NAME}
            </Link>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">{isAdminAuthPath ? "Create your admin account" : `Join ${APP_NAME} and start shopping today`}</p>
          </div>

          {error && <div className="auth-error-banner">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${formErrors.name ? "error" : ""}`} placeholder="John Doe"
                value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
              {formErrors.name && <span className="auth-field-error">{formErrors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className={`form-input ${formErrors.email ? "error" : ""}`} placeholder="you@example.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
              {formErrors.email && <span className="auth-field-error">{formErrors.email}</span>}
            </div>

            {!isAdminAuthPath && (
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select className="form-select" value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="user">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-password-wrap">
                <input type={showPw ? "text" : "password"} className={`form-input ${formErrors.password ? "error" : ""}`}
                  placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {formErrors.password && <span className="auth-field-error">{formErrors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className={`form-input ${formErrors.confirm ? "error" : ""}`}
                placeholder="••••••••" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
              {formErrors.confirm && <span className="auth-field-error">{formErrors.confirm}</span>}
            </div>

            <p className="auth-terms">
              By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" className="btn btn-primary btn-lg w-full auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account ✨"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to={isAdminAuthPath ? "/admin/login" : "/login"}>Sign in →</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Signup;
