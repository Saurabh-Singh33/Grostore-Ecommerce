import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { cancelMyOrder, cancelOrderItem, fetchOrdersByUser } from "../services/fakeApi";
import { formatPrice, formatDate, getStatusColor, getStatusBg } from "../utils/helpers";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";
import "./Profile.css";

const ORDER_STEPS = ["pending", "processing", "shipped", "delivered"];

const getOrderStepState = (status, step) => {
  if (status === "cancelled") return "inactive";
  const currentIndex = ORDER_STEPS.indexOf(status);
  const stepIndex = ORDER_STEPS.indexOf(step);
  if (currentIndex === -1 || stepIndex > currentIndex) return "inactive";
  if (stepIndex === currentIndex) return "active";
  return "done";
};

const getOrderStatusMessage = (order) => {
  switch (order.status) {
    case "pending":
      return "Order placed. We are confirming your items.";
    case "processing":
      return "Order is being packed and prepared for shipment.";
    case "shipped":
      return "Order shipped. It is currently on the way.";
    case "delivered":
      return `Delivered successfully${order.deliveredAt ? ` on ${formatDate(order.deliveredAt)}` : ""}.`;
    case "cancelled":
      return "Order was cancelled. If this is unexpected, contact support.";
    default:
      return "Order update is in progress.";
  }
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancellingItemKey, setCancellingItemKey] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const userId = user.id || user._id;
        if (!token || !userId) {
          setOrders([]);
          setError("Please log in again to view your order history.");
          return;
        }
        const res = await fetchOrdersByUser(userId, token);
        setOrders(res.data || []);
      } catch (err) {
        setOrders([]);
        setError(err.message || "Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingOrderId(orderId);
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      const res = await cancelMyOrder(orderId, token);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? res.data : order)));
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleCancelItem = async (orderId, itemIndex) => {
    if (!confirm("Cancel this product from your order?")) return;

    try {
      const key = `${orderId}-${itemIndex}`;
      setCancellingItemKey(key);
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      const res = await cancelOrderItem(orderId, itemIndex, token);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? res.data : order)));
    } catch (err) {
      alert(err.message || "Failed to cancel product");
    } finally {
      setCancellingItemKey(null);
    }
  };

  if (!user) return null;

  return (
    <main className="profile-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="profile-hero">
          <div className="profile-hero__bg" />
          <div className="profile-hero__content">
            <img
              src={user.avatar}
              alt={user.name}
              className="profile-hero__avatar"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128`; }}
            />
            <div className="profile-hero__info">
              <h1 className="profile-hero__name">{user.name}</h1>
              <p className="profile-hero__email">{user.email}</p>
              <div className="profile-hero__badges">
                <span className={`badge ${user.role === "admin" ? "badge-warning" : "badge-primary"}`}>
                  {user.role === "admin" ? "⚙️ Admin" : "👤 Member"}
                </span>
                <span className="badge badge-success">✓ Verified</span>
              </div>
            </div>
            <button className="btn btn-danger btn-sm profile-logout" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          {[
            { label: "Total Orders", value: orders.length, icon: "📦" },
            { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: "✅" },
            { label: "In Progress", value: orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length, icon: "🚚" },
            { label: "Total Spent", value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), icon: "💰" },
          ].map((s, i) => (
            <div key={i} className="profile-stat">
              <span className="profile-stat__icon">{s.icon}</span>
              <span className="profile-stat__value">{s.value}</span>
              <span className="profile-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {["orders", "info"].map((t) => (
            <button
              key={t}
              className={`profile-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "orders" ? "📦 Order History" : "👤 Account Info"}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="profile-content">
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading orders...</div>
            ) : error ? (
              <div className="profile-empty">
                <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.7 }}>⚠️</div>
                <h3>Order history unavailable</h3>
                <p>{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="profile-empty">
                <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📦</div>
                <h3>No orders yet</h3>
                <p>Time to start shopping!</p>
              </div>
            ) : (
              <div className="profile-orders">
                {orders.map((order) => (
                  <div key={order.id} className="profile-order">
                    <div className="profile-order__header">
                      <div>
                        <span className="profile-order__id">{order.id}</span>
                        <span className="profile-order__date">{formatDate(order.createdAt)}</span>
                      </div>
                      <span
                        className="profile-order__status"
                        style={{ color: getStatusColor(order.status), background: getStatusBg(order.status) }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="profile-order__timeline">
                      {order.status === "cancelled" ? (
                        <div className="profile-order__cancelled">This order was cancelled.</div>
                      ) : (
                        ORDER_STEPS.map((step) => {
                          const stepState = getOrderStepState(order.status, step);
                          return (
                            <div key={step} className={`profile-step profile-step--${stepState}`}>
                              <span className="profile-step__dot" />
                              <span className="profile-step__label">{step}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="profile-order__status-note">
                      {getOrderStatusMessage(order)}
                    </div>
                    <div className="profile-order__items">
                      {order.items.map((item, i) => (
                        <div key={i} className="profile-order__item">
                          <img src={item.image}
                            onError={(e) => { e.target.src = "https://placehold.co/48x48/1a1a2e/6366f1?text=?"; }}
                            alt={item.name}
                          />
                          <div className="profile-order__item-info">
                            <span>{item.name}</span>
                            <span className="text-muted">Qty: {item.quantity} · {formatPrice(item.price)}</span>
                          </div>
                          <div className="profile-order__item-actions">
                            {(item.status || "active") === "cancelled" ? (
                              <span className="profile-order__item-cancelled">Cancelled</span>
                            ) : (["pending", "processing"].includes(order.status)) ? (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCancelItem(order.id, i)}
                                disabled={cancellingItemKey === `${order.id}-${i}`}
                              >
                                {cancellingItemKey === `${order.id}-${i}` ? "Cancelling..." : "Cancel Product"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="profile-order__footer">
                      <span className="text-muted">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.paymentMethod?.replace?.("_", " ") || "unknown"}
                      </span>
                      <div className="profile-order__footer-right">
                        {(["pending", "processing"].includes(order.status)) && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                          >
                            {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                          </button>
                        )}
                        <span className="profile-order__total">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="profile-content">
            <div className="profile-info-grid">
              <div className="profile-info-card">
                <h3>Personal Information</h3>
                <div className="profile-info-field"><label>Full Name</label><span>{user.name}</span></div>
                <div className="profile-info-field"><label>Email</label><span>{user.email}</span></div>
                <div className="profile-info-field"><label>Phone</label><span>{user.phone || "—"}</span></div>
                <div className="profile-info-field"><label>Member Since</label><span>{formatDate(user.joinedAt)}</span></div>
                <div className="profile-info-field"><label>Role</label><span className="capitalize">{user.role}</span></div>
              </div>
              {user.address && (
                <div className="profile-info-card">
                  <h3>Shipping Address</h3>
                  <div className="profile-info-field"><label>Street</label><span>{user.address.street || "—"}</span></div>
                  <div className="profile-info-field"><label>City</label><span>{user.address.city || "—"}</span></div>
                  <div className="profile-info-field"><label>State</label><span>{user.address.state || "—"}</span></div>
                  <div className="profile-info-field"><label>ZIP</label><span>{user.address.zip || "—"}</span></div>
                  <div className="profile-info-field"><label>Country</label><span>{user.address.country || "—"}</span></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Profile;
