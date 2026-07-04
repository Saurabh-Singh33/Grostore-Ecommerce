import { Outlet, NavLink, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Grostore Admin
          </Link>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav__link ${isActive ? "active" : ""}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav__link ${isActive ? "active" : ""}`}>
            🛍️ Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav__link ${isActive ? "active" : ""}`}>
            📦 Orders
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav__link ${isActive ? "active" : ""}`}>
            👥 Users
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-info">
            <img src={user.avatar} alt="Admin" className="admin-avatar" />
            <div className="admin-user-text">
              <span className="admin-user-name">{user.name}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="btn btn-danger btn-sm w-full mt-3" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar__left">
            <span>Welcome back, {user.name.split(" ")[0]}!</span>
          </div>
          <div className="admin-topbar__right">
            <Link to="/" className="btn btn-secondary btn-sm">View Store ↗</Link>
            <button className="admin-icon-btn">🔔</button>
            <button className="admin-icon-btn">⚙️</button>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
