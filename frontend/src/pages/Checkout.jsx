import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/fakeApi";
import { formatPrice } from "../utils/helpers";
import { LOCAL_STORAGE_KEYS, PAYMENT_METHODS } from "../utils/constants";
import RazorpayModal from "../components/RazorpayModal";
import "./Checkout.css";

const STEPS = ["Shipping", "Payment", "Review"];

const Checkout = () => {
  const { cartItems, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const [address, setAddress] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zip: user?.address?.zip || "",
    country: "India",
  });
  const [payment, setPayment] = useState("razorpay");
  const [errors, setErrors] = useState({});

  const validateStep0 = () => {
    const e = {};
    if (!address.firstName) e.firstName = "Required";
    if (!address.email || !/\S+@\S+\.\S+/.test(address.email)) e.email = "Valid email required";
    if (!address.street) e.street = "Required";
    if (!address.city) e.city = "Required";
    if (!address.zip) e.zip = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    // Razorpay and COD don't need client-side card validation
    return true;
  };

  const handleNext = () => {
    setErrors({});
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    if (payment === "razorpay") {
      setShowRazorpay(true);
      return;
    }
    await doPlaceOrder();
  };

  const doPlaceOrder = async () => {
    setPlacing(true);
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      const res = await createOrder({
        userId: user?.id || 0,
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.images?.[0],
        })),
        total,
        shippingAddress: { street: address.street, city: address.city, state: address.state, zip: address.zip, country: address.country },
        paymentMethod: payment,
      }, token);
      clearCart();
      try { localStorage.removeItem(LOCAL_STORAGE_KEYS.CART); } catch (e) {}
      setOrderId(res.data.id);
    } catch (err) {
      alert("Order failed: " + err.message);
    } finally {
      setPlacing(false);
    }
  };

  const handleRazorpaySuccess = () => {
    setShowRazorpay(false);
    doPlaceOrder();
  };

  // ─── Success Screen ───────────────────────────────────────────
  if (orderId) {
    return (
      <main className="checkout-page page-wrapper">
        <div className="container">
          <div className="checkout-success">
            <div className="checkout-success__icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order <strong>{orderId}</strong> has been confirmed.</p>
            <p className="text-muted">You'll receive a confirmation email shortly.</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "center" }}>
              <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
              <Link to="/profile" className="btn btn-secondary btn-lg">View Orders</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page page-wrapper">
      <div className="container">
        <h1 className="checkout-page__title">Checkout</h1>

        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`checkout-step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <div className="checkout-step__num">{i < step ? "✓" : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="checkout-step__line" />}
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          {/* Left: Form Area */}
          <div className="checkout-form">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="checkout-card">
                <h3 className="checkout-card__title">📦 Shipping Address</h3>
                <div className="checkout-form__row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className={`form-input ${errors.firstName ? "error" : ""}`} value={address.firstName}
                      onChange={(e) => setAddress((a) => ({ ...a, firstName: e.target.value }))} />
                    {errors.firstName && <span className="checkout-error">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={address.lastName}
                      onChange={(e) => setAddress((a) => ({ ...a, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="checkout-form__row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className={`form-input ${errors.email ? "error" : ""}`} value={address.email}
                      onChange={(e) => setAddress((a) => ({ ...a, email: e.target.value }))} />
                    {errors.email && <span className="checkout-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={address.phone}
                      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className={`form-input ${errors.street ? "error" : ""}`} value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} />
                  {errors.street && <span className="checkout-error">{errors.street}</span>}
                </div>
                <div className="checkout-form__row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className={`form-input ${errors.city ? "error" : ""}`} value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
                    {errors.city && <span className="checkout-error">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP *</label>
                    <input className={`form-input ${errors.zip ? "error" : ""}`} value={address.zip}
                      onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} />
                    {errors.zip && <span className="checkout-error">{errors.zip}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="checkout-card">
                <h3 className="checkout-card__title">💳 Payment Method</h3>
                <div className="checkout-payment-methods">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.value} className={`checkout-payment-option ${payment === m.value ? "active" : ""}`}>
                      <input type="radio" name="payment" value={m.value}
                        checked={payment === m.value} onChange={() => setPayment(m.value)} />
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
                {payment === "razorpay" && (
                  <div className="checkout-alt-payment">
                    <p>You'll be redirected to <strong>Razorpay</strong> secure payment gateway to complete your payment.</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Supports Credit/Debit Card, NetBanking, UPI, and Wallets
                    </p>
                  </div>
                )}
                {payment === "cod" && (
                  <div className="checkout-alt-payment">
                    <p>Pay with cash when your order is delivered. No advance payment required.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="checkout-card">
                <h3 className="checkout-card__title">🧾 Order Review</h3>
                <div className="checkout-review-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-review-item">
                      <img src={item.images?.[0]} alt={item.name}
                        onError={(e) => { e.target.src = "https://placehold.co/60x60/FDF6F0/C47A5A?text=?"; }}
                      />
                      <div className="checkout-review-item__info">
                        <span>{item.name}</span>
                        <span className="text-muted">Qty: {item.quantity}</span>
                      </div>
                      <span className="checkout-review-item__price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="checkout-review-addr">
                  <h4>Ship to</h4>
                  <p>{address.firstName} {address.lastName}</p>
                  <p>{address.street}, {address.city}, {address.state} {address.zip}</p>
                  <p>{address.email}</p>
                </div>
                <div className="checkout-review-addr">
                  <h4>Payment</h4>
                  <p>{PAYMENT_METHODS.find((m) => m.value === payment)?.label}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="checkout-nav">
              {step > 0 && (
                <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>← Back</button>
              )}
              {step < 2 ? (
                <button className="btn btn-primary btn-lg" onClick={handleNext}>Continue →</button>
              ) : (
                <button className="btn btn-success btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? "Placing Order..." : payment === "razorpay" ? "Pay with Razorpay 💳" : "Place Order 🎉"}
                </button>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-summary__item">
                <span className="checkout-summary__qty">{item.quantity}×</span>
                <span className="checkout-summary__name">{item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__line"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="checkout-summary__line"><span>Shipping</span><span className={shipping === 0 ? "text-success" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
            <div className="checkout-summary__line"><span>Tax</span><span>{formatPrice(tax)}</span></div>
            <div className="checkout-summary__total"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>

      {/* Razorpay Modal */}
      {showRazorpay && (
        <RazorpayModal
          amount={total}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setShowRazorpay(false)}
        />
      )}
    </main>
  );
};

export default Checkout;
