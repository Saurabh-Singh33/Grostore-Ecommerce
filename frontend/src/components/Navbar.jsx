import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { APP_NAME } from "../utils/constants";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { updateFilter } = useProducts();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      updateFilter("search", search.trim());
      navigate("/products");
      setSearch("");
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <span>{APP_NAME}</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "navbar__link active" : "navbar__link"}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "navbar__link active" : "navbar__link"}>Shop</NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "navbar__link active" : "navbar__link"}>Cart</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "navbar__link active navbar__link--admin" : "navbar__link navbar__link--admin"}>Admin</NavLink>
          )}
        </div>

        {/* Search */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <span className="navbar__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="navbar__search-input"
          />
        </form>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Cart */}
          <Link to="/cart" className="navbar__cart">
            <span>🛒</span>
            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
          </Link>

          {/* Profile / Auth */}
          {isAuthenticated ? (
            <div className="navbar__profile" ref={profileRef}>
              <button
                className="navbar__profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="navbar__avatar"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`; }}
                />
                <span className="navbar__profile-name">{user.name.split(" ")[0]}</span>
                <span>▾</span>
              </button>
              {profileOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user.name}</p>
                    <p className="navbar__dropdown-email">{user.email}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                    👤 My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile">
          <div className="container">
            <form className="navbar__mobile-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="navbar__mobile-links">
              <NavLink to="/" end onClick={() => setMobileOpen(false)}>🏠 Home</NavLink>
              <NavLink to="/products" onClick={() => setMobileOpen(false)}>🛍️ Shop</NavLink>
              <NavLink to="/cart" onClick={() => setMobileOpen(false)}>🛒 Cart ({cartCount})</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)}>👤 Profile</NavLink>
                  {isAdmin && <NavLink to="/admin" onClick={() => setMobileOpen(false)}>⚙️ Admin</NavLink>}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }}>🚪 Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)}>🔑 Login</NavLink>
                  <NavLink to="/signup" onClick={() => setMobileOpen(false)}>✨ Sign Up</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
