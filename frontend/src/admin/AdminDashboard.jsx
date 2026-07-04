import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchOrders, fetchUsers } from "../services/fakeApi";
import { useProducts } from "../context/ProductContext";
import { formatPrice, getStatusColor, getStatusBg, formatDate } from "../utils/helpers";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";
import Loader from "../components/Loader";

const AdminDashboard = () => {
  const { allProducts } = useProducts();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const [ordersRes, usersRes] = await Promise.all([fetchOrders(token), fetchUsers(token)]);
        setOrders(ordersRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader fullPage message="Loading Dashboard..." />;

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-panel" style={{ padding: "1.5rem" }}>
          <h2 className="admin-page__title">Dashboard unavailable</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const lowStock = allProducts.filter((p) => p.stock < 10);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Dashboard Overview</h1>
        <div className="admin-date">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(99,102,241,0.2)", color: "var(--primary-light)" }}>💰</div>
          <div className="admin-stat-info">
            <h3>Total Revenue</h3>
            <p className="admin-stat-value">{formatPrice(totalRevenue)}</p>
            <span className="admin-stat-trend positive">↑ 12.5% vs last month</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.2)", color: "var(--success)" }}>📦</div>
          <div className="admin-stat-info">
            <h3>Total Orders</h3>
            <p className="admin-stat-value">{orders.length}</p>
            <span className="admin-stat-trend positive">↑ 5% vs last month</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(245,158,11,0.2)", color: "var(--warning)" }}>🛍️</div>
          <div className="admin-stat-info">
            <h3>Products</h3>
            <p className="admin-stat-value">{allProducts.length}</p>
            <span className="admin-stat-trend">Catalog Size</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(236,72,153,0.2)", color: "var(--secondary)" }}>👥</div>
          <div className="admin-stat-info">
            <h3>Customers</h3>
            <p className="admin-stat-value">{users.length}</p>
            <span className="admin-stat-trend positive">↑ 18 new this week</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const customer = order.user?.name || users.find((u) => u.id === order.userId)?.name;
                  return (
                    <tr key={order.id}>
                      <td className="font-mono">{order.id}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{customer || "Unknown"}</td>
                      <td>
                        <span className="admin-badge" style={{ backgroundColor: getStatusBg(order.status), color: getStatusColor(order.status) }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="font-bold">{formatPrice(order.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Action Center</h3>
          </div>
          <div className="admin-actions-list">
            <div className={`admin-action-item ${pendingOrders.length > 0 ? "warning" : ""}`}>
              <span className="admin-action-icon">🚚</span>
              <div className="admin-action-text">
                <h4>{pendingOrders.length} Orders to Fulfill</h4>
                <p>Orders that need processing or shipping.</p>
              </div>
              <Link to="/admin/orders" className="btn btn-secondary btn-sm">Review →</Link>
            </div>
            
            <div className={`admin-action-item ${lowStock.length > 0 ? "danger" : ""}`}>
              <span className="admin-action-icon">⚠</span>
              <div className="admin-action-text">
                <h4>{lowStock.length} Low Stock Items</h4>
                <p>Products with less than 10 units available.</p>
              </div>
              <Link to="/admin/products" className="btn btn-secondary btn-sm">Review →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
